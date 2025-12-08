import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertTriangle, CheckCircle2, Clock, ListFilter, CalendarDays, Users, PaintBucket, ShoppingCart, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

// Tech-X / Villa Privilege Palette
const COLORS = ['#2563eb', '#38bdf8', '#475569', '#6366f1', '#94a3b8', '#cbd5e1'];

export const Dashboard = () => {
  const { tasks, settings, visits, schedule, paintingProjects, purchases } = useData();
  const { theme } = useTheme();
  
  // State for date filter: '30' | '7' | '1' | 'all'
  const [dateRange, setDateRange] = useState('30');

  // --- Filter Logic ---
  const filteredTasks = useMemo(() => {
    if (dateRange === 'all') return tasks;

    const now = new Date();
    // Reset time to start of day for accurate comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return tasks.filter(task => {
        if (!task.callDate) return false;
        
        // Handle ISO or manual date strings
        let taskDate = new Date(task.callDate);
        if (isNaN(taskDate.getTime())) {
             // Try parsing DD/MM/YYYY manually if needed, or assume invalid
             if (task.callDate.includes('/')) {
                 const [d, m, y] = task.callDate.split('/');
                 taskDate = new Date(Number(y), Number(m) - 1, Number(d));
             } else {
                 return false;
             }
        }
        // Normalize task date to start of day
        taskDate.setHours(0, 0, 0, 0);

        if (dateRange === '1') {
            // Today
            return taskDate.getTime() === today.getTime();
        } else if (dateRange === '7') {
            // This Week (Start from Sunday)
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            return taskDate >= startOfWeek;
        } else if (dateRange === '30') {
            // Last 30 Days
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            return taskDate >= thirtyDaysAgo;
        }
        return true;
    });
  }, [tasks, dateRange]);

  // --- Metrics Calculation (Based on filteredTasks) ---
  const totalTasks = filteredTasks.length;
  const inProgressTasks = filteredTasks.filter(t => t.situation === 'Em Andamento').length;
  const completedTasks = filteredTasks.filter(t => t.situation === 'Concluído').length;
  const highCritTasks = filteredTasks.filter(t => t.criticality === 'Alta' && t.situation !== 'Concluído').length;

  const situationData = settings.situations.map(sit => ({
      name: sit.name,
      value: filteredTasks.filter(t => t.situation === sit.name).length
  })).filter(item => item.value > 0); 
  
  const knownSituations = settings.situations.map(s => s.name);
  const unknownTasksCount = filteredTasks.filter(t => !knownSituations.includes(t.situation)).length;
  if (unknownTasksCount > 0) {
      situationData.push({ name: 'Outros', value: unknownTasksCount });
  }

  const sectorData = settings.sectors.map(sector => ({
    name: sector.name,
    tarefas: filteredTasks.filter(t => t.sectorId === sector.id).length
  })).filter(d => d.tarefas > 0);

  // --- Helper Logic for Bottom Section ---

  // 1. Schedule Today
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayKey = days[new Date().getDay()];
  const todaySchedule = schedule.map(item => ({
      shift: item.shift,
      task: (item as any)[dayKey] || '-' // Accessing dynamic key safely
  })).filter(i => i.task !== '-' && i.task !== '');

  // 2. Recent Visits (Last 3)
  const recentVisits = [...visits].reverse().slice(0, 3);

  // 3. Active Painting Projects
  const activePainting = paintingProjects.slice(0, 3);

  // 4. Pending Purchases
  const pendingPurchases = purchases.filter(p => !p.approvalDate).slice(0, 3);


  const StatCard = ({ title, value, icon: Icon, colorClass, subText }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-start justify-between hover:shadow-md transition-all">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
        {subText && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{subText}</p>}
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Painel de Controle</h2>
           <p className="text-slate-500 dark:text-slate-400">Visão geral do condomínio</p>
        </div>
        <div className="flex gap-2">
           <select 
             value={dateRange}
             onChange={(e) => setDateRange(e.target.value)}
             className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
           >
             <option value="30">Últimos 30 dias</option>
             <option value="7">Esta semana</option>
             <option value="1">Hoje</option>
             <option value="all">Todo o período</option>
           </select>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tarefas no Período" 
          value={totalTasks} 
          icon={ListFilter} 
          colorClass="bg-blue-600" 
          subText={dateRange === 'all' ? 'Histórico completo' : 'Filtrado por data'}
        />
        <StatCard 
          title="Em Andamento" 
          value={inProgressTasks} 
          icon={Clock} 
          colorClass="bg-sky-500" 
          subText={totalTasks > 0 ? `${Math.round((inProgressTasks/totalTasks)*100)}% do período` : '0%'}
        />
        <StatCard 
          title="Concluídas" 
          value={completedTasks} 
          icon={CheckCircle2} 
          colorClass="bg-slate-600" 
          subText="Finalizadas com sucesso"
        />
        <StatCard 
          title="Criticidade Alta" 
          value={highCritTasks} 
          icon={AlertTriangle} 
          colorClass="bg-red-500" 
          subText="Requer atenção imediata"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Situation Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Status das Tarefas</h3>
          <div className="h-64 w-full">
            {situationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={situationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    stroke={theme === 'dark' ? '#1e293b' : '#fff'}
                    >
                    {situationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '8px', border: theme === 'dark' ? '1px solid #334155' : 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: theme === 'dark' ? '#fff' : '#334155' }}
                    itemStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#334155' }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}/>
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    Sem dados para o período selecionado.
                </div>
            )}
          </div>
        </div>

        {/* Tasks by Sector */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Tarefas por Setor</h3>
          <div className="h-64 w-full">
            {sectorData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12}} />
                    <Tooltip 
                    cursor={{fill: theme === 'dark' ? '#334155' : '#f1f5f9'}}
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '8px', border: theme === 'dark' ? '1px solid #334155' : 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: theme === 'dark' ? '#fff' : '#334155' }}
                    />
                    <Bar dataKey="tarefas" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    Sem dados para o período selecionado.
                </div>
            )}
          </div>
        </div>
      </div>

      {/* --- OPERATIONAL SUMMARY SECTION --- */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            Resumo Operacional
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1 ml-4"></div>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* Card: Visitas Recentes */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                        <Users size={18} className="text-blue-500" />
                        <h4>Visitas Recentes</h4>
                    </div>
                    <Link to="/visits" className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">Ver tudo <ArrowRight size={12}/></Link>
                </div>
                <div className="space-y-3 flex-1">
                    {recentVisits.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">Nenhuma visita recente.</p>
                    ) : (
                        recentVisits.map(v => (
                            <div key={v.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">{v.unit} - {v.tower}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{v.situation}</p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${v.status === 'Pendente' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                    {v.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Card: Cronograma Hoje */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                        <CalendarDays size={18} className="text-emerald-500" />
                        <h4>Agenda de Hoje</h4>
                    </div>
                    <Link to="/schedule" className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">Ver tudo <ArrowRight size={12}/></Link>
                </div>
                <div className="space-y-3 flex-1">
                    {todaySchedule.length === 0 ? (
                         <p className="text-sm text-slate-400 italic">Sem atividades agendadas para hoje.</p>
                    ) : (
                        todaySchedule.map((s, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-sm p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg border-l-2 border-emerald-400">
                                <div className="flex-1">
                                    <p className="font-bold text-slate-800 dark:text-white uppercase text-xs mb-0.5">{s.shift}</p>
                                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{s.task}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Card: Pintura em Andamento */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                        <PaintBucket size={18} className="text-indigo-500" />
                        <h4>Pintura</h4>
                    </div>
                    <Link to="/painting" className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">Ver tudo <ArrowRight size={12}/></Link>
                </div>
                <div className="space-y-3 flex-1">
                    {activePainting.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">Nenhum projeto de pintura listado.</p>
                    ) : (
                        activePainting.map(p => (
                            <div key={p.id} className="text-sm p-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-slate-800 dark:text-white">{p.local}</span>
                                    <span className={`text-[10px] px-1.5 rounded border ${p.criticality === 'Alta' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{p.criticality}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{p.tower}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Card: Compras Pendentes */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                        <ShoppingCart size={18} className="text-orange-500" />
                        <h4>Solicitações Pendentes</h4>
                    </div>
                    <Link to="/purchases" className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">Ver tudo <ArrowRight size={12}/></Link>
                </div>
                <div className="space-y-3 flex-1">
                     {pendingPurchases.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center">
                            <p className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-700/50 py-2 px-4 rounded-full">Tudo em dia!</p>
                        </div>
                    ) : (
                        pendingPurchases.map(req => (
                            <div key={req.id} className="flex items-center justify-between text-sm p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800 dark:text-white">{req.quantity}x</span>
                                        <span className="text-slate-700 dark:text-slate-200 truncate max-w-[100px]">{req.description}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase mt-0.5">{req.local}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-medium text-orange-600 dark:text-orange-400">Aguardando</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
