import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Tag, 
  Search, 
  ArrowRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  Package
} from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../data/products';

export interface MeeshoCategoryItem {
  id: string;
  name: string;
  hindiName: string;
  badge?: string;
  badgeColor?: string;
  image: string;
  bannerImage: string;
  bannerHeadline: string;
  bannerSubline: string;
  catalogCategory: string; // matches product.category
  subcategories: {
    id: string;
    name: string;
    hindiName?: string;
    image: string;
    priceHint: string;
    searchKeyword?: string;
    isHot?: boolean;
  }[];
}

// 7 Rich Indian fashion & lifestyle categories
export const MEESHO_CATEGORIES: MeeshoCategoryItem[] = [
  {
    id: 'sarees',
    name: 'Sarees & Ethnic',
    hindiName: 'साड़ी व एथनिक',
    badge: 'HOT',
    badgeColor: 'bg-rose-500 text-white',
    catalogCategory: 'sarees',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    bannerHeadline: 'Royal Wedding & Festive Sarees',
    bannerSubline: 'Pure Banarasi, Kanjeevaram & Organza • Up to 70% OFF',
    subcategories: [
      {
        id: 'banarasi',
        name: 'Banarasi Silk',
        hindiName: 'बनारसी सिल्क',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹1,899',
        searchKeyword: 'Banarasi',
        isHot: true,
      },
      {
        id: 'kanjeevaram',
        name: 'Kanjeevaram Pattu',
        hindiName: 'कांचीपुरम पट्टू',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹2,499',
        searchKeyword: 'Kanchipuram',
        isHot: true,
      },
      {
        id: 'organza',
        name: 'Organza Floral',
        hindiName: 'ऑर्गेंज़ा फ्लोरल',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹1,299',
        searchKeyword: 'Organza',
      },
      {
        id: 'chanderi',
        name: 'Chanderi Cotton',
        hindiName: 'चंदेरी कॉटन',
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹899',
        searchKeyword: 'Chanderi',
      },
      {
        id: 'bandhani',
        name: 'Bandhani Georgette',
        hindiName: 'बांधनी जॉर्जेट',
        image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹1,199',
        searchKeyword: 'Bandhani',
      },
      {
        id: 'kurtis',
        name: 'Chikankari Kurtis',
        hindiName: 'चिकनकारी कुर्ती',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹749',
        searchKeyword: 'Kurta',
      },
    ],
  },
  {
    id: 'men-topwear',
    name: "Men's Top Wear",
    hindiName: 'मेन्स टॉप वियर',
    badge: 'TREND',
    badgeColor: 'bg-amber-500 text-slate-950',
    catalogCategory: 'fashion',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    bannerHeadline: 'Streetwear & Everyday Classics',
    bannerSubline: 'Oversized Tees, Oxford Shirts & Hoodies • Min 60% OFF',
    subcategories: [
      {
        id: 'oversized-tees',
        name: 'Oversized Tees',
        hindiName: 'ओवरसाइज्ड टी-शर्ट',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
        priceHint: 'Under ₹499',
        searchKeyword: 'Oversized',
        isHot: true,
      },
      {
        id: 'casual-shirts',
        name: 'Cotton Oxford Shirts',
        hindiName: 'कॉटन शर्ट्स',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹699',
        searchKeyword: 'Shirt',
      },
      {
        id: 'hoodies',
        name: 'Fleece Hoodies',
        hindiName: 'विंटर हुडीज',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹899',
        searchKeyword: 'Hoodie',
      },
      {
        id: 'polos',
        name: 'Pique Polo T-Shirts',
        hindiName: 'पोलो टी-शर्ट',
        image: 'https://images.unsplash.com/photo-1625910513413-5689886a8b79?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹449',
        searchKeyword: 'Polo',
      },
      {
        id: 'ethnic-kurtas',
        name: 'Lucknowi Kurtas',
        hindiName: 'कुर्ता पजामा',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹949',
        searchKeyword: 'Kurta',
      },
    ],
  },
  {
    id: 'men-bottomwear',
    name: "Men's Bottom Wear",
    hindiName: 'मेन्स बॉटम वियर',
    badge: 'NEW',
    badgeColor: 'bg-indigo-600 text-white',
    catalogCategory: 'fashion',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
    bannerHeadline: 'Flexi Stretch Denim & Cargos',
    bannerSubline: 'Comfort Fit Jeans, Chinos & Trousers • From ₹799',
    subcategories: [
      {
        id: 'slim-jeans',
        name: 'Slim Stretch Jeans',
        hindiName: 'स्लिम जींस',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹899',
        searchKeyword: 'Jeans',
        isHot: true,
      },
      {
        id: 'cargo-pants',
        name: 'Multi-Pocket Cargos',
        hindiName: 'कार्गो पैंट',
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹799',
        searchKeyword: 'Cargo',
      },
      {
        id: 'chinos',
        name: 'Cotton Casual Chinos',
        hindiName: 'कॉटन चिनोस',
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹699',
        searchKeyword: 'Trousers',
      },
      {
        id: 'trackpants',
        name: 'Gym Trackpants',
        hindiName: 'ट्रैक पैंट',
        image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=300&q=80',
        priceHint: 'Under ₹499',
        searchKeyword: 'Track',
      },
    ],
  },
  {
    id: 'footwear',
    name: 'Footwear & Shoes',
    hindiName: 'जूते और चप्पल',
    badge: 'TOP',
    badgeColor: 'bg-emerald-600 text-white',
    catalogCategory: 'footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80',
    bannerHeadline: 'Step Up in High Performance',
    bannerSubline: 'Air Bounce Running Sneakers & Formal Loafers • From ₹799',
    subcategories: [
      {
        id: 'sneakers',
        name: 'Air Cushion Sneakers',
        hindiName: 'एयर स्नीकर्स',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹899',
        searchKeyword: 'Sneakers',
        isHot: true,
      },
      {
        id: 'formal-shoes',
        name: 'Penny Loafers',
        hindiName: 'फॉर्मल लोफर्स',
        image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹1,099',
        searchKeyword: 'Loafers',
      },
      {
        id: 'retro-skate',
        name: 'Retro Skate High-Tops',
        hindiName: 'हाई-टॉप स्नीकर्स',
        image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹949',
        searchKeyword: 'Skate',
      },
      {
        id: 'sliders',
        name: 'Orthopedic EVA Slides',
        hindiName: 'स्लाइडर्स व चप्पल',
        image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=300&q=80',
        priceHint: 'Under ₹399',
        searchKeyword: 'Slides',
      },
    ],
  },
  {
    id: 'women-western',
    name: 'Women Western',
    hindiName: 'वेस्टर्न ड्रेसेस',
    badge: 'CHIC',
    badgeColor: 'bg-purple-600 text-white',
    catalogCategory: 'fashion',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    bannerHeadline: 'Trending Western Silhouettes',
    bannerSubline: 'Maxi Dresses, Crop Tops & Flared Jeans • Up to 65% OFF',
    subcategories: [
      {
        id: 'dresses',
        name: 'Floral Maxi Dresses',
        hindiName: 'मैक्सी ड्रेस',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹899',
        searchKeyword: 'Dress',
        isHot: true,
      },
      {
        id: 'crop-tops',
        name: 'Trendy Tops & Tees',
        hindiName: 'क्रॉप टॉप्स',
        image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=300&q=80',
        priceHint: 'Under ₹399',
        searchKeyword: 'T-Shirt',
      },
      {
        id: 'flared-jeans',
        name: 'High-Waist Wide Jeans',
        hindiName: 'हाई-वेस्ट जींस',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹799',
        searchKeyword: 'Jeans',
      },
      {
        id: 'co-ords',
        name: 'Summer Co-ord Sets',
        hindiName: 'को-ऑर्ड सेट्स',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹999',
        searchKeyword: 'Set',
      },
    ],
  },
  {
    id: 'toys-kids',
    name: 'Kids & Toys',
    hindiName: 'खिलौने और गेम्स',
    badge: 'FUN',
    badgeColor: 'bg-sky-500 text-white',
    catalogCategory: 'toys',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80',
    bannerHeadline: 'STEM Learning & High-Speed RC Fun',
    bannerSubline: 'Drift Cars, STEM Robots & Soft Plushies • Safe & Certified',
    subcategories: [
      {
        id: 'rc-cars',
        name: 'High-Speed RC Drift Cars',
        hindiName: 'रिमोट कंट्रोल कार',
        image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹799',
        searchKeyword: 'RC',
        isHot: true,
      },
      {
        id: 'stem-robots',
        name: 'Solar STEM Robots',
        hindiName: 'रोबोट किट',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹899',
        searchKeyword: 'Robot',
      },
      {
        id: 'drones',
        name: 'Kids Mini Drones',
        hindiName: 'मिनी ड्रोन',
        image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹1,299',
        searchKeyword: 'Drone',
      },
      {
        id: 'plushies',
        name: 'Soft Plushie Toys',
        hindiName: 'सॉफ्ट टॉयज',
        image: 'https://images.unsplash.com/photo-1559715745-e1b123c5c407?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹349',
        searchKeyword: 'Plush',
      },
    ],
  },
  {
    id: 'accessories',
    name: 'Watches & Bags',
    hindiName: 'घड़ी व एक्सेसरीज',
    badge: 'LUXE',
    badgeColor: 'bg-amber-600 text-white',
    catalogCategory: 'accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    bannerHeadline: 'Smart Tech & Genuine Leather',
    bannerSubline: 'AMOLED Smartwatches, Chronographs & Backpacks',
    subcategories: [
      {
        id: 'smartwatches',
        name: 'AMOLED Smart Watches',
        hindiName: 'स्मार्ट वॉच',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹1,499',
        searchKeyword: 'Watch',
        isHot: true,
      },
      {
        id: 'chronographs',
        name: 'Chronograph Watches',
        hindiName: 'एनालॉग घड़ियां',
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹999',
        searchKeyword: 'Chronograph',
      },
      {
        id: 'sunglasses',
        name: 'Polarized Sunglasses',
        hindiName: 'धूप के चश्मे',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹499',
        searchKeyword: 'Sunglasses',
      },
      {
        id: 'backpacks',
        name: 'Anti-Theft Backpacks',
        hindiName: 'लैपटॉप बैग',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹899',
        searchKeyword: 'Backpack',
      },
      {
        id: 'wallets',
        name: 'RFID Leather Wallets',
        hindiName: 'लेदर वॉलेट',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹399',
        searchKeyword: 'Wallet',
      },
    ],
  },
  {
    id: 'home-kitchen',
    name: 'Home & Living',
    hindiName: 'होम व किचन',
    badge: 'DEAL',
    badgeColor: 'bg-emerald-700 text-white',
    catalogCategory: 'accessories',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=300&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    bannerHeadline: 'Transform Your Home Spaces',
    bannerSubline: 'Bedsheets, Organizers, Wall Lights & Kitchen Essentials',
    subcategories: [
      {
        id: 'bedsheets',
        name: 'Pure Cotton Bedsheets',
        hindiName: 'कॉटन चादरें',
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹499',
        searchKeyword: 'Cotton',
        isHot: true,
      },
      {
        id: 'kitchen-gadgets',
        name: 'Smart Kitchen Tools',
        hindiName: 'किचन गैजेट्स',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=300&q=80',
        priceHint: 'Under ₹399',
        searchKeyword: 'Kitchen',
      },
      {
        id: 'home-decor',
        name: 'Ambient Warm Lights',
        hindiName: 'लाइटिंग व डेकोर',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹299',
        searchKeyword: 'Decor',
      },
      {
        id: 'curtains',
        name: 'Sheer & Blackout Curtains',
        hindiName: 'पर्दे व फैब्रिक',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80',
        priceHint: 'From ₹399',
        searchKeyword: 'Curtain',
      },
    ],
  },
];

