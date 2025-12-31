
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Edit2, Save, X, Trash2, Plus, Upload, Download, Briefcase, Filter, AlertTriangle, HardHat, CalendarRange, Copy, Loader2 } from 'lucide-react';
import { ThirdPartyScheduleItem, Frequency } from '../../types';

export const Works = () => {
  const { 
    thirdPartySchedule, 
    addThirdPartyScheduleItem, 
    updateThirdPartyScheduleItem, 
    deleteThirdPartyScheduleItem,
    importDataFromCSV,
    exportThirdPartyToCSV
  } = useData();

  const [activeFilter, setActiveFilter] = useState<'Todas' | 'Ativas' | 'Finalizadas'>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  
  const [editingItem, setEditingItem] = useState<Partial<ThirdPartyScheduleItem>>({});

  const handleAddNew = () => {
    setEditingItem({ 
        company: '', 
        service: '', 
        frequency: 'Mensal', 
        contact: '', 
        workStartDate: new Date().toISOString().split('T')[0], 
        workEndDate: '', 
        workNoticeDate: '' 
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: ThirdPartyScheduleItem) => {
      setEditingItem(item);
      setIsModalOpen(true);
  }

  const handleDuplicate = async (item: ThirdPartyScheduleItem) => {
      try {
          setIsDuplicating(String(item.id));
          const { id, ...duplicateData } = item;
          await addThirdPartyScheduleItem(duplicateData);
      } catch (error) {
          console.error("Erro ao duplicar:", error);
      } finally {
          setIsDuplicating(null);
      }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if(window.confirm('Excluir este registro de obra permanentemente?')) {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = editingItem as ThirdPartyScheduleItem;
    
    if (!payload.company || !payload.service) { 
        alert("Informe Empresa e Serviço"); 
        return; 
    }
    
    if (payload.id) {
        await updateThirdPartyScheduleItem(payload.id, payload);
    } else {
        await addThirdPartyScheduleItem(payload);
    }
    setIsModalOpen(false);
  };

  const filteredItems = thirdPartySchedule.filter(item => {
      const hasDate = !!(item.workStartDate || item.workEndDate);
      if (!hasDate) return false;

      if (activeFilter === 'Todas') return true;
      
      const now = new Date();
      now.setHours(0,0,0,0);
      const endDate = item.workEndDate ? new Date(item.workEndDate) : null;
      
      if (activeFilter === 'Ativas') return !endDate || endDate >= now;
      if (activeFilter === 'Finalizadas') return endDate && endDate < now;
      return true;
  });

  const formatDate = (dateStr?: string) => {
      if (!dateStr || dateStr.trim() === '') return '-';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 font-display">
               <div className="p-2 bg-orange-600/10 rounded-lg">
                <HardHat className="text-orange-500" size={24} />
               </div>
               Obras e Reformas
           </h2>
           <p className="text-slate-500 dark:text-slate-400">Gestão de projetos civis, reformas e intervenções pontuais</p>
        </div>
        <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer text-sm font-semibold">
              <Upload size={18} className="text-blue-500" />
              <span className="hidden sm:inline">Importar</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button onClick={exportThirdPartyToCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-semibold">
              <Download size={18} className="text-blue-500" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm font-semibold">
                <Plus size={18} /> Novo Registro
            </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pb-2 items-center">
          <div className="flex items-center gap-2 text-slate-500 mr-2">
              <Filter size={16} />
              <span className="text-sm font-medium">Status:</span>
          </div>
          {(['Todas', 'Ativas', 'Finalizadas'] as const).map(stat => (
              <button
                key={stat}
                onClick={() => setActiveFilter(stat)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${
                    activeFilter === stat 
                    ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-500/20' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-slate-500'
                }`}
              >
                  {stat.toUpperCase()}
              </button>
          ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
            <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-5 text-left">Empresa / Fornecedor</th>
                <th className="px-4 py-5 text-left">Tipo de Serviço</th>
                <th className="px-4 py-5 text-left">Contato</th>
                <th className="px-4 py-5 bg-orange-50/30 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300">Datas da Obra</th>
                <th className="px-4 py-5 text-right pr-6">Ações</th>
            </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
            {filteredItems.length === 0 ? (
                <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 italic">Nenhum registro de obra encontrado com datas definidas.</td>
                </tr>
            ) : (
                filteredItems.map(item => (
                <tr key={String(item.id)} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-4 text-left border-r border-slate-100 dark:border-slate-700/50">
                        <div className="font-bold text-slate-800 dark:text-white">{item.company}</div>
                    </td>
                    <td className="px-4 py-4 text-left text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                            <Briefcase size={14} className="text-slate-400" />
                            {item.service}
                        </div>
                    </td>
                    <td className="px-4 py-4 text-left text-slate-500 dark:text-slate-400 text-xs">
                        {item.contact || '-'}
                    </td>
                    <td className="px-4 py-4 bg-orange-50/10 dark:bg-orange-900/5 text-xs">
                            <div className="flex flex-col gap-1 text-left min-w-[140px]">
                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="opacity-70">Início:</span> 
                                    <span>{formatDate(item.workStartDate)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                    <span className="opacity-70">Fim:</span> 
                                    <span>{formatDate(item.workEndDate)}</span>
                                </div>
                                {item.workNoticeDate && (
                                    <div className="flex items-center gap-1.5 text-red-500 font-bold mt-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                                        <AlertTriangle size={12} />
                                        <span>Aviso: {formatDate(item.workNoticeDate)}</span>
                                    </div>
                                )}
                            </div>
                    </td>
                    <td className="px-4 py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleDuplicate(item); }} 
                                disabled={isDuplicating === String(item.id)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors cursor-pointer" 
                                title="Clonar"
                            >
                                {isDuplicating === String(item.id) ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
                            </button>
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleEdit(item); }} 
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer" 
                                title="Editar"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button 
                                type="button"
                                onClick={(e) => handleDelete(e, String(item.id))} 
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer" 
                                title="Excluir"
                            >
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20">
                            <HardHat size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                {editingItem.id ? 'Editar Obra' : 'Nova Obra'}
                            </h3>
                            <p className="text-xs text-slate-400">Insira os detalhes do projeto civil</p>
                        </div>
                    </div>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="text-slate-400" /></button>
                </div>
                
                <form onSubmit={handleSave} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold mb-1.5 text-slate-700 dark:text-slate-300">Empresa / Fornecedor</label>
                                <input 
                                    type="text"
                                    value={editingItem.company || ''} 
                                    onChange={e => setEditingItem({...editingItem, company: e.target.value})}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Ex: Reforma de Fachada Ltda"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1.5 text-slate-700 dark:text-slate-300">Serviço</label>
                                <input 
                                    type="text"
                                    value={editingItem.service || ''} 
                                    onChange={e => setEditingItem({...editingItem, service: e.target.value})}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Ex: Pintura Externa"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1.5 text-slate-700 dark:text-slate-300">Contato Técnico</label>
                                <input 
                                    type="text"
                                    value={editingItem.contact || ''} 
                                    onChange={e => setEditingItem({...editingItem, contact: e.target.value})}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Nome ou telefone"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarRange size={18} className="text-orange-500" />
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Datas do Projeto</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-orange-50/50 dark:bg-orange-900/20 p-6 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                            <div>
                                <label className="block text-[10px] font-bold text-orange-700 dark:text-orange-400 mb-1.5">DATA DE INÍCIO</label>
                                <input 
                                    type="date"
                                    value={editingItem.workStartDate || ''}
                                    onChange={e => setEditingItem({...editingItem, workStartDate: e.target.value})}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-orange-700 dark:text-orange-400 mb-1.5">TÉRMINO PREVISTO</label>
                                <input 
                                    type="date"
                                    value={editingItem.workEndDate || ''}
                                    onChange={e => setEditingItem({...editingItem, workEndDate: e.target.value})}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-red-500 mb-1.5">AVISO PRÉVIO</label>
                                <input 
                                    type="date"
                                    value={editingItem.workNoticeDate || ''}
                                    onChange={e => setEditingItem({...editingItem, workNoticeDate: e.target.value})}
                                    className="w-full p-2.5 rounded-lg border border-red-100 dark:border-red-900/30 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors">Cancelar</button>
                        <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-xl shadow-blue-500/20 font-bold text-sm transition-transform active:scale-95">
                            <Save size={18}/> Salvar Obra
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
