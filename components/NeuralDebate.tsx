import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, ShieldAlert, Sparkles, Send, Terminal, Cpu, Play } from 'lucide-react';
import { runDebateStream } from '../services/geminiService';

const NeuralDebate: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isDebating, setIsDebating] = useState(false);
  const [fullLog, setFullLog] = useState('');
  const [sections, setSections] = useState({
    init: '',
    critique: '',
    rebuttal: '',
    final: ''
  });
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll as content streams in
  useEffect(() => {
    if (isDebating && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [fullLog, isDebating]);

  // Parse the stream into sections
  useEffect(() => {
    const parseLog = (text: string) => {
      const parts = {
        init: '',
        critique: '',
        rebuttal: '',
        final: ''
      };

      const initMatch = text.split('[AGENT_A_INIT]')[1]?.split('[AGENT_B_CRITIQUE]')[0];
      const critiqueMatch = text.split('[AGENT_B_CRITIQUE]')[1]?.split('[AGENT_A_REBUTTAL]')[0];
      const rebuttalMatch = text.split('[AGENT_A_REBUTTAL]')[1]?.split('[FINAL_PLAN]')[0];
      const finalMatch = text.split('[FINAL_PLAN]')[1];

      if (initMatch) parts.init = initMatch.trim();
      if (critiqueMatch) parts.critique = critiqueMatch.trim();
      if (rebuttalMatch) parts.rebuttal = rebuttalMatch.trim();
      if (finalMatch) parts.final = finalMatch.trim();

      setSections(parts);
    };

    parseLog(fullLog);
  }, [fullLog]);

  const handleStartDebate = async () => {
    if (!topic.trim() || isDebating) return;

    setIsDebating(true);
    setFullLog('');
    setSections({ init: '', critique: '', rebuttal: '', final: '' });

    try {
      const stream = runDebateStream(topic);
      for await (const chunk of stream) {
        if (chunk) {
          setFullLog(prev => prev + chunk);
        }
      }
    } catch (e) {
      console.error(e);
      setFullLog(prev => prev + "\n\n[SYSTEM ERROR]: Neural Link Disconnected.");
    } finally {
      setIsDebating(false);
    }
  };

  const renderSection = (title: string, content: string, icon: any, colorClass: string, bgClass: string) => {
    if (!content && !isDebating) return null;
    
    // Typing effect if content is the last one being updated
    const isActive = isDebating && !sections.final && (
       (!sections.critique && title === 'Шаг 1: Идея (Стратег)') ||
       (sections.init && !sections.rebuttal && title === 'Шаг 2: Критика (Скептик)') ||
       (sections.critique && !sections.final && title === 'Шаг 3: Ответ (Опровержение)') ||
       (sections.rebuttal && title === 'Шаг 4: Итог (Корректировка)')
    );

    if (!content && !isActive) return null;

    return (
      <div className={`p-6 rounded-2xl border ${bgClass} backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500 mb-6 shadow-xl`}>
        <div className={`flex items-center gap-3 mb-4 ${colorClass}`}>
          {icon}
          <h3 className="font-serif text-lg font-bold tracking-wide">{title}</h3>
          {isActive && <div className="ml-auto flex gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-100"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-200"></div>
          </div>}
        </div>
        <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
            {content || <span className="opacity-50 italic">Генерация данных...</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl relative">
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-10" 
           style={{
               backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)',
               backgroundSize: '40px 40px'
           }}>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 bg-slate-900/50 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-900/30 rounded-lg border border-purple-500/30">
                 <BrainCircuit size={24} className="text-purple-400" />
              </div>
              <div>
                  <h2 className="text-2xl font-serif text-white font-medium">Нейро-Дебаты</h2>
                  <p className="text-xs text-slate-400 font-mono">Simulated Agent A/B Protocol</p>
              </div>
           </div>
           {isDebating && <div className="text-xs text-purple-300 animate-pulse font-mono border border-purple-500/30 px-3 py-1 rounded-full">PROCESSING</div>}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
           
           {!sections.init && !isDebating ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <Terminal size={64} className="text-slate-500 mb-6" />
                  <h3 className="text-xl font-serif text-slate-400 mb-2">Система Ожидает Задачу</h3>
                  <p className="max-w-md text-slate-500">
                    Введите тему или проблему. ИИ запустит симуляцию спора между Стратегом и Скептиком для поиска оптимального решения.
                  </p>
              </div>
           ) : (
              <div className="max-w-4xl mx-auto">
                 {/* Step 1: Agent A */}
                 {renderSection(
                     "Шаг 1: Идея (Стратег)", 
                     sections.init, 
                     <BrainCircuit />, 
                     "text-emerald-400", 
                     "bg-emerald-900/10 border-emerald-500/20"
                 )}

                 {/* Step 2: Agent B */}
                 {renderSection(
                     "Шаг 2: Критика (Скептик)", 
                     sections.critique, 
                     <ShieldAlert />, 
                     "text-rose-400", 
                     "bg-rose-900/10 border-rose-500/20"
                 )}

                 {/* Step 3: Rebuttal */}
                 {renderSection(
                     "Шаг 3: Ответ (Опровержение)", 
                     sections.rebuttal, 
                     <Sparkles />, 
                     "text-blue-400", 
                     "bg-blue-900/10 border-blue-500/20"
                 )}

                 {/* Step 4: Final Plan */}
                 {renderSection(
                     "Шаг 4: Итог (Корректировка)", 
                     sections.final, 
                     <Cpu />, 
                     "text-amber-400", 
                     "bg-amber-900/10 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]"
                 )}
                 
                 <div ref={bottomRef} className="h-4" />
              </div>
           )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-slate-900/80 border-t border-slate-700/50 backdrop-blur-md">
           <div className="max-w-4xl mx-auto flex gap-4">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStartDebate()}
                placeholder="Сформулируйте проблему: 'Стоит ли мне переезжать?', 'Как развить бизнес?'..."
                disabled={isDebating}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-500 font-mono text-sm"
              />
              <button
                onClick={handleStartDebate}
                disabled={isDebating || !topic.trim()}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                {isDebating ? <Cpu className="animate-spin" /> : <Play fill="currentColor" />}
                <span className="hidden md:inline">Запуск</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralDebate;