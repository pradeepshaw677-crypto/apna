import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, ShoppingBag, ArrowUp } from 'lucide-react';

interface FloatingActionsProps {
  onOpenCart?: () => void;
  cartCount?: number;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  onOpenCart,
  cartCount = 0,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-center gap-3 select-none">
      
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="Back to Top"
          className="w-11 h-11 rounded-full bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center shadow-lg border border-slate-200 transition-all hover:scale-110 active:scale-95 cursor-pointer animate-fadeIn"
        >
          <ArrowUp className="w-5 h-5 text-slate-700" />
        </button>
      )}

      {/* Floating Bag Button */}
      {onOpenCart && cartCount > 0 && (
        <button
          onClick={onOpenCart}
          title="Open Shopping Bag"
          className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/40 hover:scale-110 active:scale-95 transition-all cursor-pointer animate-pulse-glow"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-slate-950 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            {cartCount}
          </span>
        </button>
      )}

      {/* Blue Phone Call Button */}
      <a
        href="tel:+919876543210"
        title="Call Helpline (+91 98765 43210)"
        className="w-12 h-12 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white flex items-center justify-center shadow-lg shadow-sky-600/35 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
      >
        <Phone className="w-5 h-5 group-hover:animate-bounce" />
      </a>

      {/* Green WhatsApp Button with Red Unread Dot */}
      <a
        href="https://wa.me/919876543210?text=Hi%20Apna%20Bazar,%20I%20want%20to%20inquire%20about%20fashion%20products%20and%20orders"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat on WhatsApp"
        className="w-12 h-12 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 hover:scale-110 active:scale-95 transition-all cursor-pointer relative group"
      >
        <MessageCircle className="w-6 h-6 fill-white text-[#22c55e]" />
        
        {/* Red unread badge dot with ping */}
        <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white" />
        </span>
      </a>
    </div>
  );
};
