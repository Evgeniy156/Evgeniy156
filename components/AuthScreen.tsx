import React, { useState } from 'react';
import { User, Lock, ArrowRight, Zap } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (email: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }
    // Simulation of auth
    if (password.length < 4) {
        setError('Пароль слишком короткий');
        return;
    }
    onLogin(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02040a] relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.5)] mx-auto mb-4">
               <Zap size={32} className="text-white fill-white" />
           </div>
           <h1 className="text-3xl font-serif text-white mb-2">DEIR.AI</h1>
           <p className="text-slate-400 text-xs tracking-[0.3em] uppercase">Система Энергоинформационного Развития</p>
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-xl mb-6">
           <button 
             onClick={() => { setIsLogin(true); setError(''); }}
             className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             Вход
           </button>
           <button 
             onClick={() => { setIsLogin(false); setError(''); }}
             className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             Регистрация
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           <div className="space-y-2">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider ml-1">Email</label>
              <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-700"
                    placeholder="initiate@deir.org"
                  />
              </div>
           </div>
           
           <div className="space-y-2">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider ml-1">Пароль</label>
              <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-700"
                    placeholder="••••••••"
                  />
              </div>
           </div>

           {error && (
             <div className="text-rose-400 text-sm text-center bg-rose-900/20 py-2 rounded-lg border border-rose-900/50">
               {error}
             </div>
           )}

           <button 
             type="submit"
             className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] mt-4"
           >
             <span>{isLogin ? 'Войти в Систему' : 'Начать Путь'}</span>
             <ArrowRight size={18} />
           </button>
        </form>
        
        <p className="text-center text-xs text-slate-600 mt-6">
            Доступ только для Ищущих. Система фиксирует прогресс.
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;