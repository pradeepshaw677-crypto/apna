import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Rotate3d,
  RefreshCw,
  ZoomIn,
  Star,
  Ruler,
  MapPin,
  ShoppingBag,
  Zap,
  X,
  RotateCcw,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  Coins,
  Eye,
} from 'lucide-react';
import {
  HIGGS_MODELS_SPRITE,
  HIGGS_PIECES_SPRITE,
  RUNWAY_LOOKS,
  RUNWAY_ALL_PIECES,
} from '../data/runway3dData';
import { Product } from '../types';
import { getSizePriceDelta, formatINR } from '../utils/pricing';
import { api } from '../utils/api';
import { getCloudinaryUrl } from '../utils/cloudinary';

interface Runway3DStudioProps {
  onAddToCart: (product: Product, size?: string, color?: string, priceOverride?: number) => void;
  onBuyNow: (product: Product, size?: string, color?: string, priceOverride?: number) => void;
  onToggleWishlist?: (productId: string) => void;
  wishlistIds?: string[];
  cartCount?: number;
  onOpenCart?: () => void;
  pincode?: string;
}

const TOTAL_LOOKS = RUNWAY_LOOKS.length;
const TOTAL_PIECES = RUNWAY_ALL_PIECES.length;
const AUTO_RESUME_DELAY_MS = 2000;

const DEPTH_X = [1.18, 0.74, 0.38, 0.14, -0.05, -0.18, -0.28];
const DEPTH_Y = [0.99, 0.98, 0.91, 0.84, 0.78, 0.72, 0.68];
const DEPTH_SCALE = [0.98, 0.94, 0.68, 0.48, 0.32, 0.20, 0.14];
// 100% HD crystal-clear models — zero blur at all positions
const DEPTH_BLUR = [0, 0, 0, 0, 0, 0, 0];
const DEPTH_OPACITY = [0, 1, 0.92, 0.65, 0, 0, 0];

const DB_ASSETS_CACHE_KEY = 'ab_runway_3d_db_assets_v2';

function wrapMod(val: number, max: number): number {
  return ((val % max) + max) % max;
}

function interpolateCurve(arr: number[], offset: number): number {
  const clamped = Math.max(0, Math.min(arr.length - 1.0001, offset + 1));
  const idx = Math.floor(clamped);
  const frac = clamped - idx;
  return arr[idx] + (arr[idx + 1] - arr[idx]) * frac;
}

/**
 * Strips broken Cloudinary `/image/fetch/` wrappers if present, keeping genuine
 * `/image/upload/` Cloudinary URLs or falling back to local `/assets/runway/` and direct CDN URLs.
 */
function sanitizeRunwayUrl(url: string | undefined, fallback: string): string {
  if (!url) return fallback;
  if (url.includes('/image/fetch/')) return fallback;
  return url;
}

function resolveModelUrl(look: any, dbAssets: Record<string, string>): string {
  const localSprite = '/assets/runway/models_sprite.webp';
  const localSolo = `/assets/runway/look_${String(look.lookNumber).padStart(2, '0')}.png`;
  const defaultUrl = look.sourceType === 'higgs_models' ? localSprite : localSolo;

  const fromDb =
    dbAssets[`look_${look.lookNumber}`] ||
    (look.sourceType === 'higgs_models' ? dbAssets.sprite_models : '');

  if (fromDb && fromDb.includes('res.cloudinary.com') && fromDb.includes('/image/upload/')) {
    return getCloudinaryUrl(fromDb, { width: 1400, quality: 'auto:good' }) || defaultUrl;
  }
  return sanitizeRunwayUrl(defaultUrl, look.soloImageUrl || HIGGS_MODELS_SPRITE);
}

function resolvePieceUrl(piece: any, dbAssets: Record<string, string>): string {
  const localSprite = '/assets/runway/pieces_sprite.webp';
  const localSolo = `/assets/runway/look_${String(piece.lookNumber).padStart(2, '0')}.png`;
  const defaultUrl = piece.sourceType === 'higgs_pieces' ? localSprite : localSolo;

  const fromDb =
    dbAssets[`piece_${piece.id}`] ||
    (piece.sourceType === 'higgs_pieces' ? dbAssets.sprite_pieces : '');

  if (fromDb && fromDb.includes('res.cloudinary.com') && fromDb.includes('/image/upload/')) {
    return getCloudinaryUrl(fromDb, { width: 1200, quality: 'auto:good' }) || defaultUrl;
  }
  return sanitizeRunwayUrl(defaultUrl, piece.soloImageUrl || HIGGS_PIECES_SPRITE);
}

/**
 * Generates a standalone thumbnail URL for Apna Bazar's CartDrawer, CartToast, and CheckoutModal.
 */
function getPieceThumbnailUrl(piece: any, dbAssets: Record<string, string>): string {
  const resolvedUrl = resolvePieceUrl(piece, dbAssets);
  if (piece.sourceType === 'higgs_pieces') {
    const [x1, x2, y1, y2] = piece.cropBox;
    const w = x2 - x1;
    const h = y2 - y1;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x1} ${y1} ${w} ${h}" width="400" height="500"><image href="${resolvedUrl.replace(/&/g, '&amp;')}" width="960" height="720"/></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
  return (
    resolvedUrl ||
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
  );
}

/**
 * Converts a 3D Runway Piece into a full Apna Bazar Product object
 * backed by the Database / Cloudinary image URL.
 */
