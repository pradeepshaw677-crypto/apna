import { CartItem, Order, Product, UserProfile } from "../types";
import { AVAILABLE_COUPONS } from "../data/products";
import { formatINR } from "./pricing";

export interface AssistantContext {
  products: Product[];
  orders: Order[];
  cartItems: CartItem[];
  user: UserProfile | null;
}

export interface AssistantReply {
  text: string;
  products?: Product[];
  chips?: string[];
}

const STATUS_LABELS: Record<string, string> = {
  placed: "Order placed",
  confirmed: "Confirmed",
  packing: "Packing",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  return_requested: "Return requested",
  return_pickup_scheduled: "Return pickup scheduled",
  returned: "Returned",
  cancelled: "Cancelled",
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  sarees: [
    "saree",
    "sarees",
    "sari",
    "saris",
    "banarasi",
    "kanjeevaram",
    "organza",
    "georgette",
    "handloom",
    "ethnic",
  ],
  fashion: [
    "shirt",
    "shirts",
    "tshirt",
    "t-shirt",
    "tee",
    "jeans",
    "denim",
    "kurta",
    "kurti",
    "dress",
    "dresses",
    "hoodie",
    "clothing",
    "apparel",
    "fashion",
    "kapda",
    "kapde",
    "suit",
  ],
  footwear: [
    "shoe",
    "shoes",
    "sneaker",
    "sneakers",
    "sandal",
    "sandals",
    "slipper",
    "slippers",
    "chappal",
    "chappals",
    "joota",
    "joote",
    "juta",
    "jute",
    "loafer",
    "loafers",
    "heel",
    "heels",
    "boot",
    "boots",
    "footwear",
  ],
  toys: ["toy", "toys", "khilona", "khilone", "game", "games", "drone", "rc", "puzzle", "blocks", "plush", "teddy"],
  accessories: [
    "watch",
    "watches",
    "ghadi",
    "ghadiya",
    "sunglass",
    "sunglasses",
    "chashma",
    "goggles",
    "wallet",
    "wallets",
    "bag",
    "bags",
    "backpack",
    "belt",
    "accessory",
    "accessories",
  ],
};

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "please",
  "show",
  "give",
  "want",
  "need",
  "some",
  "good",
  "best",
  "kya",
  "koi",
  "mujhe",
  "mera",
  "meri",
  "hai",
  "hain",
  "ka",
  "ki",
  "ke",
  "se",
  "me",
  "mein",
  "par",
  "kar",
  "karo",
  "chahiye",
  "dikhao",
  "batao",
  "price",
  "product",
  "products",
  "kuch",
  "under",
  "below",
  "budget",
  "rupees",
  "rs",
  "inr",
]);

export const BELOW_500 = "Under ₹499";
export const ORDER_STATUS = "Order status";
export const RETURN_POLICY = "Return policy";

export const DEFAULT_CHIPS = ["Best sellers", "Under ₹499", "Sarees", "Order status", "Return policy", "Coupons"];

export function normalizeQuery(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s₹-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

function extractBudget(text: string): number | null {
  const compact = text.replace(/,/g, "");
  const patterns = [
    /(?:under|below|less than|upto|up to|within|budget|kam|se kam|ke andar|se niche|rs|inr|₹)\s*(?:of|is|ke|ka)?\s*(\d{2,7})/i,
    /(\d{2,7})\s*(?:se kam|ke andar|se niche|budget|tak|rs|rupees|rupaye)/i,
  ];
  for (const pattern of patterns) {
    const match = compact.match(pattern);
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isFinite(value) && value >= 50 && value <= 1_000_000) return value;
  }
  return null;
}

function detectCategory(text: string): string | null {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) return category;
  }
  return null;
}

function tokensOf(text: string): string[] {
  return text
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function scoreProduct(product: Product, tokens: string[]): number {
  const name = `${product.name} ${product.hindiName || ""}`.toLowerCase();
  const meta = `${product.brand || ""} ${product.category} ${product.subcategory || ""} ${
    product.description || ""
  }`.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (name.includes(token)) score += 8;
    else if (meta.includes(token)) score += 2;
    if (product.brand && product.brand.toLowerCase().includes(token)) score += 3;
    if (product.subcategory && product.subcategory.toLowerCase().includes(token)) score += 3;
  }
  return score;
}

