import React, { ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/ui/Layout';
import { AlertCircle } from 'lucide-react';
import { Login } from './components/pages/Login';
import { Dashboard } from './components/pages/Dashboard';
import { TaskList } from './components/pages/TaskList';
import { Settings } from './components/pages/Settings';
import { Visits } from './components/pages/Visits';
import { Schedule } from './components/pages/Schedule';
import { Painting } from './components/pages/Painting';
import { Purchases } from './components/pages/Purchases';
import { Works } from './components/pages/Works';
import { Trash } from './components/pages/Trash';

const ProtectedRoute = ({ children }: { children?: ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Login />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children?: ReactNode }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppContent = () => {
  const isConfigured = !!(
    (import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL) && 
    (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY)
  );

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-red-500/20 rounded-2xl">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Configuração Necessária</h1>
          </div>
          
          <div className="space-y-6 text-slate-300">
            <p className="text-lg leading-relaxed">
              As credenciais do <span className="text-emerald-400 font-bold">Supabase</span> não foram encontradas. 
              Para o aplicativo funcionar, você precisa configurar as variáveis de ambiente.
            </p>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-[10px]">1</span>
                Onde encontrar as chaves?
              </h2>
              <ol className="space-y-3 text-sm list-decimal list-inside ml-2">
                <li>Acesse o painel do <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Supabase</a></li>
                <li>Vá em <span className="bg-slate-700 px-2 py-0.5 rounded text-white font-sans">Project Settings</span> &gt; <span className="bg-slate-700 px-2 py-0.5 rounded text-white font-sans">API</span></li>
                <li>Copie a <span className="text-emerald-400 font-mono">Project URL</span></li>
                <li>Copie a <span className="text-emerald-400 font-mono">anon (public) API Key</span></li>
              </ol>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-[10px]">2</span>
                Como configurar aqui?
              </h2>
              <p className="text-sm mb-4">No menu de configurações do AI Studio (ícone de engrenagem), adicione estas variáveis:</p>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between bg-slate-950 p-3 rounded-xl border border-white/5">
                  <span className="text-blue-400">SUPABASE_URL</span>
                  <span className="text-slate-500">Sua URL do Supabase</span>
                </div>
                <div className="flex justify-between bg-slate-950 p-3 rounded-xl border border-white/5">
                  <span className="text-blue-400">SUPABASE_ANON_KEY</span>
                  <span className="text-slate-500">Sua Anon Key</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              Já configurei, recarregar o app
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="visits" element={<Visits />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="works" element={<Works />} />
        <Route path="painting" element={<Painting />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="trash" element={<Trash />} />
        <Route path="settings" element={
          <AdminRoute>
            <Settings />
          </AdminRoute>
        } />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <HashRouter>
             <AppContent />
          </HashRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}