import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Trash2, RotateCcw, Search, AlertCircle, Clock, Database } from 'lucide-react';
import { TrashItem } from '../../types';

export const Trash = () => {
  const { trash, restoreItem, permanentlyDeleteItem, isLoading } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const handleRestore = async (item: TrashItem) => {
    if (window.confirm(`Deseja restaurar este item (${item.title})?`)) {
      await restoreItem(item);
    }
  };

  const handleDeletePermanently = async (id: string) => {
    if (window.confirm('ATENÇÃO: Este item será excluído permanentemente do banco de dados. Esta ação não pode ser desfeita. Continuar?')) {
      await permanentlyDeleteItem(id);
    }
  };

  const filteredTrash = trash.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTableLabel = (tableName: string) => {
    switch(tableName) {
      case 'tasks': return 'Tarefa';
      case 'visits': return 'Visita';
      case 'third_party_schedule': return 'Contrato/Obra';
      case 'schedule': return 'Escala';
      case 'monthly_schedule': return 'Escala Mensal';
      case 'painting_projects': return 'Pintura';
      case 'purchases': return 'Compra';
      default: return tableName;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Trash2 className="text-red-500" size={24} />
            Lixeira do Sistema
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Itens removidos que podem ser restaurados ou excluídos permanentemente</p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex gap-3 items-start">
        <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0" size={20} />
        <div className="text-sm text-amber-800 dark:text-amber-300">
          <p className="font-bold">Informação Importante</p>
          <p>Itens na lixeira ocupam espaço no banco de dados. Recomendamos a limpeza periódica de itens que não serão mais utilizados.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar na lixeira..." 
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
                <th className="px-6 py-4">Item / Título</th>
                <th className="px-6 py-4">Origem</th>
                <th className="px-6 py-4">Data Exclusão</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Carregando lixeira...</td></tr>
              ) : filteredTrash.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-500 italic">A lixeira está vazia.</td></tr>
              ) : filteredTrash.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{item.title}</div>
                    <div className="text-xs text-slate-400 font-mono">ID Original: {item.originalId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      <Database size={12} />
                      {getTableLabel(item.tableName)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {formatDate(item.deletedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleRestore(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors text-xs font-bold"
                        title="Restaurar"
                      >
                        <RotateCcw size={14} />
                        Restaurar
                      </button>
                      <button 
                        onClick={() => handleDeletePermanently(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Excluir Permanentemente"
                      >
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
    </div>
  );
};