function convertPieceToApnaBazarProduct(
  piece: any,
  dbAssets: Record<string, string>
): Product {
  const discountPercent =
    piece.mrpNumeric > piece.priceNumeric
      ? Math.round(((piece.mrpNumeric - piece.priceNumeric) / piece.mrpNumeric) * 100)
      : 40;
  const imgUrl = getPieceThumbnailUrl(piece, dbAssets);

  return {
    id: `runway-3d-piece-${piece.id}`,
    name: piece.name,
    hindiName: `${piece.category} • Look ${String(piece.lookNumber).padStart(2, '0')}`,
    brand: 'Apna Bazar 3D Couture',
    category: 'fashion',
    subcategory: piece.category || 'Luxury Couture',
    price: piece.priceNumeric,
    originalPrice: piece.mrpNumeric,
    discountPercent,
    rating: piece.rating || 4.8,
    reviewsCount: piece.reviewsCount || 180,
    image: imgUrl,
    images: [imgUrl],
    inStock: true,
    stockCount: 15,
    deliveryDays: 2,
    isPlusFreeDelivery: true,
    isBestSeller: true,
    sizes: piece.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: (piece.colors || []).map((c: any, idx: number) => ({
      name: c.name,
      hex: c.hex,
      imageIndex: idx,
    })),
    description: piece.description || piece.subtitle,
    highlights: [
      `Fabric: ${piece.fabric}`,
      `Fit & Silhouette: ${piece.fit}`,
      `Occasion: ${piece.occasion}`,
      `Care: ${piece.care}`,
    ],
    specifications: [
      { label: 'Fabric', value: piece.fabric || 'Pure Silk & Artisan Weave' },
      { label: 'Pattern', value: piece.pattern || 'Hand-Finished Couture' },
      { label: 'Fit', value: piece.fit || 'Tailored Fit' },
      { label: 'Occasion', value: piece.occasion || 'Festive & Wedding' },
      { label: 'Care', value: piece.care || 'Dry Clean Only' },
      { label: 'Origin', value: 'Apna Bazar Couture Studio — India' },
    ],
  };
}

const RunwayModelSprite: React.FC<{
  look: any;
  dbAssets: Record<string, string>;
  className?: string;
}> = ({ look, dbAssets, className = 'w-full h-full' }) => {
  const resolvedUrl = resolveModelUrl(look, dbAssets);

  if (look.sourceType === 'higgs_models') {
    const [x1, x2, y1, y2] = look.modelBox;
    const w = x2 - x1;
    const h = y2 - y1;
    return (
      <svg
        viewBox={`${x1} ${y1} ${w} ${h}`}
        preserveAspectRatio="xMidYMax meet"
        aria-hidden="true"
        overflow="hidden"
        className={`${className} w-full h-full block select-none pointer-events-none overflow-hidden`}
      >
        <svg
          x={x1}
          y={y1}
          width={w}
          height={h}
          viewBox={`${x1} ${y1} ${w} ${h}`}
          overflow="hidden"
          style={{ overflow: 'hidden' }}
        >
          <image href={resolvedUrl} width={960} height={540} />
        </svg>
      </svg>
    );
  }
  return (
    <img
      src={resolvedUrl}
      alt={`Look ${look.lookNumber} — ${look.title}`}
      decoding="async"
      loading="eager"
      draggable={false}
      onError={(e) => {
        const img = e.currentTarget;
        if (look.soloImageUrl && img.src !== look.soloImageUrl) {
          img.src = look.soloImageUrl;
        }
      }}
      className={`${className} w-full h-full object-contain object-bottom select-none pointer-events-none block`}
    />
  );
};

/**
 * Renders a 3D Couture Piece with strict nested SVG viewport clipping (so adjacent spritesheet
 * garments or model head/feet never bleed in as "double-double") and without SVG `<mask id>` collisions.
 */
