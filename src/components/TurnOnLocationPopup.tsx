import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Loader2, CheckCircle2 } from 'lucide-react';
import { getFastRealLocation, startLiveGpsWatcher } from '../utils/fastGps';

interface TurnOnLocationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationConfirmed: (pin: string, fullAddress: string, isExpress: boolean) => void;
  onOpenFullMap?: () => void;
}

export const TurnOnLocationPopup: React.FC<TurnOnLocationPopupProps> = ({
  isOpen,
  onClose,
  onLocationConfirmed,
}) => {
  const [turningOn, setTurningOn] = useState(false);
  const [turnedOnSuccess, setTurnedOnSuccess] = useState(false);

  const handleTurnOnLocation = useCallback(async () => {
    setTurningOn(true);
    startLiveGpsWatcher();
    try {
      sessionStorage.setItem('ab_location_prompt_shown', 'true');
    } catch {}

    // Super-fast 1.5 second auto-close timer as requested by user
    const closeTimer = setTimeout(() => {
      setTurningOn(false);
      onClose();
    }, 1500);

    try {
      const loc = await getFastRealLocation();
      setTurnedOnSuccess(true);
      onLocationConfirmed(loc.pincode, loc.fullFormatted, loc.isInside10Km);
      clearTimeout(closeTimer);
      setTimeout(() => {
        setTurningOn(false);
        setTurnedOnSuccess(false);
        onClose();
      }, 450);
    } catch {
      // Auto-close timer closes popup within 1.5s
    }
  }, [onClose, onLocationConfirmed]);

  // Automatically request location and close within 1.5s when opened on first visit
  useEffect(() => {
    if (!isOpen) return;
    startLiveGpsWatcher();
    try {
      sessionStorage.setItem('ab_location_prompt_shown', 'true');
    } catch {}

    // Trigger location fetch immediately
    getFastRealLocation()
      .then((loc) => {
        setTurnedOnSuccess(true);
        onLocationConfirmed(loc.pincode, loc.fullFormatted, loc.isInside10Km);
      })
      .catch(() => {});

    // Auto-close popup in 1.5 seconds super fast
    const autoClose = setTimeout(() => {
      setTurningOn(false);
      onClose();
    }, 1500);

    return () => clearTimeout(autoClose);
  }, [isOpen, onClose, onLocationConfirmed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white w-full max-w-xs sm:max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-5 sm:p-6 text-center space-y-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Location Icon */}
        <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center mx-auto shadow-sm">
          {turnedOnSuccess ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-600 animate-bounce" />
          ) : (
            <MapPin className="w-7 h-7 text-amber-600 animate-bounce" />
          )}
        </div>

        {/* Simple & Clean Prompt */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            {turnedOnSuccess ? 'Mobile Location Turned On!' : 'Turn on device location'}
          </h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {turnedOnSuccess
              ? 'Live location fetched for Apna Bazar 10-KM delivery circle!'
              : 'Apna Bazar uses your mobile GPS location to check 10-KM circle delivery availability.'}
          </p>
        </div>

        {/* Primary Action: Turn on Location */}
        <div className="pt-1 space-y-2">
          <button
            type="button"
            onClick={handleTurnOnLocation}
            disabled={turningOn}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer active:scale-98 transition-all disabled:opacity-80"
          >
            {turningOn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Turning on mobile location...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 fill-current" />
                <span>Turn on location</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.setItem('ab_location_prompt_shown', 'true');
              } catch {}
              onClose();
            }}
            className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};
