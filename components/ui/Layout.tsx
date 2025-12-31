import React from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Settings, LogOut, Bell, Menu, Hexagon, Moon, Sun, Users, CalendarDays, PaintBucket, ShoppingCart, RefreshCcw, Wifi, Zap, RefreshCw, HardHat, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';

export const Layout = () => {
  const { user, logout } = useAuth();
  const { tasks, isLoading, refreshData, lastUpdated } = useData();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const APP_VERSION = "v2.0";

  const alertCount = tasks.filter(t => t.criticality === 'Alta' && t.situation !== 'Concluído').length;

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tarefas', icon: ClipboardList },
    { path: '/visits', label: 'Visitas', icon: Users },
    { path: '/schedule', label: 'Cronograma', icon: CalendarDays },
    { path: '/works', label: 'Obras', icon: HardHat },
    { path: '/painting', label: 'Pintura', icon: PaintBucket },
    { path: '/purchases', label: 'Compras', icon: ShoppingCart },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/settings', label: 'Configurações', icon: Settings });
  }

  const handleManualSync = async () => {
      await refreshData();
  };

  const handleHardReload = () => {
      if ('caches' in window) {
          caches.keys().then((names) => {
              names.forEach((name) => {
                  caches.delete(name);
              });
          });
      }
      window.location.reload();
  };

  return (
    <div className="flex h-screen bg-slate-950 bg-grid-pattern text-slate-100 font-sans overflow-hidden transition-colors duration-200">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-200 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
        <div className="flex flex-col items-center justify-center h-24 border-b border-white/5 p-4 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
          <div className="flex items-center gap-2 mb-1">
             <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                <Hexagon className="text-white fill-white/20" size={20} strokeWidth={2} />
             </div>
             <h1 className="text-xl font-bold text-white leading-tight font-display tracking-tight">
                Vila Privilege
             </h1>
          </div>
          <div className="flex items-center gap-2">
             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Gestão Predial</p>
             <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-white/5">{APP_VERSION}</span>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          <div className="mb-6 px-4">
             <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5">
                <img src={user?.avatar} alt="User" className="w-9 h-9 rounded-lg border border-white/10" />
                <div>
                   <p className="text-sm font-semibold text-white font-display">{user?.name}</p>
                   <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{user?.role === 'admin' ? 'Admin' : 'Operador'}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-300px)] custom-scrollbar">
            {navItems.map((item) => (
                <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                    isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
                >
                {isActive(item.path) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-r-full"></div>}
                <item.icon size={20} className={isActive(item.path) ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="font-medium font-display">{item.label}</span>
                </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="flex items-center w-full gap-3 px-4 py-3 text-slate-500 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut size={20} />
            <span className="font-medium">Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 md:justify-end shrink-0 z-20">
           <button 
             className="md:hidden text-slate-300 hover:text-white"
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
           >
             <Menu size={24} />
           </button>

           <div className="flex items-center gap-4">
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
                title="Alternar Tema"
             >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <div className="relative cursor-pointer hover:bg-slate-800 p-2 rounded-full transition-colors group">
               <Bell size={20} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
               {alertCount > 0 && (
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
               )}
               {alertCount > 0 && (
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
               )}
             </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           <div className="max-w-7xl mx-auto">
             <Outlet />
           </div>
        </main>

        <div className="h-10 bg-slate-900 border-t border-white/5 flex items-center justify-between px-6 shrink-0 z-10 text-[10px] md:text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Wifi size={12} className="text-emerald-500" />
                    <span className="text-emerald-500 font-medium">ONLINE</span>
                </div>
                <span className="hidden sm:inline-block opacity-50">|</span>
                <span className="hidden sm:inline-block text-slate-400">
                    SYNC: {lastUpdated.toLocaleTimeString()}
                </span>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                   onClick={handleHardReload}
                   className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                   title="Forçar recarregamento da aplicação"
                >
                    <RefreshCw size={12} />
                    RELOAD APP
                </button>
                <div className="w-px h-3 bg-slate-700 mx-1"></div>
                <button 
                   onClick={handleManualSync}
                   disabled={isLoading}
                   className="flex items-center gap-2 hover:text-cyan-400 transition-colors disabled:opacity-50"
                >
                    <RefreshCcw size={12} className={isLoading ? 'animate-spin' : ''} />
                    {isLoading ? 'SYNCING...' : 'FORCE SYNC'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};