function rank(products: Product[], mode: "relevance" | "cheap" | "rating" | "deal"): Product[] {
  const list = [...products];
  if (mode === "cheap") return list.sort((a, b) => a.price - b.price);
  if (mode === "rating")
    return list.sort((a, b) => b.rating - a.rating || (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
  if (mode === "deal") return list.sort((a, b) => b.discountPercent - a.discountPercent);
  return list.sort((a, b) => b.rating - a.rating || (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
}

function searchProducts(context: AssistantContext, text: string, budget: number | null, category: string | null): Product[] {
  const tokens = tokensOf(text);
  let list = context.products.length > 0 ? context.products : [];

  if (category) list = list.filter((product) => product.category === category);
  if (budget) {
    const within = list.filter((product) => product.price <= budget);
    if (within.length > 0) list = within;
  }

  const scored = list
    .map((product) => ({ product, score: scoreProduct(product, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating)
    .map((entry) => entry.product);

  if (scored.length > 0) return scored.slice(0, 4);
  if (category || budget) return rank(list, budget ? "cheap" : "rating").slice(0, 4);

  const fallback = list.filter((product) => product.isBestSeller || product.isTrending);
  return rank(fallback.length > 0 ? fallback : list, "rating").slice(0, 4);
}

function personalCategory(context: AssistantContext): string | null {
  const counts = new Map<string, number>();
  const bump = (category: string | undefined) => {
    if (!category) return;
    counts.set(category, (counts.get(category) || 0) + 1);
  };

  for (const item of context.cartItems) bump(item.product?.category);
  for (const order of context.orders.slice(0, 5)) {
    for (const item of order.items || []) bump(item.product?.category);
  }

  let best: string | null = null;
  let bestCount = 0;
  for (const [category, count] of counts) {
    if (count > bestCount) {
      best = category;
      bestCount = count;
    }
  }
  return best;
}

function productIntro(count: number, budget: number | null, category: string | null): string {
  if (count === 0) return "Catalogue abhi load ho raha hai. Ek second baad dobara poochhein ya category ka naam likhein.";
  const parts: string[] = [];
  if (category) parts.push(category);
  if (budget) parts.push(`${formatINR(budget)} ke andar`);
  if (parts.length === 0) return `Ye ${count} options aapke liye best rahenge. Kisi bhi product par tap karke seedha uski page par ja sakte hain.`;
  return `${parts.join(" aur ")} ke liye ye ${count} options mile hain. Product par tap karein to seedha uski detail page khul jayegi.`;
}

function orderReply(context: AssistantContext): AssistantReply {
  if (!context.user) {
    return {
      text: "Order status dekhne ke liye pehle login karein. Login ke baad main aapke latest orders, delivery status aur return window sab bata sakta hoon.",
      chips: ["Login help", "Delivery time", "Return policy"],
    };
  }

  if (context.orders.length === 0) {
    return {
      text: "Aapke account me abhi koi order nahi hai. Order place karne ke baad main yahin se status, delivery OTP aur return window bata dunga.",
      chips: ["Best sellers", "Under ₹499", "How to order"],
    };
  }

  const latest = context.orders.slice(0, 3);
  const lines = latest.map((order) => {
    const count = (order.items || []).reduce((total, item) => total + (item.quantity || 0), 0);
    const status = STATUS_LABELS[order.orderStatus] || order.orderStatus || "Processing";
    return `• ${order.id} — ${status}\n  ${count} item${count === 1 ? "" : "s"} • ${formatINR(order.totalAmount)}`;
  });

  return {
    text: `Aapke latest orders:\n\n${lines.join("\n\n")}\n\nLive tracking aur delivery OTP ke liye "Track Order" kholen.`,
    chips: ["Delivery time", "Return policy", "Contact support"],
  };
}

function couponsReply(): AssistantReply {
  const lines = AVAILABLE_COUPONS.slice(0, 3).map(
    (coupon) => `• ${coupon.code} — ${coupon.description}`,
  );
  return {
    text: `Abhi ye coupons active hain:\n\n${lines.join("\n")}\n\nCoupon code cart ke Offers section ya checkout par apply karein.`,
    chips: ["Under ₹499", "Best sellers", "How to order"],
  };
}

export function greeting(context: AssistantContext): AssistantReply {
  const name = context.user?.name ? context.user.name.split(" ")[0] : "";
  const hello = name ? `Namaste ${name}!` : "Namaste!";
  return {
    text: `${hello} Main Apna Bazar AI hoon. Mujhse products, prices, best deals, delivery, return, coupon aur aapke order ki poori jaankari poochh sakte hain.\n\nAap kya dhoondh rahe hain?`,
    chips: DEFAULT_CHIPS,
  };
}

export function buildAssistantReply(rawInput: string, context: AssistantContext): AssistantReply {
  const text = normalizeQuery(rawInput);
  if (!text) {
    return { text: "Kripya apna sawaal likhein. Main Apna Bazar ke products aur services me madad kar sakta hoon.", chips: DEFAULT_CHIPS };
  }

  const budget = extractBudget(text);
  const category = detectCategory(text);

  if (/^(hi|hii|hello|hey|namaste|namaskar|hlo|salam|good morning|good evening)\b/.test(text)) {
    return greeting(context);
  }

  if (/^(thanks|thank you|thx|dhanyavad|dhanyawad|shukriya)/.test(text)) {
    return {
      text: "Aapka swagat hai. Agar koi aur product ya order help chahiye to bataiye.",
      chips: DEFAULT_CHIPS,
    };
  }

  if (/(login|log in|sign in|signin|otp|google sign|account banao)/.test(text)) {
    return {
      text: "Login karne ke liye website ke top-right Sign In button par tap karein.\n\n• WhatsApp OTP se login: mobile number daalein aur 6-digit OTP verify karein.\n• Google se login: Google button dabayein aur apna account chunen.\n\nLogin ke baad orders, addresses aur tracking sab aapke account me safe rehte hain.",
      chips: ["Order status", "How to order", "Contact support"],
    };
  }

  if (/(cancel|cancellation)/.test(text)) {
    return {
      text: "Order cancel karne ke liye Orders section me order kholen aur Cancel dabayein. Packing/shipping shuru hone se pehle cancel karna sabse aasan hota hai. Cancel hone par eligible refund 3-5 working din me process hota hai.",
      chips: ["Order status", "Contact support", "Return policy"],
    };
  }

  if (/(kaise order|order kaise|how to order|buy kaise|purchase kaise|checkout kaise)/.test(text)) {    return {
      text: "Order karna bahut aasan hai:\n\n1. Product kholen aur size/color chunen.\n2. Add to Cart karein.\n3. Cart me coupon apply karke Checkout kholein.\n4. Address aur payment (COD/UPI/Card) chunen.\n5. Order place karte hi delivery OTP aur tracking mil jayegi.\n\nFree delivery ₹499 se upar hai.",
      chips: ["Best sellers", "Coupons", "Delivery time"],
    };
  }

  if (/(order|orders|track|tracking|parcel|shipment|status|kahan pahuncha|kab aayega)/.test(text)) {
    return orderReply(context);
  }

  if (/(return|refund|wapas|wapasi|exchange|replace|damaged|kharab)/.test(text)) {
    return {
      text: "Return policy:\n\n• Delivery ke 5 din ke andar return request kar sakte hain.\n• Product unused aur original tags ke saath hona chahiye.\n• Return pickup ka OTP aapke phone par aayega.\n• Refund product pickup ke 3-5 working din me process hota hai.\n\nReturn request Orders section se raise karein.",
      chips: ["Order status", "Contact support", "Delivery time"],
    };
  }

  if (/(delivery|deliver|shipping|ship|kitna time|kab tak|express|pincode|pin code|15 minute)/.test(text)) {
    return {
      text: "Delivery information:\n\n• Baharagora area me 15-minute express doorstep delivery.\n• ₹499 se upar free delivery; usse kam par chhoti delivery fee.\n• COD, UPI aur Card available hain.\n• Order place hone ke baad live tracking aur delivery OTP milta hai.\n\nBaharagora (832101) ke bahar service PIN code check karke confirm hoti hai.",
      chips: ["Order status", "Best sellers", "Coupons"],
    };
  }

  if (/(\bpayment\b|\bpay\b|\bcod\b|\bcash\b|\bupi\b|\bcard\b|\bonline\b|net banking)/.test(text)) {
    return {
      text: "Payment options:\n\n• Cash on Delivery (COD)\n• UPI\n• Debit/Credit Card\n\nCard details hamare server par store nahi hote. Payment page secure hota hai aur order confirm hone par invoice milti hai.",
      chips: ["How to order", "Delivery time", "Return policy"],
    };
  }

  if (/(coupon|promo|code|discount|offer|sale|deal|bachat|sasta kaise)/.test(text)) {
    return couponsReply();
  }

  if (/(contact|call|phone|whatsapp|helpline|support|address|\bshop\b|dukan|location|timing|timings|kahan hai)/.test(text)) {
    return {
      text: "Apna Bazar support:\n\n• Phone / WhatsApp: +91 9999999999\n• Timing: Monday se Sunday, 8 AM - 10 PM\n• Address: Apna Bazar Express Hub, Dadu Complex, Shitla Mandir ke paas, Baharagora, Jharkhand - 832101\n\nWebsite ke floating call ya WhatsApp button se seedha connect kar sakte hain.",
      chips: ["Delivery time", "Return policy", "Order status"],
    };
  }

  if (/(secure|security|safe|privacy|data|hack|otp safe)/.test(text)) {
    return {
      text: "Apna Bazar aapki privacy aur security ko priority deta hai:\n\n• Login HttpOnly secure session se hota hai.\n• OTP aur card details kabhi chat me share na karein.\n• Payment card data hamare server par save nahi hota.\n• Har order par delivery OTP verification hoti hai.\n\nKoi suspicious activity lage to turant +91 9999999999 par call karein.",
      chips: ["Contact support", "How to order", "Order status"],
    };
  }

  if (/(\bsize\b|\bfit\b|chart|measurement)/.test(text)) {
    return {
      text: "Size guide:\n\n• Clothing me S, M, L, XL, XXL available hote hain.\n• Footwear UK 6 se UK 11 tak milte hain.\n• Product page par size chart aur available sizes diye hote hain.\n• Fit na aaye to 5-din return policy ke andar exchange/return kar sakte hain.",
      chips: ["Footwear", "Fashion", "Return policy"],
    };
  }

  if (/(gift|birthday|shaadi|wedding|festival|diwali|present)/.test(text)) {
    const picks = rank(
      context.products.filter((product) => product.isBestSeller || product.category === "accessories" || product.category === "toys"),
      "rating",
    ).slice(0, 4);
    return {
      text: picks.length > 0
        ? "Gift ke liye ye popular options rahenge. Budget ke hisaab se accessories, watches aur toys sabse zyada pasand kiye jaate hain."
        : "Catalogue abhi load ho raha hai. Ek second baad dobara poochhein, main gift ke liye best options bata dunga.",
      products: picks,
      chips: ["Under ₹499", "Accessories", "Toys"],
    };
  }

  if (/(best|top|popular|trending|bestseller|recommend|suggest|kya lu|kya le|kya kharidu|achha)/.test(text)) {
    const preferred = personalCategory(context);
    let pool = context.products.filter((product) => product.isBestSeller || product.isTrending);
    if (category) pool = context.products.filter((product) => product.category === category);
    else if (preferred) {
      const personal = pool.filter((product) => product.category === preferred);
      if (personal.length >= 2) pool = personal;
    }
    if (budget) {
      const within = pool.filter((product) => product.price <= budget);
      if (within.length > 0) pool = within;
    }
    const picks = rank(pool.length > 0 ? pool : context.products, budget ? "cheap" : "rating").slice(0, 4);
    return {
      text:
        preferred && !category
          ? `Aapke orders aur cart ke hisaab se ${preferred} category me ye products sabse achhe rahenge.`
          : productIntro(picks.length, budget, category),
      products: picks,
      chips: ["Under ₹499", "Best sellers", "Coupons"],
    };
  }

  const mode = /(sasta|cheap|low price|kam price|budget)/.test(text)
    ? "cheap"
    : /(deal|discount|offer)/.test(text)
      ? "deal"
      : "relevance";

  const matches = searchProducts(context, text, budget, category);
  if (matches.length === 0) {
    return {
      text: context.products.length === 0
        ? "Catalogue abhi load ho raha hai. Ek second baad dobara poochhein ya category ka naam likhein."
        : "Is query se koi exact product nahi mila. Aap category, budget ya product ka naam likh kar dobara poochh sakte hain.",
      chips: DEFAULT_CHIPS,
    };
  }

  if (mode !== "relevance") {
    const reranked = rank(matches, mode);
    return {
      text: productIntro(reranked.length, budget, category),
      products: reranked,
      chips: ["Under ₹499", "Best sellers", "Coupons"],
    };
  }

  const current = matches.filter((product) => product.inStock);
  const finalPicks = current.length > 0 ? current : matches;
  return {
    text: budget
      ? `Aapke budget ${formatINR(budget)} me ye options mile hain. Product par tap karke seedha uski page par ja sakte hain.`
      : productIntro(finalPicks.length, budget, category),
    products: finalPicks,
    chips: ["Under ₹499", "Best sellers", "Delivery time"],
  };
}
