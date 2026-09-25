import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2, Search, ArrowRight } from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

const VOICE_PRESETS = [
  "Men's casual shirts under ₹999",
  "Puma running shoes",
  "Floral Anarkali Kurti",
  "High speed RC stunt car",
  "Fossil chronograph watch",
  "Oversized cotton hoodie",
  "Slim fit denim jeans"
];

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      return;
    }

    // Check Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      return;
    }

    let recognition: any;
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setTranscript(text);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }

    return () => {
      if (recognition) {
        try {
          recognition.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = (queryText: string) => {
    onSearch(queryText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mic Pulse Graphic */}
        <div className="pt-2 flex flex-col items-center">
          <div className="relative">
            {isListening && (
              <>
                <span className="absolute -inset-3 rounded-full bg-amber-400/30 animate-ping" />
                <span className="absolute -inset-6 rounded-full bg-amber-400/15 animate-pulse" />
              </>
            )}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isListening
                ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-amber-500/40 scale-105'
                : 'bg-slate-100 text-slate-700 shadow-slate-200'
            }`}>
              <Mic className="w-9 h-9" />
            </div>
          </div>

          <h3 className="mt-4 text-lg font-black text-slate-900">
            {isListening ? "Listening to your voice..." : "Voice Search in Apna Bazar"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            {transcript ? `"${transcript}"` : "Say anything like 'Cotton casual shirts' or 'Running shoes'"}
          </p>
        </div>

        {/* If transcribed query exists */}
        {transcript && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-800 line-clamp-1">
              &ldquo;{transcript}&rdquo;
            </span>
            <button
              onClick={() => handleApply(transcript)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black shrink-0 flex items-center gap-1 shadow-sm"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Voice Suggestions */}
        <div className="text-left space-y-2 pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Or try one of these voice searches
          </div>
          <div className="flex flex-wrap gap-1.5">
            {VOICE_PRESETS.map((item) => (
              <button
                key={item}
                onClick={() => handleApply(item)}
                className="text-xs bg-slate-50 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 font-medium transition-all text-left flex items-center gap-1.5"
              >
                <Search className="w-3 h-3 text-slate-400" />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
