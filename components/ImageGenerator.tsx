import React, { useState, useEffect } from 'react';
import { Palette, Loader2, Download, Maximize } from 'lucide-react';
import { generateDeirImage } from '../services/geminiService';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.hasSelectedApiKey) {
      const hasKey = await aistudio.hasSelectedApiKey();
      setApiKeySelected(hasKey);
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

  const presets = [
    "Моя защитная оболочка, сияющая золотым светом",
    "Мощный восходящий поток энергии Земли, красный и теплый",
    "Кристально чистый нисходящий поток Космоса, синий и прохладный",
    "Чакры, светящиеся вдоль позвоночника",
    "Эфирное тело, окружающее физический силуэт"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Double check key before generation
    if (!apiKeySelected) {
       await handleSelectKey();
       // If still not selected (user cancelled), return
       const aistudio = (window as any).aistudio;
       if (aistudio && aistudio.hasSelectedApiKey && !(await aistudio.hasSelectedApiKey())) {
         return; 
       }
    }

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const url = await generateDeirImage(prompt, size);
      if (url) {
        setImageUrl(url);
      } else {
        setError("Не удалось сгенерировать изображение. Попробуйте еще раз.");
      }
    } catch (e: any) {
      console.error(e);
      const errStr = JSON.stringify(e);
      // Check for 403 in message, status, or raw JSON string
      if (
        e.message?.includes('403') || 
        e.message?.includes('permission') || 
        e.status === 403 || 
        errStr.includes('403') ||
        errStr.includes('PERMISSION_DENIED')
      ) {
        setError("Ошибка доступа (403). Требуется платный API ключ.");
        setApiKeySelected(false); // Force re-selection
      } else {
        setError("Ошибка соединения с Gemini.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!apiKeySelected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-900 rounded-xl border border-slate-700">
        <Palette size={64} className="text-purple-500 mb-6" />
        <h2 className="text-2xl font-serif text-white mb-4">Требуется доступ к Imagen 3 Pro</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          Для генерации изображений высокого качества (1K/2K/4K) требуется выбрать платный API ключ Google Cloud.
          <br/>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-purple-400 underline">Подробнее о биллинге</a>
        </p>
        <button 
          onClick={handleSelectKey}
          className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-bold transition-colors"
        >
          Выбрать API Key
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="text-purple-400" size={24} />
        <h2 className="font-serif text-2xl text-purple-100">Генератор (Nano Banana Pro)</h2>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-400">Опишите вашу визуализацию:</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {presets.map((p, i) => (
              <button 
                key={i}
                onClick={() => setPrompt(p)}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full px-3 py-1 transition-colors text-slate-300"
              >
                {p.slice(0, 30)}...
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 mb-2">
             <span className="text-sm text-slate-400">Размер:</span>
             {(['1K', '2K', '4K'] as const).map((s) => (
               <button
                 key={s}
                 onClick={() => setSize(s)}
                 className={`px-3 py-1 text-xs rounded border transition-colors ${size === s ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'}`}
               >
                 {s}
               </button>
             ))}
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Сияющая сфера вокруг человека..."
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button 
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Maximize size={20} />}
              <span>Создать</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden group">
        {isLoading ? (
          <div className="text-center">
            <Loader2 className="animate-spin text-purple-500 mx-auto mb-4" size={48} />
            <p className="text-slate-400 animate-pulse">Материализация мыслеформы...</p>
            <p className="text-xs text-slate-600 mt-2">Размер: {size}</p>
          </div>
        ) : imageUrl ? (
          <>
            <img src={imageUrl} alt="Generated Visualization" className="max-h-full max-w-full object-contain shadow-2xl" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <a 
                href={imageUrl} 
                download={`deir-visualization-${Date.now()}.png`}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
                title="Скачать"
              >
                <Download size={24} />
              </a>
            </div>
          </>
        ) : error ? (
          <div className="text-red-400 text-center px-4">
            <p>{error}</p>
            {error.includes("403") && (
                <button 
                  onClick={handleSelectKey}
                  className="mt-4 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-2 rounded-lg text-purple-300 transition-colors"
                >
                  Сменить API Key
                </button>
            )}
          </div>
        ) : (
          <div className="text-slate-600 text-center px-4">
            <Palette size={48} className="mx-auto mb-4 opacity-20" />
            <p>Ваша визуализация появится здесь</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;