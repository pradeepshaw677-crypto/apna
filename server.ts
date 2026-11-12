import express, { NextFunction, Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import compression from "compression";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { createServer as createViteServer } from "vite";
import { PRODUCTS, CATEGORIES, AVAILABLE_COUPONS } from "./src/data/products";
import { Order, CartItem, DeliveryAddress, UserProfile, Product, ProductReview } from "./src/types";
import { getSizePriceDelta } from "./src/utils/pricing";
import { client, initDatabase } from "./src/db";
import { initWhatsApp, sendWhatsAppMessage } from "./whatsapp";
import {
  CLOUDINARY_MEDIA_READY,
  canonicalCatalogImage,
  deliverCatalogImage,
  deliverCatalogImages,
  parseCloudinaryUrl,
} from "./server/media";
import {
  HttpError,
  asyncHandler,
  clampInt,
  cleanText,
  clientIp,
  hashForLog,
  isPlainObject,
  isProduction,
  isHttpsUrl,
  isValidPincode,
  loadSecret,
  maskPhone,
  noStore,
  normalizePhone,
  originGuard,
  prototypePollutionGuard,
  randomId,
  rateLimit,
  requireJson,
  roundMoney,
  safeId,
  safeJsonParse,
  securityErrorHandler,
  securityHeaders,
  selectiveJsonParser,
} from "./server/security";

dotenv.config();

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const JWT_SECRET = loadSecret("JWT_SECRET", ["JWT_CUSTOMER_SECRET"]);
const OTP_HMAC_SECRET = loadSecret("OTP_HMAC_SECRET", ["OTP_PEPPER_SECRET"]);

const SESSION_COOKIE = isProduction ? "__Host-ab_session" : "ab_session";
const LEGACY_COOKIE_NAMES = ["__Host-cust_session", "cust_session", "ab_session_token"];
const SESSION_ISSUER = "apnabazar-api";
const SESSION_AUDIENCE = "apnabazar-web";

const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "").trim();
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"), {
  timeoutDuration: 5_000,
  cooldownDuration: 30_000,
  cacheMaxAge: 10 * 60_000,
});

const CLOUDINARY_FROM_URL = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
const CLOUDINARY_API_KEY = (process.env.CLOUDINARY_API_KEY || CLOUDINARY_FROM_URL?.apiKey || "").trim();
const CLOUDINARY_API_SECRET = (process.env.CLOUDINARY_API_SECRET || CLOUDINARY_FROM_URL?.apiSecret || "").trim();
const CLOUDINARY_CLOUD_NAME = (process.env.CLOUDINARY_CLOUD_NAME || CLOUDINARY_FROM_URL?.cloudName || "").trim();
const CLOUDINARY_READY = Boolean(CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET && CLOUDINARY_CLOUD_NAME);

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const STORE_INFO = {
  name: "Apna Bazar",
  tagline:
    "Trending Fashion, Footwear, Toys & Accessories. Wholesale Prices. 15-Minute Express Delivery. Cash on Delivery & 5-Day Returns.",
  phone: "+91 9999999999",
  email: "support@apnabazar.in",
  address: "Apna Bazar Express Hub, Dadu Complex, Near Shitla Mandir, Baharagora, Jharkhand - 832101",
  freeDeliveryThreshold: 499,
  returnWindowDays: 5,
  plusDeliveryAvailable: true,
  statusNotice: "Live in Baharagora • Express 15-Minute Doorstep Fashion & Footwear Delivery",
};

interface SessionUser extends UserProfile {
  tokenVersion: number;
}

type AuthedRequest = Request & { user?: SessionUser };

/* ------------------------------------------------------------------ */
/* Global middleware                                                   */
/* ------------------------------------------------------------------ */

app.set("trust proxy", 1);
app.set("query parser", "simple");
app.disable("x-powered-by");
app.disable("etag");

app.use(securityHeaders);
app.use(compression({ threshold: 1024, level: 6 }));
app.use(originGuard);
app.use(cookieParser());
app.use(requireJson);
app.use(selectiveJsonParser);
app.use(prototypePollutionGuard);

const globalLimiter = rateLimit({
  windowMs: 60_000,
  max: 600,
  prefix: "api",
  message: "Too many requests from this network. Please try again shortly.",
});
app.use("/api", globalLimiter);

/* ------------------------------------------------------------------ */
/* Session helpers                                                     */
/* ------------------------------------------------------------------ */

const AVATAR_HOSTS = ["googleusercontent.com"];

function mapUserRow(row: Record<string, unknown>): SessionUser {
  const phone = row.phone ? String(row.phone) : undefined;
  const email = row.email ? String(row.email) : undefined;
  const userId = String(row.id);
  const role = String(row.role || "CUSTOMER").toLowerCase();
  const referralSeed = phone ? phone.replace(/\D/g, "").slice(-4) : hashForLog(userId).slice(0, 4).toUpperCase();

  const walletBalance = Math.max(0, Number(row.wallet_balance != null ? row.wallet_balance : 0));

  return {
    id: userId,
    name: String(row.name || "Customer"),
    email,
    phone,
    avatar: row.avatar ? String(row.avatar) : DEFAULT_AVATAR,
    isLoggedIn: true,
    role,
    membership: role === "admin" ? "Apna Bazar Admin" : "Apna Bazar Member",
    referralCode: `AB${referralSeed}`,
    walletBalance,
    walletTransactions: walletBalance > 0 ? [
      {
        id: `tx-reward-${userId}`,
        type: 'credit',
        amount: walletBalance,
        title: 'Earned AB Coins Reward',
        description: `${walletBalance} AB Coins (Delivered Order / Verified Referral)`,
        date: new Date(Number(row.created_at || Date.now())).toISOString().split('T')[0],
      },
    ] : [],
    totalOrders: 0,
    totalSpent: 0,
    tokenVersion: Number(row.token_version || 1),
  };
}

function sessionPayload(user: SessionUser) {
  return {
    id: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
    typ: "session",
  };
}

function setSessionCookie(res: Response, user: SessionUser): void {
  const token = jwt.sign(sessionPayload(user), JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
    issuer: SESSION_ISSUER,
    audience: SESSION_AUDIENCE,
    jwtid: crypto.randomUUID(),
  });

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearSessionCookies(res: Response): void {
  for (const name of [SESSION_COOKIE, ...LEGACY_COOKIE_NAMES]) {
    res.clearCookie(name, { path: "/", httpOnly: true, sameSite: "strict", secure: isProduction });
  }
}

const SESSION_CACHE_TTL = 5_000;
const SESSION_CACHE_MAX = 20_000;
const sessionCache = new Map<string, { user: SessionUser; expiresAt: number }>();

function sessionCacheKey(token: string): string {
  return crypto.createHash("sha256").update(token).digest("base64url");
}

export function invalidateSessionCache(userId?: string): void {
  if (!userId) {
    sessionCache.clear();
    return;
  }
  for (const [key, entry] of sessionCache) {
    if (entry.user.id === userId) sessionCache.delete(key);
  }
}

async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token || typeof token !== "string") return null;

  const cacheKey = sessionCacheKey(token);
  const cached = sessionCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.user;

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    }) as jwt.JwtPayload;

    if (!decoded || decoded.typ !== "session" || typeof decoded.id !== "string") return null;

    const result = await client.execute({
      sql: "SELECT * FROM users WHERE id = ? LIMIT 1",
      args: [decoded.id],
    });
    if (result.rows.length === 0) return null;

    const row = result.rows[0] as unknown as Record<string, unknown>;
    if (Number(row.is_blocked) === 1) return null;
    if (Number(row.token_version || 1) !== Number(decoded.tokenVersion)) return null;

    const user = mapUserRow(row);
    if (sessionCache.size >= SESSION_CACHE_MAX) sessionCache.clear();
    sessionCache.set(cacheKey, { user, expiresAt: Date.now() + SESSION_CACHE_TTL });
    return user;
  } catch {
    return null;
  }
}

const requireAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Please sign in to continue." });
    return;
  }
  (req as AuthedRequest).user = user;
  next();
});

const requireAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Please sign in to continue." });
    return;
  }
  if (user.role !== "admin") {
    res.status(403).json({ error: "Administrator access required." });
    return;
  }
  (req as AuthedRequest).user = user;
  next();
});

function authed(req: Request): SessionUser {
  const user = (req as AuthedRequest).user;
  if (!user) throw new HttpError(401, "Please sign in to continue.");
  return user;
}

