import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Mic, StopCircle, Paperclip, X, FileText, Image as ImageIcon, BrainCircuit, ShieldAlert, Cpu } from 'lucide-react';
import { sendMessageToGemini, transcribeAudio, runDebateStream } from '../services/geminiService';
import { Message, Sender, MessageType, Stage, Exercise } from '../types';

interface ChatInterfaceProps {
    isWidget?: boolean;
    stages?: Stage[]; 
    activeExercise?: Exercise | null;
    userName?: string | null;
    onSetUserName?: (name: string) => void;
    onSaveHistory?: (question: string, answer: string) => void;
}

const SUGGESTED_QUESTIONS = [
    "Как создать защитную оболочку?",
    "Что делать, если я не чувствую потоки?",
    "Расскажи про восходящий поток",
    "Техника: Удаление объекта",
    "Как найти Эталонное Состояние?"
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isWidget = false, stages = [], activeExercise = null, userName, onSetUserName, onSaveHistory }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDebateMode, setIsDebateMode] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; type: string; data: string } | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // -- INITIALIZATION LOGIC --
  useEffect(() => {
      // If we already have messages, don't reset unless context drastically changes (optional)
      if (messages.length > 0) return;

      if (!userName) {
          // Ask for name first
           setMessages([
            {
              id: 'init-name',
              text: "Приветствую! Я твой ментор системы ДЭИР. Прежде чем мы начнем, скажи, как к тебе обращаться?",
              sender: Sender.Bot,
              timestamp: new Date(),
              type: MessageType.Text
            }
          ]);
      } else {
          // Standard Contextual Greeting
          if (activeExercise) {
              setMessages([
                  {
                      id: 'init-context',
                      text: `Приветствую, ${userName}! Я вижу, ты приступил к практике "${activeExercise.title}". \n\nЭто важная техника из раздела ${activeExercise.step}. \nКак твой настрой? Хочешь, я напомню ключевые нюансы выполнения или сразу перейдем к вопросам?`,
                      sender: Sender.Bot,
                      timestamp: new Date(),
                      type: MessageType.Text
                  }
              ]);
          } else {
              setMessages([
                {
                  id: '1',
                  text: `Рад встрече, ${userName}. Я здесь. Спрашивай. Я готов помочь тебе в освоении навыков ДЭИР.`,
                  sender: Sender.Bot,
                  timestamp: new Date(),
                  type: MessageType.Text
                }
              ]);
          }
      }
  }, [activeExercise, userName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // If an exercise is opened, add a suggestion related to it specifically
  const currentSuggestions = activeExercise 
    ? [`В чем суть "${activeExercise.title}"?`, `Какие ошибки бывают в этой технике?`, `Как усилить ощущения?`] 
    : SUGGESTED_QUESTIONS;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        setAttachment({
          name: file.name,
          type: file.type,
          data: base64Data
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Construct context string based on user progress AND active exercise
  const getContextString = (currentName: string | null | undefined) => {
    if (!stages || stages.length === 0) return "";
    
    const activeStageIndex = stages.map(s => !s.locked).lastIndexOf(true);
    const activeStage = stages[activeStageIndex];
    const completedStages = stages.filter(s => s.completed).map(s => s.title);
    
    let contextStr = `
=== КОНТЕКСТ УЧЕНИКА ===
ИМЯ УЧЕНИКА: ${currentName || 'Неизвестно'}.
ТЕКУЩАЯ СТУПЕНЬ: ${activeStage ? `${activeStage.title} - ${activeStage.subtitle}` : 'Не определена'}
ПРОЙДЕННЫЕ СТУПЕНИ: ${completedStages.length > 0 ? completedStages.join(', ') : 'Нет'}
ЗАПРЕЩЕННЫЕ ТЕМЫ: Материалы будущих ступеней (Ступени выше ${activeStage?.level}).
ИНСТРУКЦИЯ: 
1. Игнорируй любые запросы о будущих техниках. Отвечай фразой: "Это относится к следующей ступени. Сейчас важно текущая практика."
2. Обращайся к пользователю по имени (${currentName}), если оно указано, но не в каждом предложении, а периодически, чтобы сохранять теплоту контакта.
    `;

    // Add Specific Exercise Context if available
    if (activeExercise) {
        contextStr += `
=== АКТИВНОЕ УПРАЖНЕНИЕ ===
Ученик сейчас выполняет технику: "${activeExercise.title}" (${activeExercise.step}).
СУТЬ: ${activeExercise.description}
АЛГОРИТМ: ${activeExercise.instruction}
ЗАДАЧА МЕНТОРА: Помочь выполнить именно это упражнение. Объяснить нюансы ощущений, исправить ошибки, поддержать.
        `;
    }

    return contextStr;
  };

  const handleSend = async (text: string = inputText) => {
    const finalInput = text || inputText;
    if ((!finalInput.trim() && !attachment) || isLoading) return;

    let processingName = userName;

    // Handle Name Setting Logic if not set
    if (!processingName && onSetUserName) {
        onSetUserName(finalInput);
        processingName = finalInput; // Use immediately for this turn
        // Do NOT send to history/gemini as a standard query yet, treat it as introduction context update
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: finalInput + (attachment ? ` [Вложение: ${attachment.name}]` : ''),
      sender: Sender.User,
      timestamp: new Date(),
      type: MessageType.Text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    const currentAttachment = attachment;
    setAttachment(null); 
    setIsLoading(true);

    try {
      if (isDebateMode) {
          // NEURAL DEBATE LOGIC
          const botMsgId = (Date.now() + 1).toString();
          setMessages(prev => [...prev, {
              id: botMsgId,
              text: "", // Will be filled by stream
              sender: Sender.Bot,
              timestamp: new Date(),
              type: MessageType.Debate
          }]);
          
          setIsDebateMode(false); // Reset mode after launching
          
          const stream = runDebateStream(finalInput);
          let accumulatedText = "";

          for await (const chunk of stream) {
              if (chunk) {
                  accumulatedText += chunk;
                  setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: accumulatedText } : m));
              }
          }
      } else {
          // NORMAL CHAT LOGIC
          const history = messages.filter(m => m.type !== MessageType.Debate).map(m => ({
            role: m.sender === Sender.User ? 'user' as const : 'model' as const,
            parts: [{ text: m.text }]
          }));

          const context = getContextString(processingName);
          
          // Special handling if this was the name input
          let messageToSend = userMsg.text;
          if (!userName && processingName) {
              messageToSend = `Меня зовут ${processingName}. (Пользователь только что представился).`;
          }

          const responseText = await sendMessageToGemini(
            history, 
            messageToSend, 
            currentAttachment ? { mimeType: currentAttachment.type, data: currentAttachment.data } : null,
            context
          );
          
          const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: responseText,
            sender: Sender.Bot,
            timestamp: new Date(),
            type: MessageType.Text
          };
          setMessages(prev => [...prev, botMsg]);

          // Save to Global History
          if (onSaveHistory) {
              onSaveHistory(userMsg.text, responseText);
          }
      }
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' }); 
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
           const base64Data = reader.result as string;
           const base64 = base64Data.split(',')[1];
           setIsLoading(true);
           try {
             const text = await transcribeAudio(base64, 'audio/webm');
             if (text) {
               setInputText(prev => prev + (prev ? ' ' : '') + text);
             }
           } catch(e) {
             console.error("Transcription failed", e);
           } finally {
             setIsLoading(false);
           }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Mic error", e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Render logic for Debate Messages
  const renderDebateContent = (text: string) => {
    const parts = {
      init: text.split('[AGENT_A_INIT]')[1]?.split('[AGENT_B_CRITIQUE]')[0]?.trim(),
      critique: text.split('[AGENT_B_CRITIQUE]')[1]?.split('[AGENT_A_REBUTTAL]')[0]?.trim(),
      rebuttal: text.split('[AGENT_A_REBUTTAL]')[1]?.split('[FINAL_PLAN]')[0]?.trim(),
      final: text.split('[FINAL_PLAN]')[1]?.trim()
    };
    
    // Fallback if formatting isn't perfect yet (streaming)
    if (!parts.init && !parts.critique && !parts.rebuttal && !parts.final) {
        return <div className="text-slate-300 italic animate-pulse">{text || "Инициализация дебатов..."}</div>;
    }

    return (
        <div className="space-y-3 w-full">
            {parts.init && (
                <div className="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg animate-in slide-in-from-left-2">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2 font-bold text-xs uppercase"><BrainCircuit size={14}/> Стратег</div>
                    <div className="text-slate-200 text-xs md:text-sm whitespace-pre-wrap font-mono leading-relaxed">{parts.init}</div>
                </div>
            )}
            {parts.critique && (
                <div className="bg-rose-900/20 border border-rose-500/30 p-3 rounded-lg animate-in slide-in-from-right-2">
                    <div className="flex items-center gap-2 text-rose-400 mb-2 font-bold text-xs uppercase"><ShieldAlert size={14}/> Скептик</div>
                    <div className="text-slate-200 text-xs md:text-sm whitespace-pre-wrap font-mono leading-relaxed">{parts.critique}</div>
                </div>
            )}
            {parts.rebuttal && (
                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg animate-in slide-in-from-left-2">
                    <div className="flex items-center gap-2 text-blue-400 mb-2 font-bold text-xs uppercase"><Sparkles size={14}/> Опровержение</div>
                    <div className="text-slate-200 text-xs md:text-sm whitespace-pre-wrap font-mono leading-relaxed">{parts.rebuttal}</div>
                </div>
            )}
            {parts.final && (
                <div className="bg-amber-900/20 border border-amber-500/30 p-3 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.1)] animate-in zoom-in-95">
                    <div className="flex items-center gap-2 text-amber-400 mb-2 font-bold text-xs uppercase"><Cpu size={14}/> Итог</div>
                    <div className="text-slate-200 text-xs md:text-sm whitespace-pre-wrap font-mono leading-relaxed">{parts.final}</div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-[#0f1021] ${!isWidget ? 'rounded-xl border border-slate-700 shadow-2xl' : ''}`}>
      {!isWidget && (
        <div className="p-4 bg-slate-900/50 border-b border-white/5 flex items-center gap-2">
            <Sparkles className="text-purple-400 animate-pulse" size={20} />
            <h2 className="font-serif text-lg text-purple-100">Ментор ДЭИР (Thinking Mode)</h2>
        </div>
      )}

      {/* Message List */}
      <div 
        className="flex-1 overflow-y-auto p-4 pt-10 space-y-4 custom-scrollbar"
        style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 100%)' }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === Sender.User ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
              msg.sender === Sender.User 
                ? 'bg-indigo-600' 
                : msg.type === MessageType.Debate ? 'bg-amber-700' : 'bg-purple-700'
            }`}>
              {msg.sender === Sender.User ? <User size={14} className="text-white"/> : 
               msg.type === MessageType.Debate ? <Cpu size={14} className="text-white"/> : <Bot size={14} className="text-white"/>}
            </div>
            
            {msg.type === MessageType.Debate ? (
                // DEBATE MESSAGE BUBBLE
                <div className="w-[90%] md:w-[80%] rounded-2xl bg-[#0a0b14] border border-amber-500/20 p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                        <BrainCircuit size={16} className="text-amber-500" />
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Протокол Дебатов</span>
                    </div>
                    {renderDebateContent(msg.text)}
                </div>
            ) : (
                // STANDARD MESSAGE BUBBLE
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
                    msg.sender === Sender.User
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5'
                  }`}
                >
                  {msg.text}
                </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
               <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-slate-900/50 border-t border-white/5 relative">
        {/* Suggested Chips */}
        {messages.length < 3 && !isLoading && !isDebateMode && (
            <div className="absolute bottom-full left-0 w-full p-2 flex gap-2 overflow-x-auto custom-scrollbar-hide mask-fade-right">
                {currentSuggestions.map((q, i) => (
                    <button
                        key={i}
                        onClick={() => handleSend(q)}
                        className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-purple-600/60 border border-white/10 text-xs text-slate-300 hover:text-white transition-all backdrop-blur-md shadow-lg"
                    >
                        {q}
                    </button>
                ))}
            </div>
        )}

        {attachment && (
            <div className="absolute bottom-full left-2 mb-2 p-2 bg-slate-800/90 backdrop-blur rounded-lg flex items-center gap-2 border border-slate-600 shadow-lg animate-in slide-in-from-bottom-2 z-10">
                <div className="w-8 h-8 bg-slate-600 rounded flex items-center justify-center overflow-hidden">
                    {attachment.type.startsWith('image/') ? (
                         <img src={`data:${attachment.type};base64,${attachment.data}`} className="w-full h-full object-cover" />
                    ) : (
                        <FileText size={16} className="text-slate-300"/>
                    )}
                </div>
                <button onClick={removeAttachment} className="p-1 hover:bg-slate-600 rounded-full text-slate-400 hover:text-white">
                    <X size={12} />
                </button>
            </div>
        )}

        <div className="flex gap-2 items-center">
          <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             onChange={handleFileSelect}
             accept="image/*,.pdf,.txt"
          />
          <button
             onClick={() => fileInputRef.current?.click()}
             className="p-2 hover:bg-white/10 text-slate-400 hover:text-purple-300 rounded-full transition-colors"
          >
             <Paperclip size={18} />
          </button>
          
          <button
             onClick={() => {
                 setIsDebateMode(!isDebateMode);
                 setInputText('');
             }}
             className={`p-2 rounded-full transition-all border ${
                 isDebateMode 
                 ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
                 : 'hover:bg-white/10 text-slate-400 hover:text-amber-400 border-transparent'
             }`}
             title="Режим Нейро-Дебатов (Агент А vs Агент Б)"
          >
             <BrainCircuit size={18} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={!userName ? "Введите ваше имя..." : isDebateMode ? "Тема дебатов..." : "Сообщение..."}
            disabled={isRecording}
            className={`flex-1 bg-black/40 border rounded-full px-4 py-2 text-sm text-white focus:outline-none transition-colors ${
                isDebateMode ? 'border-amber-500/30 focus:border-amber-500 placeholder:text-amber-500/50' : 'border-white/10 focus:border-purple-500'
            }`}
          />
          
          {inputText.trim() || attachment ? (
              <button
                onClick={() => handleSend()}
                disabled={isLoading}
                className={`p-2 text-white rounded-full transition-colors shadow-lg transform hover:scale-105 ${
                    isDebateMode ? 'bg-amber-600 hover:bg-amber-500' : 'bg-purple-600 hover:bg-purple-500'
                }`}
              >
                <Send size={18} />
              </button>
          ) : (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_red]' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}
              >
                {isRecording ? <StopCircle size={18} /> : <Mic size={18} />}
              </button>
          )}
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
          .mask-fade-right {
              mask-image: linear-gradient(to right, black 80%, transparent 100%);
              -webkit-mask-image: linear-gradient(to right, black 80%, transparent 100%);
          }
      `}</style>
    </div>
  );
};

export default ChatInterface;