import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Edit2, Save, X, Trash2, Plus, Upload, Briefcase, Filter, AlertTriangle, HardHat, CalendarRange } from 'lucide-react';
import { ThirdPartyScheduleItem, Frequency } from '../../types';

export const Works = () => {
  const { 
    thirdPartySchedule, 
    addThirdPartyScheduleItem, 
    updateThirdPartyScheduleItem, 
    deleteThirdPartyScheduleItem,
    importDataFromCSV
  } = useData();

  const [activeFrequencyFilter, setActiveFrequencyFilter] = useState<Frequency | 'Todas'>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState<Partial<ThirdPartyScheduleItem>>({});

  const handleAddNew = () => {
    setEditingItem({ 
        company: '', 
        service: '', 
        frequency: 'Mensal', 
        contact: '', 
        workStartDate: '', 
        workEndDate: '', 
        workNoticeDate: '' 
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: ThirdPartyScheduleItem) => {
      setEditingItem(item);
      setIsModalOpen(true);
  }

  const handleDelete = (id: string) => {
      if(window.confirm('Confirma a exclusão deste item de obra/terceiro?')) {
          deleteThirdPartyScheduleItem(id);
      }
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
    const payload = editingItem as ThirdPartyScheduleItem;
    
    if (!payload.company || !payload.service) { 
        alert("Informe Empresa e Serviço"); 
        return; 
    }
    
    if (payload.id) {
        updateThirdPartyScheduleItem(payload.id, payload);
    } else {
        addThirdPartyScheduleItem(payload);
    }
    setIsModalOpen(false);
  };

  const filteredItems = activeFrequencyFilter === 'Todas' 
     ? thirdPartySchedule 
     : thirdPartySchedule.filter(tp => tp.frequency === activeFrequencyFilter);

  const formatDate = (dateStr?: string) => {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('pt-BR');
  };

  const getFrequencyStyle = (freq: string) => {
      switch(freq) {
          case 'Semanal': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
          case 'Mensal': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
          case 'Trimestral': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300';
          case 'Semestral': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
          case 'Anual': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
          default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
               <HardHat className="text-orange-500" />
               Obras e Terceiros
           </h2>
           <p className="text-slate-500 dark:text-slate-400">Gestão de contratos, manutenções terceirizadas e reformas</p>
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

      {/* Frequency Filters */}
      <div className="flex flex-wrap gap-2 pb-2 items-center">
          <div className="flex items-center gap-2 text-slate-500 mr-2">
              <Filter size={16} />
              <span className="text-sm font-medium">Filtros:</span>
          </div>
          {(['Todas', 'Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'] as const).map(freq => (
              <button
                key={freq}
                onClick={() => setActiveFrequencyFilter(freq)}
                className={`px-4 py-1.5 text-sm rounded-full border transition-all ${
                    activeFrequencyFilter === freq 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 dark:shadow-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-slate-500'
                }`}
              >
                  {freq}
              </button>
          ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
            <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs uppercase font-bold tracking-wider">
                <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700 text-left">Empresa Terceirizada</th>
                <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700 text-left">Serviços</th>
                <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700">Frequência</th>
                <th className="px-4 py-4 border-r border-slate-200 dark:border-slate-700 text-left">Contato</th>
                <th className="px-4 py-4 bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300 w-48 border-r border-orange-100 dark:border-slate-700">Dados da Obra</th>
                <th className="px-4 py-4 w-24 text-right">Ações</th>
            </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
            {filteredItems.length === 0 ? (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">Nenhum registro encontrado para este filtro.</td>
                </tr>
            ) : (
                filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-4 text-left font-bold text-slate-800 dark:text-white border-r border-slate-100 dark:border-slate-700">
                        {item.company}
                    </td>
                    <td className="px-4 py-4 text-left border-r border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        {item.service}
                    </td>
                    <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700 text-center">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${getFrequencyStyle(item.frequency)}`}>
                            {item.frequency}
                        </span>
                    </td>
                    <td className="px-4 py-4 border-r border-slate-100 dark:border-slate-700 text-left text-slate-500 dark:text-slate-400 text-xs">
                        {item.contact || '-'}
                    </td>
                    <td className="px-4 py-4 bg-orange-50/50 dark:bg-orange-900/5 text-xs border-r border-slate-100 dark:border-slate-700">
                            {item.workStartDate || item.workEndDate ? (
                                <div className="flex flex-col gap-1 text-left">
                                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500">
                                    <span className="font-bold w-10">Início:</span> 
                                    <span>{formatDate(item.workStartDate)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                    <span className="font-bold w-10">Fim:</span> 
                                    <span>{formatDate(item.workEndDate)}</span>
                                </div>
                                {item.workNoticeDate && (
                                    <div className="flex items-center gap-1 text-red-500 mt-1 pt-1 border-t border-orange-200 dark:border-orange-800/30">
                                        <AlertTriangle size={10} />
                                        <span className="font-bold">Aviso: {formatDate(item.workNoticeDate)}</span>
                                    </div>
                                )}
                                </div>
                            ) : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Editar">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Excluir">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </td>
                </tr>
            )))}
            </tbody>
        </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                            <Briefcase size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                            {editingItem.id ? 'Editar Obra/Terceiro' : 'Nova Obra/Terceiro'}
                        </h3>
                    </div>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="text-slate-400" /></button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">Empresa Terceirizada</label>
                                <input 
                                    type="text"
                                    value={editingItem.company || ''} 
                                    onChange={e => setEditingItem({...editingItem, company: e.target.value})}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Nome da empresa contratada"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">Serviço Prestado</label>
                                <input 
                                    type="text"
                                    value={editingItem.service || ''} 
                                    onChange={e => setEditingItem({...editingItem, service: e.target.value})}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Ex: Manutenção de Elevadores"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">Frequência</label>
                                <select 
                                    value={editingItem.frequency || 'Mensal'} 
                                    onChange={e => setEditingItem({...editingItem, frequency: e.target.value as Frequency})}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="Semanal">Semanal</option>
                                    <option value="Mensal">Mensal</option>
                                    <option value="Trimestral">Trimestral</option>
                                    <option value="Semestral">Semestral</option>
                                    <option value="Anual">Anual</option>
                                </select>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">Contato / Responsável</label>
                                <input 
                                    type="text" 
                                    value={editingItem.contact || ''} 
                                    onChange={e => setEditingItem({...editingItem, contact: e.target.value})}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Nome, Telefone ou Email"
                                />
                            </div>
                        </div>
                    </div>

                    {/* DADOS DA OBRA */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-orange-600 dark:text-orange-400 uppercase mb-4 tracking-wide">
                            <HardHat size={16} /> Dados / Datas da Obra
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-orange-50 dark:bg-orange-900/10 p-5 rounded-xl border border-orange-100 dark:border-orange-900/30">
                            <div>
                                <label className="block text-xs font-bold text-orange-700 dark:text-orange-300 mb-1.5 flex items-center gap-1">
                                    <CalendarRange size={12}/> Início da Obra
                                </label>
                                <input 
                                    type="date"
                                    value={editingItem.workStartDate || ''}
                                    onChange={e => setEditingItem({...editingItem, workStartDate: e.target.value})}
                                    className="w-full p-2 rounded-lg border border-orange-200 dark:border-orange-800 dark:bg-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-orange-700 dark:text-orange-300 mb-1.5 flex items-center gap-1">
                                    <CalendarRange size={12}/> Término Previsto
                                </label>
                                <input 
                                    type="date"
                                    value={editingItem.workEndDate || ''}
                                    onChange={e => setEditingItem({...editingItem, workEndDate: e.target.value})}
                                    className="w-full p-2 rounded-lg border border-orange-200 dark:border-orange-800 dark:bg-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-red-600 dark:text-red-400 mb-1.5 flex items-center gap-1">
                                    <AlertTriangle size={12}/> Data de Aviso
                                </label>
                                <input 
                                    type="date"
                                    value={editingItem.workNoticeDate || ''}
                                    onChange={e => setEditingItem({...editingItem, workNoticeDate: e.target.value})}
                                    className="w-full p-2 rounded-lg border border-red-200 dark:border-red-800 dark:bg-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-3 border-t border-slate-100 dark:border-slate-700">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none font-medium transition-transform active:scale-95">
                            <Save size={18}/> Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};