async function logAuthEvent(
  event: string,
  req: Request,
  userId: string | null,
  detail?: string,
): Promise<void> {
  try {
    await client.execute({
      sql: "INSERT INTO auth_events (id, user_id, event, ip_hash, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [
        randomId("evt"),
        userId,
        detail ? `${event}:${detail}`.slice(0, 100) : event,
        hashForLog(clientIp(req)),
        (req.get("user-agent") || "").slice(0, 200),
        Date.now(),
      ],
    });
  } catch {
    /* audit logging must never break authentication */
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function parseDataArray<T>(value: unknown, fallback: T): T {
  return safeJsonParse<T>(value, fallback);
}

const PRODUCT_META = new Map(PRODUCTS.map((product) => [product.id, product]));

function withCatalogMedia(product: Product): Product {
  return {
    ...product,
    image: deliverCatalogImage(product.image, 800),
    images: deliverCatalogImages(product.images?.length ? product.images : [product.image], 1000).filter(Boolean),
    colors: product.colors?.map((color) => ({
      ...color,
      imageUrl: color.imageUrl ? deliverCatalogImage(color.imageUrl, 160) : color.imageUrl,
    })),
  };
}

function mapProductRow(row: Record<string, unknown>): Product {
  const id = String(row.id);
  const seed = PRODUCT_META.get(id);
  const image = String(row.image_url || seed?.image || "");
  const rawImages = parseDataArray<string[]>(row.images_json, seed?.images || []);
  const colors = parseDataArray<Product["colors"]>(row.colors_json, seed?.colors || []);
  const stock = row.stock == null ? seed?.stockCount : Number(row.stock);
  const flag = (value: unknown, fallback: boolean | undefined): boolean =>
    value == null ? Boolean(fallback) : Number(value) === 1;

  return {
    id,
    name: String(row.name || seed?.name || "Product"),
    hindiName: row.hindi_name ? String(row.hindi_name) : seed?.hindiName,
    price: Number(row.price ?? seed?.price ?? 0),
    originalPrice: Number(row.original_price ?? seed?.originalPrice ?? row.price ?? 0),
    discountPercent: Number(row.discount_percent ?? seed?.discountPercent ?? 0),
    rating: Number(row.rating ?? seed?.rating ?? 4.5),
    reviewsCount: Number(row.reviews_count ?? seed?.reviewsCount ?? 10),
    image: deliverCatalogImage(image, 800),
    images: deliverCatalogImages(rawImages.length ? rawImages : image ? [image] : [], 1000).filter(Boolean),
    category: String(row.category || seed?.category || "general") as Product["category"],
    subcategory: row.subcategory ? String(row.subcategory) : seed?.subcategory,
    brand: String(row.brand || seed?.brand || "Apna Bazar"),
    description: String(row.description || seed?.description || ""),
    inStock: stock == null ? true : stock > 0,
    stockCount: stock ?? undefined,
    unit: String(row.unit || seed?.unit || "piece"),
    isBestSeller: flag(row.is_best_seller, seed?.isBestSeller),
    isTrending: flag(row.is_trending, seed?.isTrending),
    isFlashDeal: flag(row.is_flash_deal, seed?.isFlashDeal),
    isPlusFreeDelivery: flag(row.is_plus_free_delivery, seed?.isPlusFreeDelivery),
    dealEndsAt: Number(row.deal_ends_at || seed?.dealEndsAt || 0) || undefined,
    deliveryDays: Number(row.delivery_days ?? seed?.deliveryDays ?? 3),
    sizes: seed?.sizes && seed.sizes.length > 0 ? seed.sizes : parseDataArray<string[]>(row.sizes_json, []),
    colors: colors?.map((color) => ({
      ...color,
      imageUrl: color.imageUrl ? deliverCatalogImage(color.imageUrl, 160) : color.imageUrl,
    })),
    highlights: parseDataArray<string[]>(row.highlights_json, seed?.highlights || []),
    specifications: parseDataArray<Product["specifications"]>(row.specifications_json, seed?.specifications || []),
  };
}

const CATALOG_CACHE_TTL = 20_000;
let catalogCache: { at: number; products: Product[] } | null = null;

export function invalidateCatalogCache(): void {
  catalogCache = null;
}

async function getCatalogProducts(): Promise<Product[]> {
  if (catalogCache && Date.now() - catalogCache.at < CATALOG_CACHE_TTL) return catalogCache.products;

  let list: Product[] = [];
  try {
    const dbRows = await client.execute("SELECT * FROM products ORDER BY created_at DESC LIMIT 500");
    list = dbRows.rows.map((row) => mapProductRow(row as unknown as Record<string, unknown>));
  } catch (error) {
    console.error("[catalog] database read failed, using static catalog");
  }

  if (list.length === 0) list = PRODUCTS.map(withCatalogMedia);
  catalogCache = { at: Date.now(), products: list };
  return list;
}

function sanitizeAddress(input: unknown, userId: string): DeliveryAddress {
  if (!isPlainObject(input)) throw new HttpError(400, "A complete delivery address is required.");

  const fullName = cleanText(input.fullName, { min: 2, max: 80 });
  const phoneNumber = normalizePhone(input.phoneNumber);
  const streetAddress = cleanText(input.streetAddress, { min: 5, max: 200 });
  const landmark = cleanText(input.landmark, { max: 120, allowEmpty: true });
  const area = cleanText(input.area, { max: 100, allowEmpty: true });
  const city = cleanText(input.city, { min: 2, max: 80 });
  const state = cleanText(input.state, { min: 2, max: 80, allowEmpty: true });
  const pincode = typeof input.pincode === "string" ? input.pincode.trim() : "";
  const addressType = ["home", "work", "other"].includes(String(input.addressType))
    ? String(input.addressType)
    : "home";

  if (!fullName) throw new HttpError(400, "Please enter a valid full name (2-80 characters).");
  if (!phoneNumber) throw new HttpError(400, "Please enter a valid 10-digit Indian mobile number.");
  if (!streetAddress) throw new HttpError(400, "Please enter a valid street address.");
  if (!city) throw new HttpError(400, "Please enter a valid city.");
  if (!isValidPincode(pincode)) throw new HttpError(400, "Please enter a valid 6-digit PIN code.");
  if (!state) throw new HttpError(400, "Please enter a valid state.");

  return {
    fullName,
    phoneNumber,
    streetAddress,
    landmark: landmark || "",
    area: area || city,
    city,
    state,
    pincode,
    addressType,
    isDefault: Boolean(input.isDefault),
    userId,
  } as DeliveryAddress;
}

function buildTrackingSteps(status: string, createdAt: number) {
  const base = [
    { title: "Order Placed", description: "Order confirmed at Apna Bazar Hub", timestamp: createdAt },
    { title: "Packing", description: "Packed in a tamper-proof security parcel" },
    { title: "Shipped", description: "Dispatched from the Baharagora Fulfilment Hub" },
    { title: "Out for Delivery", description: "Courier associate is on the way" },
    { title: "Delivered", description: "Delivered after 6-digit OTP verification" },
  ];

  if (status === "cancelled") {
    return [
      { title: "Order Placed", description: "Order was placed", completed: true, active: false, timestamp: createdAt },
      { title: "Cancelled", description: "Order cancelled", completed: true, active: false },
    ];
  }

  const order: Record<string, number> = {
    placed: 0,
    confirmed: 0,
    packing: 1,
    shipped: 2,
    out_for_delivery: 3,
    delivered: 4,
    return_requested: 5,
    return_pickup_scheduled: 5,
    returned: 5,
  };
  const current = order[status] ?? 0;

  const steps = base.map((step, index) => ({
    ...step,
    completed: index <= current,
    active: index === current + 1 || (index === current && status !== "delivered"),
  }));

  if (status.startsWith("return")) {
    steps.push({
      title: "Return Pickup",
      description: "Return requested — rider pickup is scheduled",
      completed: status === "returned",
      active: status !== "returned",
    });
  }

  return steps;
}

function mapOrderRow(row: Record<string, unknown>): Order {
  const items = parseDataArray<CartItem[]>(row.items_json, []);
  const address = parseDataArray<DeliveryAddress>(row.address_json, {
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    addressType: "home",
  });
  const createdAt = Number(row.created_at || Date.now());
  const status = String(row.status || "confirmed");
  const itemTotal = roundMoney(
    items.reduce((sum, item) => {
      const unit = Number(item.unitPrice ?? item.product?.price ?? 0);
      const qty = Math.max(0, Number(item.quantity) || 0);
      return sum + unit * qty;
    }, 0),
  );
  const deliveryFee = itemTotal >= STORE_INFO.freeDeliveryThreshold ? 0 : 49;
  const totalAmount = roundMoney(Number(row.total_amount) || 0);
  const discount = roundMoney(Math.max(0, itemTotal + deliveryFee - totalAmount));
  const paymentMethod = String(row.payment_method || "cod");
  const estimated = new Date(createdAt + 3 * 24 * 60 * 60 * 1000);

  return {
    id: String(row.id),
    createdAt,
    items,
    itemTotal,
    deliveryFee,
    packagingFee: 0,
    discount,
    tipAmount: 0,
    totalAmount,
    address,
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? (status === "delivered" ? "completed" : "pending") : "completed",
    orderStatus: status as Order["orderStatus"],
    estimatedDeliveryDate: `${estimated.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })} by 7 PM`,
    otp: row.delivery_otp ? String(row.delivery_otp) : undefined,
    cancellationAllowed: ["placed", "confirmed", "packing"].includes(status),
    trackingSteps: buildTrackingSteps(status, createdAt),
    userId: String(row.customer_id),
    abCoinsUsed: Number(row.ab_coins_used) || 0,
    coinsDiscount: Number(row.coins_discount) || 0,
  };
}

async function loadOrderForUser(orderId: string, userId: string, isAdmin: boolean) {
  const result = await client.execute({
    sql: isAdmin ? "SELECT * FROM orders WHERE id = ? LIMIT 1" : "SELECT * FROM orders WHERE id = ? AND customer_id = ? LIMIT 1",
    args: isAdmin ? [orderId] : [orderId, userId],
  });
  return result.rows.length > 0 ? mapOrderRow(result.rows[0] as unknown as Record<string, unknown>) : null;
}

async function restoreOrderStock(order: Order): Promise<void> {
  for (const item of order.items) {
    const productId = safeId(item?.product?.id, 80);
    const quantity = clampInt(item?.quantity, 0, 1000, 0);
    if (!productId || quantity <= 0) continue;
    await client.execute({
      sql: "UPDATE products SET stock = stock + ? WHERE id = ?",
      args: [quantity, productId],
    });
  }
}

/* ------------------------------------------------------------------ */
/* Health & store                                                      */
/* ------------------------------------------------------------------ */

app.get("/api/health", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
    database: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL ? "turso" : "local",
    cloudinaryMedia: CLOUDINARY_MEDIA_READY,
    cloudinaryUploads: CLOUDINARY_READY,
  });
});

app.get("/api/store-info", (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=300");
  res.json(STORE_INFO);
});

/* ------------------------------------------------------------------ */
/* Authentication                                                      */
/* ------------------------------------------------------------------ */

const otpSendIpLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 8,
  prefix: "otp-send-ip",
  message: "Too many verification code requests. Please try again after 15 minutes.",
});

const otpPhoneLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 4,
  prefix: "otp-send-phone",
  keyGenerator: (req) => normalizePhone((req.body as { phone?: unknown })?.phone) || clientIp(req),
  message: "Too many codes requested for this number. Please try later.",
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 25,
  prefix: "otp-verify-ip",
  message: "Too many verification attempts. Please try again after 15 minutes.",
});

const googleLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 20,
  prefix: "google-auth",
  message: "Too many Google sign-in attempts. Please try again later.",
});

