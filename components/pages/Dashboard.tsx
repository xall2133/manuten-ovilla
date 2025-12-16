import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { AlertTriangle, CheckCircle2, Clock, ListFilter, CalendarDays, Users, PaintBucket, ShoppingCart, ArrowRight, Zap, TrendingUp, AlertCircle, HardHat, Pause, Play, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

// Neon Palette for Vibe Cod
const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

// --- SUB-COMPONENT: ANIMATED COUNTER ---
const CountUp = ({ end, duration = 1500 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;
      
      if (progress < duration) {
        const percentage = progress / duration;
        // EaseOutQuart function
        const ease = 1 - Math.pow(1 - percentage, 4); 
        
        setCount(Math.floor(end * ease));
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    animationFrameId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return <>{count}</>;
};

// --- SUB-COMPONENT: TICKER TAPE ---
const TickerTape = ({ items }: { items: string[] }) => {
    if (items.length === 0) return null;

    return (
        <div className="w-full bg-red-500/10 border-y border-red-500/20 overflow-hidden h-8 flex items-center relative mb-6">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>
            
            <div className="flex whitespace-nowrap animate-marquee">
                {items.map((item, idx) => (
                    <div key={idx} className="mx-8 flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest">
                        <AlertTriangle size={12} /> {item}
                    </div>
                ))}
                {/* Duplicate for seamless loop */}
                {items.map((item, idx) => (
                    <div key={`dup-${idx}`} className="mx-8 flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest">
                        <AlertTriangle size={12} /> {item}
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </div>
    );
};

// --- TYPES ---
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  gradient: string;
  subText?: string;
  subTextColor?: string;
}

export const Dashboard = () => {
  const { tasks, settings, visits, schedule, paintingProjects, purchases, thirdPartySchedule } = useData();
  
  // Default 'all' to show history immediately
  const [dateRange, setDateRange] = useState('all');

  // Carousel State
  const [activeChartIndex, setActiveChartIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselInterval = useRef<any>(null);
  const CHART_DURATION = 8000; // 8 seconds per chart

  // --- AUTOMATIC CAROUSEL LOGIC ---
  useEffect(() => {
      if (isPaused) return;

      carouselInterval.current = setInterval(() => {
          setActiveChartIndex((prev) => (prev + 1) % 3); // Cycle through 0, 1, 2
      }, CHART_DURATION);

      return () => {
        if (carouselInterval.current) clearInterval(carouselInterval.current);
      };
  }, [isPaused]);

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

  // --- Metrics Calculation ---
  const totalTasks = filteredTasks.length;
  
  const inProgressTasks = filteredTasks.filter(t => {
      const s = (t.situation || '').toLowerCase();
      return s.includes('andamento') || s.includes('execu') || s.includes('iniciad');
  }).length;

  const completedTasks = filteredTasks.filter(t => 
    (t.situation || '').toLowerCase().includes('conclu')
  ).length;

  const allHighCritTasks = filteredTasks.filter(t => {
      const crit = (t.criticality || '').toLowerCase();
      return crit.includes('alt') || crit.includes('high') || crit.includes('urge');
  });

  // Removed unused highCritTotal variable that caused build error
  const highCritPendingCount = allHighCritTasks.filter(t => 
      !(t.situation || '').toLowerCase().includes('conclu') && 
      !(t.situation || '').toLowerCase().includes('cancel')
  ).length;

  // --- Alert Ticker Data ---
  const alerts = useMemo(() => {
      const list: string[] = [];
      // High Criticality Tasks
      allHighCritTasks.forEach(t => {
          if (!(t.situation || '').toLowerCase().includes('conclu')) {
              list.push(`CRÍTICO: ${t.title} (${t.location})`);
          }
      });
      // Active Works (Third Party) warning
      thirdPartySchedule.forEach(tp => {
          if (tp.workStartDate && tp.workEndDate) {
              const start = new Date(tp.workStartDate);
              const end = new Date(tp.workEndDate);
              const now = new Date();
              if (now >= start && now <= end) {
                  list.push(`OBRA EM ANDAMENTO: ${tp.company} - ${tp.service}`);
              }
          }
      });
      return list;
  }, [allHighCritTasks, thirdPartySchedule]);


  // --- Chart Data Preparation ---
  // 1. Situation Pie
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

  // 2. Sector Bar
  const sectorMap = new Map<string, number>();
  filteredTasks.forEach(t => {
      const sectorConfig = settings.sectors.find(s => s.id === t.sectorId);
      const name = sectorConfig ? sectorConfig.name : (t.sectorId || 'Geral');
      const normalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      sectorMap.set(normalizedName, (sectorMap.get(normalizedName) || 0) + 1);
  });
  const sectorData = Array.from(sectorMap.entries())
    .map(([name, tarefas]) => ({ name, tarefas }))
    .sort((a, b) => b.tarefas - a.tarefas)
    .slice(0, 8); 

  // 3. Weekly Evolution (Simulated Area Chart)
  // Group tasks by creation date (last 7 days logic simulated for demo if data sparse)
  const evolutionData = useMemo(() => {
     const daysMap = new Map<string, number>();
     const today = new Date();
     // Init last 7 days with 0
     for(let i=6; i>=0; i--) {
         const d = new Date(today);
         d.setDate(today.getDate() - i);
         const key = d.toLocaleDateString('pt-BR', {weekday: 'short'});
         daysMap.set(key, 0);
     }
     
     filteredTasks.forEach(t => {
         const d = parseDate(t.callDate);
         if (d) {
             const key = d.toLocaleDateString('pt-BR', {weekday: 'short'});
             if (daysMap.has(key)) {
                 daysMap.set(key, (daysMap.get(key) || 0) + 1);
             }
         }
     });
     return Array.from(daysMap.entries()).map(([name, tarefas]) => ({ name, tarefas }));
  }, [filteredTasks]);


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
  
  // Obras Logic
  const activeWorks = thirdPartySchedule.filter(w => {
      // Show if it has dates defined, basically
      return w.workStartDate || w.workEndDate;
  }).slice(0, 3);

  const StatCard = ({ title, value, icon: Icon, colorClass, gradient, subText, subTextColor }: StatCardProps) => (
    <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`}></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white font-display tracking-tight">
             <CountUp end={value} />
          </h3>
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
    <div className="space-y-4 animate-fade-in pb-10">
      {/* Ticker for Alerts */}
      {alerts.length > 0 && <TickerTape items={alerts} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
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
             <option value="all">Todo o período (Histórico)</option>
             <option value="30">Últimos 30 dias</option>
             <option value="7">Esta semana</option>
             <option value="1">Hoje</option>
           </select>
        </div>
      </div>

      {/* Top KPIs - Animated */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          subText={`${totalTasks > 0 ? ((inProgressTasks / totalTasks) * 100).toFixed(0) : 0}% do total`}
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
          title="Alertas Críticos" 
          value={highCritPendingCount} 
          icon={AlertTriangle} 
          colorClass="text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
          gradient="from-red-500 to-orange-500"
          subText="Pendentes agora"
          subTextColor={highCritPendingCount > 0 ? 'text-red-400' : 'text-emerald-500'}
        />
      </div>

      {/* DYNAMIC CHART CAROUSEL */}
      <div 
        className="relative bg-slate-900/60 backdrop-blur-md p-1 rounded-2xl border border-white/5 overflow-hidden group mb-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
          {/* Progress Bar */}
          {!isPaused && (
             <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 z-20 transition-all duration-100 ease-linear w-full" 
                  style={{ animation: `progress ${CHART_DURATION}ms linear infinite` }}
             ></div>
          )}
          <style>{`@keyframes progress { 0% { width: 0% } 100% { width: 100% } }`}</style>
          
          {/* Controls */}
          <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setIsPaused(!isPaused)} className="p-1.5 bg-slate-800 rounded-lg text-slate-300 hover:text-white border border-white/10">
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              {[0, 1, 2].map(idx => (
                  <button 
                    key={idx}
                    onClick={() => setActiveChartIndex(idx)}
                    className={`w-3 h-3 rounded-full border border-white/10 ${activeChartIndex === idx ? 'bg-blue-500' : 'bg-slate-800'}`}
                  />
              ))}
          </div>

          <div className="p-6 h-[400px]">
             {/* VIEW 0: STATUS PIE */}
             {activeChartIndex === 0 && (
                 <div className="h-full animate-fade-in flex flex-col">
                     <h3 className="text-xl font-bold text-white mb-2 font-display flex items-center gap-2">
                        <ListFilter size={20} className="text-blue-500"/> Distribuição por Status
                     </h3>
                     <p className="text-sm text-slate-400 mb-4">Visão geral do progresso das tarefas</p>
                     <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                data={situationData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
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
                     </div>
                 </div>
             )}

             {/* VIEW 1: SECTORS BAR */}
             {activeChartIndex === 1 && (
                 <div className="h-full animate-fade-in flex flex-col">
                     <h3 className="text-xl font-bold text-white mb-2 font-display flex items-center gap-2">
                        <Briefcase size={20} className="text-cyan-500"/> Tarefas por Setor
                     </h3>
                     <p className="text-sm text-slate-400 mb-4">Áreas com maior demanda de manutenção</p>
                     <div className="flex-1 w-full">
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
                                <Bar dataKey="tarefas" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} animationDuration={1500}>
                                    {sectorData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                     </div>
                 </div>
             )}

             {/* VIEW 2: WEEKLY EVOLUTION AREA */}
             {activeChartIndex === 2 && (
                 <div className="h-full animate-fade-in flex flex-col">
                     <h3 className="text-xl font-bold text-white mb-2 font-display flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-500"/> Evolução Semanal
                     </h3>
                     <p className="text-sm text-slate-400 mb-4">Volume de chamados nos últimos 7 dias</p>
                     <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={evolutionData}>
                                <defs>
                                    <linearGradient id="colorTarefas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                                <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#f8fafc' }}
                                />
                                <Area type="monotone" dataKey="tarefas" stroke="#10b981" fillOpacity={1} fill="url(#colorTarefas)" animationDuration={2000} />
                            </AreaChart>
                        </ResponsiveContainer>
                     </div>
                 </div>
             )}
          </div>
      </div>

      {/* --- OPERATIONAL SUMMARY SECTION --- */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-display">
            Resumo Operacional
            <div className="h-px bg-slate-800 flex-1 ml-4"></div>
        </h3>
        
        {/* Changed Grid to 3 cols usually, can go 4 if large screen */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
            
            {/* OBRAS CARD (NEW) */}
            <div className="bg-slate-900/40 backdrop-blur-sm p-5 rounded-2xl border border-white/5 flex flex-col hover:border-orange-500/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-200 font-semibold font-display">
                        <HardHat size={18} className="text-orange-500" />
                        <h4>Obras Ativas</h4>
                    </div>
                    <Link to="/works" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors">Ver tudo <ArrowRight size={12}/></Link>
                </div>
                <div className="space-y-3 flex-1">
                    {activeWorks.length === 0 ? (
                         <div className="h-full flex items-center justify-center">
                            <p className="text-xs text-slate-500">Nenhuma obra em andamento.</p>
                         </div>
                    ) : (
                        activeWorks.map((w, idx) => (
                            <div key={idx} className="flex flex-col gap-1 text-sm p-3 bg-slate-800/50 rounded-xl border border-white/5 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                                <p className="font-bold text-slate-200 pl-2">{w.company}</p>
                                <p className="text-xs text-slate-400 pl-2">{w.service}</p>
                                <div className="pl-2 mt-1 flex items-center gap-1 text-[10px] text-orange-400">
                                    <Clock size={10} />
                                    <span>
                                      {w.workStartDate ? new Date(w.workStartDate).toLocaleDateString('pt-BR') : '-'} até {w.workEndDate ? new Date(w.workEndDate).toLocaleDateString('pt-BR') : '-'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

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
                        <ShoppingCart size={18} className="text-amber-500" />
                        <h4>Solicitações</h4>
                    </div>
                    <Link to="/purchases" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">Ver tudo <ArrowRight size={12}/></Link>
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
                                        <span className="font-bold text-white bg-amber-500/20 px-1.5 rounded text-xs text-amber-400">{req.quantity}x</span>
                                        <span className="text-slate-300 truncate max-w-[100px]">{req.description}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase mt-0.5">{req.local}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-amber-400">PENDENTE</p>
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