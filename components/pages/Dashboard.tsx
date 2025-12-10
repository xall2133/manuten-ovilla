import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertTriangle, CheckCircle2, Clock, ListFilter, CalendarDays, Users, PaintBucket, ShoppingCart, ArrowRight, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

// Neon Palette for Vibe Cod
const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export const Dashboard = () => {
  const { tasks, settings, visits, schedule, paintingProjects, purchases } = useData();
  const { theme } = useTheme();
  
  // Default 'all' to show history immediately
  const [dateRange, setDateRange] = useState('all');

  // Helper robusto para datas
  const parseDate = (dateStr: string) => {
      if (!dateStr) return null;
      let d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d;

      if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
              let year = parseInt(parts[2]);
              if (year < 100) year += 2000;
              d = new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
              if (!isNaN(d.getTime())) return d;
          }
      }
      return null;
  };

  // --- Filter Logic ---
  const filteredTasks = useMemo(() => {
    if (dateRange === 'all') return tasks;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return tasks.filter(task => {
        const taskDate = parseDate(task.callDate);
        if (!taskDate) return false; 
        
        taskDate.setHours(0, 0, 0, 0);

        if (dateRange === '1') {
            return taskDate.getTime() === today.getTime();
        } else if (dateRange === '7') {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            return taskDate >= startOfWeek;
        } else if (dateRange === '30') {
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            return taskDate >= thirtyDaysAgo;
        }
        return true;
    });
  }, [tasks, dateRange]);

  // --- Metrics Calculation (Robust) ---
  const totalTasks = filteredTasks.length;
  
  // Contagem flexível para "Em Andamento"
  const inProgressTasks = filteredTasks.filter(t => {
      const s = (t.situation || '').toLowerCase();
      return s.includes('andamento') || s.includes('execu') || s.includes('iniciad');
  }).length;

  const completedTasks = filteredTasks.filter(t => 
    (t.situation || '').toLowerCase().includes('conclu')
  ).length;

  // Filtra TODAS as críticas (Alta/Urgente)
  const allHighCritTasks = filteredTasks.filter(t => {
      const crit = (t.criticality || '').toLowerCase();
      return crit.includes('alt') || crit.includes('high') || crit.includes('urge') || crit.includes('crít') || crit.includes('crit');
  });

  const highCritCount = allHighCritTasks.length;
  
  // Quantas dessas críticas ainda não foram concluídas?
  const highCritPendingCount = allHighCritTasks.filter(t => 
      !(t.situation || '').toLowerCase().includes('conclu') && 
      !(t.situation || '').toLowerCase().includes('cancel')
  ).length;

  // Group situations for Chart
  const situationMap = new Map<string, number>();
  filteredTasks.forEach(t => {
      let rawSit = (t.situation || 'Aberto').trim();
      let lowerSit = rawSit.toLowerCase();
      let displaySit = rawSit;

      if (lowerSit.includes('andamento') || lowerSit.includes('execu')) displaySit = 'Em Andamento';
      else if (lowerSit.includes('conclu')) displaySit = 'Concluído';
      else if (lowerSit.includes('cancel')) displaySit = 'Cancelado';
      else if (lowerSit.includes('aberto') || lowerSit.includes('pende')) displaySit = 'Aberto';
      else displaySit = displaySit.charAt(0).toUpperCase() + displaySit.slice(1).toLowerCase();

      situationMap.set(displaySit, (situationMap.get(displaySit) || 0) + 1);
  });

  const situationData = Array.from(situationMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Group sectors (Case Insensitive)
  const sectorMap = new Map<string, number>();
  filteredTasks.forEach(t => {
      // Tenta achar o nome do setor pelo ID nas configurações, ou usa o ID como fallback
      const sectorConfig = settings.sectors.find(s => s.id === t.sectorId);
      const name = sectorConfig ? sectorConfig.name : (t.sectorId || 'Geral');
      
      // Normaliza nome para agrupar "Eletrica" e "ELETRICA"
      const normalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      sectorMap.set(normalizedName, (sectorMap.get(normalizedName) || 0) + 1);
  });
  
  const sectorData = Array.from(sectorMap.entries())
    .map(([name, tarefas]) => ({ name, tarefas }))
    .sort((a, b) => b.tarefas - a.tarefas)
    .slice(0, 8); // Top 8 setores

  // --- Helper Logic for Bottom Section ---
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayKey = days[new Date().getDay()];
  const todaySchedule = schedule.map(item => ({
      shift: item.shift,
      task: (item as any)[dayKey] || '-' 
  })).filter(i => i.task !== '-' && i.task !== '');

  const recentVisits = [...visits].reverse().slice(0, 3);
  const activePainting = paintingProjects.slice(0, 3);
  const pendingPurchases = purchases.filter(p => !p.approvalDate).slice(0, 3);

  const StatCard = ({ title, value, icon: Icon, colorClass, gradient, subText, subTextColor }: any) => (
    <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`}></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white font-display tracking-tight">{value}</h3>
          {subText && (
              <p className={`text-xs mt-2 flex items-center gap-1 font-medium ${subTextColor || 'text-slate-500'}`}>
                  {subTextColor ? <AlertCircle size={10} /> : <TrendingUp size={10}/>} {subText}
              </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-slate-800/80 border border-white/5 group-hover:scale-110 transition-transform ${colorClass}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold text-white font-display">Dashboard</h2>
           <p className="text-slate-400 flex items-center gap-2 text-sm"><Zap size={14} className="text-yellow-500"/> Visão geral em tempo real</p>
        </div>
        <div className="flex gap-2">
           <select 
             value={dateRange}
             onChange={(e) => setDateRange(e.target.value)}
             className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:bg-slate-800 transition-colors cursor-pointer"
           >
             <option value="all">Todo o período</option>
             <option value="30">Últimos 30 dias</option>
             <option value="7">Esta semana</option>
             <option value="1">Hoje</option>
           </select>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Tarefas" 
          value={totalTasks} 
          icon={ListFilter} 
          colorClass="text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          gradient="from-blue-600 to-cyan-500"
          subText={dateRange === 'all' ? 'Histórico completo' : 'No período'}
        />
        <StatCard 
          title="Em Andamento" 
          value={inProgressTasks} 
          icon={Clock} 
          colorClass="text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          gradient="from-cyan-500 to-emerald-500"
          subText={`${((inProgressTasks / (totalTasks || 1)) * 100).toFixed(0)}% do total`}
        />
        <StatCard 
          title="Concluídas" 
          value={completedTasks} 
          icon={CheckCircle2} 
          colorClass="text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
          gradient="from-emerald-500 to-teal-500"
          subText="Finalizadas"
        />
        <StatCard 
          title="Criticidade Alta" 
          value={highCritCount} 
          icon={AlertTriangle} 
          colorClass="text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
          gradient="from-red-500 to-orange-500"
          subText={highCritPendingCount > 0 ? `${highCritPendingCount} Ativas / Pendentes` : 'Tudo resolvido!'}
          subTextColor={highCritPendingCount > 0 ? 'text-red-400' : 'text-emerald-500'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Situation Distribution */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 font-display">Status das Tarefas</h3>
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
                    paddingAngle={5}
                    dataKey="value"
                    stroke="#0f172a"
                    strokeWidth={2}
                    >
                    {situationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', color: '#f8fafc' }}
                    itemStyle={{ color: '#cbd5e1' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                    <p>Sem dados para o período.</p>
                </div>
            )}
          </div>
        </div>

        {/* Tasks by Sector */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 font-display">Tarefas por Setor</h3>
          <div className="h-64 w-full">
            {sectorData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                     cursor={{fill: '#1e293b'}}
                     contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', color: '#f8fafc' }}
                     itemStyle={{ color: '#60a5fa' }}
                    />
                    <Bar dataKey="tarefas" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                         {sectorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    Sem dados para o período selecionado.
                </div>
            )}
          </div>
        </div>
      </div>

      {/* --- OPERATIONAL SUMMARY SECTION --- */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-display">
            Resumo Operacional
            <div className="h-px bg-slate-800 flex-1 ml-4"></div>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* ... (Cards mantidos iguais ao anterior para brevidade, mas funcionais) ... */}
            <div className="bg-slate-900/40 backdrop-blur-sm p-5 rounded-2xl border border-white/5 flex flex-col hover:border-blue-500/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-200 font-semibold font-display">
                        <Users size={18} className="text-blue-500" />
                        <h4>Visitas Recentes</h4>
                    </div>
                    <Link to="/visits" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">Ver tudo <ArrowRight size={12}/></Link>
                </div>
                <div className="space-y-3 flex-1">
                    {recentVisits.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">Nenhuma visita recente.</p>
                    ) : (
                        recentVisits.map(v => (
                            <div key={v.id} className="flex items-center justify-between text-sm p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                <div>
                                    <p className="font-bold text-slate-200">{v.unit} - {v.tower}</p>
                                    <p className="text-xs text-slate-400">{v.situation}</p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${v.status === 'Pendente' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                    {v.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <div className="bg-slate-900/40 backdrop-blur-sm p-5 rounded-2xl border border-white/5 flex flex-col hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-200 font-semibold font-display">
                        <CalendarDays size={18} className="text-emerald-500" />
                        <h4>Agenda de Hoje</h4>
                    </div>
                    <Link to="/schedule" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">Ver tudo <ArrowRight size={12}/></Link>
                </div>
                <div className="space-y-3 flex-1">
                    {todaySchedule.length === 0 ? (
                         <p className="text-sm text-slate-500 italic">Sem atividades agendadas.</p>
                    ) : (
                        todaySchedule.map((s, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-sm p-3 bg-slate-800/50 rounded-xl border-l-2 border-emerald-500 border-t border-r border-b border-t-white/5 border-r-white/5 border-b-white/5">
                                <div className="flex-1">
                                    <p className="font-bold text-emerald-400 uppercase text-[10px] mb-0.5 tracking-wider">{s.shift}</p>
                                    <p className="text-slate-300 line-clamp-2">{s.task}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-sm p-5 rounded-2xl border border-white/5 flex flex-col hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-200 font-semibold font-display">
                        <PaintBucket size={18} className="text-indigo-500" />
                        <h4>Pintura</h4>
                    </div>
                    <Link to="/painting" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">Ver tudo <ArrowRight size={12}/></Link>
                </div>
                <div className="space-y-3 flex-1">
                    {activePainting.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">Nenhum projeto de pintura.</p>
                    ) : (
                        activePainting.map(p => (
                            <div key={p.id} className="text-sm p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-slate-200">{p.local}</span>
                                    <span className={`text-[10px] px-1.5 rounded border ${
                                        (p.criticality?.toLowerCase().includes('alt')) ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-700 text-slate-400 border-slate-600'
                                    }`}>{(p.criticality?.toLowerCase().includes('alt')) ? 'Alta' : p.criticality}</span>
                                </div>
                                <p className="text-xs text-slate-500">{p.tower}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-sm p-5 rounded-2xl border border-white/5 flex flex-col hover:border-orange-500/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-200 font-semibold font-display">
                        <ShoppingCart size={18} className="text-orange-500" />
                        <h4>Solicitações</h4>
                    </div>
                    <Link to="/purchases" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors">Ver tudo <ArrowRight size={12}/></Link>
                </div>
                <div className="space-y-3 flex-1">
                     {pendingPurchases.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center">
                            <p className="text-xs text-slate-500 bg-slate-800/50 py-2 px-4 rounded-full border border-white/5">Tudo em dia!</p>
                        </div>
                    ) : (
                        pendingPurchases.map(req => (
                            <div key={req.id} className="flex items-center justify-between text-sm p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white bg-orange-500/20 px-1.5 rounded text-xs text-orange-400">{req.quantity}x</span>
                                        <span className="text-slate-300 truncate max-w-[100px]">{req.description}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase mt-0.5">{req.local}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-orange-400">PENDENTE</p>
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