app.post(
  ["/api/v1/customer/auth/whatsapp/send-otp", "/api/auth/otp/send"],
  otpSendIpLimiter,
  otpPhoneLimiter,
  asyncHandler(async (req, res) => {
    const cleanPhone = normalizePhone((req.body as { phone?: unknown })?.phone);
    if (!cleanPhone) {
      res.status(400).json({
        error: "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
      });
      return;
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const latest = await client.execute({
      sql: "SELECT created_at FROM otp_challenges WHERE phone = ? ORDER BY created_at DESC LIMIT 1",
      args: [cleanPhone],
    });
    if (latest.rows.length > 0) {
      const createdAt = Number(latest.rows[0].created_at);
      const elapsed = Math.floor((now - createdAt) / 1000);
      if (elapsed < 45) {
        res.status(429).json({
          error: `Please wait ${45 - elapsed} seconds before requesting a new WhatsApp OTP.`,
        });
        return;
      }
    }

    const phoneDaily = await client.execute({
      sql: "SELECT count(*) AS total FROM otp_send_log WHERE phone = ? AND created_at > ?",
      args: [cleanPhone, oneDayAgo],
    });
    if (Number(phoneDaily.rows[0]?.total || 0) >= 10) {
      res.status(429).json({ error: "Daily verification limit reached for this number. Please try tomorrow." });
      return;
    }

    const ipHash = hashForLog(clientIp(req));
    const ipDaily = await client.execute({
      sql: "SELECT count(*) AS total FROM otp_send_log WHERE ip_hash = ? AND created_at > ?",
      args: [ipHash, oneDayAgo],
    });
    if (Number(ipDaily.rows[0]?.total || 0) >= 40) {
      res.status(429).json({ error: "Verification limit reached for this network. Please try tomorrow." });
      return;
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto
      .createHmac("sha256", OTP_HMAC_SECRET)
      .update(`${cleanPhone}:${otp}`)
      .digest("hex");
    const expiresAt = Math.floor(now / 1000) + 300;

    await client.execute({ sql: "DELETE FROM otp_challenges WHERE phone = ?", args: [cleanPhone] });
    await client.execute({
      sql: "INSERT INTO otp_challenges (id, phone, otp_hash, attempts, expires_at, verified, created_at) VALUES (?, ?, ?, 0, ?, 0, ?)",
      args: [randomId("otp"), cleanPhone, otpHash, expiresAt, now],
    });
    await client.execute({
      sql: "INSERT INTO otp_send_log (id, phone, ip_hash, created_at) VALUES (?, ?, ?, ?)",
      args: [randomId("otpsend"), cleanPhone, ipHash, now],
    });

    const delivered = await sendWhatsAppMessage(
      `+91${cleanPhone}`,
      `Your Apna Bazar security code is: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`,
    );

    if (!delivered) {
      await client.execute({ sql: "DELETE FROM otp_challenges WHERE phone = ?", args: [cleanPhone] });
      console.error(`[auth] OTP delivery failed for ${maskPhone(cleanPhone)}`);
      res.status(502).json({ error: "Could not deliver the WhatsApp OTP right now. Please try again." });
      return;
    }

    console.info(`[auth] OTP dispatched to ${maskPhone(cleanPhone)}`);
    res.json({ success: true, message: "OTP sent to WhatsApp" });
  }),
);

app.post(
  ["/api/v1/customer/auth/whatsapp/verify-otp", "/api/auth/otp/verify"],
  otpVerifyLimiter,
  asyncHandler(async (req, res) => {
    const cleanPhone = normalizePhone((req.body as { phone?: unknown })?.phone);
    const rawOtp = String((req.body as { otp?: unknown })?.otp ?? "").replace(/\D/g, "");

    if (!cleanPhone) {
      res.status(400).json({ error: "Valid 10-digit Indian phone number is required." });
      return;
    }
    if (rawOtp.length !== 6) {
      res.status(400).json({ error: "Please enter the complete 6-digit OTP code." });
      return;
    }

    const challengeRes = await client.execute({
      sql: "SELECT * FROM otp_challenges WHERE phone = ? ORDER BY created_at DESC LIMIT 1",
      args: [cleanPhone],
    });

    if (challengeRes.rows.length === 0) {
      res.status(400).json({ error: "OTP expired or not found. Please request a new WhatsApp code." });
      return;
    }

    const challenge = challengeRes.rows[0] as unknown as Record<string, unknown>;
    const nowSec = Math.floor(Date.now() / 1000);

    if (nowSec > Number(challenge.expires_at)) {
      await client.execute({ sql: "DELETE FROM otp_challenges WHERE phone = ?", args: [cleanPhone] });
      res.status(400).json({ error: "OTP has expired. Please request a fresh WhatsApp code." });
      return;
    }

    const attempts = Number(challenge.attempts) || 0;
    if (attempts >= 3) {
      await client.execute({ sql: "DELETE FROM otp_challenges WHERE phone = ?", args: [cleanPhone] });
      res.status(429).json({ error: "Too many incorrect attempts. Please request a new OTP." });
      return;
    }

    const expectedHash = crypto
      .createHmac("sha256", OTP_HMAC_SECRET)
      .update(`${cleanPhone}:${rawOtp}`)
      .digest();
    const storedHash = Buffer.from(String(challenge.otp_hash), "hex");
    const isMatch =
      storedHash.length === expectedHash.length && crypto.timingSafeEqual(storedHash, expectedHash);

    if (!isMatch) {
      const nextAttempts = attempts + 1;
      if (nextAttempts >= 3) {
        await client.execute({ sql: "DELETE FROM otp_challenges WHERE phone = ?", args: [cleanPhone] });
        await logAuthEvent("otp_verify_locked", req, null, maskPhone(cleanPhone));
        res.status(429).json({
          error: "Security lockout: 3 incorrect attempts. Please request a new OTP.",
        });
        return;
      }
      await client.execute({
        sql: "UPDATE otp_challenges SET attempts = ? WHERE id = ?",
        args: [nextAttempts, String(challenge.id)],
      });
      res.status(400).json({
        error: `Incorrect OTP code. ${3 - nextAttempts} attempt${3 - nextAttempts > 1 ? "s" : ""} remaining.`,
      });
      return;
    }

    await client.execute({ sql: "DELETE FROM otp_challenges WHERE phone = ?", args: [cleanPhone] });

    const e164Phone = `+91${cleanPhone}`;
    let userRes = await client.execute({
      sql: "SELECT * FROM users WHERE phone = ? LIMIT 1",
      args: [e164Phone],
    });

    let row: Record<string, unknown>;
    if (userRes.rows.length === 0) {
      const newUserId = `usr-${cleanPhone}`;
      const newUserName = `Customer ${cleanPhone.slice(-4)}`;
      row = {
        id: newUserId,
        name: newUserName,
        email: null,
        phone: e164Phone,
        role: "CUSTOMER",
        is_blocked: 0,
        token_version: 1,
        avatar: null,
      };
      try {
        await client.execute({
          sql: "INSERT INTO users (id, name, email, phone, role, is_blocked, token_version, created_at) VALUES (?, ?, NULL, ?, 'CUSTOMER', 0, 1, ?)",
          args: [newUserId, newUserName, e164Phone, Date.now()],
        });
      } catch {
        userRes = await client.execute({
          sql: "SELECT * FROM users WHERE phone = ? LIMIT 1",
          args: [e164Phone],
        });
        if (userRes.rows.length === 0) throw new HttpError(500, "Could not create your account.");
        row = userRes.rows[0] as unknown as Record<string, unknown>;
      }
    } else {
      row = userRes.rows[0] as unknown as Record<string, unknown>;
    }

    if (Number(row.is_blocked) === 1) {
      res.status(403).json({ error: "Your account is temporarily suspended. Please contact support." });
      return;
    }

    const sessionUser = mapUserRow(row);
    setSessionCookie(res, sessionUser);
    await logAuthEvent("login_otp", req, sessionUser.id);

    res.setHeader("Cache-Control", "no-store");
    res.json({
      success: true,
      user: sessionUser,
      message: "Phone verified successfully via WhatsApp OTP",
    });
  }),
);

app.get("/api/auth/google/config", rateLimit({ windowMs: 60_000, max: 60, prefix: "google-config" }), (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=300");
  res.json({ clientId: GOOGLE_CLIENT_ID || null, enabled: Boolean(GOOGLE_CLIENT_ID) });
});

function isVerifiedGoogleFlag(value: unknown): boolean {
  return value === true || value === "true";
}

function normalizeGoogleAvatar(value: unknown): string | null {
  return isHttpsUrl(value, AVATAR_HOSTS);
}

async function resolveGoogleIdentity(
  token: Record<string, unknown>,
): Promise<{ sub: string; email: string; name: string; picture: string | null }> {
  const sub = typeof token.sub === "string" ? token.sub : "";
  const email = typeof token.email === "string" ? token.email.trim().toLowerCase() : "";
  const emailVerified = isVerifiedGoogleFlag(token.email_verified);

  if (!sub || sub.length > 255) throw new HttpError(401, "Invalid Google identity.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254 || !emailVerified) {
    throw new HttpError(401, "A verified Google email address is required.");
  }

  const rawName = typeof token.name === "string" ? token.name : email.split("@")[0];
  const name = cleanText(rawName, { min: 1, max: 100 }) || "Google Customer";
  return { sub, email, name, picture: normalizeGoogleAvatar(token.picture) };
}

app.post(
  ["/api/v1/customer/auth/google", "/api/auth/google"],
  googleLimiter,
  asyncHandler(async (req, res) => {
    if (!GOOGLE_CLIENT_ID) {
      res.status(503).json({ error: "Google Sign-In is not configured on the server. Please use WhatsApp OTP." });
      return;
    }

    const body = (req.body || {}) as { credential?: unknown; accessToken?: unknown };
    let identity: { sub: string; email: string; name: string; picture: string | null };

    if (typeof body.credential === "string" && body.credential.length > 0) {
      if (body.credential.length > 10_000) throw new HttpError(413, "Google credential is too large.");
      try {
        const { payload } = await jwtVerify(body.credential, GOOGLE_JWKS, {
          issuer: ["https://accounts.google.com", "accounts.google.com"],
          audience: GOOGLE_CLIENT_ID,
          algorithms: ["RS256"],
          clockTolerance: 60,
        });
        identity = await resolveGoogleIdentity(payload as Record<string, unknown>);
      } catch (error) {
        if (error instanceof HttpError) throw error;
        await logAuthEvent("google_id_token_failed", req, null);
        throw new HttpError(401, "Google ID token verification failed.");
      }
    } else if (typeof body.accessToken === "string" && body.accessToken.length > 0) {
      if (body.accessToken.length > 4096) throw new HttpError(413, "Google access token is too large.");
      try {
        const tokenInfoRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(body.accessToken)}`,
          { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8_000) },
        );
        if (!tokenInfoRes.ok) throw new HttpError(401, "Google access token is invalid or expired.");
        const tokenInfo = (await tokenInfoRes.json()) as Record<string, unknown>;
        if (String(tokenInfo.aud || "") !== GOOGLE_CLIENT_ID) {
          throw new HttpError(401, "Google token was issued for a different application.");
        }
        if (Number(tokenInfo.expires_in) <= 0) {
          throw new HttpError(401, "Google access token is expired.");
        }
        const scope = String(tokenInfo.scope || "");
        if (!scope.includes("openid") || !scope.includes("email")) {
          throw new HttpError(401, "Google token is missing required scopes.");
        }

        const userInfoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
          headers: { Authorization: `Bearer ${body.accessToken}`, Accept: "application/json" },
          signal: AbortSignal.timeout(8_000),
        });
        if (!userInfoRes.ok) throw new HttpError(401, "Could not load your Google profile.");
        const profile = (await userInfoRes.json()) as Record<string, unknown>;
        identity = await resolveGoogleIdentity({
          ...profile,
          email_verified: profile.email_verified ?? tokenInfo.email_verified,
        });
      } catch (error) {
        if (error instanceof HttpError) throw error;
        await logAuthEvent("google_access_token_failed", req, null);
        throw new HttpError(401, "Google sign-in could not be verified.");
      }
    } else {
      res.status(400).json({ error: "Google credential is required." });
      return;
    }

    let result = await client.execute({
      sql: "SELECT * FROM users WHERE google_sub = ? LIMIT 1",
      args: [identity.sub],
    });

    let row: Record<string, unknown> | undefined = result.rows[0] as unknown as Record<string, unknown>;

    if (!row) {
      const byEmail = await client.execute({
        sql: "SELECT * FROM users WHERE lower(email) = ? LIMIT 1",
        args: [identity.email],
      });

      if (byEmail.rows.length > 0) {
        const existing = byEmail.rows[0] as unknown as Record<string, unknown>;
        const linkedSub = existing.google_sub ? String(existing.google_sub) : "";
        if (linkedSub && linkedSub !== identity.sub) {
          await logAuthEvent("google_email_conflict", req, String(existing.id));
          throw new HttpError(409, "This email is linked to another Google account. Please contact support.");
        }
        await client.execute({
          sql: "UPDATE users SET google_sub = ?, avatar = COALESCE(?, avatar) WHERE id = ?",
          args: [identity.sub, identity.picture, String(existing.id)],
        });
        row = { ...existing, google_sub: identity.sub, avatar: identity.picture || existing.avatar };
      } else {
        const userId = `usr_g_${crypto.createHash("sha256").update(identity.sub).digest("hex").slice(0, 20)}`;
        await client.execute({
          sql: "INSERT INTO users (id, name, email, phone, google_sub, avatar, role, is_blocked, token_version, created_at) VALUES (?, ?, ?, NULL, ?, ?, 'CUSTOMER', 0, 1, ?)",
          args: [userId, identity.name, identity.email, identity.sub, identity.picture, Date.now()],
        });
        result = await client.execute({ sql: "SELECT * FROM users WHERE id = ? LIMIT 1", args: [userId] });
        row = result.rows[0] as unknown as Record<string, unknown>;
      }
    }

    if (!row) throw new HttpError(500, "Could not create your Google account.");
    if (Number(row.is_blocked) === 1) {
      res.status(403).json({ error: "Your account is temporarily suspended. Please contact support." });
      return;
    }

    if (identity.picture && !row.avatar) {
      await client.execute({ sql: "UPDATE users SET avatar = ? WHERE id = ?", args: [identity.picture, String(row.id)] });
      row.avatar = identity.picture;
    }

    const sessionUser = mapUserRow(row);
    setSessionCookie(res, sessionUser);
    await logAuthEvent("login_google", req, sessionUser.id);

    res.setHeader("Cache-Control", "no-store");
    res.json({
      success: true,
      user: sessionUser,
      message: "Google sign-in verified successfully",
    });
  }),
);

app.get(
  ["/api/v1/customer/auth/session", "/api/auth/session"],
  noStore,
  asyncHandler(async (req, res) => {
    const user = await getSessionUser(req);
    if (user) {
      res.json({ authenticated: true, user });
      return;
    }
    res.json({ authenticated: false, user: null });
  }),
);

app.post(
  ["/api/v1/customer/auth/logout", "/api/auth/logout"],
  asyncHandler(async (req, res) => {
    const user = await getSessionUser(req);
    if (user) {
      invalidateSessionCache(user.id);
      await client.execute({
        sql: "UPDATE users SET token_version = token_version + 1 WHERE id = ?",
        args: [user.id],
      });
      await logAuthEvent("logout", req, user.id);
    }
    clearSessionCookies(res);
    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, message: "Logged out successfully" });
  }),
);

/* ------------------------------------------------------------------ */
/* Profile & addresses                                                 */
/* ------------------------------------------------------------------ */

app.get(
  "/api/user/profile",
  requireAuth,
  noStore,
  asyncHandler(async (req, res) => {
    const user = authed(req);
    const stats = await client.execute({
      sql: "SELECT count(*) AS totalOrders, COALESCE(sum(total_amount), 0) AS totalSpent FROM orders WHERE customer_id = ?",
      args: [user.id],
    });
    const row = stats.rows[0];
    res.json({
      ...user,
      tokenVersion: undefined,
      totalOrders: Number(row?.totalOrders || 0),
      totalSpent: roundMoney(Number(row?.totalSpent || 0)),
    });
  }),
);

app.get(
  "/api/user/addresses",
  requireAuth,
  noStore,
  asyncHandler(async (req, res) => {
    const user = authed(req);
    const result = await client.execute({
      sql: "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC LIMIT 20",
      args: [user.id],
    });
    res.json(
      result.rows.map((row) => ({
        id: String(row.id),
        fullName: String(row.full_name),
        phoneNumber: String(row.phone_number),
        streetAddress: String(row.street_address),
        landmark: row.landmark ? String(row.landmark) : "",
        area: row.area ? String(row.area) : "",
        city: String(row.city),
        state: row.state ? String(row.state) : "",
        pincode: String(row.pincode),
        addressType: String(row.address_type || "home"),
        isDefault: Number(row.is_default) === 1,
      })),
    );
  }),
);

app.post(
  "/api/user/addresses",
  requireAuth,
  noStore,
  asyncHandler(async (req, res) => {
    const user = authed(req);
    const address = sanitizeAddress(req.body, user.id);
    const addressId = randomId("addr");
    const transaction = await client.transaction("write");
    try {
      if (address.isDefault) {
        await transaction.execute({
          sql: "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
          args: [user.id],
        });
      }
      await transaction.execute({
        sql: `INSERT INTO addresses
          (id, user_id, full_name, phone_number, street_address, landmark, area, city, state, pincode, address_type, is_default, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          addressId,
          user.id,
          address.fullName,
          address.phoneNumber,
          address.streetAddress,
          address.landmark || "",
          address.area || "",
          address.city,
          address.state || "",
          address.pincode,
          address.addressType,
          address.isDefault ? 1 : 0,
          Date.now(),
        ],
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    res.status(201).json({ ...address, id: addressId });
  }),
);

/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

app.get(
  "/api/products",
  rateLimit({ windowMs: 60_000, max: 120, prefix: "products" }),
  asyncHandler(async (req, res) => {
    const category = typeof req.query.category === "string" ? req.query.category.slice(0, 40) : "";
    const search = typeof req.query.search === "string" ? req.query.search.slice(0, 80) : "";
    const filter = typeof req.query.filter === "string" ? req.query.filter.slice(0, 30) : "";
    const sort = typeof req.query.sort === "string" ? req.query.sort.slice(0, 30) : "";

    let list: Product[] = [...(await getCatalogProducts())].filter(
      (p) => !p.id.startsWith("runway-3d-piece-") || Boolean(search.trim())
    );

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.brand?.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q),
      );
    }

    if (category && category !== "all") {
      if (category === "deals") list = list.filter((p) => p.isFlashDeal || p.discountPercent >= 50);
      else if (category === "bestseller") list = list.filter((p) => p.isBestSeller);
      else list = list.filter((p) => p.category === category);
    }

    if (filter === "deals") list = list.filter((p) => p.discountPercent >= 50 || p.isFlashDeal);
    else if (filter === "bestsellers") list = list.filter((p) => p.isBestSeller);
    else if (filter === "rating4plus") list = list.filter((p) => p.rating >= 4.5);
    else if (filter === "under999") list = list.filter((p) => p.price <= 999);

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "discount") list.sort((a, b) => b.discountPercent - a.discountPercent);
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);

    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.json({ products: list, total: list.length });
  }),
);

