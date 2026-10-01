import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2, Search, ArrowRight, RotateCcw } from 'lucide-react';

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
  "Pure cotton kurta pajama",
  "Sports running sneakers",
];

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    setErrorMessage(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      setErrorMessage("Speech Recognition not supported in this browser. Please tap any suggestion below.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
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

      recognition.onerror = (e: any) => {
        setIsListening(false);
        if (e.error === 'not-allowed') {
          setErrorMessage("Microphone access was denied. Please allow microphone permission or tap below.");
        }
      };

      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setErrorMessage("Microphone initialization error. Please select a preset.");
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      setErrorMessage(null);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      return;
    }

    startListening();

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = (queryText: string) => {
    if (!queryText.trim()) return;
    onSearch(queryText.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mic Pulse Graphic & Audio Waves */}
        <div className="pt-2 flex flex-col items-center">
          <div className="relative">
            {isListening && (
              <>
                <span className="absolute -inset-3 rounded-full bg-amber-400/30 animate-ping" />
                <span className="absolute -inset-6 rounded-full bg-amber-400/15 animate-pulse" />
              </>
            )}
            <button
              type="button"
              onClick={isListening ? () => recognitionRef.current?.abort() : startListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                isListening
                  ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white shadow-amber-500/40 scale-105'
                  : 'bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-800'
              }`}
            >
              <Mic className="w-9 h-9" />
            </button>
          </div>

          {/* Equalizer Sound Waves */}
          {isListening && (
            <div className="flex items-center gap-1.5 mt-4 h-6">
              {[40, 70, 95, 55, 80, 100, 65, 45].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-amber-500 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 120}ms`,
                    animationDuration: '600ms',
                  }}
                />
              ))}
            </div>
          )}

          <h3 className="mt-3 text-lg font-black text-slate-900 tracking-tight">
            {isListening ? "Listening to your voice..." : "Voice Search in Apna Bazar"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            {transcript ? `"${transcript}"` : "Say anything like 'Cotton shirts' or 'Running shoes'"}
          </p>

          {!isListening && (
            <button
              onClick={startListening}
              className="mt-2 text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tap to speak again</span>
            </button>
          )}

          {errorMessage && (
            <p className="text-xs text-amber-800 font-bold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl mt-2">
              {errorMessage}
            </p>
          )}
        </div>

        {/* If transcribed query exists */}
        {transcript && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-left flex items-center justify-between gap-3 shadow-xs">
            <span className="text-xs font-bold text-slate-900 line-clamp-1">
              &ldquo;{transcript}&rdquo;
            </span>
            <button
              onClick={() => handleApply(transcript)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl text-xs font-black shrink-0 flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Voice Suggestions */}
        <div className="text-left space-y-2 pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Popular Voice Queries
            </span>
            <span className="text-[10px] text-slate-400">1-Tap Voice Test</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {VOICE_PRESETS.map((item) => (
              <button
                key={item}
                onClick={() => handleApply(item)}
                className="text-xs bg-slate-50 hover:bg-amber-100 hover:text-amber-950 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 font-medium transition-all text-left flex items-center gap-1.5 cursor-pointer"
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
