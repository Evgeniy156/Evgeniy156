import React, { useState, useRef, useEffect } from 'react';
import { 
  Film, Upload, Loader2, Play, Image as ImageIcon, Sparkles, X, AlertCircle, History, Zap, 
  Shield, MoveVertical, Heart, Cloud, Hand, Eye, Minimize2, Users, Cpu, Target, Move, Wind, GitBranch, Lightbulb,
  Grid, Compass, ShieldAlert, Edit3, Sun, Layers, Wifi, CircleHelp, Waves, Clock, Activity, Anchor, Download, Focus, Globe, ArrowUp, MousePointer2
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
  const [showEnergyPost, setShowEnergyPost] = useState(false);
  const [showHealthMatrix, setShowHealthMatrix] = useState(false);
  // STAGE 3 (Influence)
  const [showAuraScan, setShowAuraScan] = useState(false);
  const [showAjnaSuppression, setShowAjnaSuppression] = useState(false);
  const [showAttentionTouch, setShowAttentionTouch] = useState(false);
  const [showEnergyVacuum, setShowEnergyVacuum] = useState(false);
  const [showStartingImpulse, setShowStartingImpulse] = useState(false);
  const [showIntentionReading, setShowIntentionReading] = useState(false);
  const [showProgramInstall, setShowProgramInstall] = useState(false);
  // STAGE 4 (Maturity)
  const [showSoulPoint, setShowSoulPoint] = useState(false);
  const [showAssemblagePoint, setShowAssemblagePoint] = useState(false);
  const [showBreathingAnchor, setShowBreathingAnchor] = useState(false);
  const [showForesight, setShowForesight] = useState(false);
  const [showForking, setShowForking] = useState(false); // Bipolar structure essentially
  const [showBipolar, setShowBipolar] = useState(false);
  const [showCreatorMode, setShowCreatorMode] = useState(false);
  // STAGE 5.1 (Confidence)
  const [showCoords, setShowCoords] = useState(false);
  const [showStripes, setShowStripes] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [showClosedPath, setShowClosedPath] = useState(false);
  const [showSecondLeg, setShowSecondLeg] = useState(false);
  // STAGE 5.2 (Wisdom)
  const [showSlowThoughts, setShowSlowThoughts] = useState(false);
  const [showValueRewriting, setShowValueRewriting] = useState(false);
  const [showAnchorObject, setShowAnchorObject] = useState(false);
  const [showExternalChakra, setShowExternalChakra] = useState(false);
  const [showEmotionalVector, setShowEmotionalVector] = useState(false);

  // STAGE 5.3 (Art)
  const [showDriveSource, setShowDriveSource] = useState(false);
  const [showMask, setShowMask] = useState(false);
  const [showInnerGrid, setShowInnerGrid] = useState(false);
  const [showOuterGrid, setShowOuterGrid] = useState(false);
  const [showNonMask, setShowNonMask] = useState(false);
  const [showMetaphor, setShowMetaphor] = useState(false);
  const [showCurrents, setShowCurrents] = useState(false);
  
  // SEMINARS (E1, E2)
  const [showAvatar, setShowAvatar] = useState(false);
  const [showEGF, setShowEGF] = useState(false);
  const [showLocus, setShowLocus] = useState(false);
  const [showDestroyer, setShowDestroyer] = useState(false);
  const [showPersonalEgregor, setShowPersonalEgregor] = useState(false);
  const [showBalanceTest, setShowBalanceTest] = useState(false);
  const [showAntiEgregor, setShowAntiEgregor] = useState(false);
  const [showDoppelganger, setShowDoppelganger] = useState(false);
  const [showAvatarInjection, setShowAvatarInjection] = useState(false);
  const [showSoftware, setShowSoftware] = useState(false);

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
         setShowDesires(false); setShowKarma(false); setShowProgramLuck(false); setShowProgramEfficiency(false); setShowConfidence(false); setShowEnergyPost(false); setShowHealthMatrix(false);
         setShowAuraScan(false); setShowAjnaSuppression(false); setShowAttentionTouch(false); setShowEnergyVacuum(false); setShowStartingImpulse(false); setShowIntentionReading(false); setShowProgramInstall(false);
         setShowSoulPoint(false); setShowAssemblagePoint(false); setShowBreathingAnchor(false); setShowForesight(false); setShowForking(false); setShowBipolar(false); setShowCreatorMode(false);
         setShowCoords(false); setShowStripes(false); setShowNavigation(false); setShowClosedPath(false); setShowSecondLeg(false);
         setShowSlowThoughts(false); setShowValueRewriting(false); setShowAnchorObject(false); setShowExternalChakra(false); setShowEmotionalVector(false);
         setShowDriveSource(false); setShowMask(false); setShowInnerGrid(false); setShowOuterGrid(false); setShowNonMask(false); setShowMetaphor(false); setShowCurrents(false);
         setShowAvatar(false); setShowEGF(false); setShowLocus(false); setShowDestroyer(false); setShowPersonalEgregor(false);
         setShowBalanceTest(false); setShowAntiEgregor(false); setShowDoppelganger(false); setShowAvatarInjection(false); setShowSoftware(false);
     };
     resetAll();
     
     // Set defaults
     const level = activeStage?.level;
     const mainLevel = level?.split('.')[0];
     
     if (mainLevel === '1') { setShowEthericBody(true); setShowCentralFlows(true); }
     else if (mainLevel === '2') { setShowDesires(true); }
     else if (mainLevel === '3') { setShowAuraScan(true); }
     else if (mainLevel === '4') { setShowSoulPoint(true); }
     else if (level === '5.1') { setShowCoords(true); }
     else if (level === '5.2') { setShowSlowThoughts(true); }
     else if (level === '5.3') { setShowDriveSource(true); }
     else if (level === 'E1') { setShowAvatar(true); }
     else if (level === 'E2') { setShowBalanceTest(true); }

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
        if (showDesires) prompt += "Visual comparison: Bright, resonant holographic images vs dull, gray fading images (True vs False Desires). ";
        if (showKarma) prompt += "Extracting dark, sticky masses from the etheric body and dissolving them into light (Karma Cleaning). ";
        if (showProgramLuck) prompt += "A golden sphere in the solar plexus pulsating and expanding, attracting sparkles of luck (Program for Luck). ";
        if (showProgramEfficiency) prompt += "A cool blue geometric structure projecting a beam of intent forward from the body (Efficiency Program). ";
        if (showConfidence) prompt += "A solid, indestructible pillar of white light forming inside the spine (Confidence). ";
        if (showEnergyPost) prompt += "A moment of total energy vacuum followed by a massive explosive inflow of fresh, bright white cosmic energy (Energy Post). ";
        if (showHealthMatrix) prompt += "An idealized, glowing energy duplicate of the human body being superimposed over the physical form (Health Matrix). ";
    }
    // Stage 3 (Influence)
    else if (mainLevel === '3') {
        if (showAuraScan) prompt += "Visualizing a group of people connected by a pyramid-like energy structure with a leader at the top (Egregor coordination). Focus on scanning the thinness/deformity of auras in a crowd. ";
        if (showAjnaSuppression) prompt += "A bright, hard beam of blue energy projecting from the user's Ajna (forehead) directly into the opponent's Ajna to suppress their will (Active Suppression). ";
        if (showAttentionTouch) prompt += "A thin beam of energy gently touching a glowing pool of liquid light located just above the opponent's eyebrows (Attention Energy Reserve). ";
        if (showEnergyVacuum) prompt += "User's energy field acting as a powerful vacuum pump, sucking murky energy clouds from the opponent (Energy Withdrawal). ";
        if (showStartingImpulse) prompt += "A small spark or impulse of energy entering the opponent's body at the base of the skull (medulla oblongata) to trigger movement (Starting Impulse). ";
        if (showIntentionReading) prompt += "Two human energy fields merging partially. The user's consciousness 'probes' the opponent's field to read intentions (Telepathy). ";
        if (showProgramInstall) prompt += "A complex geometric construct made of glowing lines being inserted into the opponent's aura (Program Installation). ";
    }
    // Stage 4 (Maturity)
    else if (mainLevel === '4') {
        if (showSoulPoint) prompt += "The consciousness is concentrated into a brilliant, dense star of white light located in the center of the head (Soul Point). ";
        if (showAssemblagePoint) prompt += "The brilliant white star (Soul Point) detaches from the body and floats 20cm above the head or shifts behind the back into the past. ";
        if (showBreathingAnchor) prompt += "The Soul Point pulsates rhythmically, expanding and contracting in perfect sync with deep breathing. ";
        if (showForesight) prompt += "The Soul Point shifts forward from the body into a mist of probabilities, illuminating future events like a searchlight. ";
        if (showForking) prompt += "Energy consciousness splits into two glowing centers (Head and Stomach) simultaneously. ";
        if (showBipolar) prompt += "The energy structure is stripped down to only TWO active centers: a blinding white sun at the crown (Sahasrara) and a burning red sun at the base (Muladhara). The rest of the body is a conduit of pure power. ";
        if (showCreatorMode) prompt += "The figure radiates blinding white light of pure intention from the Soul Point, dissolving the surrounding reality and reshaping it. ";
    }
    // Stage 5.1 (Confidence)
    else if (level.startsWith('5.1')) {
        if (showCoords) prompt += "A holographic 3D grid surrounds the user. Zones of Light ('Good') and Shadow ('Bad') are clearly visible in the virtual space. ";
        if (showStripes) prompt += "Life appears as a series of black and white stripes. The user navigates along the white stripes, avoiding the black ones (Managed Striping). ";
        if (showNavigation) prompt += "A glowing golden die or coin spins in the air, leaving a trail of probability energy. A path opens up based on the result. ";
        if (showClosedPath) prompt += "A 'Closed Path' visual: A glowing red barrier or wall blocks the way. The energy flows hit it and bounce back. ";
        if (showSecondLeg) prompt += "Energy flows are diverted from a blocked red path to a new, open green path ('Second Leg' technique). Balancing the structure. ";
    }
    // Stage 5.2 (Wisdom)
    else if (level.startsWith('5.2')) {
        if (showSlowThoughts) prompt += "Visualize thoughts not as flashes, but as heavy, viscous, golden honey flowing slowly, reshaping the fabric of reality. Deep, resonant energy. ";
        if (showValueRewriting) prompt += "A glowing timeline where a specific past event node changes color from dark (negative) to bright (positive) under mental pressure. ";
        if (showAnchorObject) prompt += "A physical object (like a stone or book) glowing with an inner matrix network, connected by threads to the collective unconscious field. ";
        if (showExternalChakra) prompt += "A blindingly bright, self-sustaining energy sun located outside the physical body, pulsating independently. It regulates the flow of the environment. ";
        if (showEmotionalVector) prompt += "A cone of light projecting from the user, within which reality is orderly and beautiful (Emotional Vector of Creation). ";
    }
    // Stage 5.3 (Art)
    else if (level.startsWith('5.3')) {
        if (showDriveSource) prompt += "A volcanic energy source erupts from below the user's feet (primal instincts), powering the energy system. ";
        if (showMask) prompt += "A complex, glowing geometric mask or persona floats in front of the user, filtering interactions with the social world. ";
        if (showInnerGrid) prompt += "An intricate internal lattice or grid of values glows inside the mind, structuring incoming energy. ";
        if (showOuterGrid) prompt += "An external grid of glowing nodes surrounds the user, connecting them to social opportunities. ";
        if (showNonMask) prompt += "A transparent, mirror-like silhouette ('Non-Mask') stands beside the user, reflecting reality without distortion. ";
        if (showMetaphor) prompt += "Visuals of probability: a spinning coin, dice, or cards in the air, transforming chaos into order (Metaphorical Thinking). ";
        if (showCurrents) prompt += "The user surfs on massive, global waves of energy (World Currents), guided by the Mask and Non-Mask structures. ";
    }
    // Egregors 1
    else if (level === 'E1') {
        if (showAvatar) prompt += "Avatar: A flat, functional energy phantom (shell) standing in front of the person, shielding them. ";
        if (showEGF) prompt += "Egregorial Focus (EGF): A bright symbol or flag above the head acting as an interface port. ";
        if (showLocus) prompt += "Archetypal Focus (AF): A glowing symbol deep inside the egregor cloud. ";
        if (showDestroyer) prompt += "Influence Destroyer: A spinning, spiked geometric object (sphere or cube) placed on an incoming energy link, shredding it. ";
        if (showPersonalEgregor) prompt += "Personal Egregor: A small, semi-autonomous energy sphere orbiting the person. ";
    }
    // Egregors 2
    else if (level === 'E2') {
        if (showBalanceTest) prompt += "Balance Test: Visualizing chakras interacting with an Egregor Symbol with arrows showing flow direction. ";
        if (showAntiEgregor) prompt += "Anti-Egregor: Two opposing Symbols colliding and annihilating into a grey void. ";
        if (showDoppelganger) prompt += "Doppelganger: A perfect, glowing etheric copy linked by a silver cord. ";
        if (showAvatarInjection) prompt += "Intervention: A glowing Avatar figure penetrating the outer shell of a massive Egregor Cloud. ";
        if (showSoftware) prompt += "Egregor Software: Glowing geometric logic circuits and algorithms being welded onto the central Symbol. ";
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
         const videoRatio = aspectRatio === '1:1' ? '16:9' : aspectRatio;
         url = await generateDeirVideo(image, videoRatio, finalPrompt, stageContext);
      } else {
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
             <ChipToggle active={showConfidence} onClick={() => setShowConfidence(!showConfidence)} label="Уверенность" icon={Sun} colorClass="indigo" />
             <ChipToggle active={showEnergyPost} onClick={() => setShowEnergyPost(!showEnergyPost)} label="Энергопост" icon={Activity} colorClass="cyan" />
             <ChipToggle active={showHealthMatrix} onClick={() => setShowHealthMatrix(!showHealthMatrix)} label="Матрица Здоровья" icon={Heart} colorClass="emerald" />
          </>;
      } else if (mainLevel === '3') {
          return <>
             <ChipToggle active={showAuraScan} onClick={() => setShowAuraScan(!showAuraScan)} label="Скан Ауры" icon={Eye} colorClass="cyan" />
             <ChipToggle active={showAjnaSuppression} onClick={() => setShowAjnaSuppression(!showAjnaSuppression)} label="Подавление (Аджна)" icon={ShieldAlert} colorClass="red" />
             <ChipToggle active={showAttentionTouch} onClick={() => setShowAttentionTouch(!showAttentionTouch)} label="Внимание" icon={MousePointer2} colorClass="purple" />
             <ChipToggle active={showEnergyVacuum} onClick={() => setShowEnergyVacuum(!showEnergyVacuum)} label="Вакуум (Забор)" icon={Wind} colorClass="slate" />
             <ChipToggle active={showStartingImpulse} onClick={() => setShowStartingImpulse(!showStartingImpulse)} label="Импульс (Толчок)" icon={Zap} colorClass="amber" />
             <ChipToggle active={showIntentionReading} onClick={() => setShowIntentionReading(!showIntentionReading)} label="Считывание" icon={Wifi} colorClass="indigo" />
             <ChipToggle active={showProgramInstall} onClick={() => setShowProgramInstall(!showProgramInstall)} label="Программа" icon={Cpu} colorClass="emerald" />
          </>;
      } else if (mainLevel === '4') {
          return <>
             <ChipToggle active={showSoulPoint} onClick={() => setShowSoulPoint(!showSoulPoint)} label="Я Есмь (Душа)" icon={Target} colorClass="amber" />
             <ChipToggle active={showAssemblagePoint} onClick={() => setShowAssemblagePoint(!showAssemblagePoint)} label="Смещение" icon={Move} colorClass="purple" />
             <ChipToggle active={showBreathingAnchor} onClick={() => setShowBreathingAnchor(!showBreathingAnchor)} label="Дых. Якорь" icon={Wind} colorClass="cyan" />
             <ChipToggle active={showForesight} onClick={() => setShowForesight(!showForesight)} label="Предвидение" icon={Eye} colorClass="teal" />
             <ChipToggle active={showBipolar} onClick={() => setShowBipolar(!showBipolar)} label="Биполяр" icon={MoveVertical} colorClass="indigo" />
             <ChipToggle active={showCreatorMode} onClick={() => setShowCreatorMode(!showCreatorMode)} label="Творец" icon={Lightbulb} colorClass="emerald" />
          </>;
      } else if (level === '5.1') {
          return <>
             <ChipToggle active={showCoords} onClick={() => setShowCoords(!showCoords)} label="Координаты" icon={Grid} colorClass="indigo" />
             <ChipToggle active={showStripes} onClick={() => setShowStripes(!showStripes)} label="Полосатость" icon={Activity} colorClass="amber" />
             <ChipToggle active={showNavigation} onClick={() => setShowNavigation(!showNavigation)} label="Тест-система" icon={Compass} colorClass="teal" />
             <ChipToggle active={showClosedPath} onClick={() => setShowClosedPath(!showClosedPath)} label="Закрытый путь" icon={ShieldAlert} colorClass="red" />
             <ChipToggle active={showSecondLeg} onClick={() => setShowSecondLeg(!showSecondLeg)} label="Вторая нога" icon={GitBranch} colorClass="blue" />
          </>;
      } else if (level === '5.2') {
          return <>
             <ChipToggle active={showSlowThoughts} onClick={() => setShowSlowThoughts(!showSlowThoughts)} label="Медл. мысли" icon={Clock} colorClass="blue" />
             <ChipToggle active={showValueRewriting} onClick={() => setShowValueRewriting(!showValueRewriting)} label="Перезапись" icon={Edit3} colorClass="purple" />
             <ChipToggle active={showAnchorObject} onClick={() => setShowAnchorObject(!showAnchorObject)} label="Якорь" icon={Anchor} colorClass="amber" />
             <ChipToggle active={showExternalChakra} onClick={() => setShowExternalChakra(!showExternalChakra)} label="Внеш. Чакра" icon={Sun} colorClass="cyan" />
             <ChipToggle active={showEmotionalVector} onClick={() => setShowEmotionalVector(!showEmotionalVector)} label="Вектор" icon={Globe} colorClass="emerald" />
          </>;
      } else if (level === '5.3') {
          return <>
             <ChipToggle active={showDriveSource} onClick={() => setShowDriveSource(!showDriveSource)} label="Драйв" icon={Zap} colorClass="red" />
             <ChipToggle active={showMask} onClick={() => setShowMask(!showMask)} label="Маска" icon={Layers} colorClass="purple" />
             <ChipToggle active={showInnerGrid} onClick={() => setShowInnerGrid(!showInnerGrid)} label="Вн. Сетка" icon={Grid} colorClass="teal" />
             <ChipToggle active={showOuterGrid} onClick={() => setShowOuterGrid(!showOuterGrid)} label="Внеш. Сетка" icon={Globe} colorClass="blue" />
             <ChipToggle active={showNonMask} onClick={() => setShowNonMask(!showNonMask)} label="Не-маска" icon={Eye} colorClass="emerald" />
             <ChipToggle active={showMetaphor} onClick={() => setShowMetaphor(!showMetaphor)} label="Метафора" icon={Compass} colorClass="amber" />
             <ChipToggle active={showCurrents} onClick={() => setShowCurrents(!showCurrents)} label="Течения" icon={Waves} colorClass="cyan" />
          </>;
      } else if (level === 'E1') {
          return <>
             <ChipToggle active={showAvatar} onClick={() => setShowAvatar(!showAvatar)} label="Аватара" icon={Users} colorClass="cyan" />
             <ChipToggle active={showEGF} onClick={() => setShowEGF(!showEGF)} label="ЭГФ" icon={Focus} colorClass="purple" />
             <ChipToggle active={showLocus} onClick={() => setShowLocus(!showLocus)} label="Локус" icon={Target} colorClass="amber" />
             <ChipToggle active={showDestroyer} onClick={() => setShowDestroyer(!showDestroyer)} label="Разрушитель" icon={ShieldAlert} colorClass="red" />
             <ChipToggle active={showPersonalEgregor} onClick={() => setShowPersonalEgregor(!showPersonalEgregor)} label="П.Эгрегор" icon={Globe} colorClass="teal" />
          </>;
      } else if (level === 'E2') {
          return <>
             <ChipToggle active={showBalanceTest} onClick={() => setShowBalanceTest(!showBalanceTest)} label="Тест" icon={Activity} colorClass="amber" />
             <ChipToggle active={showAntiEgregor} onClick={() => setShowAntiEgregor(!showAntiEgregor)} label="Анти" icon={ShieldAlert} colorClass="red" />
             <ChipToggle active={showDoppelganger} onClick={() => setShowDoppelganger(!showDoppelganger)} label="Двойник" icon={Users} colorClass="teal" />
             <ChipToggle active={showAvatarInjection} onClick={() => setShowAvatarInjection(!showAvatarInjection)} label="Внедрение" icon={ArrowUp} colorClass="purple" />
             <ChipToggle active={showSoftware} onClick={() => setShowSoftware(!showSoftware)} label="ПО" icon={Cpu} colorClass="blue" />
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
             <div className="w-full overflow-x-auto custom-scrollbar-hide" style={{ touchAction: "pan-x" }}>
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
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 ${mediaType === 'VIDEO' ? 'bg-[#1e1e2e] text-purple-300 shadow-md border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                     >
                        <Film size={14} /> Видео
                     </button>
                     <button 
                        onClick={() => setMediaType('IMAGE')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 ${mediaType === 'IMAGE' ? 'bg-[#1e1e2e] text-emerald-300 shadow-md border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}`}
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
                                className={`px-2 py-1 rounded text-[10px] font-bold active:scale-95 transition-transform ${aspectRatio === ratio ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {ratio}
                            </button>
                        ))}
                     </div>

                     {/* History Toggle */}
                     <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className={`p-2 rounded-lg border transition-colors active:scale-95 ${showHistory ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300'}`}
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
                    className={`shrink-0 w-14 h-full rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all overflow-hidden relative group active:scale-95 ${image ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}
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