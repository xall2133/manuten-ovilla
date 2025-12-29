import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Search, Plus, Edit2, Trash2, X, Save, Upload, Download } from 'lucide-react';
import { Visit } from '../../types';

export const Visits = () => {
  const { visits, addVisit, updateVisit, deleteVisit, settings, importDataFromCSV, exportVisitsToCSV } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Visit>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddNew = () => {
      setEditingItem({});
      setIsModalOpen(true);
  };

  const handleEdit = (item: Visit) => {
      setEditingItem(item);
      setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
      if(window.confirm("ATENÇÃO: Deseja realmente excluir esta visita? A ação não poderá ser desfeita.")) {
          deleteVisit(id);
      }
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
      const payload = {
          tower: editingItem.tower || '',
          unit: editingItem.unit || '',
          situation: editingItem.situation || '',
          time: editingItem.time || '',
          collaborator: editingItem.collaborator || '',
          status: editingItem.status || 'Pendente',
          returnDate: editingItem.returnDate || '-'
      } as Visit;

      if (editingItem.id) {
          updateVisit(editingItem.id, payload);
      } else {
          addVisit(payload);
      }
      setIsModalOpen(false);
  };

  const getStatusStyle = (status: string) => {
      const s = status?.toLowerCase() || '';
      if (s.includes('conclu')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
      if (s.includes('pendente')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
  };

  const filteredVisits = visits.filter(visit => {
      const term = searchTerm.toLowerCase();
      return (
          visit.unit?.toLowerCase().includes(term) ||
          visit.tower?.toLowerCase().includes(term) ||
          visit.collaborator?.toLowerCase().includes(term) ||
          visit.situation?.toLowerCase().includes(term)
      );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Controle de Visitas Técnicas</h2>
            <p className="text-slate-500 dark:text-slate-400">Gerenciamento de acessos e atendimentos nas unidades</p>
        </div>
        <div className="flex gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <Upload size={18} />
              <span className="hidden sm:inline">Importar</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button onClick={exportVisitsToCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Download size={18} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none">
                <Plus size={18} /> Nova Visita
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por unidade, torre ou colaborador..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 dark:text-slate-200"
                />
             </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Torre</th>
                <th className="px-6 py-4">Unidade</th>
                <th className="px-6 py-4">Situação</th>
                <th className="px-6 py-4">Hora</th>
                <th className="px-6 py-4">Colaborador</th>
                <th className="px-6 py-4">Status da Visita</th>
                <th className="px-6 py-4">Retorno</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
               {filteredVisits.length === 0 ? (
                   <tr><td colSpan={8} className="p-8 text-center text-slate-500">Nenhuma visita encontrada.</td></tr>
               ) : filteredVisits.map((visit) => (
                   <tr key={visit.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                       <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-semibold">{visit.tower}</td>
                       <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-medium">{visit.unit}</td>
                       <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{visit.situation}</td>
                       <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">{visit.time}</td>
                       <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{visit.collaborator}</td>
                       <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusStyle(visit.status)}`}>
                               {visit.status}
                           </span>
                       </td>
                       <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{visit.returnDate}</td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button type="button" onClick={() => handleEdit(visit)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                               <Edit2 size={16} />
                             </button>
                             <button type="button" onClick={() => handleDelete(visit.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                               <Trash2 size={16} />
                             </button>
                          </div>
                       </td>
                   </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{editingItem.id ? 'Editar Visita' : 'Nova Visita'}</h3>
                    <button type="button" onClick={() => setIsModalOpen(false)}><X className="text-slate-400" /></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Torre</label>
                            <select 
                                value={editingItem.tower || ''} 
                                onChange={e => setEditingItem({...editingItem, tower: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            >
                                <option value="">Selecione...</option>
                                {settings.towers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Unidade</label>
                            <input 
                                type="text" 
                                value={editingItem.unit || ''} 
                                onChange={e => setEditingItem({...editingItem, unit: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Situação</label>
                            <input 
                                type="text" 
                                value={editingItem.situation || ''} 
                                onChange={e => setEditingItem({...editingItem, situation: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Hora</label>
                            <input 
                                type="time" 
                                value={editingItem.time || ''} 
                                onChange={e => setEditingItem({...editingItem, time: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Colaborador</label>
                            <select 
                                value={editingItem.collaborator || ''} 
                                onChange={e => setEditingItem({...editingItem, collaborator: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            >
                                <option value="">Selecione...</option>
                                {settings.responsibles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Status</label>
                            <select 
                                value={editingItem.status || 'Pendente'} 
                                onChange={e => setEditingItem({...editingItem, status: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            >
                                <option value="Pendente">Pendente</option>
                                <option value="Em Andamento">Em Andamento</option>
                                <option value="Concluído">Concluído</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                             <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Data Retorno (Opcional)</label>
                             <input 
                                type="date" 
                                value={editingItem.returnDate === '-' ? '' : editingItem.returnDate} 
                                onChange={e => setEditingItem({...editingItem, returnDate: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                             />
                        </div>
                    </div>
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