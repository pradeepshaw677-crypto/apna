import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowRight, Bot, Send, Sparkles, Star, X } from 'lucide-react';
import { CartItem, Order, Product, UserProfile } from '../types';
import { formatINR } from '../utils/pricing';
import { AssistantReply, buildAssistantReply, greeting } from '../utils/shopKnowledge';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  cartItems: CartItem[];
  user: UserProfile | null;
  onSelectProduct: (product: Product) => void;
}

interface ChatMessage extends AssistantReply {
  id: string;
  role: 'user' | 'assistant';
}

let messageCounter = 0;
function nextMessageId(): string {
  messageCounter += 1;
  return `ai-msg-${Date.now()}-${messageCounter}`;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  cartItems,
  user,
  onSelectProduct,
}) => {
  const context = { products, orders, cartItems, user };
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: 'welcome', role: 'assistant', ...greeting(context) },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const lastAssistant = [...messages].reverse().find((message) => message.role === 'assistant');
  const activeChips = isTyping ? [] : lastAssistant?.chips || [];

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (messages.length > 1) return;
    setMessages([{ id: 'welcome', role: 'assistant', ...greeting(context) }]);
    // Only refresh the greeting when the signed-in customer changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.id]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const ask = (raw: string) => {
    const question = raw.trim().slice(0, 240);
    if (!question || isTyping) return;

    setInput('');
    setMessages((previous) => [
      ...previous.slice(-40),
      { id: nextMessageId(), role: 'user', text: question },
    ]);
    setIsTyping(true);

    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const reply = buildAssistantReply(question, context);
      setMessages((previous) => [
        ...previous.slice(-40),
        { id: nextMessageId(), role: 'assistant', ...reply },
      ]);
      setIsTyping(false);
      timerRef.current = null;
    }, 320);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    ask(input);
  };

  const openProduct = (product: Product, event: React.MouseEvent) => {
    event.preventDefault();
    onSelectProduct(product);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Apna Bazar AI Assistant"
      className="fixed z-[70] right-2 sm:right-4 bottom-20 sm:bottom-5 w-[calc(100vw-1rem)] sm:w-[384px] h-[min(72vh,590px)] flex flex-col overflow-hidden rounded-2xl border border-red-200 bg-white shadow-2xl shadow-red-900/25"
    >
      <div className="bg-gradient-to-r from-red-600 via-red-600 to-rose-600 px-3.5 py-3 text-white flex items-center gap-2.5 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight flex items-center gap-1.5">
            Apna Bazar AI
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          </p>
          <p className="text-[10px] text-white/85 flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            Products, orders, delivery - 24x7
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI assistant"
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain bg-rose-50/40 px-3 py-3 space-y-3"
        aria-live="polite"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[86%] min-w-0 ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
              <div
                className={`rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed whitespace-pre-line ${
                  message.role === 'user'
                    ? 'bg-red-600 text-white rounded-br-md'
                    : 'bg-white text-slate-700 border border-rose-100 rounded-bl-md shadow-sm'
                }`}
              >
                {message.text}
              </div>

              {message.products && message.products.length > 0 && (
                <div className="w-full space-y-1.5">
                  {message.products.map((product) => (
                    <a
                      key={product.id}
                      href={`?product=${encodeURIComponent(product.id)}`}
                      onClick={(event) => openProduct(product, event)}
                      className="flex items-center gap-2.5 rounded-xl border border-rose-100 bg-white p-2 hover:border-red-300 hover:bg-rose-50/60 transition-colors group"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-11 h-11 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-slate-900 leading-snug line-clamp-2">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-xs font-black text-red-600">{formatINR(product.price)}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              {formatINR(product.originalPrice)}
                            </span>
                          )}
                          {product.discountPercent > 0 && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              {product.discountPercent}% off
                            </span>
                          )}
                          <span className="text-[9px] font-semibold text-amber-700 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-red-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-white border border-rose-100 px-3 py-2.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce [animation-delay:-0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce [animation-delay:-0.1s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {activeChips.length > 0 && (
        <div className="px-3 py-2 border-t border-rose-100 bg-white flex gap-1.5 overflow-x-auto shrink-0">
          {activeChips.slice(0, 5).map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => ask(chip)}
              className="whitespace-nowrap text-[10px] font-semibold text-red-700 bg-rose-50 border border-red-200 rounded-full px-2.5 py-1 hover:bg-red-100 transition-colors cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-rose-100 bg-white px-2.5 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value.slice(0, 240))}
            placeholder="Product, order ya delivery poochhein..."
            maxLength={240}
            autoComplete="off"
            enterKeyHint="send"
            aria-label="Ask Apna Bazar AI"
            className="flex-1 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
            className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[9px] text-slate-400 mt-1.5 text-center">
          Apna Bazar catalogue se jawab. OTP, card ya personal details chat me share na karein.
        </p>
      </form>
    </div>
  );
};