app.get(
  "/api/runway-3d-assets",
  rateLimit({ windowMs: 60_000, max: 120, prefix: "runway-3d-assets" }),
  asyncHandler(async (_req, res) => {
    const result = await client.execute(
      "SELECT asset_key, asset_type, look_number, piece_id, name, original_url, cloudinary_url FROM runway_3d_assets;"
    );
    const assets: Record<string, string> = {};
    for (const row of result.rows) {
      const key = String(row.asset_key || "");
      const cloudUrl = String(row.cloudinary_url || row.original_url || "");
      const origUrl = String(row.original_url || "");
      if (key) {
        assets[key] = deliverCatalogImage(cloudUrl || origUrl, 1400) || origUrl;
      }
    }
    res.setHeader("Cache-Control", "public, max-age=120, stale-while-revalidate=300");
    res.json({ assets });
  }),
);

app.get(
  "/api/products/:id",
  rateLimit({ windowMs: 60_000, max: 120, prefix: "product-detail" }),
  asyncHandler(async (req, res) => {
    const productId = safeId(req.params.id, 80);
    if (!productId) throw new HttpError(400, "Invalid product identifier.");

    const catalog = await getCatalogProducts();
    const product = catalog.find((item) => item.id === productId);
    if (product) {
      res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
      res.json(product);
      return;
    }

    const fallback = PRODUCTS.find((item) => item.id === productId);
    if (fallback) {
      res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
      res.json(withCatalogMedia(fallback));
      return;
    }
    res.status(404).json({ error: "Product not found." });
  }),
);

app.get("/api/categories", (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=600");
  res.json(
    CATEGORIES.map((category) => ({
      ...category,
      image: deliverCatalogImage(category.image, 400),
    })),
  );
});

app.get("/api/coupons", (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=300");
  res.json(AVAILABLE_COUPONS);
});

app.post(
  "/api/apply-coupon",
  rateLimit({ windowMs: 60_000, max: 30, prefix: "coupon-preview" }),
  asyncHandler(async (req, res) => {
    const code = cleanText((req.body as { code?: unknown })?.code, { max: 24 })?.toUpperCase();
    const orderTotal = Number((req.body as { orderTotal?: unknown })?.orderTotal);
    if (!code || !Number.isFinite(orderTotal) || orderTotal < 0 || orderTotal > 1_000_000) {
      res.status(400).json({ valid: false, error: "Valid coupon code and order total are required." });
      return;
    }
    const coupon = AVAILABLE_COUPONS.find((candidate) => candidate.code.toUpperCase() === code);
    if (!coupon) {
      res.status(404).json({ valid: false, error: "Invalid coupon code." });
      return;
    }
    if (orderTotal < coupon.minOrderValue) {
      res.status(400).json({
        valid: false,
        error: `This coupon requires a minimum order of ₹${coupon.minOrderValue}.`,
      });
      return;
    }
    const discount =
      coupon.discountType === "fixed"
        ? coupon.discountValue
        : Math.min(400, Math.round((orderTotal * coupon.discountValue) / 100));
    res.json({ valid: true, coupon, discount });
  }),
);

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

const orderCreateLimiter = rateLimit({
  windowMs: 60 * 60_000,
  max: 20,
  prefix: "order-create",
  keyGenerator: (req) => (req as AuthedRequest).user?.id || clientIp(req),
  message: "Too many order attempts. Please try again later.",
});

app.get(
  "/api/orders",
  requireAuth,
  noStore,
  asyncHandler(async (req, res) => {
    const user = authed(req);
    const result = await client.execute({
      sql: "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 50",
      args: [user.id],
    });
    res.json(result.rows.map((row) => mapOrderRow(row as unknown as Record<string, unknown>)));
  }),
);

app.get(
  "/api/orders/:id",
  requireAuth,
  noStore,
  asyncHandler(async (req, res) => {
    const user = authed(req);
    const orderId = safeId(req.params.id, 40);
    if (!orderId) throw new HttpError(400, "Invalid order identifier.");
    const order = await loadOrderForUser(orderId, user.id, user.role === "admin");
    if (!order) throw new HttpError(404, "Order not found.");
    res.json(order);
  }),
);

