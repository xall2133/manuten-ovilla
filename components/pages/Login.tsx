import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, UserCircle2, Building2 } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
             <Building2 className="text-white" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Manutenção Villa Privilege
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Sistema Integrado de Gestão Predial</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => login('admin')}
            className="w-full flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
               <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-colors">
                  <Lock className="text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-200" size={24} />
               </div>
               <div className="text-left">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">Administrador</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Gestão completa do condomínio</p>
               </div>
            </div>
          </button>

          <button 
            onClick={() => login('operator')}
            className="w-full flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-xl hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:shadow-md transition-all group"
          >
             <div className="flex items-center gap-4">
               <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-full group-hover:bg-sky-100 dark:group-hover:bg-sky-800 transition-colors">
                  <UserCircle2 className="text-slate-600 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-200" size={24} />
               </div>
               <div className="text-left">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">Operador / Técnico</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Gestão de ordens de serviço</p>
               </div>
            </div>
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-400">
               Tech-X System v2.0 • Villa Privilege
            </p>
        </div>
      </div>
    </div>
  );
};