import React from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Settings, LogOut, Bell, Menu, Building2, Moon, Sun, Users, CalendarDays, PaintBucket, ShoppingCart, RefreshCcw, Wifi, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';

export const Layout = () => {
  const { user, logout } = useAuth();
  const { tasks, isLoading, refreshData, lastUpdated } = useData();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Simple logic to count active high-criticality tasks for notification
  const alertCount = tasks.filter(t => t.criticality === 'Alta' && t.situation !== 'Concluído').length;

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tarefas', icon: ClipboardList },
    { path: '/visits', label: 'Visitas', icon: Users },
    { path: '/schedule', label: 'Cronograma', icon: CalendarDays },
    { path: '/painting', label: 'Pintura', icon: PaintBucket },
    { path: '/purchases', label: 'Compras', icon: ShoppingCart },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/settings', label: 'Configurações', icon: Settings });
  }

  const handleManualSync = async () => {
      await refreshData();
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex flex-col items-center justify-center h-24 border-b border-slate-100 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-1">
             <div className="bg-blue-600 p-1.5 rounded-lg">
                <Building2 className="text-white" size={24} />
             </div>
             <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                Villa Privilege
             </h1>
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Gestão Predial</p>
        </div>

        <nav className="p-4 space-y-1">
          <div className="mb-6 px-4">
             <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <img src={user?.avatar} alt="User" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600" />
                <div>
                   <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role === 'admin' ? 'Administrador' : 'Operador'}</p>
                </div>
             </div>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            {navItems.map((item) => (
                <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
                >
                <item.icon size={20} className={isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'} />
                <span className="font-medium">{item.label}</span>
                </Link>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-slate-800 pt-2">
          <button
            onClick={logout}
            className="flex items-center w-full gap-3 px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header (Mobile & Desktop) */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 md:justify-end shrink-0">
           <button 
             className="md:hidden text-slate-500 dark:text-slate-300 hover:text-slate-800"
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
           >
             <Menu size={24} />
           </button>

           <div className="flex items-center gap-4">
             {/* Theme Toggle */}
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
             >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <div className="relative cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors">
               <Bell size={20} className="text-slate-600 dark:text-slate-400" />
               {alertCount > 0 && (
                 <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
               )}
             </div>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100 dark:bg-slate-900 pb-20">
           <div className="max-w-7xl mx-auto">
             <Outlet />
           </div>
        </main>

        {/* Persistent Bottom Status Bar */}
        <div className="h-12 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0 z-10">
            <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline-block">
                    Sistema Online
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-slate-700 pl-2 ml-2 hidden sm:inline-block">
                    Última sincronização: {lastUpdated.toLocaleTimeString()}
                </span>
            </div>
            
            <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400 hidden md:inline">
                    Todas as alterações são salvas automaticamente.
                </span>
                <button 
                   onClick={handleManualSync}
                   disabled={isLoading}
                   className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                    <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} />
                    {isLoading ? 'Sincronizando...' : 'Sincronizar / Salvar'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};