interface MeeshoCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: string, filterKeyword?: string) => void;
  selectedCategory: string;
}

export const MeeshoCategoryDrawer: React.FC<MeeshoCategoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  selectedCategory,
}) => {
  // Initial active category based on selectedCategory or default to sarees
  const [activeCategoryId, setActiveCategoryId] = useState<string>(() => {
    const matched = MEESHO_CATEGORIES.find(c => c.catalogCategory === selectedCategory || c.id === selectedCategory);
    return matched ? matched.id : 'sarees';
  });

  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const currentCategory = MEESHO_CATEGORIES.find(c => c.id === activeCategoryId) || MEESHO_CATEGORIES[0];

  // Optional quick filter inside drawer
  const filteredSubcategories = searchFilter.trim()
    ? currentCategory.subcategories.filter(s => 
        s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (s.hindiName && s.hindiName.includes(searchFilter))
      )
    : currentCategory.subcategories;

  const handleCategoryItemClick = (cat: MeeshoCategoryItem, sub?: { searchKeyword?: string; name: string }) => {
    onSelectCategory(cat.catalogCategory, sub?.searchKeyword || sub?.name || '');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Meesho Two-Pane Slide-In Drawer */}
      <div 
        className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 animate-slideRight overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header (Meesho Style) */}
        <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>All Categories</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  7 Hubs • 50+ Trending
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Tap any category to explore authentic fashion &amp; lifestyle
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close categories"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search inside Categories */}
        <div className="p-2.5 sm:p-3 bg-slate-50 border-b border-slate-200/80 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter subcategories (e.g. Banarasi, Jeans, Shoes, Watches)..."
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 shadow-2xs"
            />
            {searchFilter && (
              <button 
                type="button" 
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dual-Pane Body (Authentic Meesho layout: Left Sidebar + Right Subcategories) */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-slate-100">
          
          {/* Left Vertical Category Nav (32% width on mobile, 220px on desktop) */}
          <div className="w-[34%] sm:w-56 bg-slate-100 border-r border-slate-200/90 overflow-y-auto divide-y divide-slate-200/50">
            {MEESHO_CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategoryId;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategoryId(cat.id);
                    setSearchFilter('');
                  }}
                  className={`w-full p-2 sm:p-3 flex flex-col items-center sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 text-left transition-all relative cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60 font-semibold'
                  }`}
                >
                  {/* Left Active Indicator Bar (Meesho Signature Pink/Amber Edge) */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-500 via-orange-500 to-rose-500 rounded-r-md" />
                  )}

                  {/* Category Thumbnail */}
                  <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 border-2 transition-transform ${
                    isActive 
                      ? 'border-amber-400 ring-2 ring-amber-300/40 scale-105 shadow-sm' 
                      : 'border-slate-200'
                  }`}>
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {cat.badge && (
                      <span className={`absolute -bottom-0.5 inset-x-0 text-[8px] font-black text-center py-0.2 uppercase leading-none shadow-2xs ${cat.badgeColor || 'bg-slate-900 text-white'}`}>
                        {cat.badge}
                      </span>
                    )}
                  </div>

                  {/* Name Label */}
                  <div className="min-w-0 text-center sm:text-left flex-1">
                    <p className={`text-[11px] sm:text-xs leading-tight line-clamp-2 ${isActive ? 'text-slate-950 font-black' : 'text-slate-700 font-bold'}`}>
                      {cat.name}
                    </p>
                    <p className="hidden sm:block text-[10px] text-slate-400 font-medium truncate mt-0.5">
                      {cat.hindiName}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Content Pane: High-Impact Subcategories & Banners */}
          <div className="flex-1 bg-white overflow-y-auto p-3 sm:p-5 space-y-4">
            
            {/* Category Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-3.5 sm:p-4 shadow-sm border border-slate-100">
              <img
                src={currentCategory.bannerImage}
                alt={currentCategory.name}
                className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
              />
              <div className="relative z-10 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/90 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  <Flame className="w-3 h-3 fill-current" />
                  <span>Popular in Baharagora</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                  {currentCategory.bannerHeadline}
                </h3>
                <p className="text-[11px] text-slate-200 line-clamp-1">
                  {currentCategory.bannerSubline}
                </p>

                <button
                  type="button"
                  onClick={() => handleCategoryItemClick(currentCategory)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-900 hover:bg-amber-400 font-black text-xs transition-colors shadow-xs cursor-pointer active:scale-95"
                >
                  <span>Explore All {currentCategory.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Popular Subcategories Section Header */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Popular Subcategories</span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {filteredSubcategories.length} Styles
                </span>
              </div>

              {/* Subcategories Visual Grid (Meesho Circular Style) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 pt-3">
                {filteredSubcategories.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleCategoryItemClick(currentCategory, sub)}
                    className="group bg-slate-50 hover:bg-amber-50/60 p-2.5 rounded-2xl border border-slate-200/80 hover:border-amber-400 flex flex-col items-center text-center transition-all shadow-2xs hover:shadow-sm cursor-pointer active:scale-97"
                  >
                    {/* Visual Image */}
                    <div className="relative overflow-hidden bg-white border-2 border-slate-200 group-hover:border-amber-400 shadow-2xs transition-transform group-hover:scale-105 w-16 h-16 sm:w-20 sm:h-20 rounded-full">
                      <img
                        src={sub.image}
                        alt={sub.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {sub.isHot && (
                        <span className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                          HOT
                        </span>
                      )}
                    </div>

                    {/* Subcategory Label & Price Tag */}
                    <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 line-clamp-1 mt-2">
                      {sub.name}
                    </p>
                    {sub.hindiName && (
                      <p className="text-[10px] text-slate-500 font-medium truncate">
                        {sub.hindiName}
                      </p>
                    )}
                    <span className="mt-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {sub.priceHint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Filter Direct Category Action */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/90 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-amber-950">
                  Can&apos;t find what you&apos;re looking for?
                </p>
                <p className="text-[10px] text-amber-800 font-medium">
                  View all collections with live filter &amp; sorting
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCategoryItemClick(currentCategory)}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                View Catalog
              </button>
            </div>

          </div>

        </div>

        {/* Sticky Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Express Doorstep Delivery in Baharagora</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectCategory('all', '');
              onClose();
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
          >
            Show All Items
          </button>
        </div>

      </div>
    </div>
  );
};
