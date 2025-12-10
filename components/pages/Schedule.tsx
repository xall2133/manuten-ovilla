import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Edit2, Save, X, Trash2, Plus, Calendar, CalendarDays, Upload, Briefcase, Filter, AlertTriangle, HardHat } from 'lucide-react';
import { ScheduleItem, MonthlyScheduleItem, ThirdPartyScheduleItem, Frequency } from '../../types';

export const Schedule = () => {
  const { 
    schedule, addScheduleItem, updateScheduleItem, deleteScheduleItem,
    monthlySchedule, addMonthlyScheduleItem, updateMonthlyScheduleItem, deleteMonthlyScheduleItem,
    thirdPartySchedule, addThirdPartyScheduleItem, updateThirdPartyScheduleItem, deleteThirdPartyScheduleItem,
    importDataFromCSV
  } = useData();

  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'annual'>('weekly');
  const [activeFrequencyFilter, setActiveFrequencyFilter] = useState<Frequency | 'Todas'>('Todas');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Generic state for editing/adding
  const [editingWeekly, setEditingWeekly] = useState<Partial<ScheduleItem>>({});
  const [editingMonthly, setEditingMonthly] = useState<Partial<MonthlyScheduleItem>>({});
  const [editingThirdParty, setEditingThirdParty] = useState<Partial<ThirdPartyScheduleItem>>({});

  const handleAddNew = () => {
    if (activeTab === 'weekly') {
        setEditingWeekly({ shift: 'MANHÃ', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', workStartDate: '', workEndDate: '', workNoticeDate: '' });
        setEditingMonthly({});
        setEditingThirdParty({});
    } else if (activeTab === 'monthly') {
        setEditingMonthly({ shift: 'MANHÃ', week1: '', week2: '', week3: '', week4: '', workStartDate: '', workEndDate: '', workNoticeDate: '' });
        setEditingWeekly({});
        setEditingThirdParty({});
    } else {
        setEditingThirdParty({ company: '', service: '', frequency: 'Mensal', contact: '', workStartDate: '', workEndDate: '', workNoticeDate: '' });
        setEditingWeekly({});
        setEditingMonthly({});
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

  const handleEditThirdParty = (item: ThirdPartyScheduleItem) => {
      setEditingThirdParty(item);
      setIsModalOpen(true);
  }

  const handleDeleteWeekly = (id: string) => {
      deleteScheduleItem(id);
  };

  const handleDeleteMonthly = (id: string) => {
      deleteMonthlyScheduleItem(id);
  };

  const handleDeleteThirdParty = (id: string) => {
      deleteThirdPartyScheduleItem(id);
  }

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
        if (!payload.shift) { alert("Informe o turno"); return; }
        if (payload.id) updateScheduleItem(payload.id, payload);
        else addScheduleItem(payload);
    } else if (activeTab === 'monthly') {
        const payload = editingMonthly as MonthlyScheduleItem;
        if (!payload.shift) { alert("Informe o turno/área"); return; }
        if (payload.id) updateMonthlyScheduleItem(payload.id, payload);
        else addMonthlyScheduleItem(payload);
    } else {
        const payload = editingThirdParty as ThirdPartyScheduleItem;
        if (!payload.company || !payload.service) { alert("Informe Empresa e Serviço"); return; }
        if (payload.id) updateThirdPartyScheduleItem(payload.id, payload);
        else addThirdPartyScheduleItem(payload);
    }
    setIsModalOpen(false);
  };

  const filteredThirdParty = activeFrequencyFilter === 'Todas' 
     ? thirdPartySchedule 
     : thirdPartySchedule.filter(tp => tp.frequency === activeFrequencyFilter);

  // Helper to format date just for display
  const formatDate = (dateStr?: string) => {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Cronograma Operacional</h2>
           <p className="text-slate-500 dark:text-slate-400">Planejamento de rotinas de manutenção e obras</p>
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
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
         <button 
           onClick={() => setActiveTab('weekly')}
           className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'weekly' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
         >
             <CalendarDays size={18} />
             Semanal
         </button>
         <button 
           onClick={() => setActiveTab('monthly')}
           className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'monthly' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
         >
             <Calendar size={18} />
             Mensal
         </button>
         <button 
           onClick={() => setActiveTab('annual')}
           className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'annual' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
         >
             <Briefcase size={18} />
             Terceiros / Anual
         </button>
      </div>

      {/* Frequency Filter for Annual Tab */}
      {activeTab === 'annual' && (
          <div className="flex gap-2 flex-wrap pb-2">
              {(['Todas', 'Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'] as const).map(freq => (
                  <button
                    key={freq}
                    onClick={() => setActiveFrequencyFilter(freq)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        activeFrequencyFilter === freq 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                      {freq}
                  </button>
              ))}
          </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {activeTab === 'weekly' ? (
            <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
                <thead>
                <tr className="bg-blue-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs uppercase font-bold tracking-wider">
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700 w-24">Turno</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Segunda</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Terça</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Quarta</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Quinta</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Sexta</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Sábado</th>
                    <th className="px-4 py-4 bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300 w-48">Dados da Obra</th>
                    <th className="px-4 py-4 w-16">Ações</th>
                </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
                {schedule.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-4 font-bold text-blue-600 dark:text-blue-400 border-r border-slate-100 dark:border-slate-700">{item.shift}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">{item.monday}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">{item.tuesday}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">{item.wednesday}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">{item.thursday}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">{item.friday}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">{item.saturday}</td>
                        <td className="px-4 py-4 bg-orange-50/50 dark:bg-orange-900/5 text-xs">
                             {item.workStartDate || item.workEndDate ? (
                                 <div className="flex flex-col gap-1 text-left">
                                    <span className="text-orange-600 font-bold">Início: {formatDate(item.workStartDate)}</span>
                                    <span className="text-slate-500">Fim: {formatDate(item.workEndDate)}</span>
                                    {item.workNoticeDate && <span className="text-red-500 text-[10px]">Aviso: {formatDate(item.workNoticeDate)}</span>}
                                 </div>
                             ) : <span className="text-slate-400">-</span>}
                        </td>
                        <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleEditWeekly(item)} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteWeekly(item.id)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        ) : activeTab === 'monthly' ? (
            <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
                <thead>
                <tr className="bg-emerald-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs uppercase font-bold tracking-wider">
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700 w-24">Turno/Área</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Semana 1</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Semana 2</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Semana 3</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Semana 4</th>
                    <th className="px-4 py-4 bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300 w-48">Dados da Obra</th>
                    <th className="px-4 py-4 w-16">Ações</th>
                </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
                {monthlySchedule.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-4 font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-100 dark:border-slate-700">{item.shift}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">{item.week1}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">{item.week2}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">{item.week3}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">{item.week4}</td>
                        <td className="px-4 py-4 bg-orange-50/50 dark:bg-orange-900/5 text-xs">
                             {item.workStartDate || item.workEndDate ? (
                                 <div className="flex flex-col gap-1 text-left">
                                    <span className="text-orange-600 font-bold">Início: {formatDate(item.workStartDate)}</span>
                                    <span className="text-slate-500">Fim: {formatDate(item.workEndDate)}</span>
                                    {item.workNoticeDate && <span className="text-red-500 text-[10px]">Aviso: {formatDate(item.workNoticeDate)}</span>}
                                 </div>
                             ) : <span className="text-slate-400">-</span>}
                        </td>
                        <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleEditMonthly(item)} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteMonthly(item.id)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        ) : (
            // ANNUAL / THIRD PARTY TABLE
            <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
                <thead>
                <tr className="bg-purple-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs uppercase font-bold tracking-wider">
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700 text-left">Empresa</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700 text-left">Serviço</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Frequência</th>
                    <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Contato</th>
                    <th className="px-4 py-4 bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300 w-48">Dados da Obra</th>
                    <th className="px-4 py-4 w-16">Ações</th>
                </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
                {filteredThirdParty.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">Nenhum registro encontrado.</td>
                    </tr>
                ) : (
                    filteredThirdParty.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-4 text-left font-bold text-slate-800 dark:text-white border-r border-slate-100 dark:border-slate-700">{item.company}</td>
                        <td className="px-4 py-4 text-left border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">{item.service}</td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700 text-center">
                            <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-bold">
                                {item.frequency}
                            </span>
                        </td>
                        <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">{item.contact}</td>
                        <td className="px-4 py-4 bg-orange-50/50 dark:bg-orange-900/5 text-xs">
                             {item.workStartDate || item.workEndDate ? (
                                 <div className="flex flex-col gap-1 text-left">
                                    <span className="text-orange-600 font-bold">Início: {formatDate(item.workStartDate)}</span>
                                    <span className="text-slate-500">Fim: {formatDate(item.workEndDate)}</span>
                                    {item.workNoticeDate && <span className="text-red-500 text-[10px]">Aviso: {formatDate(item.workNoticeDate)}</span>}
                                 </div>
                             ) : <span className="text-slate-400">-</span>}
                        </td>
                        <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleEditThirdParty(item)} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteThirdParty(item.id)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                            </div>
                        </td>
                    </tr>
                )))}
                </tbody>
            </table>
            </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                        {activeTab === 'weekly' ? 'Editar Semanal' : activeTab === 'monthly' ? 'Editar Mensal' : 'Editar Terceiros/Anual'}
                    </h3>
                    <button type="button" onClick={() => setIsModalOpen(false)}><X className="text-slate-400" /></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-6">
                    
                    {/* FIELDS FOR WEEKLY */}
                    {activeTab === 'weekly' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Turno</label>
                                <select 
                                    value={editingWeekly.shift || ''} 
                                    onChange={e => setEditingWeekly({...editingWeekly, shift: e.target.value})}
                                    className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                >
                                    <option value="MANHÃ">MANHÃ</option>
                                    <option value="TARDE">TARDE</option>
                                    <option value="NOITE">NOITE</option>
                                    <option value="ADM">ADM</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(day => (
                                    <div key={day}>
                                        <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400 capitalize">{day}</label>
                                        <input 
                                            type="text"
                                            value={(editingWeekly as any)[day] || ''}
                                            onChange={e => setEditingWeekly({...editingWeekly, [day]: e.target.value})}
                                            className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FIELDS FOR MONTHLY */}
                    {activeTab === 'monthly' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Turno / Área</label>
                                <input 
                                    type="text"
                                    value={editingMonthly.shift || ''} 
                                    onChange={e => setEditingMonthly({...editingMonthly, shift: e.target.value})}
                                    className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    placeholder="Ex: MANHÃ ou JARDINAGEM"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {['week1', 'week2', 'week3', 'week4'].map(week => (
                                    <div key={week}>
                                        <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400 capitalize">{week.replace('week', 'Semana ')}</label>
                                        <textarea 
                                            value={(editingMonthly as any)[week] || ''}
                                            onChange={e => setEditingMonthly({...editingMonthly, [week]: e.target.value})}
                                            className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white h-20"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FIELDS FOR ANNUAL / THIRD PARTY */}
                    {activeTab === 'annual' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Empresa</label>
                                    <input 
                                        type="text"
                                        value={editingThirdParty.company || ''} 
                                        onChange={e => setEditingThirdParty({...editingThirdParty, company: e.target.value})}
                                        className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Serviço</label>
                                    <input 
                                        type="text"
                                        value={editingThirdParty.service || ''} 
                                        onChange={e => setEditingThirdParty({...editingThirdParty, service: e.target.value})}
                                        className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Frequência</label>
                                    <select 
                                        value={editingThirdParty.frequency || 'Mensal'} 
                                        onChange={e => setEditingThirdParty({...editingThirdParty, frequency: e.target.value as Frequency})}
                                        className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    >
                                        <option value="Semanal">Semanal</option>
                                        <option value="Mensal">Mensal</option>
                                        <option value="Trimestral">Trimestral</option>
                                        <option value="Semestral">Semestral</option>
                                        <option value="Anual">Anual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Contato</label>
                                    <input 
                                        type="text"
                                        value={editingThirdParty.contact || ''} 
                                        onChange={e => setEditingThirdParty({...editingThirdParty, contact: e.target.value})}
                                        className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COMMON WORK FIELDS FOR ALL TABS */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-orange-600 dark:text-orange-400 uppercase mb-4">
                            <HardHat size={16} /> Dados da Obra (Opcional)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                            <div>
                                <label className="block text-xs font-bold text-orange-700 dark:text-orange-300 mb-1">Início da Obra</label>
                                <input 
                                    type="date"
                                    value={
                                        activeTab === 'weekly' ? editingWeekly.workStartDate || '' :
                                        activeTab === 'monthly' ? editingMonthly.workStartDate || '' :
                                        editingThirdParty.workStartDate || ''
                                    }
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (activeTab === 'weekly') setEditingWeekly({...editingWeekly, workStartDate: val});
                                        else if (activeTab === 'monthly') setEditingMonthly({...editingMonthly, workStartDate: val});
                                        else setEditingThirdParty({...editingThirdParty, workStartDate: val});
                                    }}
                                    className="w-full p-2 rounded border border-orange-200 dark:border-orange-800 dark:bg-slate-900 dark:text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-orange-700 dark:text-orange-300 mb-1">Término da Obra</label>
                                <input 
                                    type="date"
                                    value={
                                        activeTab === 'weekly' ? editingWeekly.workEndDate || '' :
                                        activeTab === 'monthly' ? editingMonthly.workEndDate || '' :
                                        editingThirdParty.workEndDate || ''
                                    }
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (activeTab === 'weekly') setEditingWeekly({...editingWeekly, workEndDate: val});
                                        else if (activeTab === 'monthly') setEditingMonthly({...editingMonthly, workEndDate: val});
                                        else setEditingThirdParty({...editingThirdParty, workEndDate: val});
                                    }}
                                    className="w-full p-2 rounded border border-orange-200 dark:border-orange-800 dark:bg-slate-900 dark:text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-red-600 dark:text-red-400 mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Data de Aviso</label>
                                <input 
                                    type="date"
                                    value={
                                        activeTab === 'weekly' ? editingWeekly.workNoticeDate || '' :
                                        activeTab === 'monthly' ? editingMonthly.workNoticeDate || '' :
                                        editingThirdParty.workNoticeDate || ''
                                    }
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (activeTab === 'weekly') setEditingWeekly({...editingWeekly, workNoticeDate: val});
                                        else if (activeTab === 'monthly') setEditingMonthly({...editingMonthly, workNoticeDate: val});
                                        else setEditingThirdParty({...editingThirdParty, workNoticeDate: val});
                                    }}
                                    className="w-full p-2 rounded border border-red-200 dark:border-red-800 dark:bg-slate-900 dark:text-white text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-2 border-t border-slate-100 dark:border-slate-700">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"><Save size={16}/> Salvar Item</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};