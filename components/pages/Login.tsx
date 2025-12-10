import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, UserCircle2, Hexagon, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 bg-grid-pattern flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10 relative z-10">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="relative mb-6 group">
             <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
             <div className="relative bg-slate-900 p-4 rounded-xl border border-white/10">
                <Hexagon className="text-cyan-400" size={40} strokeWidth={1.5} />
             </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-display">
            Manutenção <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Vila Privilege</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500"/> System Secure Access v3.0
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => login('admin')}
            className="w-full flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 hover:border-blue-500/50 rounded-xl hover:bg-slate-800 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-4 relative z-10">
               <div className="bg-slate-900 p-3 rounded-lg border border-white/5 group-hover:border-blue-500/30 transition-colors">
                  <Lock className="text-slate-400 group-hover:text-blue-400" size={20} />
               </div>
               <div className="text-left">
                  <h3 className="font-bold text-slate-200 font-display">Administrador</h3>
                  <p className="text-xs text-slate-500">Acesso Total / Configurações</p>
               </div>
            </div>
            <ArrowRight size={18} className="text-slate-600 group-hover:text-blue-400 -translate-x-2 group-hover:translate-x-0 transition-all relative z-10" />
          </button>

          <button 
            onClick={() => login('operator')}
            className="w-full flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 hover:border-cyan-500/50 rounded-xl hover:bg-slate-800 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="flex items-center gap-4 relative z-10">
               <div className="bg-slate-900 p-3 rounded-lg border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                  <UserCircle2 className="text-slate-400 group-hover:text-cyan-400" size={20} />
               </div>
               <div className="text-left">
                  <h3 className="font-bold text-slate-200 font-display">Operador Técnico</h3>
                  <p className="text-xs text-slate-500">Ordens de Serviço / Visitas</p>
               </div>
            </div>
            <ArrowRight size={18} className="text-slate-600 group-hover:text-cyan-400 -translate-x-2 group-hover:translate-x-0 transition-all relative z-10" />
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
               Powered by Vibe Cod • Vila Privilege
            </p>
        </div>
      </div>
    </div>
  );
};