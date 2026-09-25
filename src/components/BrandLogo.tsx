import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';

interface BrandLogoProps {
  variant?: 'header' | 'footer' | 'invoice' | 'mobile';
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header',
  className = '',
  onClick,
}) => {
  const isFooter = variant === 'footer';
  const isInvoice = variant === 'invoice';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Brand Icon Emblem with Radiant Gradient & Glow */}
      <div
        className={`relative shrink-0 flex items-center justify-center rounded-2xl transition-all duration-300 ${
          onClick ? 'group-hover:scale-105 group-hover:rotate-1' : ''
        } ${
          isFooter
            ? 'w-11 h-11 bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20'
            : isInvoice
            ? 'w-10 h-10 bg-slate-900 text-amber-400 shadow-xs'
            : 'w-11 h-11 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/30'
        }`}
      >
        <ShoppingBag className="w-6 h-6 stroke-[2.3]" />
        
        {/* Glowing badge */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
        </span>
      </div>

      {/* Typography: "Apna Bazar" */}
      <div className="flex flex-col leading-none text-left">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              isFooter ? 'text-white' : 'text-slate-950'
            }`}
          >
            <span className={isFooter ? 'text-white' : 'text-slate-950'}>Apna</span>
            <span className="ml-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              Bazar
            </span>
          </span>
          
          {!isInvoice && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-2xs">
              <Sparkles className="w-2.5 h-2.5" />
              <span>LIVE</span>
            </span>
          )}
        </div>

        {!isInvoice && (
          <span
            className={`text-[10px] font-bold tracking-tight mt-0.5 flex items-center gap-1 ${
              isFooter ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>Apna Superstore</span>
            <span>•</span>
            <span className="text-emerald-600 font-extrabold">15 Min Delivery</span>
          </span>
        )}
      </div>
    </div>
  );
};