app.post(
  ["/api/v1/orders", "/api/orders"],
  requireAuth,
  orderCreateLimiter,
  asyncHandler(async (req, res) => {
    const user = authed(req);
    const body = (req.body || {}) as Record<string, unknown>;
    const rawItems = body.items;

    if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 20) {
      throw new HttpError(400, "Your shopping bag is empty or contains too many items.");
    }

    const requestedItems: Array<{ productId: string; quantity: number; size?: string; color?: string }> = [];
    for (const raw of rawItems) {
      if (!isPlainObject(raw)) throw new HttpError(400, "Invalid cart item.");
      const productId = safeId(raw.productId, 80);
      if (!productId) throw new HttpError(400, "Invalid product in cart.");
      const quantity = clampInt(raw.quantity, 1, 10, 1);
      const size = cleanText(raw.selectedSize, { max: 40, allowEmpty: true }) || undefined;
      const color = cleanText(raw.selectedColor, { max: 40, allowEmpty: true }) || undefined;
      requestedItems.push({ productId, quantity, size, color });
    }

    const address = sanitizeAddress(body.address, user.id);
    const couponCode = cleanText(body.appliedCouponCode, { max: 24, allowEmpty: true })?.toUpperCase() || "";
    const safeTip = clampInt(body.tipAmount, 0, 500, 0);
    const requestedCoins = clampInt(body.abCoinsUsed, 0, 100000, 0);

    let transaction: Awaited<ReturnType<typeof client.transaction>> | null = null;
    try {
      transaction = await client.transaction("write");
      const pricedItems: CartItem[] = [];
      let subtotal = 0;

      for (const item of requestedItems) {
        const productRes = await transaction.execute({
          sql: "SELECT * FROM products WHERE id = ? LIMIT 1",
          args: [item.productId],
        });
        const dbProduct = productRes.rows[0] as unknown as Record<string, unknown> | undefined;
        const fallback = PRODUCTS.find((product) => product.id === item.productId);

        if (!dbProduct && !fallback) {
          throw new HttpError(400, "An item in your bag is no longer available.");
        }

        const sizes = dbProduct ? parseDataArray<string[]>(dbProduct.sizes_json, []) : fallback?.sizes || [];
        const colors = dbProduct
          ? parseDataArray<Array<{ name?: string }>>(dbProduct.colors_json, [])
          : fallback?.colors || [];
        const selectedSize = item.size && sizes.includes(item.size) ? item.size : sizes[0] || "Standard";
        const selectedColor =
          item.color && colors.some((color) => color?.name === item.color)
            ? item.color
            : colors[0]?.name || "Standard";

        const basePrice = Number(dbProduct?.price ?? fallback?.price ?? 0);
        if (!Number.isFinite(basePrice) || basePrice <= 0 || basePrice > 1_000_000) {
          throw new HttpError(400, "Product pricing is unavailable. Please try again.");
        }

        if (dbProduct) {
          const stockUpdate = await transaction.execute({
            sql: "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
            args: [item.quantity, item.productId, item.quantity],
          });
          if (stockUpdate.rowsAffected === 0) {
            throw new HttpError(409, "One of the items just went out of stock. Please update your bag.");
          }
        }

        const sizeDelta = Math.max(0, Math.min(1000, Number(getSizePriceDelta(selectedSize)) || 0));
        const unitPrice = roundMoney(basePrice + sizeDelta);
        const originalPrice = roundMoney(Number(dbProduct?.original_price ?? fallback?.originalPrice ?? basePrice) + sizeDelta);
        subtotal = roundMoney(subtotal + unitPrice * item.quantity);

        pricedItems.push({
          product: {
            id: item.productId,
            name: String(dbProduct?.name ?? fallback?.name ?? "Product"),
            price: unitPrice,
            originalPrice,
            image: String(dbProduct?.image_url ?? fallback?.image ?? ""),
            category: String(dbProduct?.category ?? fallback?.category ?? "general"),
            discountPercent:
              originalPrice > 0 ? Math.max(0, Math.round(((originalPrice - unitPrice) / originalPrice) * 100)) : 0,
            rating: Number(dbProduct?.rating ?? fallback?.rating ?? 4.5),
            reviewsCount: Number(dbProduct?.reviews_count ?? fallback?.reviewsCount ?? 0),
            inStock: true,
            description: String(dbProduct?.description ?? fallback?.description ?? ""),
          },
          quantity: item.quantity,
          selectedSize,
          selectedColor,
          unitPrice,
          originalUnitPrice: originalPrice,
        });
      }

      if (subtotal <= 0 || subtotal > 2_000_000) {
        throw new HttpError(400, "Order total is invalid.");
      }

      const deliveryFee = subtotal >= STORE_INFO.freeDeliveryThreshold ? 0 : 49;
      let discount = 0;

      if (couponCode) {
        const used = await transaction.execute({
          sql: "SELECT 1 AS used FROM coupon_redemptions WHERE user_id = ? AND code = ? LIMIT 1",
          args: [user.id, couponCode],
        });
        if (used.rows.length > 0) {
          throw new HttpError(409, "This coupon has already been used on your account.");
        }
        const coupon = AVAILABLE_COUPONS.find((candidate) => candidate.code.toUpperCase() === couponCode);
        if (coupon && subtotal >= coupon.minOrderValue) {
          discount =
            coupon.discountType === "fixed"
              ? Math.min(coupon.discountValue, subtotal + deliveryFee)
              : Math.min(400, Math.round((subtotal * coupon.discountValue) / 100));
        } else if (couponCode.startsWith("AB") && couponCode.length >= 6) {
          // Anti-Fraud Safeguard 1: Block self-referrals
          if (user.phone && user.phone.endsWith(couponCode.slice(2))) {
            throw new HttpError(400, "You cannot use your own referral code.");
          }
          // Anti-Fraud Safeguard 2: Eligible only on customer's first order
          const prevOrders = await transaction.execute({
            sql: "SELECT 1 FROM orders WHERE customer_id = ? AND status != 'cancelled' LIMIT 1",
            args: [user.id],
          });
          if (prevOrders.rows.length > 0) {
            throw new HttpError(400, "Referral codes are only eligible on your first order.");
          }
          // Valid referral code gives ₹50 discount + 50 AB Coins upon delivered order
          discount = Math.min(50, subtotal);
        }
      }

      // Authoritative AB Coin validation & redemption (2 AB Coins = ₹1)
      let coinsDeducted = 0;
      let coinDiscountRs = 0;

      if (requestedCoins > 0) {
        const userWalletRes = await transaction.execute({
          sql: "SELECT wallet_balance FROM users WHERE id = ? LIMIT 1",
          args: [user.id],
        });
        const currentWallet = Math.max(0, Number(userWalletRes.rows[0]?.wallet_balance != null ? userWalletRes.rows[0].wallet_balance : 0));
        const usableCoins = Math.min(requestedCoins, currentWallet);
        const maxDiscountRs = Math.floor(usableCoins / 2);
        coinDiscountRs = Math.min(maxDiscountRs, Math.max(0, subtotal + deliveryFee + safeTip - discount));
        coinsDeducted = coinDiscountRs * 2;

        if (coinsDeducted > 0) {
          await transaction.execute({
            sql: "UPDATE users SET wallet_balance = MAX(0, wallet_balance - ?) WHERE id = ?",
            args: [coinsDeducted, user.id],
          });
        }
      }

      const total = roundMoney(Math.max(0, subtotal + deliveryFee + safeTip - discount - coinDiscountRs));
      const requestedMethod = String(body.paymentMethod || "cod");
      const paymentMethod = total === 0 ? "ab_coins" : requestedMethod === "ab_coins" ? "ab_coins" : "cod";

      if (paymentMethod === "ab_coins" && total > 0) {
        throw new HttpError(400, "Insufficient AB Coins for this order.");
      }

      let orderId = "";
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const candidate = `AB-${crypto.randomInt(100000, 1000000)}`;
        const exists = await transaction.execute({
          sql: "SELECT 1 AS found FROM orders WHERE id = ? LIMIT 1",
          args: [candidate],
        });
        if (exists.rows.length === 0) {
          orderId = candidate;
          break;
        }
      }
      if (!orderId) throw new HttpError(503, "Could not allocate an order number. Please retry.");

      const deliveryOtp = crypto.randomInt(100000, 1000000).toString();
      const createdAt = Date.now();
      const estimatedDate = new Date(createdAt + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });

      await transaction.execute({
        sql: `INSERT INTO orders (
          id, customer_id, total_amount, status, items_json, address_json,
          payment_method, ab_coins_used, coins_discount, delivery_otp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          orderId,
          user.id,
          total,
          "confirmed",
          JSON.stringify(pricedItems),
          JSON.stringify(address),
          paymentMethod,
          coinsDeducted,
          coinDiscountRs,
          deliveryOtp,
          createdAt,
        ],
      });

      if (couponCode && discount > 0) {
        await transaction.execute({
          sql: "INSERT INTO coupon_redemptions (id, user_id, code, order_id, created_at) VALUES (?, ?, ?, ?, ?)",
          args: [randomId("cpr"), user.id, couponCode, orderId, createdAt],
        });
      }

      await transaction.commit();
      invalidateSessionCache(user.id);

      const order: Order = {
        id: orderId,
        createdAt,
        items: pricedItems,
        itemTotal: subtotal,
        deliveryFee,
        packagingFee: 0,
        discount,
        tipAmount: safeTip,
        totalAmount: total,
        address,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "completed",
        orderStatus: "confirmed",
        estimatedDeliveryDate: `${estimatedDate} by 7 PM`,
        appliedCoupon: couponCode || undefined,
        otp: deliveryOtp,
        cancellationAllowed: true,
        userId: user.id,
        abCoinsUsed: coinsDeducted,
        coinsDiscount: coinDiscountRs,
        trackingSteps: buildTrackingSteps("confirmed", createdAt),
      };

      res.status(201).json({
        success: true,
        order,
        message: "Order placed securely with verified anti-tamper pricing",
      });
    } catch (error) {
      if (transaction) {
        try {
          await transaction.rollback();
        } catch {
          /* transaction may already be closed */
        }
      }
      throw error;
    }
  }),
);

app.patch(
  "/api/orders/:id/cancel",
  requireAuth,
  noStore,
  asyncHandler(async (req, res) => {
    const user = authed(req);
    const orderId = safeId(req.params.id, 40);
    if (!orderId) throw new HttpError(400, "Invalid order identifier.");

    const order = await loadOrderForUser(orderId, user.id, user.role === "admin");
    if (!order) throw new HttpError(404, "Order not found.");
    if (!["placed", "confirmed", "packing"].includes(order.orderStatus)) {
      throw new HttpError(409, "This order can no longer be cancelled online. Please contact support.");
    }

    const ownerId = order.userId || user.id;
    const transaction = await client.transaction("write");
    try {
      await transaction.execute({
        sql: "UPDATE orders SET status = 'cancelled' WHERE id = ? AND customer_id = ?",
        args: [order.id, ownerId],
      });
      for (const item of order.items) {
        const productId = safeId(item?.product?.id, 80);
        const quantity = clampInt(item?.quantity, 0, 1000, 0);
        if (!productId || quantity <= 0) continue;
        await transaction.execute({
          sql: "UPDATE products SET stock = stock + ? WHERE id = ?",
          args: [quantity, productId],
        });
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    const updated = await loadOrderForUser(order.id, ownerId, false);
    res.json({
      success: true,
      message: "Order cancelled successfully. Stock restored.",
      order: updated,
    });
  }),
);

app.post(
  "/api/orders/:id/return",
  requireAuth,
  noStore,
  rateLimit({ windowMs: 60 * 60_000, max: 10, prefix: "return-request" }),
  asyncHandler(async (req, res) => {
    const user = authed(req);
    const orderId = safeId(req.params.id, 40);
    if (!orderId) throw new HttpError(400, "Invalid order identifier.");

    const order = await loadOrderForUser(orderId, user.id, false);
    if (!order) throw new HttpError(404, "Order not found.");
    if (order.orderStatus !== "delivered") {
      throw new HttpError(409, "Only delivered orders can be returned.");
    }
    if (Date.now() - order.createdAt > STORE_INFO.returnWindowDays * 24 * 60 * 60 * 1000) {
      throw new HttpError(409, "The 5-day return window for this order has ended.");
    }

    const existing = await client.execute({
      sql: "SELECT 1 AS found FROM returns WHERE order_id = ? LIMIT 1",
      args: [order.id],
    });
    if (existing.rows.length > 0) throw new HttpError(409, "A return request already exists for this order.");

    const reason = cleanText((req.body as { reason?: unknown })?.reason, { min: 2, max: 120 });
    const comments = cleanText((req.body as { comments?: unknown })?.comments, { max: 500, allowEmpty: true }) || "";
    if (!reason) throw new HttpError(400, "Please select a valid return reason.");

    const returnOtp = crypto.randomInt(100000, 1000000).toString();
    const transaction = await client.transaction("write");
    try {
      await transaction.execute({
        sql: "INSERT INTO returns (id, order_id, user_id, reason, comments, otp, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'requested', ?)",
        args: [randomId("ret"), order.id, user.id, reason, comments, returnOtp, Date.now()],
      });
      await transaction.execute({
        sql: "UPDATE orders SET status = 'return_pickup_scheduled' WHERE id = ? AND customer_id = ?",
        args: [order.id, user.id],
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    res.status(201).json({
      success: true,
      message: "Return pickup scheduled.",
      order: {
        ...order,
        orderStatus: "return_pickup_scheduled",
        returnRequested: true,
        returnOtp,
        returnReason: reason,
        returnComments: comments,
        returnRequestedAt: Date.now(),
        trackingSteps: buildTrackingSteps("return_pickup_scheduled", order.createdAt),
      },
    });
  }),
);

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

const REVIEWS_CACHE_TTL = 15_000;
const reviewsCache = new Map<string, { at: number; data: unknown[] }>();

app.get(
  "/api/products/:id/reviews",
  rateLimit({ windowMs: 60_000, max: 90, prefix: "reviews-list" }),
  asyncHandler(async (req, res) => {
    const productId = safeId(req.params.id, 80);
    if (!productId) throw new HttpError(400, "Invalid product identifier.");

    const cached = reviewsCache.get(productId);
    if (cached && Date.now() - cached.at < REVIEWS_CACHE_TTL) {
      res.setHeader("Cache-Control", "public, max-age=15, stale-while-revalidate=30");
      res.json(cached.data);
      return;
    }

    const result = await client.execute({
      sql: "SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT 100",
      args: [productId],
    });

    const data = result.rows.map((row) => ({
      id: String(row.id),
      productId: String(row.product_id),
      userId: String(row.user_id),
      userName: String(row.user_name),
      rating: Number(row.rating),
      title: String(row.title || ""),
      comment: String(row.comment || ""),
      createdAt: Number(row.created_at),
      verifiedBuyer: Number(row.verified_buyer) === 1,
      helpfulCount: Number(row.helpful_count) || 0,
      images: parseDataArray<string[]>(row.images_json, []).map((image) => deliverCatalogImage(image, 640)),
    }));

    if (reviewsCache.size > 1_000) reviewsCache.clear();
    reviewsCache.set(productId, { at: Date.now(), data });
    res.setHeader("Cache-Control", "public, max-age=15, stale-while-revalidate=30");
    res.json(data);
  }),
);

app.post(
  "/api/products/:id/reviews",
  requireAuth,
  rateLimit({
    windowMs: 60 * 60_000,
    max: 6,
    prefix: "reviews-create",
    keyGenerator: (req) => (req as AuthedRequest).user?.id || clientIp(req),
    message: "Review limit reached. Please try again later.",
  }),
  asyncHandler(async (req, res) => {
    const user = authed(req);
    const productId = safeId(req.params.id, 80);
    if (!productId) throw new HttpError(400, "Invalid product identifier.");

    const body = (req.body || {}) as Record<string, unknown>;
    const rating = clampInt(body.rating, 1, 5, 0);
    const comment = cleanText(body.comment, { min: 3, max: 1000 });
    const title = cleanText(body.title, { max: 100, allowEmpty: true }) || "Customer Review";

    if (!rating) throw new HttpError(400, "Rating must be between 1 and 5.");
    if (!comment) throw new HttpError(400, "Please write a review between 3 and 1000 characters.");

    const rawImages = Array.isArray(body.images) ? body.images.slice(0, 3) : [];
    const images: string[] = [];
    for (const image of rawImages) {
      const safeImage = isHttpsUrl(image, ["res.cloudinary.com"]);
      if (safeImage) images.push(safeImage);
    }

    const purchased = await client.execute({
      sql: "SELECT 1 AS found FROM orders WHERE customer_id = ? AND status = 'delivered' AND items_json LIKE ? LIMIT 1",
      args: [user.id, `%\"id\":\"${productId}\"%`],
    });

    const review: ProductReview = {
      id: randomId("rev"),
      productId,
      userId: user.id,
      userName: user.name,
      rating,
      title,
      comment,
      createdAt: Date.now(),
      verifiedBuyer: purchased.rows.length > 0,
      helpfulCount: 0,
      images,
    };

    try {
      await client.execute({
        sql: `INSERT INTO reviews
          (id, product_id, user_id, user_name, rating, title, comment, images_json, verified_buyer, helpful_count, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        args: [
          review.id,
          productId,
          user.id,
          review.userName,
          rating,
          title,
          comment,
          JSON.stringify(images),
          review.verifiedBuyer ? 1 : 0,
          review.createdAt,
        ],
      });
    } catch (error) {
      const message = String((error as Error)?.message || "");
      if (message.toLowerCase().includes("unique")) {
        throw new HttpError(409, "You have already reviewed this product.");
      }
      throw error;
    }

    reviewsCache.delete(productId);
    res.status(201).json(review);
  }),
);

/* ------------------------------------------------------------------ */
/* Uploads (Cloudinary)                                                */
/* ------------------------------------------------------------------ */

const uploadSignLimiter = rateLimit({ windowMs: 60 * 60_000, max: 20, prefix: "upload-sign" });
const uploadLimiter = rateLimit({ windowMs: 60 * 60_000, max: 20, prefix: "upload" });

const UPLOAD_FOLDERS: Record<string, string> = {
  products: "apnabazar_products",
  apnabazar_products: "apnabazar_products",
  reviews: "apnabazar_reviews",
  apnabazar_reviews: "apnabazar_reviews",
  complaints: "apnabazar_complaints",
  apnabazar_complaints: "apnabazar_complaints",
};

function resolveUploadFolder(rawFolder: unknown, role: string | null): string | null {
  const folder = UPLOAD_FOLDERS[String(rawFolder || "").trim().toLowerCase()];
  if (!folder) return null;
  if (folder === "apnabazar_products" && role !== "admin") return null;
  if (!role && folder !== "apnabazar_complaints") return null;
  return folder;
}

function cloudinarySignature(folder: string, timestamp: number): string {
  return crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
    .digest("hex");
}

app.post(
  ["/api/v1/upload/cloudinary-sign", "/api/cloudinary/sign"],
  uploadSignLimiter,
  asyncHandler(async (req, res) => {
    if (!CLOUDINARY_READY) {
      res.status(503).json({ error: "Image uploads are not configured right now." });
      return;
    }
    const user = await getSessionUser(req);
    const folder = resolveUploadFolder((req.body as { folder?: unknown })?.folder, user?.role || null);
    if (!folder) {
      res.status(403).json({ error: "This upload destination is not allowed." });
      return;
    }

    const timestamp = Math.round(Date.now() / 1000);
    res.setHeader("Cache-Control", "no-store");
    res.json({
      signature: cloudinarySignature(folder, timestamp),
      timestamp,
      apiKey: CLOUDINARY_API_KEY,
      cloudName: CLOUDINARY_CLOUD_NAME,
      folder,
      maxFileSize: MAX_UPLOAD_BYTES,
    });
  }),
);

function detectImageType(buffer: Buffer): { mime: string; extension: string } | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", extension: "jpg" };
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: "image/png", extension: "png" };
  }
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return { mime: "image/webp", extension: "webp" };
  }
  return null;
}

const uploadJson = express.json({ limit: "8mb", strict: true, type: ["application/json"] });

app.post(
  ["/api/v1/upload/image", "/api/cloudinary/upload"],
  uploadLimiter,
  uploadJson,
  asyncHandler(async (req, res) => {
    if (!CLOUDINARY_READY) {
      res.status(503).json({ error: "Image uploads are not configured right now." });
      return;
    }
    if (!req.is("application/json")) {
      res.status(415).json({ error: "Content-Type must be application/json." });
      return;
    }

    const user = await getSessionUser(req);
    const body = (req.body || {}) as Record<string, unknown>;
    const folder = resolveUploadFolder(body.folder, user?.role || null);
    if (!folder) {
      res.status(403).json({ error: "This upload destination is not allowed." });
      return;
    }

    const timestamp = Number(body.timestamp);
    const signature = String(body.signature || "");
    if (!Number.isFinite(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 600) {
      res.status(400).json({ error: "Upload authorisation expired. Please retry." });
      return;
    }
    if (!/^[a-f0-9]{40}$/i.test(signature)) {
      res.status(400).json({ error: "Invalid upload signature." });
      return;
    }
    const expected = Buffer.from(cloudinarySignature(folder, Math.floor(timestamp)), "hex");
    const received = Buffer.from(signature, "hex");
    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
      res.status(403).json({ error: "Upload signature verification failed." });
      return;
    }

    const dataUrl = body.data;
    if (typeof dataUrl !== "string" || dataUrl.length > 7_500_000) {
      res.status(413).json({ error: "Image is too large. Maximum size is 5 MB." });
      return;
    }
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) {
      res.status(400).json({ error: "Only JPEG, PNG and WebP images are accepted." });
      return;
    }

    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
      res.status(413).json({ error: "Image is too large. Maximum size is 5 MB." });
      return;
    }
    const detected = detectImageType(buffer);
    if (!detected || detected.mime !== match[1]) {
      res.status(400).json({ error: "The uploaded file is not a valid image." });
      return;
    }

    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(buffer)], { type: detected.mime }), `upload.${detected.extension}`);
    form.append("api_key", CLOUDINARY_API_KEY);
    form.append("timestamp", String(Math.floor(timestamp)));
    form.append("folder", folder);
    form.append("signature", signature);

    try {
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/image/upload`,
        { method: "POST", body: form, signal: AbortSignal.timeout(20_000) },
      );
      const payload = (await uploadRes.json()) as Record<string, unknown>;
      if (!uploadRes.ok || !payload.secure_url) {
        console.error(`[upload] Cloudinary rejected upload (${uploadRes.status})`);
        res.status(502).json({ error: "Image upload failed. Please try again." });
        return;
      }
      res.status(201).json({
        secure_url: String(payload.secure_url),
        url: String(payload.secure_url),
        public_id: String(payload.public_id || ""),
        format: String(payload.format || detected.extension),
        bytes: Number(payload.bytes || buffer.length),
      });
    } catch {
      res.status(502).json({ error: "Image upload service is temporarily unavailable." });
    }
  }),
);

