import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { MessageSquare, X, Send, Loader2, Minimize2 } from 'lucide-react';
import { AIClient, DEFAULT_AI_MODEL } from '../services/aiClient';
import { useApp } from '../contexts/AppContext';
import { KairoBrandMark } from './KairoBrand';

const MotionButton = motion.button as React.FC<HTMLMotionProps<"button">>;
const MotionDiv = motion.div as React.FC<HTMLMotionProps<"div">>;

interface Message {
  role: 'user' | 'model';
  text: string;
}

const KairoChat: React.FC = () => {
  const { t, theme, dir, language } = useApp();
  const isLight = theme === 'light';
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState(DEFAULT_AI_MODEL);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    const handleModelEvent = (e: any) => {
        if (e.detail?.model) setActiveModel(e.detail.model);
    };
    window.addEventListener('ai-model-used', handleModelEvent);
    return () => window.removeEventListener('ai-model-used', handleModelEvent);
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { role: 'model', text: language === 'ar' ? 'مرحبًا! أنا كايرو، مساعدك العربي للذكاء البيئي. أستطيع قراءة النصوص وتحليل بيانات المياه والطاقة والغذاء وشرح الخطوات العملية. كيف أساعدك؟' : 'Hello! I am Kairo, your environmental intelligence assistant. I can read text, analyze water, energy and food data, and explain practical next steps. How can I help?' }
      ]);
    }
  }, [language]);

  useEffect(() => {
    const ai = new AIClient();
    chatSessionRef.current = ai.chats.create({
      model: DEFAULT_AI_MODEL,
      config: {
        systemInstruction: language === 'ar'
          ? `أنت مساعد منصة KAIRO للذكاء البيئي، ومتخصص في الاستدامة والاقتصاد المنزلي والبيانات المناخية في مصر ومنطقة الشرق الأوسط وشمال أفريقيا. أجب دائمًا بالعربية الواضحة والطبيعية، ويفضل أسلوبًا مصريًا مهنيًا سهل الفهم. اقرأ النص الذي يرسله المستخدم وحلله، واشرح الأرقام والوحدات والافتراضات بوضوح. ساعد في تقليل هدر المياه والغذاء والطاقة والنقل والمخلفات الإلكترونية. فرّق بين النتائج المحسوبة والتقديرات، ولا تدّعِ قياسًا ميدانيًا غير متاح. قدّم خطوات عملية قصيرة، وأثرًا ماليًا وبيئيًا، ثم اقترح طريقة للتحقق من النتيجة. مشروع KAIRO نموذج بحثي مشارك في UGRF يربط القرارات اليومية بندرة الموارد والأثر الاقتصادي والبيئي.`
          : `You are the KAIRO environmental intelligence assistant, specializing in sustainability, household economics and climate data for Egypt and MENA. Read and analyze user-provided text and data. Explain numbers, units and assumptions clearly. Help reduce water, food, energy, transport and e-waste impacts. Distinguish computed outputs from estimates and never claim unavailable field validation. Give concise practical actions, their financial and environmental value, and a way to verify the result. KAIRO is a UGRF research prototype connecting daily decisions with resource scarcity and economic impact.`,
      },
    });
  }, [language]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-kairo-chat', handleOpenChat);
    return () => window.removeEventListener('open-kairo-chat', handleOpenChat);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response: any = await chatSessionRef.current.sendMessage({ message: userMsg });
      const text = response.text || (language === 'ar' ? 'عذرًا، لم أستطع توليد رد الآن. حاول مرة أخرى بعد لحظات.' : "I'm having trouble connecting right now.");
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: language === 'ar' ? 'عذرًا، تعذر إكمال الطلب الآن. تحقق من الاتصال وحاول مجددًا.' : "I apologize, but I'm currently unable to process that request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <MotionButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 ${dir === 'rtl' ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-[70] rounded-full p-3.5 shadow-2xl transition-all sm:bottom-6 sm:p-4 ${isOpen ? 'bg-gray-800 text-white' : 'bg-kairo-green text-white'}`}
        aria-label={isOpen ? (language === 'ar' ? 'تصغير المحادثة' : 'Minimize chat') : (language === 'ar' ? 'فتح مساعد كايرو' : 'Open Kairo assistant')}
      >
        {isOpen ? <Minimize2 className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </MotionButton>

      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed inset-x-3 bottom-20 z-[65] h-[min(680px,calc(100dvh-6.25rem))] overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:bottom-24 sm:w-[400px] sm:rounded-3xl ${dir === 'rtl' ? 'sm:left-6' : 'sm:right-6'} flex flex-col ${isLight ? 'bg-white/95 border-gray-200' : 'bg-black/95 border-white/10'}`}
            dir={dir}
          >
            <div className={`p-4 border-b flex justify-between items-center ${isLight ? 'bg-gray-50' : 'bg-white/5'}`}>
              <div className="flex items-center gap-3">
                <KairoBrandMark className="h-14 aspect-[822/938]" />
                <div>
                  <h3 className={`font-bold text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>Kairo AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">{activeModel}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-kairo-green text-white rounded-tr-none' 
                        : (isLight ? 'bg-gray-100 text-gray-800' : 'bg-white/10 text-gray-200') + ' rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className={`p-4 rounded-2xl rounded-tl-none flex items-center gap-2 ${isLight ? 'bg-gray-100' : 'bg-white/10'}`}>
                      <Loader2 className="w-4 h-4 text-kairo-green animate-spin" />
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={`p-4 border-t ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={language === 'ar' ? 'اكتب نصًا أو اسأل كايرو...' : 'Paste text or ask Kairo...'}
                  aria-label={language === 'ar' ? 'رسالتك إلى كايرو' : 'Your message to Kairo'}
                  className={`flex-1 bg-transparent text-sm focus:outline-none ${isLight ? 'text-gray-900' : 'text-white'}`}
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim() || isLoading}
                  className="text-kairo-green hover:scale-110 disabled:opacity-50 transition-all p-1"
                >
                  <Send className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

export default KairoChat;
