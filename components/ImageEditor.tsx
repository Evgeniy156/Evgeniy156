import React, { useState, useRef } from 'react';
import { Edit3, Upload, Loader2, Download, ArrowRight } from 'lucide-react';
import { editDeirImage } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setEditedImage(null); // Reset edited image on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!originalImage || !prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await editDeirImage(originalImage, prompt);
      if (result) {
        setEditedImage(result);
      }
    } catch (error) {
      console.error(error);
      alert("Не удалось отредактировать изображение.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Edit3 className="text-purple-400" size={24} />
        <h2 className="font-serif text-2xl text-purple-100">Редактор Энергии</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">
        {/* Input Column */}
        <div className="flex flex-col gap-4">
          <div 
            className="flex-1 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors relative overflow-hidden group"
            onClick={() => fileInputRef.current?.click()}
          >
            {originalImage ? (
              <img src={originalImage} className="w-full h-full object-contain" alt="Original" />
            ) : (
              <div className="text-center text-slate-500">
                <Upload size={32} className="mx-auto mb-2 opacity-50" />
                <p>Загрузить фото</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Добавьте фиолетовое свечение..."
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button 
              onClick={handleEdit}
              disabled={isLoading || !originalImage || !prompt.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 rounded-lg transition-colors"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="animate-spin text-purple-500 mx-auto mb-4" size={48} />
              <p className="text-slate-400">Трансформация реальности...</p>
            </div>
          ) : editedImage ? (
             <>
              <img src={editedImage} className="w-full h-full object-contain" alt="Edited" />
              <a 
                href={editedImage} 
                download="deir-edited.png"
                className="absolute bottom-4 right-4 p-3 bg-purple-600 hover:bg-purple-500 rounded-full text-white shadow-lg"
              >
                <Download size={20} />
              </a>
             </>
          ) : (
            <p className="text-slate-600">Результат появится здесь</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;