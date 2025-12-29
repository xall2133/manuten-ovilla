import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Edit2, Trash2, X, Save, Upload, Download } from 'lucide-react';
import { PurchaseRequest } from '../../types';

export const Purchases = () => {
  const { purchases, addPurchase, updatePurchase, deletePurchase, importDataFromCSV, exportPurchasesToCSV } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<PurchaseRequest>>({});

  const handleAddNew = () => {
      setEditingItem({});
      setIsModalOpen(true);
  };

  const handleEdit = (item: PurchaseRequest) => {
      setEditingItem(item);
      setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
      if(window.confirm('Deseja realmente excluir esta solicitação de compra?')) {
          deletePurchase(id);
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
          quantity: Number(editingItem.quantity) || 0,
          description: editingItem.description || '',
          local: editingItem.local || '',
          requestDate: editingItem.requestDate || '',
          approvalDate: editingItem.approvalDate || '',
          entryDate: editingItem.entryDate || ''
      } as PurchaseRequest;

      if (editingItem.id) {
          updatePurchase(editingItem.id, payload);
      } else {
          addPurchase(payload);
      }
      setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Controle de Compra de Material</h2>
            <p className="text-slate-500 dark:text-slate-400">Solicitações e aprovações do almoxarifado</p>
        </div>
        <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <Upload size={18} />
              <span className="hidden sm:inline">Importar</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button onClick={exportPurchasesToCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Download size={18} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none">
                <Plus size={18} /> Nova Solicitação
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-blue-50 dark:bg-slate-700/30 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wide">Solicitações Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-slate-800 border-b-2 border-slate-800 dark:border-slate-100 text-slate-800 dark:text-white text-xs uppercase font-bold tracking-wider">
                <th className="px-6 py-4">QTD</th>
                <th className="px-6 py-4 w-1/3">Descrição</th>
                <th className="px-6 py-4">Local</th>
                <th className="px-6 py-4">Data Solicitação</th>
                <th className="px-6 py-4">Data da Aprovação</th>
                <th className="px-6 py-4">Data Entrada</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
               {purchases.map((req) => (
                   <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                       <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-bold">{req.quantity}</td>
                       <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{req.description}</td>
                       <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{req.local}</td>
                       <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{req.requestDate}</td>
                       <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{req.approvalDate || '-'}</td>
                       <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{req.entryDate || '-'}</td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button type="button" onClick={() => handleEdit(req)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                               <Edit2 size={16} />
                             </button>
                             <button type="button" onClick={() => handleDelete(req.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
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
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{editingItem.id ? 'Editar Solicitação' : 'Nova Solicitação'}</h3>
                    <button type="button" onClick={() => setIsModalOpen(false)}><X className="text-slate-400" /></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Descrição do Material</label>
                            <input 
                                type="text" 
                                value={editingItem.description || ''} 
                                onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Quantidade</label>
                            <input 
                                type="number" 
                                value={editingItem.quantity || ''} 
                                onChange={e => setEditingItem({...editingItem, quantity: Number(e.target.value)})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Local de Uso</label>
                            <input 
                                type="text" 
                                value={editingItem.local || ''} 
                                onChange={e => setEditingItem({...editingItem, local: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Data Solicitação</label>
                            <input 
                                type="date" 
                                value={editingItem.requestDate || ''} 
                                onChange={e => setEditingItem({...editingItem, requestDate: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Data Aprovação</label>
                            <input 
                                type="date" 
                                value={editingItem.approvalDate || ''} 
                                onChange={e => setEditingItem({...editingItem, approvalDate: e.target.value})}
                                className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 text-slate-600 dark:text-slate-400">Data Entrada</label>
                            <input 
                                type="date" 
                                value={editingItem.entryDate || ''} 
                                onChange={e => setEditingItem({...editingItem, entryDate: e.target.value})}
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