import React, { useState, useEffect } from 'react';
import { MessageSquare, BookOpen, Menu, Film, Sparkles, X, Hand, Anchor, Flame, Snowflake, Shield, Box, Mic, Activity, ChevronLeft, ChevronRight, Quote, Zap, Radio, LogOut, Lock, ArrowLeft, PlayCircle, Layers, CheckCircle, Globe, Star, Eye, Heart, HandMetal, History, Trophy, Target, Cpu } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import VideoStudio from './components/VideoGenerator'; // This is now the Unified Media Studio
import LiveSession from './components/LiveSession';
import HistoryView from './components/HistoryView';
import AuthScreen from './components/AuthScreen';
import { EXERCISES, STAGES, STAGE_QUOTES } from './constants';
import { AppView, Exercise, Stage, HistoryItem } from './types';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('deir_user'));
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem('deir_username'));
  
  const [currentView, setCurrentView] = useState<AppView>(AppView.Exercises);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [stageTab, setStageTab] = useState<'exercises' | 'studio'>('exercises'); 
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Stages State with Persistence (Robust Merge)
  const [stages, setStages] = useState<Stage[]>(() => {
    try {
      const saved = localStorage.getItem('deir_stages_progress');
      if (saved) {
        const parsedSaved: Stage[] = JSON.parse(saved);
        // Merge saved progress (locked, completed) with fresh content from STAGES constant
        return STAGES.map(defaultStage => {
          const savedStage = parsedSaved.find(s => s.id === defaultStage.id);
          if (savedStage) {
            return {
              ...defaultStage, // Use fresh titles, descriptions, categories
              locked: savedStage.locked,
              completed: savedStage.completed
            };
          }
          return defaultStage;
        });
      }
    } catch (e) {
      console.error("Error parsing stages from local storage", e);
    }
    return STAGES;
  });

  // Exercises Completion State
  const [completedExercises, setCompletedExercises] = useState<string[]>(() => {
    const saved = localStorage.getItem('deir_completed_exercises');
    return saved ? JSON.parse(saved) : [];
  });

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('deir_chat_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Save stages progress
  useEffect(() => {
    localStorage.setItem('deir_stages_progress', JSON.stringify(stages));
  }, [stages]);

  // Save completed exercises
  useEffect(() => {
    localStorage.setItem('deir_completed_exercises', JSON.stringify(completedExercises));
  }, [completedExercises]);

  // Save history progress
  useEffect(() => {
    localStorage.setItem('deir_chat_history', JSON.stringify(history));
  }, [history]);

  // CHECK UNLOCK CONDITIONS FOR SEMINARS
  useEffect(() => {
      let stagesUpdated = false;
      const newStages = [...stages];

      // 1. Unlock Egregors 1 if Stage 4 is completed
      const stage4Index = newStages.findIndex(s => s.id === '4');
      const seminar1Index = newStages.findIndex(s => s.id === 'sem_egr_1');
      
      if (stage4Index !== -1 && seminar1Index !== -1) {
          if (newStages[stage4Index].completed && newStages[seminar1Index].locked) {
              newStages[seminar1Index] = { ...newStages[seminar1Index], locked: false };
              stagesUpdated = true;
          }
      }

      // 2. Unlock Egregors 2 if Egregors 1 is completed
      const seminar2Index = newStages.findIndex(s => s.id === 'sem_egr_2');
      if (seminar1Index !== -1 && seminar2Index !== -1) {
          if (newStages[seminar1Index].completed && newStages[seminar2Index].locked) {
              newStages[seminar2Index] = { ...newStages[seminar2Index], locked: false };
              stagesUpdated = true;
          }
      }

      if (stagesUpdated) {
          setStages(newStages);
      }
  }, [stages]); 

  // Widget States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Quote Rotator State
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Determine which quotes to show based on context
  const getActiveQuotes = () => {
      if (selectedStage) {
          // Try exact stage ID match (e.g. '5.1' or 'sem_egr_1')
          if (STAGE_QUOTES[selectedStage]) return STAGE_QUOTES[selectedStage];
          
          // Try major level match (e.g. '5')
          const majorLevel = selectedStage.split('.')[0];
          if (STAGE_QUOTES[majorLevel]) return STAGE_QUOTES[majorLevel];
      }
      return STAGE_QUOTES['general'];
  };

  const activeQuotes = getActiveQuotes();
  // Ensure we don't access out of bounds if quotes array changes size before effect runs
  const safeQuoteIndex = currentQuoteIndex % activeQuotes.length;
  const currentQuote = activeQuotes[safeQuoteIndex];

  // Reset quote index when stage changes
  useEffect(() => {
      setCurrentQuoteIndex(0);
  }, [selectedStage]);

  // Auto-rotate quotes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % activeQuotes.length);
    }, 10000); 
    return () => clearInterval(timer);
  }, [activeQuotes.length]);

  const handleLogin = (email: string) => {
    localStorage.setItem('deir_user', email);
    setUser(email);
  };

  const handleSetUserName = (name: string) => {
    localStorage.setItem('deir_username', name);
    setUserName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('deir_user');
    setUser(null);
    setCurrentView(AppView.Exercises);
    setSelectedStage(null);
    setStageTab('exercises');
    setIsChatOpen(false);
    setIsVoiceOpen(false);
  };

  const addToHistory = (question: string, answer: string, exercise?: Exercise | null) => {
      let activeStage = stages.find(s => !s.locked);
      if (exercise) {
          activeStage = stages.find(s => s.id === exercise.stageId);
      }
      if (!activeStage) activeStage = stages[0];

      const newItem: HistoryItem = {
          id: Date.now().toString(),
          question,
          answer,
          stageId: activeStage.id,
          stageTitle: `${activeStage.title}: ${activeStage.subtitle}`,
          exerciseTitle: exercise ? exercise.title : undefined,
          mode: exercise ? 'Exercise' : 'General',
          timestamp: new Date().toISOString()
      };

      setHistory(prev => [newItem, ...prev]);
  };

  const toggleExerciseCompletion = (exerciseId: string) => {
      setCompletedExercises(prev => {
          if (prev.includes(exerciseId)) {
              return prev.filter(id => id !== exerciseId);
          } else {
              return [...prev, exerciseId];
          }
      });
  };

  const nextQuote = () => setCurrentQuoteIndex((prev) => (prev + 1) % activeQuotes.length);
  const prevQuote = () => setCurrentQuoteIndex((prev) => (prev - 1 + activeQuotes.length) % activeQuotes.length);

  const handleCompleteStage = () => {
    if (!selectedStage) return;
    
    const currentIndex = stages.findIndex(s => s.id === selectedStage);
    if (currentIndex === -1) return;

    const newStages = [...stages];
    newStages[currentIndex] = { ...newStages[currentIndex], completed: true };

    if (currentIndex + 1 < newStages.length) {
        if (newStages[currentIndex + 1].category === 'Main') {
             newStages[currentIndex + 1] = { ...newStages[currentIndex + 1], locked: false };
        }
    }

    setStages(newStages);
    setSelectedStage(null); 
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'hand': return <Hand size={32} className="text-purple-300" />;
      case 'anchor': return <Anchor size={32} className="text-cyan-300" />;
      case 'flame': return <Flame size={32} className="text-rose-300" />;
      case 'snowflake': return <Snowflake size={32} className="text-sky-300" />;
      case 'shield': return <Shield size={32} className="text-indigo-300" />;
      case 'box': return <Box size={32} className="text-amber-300" />;
      case 'harmonization': return <Activity size={32} className="text-pink-300" />;
      case 'star': return <Star size={32} className="text-yellow-300" />;
      case 'zap': return <Zap size={32} className="text-orange-300" />;
      case 'eye': return <Eye size={32} className="text-teal-300" />;
      case 'hand-stop': return <HandMetal size={32} className="text-red-300" />;
      case 'heart': return <Heart size={32} className="text-rose-400" />;
      case 'globe': return <Globe size={32} className="text-blue-400" />;
      case 'battery-charging': return <Zap size={32} className="text-yellow-400" />;
      case 'mask': return <Layers size={32} className="text-purple-400" />;
      case 'grid': return <Layers size={32} className="text-indigo-400" />;
      case 'wifi': return <Radio size={32} className="text-blue-400" />;
      case 'shield-alert': return <Shield size={32} className="text-red-400" />;
      case 'help-circle': return <BookOpen size={32} className="text-emerald-400" />;
      case 'wind': return <Activity size={32} className="text-cyan-400" />;
      case 'focus': return <Eye size={32} className="text-amber-400" />;
      case 'users': return <Globe size={32} className="text-indigo-400" />;
      case 'target': return <Target size={32} className="text-rose-400" />;
      case 'cpu': return <Cpu size={32} className="text-cyan-400" />;
      default: return <BookOpen size={32} className="text-slate-300" />;
    }
  };

  const renderStageCard = (stage: Stage) => {
      const stageExercises = EXERCISES.filter(e => e.stageId === stage.id);
      const completedCount = stageExercises.filter(e => completedExercises.includes(e.id)).length;
      const progressPercent = stageExercises.length > 0 ? Math.round((completedCount / stageExercises.length) * 100) : 0;

      return (
        <div 
          key={stage.id}
          onClick={() => {
              if (!stage.locked) {
                  setSelectedStage(stage.id);
                  setStageTab('exercises'); 
              }
          }}
          className={`relative group p-6 rounded-3xl border transition-all duration-500 overflow-hidden backdrop-blur-md min-h-[280px] flex flex-col justify-between ${
            stage.locked 
            ? 'bg-slate-900/40 border-slate-800 cursor-not-allowed opacity-75 grayscale' 
            : stage.completed 
                ? 'bg-emerald-900/10 border-emerald-500/30 cursor-pointer hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)]'
                : 'bg-[#0f1021]/60 border-purple-500/20 cursor-pointer hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)] hover:border-purple-400/40'
          }`}
        >
           <div className="absolute -bottom-6 -right-6 text-[120px] font-serif font-black text-white/5 group-hover:text-purple-500/10 transition-colors pointer-events-none select-none z-0">
              {stage.level}
           </div>

           <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${stage.locked ? 'bg-slate-800 text-slate-500' : stage.completed ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30' : 'bg-purple-900/30 text-purple-300 border border-purple-500/20'}`}>
                 {stage.category === 'Seminar' ? 'Спецкурс' : `Ступень ${stage.level}`}
              </div>
              {stage.locked ? (
                 <Lock size={20} className="text-slate-600" />
              ) : stage.completed ? (
                 <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <CheckCircle size={16} className="text-white fill-white stroke-emerald-600" />
                 </div>
              ) : (
                 <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <PlayCircle size={16} className="text-white fill-white" />
                 </div>
              )}
           </div>

           <div className="relative z-10">
               <h3 className={`text-2xl font-serif mb-1 font-bold ${stage.locked ? 'text-slate-400' : 'text-white group-hover:text-purple-200'} transition-colors`}>
                  {stage.subtitle}
               </h3>
               <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-4">{stage.title}</p>
               
               <p className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-3">
                  {stage.description}
               </p>
           </div>

           {!stage.locked && (
             <div className="relative z-10 mt-auto">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                   <span>Прогресс освоения навыков</span>
                   <span className={progressPercent === 100 ? "text-emerald-400 font-bold" : "text-purple-300"}>{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                    style={{ width: `${progressPercent}%` }}
                    className={`h-full transition-all duration-1000 ${progressPercent === 100 ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-purple-500"}`}>
                   </div>
                </div>
             </div>
           )}

           {stage.locked && (
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <span className="bg-black/80 px-4 py-2 rounded-lg text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                      <Lock size={12}/> 
                      {stage.id === 'sem_egr_2' ? 'Нужен семинар Эгрегоры-1' : stage.category === 'Seminar' ? 'Нужна IV ступень' : 'Доступ закрыт'}
                  </span>
              </div>
           )}
        </div>
      );
  };

  const renderContent = () => {
        if (currentView === AppView.History) {
            return (
                 <HistoryView history={history} />
            );
        }

        // --- STAGES LIST VIEW ---
        if (!selectedStage) {
          const mainStages = stages.filter(s => !s.category || s.category === 'Main');
          const seminarStages = stages.filter(s => s.category === 'Seminar');

          return (
             <div className="h-full overflow-y-auto custom-scrollbar pb-24 p-4 md:p-8">
                <div className="mb-8">
                  <h2 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-emerald-100 mb-2 tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] filter">
                    Путь Развития
                  </h2>
                  <p className="text-slate-400 text-sm">Добро пожаловать, <span className="text-purple-300 font-medium">{userName || user}</span>. Ваш прогресс фиксируется в Энерго-Информационном Поле.</p>
                </div>
                
                {/* Main Stages Group */}
                <div className="mb-10">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Layers size={14}/> Основная Программа
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {mainStages.map(renderStageCard)}
                    </div>
                </div>

                {/* Seminars Group */}
                {seminarStages.length > 0 && (
                    <div className="mb-24">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Star size={14}/> Специальные Семинары
                        </h3>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {seminarStages.map(renderStageCard)}
                        </div>
                    </div>
                )}
             </div>
          );
        }

        // --- UNIFIED STAGE EXERCISES VIEW ---
        const activeStage = stages.find(s => s.id === selectedStage);
        const stageExercises = EXERCISES.filter(e => e.stageId === selectedStage);

        return (
          <div className="h-full flex flex-col animate-in slide-in-from-right-4 duration-500">
            {stageTab === 'exercises' && (
                <div className="flex-none mb-6 flex items-center gap-4 px-4 md:px-8 pt-4 md:pt-8">
                     <button 
                       onClick={() => setSelectedStage(null)}
                       className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                     >
                        <ArrowLeft size={20} />
                     </button>
                     <div>
                        <h2 className="text-3xl font-serif text-white tracking-wide flex items-center gap-3">
                            {activeStage ? `${activeStage.title}: ${activeStage.subtitle}` : 'Загрузка...'}
                            {activeStage?.completed && <CheckCircle size={24} className="text-emerald-500" />}
                        </h2>
                        <p className="text-slate-400 text-sm">{activeStage?.description}</p>
                     </div>
                </div>
            )}

            {stageTab !== 'exercises' && (
                 <button 
                    onClick={() => setStageTab('exercises')}
                    className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur border border-white/10 text-white transition-colors"
                 >
                    <ArrowLeft size={20} />
                 </button>
            )}

            <div className={`flex-none flex gap-2 mb-6 ${stageTab === 'exercises' ? 'bg-slate-900/50 p-1.5 rounded-xl border border-white/5 w-fit mx-4 md:mx-8' : 'absolute top-4 left-16 z-50 bg-black/60 p-1 rounded-lg border border-white/10 backdrop-blur'}`}>
                <button 
                    onClick={() => setStageTab('exercises')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${stageTab === 'exercises' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <BookOpen size={16} /> <span className={stageTab !== 'exercises' ? 'hidden md:inline' : ''}>Практикум</span>
                </button>
                <button 
                    onClick={() => setStageTab('studio')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${stageTab === 'studio' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Sparkles size={16} /> <span className={stageTab !== 'exercises' ? 'hidden md:inline' : ''}>Медиа Студия</span>
                </button>
            </div>
            
            <div className="flex-1 overflow-hidden min-h-0 relative">
                {stageTab === 'exercises' && (
                    <div className="h-full overflow-y-auto px-4 md:px-8 custom-scrollbar pb-20">
                        {stageExercises.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-8">
                            {stageExercises.map((exercise) => {
                                const isCompleted = completedExercises.includes(exercise.id);
                                return (
                                <div 
                                key={exercise.id}
                                onClick={() => setSelectedExercise(exercise)}
                                className={`relative group p-6 rounded-3xl border cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.4)] backdrop-blur-md overflow-hidden flex flex-col justify-between min-h-[260px] ${
                                    isCompleted
                                    ? 'bg-emerald-900/10 border-emerald-500/30'
                                    : selectedExercise?.id === exercise.id 
                                        ? 'bg-purple-900/40 border-purple-400/60 shadow-[0_0_30px_rgba(168,85,247,0.3)]' 
                                        : 'bg-[#0f1021]/60 border-white/10 hover:border-purple-400/30 hover:bg-[#1a1b35]/80'
                                }`}
                                >
                                <div className={`absolute -inset-1 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500 ${isCompleted ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}></div>
                                
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-purple-400/50">
                                    <Sparkles size={60} />
                                </div>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className={`p-4 rounded-2xl border transition-all duration-300 shadow-lg ${
                                        isCompleted
                                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                                        : selectedExercise?.id === exercise.id 
                                            ? 'bg-purple-500/20 border-purple-400/40' 
                                            : 'bg-black/20 border-white/5 group-hover:border-purple-400/30'
                                    }`}>
                                        {isCompleted ? <CheckCircle size={32} className="text-emerald-400"/> : getIcon(exercise.icon)}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`w-2 h-2 rounded-full ${
                                        exercise.difficulty === 'Beginner' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' :
                                        exercise.difficulty === 'Intermediate' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' :
                                        'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.8)]'
                                        }`}></span>
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <h3 className={`text-xl font-serif mb-3 font-medium tracking-wide transition-colors ${isCompleted ? 'text-emerald-100' : 'text-white group-hover:text-purple-200'} transition-colors`}>
                                        {exercise.title}
                                    </h3>
                                    <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed group-hover:text-white transition-colors opacity-80">{exercise.description}</p>
                                </div>
                                
                                {isCompleted && (
                                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider relative z-10">
                                        <Trophy size={14} /> Навык освоен
                                    </div>
                                )}
                                </div>
                            );
                            })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <BookOpen size={64} className="text-slate-600 mb-4" />
                                <p className="text-slate-400 text-lg font-serif">Материалы этой ступени пока формируются в Энерго-Информационном Поле...</p>
                            </div>
                        )}
                        
                        {!activeStage?.completed && (
                            <div className="mt-4 flex justify-center pb-24">
                                <button
                                    onClick={handleCompleteStage}
                                    className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg hover:shadow-emerald-500/20 transition-all hover:scale-105 flex items-center gap-3 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    <CheckCircle className="w-6 h-6 text-white" />
                                    <span className="font-bold text-white tracking-wider">ЗАВЕРШИТЬ СТУПЕНЬ</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {stageTab === 'studio' && (
                     <div className="h-full w-full absolute inset-0">
                        <VideoStudio activeStage={activeStage} />
                    </div>
                )}
            </div>
            
            {/* Modal for Exercise Details */}
            {selectedExercise && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setSelectedExercise(null)}>
                  <div className="bg-[#0f1021] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(147,51,234,0.3)] p-8 relative animate-in zoom-in-95 duration-300 ring-1 ring-white/10 custom-scrollbar flex flex-col" onClick={e => e.stopPropagation()}>
                    
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]"></div>
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px]"></div>
                    </div>

                    <button onClick={() => setSelectedExercise(null)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-20">
                        <X size={20} className="text-slate-300" />
                    </button>
                    
                    <div className="relative z-10 flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                        <div className={`p-5 rounded-2xl border shadow-[0_0_20px_rgba(168,85,247,0.15)] ${completedExercises.includes(selectedExercise.id) ? 'bg-gradient-to-br from-emerald-900/30 to-black border-emerald-500/30' : 'bg-gradient-to-br from-purple-900/30 to-black border-purple-500/30'}`}>
                            {completedExercises.includes(selectedExercise.id) ? <CheckCircle size={32} className="text-emerald-400"/> : getIcon(selectedExercise.icon)}
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-serif text-white mt-1 drop-shadow-md tracking-tight">{selectedExercise.title}</h2>
                            <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest">{selectedExercise.step}</p>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-8 text-slate-200 text-lg font-light leading-relaxed mb-8 flex-1">
                        <div>
                             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Суть практики</h3>
                             <p className="text-slate-200">{selectedExercise.description}</p>
                        </div>
                        <div className="bg-[#131426] p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                             <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10">
                                <Sparkles size={16}/> Алгоритм
                             </h3>
                             <p className="whitespace-pre-line relative z-10">{selectedExercise.instruction}</p>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col gap-4">
                        <button 
                            onClick={() => toggleExerciseCompletion(selectedExercise.id)}
                            className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all shadow-lg flex items-center justify-center gap-3 transform active:scale-95 ${
                                completedExercises.includes(selectedExercise.id)
                                ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-900/40'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-500/20 hover:-translate-y-1'
                            }`}
                        >
                            {completedExercises.includes(selectedExercise.id) ? (
                                <>
                                    <CheckCircle size={22} />
                                    <span>НАВЫК ЗАКРЕПЛЕН (Снять отметку)</span>
                                </>
                            ) : (
                                <>
                                    <Trophy size={22} />
                                    <span>Я ОСВОИЛ ЭТОТ НАВЫК</span>
                                </>
                            )}
                        </button>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setIsChatOpen(true)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <MessageSquare size={18} />
                                <span className="text-sm">Обсудить в Чате</span>
                            </button>
                            <button 
                                onClick={() => setIsVoiceOpen(true)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Mic size={18} />
                                <span className="text-sm">Голосовой Ментор</span>
                            </button>
                        </div>
                    </div>

                  </div>
              </div>
            )}
          </div>
        );
  };

  const NavButton = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden active:scale-95 ${
        currentView === view 
        ? 'bg-white/5 text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-purple-500/30 backdrop-blur-md' 
        : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
      }`}
    >
      {currentView === view && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-indigo-500 shadow-[0_0_15px_#a855f7]"></div>
      )}
      <Icon size={24} className={`transition-colors ${currentView === view ? "text-purple-300" : "group-hover:text-purple-300"}`} />
      <span className="font-medium tracking-wide text-sm">{label}</span>
    </button>
  );

  const toggleWidget = (widget: 'chat' | 'voice') => {
      if (widget === 'chat') {
          setIsChatOpen(!isChatOpen);
      } else {
          setIsVoiceOpen(!isVoiceOpen);
          if (!isVoiceOpen) setIsChatOpen(false);
      }
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-black text-slate-200 overflow-hidden font-sans selection:bg-purple-500/30 relative pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#02040a]"></div>
          
          <div className="absolute inset-0 opacity-60" style={{
              backgroundImage: 'radial-gradient(white 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              backgroundPosition: '0 0, 25px 25px'
          }}></div>

          <div className="absolute top-[-30%] left-[-10%] w-[1200px] h-[1200px] bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-transparent rounded-full blur-[150px] mix-blend-screen animate-pulse duration-[15s]"></div>
          <div className="absolute bottom-[-30%] right-[-10%] w-[1000px] h-[1000px] bg-gradient-to-tl from-emerald-900/20 via-cyan-900/20 to-transparent rounded-full blur-[150px] mix-blend-screen animate-pulse duration-[20s]"></div>
          
          <div className="absolute inset-0 opacity-30">
             <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] animate-pulse"></div>
          </div>
      </div>

      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#080914]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-30 w-full shrink-0">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                 <Zap size={16} className="text-white fill-white" />
             </div>
             <h1 className="text-lg font-serif text-white font-bold tracking-tight">DEIR.AI</h1>
          </div>
          <button 
            className="p-2 bg-slate-800/50 rounded-lg border border-slate-700 active:scale-95 transition-transform text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
      )}

      {/* --- SIDEBAR DRAWER --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 md:relative md:z-0 w-[85vw] max-w-[320px] md:w-96 h-full bg-[#080914]/95 md:bg-[#080914]/70 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 shadow-2xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="absolute right-0 top-0 bottom-0 w-[1px] overflow-hidden bg-white/5 pointer-events-none">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent h-[50%] animate-flow-down opacity-50 blur-[1px]"></div>
        </div>

        {/* Sidebar Header */}
        <div className="p-6 md:p-8 pb-4 flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                 <Zap size={20} className="text-white fill-white" />
             </div>
             <div>
                <h1 className="text-xl md:text-2xl font-serif text-white font-bold tracking-tight leading-none">
                    DEIR<span className="text-purple-300">.AI</span>
                </h1>
                <p className="text-[10px] text-purple-200/60 uppercase tracking-[0.2em] mt-1">Система Навыков</p>
             </div>
          </div>
          {/* Close Button for Mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info (Truncated properly) */}
        <div className="px-6 mb-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                    {userName ? userName.charAt(0).toUpperCase() : user?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                        {userName || user}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                        {user}
                    </p>
                </div>
            </div>
        </div>

        <nav className="flex-1 px-4 space-y-3 mt-2 relative z-10 overflow-y-auto custom-scrollbar">
          <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <div className="h-[1px] w-4 bg-slate-700"></div> Меню
          </div>
          <NavButton view={AppView.Exercises} icon={Layers} label="Ступени Развития" />
          <NavButton view={AppView.History} icon={History} label="История" />
        </nav>

        {/* Enhanced Quote Card */}
        <div className="px-6 pt-4 relative z-10 mt-auto mb-[env(safe-area-inset-bottom)]">
           <div className="relative group p-5 rounded-2xl border overflow-hidden min-h-[160px] flex flex-col justify-between transition-all hover:-translate-y-1 shadow-xl backdrop-blur-xl bg-slate-900/40 border-white/5">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent opacity-50"></div>
               <Quote size={24} className="absolute top-3 right-3 text-white/5 rotate-12" />

               <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <p key={safeQuoteIndex} className="text-sm md:text-base text-slate-200 italic font-serif leading-relaxed animate-in fade-in">
                       "{currentQuote.text}"
                    </p>
               </div>

               <div className="mt-3 flex items-center justify-between relative z-10 border-t border-white/5 pt-2">
                   <div className="text-[10px] text-purple-300 font-bold uppercase tracking-widest flex items-center gap-1">
                       <BookOpen size={10} /> {currentQuote.author}
                   </div>
                   
                   <div className="flex gap-1">
                       <button onClick={prevQuote} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                           <ChevronLeft size={14} />
                       </button>
                       <button onClick={nextQuote} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                           <ChevronRight size={14} />
                       </button>
                   </div>
               </div>
           </div>
        </div>

        {/* Logout Button */}
        <div className="px-4 my-4 z-20 pb-safe">
            <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 hover:bg-rose-900/20 text-slate-400 hover:text-rose-300 border border-transparent hover:border-rose-900/30 transition-all active:scale-95"
            >
                <LogOut size={18} />
                <span className="text-sm font-medium">Выйти</span>
            </button>
        </div>

      </aside>

      <main className="flex-1 relative overflow-hidden z-10 flex flex-col min-w-0 min-h-0">
        {/* Content Area - Fixed Layout for Scrolling */}
        <div className="relative flex-1 max-w-7xl mx-auto z-10 w-full h-full flex flex-col overflow-hidden">
          {renderContent()}
        </div>

        {/* --- MODALS & WIDGETS --- */}

        {isVoiceOpen && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500">
                <div className="relative w-full max-w-5xl h-[90vh] rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.3)] border border-purple-500/20 animate-in zoom-in-75 duration-500 bg-[#0f1021]">
                     <button 
                        onClick={() => toggleWidget('voice')} 
                        className="absolute top-6 right-6 z-50 p-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors backdrop-blur-xl border border-white/5"
                     >
                        <X size={24} />
                     </button>
                    <LiveSession 
                        stages={stages} 
                        activeExercise={selectedExercise} 
                        userName={userName}
                        onSaveHistory={(q, a) => addToHistory(q, a, selectedExercise)} 
                    />
                </div>
            </div>
        )}

        {/* --- CHAT WINDOW CONTAINER (Bottom Right) --- */}
        {isChatOpen && (
            <div className="fixed bottom-0 right-0 md:bottom-4 md:right-8 z-50 pointer-events-auto w-full md:w-[400px] h-[80vh] md:h-[600px] bg-[#0f1021]/95 backdrop-blur-2xl rounded-t-3xl md:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t md:border border-white/10 overflow-hidden animate-in slide-in-from-bottom-10 zoom-in-95 origin-bottom-right flex flex-col ring-1 ring-white/5 pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                                <Sparkles size={14} className="text-white" />
                            </div>
                            <span className="text-sm font-bold text-slate-200">
                            {selectedExercise ? selectedExercise.title : "Ментор ДЭИР"}
                            </span>
                    </div>
                    <button onClick={() => toggleWidget('chat')} className="p-1 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-hidden">
                    <ChatInterface 
                        isWidget={true} 
                        stages={stages} 
                        activeExercise={selectedExercise}
                        userName={userName}
                        onSetUserName={handleSetUserName}
                        onSaveHistory={(q, a) => addToHistory(q, a, selectedExercise)}
                    />
                </div>
            </div>
        )}

        {/* --- SIDE WIDGETS (Right Center Vertical) --- */}
        <div className="fixed top-1/2 right-4 -translate-y-1/2 z-40 flex flex-col items-center gap-6 pointer-events-none">
            
             {/* Voice Button */}
             <div className="pointer-events-auto">
                 <button
                    onClick={() => toggleWidget('voice')}
                    className={`group relative w-12 h-12 md:w-16 md:h-16 rounded-full transition-all duration-500 flex items-center justify-center active:scale-95 ${
                        isVoiceOpen 
                        ? 'scale-0 opacity-0' 
                        : 'bg-black/80 backdrop-blur border border-purple-500/30 hover:scale-110 hover:border-purple-500/60 shadow-lg hover:shadow-purple-500/40'
                    }`}
                    title="Голос Вселенной"
                 >
                    <div className="absolute inset-1 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-black animate-pulse-slow opacity-60 group-hover:opacity-100"></div>
                    <Radio size={20} className="relative z-10 text-purple-200 group-hover:text-white transition-colors md:w-7 md:h-7" />
                 </button>
             </div>
             
             {/* Chat Button */}
             <div className="pointer-events-auto">
                 <button
                    onClick={() => toggleWidget('chat')}
                    className={`group relative w-12 h-12 md:w-14 md:h-14 rounded-full transition-all duration-300 border flex items-center justify-center active:scale-95 ${
                        isChatOpen 
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.6)] scale-110' 
                        : 'bg-[#1a1b35]/80 backdrop-blur-xl border-white/10 text-slate-300 hover:text-white hover:border-indigo-500 hover:bg-white/10 shadow-lg'
                    }`}
                    title="Чат"
                 >
                    <MessageSquare size={20} className="md:w-6 md:h-6" />
                 </button>
             </div>
        </div>
        
        <style>{`
          @keyframes flow-down {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          @keyframes flow-up {
            0% { transform: translateY(100%); }
            100% { transform: translateY(-100%); }
          }
          .animate-flow-down {
            animation: flow-down 3s linear infinite;
          }
          .animate-flow-up {
            animation: flow-up 4s linear infinite;
          }
          .animate-pulse-slow {
             animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          .animate-spin-slow {
            animation: spin 8s linear infinite;
          }
          .animate-spin-reverse-slow {
            animation: spin 12s linear infinite reverse;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          /* Utilities */
          .pb-safe {
              padding-bottom: env(safe-area-inset-bottom);
          }
        `}</style>
      </main>
    </div>
  );
};

export default App;