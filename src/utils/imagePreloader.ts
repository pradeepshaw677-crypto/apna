/**
 * Ultra-fast image preloader.
 * Pre-warms high-priority brand logos and fabric textures into browser memory
 * cache so they render instantaneously (0ms) when viewed or scrolled.
 */

export const BRAND_LOGOS = [
  '/assets/aistudio/Screenshot_2026_1106_201142_d415b265.png', // Adidas
  '/assets/aistudio/Screenshot_2026_1106_200435_83a20aa4.png', // Nike
  '/assets/aistudio/Screenshot_2026_1106_200959_d4c9aac8.png', // Campus
  '/assets/aistudio/Screenshot_2026_1106_200624_e72f4277.png', // Puma
  '/assets/aistudio/Screenshot_2026_1106_200334_9fd39ff1.png', // H&M
  '/assets/aistudio/Screenshot_2026_1106_200535_2605e0c4.png', // Cider
  '/assets/aistudio/Screenshot_2026_1106_201459_8115fdd5.png', // Raymond
  '/assets/aistudio/Screenshot_2026_1106_202444_4f8a8a8d.png', // Allen Solly
  '/assets/aistudio/Screenshot_2026_1106_202642_6357bb7f.png', // W for Woman
  '/assets/aistudio/Screenshot_2026_1106_202804_2634fa53.png', // Manyavar
  '/assets/aistudio/Screenshot_2026_1106_202557_38db2bff.png', // Killer
  '/assets/aistudio/Screenshot_2026_1106_202618_36c67d2a.png', // Sparx
  '/assets/aistudio/Screenshot_2026_1106_201107_80aed23a.png', // The Bear House
  '/assets/aistudio/Screenshot_2026_1106_202724_7319d819.png', // Aurelia
  '/assets/aistudio/Screenshot_2026_1106_202316_8c01cc26.png', // V-Mart
  '/assets/aistudio/Screenshot_2026_1106_202512_111de0df.png', // Peter England
  '/assets/aistudio/Screenshot_2026_1106_202016_9c8e47da.png', // Wrogn
  '/assets/aistudio/Screenshot_2026_1106_201816_ccf3035a.png', // HRX
  '/assets/aistudio/Screenshot_2026_1106_201352_e49a416b.png', // Safari
  '/assets/aistudio/Screenshot_2026_1106_201546_37174aa3.png', // Libas
  '/assets/aistudio/Screenshot_2026_1106_202400_06d885e8.png', // Aristocrat
  '/assets/aistudio/Screenshot_2026_1106_202533_11a8fedd.png', // Flying Machine
  '/assets/aistudio/Screenshot_2026_1106_202129_13aedfdc.png', // Red Tape
  '/assets/aistudio/Screenshot_2026_1106_202055_a1733b9e.png', // Biba
  '/assets/aistudio/Screenshot_2026_1106_202231_0ebcbbbb.png', // Metronaut
  '/assets/aistudio/Screenshot_2026_1106_201303_79fb576a.png', // Tokyo Talkies
  '/assets/aistudio/Screenshot_2026_1106_200822_7769a814.png', // U.S. Polo Assn.
  '/assets/aistudio/Screenshot_2026_1106_200930_d1493351.png', // Snitch
  '/assets/aistudio/Screenshot_2026_1106_201709_e9f46b3b.png', // Highlander
  '/assets/aistudio/Screenshot_2026_1106_201936_d673a14e.png', // Roadster
];

export const FABRIC_IMAGES = [
  '/assets/aistudio/Screenshot_2026_1106_205708_8a333b8c.png', // All Fabrics
  '/assets/aistudio/Screenshot_2026_1106_205750_2f8b4a8b.png', // Cotton
  '/assets/aistudio/Screenshot_2026_1106_210033_52aac3d0.png', // Silk
  '/assets/aistudio/Screenshot_2026_1106_210111_cc73a541.png', // Wool & Fleece
  '/assets/aistudio/Screenshot_2026_1106_210152_55383cbe.png', // Polyester & Georgette
  '/assets/aistudio/Screenshot_2026_1106_210218_95587bac.png', // Denim
  '/assets/aistudio/Screenshot_2026_1106_210253_da7d626d.png', // Linen
  '/assets/aistudio/Screenshot_2026_1106_210327_7e2a0625.png', // Velvet & Satin
  '/assets/aistudio/Screenshot_2026_1106_210352_31dcf9b6.png', // Rayon & Viscose
  '/assets/aistudio/Screenshot_2026_1106_210417_36af62fb.png', // Leather & EVA
];

let hasPreloaded = false;

export function preloadCriticalAssets(): void {
  if (typeof window === 'undefined' || hasPreloaded) return;
  hasPreloaded = true;

  const allUrls = [...BRAND_LOGOS, ...FABRIC_IMAGES];

  // Parallel pre-warming via native Image objects
  allUrls.forEach((url) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  });
}