/* ------------------------------------------------------------------ */
/* Location & delivery                                                 */
/* ------------------------------------------------------------------ */

const geocodeLimiter = rateLimit({ windowMs: 60_000, max: 60, prefix: "geocode" });
const OLC_ALPHABET = "23456789CFGHJMPQRVWX";

function computeOpenLocationCode(lat: number, lng: number): string {
  let clampedLat = Math.min(Math.max(lat, -90), 90);
  if (clampedLat === 90) clampedLat -= 0.0000125;
  let normLng = lng;
  while (normLng < -180) normLng += 360;
  while (normLng >= 180) normLng -= 360;

  let latVal = Math.floor(Math.round((clampedLat + 90) * 4000000) / 100);
  let lngVal = Math.floor(Math.round((normLng + 180) * 3200000) / 100);

  const gridRow = ((latVal % 5) + 5) % 5;
  const gridCol = ((lngVal % 4) + 4) % 4;
  const char11 = OLC_ALPHABET[gridRow * 4 + gridCol] || "2";

  latVal = Math.floor(latVal / 5);
  lngVal = Math.floor(lngVal / 4);

  const latDigits: string[] = [];
  const lngDigits: string[] = [];
  for (let i = 0; i < 5; i++) {
    const lIdx = ((latVal % 20) + 20) % 20;
    const gIdx = ((lngVal % 20) + 20) % 20;
    latDigits.unshift(OLC_ALPHABET[lIdx] || "2");
    lngDigits.unshift(OLC_ALPHABET[gIdx] || "2");
    latVal = Math.floor(latVal / 20);
    lngVal = Math.floor(lngVal / 20);
  }

  const p3 = latDigits[2] + lngDigits[2];
  const p4 = latDigits[3] + lngDigits[3];
  const p5 = latDigits[4] + lngDigits[4];

  return `${p3}${p4}+${p5}${char11}`;
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
}

