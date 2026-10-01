import React, { useState } from 'react';
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
  const [logoLoadError, setLogoLoadError] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Brand Icon Emblem with /logo.png & Fashion Glow */}
      <div
        className={`relative shrink-0 flex items-center justify-center rounded-2xl overflow-hidden transition-all duration-300 border ${
          onClick ? 'group-hover:scale-105' : ''
        } ${
          isFooter
            ? 'w-11 h-11 bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/20'
            : isInvoice
            ? 'w-10 h-10 bg-slate-900 border-slate-700 text-amber-400 shadow-xs'
            : 'w-11 h-11 bg-white border-amber-300 shadow-md shadow-amber-500/15 ring-2 ring-amber-400/20'
        }`}
      >
        {!logoLoadError ? (
          <img
            src="/logo.png"
            alt="Apna Bazar"
            onError={() => setLogoLoadError(true)}
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-slate-950 flex items-center justify-center font-black text-sm">
            AB
          </div>
        )}
        
        {/* Fashion pulse badge */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-white" />
        </span>
      </div>

      {/* Typography: "Apna Bazar" Fashion */}
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
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 shadow-2xs">
              <Sparkles className="w-2.5 h-2.5 text-slate-950" />
              <span className="font-extrabold text-slate-950">FASHION</span>
            </span>
          )}
        </div>

        {!isInvoice && (
          <span
            className={`text-[10px] font-bold tracking-tight mt-0.5 hidden xs:flex items-center gap-1 ${
              isFooter ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>Trends &amp; Footwear</span>
            <span>•</span>
            <span className="text-amber-600 font-extrabold">15 Min Express</span>
          </span>
        )}
      </div>
    </div>
  );
};
