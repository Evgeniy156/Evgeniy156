import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, MessageSquare, X, Activity, Sparkles, Radio, User, Pause, Play } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { DEIR_SYSTEM_INSTRUCTION } from '../constants';
import { Stage, Exercise } from '../types';

type ChatMessage = {
  id: string;
  sender: 'user' | 'model';
  text: string;
};

interface LiveSessionProps {
  stages?: Stage[];
  activeExercise?: Exercise | null;
  userName?: string | null;
  onSaveHistory?: (question: string, answer: string) => void;
}

// --- HELPER: TEXT CLEANING ---
const cleanText = (text: string): string => {
  if (!text) return "";
  // Removes markdown and potential English artifacts if they appear at start
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/###/g, '')
    .replace(/##/g, '')
    .replace(/#/g, '')
    .replace(/^---/gm, '')
    .replace(/`/g, '')
    .trim();
};

const LiveSession: React.FC<LiveSessionProps> = ({ stages = [], activeExercise = null, userName, onSaveHistory }) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // New State for Pause logic
  const [status, setStatus] = useState('Ожидание подключения...');
  const [volume, setVolume] = useState(0);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(false);
  
  // Refs
  const sessionRef = useRef<any>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Transcription Accumulators
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  
  // Visuals
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const volumeRef = useRef(0);
  const isModelSpeakingRef = useRef(false);
  const isPausedRef = useRef(false);

  // Suggestions
  const SUGGESTIONS = activeExercise 
    ? [`Проведи меня по упражнению`, `Я не чувствую ощущений`, `Как усилить эффект?`]
    : ["Как поставить защиту?", "Я не чувствую потоки", "Проведи медитацию"];

  // Sync refs for animation loop
  useEffect(() => {
      volumeRef.current = volume;
      isModelSpeakingRef.current = isModelSpeaking;
      isPausedRef.current = isPaused;
  }, [volume, isModelSpeaking, isPaused]);

  // --- MAGICAL VISUALIZER ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    let flashIntensity = 1.0; 

    const drawMagicCircle = (x: number, y: number, r: number, color: string, width: number, offset: number) => {
        ctx.beginPath();
        for (let i = 0; i <= 360; i+=5) {
            const rad = (i * Math.PI) / 180;
            const rVar = r + Math.sin(rad * 5 + time + offset) * 5;
            const xPos = x + Math.cos(rad + time * 0.2) * rVar;
            const yPos = y + Math.sin(rad + time * 0.2) * rVar;
            if (i === 0) ctx.moveTo(xPos, yPos);
            else ctx.lineTo(xPos, yPos);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    };

    const loop = () => {
          time += 0.02;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const w = canvas.width;
          const h = canvas.height;
          const vol = volumeRef.current; // 0.0 to 1.0 approx
          const modelSpeaking = isModelSpeakingRef.current;
          const active = isActive;
          const paused = isPausedRef.current;

          // Center
          const cx = w / 2;
          const cy = h / 2;

          // Base Glow (Lighter/Warmer now)
          const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6);
          gradient.addColorStop(0, paused ? 'rgba(100, 116, 139, 0.2)' : modelSpeaking ? 'rgba(192, 132, 252, 0.2)' : 'rgba(56, 189, 248, 0.1)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, w, h);

          if (flashIntensity > 0) {
              ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`;
              ctx.fillRect(0, 0, w, h);
              flashIntensity -= 0.02;
          }

          if (!active) {
              drawMagicCircle(cx, cy, 60 + Math.sin(time)*5, 'rgba(255, 255, 255, 0.2)', 1.5, 0);
              drawMagicCircle(cx, cy, 80 + Math.cos(time)*5, 'rgba(255, 255, 255, 0.1)', 1, 1);
          } else if (paused) {
              // Paused Visuals (Frozen rings)
              ctx.beginPath();
              ctx.arc(cx, cy, 60, 0, Math.PI * 2);
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
              ctx.setLineDash([5, 15]);
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.setLineDash([]);
              
              // Pause Icon drawn on canvas
              ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
              ctx.fillRect(cx - 15, cy - 20, 10, 40);
              ctx.fillRect(cx + 5, cy - 20, 10, 40);

          } else {
              const baseScale = 1 + vol * 3;
              const coreColor = modelSpeaking 
                  ? `rgba(250, 204, 21, ${0.4 + Math.random()*0.2})` 
                  : `rgba(147, 51, 234, ${0.3 + vol})`; 

              ctx.beginPath();
              ctx.arc(cx, cy, 40 * baseScale, 0, Math.PI * 2);
              ctx.fillStyle = coreColor;
              ctx.shadowBlur = 40;
              ctx.shadowColor = modelSpeaking ? '#fbbf24' : '#9333ea';
              ctx.fill();
              ctx.shadowBlur = 0;

              ctx.save();
              ctx.translate(cx, cy);
              ctx.rotate(time * 0.3);
              
              ctx.beginPath();
              for(let j=0; j<6; j++) {
                  ctx.rotate(Math.PI/3);
                  ctx.moveTo(50 * baseScale, 0);
                  ctx.quadraticCurveTo(100, 50, 50 * baseScale, 0);
              }
              ctx.strokeStyle = modelSpeaking ? 'rgba(253, 224, 71, 0.5)' : 'rgba(168, 85, 247, 0.5)';
              ctx.lineWidth = 2;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(0, 0, 100 + vol * 30, 0, Math.PI * 2);
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
              ctx.lineWidth = 1;
              ctx.stroke();

              ctx.restore();

              const particleCount = 20 + Math.floor(vol * 50);
              for (let i = 0; i < particleCount; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const radius = (60 * baseScale) + Math.random() * (120 * baseScale);
                  const px = cx + Math.cos(angle + time) * radius;
                  const py = cy + Math.sin(angle + time) * radius;
                  
                  ctx.beginPath();
                  ctx.arc(px, py, Math.random() * 2, 0, Math.PI * 2);
                  ctx.fillStyle = modelSpeaking ? '#fef08a' : '#d8b4fe';
                  ctx.fill();
              }
          }
          
          animationRef.current = requestAnimationFrame(loop);
    };
    loop();
    
    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationRef.current);
    };
  }, [isActive]);

  // --- AUDIO LOGIC ---
  const createPcmBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) { int16[i] = data[i] * 32768; }
    const uint8 = new Uint8Array(int16.buffer);
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) { binary += String.fromCharCode(uint8[i]); }
    return { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' };
  };

  const decodeAudio = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
    return bytes;
  };

  // Toggle Pause/Resume
  const togglePause = async () => {
    if (!isActive) return;

    if (isPaused) {
        // Resume
        await inputContextRef.current?.resume();
        await outputContextRef.current?.resume();
        setIsPaused(false);
        setStatus('Канал активен');
    } else {
        // Pause
        await inputContextRef.current?.suspend();
        await outputContextRef.current?.suspend();
        setIsPaused(true);
        setStatus('Сеанс на паузе');
        // Stop any currently playing audio so it doesn't resume abruptly
        sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
        sourcesRef.current.clear();
        setIsModelSpeaking(false);
    }
  };

  const cleanup = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
       inputContextRef.current.close();
    }
    if (outputContextRef.current && outputContextRef.current.state !== 'closed') {
       outputContextRef.current.close();
    }
    
    setIsActive(false);
    setIsPaused(false);
    setIsModelSpeaking(false);
    setVolume(0);
    setStatus('Сеанс завершен');
  };

  useEffect(() => { return () => cleanup(); }, []);

  const getContextString = () => {
    if (!stages || stages.length === 0) return "";
    
    const activeStageIndex = stages.map(s => !s.locked).lastIndexOf(true);
    const activeStage = stages[activeStageIndex];
    const completedStages = stages.filter(s => s.completed).map(s => s.title);
    
    let contextStr = `
=== СИСТЕМА ДОСТУПА К ЗНАНИЯМ (КНИГАМ) ===
ИМЯ УЧЕНИКА: ${userName || 'Неизвестно'}
ТЕКУЩАЯ СТУПЕНЬ (Открыта): ${activeStage ? `${activeStage.title} - ${activeStage.subtitle}` : 'Не определена'}
ПРОЙДЕННЫЕ СТУПЕНИ (Открыты): ${completedStages.length > 0 ? completedStages.join(', ') : 'Нет'}
ЗАКРЫТЫЕ СТУПЕНИ: Любые материалы, относящиеся к ступеням выше ${activeStage?.level}.

ПРАВИЛА ДОСТУПА:
1. Ты имеешь полный доступ к знаниям Текущей Ступени и всех Пройденных Ступеней.
2. Если пользователь спрашивает о техниках ЗАКРЫТЫХ ступеней, ты ОБЯЗАН отказать, сказав: "Это знание относится к следующей ступени. Давай сосредоточимся на текущей практике."
    `;

    if (activeExercise) {
        contextStr += `
=== РЕЖИМ ПРАКТИКИ: АКТИВНОЕ УПРАЖНЕНИЕ ===
Мы сейчас работаем над: "${activeExercise.title}".
ИНСТРУКЦИЯ: ${activeExercise.instruction}
ТВОЯ РОЛЬ: Ты ведешь ученика через это упражнение.
ВАЖНАЯ ЗАДАЧА:
1. Как только соединение установится, ТЫ ДОЛЖЕН ЗАГОВОРИТЬ ПЕРВЫМ.
2. Поприветствуй ученика и начни практику.
        `;
    } else {
        contextStr += `
=== РЕЖИМ НАСТАВНИКА (СВОБОДНЫЙ ДИАЛОГ) ===
Ученик находится в меню выбора. Ты готов ответить на вопросы по теории доступных ступеней или помочь выбрать практику.
        `;
    }

    return contextStr;
  };

  const startSession = async () => {
    try {
      if (isActive) { cleanup(); return; }

      setStatus('Установка ментального канала...');
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      const outputCtx = new AudioCtx({ sampleRate: 24000 });
      
      inputContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;
      
      await Promise.all([inputCtx.resume(), outputCtx.resume()]);
      nextStartTimeRef.current = outputCtx.currentTime;

      // Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(inputCtx.destination);
      
      let isConnected = false;
      setChatMessages([]);
      currentInputTranscription.current = '';
      currentOutputTranscription.current = '';

      const context = getContextString();

      // VOICE SELECTION LOGIC
      const selectedVoiceName = voiceGender === 'male' ? 'Fenrir' : 'Aoede';
      
      const personaDescription = voiceGender === 'male' 
        ? "ТЫ — ВЕДУЩИЙ МУЖСКОЙ ГОЛОС (Фенрир). Твой тембр низкий, глубокий, властный, но спокойный. ТЫ ГОВОРИШЬ УТВЕРДИТЕЛЬНО И ВЕСОМО." 
        : "ТЫ — ВЕДУЩИЙ ЖЕНСКИЙ ГОЛОС. Твой голос ровный, мягкий, обволакивающий. Ты ведешь плавно и уверенно.";

      // System Instruction - FORCING RUSSIAN, CONTEXT & PERSONA
      const voiceInstruction = `
      ${DEIR_SYSTEM_INSTRUCTION}
      
      ${context}

      === ВАЖНО: ГОЛОСОВОЙ РЕЖИМ И РОЛЬ ===
      ${personaDescription}
      
      === СЦЕНАРИЙ ВЗАИМОДЕЙСТВИЯ (СТРОГО) ===
      1. ЯЗЫК: ИСКЛЮЧИТЕЛЬНО РУССКИЙ. Никогда не говори на английском. Если слышишь английский, отвечай на русском.
      2. ЦЕЛЬ: Провести пользователя через упражнение ОТ НАЧАЛА ДО КОНЦА без лишних остановок.
      
      3. ВО ВРЕМЯ УПРАЖНЕНИЯ:
         - Говори утвердительно, веди за собой ("Мы делаем...", "Ощущаем...", "Переходим...").
         - НЕ СПРАШИВАЙ "Получилось?" после каждого шага. Это сбивает транс.
         - Делай паузы только для того, чтобы ученик успел выполнить действие.
         - Если пользователь молчит, жди. Если пользователь задает вопрос или перебивает - немедленно отвечай на вопрос, а затем возвращайся к упражнению.
      
      4. ФИНАЛ (ОБЯЗАТЕЛЬНО):
         Только когда упражнение ПОЛНОСТЬЮ завершено, смени тон на более мягкий и участливый и СПРОСИ:
         - "Как ощущения? Что вы сейчас чувствуете?"
         - "Нужно ли провести вас по этому упражнению еще раз, в режиме глубокой медитации, проговаривая каждый шаг?"
         - "Есть ли вопросы по технике?"
      `;

      const ai = new GoogleGenAI({ apiKey });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('Канал открыт. Я слушаю.');
            setIsActive(true);
            setIsPaused(false);
            isConnected = true;
          },
          onmessage: async (msg: LiveServerMessage) => {
            
            // --- INTERRUPTION HANDLING (Barge-In) ---
            const interrupted = msg.serverContent?.interrupted;
            if (interrupted) {
                // User interrupted the model.
                // Stop all currently playing audio immediately.
                sourcesRef.current.forEach(source => {
                    try { source.stop(); } catch(e) {}
                });
                sourcesRef.current.clear();
                // Reset timing cursor to now so new audio starts immediately
                if (outputContextRef.current) {
                    nextStartTimeRef.current = outputContextRef.current.currentTime;
                }
                setIsModelSpeaking(false);
                return; // Stop processing this message if interrupted
            }

            // 1. Handle Audio Output (Playback)
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputContextRef.current) {
              const ctx = outputContextRef.current;
              // Only play if not paused
              if (ctx.state === 'running') {
                  setIsModelSpeaking(true);

                  const pcm = decodeAudio(audioData);
                  const float32 = new Float32Array(new Int16Array(pcm.buffer).length);
                  for(let i=0; i<float32.length; i++) float32[i] = new Int16Array(pcm.buffer)[i] / 32768.0;
                  
                  const buffer = ctx.createBuffer(1, float32.length, 24000);
                  buffer.getChannelData(0).set(float32);
                  
                  const sourceNode = ctx.createBufferSource();
                  sourceNode.buffer = buffer;
                  sourceNode.connect(ctx.destination);
                  
                  const start = Math.max(nextStartTimeRef.current, ctx.currentTime);
                  sourceNode.start(start);
                  nextStartTimeRef.current = start + buffer.duration;
                  
                  sourcesRef.current.add(sourceNode);
                  sourceNode.onended = () => {
                      sourcesRef.current.delete(sourceNode);
                      if (sourcesRef.current.size === 0) setIsModelSpeaking(false);
                  };
              }
            }

            // 2. Handle Audio Transcription & History
            if (msg.serverContent?.outputTranscription) {
                // Model is speaking
                currentOutputTranscription.current += msg.serverContent.outputTranscription.text;
            } else if (msg.serverContent?.inputTranscription) {
                // User is speaking
                currentInputTranscription.current += msg.serverContent.inputTranscription.text;
            }

            // 3. Handle Turn Completion (Save History)
            if (msg.serverContent?.turnComplete) {
                const userText = currentInputTranscription.current;
                const modelText = currentOutputTranscription.current;

                if (userText.trim() && modelText.trim() && onSaveHistory) {
                    onSaveHistory(userText, modelText);
                    // Update chat UI for subtitles
                    setChatMessages(prev => [
                        ...prev, 
                        { id: Date.now().toString() + 'u', sender: 'user', text: userText },
                        { id: Date.now().toString() + 'm', sender: 'model', text: modelText }
                    ]);
                }
                
                // Clear buffers
                currentInputTranscription.current = '';
                currentOutputTranscription.current = '';
            }
            
            // Fallback for text mode if needed
            const textData = msg.serverContent?.modelTurn?.parts?.[0]?.text;
            if (textData) {
                 const clean = cleanText(textData);
                 if (clean) currentOutputTranscription.current += clean;
            }
          },
          onclose: cleanup,
          onerror: (e) => { console.error(e); setStatus('Разрыв связи'); setIsActive(false); }
        },
        config: { 
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoiceName } } },
            systemInstruction: voiceInstruction,
            inputAudioTranscription: {}, 
            outputAudioTranscription: {} 
        }
      });

      processor.onaudioprocess = (e) => {
        if (!isConnected) return;
        // Do not process audio if paused
        if (isPausedRef.current) return;

        const input = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
        setVolume(Math.sqrt(sum / input.length));

        const blob = createPcmBlob(input);
        sessionPromise.then(s => { sessionRef.current = s; s.sendRealtimeInput({ media: blob }); });
      };
    } catch (e) {
      console.error(e);
      setStatus('Микрофон недоступен');
    }
  };

  const sendText = async (text: string) => {
      if (!text.trim() || !sessionRef.current) return;
      currentInputTranscription.current = text; 
      setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text }]);
      setInputText('');
      console.warn("Text input is currently not supported in Live mode via this SDK version.");
  };

  // --- RENDER ---
  return (
    <div className="relative w-full h-full flex flex-col bg-[#1e1e2e] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
       
       {/* 1. VISUALIZER LAYER */}
       <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

       {/* 2. TOP BAR */}
       <div className="relative z-20 flex justify-between items-center p-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-lg">
                <div className={`w-2.5 h-2.5 rounded-full ${isActive ? (isPaused ? 'bg-yellow-400' : 'bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse') : 'bg-slate-400'}`} />
                <span className="text-xs font-medium text-white uppercase tracking-widest">{isActive ? (isPaused ? 'ПАУЗА' : 'ЭФИР ОТКРЫТ') : 'OFFLINE'}</span>
            </div>
            
            <button 
                onClick={() => setIsChatVisible(!isChatVisible)}
                className={`p-3 rounded-full transition-all border backdrop-blur-xl ${isChatVisible ? 'bg-white/20 border-white/30 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'}`}
            >
                <MessageSquare size={20} />
            </button>
       </div>

       {/* 3. CENTER STAGE */}
       <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none">
           {/* Floating Status Text */}
           <div className={`mb-12 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                <h2 className="text-3xl font-serif text-white text-center tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {isPaused ? 'Сеанс на паузе' : (isModelSpeaking ? 'Ментор Говорит...' : volume > 0.05 ? 'Слушаю...' : 'Тишина')}
                </h2>
           </div>

           {/* START BUTTON (Only visible when inactive) */}
           {!isActive && (
               <div className="pointer-events-auto animate-in zoom-in duration-700 flex flex-col items-center gap-6">
                   
                   {/* Voice Selection Toggle */}
                   <div className="flex bg-white/10 p-1 rounded-full border border-white/10 backdrop-blur-md">
                       <button 
                           onClick={() => setVoiceGender('male')}
                           className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${voiceGender === 'male' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                       >
                           <User size={14} /> Мужской
                       </button>
                       <button 
                           onClick={() => setVoiceGender('female')}
                           className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${voiceGender === 'female' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                       >
                           <User size={14} /> Женский
                       </button>
                   </div>

                   <button 
                       onClick={startSession}
                       className="group relative flex flex-col items-center justify-center w-48 h-48 rounded-full transition-all hover:scale-105"
                   >
                       {/* Pulsing Aura */}
                       <div className={`absolute inset-0 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 animate-pulse ${voiceGender === 'male' ? 'bg-indigo-500' : 'bg-purple-500'}`}></div>
                       {/* Rotating Rings */}
                       <div className="absolute inset-0 rounded-full border border-white/10 group-hover:border-white/20 animate-spin-slow"></div>
                       <div className="absolute inset-4 rounded-full border border-white/10 group-hover:border-white/20 animate-spin-reverse-slow"></div>
                       
                       {/* Core Button */}
                       <div className="relative z-10 bg-gradient-to-br from-[#2e1065] to-black rounded-full w-full h-full flex flex-col items-center justify-center border border-white/10 shadow-2xl backdrop-blur-sm">
                           <Radio size={48} className={`mb-3 transition-colors drop-shadow-lg ${voiceGender === 'male' ? 'text-indigo-300 group-hover:text-white' : 'text-purple-300 group-hover:text-white'}`} />
                           <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                               {activeExercise ? "Начать\nПрактику" : "Выйти на\nСвязь"}
                           </span>
                       </div>
                   </button>
               </div>
           )}
       </div>

       {/* 4. CONTROLS */}
       <div className="relative z-20 p-6 flex flex-col gap-4 justify-end pointer-events-none">
           
           {/* Active Controls Row */}
           {isActive && (
               <div className="pointer-events-auto flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                   
                   {/* Chat Overlay */}
                   {isChatVisible && (
                       <div className="w-full max-w-md h-72 bg-[#0f1021]/90 backdrop-blur-2xl rounded-2xl border border-white/10 flex flex-col shadow-2xl mb-2">
                           <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                               {chatMessages.map((m, i) => (
                                   <div key={i} className={`text-sm p-3 rounded-2xl max-w-[85%] leading-relaxed ${m.sender === 'user' ? 'ml-auto bg-purple-600 text-white rounded-tr-none' : 'bg-white/10 text-slate-200 border border-white/5 rounded-tl-none'}`}>
                                       {m.text}
                                   </div>
                               ))}
                           </div>
                           <div className="p-3 border-t border-white/10 flex gap-2">
                               <input 
                                   className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-purple-500 outline-none"
                                   value={inputText}
                                   onChange={e => setInputText(e.target.value)}
                                   onKeyPress={e => e.key === 'Enter' && sendText(inputText)}
                                   placeholder="Сообщение..."
                               />
                               <button onClick={() => sendText(inputText)} className="p-2 bg-purple-600 rounded-xl text-white hover:bg-purple-500 shadow-lg"><Send size={18}/></button>
                           </div>
                       </div>
                   )}

                   {/* Suggestions */}
                   {!isChatVisible && (
                       <div className="flex gap-2 flex-wrap justify-center">
                           {SUGGESTIONS.map((s, i) => (
                               <button 
                                   key={i} 
                                   onClick={() => sendText(s)}
                                   className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400 rounded-full text-xs text-slate-300 hover:text-white transition-all backdrop-blur-md shadow-lg"
                               >
                                   {s}
                               </button>
                           ))}
                       </div>
                   )}

                   <div className="flex items-center gap-4 mt-4">
                        {/* Pause / Resume Button */}
                        <button 
                            onClick={togglePause}
                            className={`flex items-center gap-2 px-6 py-3 border rounded-full transition-all hover:scale-105 backdrop-blur-md ${isPaused ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/20' : 'bg-slate-700/30 border-slate-500/30 text-white hover:bg-slate-700/50'}`}
                        >
                            {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                            <span className="text-sm font-medium">{isPaused ? 'Продолжить' : 'Пауза'}</span>
                        </button>

                        {/* Disconnect */}
                        <button 
                            onClick={cleanup}
                            className="flex items-center gap-2 px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-200 rounded-full transition-all hover:scale-105 backdrop-blur-md"
                        >
                            <MicOff size={18} />
                            <span className="text-sm font-medium">Завершить</span>
                        </button>
                   </div>
               </div>
           )}
       </div>

    </div>
  );
};

export default LiveSession;