function validCoordinates(lat: unknown, lng: unknown): { lat: number; lng: number } | null {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) return null;
  if (Math.abs(parsedLat) > 90 || Math.abs(parsedLng) > 180) return null;
  return { lat: parsedLat, lng: parsedLng };
}

app.get(
  "/api/geocode/reverse",
  geocodeLimiter,
  asyncHandler(async (req, res) => {
    const coords = validCoordinates(req.query.lat, req.query.lng);
    if (!coords) throw new HttpError(400, "Valid lat and lng query params are required.");

    const plusCode = computeOpenLocationCode(coords.lat, coords.lng);
    const dist = calculateDistanceKm(22.2815, 86.7198, coords.lat, coords.lng);
    const isInside10Km = dist <= 10;

    let road = "";
    let locality = "";
    let village = "";
    let city = "";
    let landmark = "";
    let nearby = "";
    let state = "";
    let pincode = "";
    let displayName = "";

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1&zoom=18`,
        {
          headers: {
            "User-Agent": "ApnaBazarEcommerce/4.0 (support@apnabazar.in)",
            Accept: "application/json",
            "Accept-Language": "en",
          },
          signal: AbortSignal.timeout(1_800),
        },
      );

      if (geoRes.ok) {
        const data = (await geoRes.json()) as { address?: Record<string, string>; display_name?: string };
        const addr = data.address || {};
        displayName = typeof data.display_name === "string" ? data.display_name.slice(0, 300) : "";
        road = addr.road || addr.street || addr.pedestrian || addr.footway || addr.path || addr.residential || addr.highway || "";
        village = addr.village || addr.hamlet || addr.isolated_dwelling || addr.croft || "";
        locality =
          village ||
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.city_district ||
          addr.quarter ||
          addr.subdistrict ||
          "";
        city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || "";
        landmark = addr.amenity || addr.building || addr.shop || addr.commercial || addr.office || addr.tourism || addr.historic || addr.place || "";
        nearby = landmark || (village ? `Near ${village}` : locality ? `Near ${locality}` : `Near ${city || "Apna Bazar"}`);
        state = addr.state || "";
        pincode = addr.postcode || "";
      }
    } catch {
      /* fall through to local defaults */
    }

    if (!pincode) {
      const pinMatch = displayName.match(/\b([1-9]\d{5})\b/);
      pincode = pinMatch ? pinMatch[1] : dist <= 10 ? "832101" : "831001";
    }
    if (!state) state = "Jharkhand";
    if (!city) city = dist <= 10 ? "Baharagora" : dist <= 85 ? "Jamshedpur Region" : "Local City";
    if (!locality) locality = village || city;
    if (!village) village = locality;
    if (!road) road = `${locality} Main Road`;
    if (!landmark) landmark = nearby || `Near ${locality}`;
    if (!nearby) nearby = landmark;

    // Deduplicate address parts so city/locality never repeats multiple times
    const seenParts = new Set<string>();
    const uniqueParts: string[] = [];
    for (const part of [plusCode, road, village, locality, city]) {
      const trimmed = (part || "").trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (!seenParts.has(key)) {
        seenParts.add(key);
        uniqueParts.push(trimmed);
      }
    }
    const fullFormatted = `${uniqueParts.join(", ")}, ${state} ${pincode}`;

    res.json({
      plusCode,
      road,
      locality,
      village,
      city,
      landmark,
      nearby,
      state,
      pincode,
      fullFormatted,
      distanceKm: dist,
      isInside10Km,
      displayName: displayName || fullFormatted,
    });
  }),
);

app.get(
  "/api/geocode/search",
  rateLimit({ windowMs: 60_000, max: 30, prefix: "geocode-search" }),
  asyncHandler(async (req, res) => {
    const query = cleanText(req.query.q, { max: 100, allowEmpty: true }) || "";
    if (query.length < 2) {
      res.json({ suggestions: [] });
      return;
    }

    try {
      const searchRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=8&addressdetails=1`,
        {
          headers: {
            "User-Agent": "ApnaBazarEcommerce/4.0 (support@apnabazar.in)",
            Accept: "application/json",
            "Accept-Language": "en",
          },
          signal: AbortSignal.timeout(4_000),
        },
      );

      if (searchRes.ok) {
        const results = (await searchRes.json()) as Array<Record<string, unknown>>;
        if (Array.isArray(results)) {
          const mapped = results.slice(0, 8).map((item) => {
            const lat = Number(item.lat);
            const lon = Number(item.lon);
            const coords = validCoordinates(lat, lon);
            const address = (item.address || {}) as Record<string, string>;
            const dist = coords ? calculateDistanceKm(22.2815, 86.7198, coords.lat, coords.lng) : 0;
            return {
              name: String(item.name || String(item.display_name || "").split(",")[0] || "Place"),
              city: address.city || address.town || address.village || address.county || String(item.name || ""),
              state: address.state || "India",
              pincode: address.postcode || "832101",
              coords: coords ? [coords.lat, coords.lng] : [0, 0],
              distanceKm: dist,
              isInside10Km: dist <= 10,
              displayName: String(item.display_name || "").slice(0, 300),
            };
          });
          res.json({ suggestions: mapped });
          return;
        }
      }
    } catch {
      /* return empty suggestions */
    }

    res.json({ suggestions: [] });
  }),
);

app.get(
  "/api/geoip",
  rateLimit({ windowMs: 60_000, max: 60, prefix: "geoip" }),
  asyncHandler(async (req, res) => {
    const rawIp = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
      .split(",")[0]
      .trim();
    const isPublicIp =
      rawIp &&
      !rawIp.startsWith("127.") &&
      !rawIp.startsWith("10.") &&
      !rawIp.startsWith("192.168.") &&
      rawIp !== "::1";

    try {
      const url = isPublicIp ? `https://ipwho.is/${encodeURIComponent(rawIp)}` : `https://ipwho.is/`;
      const ipRes = await fetch(url, { signal: AbortSignal.timeout(1_500) });
      if (ipRes.ok) {
        const data = (await ipRes.json()) as Record<string, unknown>;
        const lat = Number(data.latitude);
        const lon = Number(data.longitude);
        if (!Number.isNaN(lat) && !Number.isNaN(lon) && lat !== 0 && lon !== 0) {
          const dist = calculateDistanceKm(22.2815, 86.7198, lat, lon);
          res.json({
            success: true,
            lat,
            lon,
            city: String(data.city || "Baharagora"),
            state: String(data.region || "Jharkhand"),
            pincode: String(data.postal || (dist <= 10 ? "832101" : "831001")),
            distanceKm: dist,
            isInside10Km: dist <= 10,
          });
          return;
        }
      }
    } catch {
      /* fall through */
    }

    res.json({
      success: true,
      lat: 22.2815,
      lon: 86.7198,
      city: "Baharagora",
      state: "Jharkhand",
      pincode: "832101",
      distanceKm: 0,
      isInside10Km: true,
    });
  }),
);

app.post(
  "/api/check-pincode",
  rateLimit({ windowMs: 60_000, max: 60, prefix: "pincode" }),
  asyncHandler(async (req, res) => {
    const pin = String((req.body as { pincode?: unknown })?.pincode || "").trim();
    if (!isValidPincode(pin)) {
      res.json({ eligible: false, pincode: pin.slice(0, 10), message: "Invalid PIN code." });
      return;
    }

    const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const dateFormatted =
      deliveryDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) +
      " by 7:00 PM (In 3 Days)";

    res.json({
      eligible: true,
      pincode: pin,
      estimatedDays: 3,
      deliveryDate: dateFormatted,
      freeDelivery: true,
      cashOnDelivery: true,
      message: `⚡ Fast 3-Day Doorstep Express Delivery active for PIN ${pin}! Expected by ${dateFormatted}. Cash on Delivery & 5-Day Returns.`,
    });
  }),
);

/* ------------------------------------------------------------------ */
/* SEO, Google Search Console (GSC), Sitemap & LLM Indexing Routes     */
/* ------------------------------------------------------------------ */

function escapeXml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

