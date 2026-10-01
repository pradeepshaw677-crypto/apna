import React from 'react';

interface AbCoinLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const AbCoinLogo: React.FC<AbCoinLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
}) => {
  const sizeMap = {
    xs: 'w-4 h-4 text-[8px]',
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-6 h-6 text-xs',
    lg: 'w-8 h-8 text-sm',
    xl: 'w-12 h-12 text-base',
  };

  const dimension = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div
        className={`relative ${dimension} rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-[1.5px] shadow-sm shadow-amber-500/40 shrink-0 select-none`}
        title="AB Coin - Apna Bazar Shopping Currency (1 Coin = ₹1)"
      >
        {/* Outer Coin Edge Ring */}
        <div className="w-full h-full rounded-full bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-700 p-[1.5px] flex items-center justify-center">
          {/* Inner Golden Disc with subtle rim texture */}
          <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600 flex items-center justify-center relative overflow-hidden border border-yellow-200/60 shadow-inner">
            {/* Glossy top-left reflective highlight */}
            <div className="absolute -top-1 -left-1 w-3/4 h-3/4 bg-white/40 rounded-full blur-[1px] pointer-events-none" />
            
            {/* Embossed AB lettering */}
            <span className="font-black text-slate-950 font-mono tracking-tighter drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] z-10">
              AB
            </span>

            {/* Sparkle star glint */}
            <div className="absolute top-0.5 right-1 w-1 h-1 bg-white rounded-full opacity-80 animate-pulse pointer-events-none" />
          </div>
        </div>
      </div>

      {showText && (
        <span className="font-black text-amber-900 tracking-tight flex items-center gap-1">
          <span>AB Coins</span>
          <span className="text-[10px] text-amber-700 bg-amber-100 font-bold px-1.5 py-0.5 rounded-full border border-amber-300">
            1 Coin = ₹1
          </span>
        </span>
      )}
    </div>
  );
};