const RunwayPieceSprite: React.FC<{
  piece: any;
  dbAssets: Record<string, string>;
  colorFilter?: string;
  neckCapColor?: string;
  className?: string;
}> = ({
  piece,
  dbAssets,
  colorFilter = 'none',
  neckCapColor = '#f4f7fb',
  className = 'w-full h-full',
}) => {
  const resolvedUrl = resolvePieceUrl(piece, dbAssets);
  const filterStyle = colorFilter && colorFilter !== 'none' ? { filter: colorFilter } : undefined;

  if (piece.sourceType === 'higgs_pieces') {
    const [x1, x2, y1, y2] = piece.cropBox;
    const w = x2 - x1;
    const h = y2 - y1;
    return (
      <svg
        viewBox={`${x1} ${y1} ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        overflow="hidden"
        style={filterStyle}
        className={`${className} w-full h-full max-w-full max-h-full block select-none pointer-events-none transition-all duration-200 overflow-hidden`}
      >
        <svg
          x={x1}
          y={y1}
          width={w}
          height={h}
          viewBox={`${x1} ${y1} ${w} ${h}`}
          overflow="hidden"
          style={{ overflow: 'hidden' }}
        >
          <image href={resolvedUrl} width={960} height={720} />
        </svg>
      </svg>
    );
  }

  const [cx1, cx2, cy1, cy2] = piece.cropBox;
  const vx = Math.round(cx1 * 720);
  const vy = Math.round(cy1 * 810);
  const vw = Math.max(10, Math.round((cx2 - cx1) * 720));
  const vh = Math.max(10, Math.round((cy2 - cy1) * 810));

  return (
    <svg
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      preserveAspectRatio="xMidYMid meet"
      aria-label={piece.name}
      overflow="hidden"
      style={filterStyle}
      className={`${className} w-full h-full max-w-full max-h-full block select-none pointer-events-none transition-all duration-200 overflow-hidden`}
    >
      <svg
        x={vx}
        y={vy}
        width={vw}
        height={vh}
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        overflow="hidden"
        style={{ overflow: 'hidden' }}
      >
        <image href={resolvedUrl} width={720} height={810} />
        {piece.maskNeckline && (
          <ellipse
            cx={360}
            cy={vy}
            rx={Math.round(vw * 0.16)}
            ry={Math.round(vh * 0.065)}
            fill={neckCapColor}
          />
        )}
      </svg>
    </svg>
  );
};

export const Runway3DStudio: React.FC<Runway3DStudioProps> = ({
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds = [],
  cartCount = 0,
  onOpenCart,
  pincode = '832101',
}) => {
  const [dbAssets, setDbAssets] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem(DB_ASSETS_CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [activeLookNumber, setActiveLookNumber] = useState<number>(1);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);

  // 3D 360° Spin Studio state
  const [spinAngle, setSpinAngle] = useState<number>(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(true);
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Apna Bazar Product & Checkout section state (underneath 3D spin viewer)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [isFullDetailsOpen, setIsFullDetailsOpen] = useState<boolean>(false);
  const [pincodeInput, setPincodeInput] = useState<string>(pincode || '832101');
  const [isCheckingPin, setIsCheckingPin] = useState<boolean>(false);
  const [pincodeResult, setPincodeResult] = useState<{
    serviceable: boolean;
    message: string;
  } | null>({
    serviceable: true,
    message: 'Express Delivery available by Tomorrow • Cash on Delivery & UPI active',
  });

  // Runway DOM refs & physics refs
  const runwayRef = useRef<HTMLElement | null>(null);
  const stripRef = useRef<HTMLElement | null>(null);
  const modelNodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const pieceNodesRef = useRef<(HTMLDivElement | null)[]>([]);

  const currentPosRef = useRef<number>(0);
  const targetPosRef = useRef<number>(0);
  const isDraggingRunwayRef = useRef<boolean>(false);
  const didMoveRunwayRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartPosRef = useRef<number>(0);
  const lastPointerXRef = useRef<number>(0);
  const lastPointerTimeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const lastInteractionTimeRef = useRef<number>(-10000);
  const isModalOpenRef = useRef<boolean>(false);

  // 3D 360° Spin drag refs
  const isDraggingSpinRef = useRef<boolean>(false);
  const spinDragStartXRef = useRef<number>(0);
  const spinStartAngleRef = useRef<number>(0);

  // Fetch Cloudinary URLs from the database (`/api/runway-3d-assets`) & preload all PNGs
  useEffect(() => {
    let mounted = true;
    api
      .getRunway3DAssets()
      .then((assets) => {
        if (!mounted || !assets || Object.keys(assets).length === 0) return;
        setDbAssets(assets);
        try {
          localStorage.setItem(DB_ASSETS_CACHE_KEY, JSON.stringify(assets));
        } catch {}
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Preload spritesheets and solo model PNGs so clicking any model shows the product image with 0ms lag
  useEffect(() => {
    const urlsToPreload = new Set<string>([
      resolveModelUrl({ lookNumber: 1, sourceType: 'higgs_models' }, dbAssets),
      resolvePieceUrl({ id: 0, sourceType: 'higgs_pieces' }, dbAssets),
    ]);
    for (const look of RUNWAY_LOOKS as any[]) {
      const u = resolveModelUrl(look, dbAssets);
      if (u) urlsToPreload.add(u);
    }
    for (const url of urlsToPreload) {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    }
  }, [dbAssets]);

  useEffect(() => {
    isModalOpenRef.current = selectedPieceId !== null;
  }, [selectedPieceId]);

  useEffect(() => {
    if (pincode) setPincodeInput(pincode);
  }, [pincode]);

  // 3D 360° auto-rotation loop when modal is open
  useEffect(() => {
    if (selectedPieceId === null || !isAutoSpinning) return;
    let rafId = 0;
    let prevTime = performance.now();
    const tick = (now: number) => {
      const dt = now - prevTime;
      prevTime = now;
      if (!isDraggingSpinRef.current) {
        setSpinAngle((prev) => (prev + dt * 0.036) % 360);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [selectedPieceId, isAutoSpinning]);

  const openPieceIn3DStudio = useCallback((pieceIndex: number) => {
    const normalizedIdx = wrapMod(pieceIndex, TOTAL_PIECES);
    setSelectedPieceId(normalizedIdx);
    setSelectedSize('M');
    setSelectedColorIndex(0);
    setSpinAngle(14);
    setIsAutoSpinning(true);
    setZoomScale(1);
    setIsSizeGuideOpen(false);
    setIsFullDetailsOpen(false);
  }, []);

  // Main 60fps 3D Runway & Bottom Product Strip loop
  useEffect(() => {
    let rafId = 0;
    let prevTime = performance.now();

    const animateRunway = (now: number) => {
      const dt = Math.min(60, now - prevTime);
      prevTime = now;

      const timeSinceInteract = now - lastInteractionTimeRef.current;
      if (
        !isDraggingRunwayRef.current &&
        !isModalOpenRef.current &&
        timeSinceInteract >= AUTO_RESUME_DELAY_MS
      ) {
        targetPosRef.current += (dt / 1000) * 0.38;
      }

      const smoothing = 1 - Math.pow(0.0005, dt / 1000);
      currentPosRef.current += (targetPosRef.current - currentPosRef.current) * smoothing;
      const pos = currentPosRef.current;

      const stageEl = runwayRef.current;
      if (stageEl && stageEl.clientWidth > 0) {
        const cw = stageEl.clientWidth;
        const ch = stageEl.clientHeight;
        // Taller full-height runway models (96% of stage height)
        const baseH = ch * 0.96;
        const baseW = (960 / 1080) * baseH;

        for (let i = 0; i < TOTAL_LOOKS; i++) {
          const node = modelNodesRef.current[i];
          if (!node) continue;

          let rel = wrapMod(i - pos, TOTAL_LOOKS);
          if (rel > TOTAL_LOOKS - 1.15) rel -= TOTAL_LOOKS;

          if (rel < -0.55 || rel > 3.2) {
            node.style.opacity = '0';
            node.style.pointerEvents = 'none';
            node.style.transform = 'translate3d(-9999px, 0, 0) scale(0.01)';
            continue;
          }

          const scale = interpolateCurve(DEPTH_SCALE, rel);
          const xPx = interpolateCurve(DEPTH_X, rel) * cw;
          const yPx = interpolateCurve(DEPTH_Y, rel) * ch;
          const blur = interpolateCurve(DEPTH_BLUR, rel);
          const opacity = Math.max(0, Math.min(1, interpolateCurve(DEPTH_OPACITY, rel)));

          const tx = xPx - (baseW * scale) / 2;
          const ty = yPx - baseH * scale;

          node.style.width = `${baseW}px`;
          node.style.height = `${baseH}px`;
          node.style.opacity = opacity.toFixed(3);
          node.style.zIndex = String(Math.max(1, Math.min(20, Math.round(20 - rel * 4))));
          node.style.pointerEvents =
            opacity > 0.3 && rel >= -0.25 && rel <= 2.6 ? 'auto' : 'none';
          node.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : 'none';
          node.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
        }
      }

      const stripEl = stripRef.current;
      if (stripEl && stripEl.clientWidth > 0) {
        const sw = stripEl.clientWidth;
        const sh = stripEl.clientHeight;
        const cardW = Math.min(184, Math.max(142, sw * 0.41));
        const cardH = Math.max(154, sh - 18);
        const stepW = cardW + 12;
        const totalStripW = TOTAL_PIECES * stepW;

        const lookFloat = wrapMod(pos, TOTAL_LOOKS);
        const lookIdx = Math.floor(lookFloat);
        const nextLookIdx = (lookIdx + 1) % TOTAL_LOOKS;
        const lookFrac = lookFloat - lookIdx;

        const startPieceIdx = RUNWAY_LOOKS[lookIdx].firstPieceIndex;
        const nextPieceIdx =
          nextLookIdx === 0 ? TOTAL_PIECES : RUNWAY_LOOKS[nextLookIdx].firstPieceIndex;
        const scrollPx = wrapMod(
          (startPieceIdx + (nextPieceIdx - startPieceIdx) * lookFrac) * stepW,
          totalStripW
        );

        for (let p = 0; p < TOTAL_PIECES; p++) {
          const cardNode = pieceNodesRef.current[p];
          if (!cardNode) continue;

          let x = p * stepW - scrollPx + 12;
          if (x < -stepW * 2) x += totalStripW;
          if (x > totalStripW - stepW * 2) x -= totalStripW;

          cardNode.style.width = `${cardW}px`;
          cardNode.style.height = `${cardH}px`;

          if (x < -cardW - 40 || x > sw + 40) {
            cardNode.style.opacity = '0';
            cardNode.style.pointerEvents = 'none';
            cardNode.style.transform = 'translate3d(-9999px, 0, 0)';
          } else {
            cardNode.style.opacity = '1';
            cardNode.style.pointerEvents = 'auto';
            cardNode.style.transform = `translate3d(${x.toFixed(1)}px, 9px, 0)`;
          }
        }
      }

      const frontLookNum = wrapMod(Math.round(pos), TOTAL_LOOKS) + 1;
      setActiveLookNumber((prev) => (prev === frontLookNum ? prev : frontLookNum));

      rafId = requestAnimationFrame(animateRunway);
    };

    rafId = requestAnimationFrame(animateRunway);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpenRef.current) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        lastInteractionTimeRef.current = performance.now();
        targetPosRef.current = Math.round(targetPosRef.current) + 1;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        lastInteractionTimeRef.current = performance.now();
        targetPosRef.current = Math.round(targetPosRef.current) - 1;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleRunwayPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const now = performance.now();
    lastInteractionTimeRef.current = now;
    isDraggingRunwayRef.current = true;
    didMoveRunwayRef.current = false;
    dragStartXRef.current = e.clientX;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = now;
    velocityRef.current = 0;
    targetPosRef.current = currentPosRef.current;
    dragStartPosRef.current = currentPosRef.current;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handleRunwayPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!isDraggingRunwayRef.current) return;
    const now = performance.now();
    lastInteractionTimeRef.current = now;
    const dt = Math.max(1, now - lastPointerTimeRef.current);
    const dx = e.clientX - lastPointerXRef.current;
    velocityRef.current = dx / dt;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = now;

    const totalDx = e.clientX - dragStartXRef.current;
    if (Math.abs(totalDx) > 6) {
      didMoveRunwayRef.current = true;
    }
    const dragSensitivity = Math.max(180, window.innerWidth * 0.26);
    targetPosRef.current = dragStartPosRef.current - totalDx / dragSensitivity;
  };

  const handleRunwayPointerUp = () => {
    if (isDraggingRunwayRef.current) {
      isDraggingRunwayRef.current = false;
      lastInteractionTimeRef.current = performance.now();
      if (didMoveRunwayRef.current) {
        const momentum = Math.max(-2.5, Math.min(2.5, -velocityRef.current * 0.85));
        targetPosRef.current = Math.round(targetPosRef.current + momentum);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLElement>) => {
    lastInteractionTimeRef.current = performance.now();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    targetPosRef.current += delta * 0.0025;
  };

  const handleModelClick = (lookIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (didMoveRunwayRef.current) return;
    let rel = wrapMod(lookIdx - currentPosRef.current, TOTAL_LOOKS);
    if (rel > TOTAL_LOOKS - 1.15) rel -= TOTAL_LOOKS;
    const firstPiece = RUNWAY_LOOKS[lookIdx]?.firstPieceIndex ?? 0;
    if (Math.abs(rel) < 0.65) {
      openPieceIn3DStudio(firstPiece);
    } else if (rel > 0) {
      lastInteractionTimeRef.current = performance.now();
      targetPosRef.current = currentPosRef.current + rel;
      openPieceIn3DStudio(firstPiece);
    }
  };

  const handlePieceCardClick = (pieceId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!didMoveRunwayRef.current) {
      openPieceIn3DStudio(pieceId);
    }
  };

  const handleCheckPincode = async () => {
    const cleanPin = pincodeInput.replace(/\D/g, '').slice(0, 6);
    setPincodeInput(cleanPin);
    if (cleanPin.length !== 6) {
      setPincodeResult({
        serviceable: false,
        message: 'Please enter a valid 6-digit Pincode (e.g. 832101)',
      });
      return;
    }
    setIsCheckingPin(true);
    try {
      const res = await api.checkPincode(cleanPin);
      setPincodeResult({
        serviceable: (res as any).serviceable ?? (res as any).isServiceable ?? true,
        message: res.message || `✓ Express Delivery to ${cleanPin} by Tomorrow`,
      });
    } catch {
      setPincodeResult({
        serviceable: true,
        message: `✓ Express Delivery to ${cleanPin} by Tomorrow • Free COD & UPI`,
      });
    } finally {
      setIsCheckingPin(false);
    }
  };

  const activeLook = RUNWAY_LOOKS[activeLookNumber - 1] || RUNWAY_LOOKS[0];
  const activePiece =
    selectedPieceId === null ? null : RUNWAY_ALL_PIECES[selectedPieceId] || RUNWAY_ALL_PIECES[0];
  const activePieceLook = activePiece
    ? RUNWAY_LOOKS.find((l: any) => l.lookNumber === activePiece.lookNumber) || RUNWAY_LOOKS[0]
    : null;
  const siblingPieces = activePieceLook
    ? activePieceLook.pieceIds.map((id: number) => RUNWAY_ALL_PIECES[id])
    : [];
  const activeColorObj = activePiece
    ? activePiece.colors[selectedColorIndex] || activePiece.colors[0]
    : null;
  const normalizedAngle = Math.round(((spinAngle % 360) + 360) % 360);

  // Convert activePiece to Apna Bazar Product backed by DB/Cloudinary URL
  const activeApnaProduct = activePiece
    ? convertPieceToApnaBazarProduct(activePiece, dbAssets)
    : null;
  const sizeDelta = getSizePriceDelta(selectedSize);
  const currentPrice = activeApnaProduct ? Math.max(49, activeApnaProduct.price + sizeDelta) : 0;
  const currentOriginalPrice = activeApnaProduct
    ? Math.max(currentPrice, activeApnaProduct.originalPrice + sizeDelta)
    : 0;
  const savingsAmount = Math.max(0, currentOriginalPrice - currentPrice);
  const isActivePieceWishlisted = activeApnaProduct
    ? wishlistIds.includes(activeApnaProduct.id)
    : false;

  return (
    <div
      className="w-full h-[calc(100dvh-76px)] sm:h-[calc(100dvh-64px)] min-h-[620px] sm:min-h-[720px] max-h-[960px] bg-[#f1f5fa] overflow-hidden relative z-0 isolate"
      style={{ isolation: 'isolate', contain: 'layout paint' }}
    >
      {/* ===================================================================== */}
      {/* MAIN 3D RUNWAY STAGE + 40-PIECE SLIDING STRIP (STRICTLY CONTAINED)    */}
      {/* ===================================================================== */}
      <main
        onWheel={handleWheel}
        className="w-full h-full p-2 sm:p-3.5 flex flex-col gap-2 sm:gap-2.5 overflow-hidden select-none relative z-0 isolate"
      >
        {/* Top 20-Model 3D Runway Stage */}
        <section
          ref={runwayRef}
          onPointerDown={handleRunwayPointerDown}
          onPointerMove={handleRunwayPointerMove}
          onPointerUp={handleRunwayPointerUp}
          onPointerCancel={handleRunwayPointerUp}
          aria-label="20 Runway Models — Auto Running & Slide Left or Right"
          className="relative z-0 isolate flex-1 min-h-0 w-full rounded-[26px] sm:rounded-[30px] bg-[radial-gradient(110%_90%_at_75%_24%,#ffffff_0%,#eef3f9_58%,#dfe7f2_100%)] overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
          style={{
            isolation: 'isolate',
            contain: 'layout paint',
            clipPath: 'inset(0 round 26px)',
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[12%] bottom-[3%] w-56 h-12 rounded-full blur-2xl transition-colors duration-500 opacity-35 z-0"
            style={{ backgroundColor: activeLook.accentHex }}
          />
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {RUNWAY_LOOKS.map((look: any, idx: number) => (
              <div
                key={look.lookNumber}
                ref={(el) => {
                  modelNodesRef.current[idx] = el;
                }}
                onClick={(e) => handleModelClick(idx, e)}
                className="absolute top-0 left-0 origin-top-left cursor-pointer"
              >
                <RunwayModelSprite look={look} dbAssets={dbAssets} className="w-full h-full" />
              </div>
            ))}
          </div>
          <div className="absolute left-3 bottom-3 z-25 bg-white/92 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-xs pointer-events-none border border-slate-200/60">
            <div className="font-['Michroma',sans-serif] text-sm sm:text-lg tracking-[0.14em] uppercase text-slate-900 tabular-nums font-black">
              LOOK {String(activeLookNumber).padStart(2, '0')}
            </div>
          </div>
        </section>

        {/* Bottom Sliding Row of 40 Couture Pieces */}
        <aside
          ref={stripRef}
          onPointerDown={handleRunwayPointerDown}
          onPointerMove={handleRunwayPointerMove}
          onPointerUp={handleRunwayPointerUp}
          onPointerCancel={handleRunwayPointerUp}
          aria-label="Model Products — Left Right Sliding Row"
          className="relative z-0 isolate h-[176px] sm:h-[206px] shrink-0 w-full rounded-[24px] sm:rounded-[28px] bg-[#e9eff6] overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
          style={{
            isolation: 'isolate',
            contain: 'layout paint',
            clipPath: 'inset(0 round 24px)',
          }}
        >
          {RUNWAY_ALL_PIECES.map((piece: any, idx: number) => {
            const isFrontLook = piece.lookNumber === activeLookNumber;
            const prodId = `runway-3d-piece-${piece.id}`;
            const isWishlisted = wishlistIds.includes(prodId);

            return (
              <div
                key={piece.id}
                ref={(el) => {
                  pieceNodesRef.current[idx] = el;
                }}
                onClick={(e) => handlePieceCardClick(piece.id, e)}
                className={`absolute top-0 left-0 rounded-[20px] p-2 flex flex-col justify-between cursor-pointer transition-shadow ${
                  isFrontLook
                    ? 'bg-white ring-2 ring-slate-900 shadow-md z-10'
                    : 'bg-white/92 hover:bg-white shadow-xs z-5'
                }`}
              >
                <div className="relative h-[102px] sm:h-[124px] shrink-0 w-full rounded-xl bg-[#f4f7fb] p-1.5 flex items-center justify-center overflow-hidden">
                  <RunwayPieceSprite
                    piece={piece}
                    dbAssets={dbAssets}
                    neckCapColor="#f4f7fb"
                    className="w-full h-full"
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist?.(prodId);
                    }}
                    aria-label="Wishlist"
                    className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-white/95 flex items-center justify-center shadow-2xs transition-transform active:scale-75 cursor-pointer z-10"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const apnaProd = convertPieceToApnaBazarProduct(piece, dbAssets);
                      onAddToCart(
                        apnaProd,
                        'M',
                        piece.colors?.[0]?.name || 'Original',
                        piece.priceNumeric
                      );
                    }}
                    aria-label="Quick add to Apna Bazar cart"
                    className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs transition-transform active:scale-75 cursor-pointer z-10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="px-1 pt-1">
                  <p className="text-[11px] font-bold text-slate-900 truncate">{piece.name}</p>
                  <div className="flex items-center justify-between text-[11px] mt-0.5 tabular-nums">
                    <span className="font-bold text-slate-900">{piece.price}</span>
                    <span className="text-[10px] font-semibold text-emerald-700">
                      {piece.discountLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </aside>
      </main>

      {/* ===================================================================== */}
      {/* 3D 360° SPIN VIEWER AT TOP + APNA BAZAR CHECKOUT FLOW UNDERNEATH      */}
      {/* Rendered via Portal at z-[75] so it never collides with page elements */}
      {/* ===================================================================== */}
      {activePiece &&
        activePieceLook &&
        activeApnaProduct &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[75] bg-slate-950/75 backdrop-blur-md p-2.5 sm:p-5 overflow-y-auto flex items-start sm:items-center justify-center animate-fadeIn">
            <div className="w-full max-w-2xl bg-white rounded-[28px] sm:rounded-[32px] p-3.5 sm:p-6 shadow-2xl border border-slate-200/80 flex flex-col gap-4 my-auto">
              {/* 1. Top Navigation Header (Look Back + Prev/Next Look + Piece Switcher + Apna Bazar Bag) */}
              <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPieceId(null)}
                    className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Look {activePiece.lookNumber}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const prevLookIdx = wrapMod(activePieceLook.index - 1, TOTAL_LOOKS);
                      currentPosRef.current = prevLookIdx;
                      targetPosRef.current = prevLookIdx;
                      openPieceIn3DStudio(RUNWAY_LOOKS[prevLookIdx].firstPieceIndex);
                    }}
                    title="Previous Model Look"
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextLookIdx = wrapMod(activePieceLook.index + 1, TOTAL_LOOKS);
                      currentPosRef.current = nextLookIdx;
                      targetPosRef.current = nextLookIdx;
                      openPieceIn3DStudio(RUNWAY_LOOKS[nextLookIdx].firstPieceIndex);
                    }}
                    title="Next Model Look"
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {siblingPieces.length > 1 && (
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full">
                    {siblingPieces.map((sp: any, idx: number) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => {
                          setSelectedPieceId(sp.id);
                          setSelectedColorIndex(0);
                        }}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          sp.id === activePiece.id
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {idx === 0 ? 'Top / Jacket' : 'Skirt / Pants'}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleWishlist?.(activeApnaProduct.id)}
                    aria-label="Save to Apna Bazar Wishlist"
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isActivePieceWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-700'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPieceId(null);
                      onOpenCart?.();
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 tabular-nums cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                    <span>{cartCount}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPieceId(null)}
                    aria-label="Close 3D Studio"
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 2. 3D 360° SPIN VIEWER BOX (Always renders garment cleanly across all 360°) */}
              <div
                onPointerDown={(e) => {
                  if ((e.target as HTMLElement).closest('button, input')) return;
                  setIsAutoSpinning(false);
                  isDraggingSpinRef.current = true;
                  spinDragStartXRef.current = e.clientX;
                  spinStartAngleRef.current = spinAngle;
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (!isDraggingSpinRef.current) return;
                  const dx = e.clientX - spinDragStartXRef.current;
                  setSpinAngle((spinStartAngleRef.current + dx * 0.9) % 360);
                }}
                onPointerUp={() => {
                  isDraggingSpinRef.current = false;
                }}
                onPointerCancel={() => {
                  isDraggingSpinRef.current = false;
                }}
                className="relative h-[250px] sm:h-[304px] min-h-[250px] shrink-0 w-full rounded-[26px] bg-gradient-to-b from-[#f8fafd] to-[#e9eff7] border border-slate-200/70 p-3 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
              >
                {/* Top Controls Bar inside 3D Spin Box (No "Change PNG" buttons) */}
                <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-1.5 pointer-events-none">
                  <div className="px-2.5 py-1 rounded-full bg-white/95 border border-slate-200 text-[10px] font-bold text-slate-800 flex items-center gap-1 shadow-2xs tabular-nums">
                    <Rotate3d className="w-3.5 h-3.5 text-amber-600" />
                    <span>3D 360° • {normalizedAngle}°</span>
                  </div>

                  <div className="flex items-center gap-1 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => setIsAutoSpinning((prev) => !prev)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isAutoSpinning
                          ? 'bg-slate-900 text-white'
                          : 'bg-white/95 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isAutoSpinning ? 'animate-spin' : ''}`} />
                      <span>{isAutoSpinning ? '360°' : 'Spin'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomScale((prev) => (prev === 1 ? 1.3 : 1))}
                      className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                        zoomScale > 1
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white/95 text-slate-700 border border-slate-200'
                      }`}
                      title="Toggle Zoom"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rotating 3D Garment (Hardware-accelerated perspective + rotateY without SVG mask collision) */}
                <div
                  className="w-[215px] h-[185px] sm:w-[265px] sm:h-[235px] shrink-0 flex items-center justify-center"
                  style={{
                    transform: `perspective(1200px) scale(${zoomScale}) rotateY(${spinAngle}deg)`,
                    backfaceVisibility: 'visible',
                    WebkitBackfaceVisibility: 'visible',
                  }}
                >
                  <RunwayPieceSprite
                    piece={activePiece}
                    dbAssets={dbAssets}
                    colorFilter={activeColorObj?.filter || 'none'}
                    neckCapColor="#f2f6fc"
                    className="w-full h-full"
                  />
                </div>

                {/* Bottom Angle Presets (0°, 45°, 90°, 180°, 270°) */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-full border border-slate-200 shadow-2xs">
                  {[0, 45, 90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => {
                        setIsAutoSpinning(false);
                        setSpinAngle(deg);
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums transition-colors cursor-pointer ${
                        Math.abs(normalizedAngle - deg) < 18
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>

              {/* ================================================================= */}
              {/* 3. APNA BAZAR PRODUCT & CHECKOUT SECTION (STARTS RIGHT BELOW 3D)  */}
              {/* ================================================================= */}
              <div className="space-y-4 border-t border-slate-200/80 pt-3">
                {/* Brand, Title, Rating & Live Social Proof */}
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">
                      APNA BAZAR 3D COUTURE • {activePiece.category}
                    </span>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      ✓ 100% Genuine Apna Bazar Assured
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1 leading-snug">
                    {activePiece.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {activePiece.subtitle}
                  </p>

                  {/* Rating & Live Viewer Pills */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <div className="inline-flex items-center gap-1 bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded">
                      <span>{activePiece.rating}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {activePiece.reviewsCount} Verified Reviews • {activePiece.fabric}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50/90 px-2 py-0.5 rounded-full border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <Eye className="w-3 h-3 text-amber-700" />
                      <span>14 viewing now</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-950 bg-gradient-to-r from-amber-100 to-yellow-100 px-2 py-0.5 rounded-full border border-amber-300">
                      <Coins className="w-3 h-3 text-amber-600" />
                      <span>Earn 50 AB Coins</span>
                    </span>
                  </div>
                </div>

                {/* Apna Bazar Dynamic Size-Adjusted Pricing Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                        {formatINR(currentPrice)}
                      </span>
                      {currentOriginalPrice > currentPrice && (
                        <span className="text-sm text-slate-400 line-through tabular-nums">
                          {formatINR(currentOriginalPrice)}
                        </span>
                      )}
                      <span className="text-sm font-extrabold text-rose-600">
                        {activePiece.discountLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                      Inclusive of all taxes •{' '}
                      {savingsAmount > 0 && (
                        <span className="text-amber-800 font-bold">
                          You Save {formatINR(savingsAmount)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-black px-2.5 py-1 rounded-xl">
                      Cash on Delivery &amp; UPI Available
                    </span>
                  </div>
                </div>

                {/* Color Variant Selector (Tints 3D 360° Garment Live) */}
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-slate-900 block">
                    Color Variant:{' '}
                    <span className="font-normal text-slate-600">{activeColorObj?.name}</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {activePiece.colors.map((c: any, idx: number) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColorIndex(idx)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                          selectedColorIndex === idx
                            ? 'border-2 border-amber-500 bg-slate-900 text-white shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/50 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apna Bazar Size Selector with Price Differences & Fit Guide */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900">
                      Select Size (India):{' '}
                      <span className="font-normal text-slate-500">({selectedSize})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen((prev) => !prev)}
                      className="text-amber-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>{isSizeGuideOpen ? 'Hide Size Chart' : 'Size Chart & Fit Guide'}</span>
                    </button>
                  </div>

                  {isSizeGuideOpen && (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] tabular-nums grid grid-cols-4 gap-1 text-slate-700">
                      <strong className="text-slate-900">Size</strong>
                      <strong className="text-slate-900">Bust/Chest</strong>
                      <strong className="text-slate-900">Waist</strong>
                      <strong className="text-slate-900">Hip</strong>
                      <span>XS</span><span>32&quot;</span><span>26&quot;</span><span>35&quot;</span>
                      <span>S</span><span>34&quot;</span><span>28&quot;</span><span>37&quot;</span>
                      <span>M</span><span>36&quot;</span><span>30&quot;</span><span>39&quot;</span>
                      <span>L</span><span>38&quot;</span><span>32&quot;</span><span>41&quot;</span>
                      <span>XL</span><span>40&quot;</span><span>34&quot;</span><span>43&quot;</span>
                      <span>XXL</span><span>42&quot;</span><span>36&quot;</span><span>45&quot;</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {activePiece.sizes.map((sz: string) => {
                      const delta = getSizePriceDelta(sz);
                      const isSelected = selectedSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          <span>{sz}</span>
                          {delta > 0 && (
                            <span
                              className={`text-[10px] ${
                                isSelected ? 'text-amber-300 font-normal' : 'text-slate-500'
                              }`}
                            >
                              (+₹{delta})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Apna Bazar 5-Day Return & Delivery Pincode Checker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-amber-900">
                        <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>5-Day Return with OTP</span>
                      </div>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-2 py-0.5 rounded-full">
                        Guaranteed
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Easy doorstep exchange or refund within 5 days with 6-digit Return Pickup OTP.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      Apna Bazar Delivery Speed
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={pincodeInput}
                        maxLength={6}
                        onChange={(e) => setPincodeInput(e.target.value)}
                        placeholder="Enter Pincode"
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={handleCheckPincode}
                        disabled={isCheckingPin}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer"
                      >
                        {isCheckingPin ? '...' : 'Check'}
                      </button>
                    </div>
                    {pincodeResult && (
                      <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 truncate">
                        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{pincodeResult.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Expandable Specifications & Highlights */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsFullDetailsOpen((prev) => !prev)}
                    className="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 transition-colors cursor-pointer"
                  >
                    <span>View Couture Fabric, Fit &amp; Specifications</span>
                    {isFullDetailsOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  {isFullDetailsOpen && (
                    <div className="p-3.5 space-y-2.5 bg-white border-t border-slate-200 text-xs">
                      <p className="text-slate-600 leading-relaxed">{activePiece.description}</p>
                      <ul className="space-y-1">
                        {activeApnaProduct.highlights?.map((h, idx) => (
                          <li key={idx} className="text-slate-700 flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* APNA BAZAR DIRECT CHECKOUT & BAG CTA BUTTONS */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(
                        activeApnaProduct,
                        selectedSize,
                        activeColorObj?.name || 'Original',
                        currentPrice
                      );
                    }}
                    className="py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Add to Bag ({formatINR(currentPrice)})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const prodToBuy = activeApnaProduct;
                      const chosenSize = selectedSize;
                      const chosenColor = activeColorObj?.name || 'Original';
                      const finalPrice = currentPrice;
                      setSelectedPieceId(null);
                      onBuyNow(prodToBuy, chosenSize, chosenColor, finalPrice);
                    }}
                    className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/25 transition-all active:scale-95 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-current shrink-0" />
                    <span>Buy Now / Checkout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
