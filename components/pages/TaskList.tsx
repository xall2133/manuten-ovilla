import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Filter, Download, Edit2, Trash2, Wrench, Upload, Eraser, Calendar } from 'lucide-react';
import { TaskFormModal } from '../ui/TaskFormModal';
import { Task } from '../../types';

export const TaskList = () => {
  const { tasks, settings, deleteTask, exportTasksToCSV, importDataFromCSV } = useData();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSituation, setFilterSituation] = useState('Todos');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');
  
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Helper para buscar nomes (com fallback caso o ID seja o próprio nome importado)
  const findName = (list: any[], id: string, defaultLabel: string) => {
      const found = list.find(i => i.id === id);
      return found ? found.name : (id || defaultLabel);
  };

  const getResponsibleName = (id: string) => findName(settings.responsibles, id, 'N/A');
  const getSectorName = (id: string) => findName(settings.sectors, id, 'N/A');
  const getServiceName = (id: string) => findName(settings.services, id, 'Serviço');
  const getTowerName = (id: string) => findName(settings.towers, id, 'Torre');
  
  const getMaterialNames = (ids: string[]) => {
      if (!ids || ids.length === 0) return null;
      return ids.map(id => settings.materials.find(m => m.id === id)?.name || id).filter(Boolean).join(', ');
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
      setSearchTerm('');
      setFilterSituation('Todos');
      setDateFilter('all');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          const content = event.target?.result as string;
          const result = await importDataFromCSV(content);
          alert(`${result.message}\n${result.count ? `Importados: ${result.count} registros.` : ''}`);
          e.target.value = ''; 
      };
      reader.readAsText(file);
  };

  // Helper de Data Segura
  const parseTaskDate = (dateString: string) => {
      if (!dateString) return new Date(0); // Data muito antiga
      // Tenta ISO
      let d = new Date(dateString);
      if (!isNaN(d.getTime())) return d;
      
      // Tenta BR (DD/MM/YYYY)
      if (dateString.includes('/')) {
          const [day, month, year] = dateString.split('/');
          d = new Date(Number(year), Number(month) - 1, Number(day));
          if (!isNaN(d.getTime())) return d;
      }
      return new Date(0);
  };

  const filteredTasks = tasks.filter(task => {
    const term = searchTerm.toLowerCase().trim();
    
    // 1. Search Filter (Robust)
    const serviceName = getServiceName(task.serviceId).toLowerCase();
    const towerName = getTowerName(task.towerId).toLowerCase();
    const title = (task.title || '').toLowerCase();
    const location = (task.location || '').toLowerCase();
    const responsible = getResponsibleName(task.responsibleId).toLowerCase();

    const matchesSearch = term === '' || 
                          title.includes(term) || 
                          location.includes(term) ||
                          serviceName.includes(term) ||
                          towerName.includes(term) ||
                          responsible.includes(term);
    
    // 2. Situation Filter (Normalization: "Em Andamento" == "EM ANDAMENTO")
    const taskSit = (task.situation || '').toLowerCase().trim();
    const filterSit = filterSituation.toLowerCase().trim();
    const matchesSituation = filterSituation === 'Todos' || taskSit === filterSit;

    // 3. Date Filter (Based on Call Date)
    let matchesDate = true;
    if (dateFilter !== 'all') {
        const taskDate = parseTaskDate(task.callDate);
        taskDate.setHours(0,0,0,0);
        
        const now = new Date();
        now.setHours(0,0,0,0);
        
        if (dateFilter === 'month') {
            matchesDate = taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === 'week') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

            matchesDate = taskDate >= startOfWeek && taskDate <= endOfWeek;
        }
    }

    return matchesSearch && matchesSituation && matchesDate;
  });

  // Robust Status Coloring (Case Insensitive)
  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('conclu')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    if (s.includes('andamento') || s.includes('execu')) return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    if (s.includes('cancel')) return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
    return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'; // Aberto/Outros
  };

  // Robust Criticality Coloring
  const getCriticalityColor = (crit: string) => {
    const c = crit?.toLowerCase() || '';
    if (c.includes('alt') || c.includes('high') || c.includes('urge') || c.includes('crit')) return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
    if (c.includes('méd') || c.includes('med')) return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50'; // Baixa/Low
  };

  // Short Date Formatter (DD/MM)
  const formatShortDate = (dateString?: string) => {
      if (!dateString || dateString.trim() === '') return '-';
      const d = parseTaskDate(dateString);
      if (d.getTime() === 0) return dateString.substring(0, 5); // Fallback to string chop if parse fails completely
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const hasActiveFilters = searchTerm !== '' || filterSituation !== 'Todos' || dateFilter !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Tarefas de Manutenção</h2>
          <p className="text-slate-500 dark:text-slate-400">Gerencie todas as ordens de serviço</p>
        </div>
        <div className="flex gap-2">
           <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <Upload size={18} />
              <span className="hidden sm:inline">Importar</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
           </label>
           <button onClick={exportTasksToCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Download size={18} />
              <span className="hidden sm:inline">Exportar</span>
           </button>
           <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200 dark:shadow-none transition-all transform active:scale-95">
              <Plus size={18} />
              <span>Nova Tarefa</span>
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col xl:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por serviço, torre, local, responsável..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
         </div>
         <div className="flex flex-wrap items-center gap-2">
            
            {/* Situation Filter */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <Filter size={16} className="text-slate-400" />
                <select 
                value={filterSituation}
                onChange={(e) => setFilterSituation(e.target.value)}
                className="bg-transparent text-sm text-slate-600 dark:text-slate-300 focus:outline-none"
                >
                <option value="Todos">Todas as Situações</option>
                {settings.situations.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <Calendar size={16} className="text-slate-400" />
                <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-transparent text-sm text-slate-600 dark:text-slate-300 focus:outline-none"
                >
                <option value="all">Todo o Período</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mês</option>
                </select>
            </div>

            {/* Clear Button (Top) */}
            {hasActiveFilters && (
                <button 
                    onClick={handleClearFilters}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                    <Eraser size={16} />
                    Limpar
                </button>
            )}
         </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse min-w-[1000px]">
             <thead>
               <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                 <th className="px-3 py-3 w-[25%]">Serviço / Torre</th>
                 <th className="px-3 py-3 w-[15%]">Datas (Ab/In/Fi)</th>
                 <th className="px-3 py-3 w-[15%]">Local / Setor</th>
                 <th className="px-3 py-3">Responsável</th>
                 <th className="px-3 py-3 text-center">Mat.</th>
                 <th className="px-3 py-3 text-center">Situação</th>
                 <th className="px-3 py-3 text-center">Crit.</th>
                 <th className="px-3 py-3 text-right">Ações</th>
               </tr>
             </thead>
             <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                       Nenhuma tarefa encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                      const materialNames = getMaterialNames(task.materials);
                      return (
                        <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            {/* Service / Tower */}
                            <td className="px-3 py-3 align-top">
                                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-start gap-2 text-sm">
                                    <Wrench size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                    <span className="leading-tight">{getServiceName(task.serviceId)}</span>
                                </div>
                                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 pl-6">
                                    {getTowerName(task.towerId)}
                                </div>
                            </td>

                            {/* Consolidated Dates */}
                            <td className="px-3 py-3 align-top">
                                <div className="flex flex-col gap-0.5 text-xs font-mono">
                                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                        <span className="font-bold w-6 text-slate-400">Ab:</span> 
                                        {formatShortDate(task.callDate)}
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                        <span className="font-bold w-6 text-emerald-600 dark:text-emerald-500">In:</span> 
                                        {formatShortDate(task.startDate)}
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                        <span className="font-bold w-6 text-indigo-500">Fi:</span> 
                                        {formatShortDate(task.endDate)}
                                    </div>
                                </div>
                            </td>

                            {/* Location / Sector */}
                            <td className="px-3 py-3 align-top">
                                <div className="text-slate-700 dark:text-slate-300 font-medium text-sm leading-tight truncate max-w-[150px]" title={task.location}>
                                    {task.location}
                                </div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                    {getSectorName(task.sectorId)}
                                </div>
                            </td>

                            {/* Responsible */}
                            <td className="px-3 py-3 align-top text-slate-600 dark:text-slate-400 text-xs">
                                <div className="truncate max-w-[120px]" title={getResponsibleName(task.responsibleId)}>
                                    {getResponsibleName(task.responsibleId)}
                                </div>
                            </td>

                            {/* Materials */}
                            <td className="px-3 py-3 text-center align-top">
                                {materialNames ? (
                                    <div className="group relative cursor-help flex justify-center">
                                        <span className="w-5 h-5 flex items-center justify-center rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                            Sim
                                        </span>
                                        <div className="absolute hidden group-hover:block right-0 top-full mt-1 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg z-10 w-32 text-left">
                                            {materialNames}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-slate-300 dark:text-slate-600 text-lg leading-none">-</span>
                                )}
                            </td>
                        
                            {/* Situation */}
                            <td className="px-3 py-3 text-center align-top">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(task.situation)}`}>
                                    {task.situation}
                                </span>
                            </td>

                            {/* Criticality */}
                            <td className="px-3 py-3 text-center align-top">
                                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getCriticalityColor(task.criticality)}`}>
                                    {task.criticality}
                                </span>
                            </td>

                            {/* Actions */}
                            <td className="px-3 py-3 text-right align-top">
                                <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => handleEdit(task)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Editar">
                                    <Edit2 size={16} />
                                    </button>
                                    {user?.role === 'admin' && (
                                    <button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Excluir">
                                        <Trash2 size={16} />
                                    </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                      );
                  })
                )}
             </tbody>
           </table>
         </div>
         
         {/* Table Footer with Filter Reset */}
         <div className="border-t border-slate-100 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-700/20 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Total: {filteredTasks.length} {filteredTasks.length === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}
            </span>
            {hasActiveFilters && (
                <button 
                    onClick={handleClearFilters}
                    className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded transition-colors"
                >
                    <Eraser size={14} />
                    Limpar Tudo
                </button>
            )}
         </div>
      </div>

      <TaskFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingTask}
      />
    </div>
  );
};