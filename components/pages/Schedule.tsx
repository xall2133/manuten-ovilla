import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Edit2, Save, X, Trash2, Plus, Upload, Download, Briefcase, Filter, AlertTriangle, CalendarRange, HardHat, Copy, Loader2 } from 'lucide-react';
import { ThirdPartyScheduleItem, Frequency } from '../../types';

export const Schedule = () => {
  const { 
    thirdPartySchedule, 
    addThirdPartyScheduleItem, 
    updateThirdPartyScheduleItem, 
    deleteThirdPartyScheduleItem,
    importDataFromCSV,
    exportThirdPartyToCSV,
    isLoading
  } = useData();

  const [activeFrequencyFilter, setActiveFrequencyFilter] = useState<Frequency | 'Todas'>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  
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

  const handleDuplicate = async (item: ThirdPartyScheduleItem) => {
      try {
          setIsDuplicating(item.id);
          // Remove o ID para criar um novo registro com os mesmos dados
          const { id, ...duplicateData } = item;
          
          // Chama diretamente a função de adicionar para "repetir" o registro
          await addThirdPartyScheduleItem(duplicateData);
      } catch (error) {
          console.error("Erro ao duplicar:", error);
          alert("Erro ao duplicar o registro.");
      } finally {
          setIsDuplicating(null);
      }
  };

  const handleDelete = (id: string) => {
      if(window.confirm('Confirma a exclusão deste item do cronograma/obra?')) {
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
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 font-display">
               <div className="p-2 bg-blue-600/10 rounded-lg">
                <CalendarRange className="text-blue-500" size={24} />
               </div>
               Cronograma e Obras
           </h2>
           <p className="text-slate-500 dark:text-slate-400">Gestão integrada de manutenções, contratos e obras civis</p>
        </div>
        <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer text-sm text-center">
              <Upload size={18} className="text-blue-500" />
              <span className="hidden sm:inline">Importar</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button onClick={exportThirdPartyToCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm">
              <Download size={18} className="text-blue-500" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm font-semibold">
                <Plus size={18} /> Novo Registro
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 pb-2 items-center">
          <div className="flex items-center gap-2 text-slate-500 mr-2">
              <Filter size={16} />
              <span className="text-sm font-medium">Frequência:</span>
          </div>
          {(['Todas', 'Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'] as const).map(freq => (
              <button
                key={freq}
                onClick={() => setActiveFrequencyFilter(freq)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${
                    activeFrequencyFilter === freq 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-slate-500'
                }`}
              >
                  {freq.toUpperCase()}
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
                <th className="px-4 py-5 text-center">Frequência</th>
                <th className="px-4 py-5 text-left">Contato</th>
                <th className="px-4 py-5 bg-blue-50/30 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300">Status Obra / Datas</th>
                <th className="px-4 py-5 text-right pr-6">Ações</th>
            </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
            {filteredItems.length === 0 ? (
                <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 italic">Nenhum registro encontrado.</td>
                </tr>
            ) : (
                filteredItems.map(item => (
                <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-4 text-left border-r border-slate-100 dark:border-slate-700/50">
                        <div className="font-bold text-slate-800 dark:text-white">{item.company}</div>
                    </td>
                    <td className="px-4 py-4 text-left text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                            <Briefcase size={14} className="text-slate-400" />
                            {item.service}
                        </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${getFrequencyStyle(item.frequency)}`}>
                            {item.frequency}
                        </span>
                    </td>
                    <td className="px-4 py-4 text-left text-slate-500 dark:text-slate-400 text-xs">
                        {item.contact || '-'}
                    </td>
                    <td className="px-4 py-4 bg-blue-50/10 dark:bg-blue-900/5 text-xs">
                            {item.workStartDate || item.workEndDate ? (
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
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-slate-400 font-mono text-[10px]">
                                    <HardHat size={14} className="opacity-30" />
                                    <span>CONTRATO RECORRENTE</span>
                                </div>
                            )}
                    </td>
                    <td className="px-4 py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleDuplicate(item)} 
                                disabled={isDuplicating === item.id}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors disabled:opacity-50" 
                                title="Duplicar Registro"
                            >
                                {isDuplicating === item.id ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
                            </button>
                            <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Editar">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Excluir">
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
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
                            <CalendarRange size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                {editingItem.id ? 'Editar Cronograma' : 'Novo Registro'}
                            </h3>
                            <p className="text-xs text-slate-400">Insira os detalhes do contrato ou obra</p>
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
                                    placeholder="Ex: Elevadores Atlas Schindler"
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
                                    placeholder="Ex: Manutenção Mensal"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1.5 text-slate-700 dark:text-slate-300">Frequência</label>
                                <select 
                                    value={editingItem.frequency || 'Mensal'} 
                                    onChange={e => setEditingItem({...editingItem, frequency: e.target.value as Frequency})}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="Semanal">Semanal</option>
                                    <option value="Mensal">Mensal</option>
                                    <option value="Trimestral">Trimestral</option>
                                    <option value="Semestral">Semestral</option>
                                    <option value="Anual">Anual</option>
                                </select>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold mb-1.5 text-slate-700 dark:text-slate-300">Contato (Opcional)</label>
                                <input 
                                    type="text"
                                    value={editingItem.contact || ''} 
                                    onChange={e => setEditingItem({...editingItem, contact: e.target.value})}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Nome do técnico ou telefone"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-4">
                            <HardHat size={18} className="text-orange-500" />
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Configurações de Obra / Datas</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1.5">DATA DE INÍCIO</label>
                                <input 
                                    type="date"
                                    value={editingItem.workStartDate || ''}
                                    onChange={e => setEditingItem({...editingItem, workStartDate: e.target.value})}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1.5">TÉRMINO PREVISTO</label>
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
                            <p className="col-span-1 md:col-span-3 text-[10px] text-slate-400 italic">
                                * Deixe em branco se for um serviço de manutenção recorrente padrão.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors">Cancelar</button>
                        <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-xl shadow-blue-500/20 font-bold text-sm transition-transform active:scale-95">
                            <Save size={18}/> Salvar Registro
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};