import React, { useState, useRef, useEffect } from 'react';
import { 
  Film, Upload, Loader2, Play, Image as ImageIcon, Sparkles, X, AlertCircle, History, Zap, 
  Shield, MoveVertical, Heart, Cloud, Hand, Eye, Minimize2, Users, Cpu, Target, Move, Wind, GitBranch, Lightbulb, Grid, Compass, ShieldAlert, Edit3, Sun, Layers, Wifi, CircleHelp, Waves, Clock, Activity, Anchor, Download
} from 'lucide-react';
import { generateDeirVideo, generateDeirImage } from '../services/geminiService';
import { Stage } from '../types';
import { EXERCISES } from '../constants';

interface VideoStudioProps {
    activeStage?: Stage;
}

type MediaType = 'VIDEO' | 'IMAGE';

interface GenerationRecord {
    id: string;
    prompt: string;
    result: string; // url
    type: MediaType;
    stageLevel: string;
    timestamp: string;
}

const VideoStudio: React.FC<VideoStudioProps> = ({ activeStage }) => {
  // --- CORE STATE ---
  const [mediaType, setMediaType] = useState<MediaType>('VIDEO');
  const [image, setImage] = useState<string | null>(null); // Source image
  const [resultUrl, setResultUrl] = useState<string | null>(null); // Output URL
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [userPrompt, setUserPrompt] = useState('');
  
  // --- UI STATE ---
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<GenerationRecord[]>([]);

  // --- STRUCTURE TOGGLES (Unified) ---
  // STAGE 1
  const [showEthericBody, setShowEthericBody] = useState(false);
  const [showReferenceState, setShowReferenceState] = useState(false);
  const [showCentralFlows, setShowCentralFlows] = useState(false);
  const [showShell, setShowShell] = useState(false);
  const [showRemoveLesions, setShowRemoveLesions] = useState(false);
  // STAGE 2
  const [showDesires, setShowDesires] = useState(false);
  const [showKarma, setShowKarma] = useState(false);
  const [showProgramLuck, setShowProgramLuck] = useState(false);
  const [showProgramEfficiency, setShowProgramEfficiency] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);
  const [showCharisma, setShowCharisma] = useState(false);
  // STAGE 3
  const [showVision, setShowVision] = useState(false);
  const [showEthericHand, setShowEthericHand] = useState(false);
  const [showSuppression, setShowSuppression] = useState(false);
  const [showMerging, setShowMerging] = useState(false);
  const [showProgram3, setShowProgram3] = useState(false);
  const [showAttention, setShowAttention] = useState(false);
  // STAGE 4
  const [showSoulPoint, setShowSoulPoint] = useState(false);
  const [showAssemblagePoint, setShowAssemblagePoint] = useState(false);
  const [showBreathingAnchor, setShowBreathingAnchor] = useState(false);
  const [showForesight, setShowForesight] = useState(false);
  const [showForking, setShowForking] = useState(false);
  const [showBipolar, setShowBipolar] = useState(false);
  const [showCreatorMode, setShowCreatorMode] = useState(false);
  // STAGE 5
  const [showCoords, setShowCoords] = useState(false);
  const [showStripes, setShowStripes] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [showClosedPath, setShowClosedPath] = useState(false);
  const [showSecondLeg, setShowSecondLeg] = useState(false);
  const [showDirectInfluence, setShowDirectInfluence] = useState(false);
  const [showSlowThoughts, setShowSlowThoughts] = useState(false);
  const [showInnerValues, setShowInnerValues] = useState(false);
  const [showOuterValues, setShowOuterValues] = useState(false);
  const [showOuterChakra, setShowOuterChakra] = useState(false);
  const [showDriveSource, setShowDriveSource] = useState(false);
  const [showMask, setShowMask] = useState(false);
  const [showInnerGrid, setShowInnerGrid] = useState(false);
  const [showOuterGrid, setShowOuterGrid] = useState(false);
  const [showNonMask, setShowNonMask] = useState(false);
  const [showMetaphor, setShowMetaphor] = useState(false);
  const [showCurrents, setShowCurrents] = useState(false);

  const LOADING_MESSAGES = [
    "Синхронизация с эгрегором...",
    "Построение эфирной модели...",
    "Наложение энергетических слоев...",
    "Рендеринг материи...",
    "Финализация визуализации..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    checkApiKey();
  }, []);

  // Reset toggles when stage changes
  useEffect(() => {
     const resetAll = () => {
         setShowEthericBody(false); setShowReferenceState(false); setShowCentralFlows(false); setShowShell(false); setShowRemoveLesions(false);
         setShowDesires(false); setShowKarma(false); setShowProgramLuck(false); setShowProgramEfficiency(false); setShowConfidence(false); setShowCharisma(false);
         setShowVision(false); setShowEthericHand(false); setShowSuppression(false); setShowMerging(false); setShowProgram3(false); setShowAttention(false);
         setShowSoulPoint(false); setShowAssemblagePoint(false); setShowBreathingAnchor(false); setShowForesight(false); setShowForking(false); setShowBipolar(false); setShowCreatorMode(false);
         setShowCoords(false); setShowStripes(false); setShowNavigation(false); setShowClosedPath(false); setShowSecondLeg(false);
         setShowDirectInfluence(false); setShowSlowThoughts(false); setShowInnerValues(false); setShowOuterValues(false); setShowOuterChakra(false);
         setShowDriveSource(false); setShowMask(false); setShowInnerGrid(false); setShowOuterGrid(false); setShowNonMask(false); setShowMetaphor(false); setShowCurrents(false);
     };
     resetAll();
     
     // Set defaults
     const mainLevel = activeStage?.level.split('.')[0];
     if (mainLevel === '1') { setShowEthericBody(true); setShowCentralFlows(true); }
     else if (mainLevel === '2') { setShowDesires(true); }
     else if (mainLevel === '3') { setShowVision(true); }
     else if (mainLevel === '4') { setShowSoulPoint(true); }
     else if (activeStage?.level === '5.1') { setShowCoords(true); }
     else if (activeStage?.level === '5.2') { setShowDirectInfluence(true); }
     else if (activeStage?.level === '5.3') { setShowDriveSource(true); }

  }, [activeStage]);

  const checkApiKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.hasSelectedApiKey) {
      setApiKeySelected(await aistudio.hasSelectedApiKey());
    } else {
      setApiKeySelected(true); 
    }
  };

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.openSelectKey) {
      await aistudio.openSelectKey();
      setApiKeySelected(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResultUrl(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const constructPrompt = () => {
    let prompt = "";
    const level = activeStage ? activeStage.level : '1';
    const mainLevel = level.split('.')[0];

    // Stage 1
    if (mainLevel === '1') {
        if (showEthericBody) prompt += "Show the Etheric Body as a glowing, pulsating outline around the figure, slightly shimmering. ";
        if (showReferenceState) prompt += "The entire scene radiates warm, golden, calm light (Reference State). ";
        if (showCentralFlows) prompt += "Visualize powerful energy flows: Red fire rising up the spine, Blue cool light flowing down. Dynamic movement. ";
        if (showShell) prompt += "A smooth, egg-shaped energy cocoon forms and rotates slowly around the body (Protective Shell). ";
        if (showRemoveLesions) prompt += "Dark smoky clots are being pulled out of the aura and burning up in bright flashes. ";
    } 
    // Stage 2
    else if (mainLevel === '2') {
        if (showDesires) prompt += "Visual comparison: Bright, resonant holographic images vs dull, gray fading images. ";
        if (showKarma) prompt += "Extracting dark, sticky masses from the energy body and dissolving them into light. ";
        if (showProgramLuck) prompt += "A golden sphere in the solar plexus pulsating and expanding, attracting sparkles of luck. ";
        if (showProgramEfficiency) prompt += "A cool blue geometric structure projecting a beam of intent forward. ";
        if (showConfidence) prompt += "A solid, indestructible pillar of white light forming inside the spine. ";
        if (showCharisma) prompt += "Intense modulation of the aura: pulsating waves of Red (power) or Blue (intellect) energy radiating outwards. ";
    }
    // Stage 3
    else if (mainLevel === '3') {
        if (showVision) prompt += "Camera focuses on the haze/mist around the body (Etheric Vision). ";
        if (showEthericHand) prompt += "A ghostly, translucent energy hand extends from the physical body and moves to touch an object. ";
        if (showSuppression) prompt += "A heavy, dark-violet energy blanket descends and covers the target, dampening their glow. ";
        if (showMerging) prompt += "Two energy fields blending and merging together at the solar plexus level. ";
        if (showProgram3) prompt += "A glowing geometric shape (program) flies into the head (Ajna) of the target. ";
        if (showAttention) prompt += "Bright beams of attention energy locking onto the target's eyes. Magnetic pull. ";
    }
    // Stage 4
    else if (mainLevel === '4') {
        if (showSoulPoint) prompt += "A brilliant white star pulsating in the center of the head. ";
        if (showAssemblagePoint) prompt += "The brilliant star moves out of the body, floating above the head or behind the back. ";
        if (showBreathingAnchor) prompt += "The star light pulsates in rhythm with breathing. ";
        if (showForesight) prompt += "The consciousness point shifts forward into a stream of future probabilities (fog of potential). ";
        if (showForking) prompt += "Energy consciousness splits into two glowing centers (Head and Stomach) simultaneously. ";
        if (showBipolar) prompt += "An intense beam connects the top of the head to the sky and the base of the spine to the earth. Bipolar resonance. ";
        if (showCreatorMode) prompt += "The figure radiates blinding white light of pure intention, reshaping the reality around it. ";
    }
    // Stage 5
    else if (level.startsWith('5')) {
        if (showCoords) prompt += "A 3D grid appears around the user, highlighting zones of Light (Good) and Shadow (Bad). ";
        if (showStripes) prompt += "Visualizing life as flowing stripes of black and white. ";
        if (showNavigation) prompt += "A glowing die or coin spins in the air, leaving a trail of probability. ";
        if (showClosedPath) prompt += "A red barrier appears on the path. The aura hardens into a dense shield. ";
        if (showSecondLeg) prompt += "Energy flows divert from a blocked path to a new, open path (glowing green). ";
        if (showDirectInfluence) prompt += "A beam of will pushes a floating event sphere onto a new trajectory line. ";
        if (showSlowThoughts) prompt += "The air becomes viscous and heavy. Time slows down (Slow Thoughts). ";
        if (showInnerValues) prompt += "A timeline behind the user glows. A past event node changes color and shape. ";
        if (showDriveSource) prompt += "A volcanic energy source erupts from below, fueling the scene. ";
        if (showMask) prompt += "Multiple glowing images stack together to form a complex, radiant Mask construct. ";
        if (showCurrents) prompt += "The user surfs on massive, global waves of energy (World Currents). ";
    }

    return prompt;
  };

  const getStageConstraint = () => {
      if (!activeStage) return "Stage 1 (Liberation): Etheric body, Central Flows. NO higher level concepts.";
      const stageExercises = EXERCISES.filter(e => e.stageId === activeStage.id);
      let visualContext = `CURRENT STAGE: ${activeStage.level} - "${activeStage.title}".\n`;
      visualContext += `KEY MEANING: ${activeStage.description}\n`;
      visualContext += `ALLOWED CONCEPTS: ${stageExercises.map(e => `"${e.title}"`).join('; ')}`;
      return visualContext;
  };

  const saveToHistory = (url: string, usedPrompt: string) => {
      const newRecord: GenerationRecord = {
          id: Date.now().toString(),
          prompt: usedPrompt,
          result: url,
          type: mediaType,
          stageLevel: activeStage ? activeStage.level : '1',
          timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [newRecord, ...prev]);
  };

  const handleGenerate = async () => {
    if (isLoading) return;
    if (!apiKeySelected) { handleSelectKey(); return; }

    setIsLoading(true);
    setError(null);
    setResultUrl(null);
    setShowHistory(false);

    try {
      const esotericPrompt = constructPrompt();
      const basePrompt = userPrompt.trim() ? `${userPrompt}. ` : '';
      const finalPrompt = `${basePrompt}${esotericPrompt} Cinematic, magical realism, 8k, glowing energy effects.`.trim();
      const stageContext = getStageConstraint();

      let url: string | null = null;

      if (mediaType === 'VIDEO') {
         // Veo Video Generation
         // Map 1:1 to 16:9 for Veo as 1:1 isn't supported for video usually, or default to 16:9
         const videoRatio = aspectRatio === '1:1' ? '16:9' : aspectRatio;
         url = await generateDeirVideo(image, videoRatio, finalPrompt, stageContext);
      } else {
         // Imagen Image Generation
         url = await generateDeirImage(finalPrompt, '1K', stageContext);
      }

      if (url) {
        setResultUrl(url);
        saveToHistory(url, finalPrompt);
      } else {
        setError("Не удалось сгенерировать медиа. Попробуйте изменить параметры.");
      }
    } catch (err: any) {
      console.error(err);
      if (String(err).includes("403") || String(err).includes("Requested entity was not found")) {
         setApiKeySelected(false);
         setError('Ошибка доступа (403). Проверьте API ключ.');
      } else {
         setError('Произошла ошибка при генерации.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- SUB-COMPONENTS ---
  const ChipToggle = ({ active, onClick, label, icon: Icon, colorClass }: any) => {
      const colors: any = {
          blue: 'border-blue-500 text-blue-100 bg-blue-900/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
          red: 'border-red-500 text-red-100 bg-red-900/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
          purple: 'border-purple-500 text-purple-100 bg-purple-900/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
          amber: 'border-amber-500 text-amber-100 bg-amber-900/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
          emerald: 'border-emerald-500 text-emerald-100 bg-emerald-900/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
          slate: 'border-slate-500 text-slate-100 bg-slate-700/50',
          pink: 'border-pink-500 text-pink-100 bg-pink-900/40',
          indigo: 'border-indigo-500 text-indigo-100 bg-indigo-900/40',
          cyan: 'border-cyan-500 text-cyan-100 bg-cyan-900/40',
          teal: 'border-teal-500 text-teal-100 bg-teal-900/40',
      };

      return (
        <button 
            onClick={onClick}
            className={`shrink-0 px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all duration-200 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                active ? colors[colorClass] || colors.slate : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-white/5 hover:border-white/20 hover:text-white'
            }`}
        >
            <Icon size={12} className={active ? "scale-110" : "opacity-70"} />
            <span>{label}</span>
        </button>
      );
  };

  const renderStructureChips = () => {
      const mainLevel = activeStage?.level.split('.')[0];
      const level = activeStage?.level;

      if (mainLevel === '1') {
          return <>
             <ChipToggle active={showEthericBody} onClick={() => setShowEthericBody(!showEthericBody)} label="Эфирное тело" icon={Activity} colorClass="blue" />
             <ChipToggle active={showReferenceState} onClick={() => setShowReferenceState(!showReferenceState)} label="Эталон (ЭС)" icon={Anchor} colorClass="amber" />
             <ChipToggle active={showCentralFlows} onClick={() => setShowCentralFlows(!showCentralFlows)} label="Потоки" icon={MoveVertical} colorClass="red" />
             <ChipToggle active={showShell} onClick={() => setShowShell(!showShell)} label="Оболочка" icon={Shield} colorClass="purple" />
             <ChipToggle active={showRemoveLesions} onClick={() => setShowRemoveLesions(!showRemoveLesions)} label="Чистка" icon={Zap} colorClass="emerald" />
          </>;
      } else if (mainLevel === '2') {
          return <>
             <ChipToggle active={showDesires} onClick={() => setShowDesires(!showDesires)} label="Желания" icon={Heart} colorClass="pink" />
             <ChipToggle active={showKarma} onClick={() => setShowKarma(!showKarma)} label="Карма" icon={Cloud} colorClass="slate" />
             <ChipToggle active={showProgramLuck} onClick={() => setShowProgramLuck(!showProgramLuck)} label="Пр. Удача" icon={Sparkles} colorClass="amber" />
             <ChipToggle active={showProgramEfficiency} onClick={() => setShowProgramEfficiency(!showProgramEfficiency)} label="Пр. Эффект" icon={Zap} colorClass="blue" />
          </>;
      } else if (mainLevel === '3') {
          return <>
             <ChipToggle active={showVision} onClick={() => setShowVision(!showVision)} label="Видение" icon={Eye} colorClass="cyan" />
             <ChipToggle active={showEthericHand} onClick={() => setShowEthericHand(!showEthericHand)} label="Эфирная рука" icon={Hand} colorClass="blue" />
             <ChipToggle active={showSuppression} onClick={() => setShowSuppression(!showSuppression)} label="Подавление" icon={Minimize2} colorClass="slate" />
             <ChipToggle active={showAttention} onClick={() => setShowAttention(!showAttention)} label="Внимание" icon={Zap} colorClass="red" />
          </>;
      } else if (mainLevel === '4') {
          return <>
             <ChipToggle active={showSoulPoint} onClick={() => setShowSoulPoint(!showSoulPoint)} label="Я Есмь" icon={Target} colorClass="amber" />
             <ChipToggle active={showAssemblagePoint} onClick={() => setShowAssemblagePoint(!showAssemblagePoint)} label="Смещение" icon={Move} colorClass="purple" />
             <ChipToggle active={showBipolar} onClick={() => setShowBipolar(!showBipolar)} label="Биполяр" icon={MoveVertical} colorClass="indigo" />
             <ChipToggle active={showCreatorMode} onClick={() => setShowCreatorMode(!showCreatorMode)} label="Творец" icon={Lightbulb} colorClass="emerald" />
          </>;
      } else if (level?.startsWith('5')) {
          return <>
             <ChipToggle active={showCoords} onClick={() => setShowCoords(!showCoords)} label="Координаты" icon={Grid} colorClass="indigo" />
             <ChipToggle active={showDriveSource} onClick={() => setShowDriveSource(!showDriveSource)} label="Драйв" icon={Zap} colorClass="red" />
             <ChipToggle active={showMask} onClick={() => setShowMask(!showMask)} label="Маска" icon={Layers} colorClass="purple" />
             <ChipToggle active={showCurrents} onClick={() => setShowCurrents(!showCurrents)} label="Течения" icon={Waves} colorClass="cyan" />
          </>;
      }
      return <div className="text-slate-500 text-xs py-1 px-2">Выберите ступень для настройки.</div>;
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col font-sans">
        
        {/* === 1. PREVIEW AREA (Fill Remaining Space) === */}
        <div className="flex-1 relative bg-[#05060a] flex items-center justify-center overflow-hidden">
             
             {/* Background Effects */}
             <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-purple-900/5 to-transparent"></div>
             </div>

             {isLoading ? (
                 <div className="text-center bg-black/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 animate-in zoom-in-95 duration-500">
                      <div className="relative w-20 h-20 mx-auto mb-6">
                          <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                          <div className="absolute inset-4 bg-slate-900 rounded-full flex items-center justify-center">
                              {mediaType === 'VIDEO' ? <Film className="text-purple-400 animate-pulse" /> : <ImageIcon className="text-purple-400 animate-pulse" />}
                          </div>
                      </div>
                      <h3 className="text-lg font-serif text-white mb-2">{LOADING_MESSAGES[loadingStep]}</h3>
                      <p className="text-slate-500 text-xs uppercase tracking-widest">{mediaType === 'VIDEO' ? 'Veo 3.1' : 'Imagen 3'}</p>
                 </div>
             ) : resultUrl ? (
                 <div className="relative w-full h-full flex items-center justify-center bg-black group">
                     {mediaType === 'VIDEO' || resultUrl.startsWith('blob:') ? (
                         <video src={resultUrl} controls autoPlay loop className="max-w-full max-h-full object-contain shadow-2xl" />
                     ) : (
                         <img src={resultUrl} alt="Generated" className="max-w-full max-h-full object-contain shadow-2xl" />
                     )}
                     
                     <div className="absolute top-16 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                         <a href={resultUrl} download={`deir-media-${Date.now()}`} className="p-2 bg-black/60 text-white rounded-full hover:bg-purple-600 transition-colors border border-white/10"><Download size={20}/></a>
                         <button onClick={() => setResultUrl(null)} className="p-2 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors border border-white/10"><X size={20}/></button>
                     </div>
                 </div>
             ) : error ? (
                 <div className="text-center p-6 bg-red-900/10 border border-red-900/30 rounded-2xl max-w-sm">
                     <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
                     <p className="text-red-200 text-sm">{error}</p>
                     <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-slate-800 rounded text-xs text-white">Закрыть</button>
                 </div>
             ) : (
                 <div className="text-center opacity-30 select-none flex flex-col items-center">
                     {mediaType === 'VIDEO' ? <Film size={64} className="mb-4 text-slate-500"/> : <ImageIcon size={64} className="mb-4 text-slate-500"/>}
                     <h2 className="text-2xl font-serif text-slate-500">Медиа Студия</h2>
                     <p className="text-sm text-slate-600 mt-2 max-w-xs text-center">Выберите режим, настройте слои и визуализируйте энергию.</p>
                 </div>
             )}
        </div>

        {/* === 2. HISTORY DRAWER (Opens from bottom) === */}
        <div className={`absolute bottom-[240px] left-0 right-0 z-30 transition-all duration-300 ease-in-out px-4 ${showHistory ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
            <div className="bg-[#0f1021]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                    <span className="text-xs font-bold text-slate-400 uppercase">История Генераций</span>
                    <button onClick={() => setShowHistory(false)}><X size={14} className="text-slate-500"/></button>
                </div>
                <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
                     {history.length === 0 && <span className="text-xs text-slate-600 p-2">Пусто...</span>}
                     {history.map(item => (
                         <div key={item.id} onClick={() => { setResultUrl(item.result); setMediaType(item.type); }} className="shrink-0 w-24 h-16 bg-slate-800 rounded-lg overflow-hidden relative cursor-pointer border border-transparent hover:border-purple-500 transition-colors">
                             {item.type === 'VIDEO' ? (
                                 <div className="w-full h-full flex items-center justify-center bg-slate-900"><Play size={16} className="text-slate-500"/></div>
                             ) : (
                                 <img src={item.result} className="w-full h-full object-cover" />
                             )}
                             <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white p-1 truncate">{item.prompt}</div>
                         </div>
                     ))}
                </div>
            </div>
        </div>

        {/* === 4. UNIFIED CONTROL PANEL (Bottom) === */}
        <div className="relative z-50 bg-[#0a0b12] border-t border-white/10 p-4 md:px-8 md:py-4 flex flex-col gap-3">
             
             {/* Row 1: Structure Chips (New placement) */}
             <div className="w-full overflow-x-auto custom-scrollbar-hide">
                 <div className="flex gap-2 pb-2 px-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest self-center mr-2 shrink-0 flex items-center gap-1"><Layers size={10}/> Слои:</span>
                    {renderStructureChips()}
                 </div>
             </div>

             {/* Row 2: Mode & Settings */}
             <div className="flex justify-between items-center">
                 
                 {/* Mode Switcher */}
                 <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                     <button 
                        onClick={() => setMediaType('VIDEO')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${mediaType === 'VIDEO' ? 'bg-[#1e1e2e] text-purple-300 shadow-md border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                     >
                        <Film size={14} /> Видео
                     </button>
                     <button 
                        onClick={() => setMediaType('IMAGE')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${mediaType === 'IMAGE' ? 'bg-[#1e1e2e] text-emerald-300 shadow-md border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                     >
                        <ImageIcon size={14} /> Фото
                     </button>
                 </div>

                 <div className="flex items-center gap-3">
                     {/* Aspect Ratio */}
                     <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1 border border-white/5">
                        {['16:9', '9:16', '1:1'].map((ratio: any) => (
                            <button 
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`px-2 py-1 rounded text-[10px] font-bold ${aspectRatio === ratio ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {ratio}
                            </button>
                        ))}
                     </div>

                     {/* History Toggle */}
                     <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className={`p-2 rounded-lg border transition-colors ${showHistory ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300'}`}
                     >
                        <History size={18} />
                     </button>
                 </div>
             </div>

             {/* Row 3: Inputs & Action */}
             <div className="flex gap-3 h-14">
                 
                 {/* Source Upload */}
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`shrink-0 w-14 h-full rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all overflow-hidden relative group ${image ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}
                 >
                    {image ? (
                        <>
                           <img src={image} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                           <Upload size={20} className="text-emerald-400 relative z-10" />
                        </>
                    ) : (
                        <Upload size={20} className="text-slate-500" />
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                 </div>

                 {/* Prompt Input */}
                 <input 
                    type="text"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder={mediaType === 'VIDEO' ? "Опишите движение..." : "Опишите образ..."}
                    className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                 />

                 {/* Generate Button */}
                 <button 
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className={`shrink-0 w-28 h-full rounded-xl font-bold text-white shadow-lg flex flex-col items-center justify-center gap-0.5 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                        mediaType === 'VIDEO' 
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600 hover:shadow-purple-500/25' 
                        : 'bg-gradient-to-br from-emerald-600 to-teal-600 hover:shadow-emerald-500/25'
                    }`}
                 >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                    <span className="text-[10px] uppercase tracking-wider">{isLoading ? 'Рендер' : 'Мотор!'}</span>
                 </button>
             </div>
        </div>
        
        <style>{`
            .custom-scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
            .custom-scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
            .mask-fade-sides {
                mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
            }
        `}</style>
    </div>
  );
};

export default VideoStudio;