import React from 'react';
import { HistoryItem } from '../types';
import { Clock, MessageSquare, ChevronRight, Bookmark, Mic, Sparkles } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryItem[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
  // Group history by Stage Title
  const groupedHistory = history.reduce((acc, item) => {
    if (!acc[item.stageTitle]) {
      acc[item.stageTitle] = [];
    }
    acc[item.stageTitle].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  // Sort stages keys if needed (optional, simplistic sort here)
  const stageKeys = Object.keys(groupedHistory).sort();

  if (history.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Clock size={40} className="opacity-50" />
        </div>
        <h2 className="text-xl font-serif mb-2">История пуста</h2>
        <p className="text-sm max-w-xs text-center">Здесь будут сохранены ваши диалоги с Ментором и важные инсайты.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar p-4 md:p-8 pb-24">
      <div className="mb-8 flex items-center gap-3">
        <Bookmark className="text-purple-400" size={28} />
        <h2 className="text-3xl font-serif text-white tracking-wide">
          Хроники Развития
        </h2>
      </div>

      <div className="space-y-8 pb-20">
        {stageKeys.map((stageTitle) => (
          <div key={stageTitle} className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
               <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-900/20 px-3 py-1 rounded-full border border-purple-500/30">
                 {stageTitle}
               </span>
            </div>

            <div className="space-y-4">
              {groupedHistory[stageTitle].map((item) => (
                <div 
                  key={item.id} 
                  className="bg-[#131426] border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all shadow-lg group"
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center gap-2 text-slate-400 text-xs">
                        {item.exerciseTitle ? (
                            <span className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                                <Sparkles size={10} className="text-purple-400"/> {item.exerciseTitle}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                                <Mic size={10} className="text-indigo-400"/> Диалог
                            </span>
                        )}
                        <span>{new Date(item.timestamp).toLocaleString('ru-RU')}</span>
                     </div>
                     {item.mode === 'Exercise' && (
                         <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" title="Практика"></div>
                     )}
                  </div>

                  <div className="space-y-3">
                    {/* Question */}
                    <div className="flex gap-3">
                        <div className="mt-1 w-6 h-6 rounded-full bg-indigo-900/50 flex items-center justify-center shrink-0 border border-indigo-500/30">
                            <span className="text-[10px] font-bold text-indigo-300">ВЫ</span>
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed font-medium">{item.question}</p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-2"></div>

                    {/* Answer */}
                    <div className="flex gap-3">
                        <div className="mt-1 w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0 border border-purple-500/30">
                            <span className="text-[10px] font-bold text-purple-300">ИИ</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;