app.get("/sitemap.xml", (_req, res) => {
  const baseUrl = "https://apkaapnabazar.vercel.app";
  const today = new Date().toISOString().split("T")[0];

  const categoryUrls = CATEGORIES.filter((c) => c.id !== "all")
    .map(
      (cat) => `  <url>
    <loc>${baseUrl}/?category=${encodeURIComponent(cat.id)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.90</priority>
  </url>`,
    )
    .join("\n");

  const productUrls = PRODUCTS.slice(0, 200)
    .map((p) => {
      const imgUrl = p.image?.startsWith("http") ? p.image : `${baseUrl}${p.image || "/logo.png"}`;
      return `  <url>
    <loc>${baseUrl}/?product=${encodeURIComponent(p.id)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(`${p.name} - Apna Bazar Baharagora Shopping Mall`)}</image:title>
      <image:caption>${escapeXml(`${p.name} at ₹${p.price} on Apna Bazar (Apka Apna Bazar), No 1 Shopping Mall in Baharagora, Jharkhand 832101`)}</image:caption>
    </image:image>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/logo.png</image:loc>
      <image:title>Apna Bazar (Apka Apna Bazar) - No 1 Shopping Mall in Baharagora Jharkhand 832101</image:title>
      <image:caption>Apna Bazar Dadu Complex, Baharagora Main Road, Market, Baharagora, Jharkhand 832101</image:caption>
    </image:image>
  </url>
${categoryUrls}
${productUrls}
  <url>
    <loc>${baseUrl}/llms.txt</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(xml);
});

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

app.get(
  "/api/admin/metrics",
  requireAdmin,
  noStore,
  asyncHandler(async (_req, res) => {
    const [orders, users, products, lowStock] = await Promise.all([
      client.execute("SELECT count(*) AS total, COALESCE(sum(total_amount), 0) AS revenue FROM orders"),
      client.execute("SELECT count(*) AS total FROM users"),
      client.execute("SELECT count(*) AS total FROM products"),
      client.execute("SELECT count(*) AS total FROM products WHERE stock <= 5"),
    ]);
    res.json({
      totalOrders: Number(orders.rows[0]?.total || 0),
      totalRevenue: roundMoney(Number(orders.rows[0]?.revenue || 0)),
      totalUsers: Number(users.rows[0]?.total || 0),
      totalProducts: Number(products.rows[0]?.total || 0),
      lowStockProducts: Number(lowStock.rows[0]?.total || 0),
    });
  }),
);

app.patch(
  "/api/admin/orders/:id/status",
  requireAdmin,
  noStore,
  asyncHandler(async (req, res) => {
    const orderId = safeId(req.params.id, 40);
    if (!orderId) throw new HttpError(400, "Invalid order identifier.");
    const status = String((req.body as { status?: unknown })?.status || "");
    const allowed = [
      "placed",
      "confirmed",
      "packing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "return_requested",
      "return_pickup_scheduled",
      "returned",
      "cancelled",
    ];
    if (!allowed.includes(status)) throw new HttpError(400, "Invalid order status.");

    const existing = await loadOrderForUser(orderId, "", true);
    if (!existing) throw new HttpError(404, "Order not found.");

    await client.execute({ sql: "UPDATE orders SET status = ? WHERE id = ?", args: [status, orderId] });
    if (status === "cancelled" && existing.orderStatus !== "cancelled") {
      await restoreOrderStock(existing);
      if (existing.abCoinsUsed && existing.abCoinsUsed > 0 && existing.userId) {
        await client.execute({
          sql: "UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?",
          args: [existing.abCoinsUsed, existing.userId],
        });
        invalidateSessionCache(existing.userId);
      }
      // If was previously delivered, revoke any referral reward awarded
      if (existing.orderStatus === "delivered") {
        if (existing.userId) {
          await client.execute({
            sql: "UPDATE users SET wallet_balance = MAX(0, wallet_balance - 50) WHERE id = ?",
            args: [existing.userId],
          });
          invalidateSessionCache(existing.userId);
        }
        if (existing.appliedCoupon && existing.appliedCoupon.startsWith("AB")) {
          const seed = existing.appliedCoupon.slice(2);
          await client.execute({
            sql: "UPDATE users SET wallet_balance = MAX(0, wallet_balance - 50) WHERE phone LIKE ?",
            args: [`%${seed}`],
          });
        }
      }
    } else if ((status === "returned" || status === "return_pickup_scheduled") && existing.orderStatus === "delivered") {
      // User non-negotiable rule: "return karta hai to use ab coin nahi milaga"
      // Revoke the 50 coins from buyer and referrer to prevent return fraud!
      if (existing.userId) {
        await client.execute({
          sql: "UPDATE users SET wallet_balance = MAX(0, wallet_balance - 50) WHERE id = ?",
          args: [existing.userId],
        });
        invalidateSessionCache(existing.userId);
      }
      if (existing.appliedCoupon && existing.appliedCoupon.startsWith("AB")) {
        const seed = existing.appliedCoupon.slice(2);
        await client.execute({
          sql: "UPDATE users SET wallet_balance = MAX(0, wallet_balance - 50) WHERE phone LIKE ?",
          args: [`%${seed}`],
        });
      }
    } else if (status === "delivered" && existing.orderStatus !== "delivered") {
      // Award 50 AB Coins on successfully delivered order (only when not cancelled/returned)
      if (existing.userId) {
        await client.execute({
          sql: "UPDATE users SET wallet_balance = wallet_balance + 50 WHERE id = ?",
          args: [existing.userId],
        });
        if (existing.appliedCoupon && existing.appliedCoupon.startsWith("AB")) {
          const seed = existing.appliedCoupon.slice(2);
          // Credit referrer only if not self
          await client.execute({
            sql: "UPDATE users SET wallet_balance = wallet_balance + 50 WHERE phone LIKE ? AND id != ?",
            args: [`%${seed}`, existing.userId],
          });
        }
        invalidateSessionCache(existing.userId);
      }
    }
    const updated = await loadOrderForUser(orderId, "", true);
    res.json({ success: true, order: updated });
  }),
);

app.post(
  "/api/admin/products",
  requireAdmin,
  noStore,
  rateLimit({ windowMs: 60 * 60_000, max: 60, prefix: "admin-product" }),
  asyncHandler(async (req, res) => {
    const body = (req.body || {}) as Record<string, unknown>;
    const id = safeId(body.id, 80) || randomId("prd");
    const name = cleanText(body.name, { min: 2, max: 160 });
    const price = Number(body.price);
    const stock = clampInt(body.stock, 0, 1_000_000, 0);
    const category = cleanText(body.category, { max: 40, allowEmpty: true }) || "general";
    const description = cleanText(body.description, { max: 3000, allowEmpty: true }) || "";
    const image = canonicalCatalogImage(isHttpsUrl(body.image) || "");

    if (!name) throw new HttpError(400, "Product name is required.");
    if (!Number.isFinite(price) || price <= 0 || price > 1_000_000) {
      throw new HttpError(400, "Product price is invalid.");
    }
    if (!image) throw new HttpError(400, "A valid HTTPS product image URL is required.");

    const sizes = Array.isArray(body.sizes) ? body.sizes.slice(0, 20).map(String) : [];
    const images = (Array.isArray(body.images) ? body.images.slice(0, 8) : [])
      .map((value) => isHttpsUrl(value) || "")
      .filter(Boolean)
      .map((url) => canonicalCatalogImage(url));
    if (images.length === 0) images.push(image);
    const colors = (Array.isArray(body.colors) ? body.colors.slice(0, 20) : [])
      .filter((color): color is Record<string, unknown> => Boolean(color) && typeof color === "object")
      .map((color) =>
        typeof color.imageUrl === "string"
          ? { ...color, imageUrl: canonicalCatalogImage(color.imageUrl) }
          : color,
      );

    try {
      await client.execute({
        sql: `INSERT INTO products
          (id, name, price, stock, image_url, category, brand, description, original_price, rating, reviews_count, is_best_seller, is_flash_deal, discount_percent, unit, sizes_json, colors_json, images_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          name,
          price,
          stock,
          image,
          category,
          cleanText(body.brand, { max: 80, allowEmpty: true }) || "Apna Bazar",
          description,
          Number(body.originalPrice) || price,
          Number(body.rating) || 4.5,
          Number(body.reviewsCount) || 0,
          body.isBestSeller ? 1 : 0,
          body.isFlashDeal ? 1 : 0,
          clampInt(body.discountPercent, 0, 95, 0),
          cleanText(body.unit, { max: 30, allowEmpty: true }) || "piece",
          JSON.stringify(sizes),
          JSON.stringify(colors),
          JSON.stringify(images),
          Date.now(),
        ],
      });
    } catch {
      throw new HttpError(409, "A product with this identifier already exists.");
    }

    invalidateCatalogCache();
    res.status(201).json({ success: true, id });
  }),
);

/* ------------------------------------------------------------------ */
/* 404 for unmatched API routes                                        */
/* ------------------------------------------------------------------ */

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

/* ------------------------------------------------------------------ */
/* Static app + error handling                                         */
/* ------------------------------------------------------------------ */

async function startServer() {
  try {
    await initDatabase();
    await client.execute("UPDATE users SET wallet_balance = 0 WHERE wallet_balance = 200;");
    console.log("Database initialised.");
  } catch (error) {
    console.error("[db] Initialisation failed:", (error as Error)?.message || error);
  }

  if (!isProduction) {
    // Vite's dev middleware serves files from the project root. Keep secrets,
    // backend source and local databases out of reach when the dev server is
    // exposed on the network (the default host is 0.0.0.0).
    const blockedDevPath =
      /(^\/\.(env|git)(\/|$))|(^\/server\.ts$)|(^\/server-dist(\/|$))|(^\/apnabazar\.db(-wal|-shm|-journal)?$)|(^\/whatsapp_auth(\/|$))|(^\/package(-lock)?\.json$)|(^\/tsconfig[^/]*\.json$)|(^\/drizzle[^/]*$)|(\.map$)/i;
    app.use((req, res, next) => {
      let pathname = req.path;
      try {
        pathname = decodeURIComponent(pathname);
      } catch {
        res.status(400).end();
        return;
      }
      if (pathname.includes("\0") || blockedDevPath.test(pathname)) {
        res.status(404).end();
        return;
      }
      next();
    });

    // High-speed static caching for brand logos, fabric swatches & media assets
    app.use(
      "/assets",
      express.static(path.join(process.cwd(), "public/assets"), {
        maxAge: "30d",
        immutable: true,
        setHeaders: (res) => {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        },
      })
    );

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: { ignored: ["**/whatsapp_auth/**", "**/*.db", "**/*.db-journal", "**/*.db-wal", "**/*.db-shm"] },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use((req, res, next) => {
      // Never expose backend bundles or source maps even if they are misplaced in dist.
      if (/\.map$/i.test(req.path) || /server\.c?js$/i.test(req.path)) {
        res.status(404).end();
        return;
      }
      next();
    });
    app.use(
      express.static(distPath, {
        index: false,
        dotfiles: "deny",
        maxAge: "1h",
        setHeaders: (res, filePath) => {
          const normalized = filePath.split(path.sep).join("/");
          if (normalized.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          } else if (normalized.includes("/assets/")) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else if (/\.(png|jpe?g|webp|avif|svg|ico|woff2?)$/i.test(normalized)) {
            res.setHeader("Cache-Control", "public, max-age=604800");
          } else {
            res.setHeader("Cache-Control", "public, max-age=3600");
          }
        },
      }),
    );
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use(securityErrorHandler);

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Apna Bazar server listening on port ${PORT}`);
    initWhatsApp();
  });

  server.requestTimeout = 30_000;
  server.headersTimeout = 66_000;
  server.keepAliveTimeout = 65_000;
  server.maxHeadersCount = 100;

  const shutdown = (signal: string) => {
    console.log(`[server] ${signal} received, shutting down.`);
    server.close(() => {
      client.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

process.on("unhandledRejection", (reason) => {
  console.error("[server] Unhandled rejection:", String(reason).slice(0, 300));
});

startServer().catch((error) => {
  console.error("[server] Failed to start:", (error as Error)?.message || error);
  process.exit(1);
});
