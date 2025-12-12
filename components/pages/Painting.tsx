import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Edit2, Trash2, X, Save, Upload } from 'lucide-react';
import { PaintingProject, Criticality } from '../../types';

export const Painting = () => {
  const { paintingProjects, addPaintingProject, updatePaintingProject, deletePaintingProject, settings, importDataFromCSV } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<PaintingProject>>({});

  const handleAddNew = () => {
      setEditingItem({});
      setIsModalOpen(true);
  };

  const handleEdit = (item: PaintingProject) => {
      setEditingItem(item);
      setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
      if(window.confirm('Deseja realmente excluir este projeto de pintura?')) {
          deletePaintingProject(id);
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
      if (!editingItem.tower || !editingItem.local) {
          alert("Preencha Torre e Local");
          return;
      }
      
      const payload = {
          tower: editingItem.tower,
          local: editingItem.local,
          criticality: editingItem.criticality || 'Média',
          startDate: editingItem.startDate || '',
          endDateForecast: editingItem.endDateForecast || '',
          status: editingItem.status || '',
          paintDetails: editingItem.paintDetails || '',
          quantity: editingItem.quantity || ''
      } as PaintingProject;

      if (editingItem.id) {
          updatePaintingProject(editingItem.id, payload);
      } else {
          addPaintingProject(payload);
      }
      setIsModalOpen(false);
  };

  const getCriticalityColor = (crit: string) => {
    const c = crit?.toLowerCase() || '';
    if (c.includes('alt') || c.includes('high')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
    if (c.includes('méd') || c.includes('med')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Cronograma de Pintura</h2>
            <p className="text-slate-500 dark:text-slate-400">Status de revitalização e materiais de pintura</p>
        </div>
        <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <Upload size={18} />
              <span className="hidden sm:inline">Importar</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none">
                <Plus size={18} /> Novo Projeto
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-700 text-white text-xs uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Torre</th>
                <th className="px-6 py-4">Local</th>
                <th className="px-6 py-4 text-center">Criticidade</th>
                <th className="px-6 py-4">Data Início</th>
                <th className="px-6 py-4">Previsão Término</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 w-1/4">Tinta / Detalhes</th>
                <th className="px-6 py-4">Quantidade</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
               {paintingProjects.map((project) => (
                   <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                       <td className="px-6 py-4 text-slate-700 dark:text-slate-200 font-semibold">{project.tower}</td>
                       <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{project.local}</td>
                       <td className="px-6 py-4 text-center">
                           <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getCriticalityColor(project.criticality)}`}>
                               {project.criticality}
                           </span>
                       </td>
                       <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{project.startDate || '-'}</td>
                       <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{project.endDateForecast || '-'}</td>
                       <td className="px-6 py-4">
                           {project.status && (
                               <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">
                                   {project.status}
                               </span>
                           )}
                       </td>
                       <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs">{project.paintDetails}</td>
                       <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{project.quantity}</td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button type="button" onClick={() => handleEdit(project)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                               <Edit2 size={16} />
                             </button>
                             <button type="button" onClick={() => handleDelete(project.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
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
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{editingItem.id ? 'Editar Projeto' : 'Novo Projeto de Pintura'}</h3>
                    <button type="button" onClick={() => setIsModalOpen(false)}><X className="text-slate-400" /></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    {/* ... Same form fields ... */}
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
                                <option value="CONDOMINIO">CONDOMINIO</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Local</label>
                            <input 
                                type="text" 
                                value={editingItem.local || ''} 
                                onChange={e => setEditingItem({...editingItem, local: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Criticidade</label>
                            <select 
                                value={editingItem.criticality || 'Média'} 
                                onChange={e => setEditingItem({...editingItem, criticality: e.target.value as Criticality})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            >
                                <option value="Baixa">Baixa</option>
                                <option value="Média">Média</option>
                                <option value="Alta">Alta</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Status</label>
                            <input 
                                type="text" 
                                value={editingItem.status || ''} 
                                onChange={e => setEditingItem({...editingItem, status: e.target.value})}
                                placeholder="Ex: ATRASADO"
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Data Início</label>
                            <input 
                                type="date" 
                                value={editingItem.startDate || ''} 
                                onChange={e => setEditingItem({...editingItem, startDate: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Previsão Término</label>
                            <input 
                                type="date" 
                                value={editingItem.endDateForecast || ''} 
                                onChange={e => setEditingItem({...editingItem, endDateForecast: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Tinta / Detalhes</label>
                        <input 
                            type="text" 
                            value={editingItem.paintDetails || ''} 
                            onChange={e => setEditingItem({...editingItem, paintDetails: e.target.value})}
                            className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Quantidade</label>
                        <input 
                            type="text" 
                            value={editingItem.quantity || ''} 
                            onChange={e => setEditingItem({...editingItem, quantity: e.target.value})}
                            className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
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