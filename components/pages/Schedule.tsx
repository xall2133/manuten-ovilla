import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Edit2, Save, X, Trash2, Plus, Calendar, CalendarDays, Upload } from 'lucide-react';
import { ScheduleItem, MonthlyScheduleItem } from '../../types';

export const Schedule = () => {
  const { 
    schedule, addScheduleItem, updateScheduleItem, deleteScheduleItem,
    monthlySchedule, addMonthlyScheduleItem, updateMonthlyScheduleItem, deleteMonthlyScheduleItem,
    importDataFromCSV
  } = useData();

  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Generic state for editing/adding
  const [editingWeekly, setEditingWeekly] = useState<Partial<ScheduleItem>>({});
  const [editingMonthly, setEditingMonthly] = useState<Partial<MonthlyScheduleItem>>({});

  const handleAddNew = () => {
    if (activeTab === 'weekly') {
        setEditingWeekly({ shift: 'MANHÃ', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' });
        setEditingMonthly({});
    } else {
        setEditingMonthly({ shift: 'MANHÃ', week1: '', week2: '', week3: '', week4: '' });
        setEditingWeekly({});
    }
    setIsModalOpen(true);
  };

  const handleEditWeekly = (item: ScheduleItem) => {
    setEditingWeekly(item);
    setIsModalOpen(true);
  };

  const handleEditMonthly = (item: MonthlyScheduleItem) => {
    setEditingMonthly(item);
    setIsModalOpen(true);
  };

  const handleDeleteWeekly = (id: string) => {
      deleteScheduleItem(id);
  };

  const handleDeleteMonthly = (id: string) => {
      deleteMonthlyScheduleItem(id);
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'weekly') {
        const payload = editingWeekly as ScheduleItem;
        // Basic validation
        if (!payload.shift) { alert("Informe o turno"); return; }
        
        if (payload.id) {
            updateScheduleItem(payload.id, payload);
        } else {
            addScheduleItem(payload);
        }
    } else {
        const payload = editingMonthly as MonthlyScheduleItem;
        if (!payload.shift) { alert("Informe o turno/área"); return; }

        if (payload.id) {
            updateMonthlyScheduleItem(payload.id, payload);
        } else {
            addMonthlyScheduleItem(payload);
        }
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Cronograma Operacional</h2>
           <p className="text-slate-500 dark:text-slate-400">Planejamento de rotinas de manutenção</p>
        </div>
        <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <Upload size={18} />
              <span className="hidden sm:inline">Importar</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none">
                <Plus size={18} /> Novo Item
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
         <button 
           onClick={() => setActiveTab('weekly')}
           className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${activeTab === 'weekly' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
         >
             <CalendarDays size={18} />
             Cronograma Semanal
         </button>
         <button 
           onClick={() => setActiveTab('monthly')}
           className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${activeTab === 'monthly' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
         >
             <Calendar size={18} />
             Cronograma Mensal
         </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {activeTab === 'weekly' ? (
            <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
                <thead>
                <tr className="bg-blue-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs uppercase font-bold tracking-wider">
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700 w-32">Turno</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Segunda</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Terça</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Quarta</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Quinta</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Sexta</th>
                    <th className="px-4 py-4">Sábado</th>
                    <th className="px-4 py-4 w-20">Ações</th>
                </tr>
                </thead>
                <tbody className="text-xs font-semibold text-slate-600 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-700">
                {schedule.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                        <td className="px-4 py-6 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-bold border-r border-slate-200 dark:border-slate-600">
                            {row.shift}
                        </td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700">{row.monday}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700">{row.tuesday}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700">{row.wednesday}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700">{row.thursday}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700">{row.friday}</td>
                        <td className="px-4 py-4">{row.saturday}</td>
                        <td className="px-2 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button type="button" onClick={() => handleEditWeekly(row)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-all">
                                    <Edit2 size={14} />
                                </button>
                                <button type="button" onClick={() => handleDeleteWeekly(row.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
                <thead>
                <tr className="bg-blue-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs uppercase font-bold tracking-wider">
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700 w-32">Turno</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Semana 1</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Semana 2</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Semana 3</th>
                    <th className="px-4 py-4">Semana 4</th>
                    <th className="px-4 py-4 w-20">Ações</th>
                </tr>
                </thead>
                <tbody className="text-xs font-semibold text-slate-600 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-700">
                {monthlySchedule.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                        <td className="px-4 py-6 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-bold border-r border-slate-200 dark:border-slate-600">
                            {row.shift}
                        </td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700">{row.week1}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700">{row.week2}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700">{row.week3}</td>
                        <td className="px-4 py-4">{row.week4}</td>
                        <td className="px-2 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button type="button" onClick={() => handleEditMonthly(row)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-all">
                                    <Edit2 size={14} />
                                </button>
                                <button type="button" onClick={() => handleDeleteMonthly(row.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                        {activeTab === 'weekly' 
                         ? (editingWeekly.id ? 'Editar Cronograma Semanal' : 'Novo Turno Semanal') 
                         : (editingMonthly.id ? 'Editar Cronograma Mensal' : 'Novo Turno Mensal')}
                    </h3>
                    <button type="button" onClick={() => setIsModalOpen(false)}><X className="text-slate-400" /></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    {activeTab === 'weekly' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Turno</label>
                                <input type="text" value={editingWeekly.shift || ''} onChange={e => setEditingWeekly({...editingWeekly, shift: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Ex: MANHÃ" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Segunda-Feira</label>
                                <input type="text" value={editingWeekly.monday || ''} onChange={e => setEditingWeekly({...editingWeekly, monday: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Terça-Feira</label>
                                <input type="text" value={editingWeekly.tuesday || ''} onChange={e => setEditingWeekly({...editingWeekly, tuesday: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Quarta-Feira</label>
                                <input type="text" value={editingWeekly.wednesday || ''} onChange={e => setEditingWeekly({...editingWeekly, wednesday: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Quinta-Feira</label>
                                <input type="text" value={editingWeekly.thursday || ''} onChange={e => setEditingWeekly({...editingWeekly, thursday: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Sexta-Feira</label>
                                <input type="text" value={editingWeekly.friday || ''} onChange={e => setEditingWeekly({...editingWeekly, friday: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Sábado</label>
                                <input type="text" value={editingWeekly.saturday || ''} onChange={e => setEditingWeekly({...editingWeekly, saturday: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Turno / Área</label>
                                <input type="text" value={editingMonthly.shift || ''} onChange={e => setEditingMonthly({...editingMonthly, shift: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Ex: MANHÃ" />
                            </div>
                            <div className="col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Semana 1</label>
                                    <input type="text" value={editingMonthly.week1 || ''} onChange={e => setEditingMonthly({...editingMonthly, week1: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Semana 2</label>
                                    <input type="text" value={editingMonthly.week2 || ''} onChange={e => setEditingMonthly({...editingMonthly, week2: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Semana 3</label>
                                    <input type="text" value={editingMonthly.week3 || ''} onChange={e => setEditingMonthly({...editingMonthly, week3: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Semana 4</label>
                                    <input type="text" value={editingMonthly.week4 || ''} onChange={e => setEditingMonthly({...editingMonthly, week4: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><Save size={16}/> Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};