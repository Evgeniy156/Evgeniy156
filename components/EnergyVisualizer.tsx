import React, { useState } from 'react';
import { Shield, ArrowUp, ArrowDown } from 'lucide-react';

const EnergyVisualizer: React.FC = () => {
  const [showAscending, setShowAscending] = useState(true);
  const [showDescending, setShowDescending] = useState(true);
  const [showShell, setShowShell] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden relative">
      <h2 className="text-2xl font-serif text-purple-300 mb-6 tracking-widest z-10">МОНИТОР БИОПОЛЯ</h2>
      
      {/* Background ambient effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-screen filter blur-[80px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600 rounded-full mix-blend-screen filter blur-[80px] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative w-72 h-[450px] mb-8 z-10">
        <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          {/* Aura / Body Halo */}
          <path
            d="M50 18 C62 18 68 24 68 35 C68 43 62 46 70 52 C78 58 88 64 92 85 C94 95 88 105 82 105 C82 105 84 145 84 155 C84 185 72 198 55 198 L45 198 C28 198 16 185 16 155 C16 145 18 105 18 105 C12 105 6 95 8 85 C12 64 22 58 30 52 C38 46 32 43 32 35 C32 24 38 18 50 18 Z"
            fill="#1e293b"
            stroke="#64748b"
            strokeWidth="0.5"
            className="drop-shadow-lg"
          />

          {/* Ascending Flow (Dynamic Gradient) */}
          {showAscending && (
            <>
              {/* Main Channel */}
              <path d="M46 198 L46 25" stroke="url(#gradUp)" strokeWidth="5" fill="none" strokeLinecap="round" style={{filter: 'blur(3px)'}} />
              {/* Core Hotspot */}
              <path d="M46 198 L46 25" stroke="#fff" strokeWidth="1" fill="none" opacity="0.5" />
            </>
          )}

          {/* Descending Flow (Dynamic Gradient) */}
          {showDescending && (
            <>
              {/* Main Channel */}
              <path d="M54 15 L54 190" stroke="url(#gradDown)" strokeWidth="5" fill="none" strokeLinecap="round" style={{filter: 'blur(3px)'}} />
              {/* Core Coolspot */}
              <path d="M54 15 L54 190" stroke="#fff" strokeWidth="1" fill="none" opacity="0.5" />
            </>
          )}

          {/* Protective Shell (Shimmering) */}
          {showShell && (
            <>
            <ellipse 
              cx="50" 
              cy="100" 
              rx="45" 
              ry="92" 
              fill="url(#shellGrad)" 
              stroke="url(#shellStroke)" 
              strokeWidth="1.5" 
              className="animate-[pulse-aura_3s_ease-in-out_infinite]"
              opacity="0.6"
            />
             <ellipse 
              cx="50" 
              cy="100" 
              rx="42" 
              ry="88" 
              fill="none"
              stroke="#fff" 
              strokeWidth="0.5" 
              strokeDasharray="4 4"
              opacity="0.3"
              className="animate-spin-slow" // Assume global spin or remove
            />
            </>
          )}

          <defs>
            {/* Dynamic Red/Orange/Gold Gradient */}
            <linearGradient id="gradUp" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0" />
              <stop offset="20%" stopColor="#ef4444" stopOpacity="0.8">
                 <animate attributeName="stop-color" values="#ef4444;#ea580c;#ef4444" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="1">
                 <animate attributeName="stop-color" values="#f59e0b;#fcd34d;#f59e0b" dur="1.5s" repeatCount="indefinite" />
              </stop>
              <stop offset="80%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
            </linearGradient>

            {/* Dynamic Blue/Cyan/Violet Gradient */}
            <linearGradient id="gradDown" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0" />
              <stop offset="20%" stopColor="#3b82f6" stopOpacity="0.8">
                 <animate attributeName="stop-color" values="#3b82f6;#0ea5e9;#3b82f6" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="1">
                 <animate attributeName="stop-color" values="#60a5fa;#a78bfa;#60a5fa" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="80%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </linearGradient>

            {/* Shell Gradient */}
            <radialGradient id="shellGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="70%" stopColor="#581c87" stopOpacity="0" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
            </radialGradient>
            <linearGradient id="shellStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
          </defs>
        </svg>

        {/* CSS Particles */}
        {showAscending && (
           <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {/* Creating multiple particles with different delays */}
             {[...Array(5)].map((_, i) => (
                <div key={`up-${i}`} 
                     className="absolute bottom-0 w-1.5 h-1.5 bg-yellow-400 rounded-full blur-[1px]"
                     style={{
                        left: `${43 + Math.random() * 4}%`,
                        animation: `riseParticle ${1.5 + Math.random()}s infinite linear`,
                        animationDelay: `${Math.random() * 2}s`
                     }}
                ></div>
             ))}
           </div>
        )}
        {showDescending && (
           <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div key={`down-${i}`} 
                     className="absolute top-0 w-1.5 h-1.5 bg-cyan-300 rounded-full blur-[1px]"
                     style={{
                        left: `${52 + Math.random() * 4}%`,
                        animation: `fallParticle ${1.5 + Math.random()}s infinite linear`,
                        animationDelay: `${Math.random() * 2}s`
                     }}
                ></div>
             ))}
           </div>
        )}
      </div>

      <style>{`
        @keyframes riseParticle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(-400px) scale(0); opacity: 0; }
        }
        @keyframes fallParticle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(400px) scale(0); opacity: 0; }
        }
      `}</style>

      <div className="grid grid-cols-3 gap-4 w-full relative z-10">
        <button 
          onClick={() => setShowAscending(!showAscending)}
          className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-300 ${showAscending ? 'bg-red-900/40 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
        >
          <ArrowUp size={24} className={showAscending ? "animate-bounce" : ""} />
          <span className="text-xs mt-1 font-medium">Восходящий</span>
        </button>
        <button 
          onClick={() => setShowDescending(!showDescending)}
          className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-300 ${showDescending ? 'bg-blue-900/40 border-blue-500 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
        >
          <ArrowDown size={24} className={showDescending ? "animate-bounce" : ""} />
          <span className="text-xs mt-1 font-medium">Нисходящий</span>
        </button>
        <button 
          onClick={() => setShowShell(!showShell)}
          className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-300 ${showShell ? 'bg-purple-900/40 border-purple-500 text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
        >
          <Shield size={24} className={showShell ? "animate-pulse" : ""} />
          <span className="text-xs mt-1 font-medium">Оболочка</span>
        </button>
      </div>
      
      <div className="mt-6 text-center text-sm text-slate-400 px-4 min-h-[40px]">
        {showShell ? 
          <span className="text-purple-300 animate-pulse">Защитная оболочка активна. Контур замкнут. Вы невидимы.</span> :
          (showAscending && showDescending) ? "Активная прокачка обоих потоков." :
          showAscending ? "Активен Восходящий поток (Сила)." :
          showDescending ? "Активен Нисходящий поток (Сознание)." :
          "Потоки в состоянии покоя."
        }
      </div>
    </div>
  );
};

export default EnergyVisualizer;