import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { SettingsState } from '../../types';
import { Plus, Trash2, Tag, User as UserIcon, Wrench, Briefcase, Box, Edit2, Check, X, Activity, Upload, FileUp, AlertCircle, CheckCircle, AlertTriangle, Eraser } from 'lucide-react';

const TABS = [
  { id: 'towers', label: 'Torres', icon: Box },
  { id: 'sectors', label: 'Setores', icon: Briefcase },
  { id: 'services', label: 'Tipos de Serviço', icon: Wrench },
  { id: 'responsibles', label: 'Responsáveis', icon: UserIcon },
  { id: 'situations', label: 'Situação da Tarefa', icon: Activity },
  { id: 'materials', label: 'Materiais Disponíveis', icon: Tag },
  { id: 'import', label: 'Importação (CSV)', icon: Upload }, 
];

export const Settings = () => {
  const { settings, addSettingItem, updateSettingItem, removeSettingItem, importDataFromCSV, clearAllData } = useData();
  const [activeTab, setActiveTab] = useState<keyof SettingsState | 'import'>('towers');
  const [newItemName, setNewItemName] = useState('');
  
  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{success?: boolean; message?: string; details?: string} | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim() && activeTab !== 'import') {
      addSettingItem(activeTab as keyof SettingsState, newItemName);
      setNewItemName('');
    }
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = (id: string) => {
    if (editingName.trim()) {
      updateSettingItem(activeTab as keyof SettingsState, id, editingName);
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsImporting(true);
      setImportStatus(null);

      const reader = new FileReader();
      reader.onload = async (event) => {
          const content = event.target?.result as string;
          const result = await importDataFromCSV(content);
          
          if (result.success) {
              setImportStatus({
                  success: true,
                  message: 'Importação Concluída!',
                  details: `Foram importados ${result.count} itens para a seção: ${translateType(result.type)}`
              });
          } else {
              setImportStatus({
                  success: false,
                  message: 'Falha na Importação',
                  details: result.message
              });
          }
          if (fileInputRef.current) fileInputRef.current.value = '';
          setIsImporting(false);
      };
      reader.readAsText(file);
  };

  const handleClearData = async () => {
      await clearAllData();
      setIsConfirmingClear(false);
      setImportStatus({
          success: true,
          message: 'Banco de Dados Limpo',
          details: 'Todos os registros de tarefas, visitas, compras e cronogramas foram removidos.'
      });
  };

  const translateType = (type?: string) => {
      switch(type) {
          case 'visits': return 'Visitas Técnicas';
          case 'tasks': return 'Tarefas de Manutenção';
          case 'painting': return 'Projetos de Pintura';
          case 'purchases': return 'Compras / Almoxarifado';
          case 'weekly_schedule': return 'Cronograma Semanal';
          case 'monthly_schedule': return 'Cronograma Mensal';
          default: return 'Geral';
      }
  };

  const currentItems = activeTab !== 'import' ? settings[activeTab as keyof SettingsState] : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Configurações do Sistema</h2>
        <p className="text-slate-500 dark:text-slate-400">Gerencie todos os cadastros auxiliares do Villa Privilege</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 flex flex-col gap-2">
           {TABS.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => {
                   setActiveTab(tab.id as any);
                   setEditingId(null);
                   setImportStatus(null);
                   setIsConfirmingClear(false);
                 }}
                 className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                 }`}
               >
                 <tab.icon size={18} />
                 {tab.label}
               </button>
           ))}
        </div>

        <div className="flex-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px]">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    {React.createElement(TABS.find(t => t.id === activeTab)?.icon || Box, { size: 20 })}
                  </div>
                  {activeTab === 'import' ? 'Importação e Manutenção' : `Gerenciar ${TABS.find(t => t.id === activeTab)?.label}`}
              </h3>
              {activeTab !== 'import' && (
                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full font-medium">
                    {currentItems.length} itens cadastrados
                </span>
              )}
           </div>

           {activeTab === 'import' ? (
               <div className="flex flex-col items-center h-full py-4 space-y-10">
                   
                   <div className="w-full max-w-md p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                            <FileUp size={32} />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Carregar Planilha CSV</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            O sistema detectará automaticamente para qual sessão os dados devem ir (Visitas, Tarefas, Pintura, etc.) baseando-se nos cabeçalhos.
                        </p>
                        
                        <input 
                            type="file" 
                            accept=".csv" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden" 
                            id="csv-upload"
                            disabled={isImporting}
                        />
                        <label 
                            htmlFor="csv-upload" 
                            className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors shadow-lg shadow-blue-200 dark:shadow-none font-medium ${isImporting ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {isImporting ? 'Importando...' : 'Selecionar Arquivo'}
                        </label>
                   </div>

                   {importStatus && (
                       <div className={`w-full max-w-md p-4 rounded-xl flex items-start gap-3 ${importStatus.success ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}>
                           {importStatus.success ? <CheckCircle className="shrink-0 mt-0.5" /> : <AlertCircle className="shrink-0 mt-0.5" />}
                           <div>
                               <p className="font-bold">{importStatus.message}</p>
                               <p className="text-sm opacity-90">{importStatus.details}</p>
                           </div>
                       </div>
                   )}

                   <div className="w-full max-w-2xl border-t border-slate-100 dark:border-slate-700 pt-8 mt-4">
                       <h5 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                           <AlertTriangle size={16} /> Zona de Perigo
                       </h5>
                       <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-center justify-between">
                           <div>
                               <p className="font-bold text-slate-800 dark:text-white">Limpar Banco de Dados</p>
                               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                   Remove todas as tarefas, visitas, compras e cronogramas. Não afeta as configurações (setores, torres, etc).
                               </p>
                           </div>
                           {!isConfirmingClear ? (
                               <button 
                                 onClick={() => setIsConfirmingClear(true)}
                                 className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                               >
                                   Limpar Dados
                               </button>
                           ) : (
                               <div className="flex items-center gap-2">
                                   <button 
                                     onClick={() => setIsConfirmingClear(false)}
                                     className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-medium"
                                   >
                                       Cancelar
                                   </button>
                                   <button 
                                     onClick={handleClearData}
                                     className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                                   >
                                       Confirmar Limpeza
                                   </button>
                               </div>
                           )}
                       </div>
                   </div>

                   <div className="w-full max-w-2xl">
                       <h5 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">Dicas de Colunas (CSV)</h5>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-500">
                           <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                               <strong className="block text-slate-700 dark:text-slate-300 mb-1">Para Visitas:</strong>
                               Torre, Unidade, Hora, Colaborador, Situação
                           </div>
                           <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                               <strong className="block text-slate-700 dark:text-slate-300 mb-1">Para Tarefas:</strong>
                               Titulo, Local, Servico, Criticidade, Situacao
                           </div>
                           <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                               <strong className="block text-slate-700 dark:text-slate-300 mb-1">Para Pintura:</strong>
                               Torre, Local, Tinta, Status, Previsao
                           </div>
                           <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                               <strong className="block text-slate-700 dark:text-slate-300 mb-1">Para Compras:</strong>
                               Quantidade, Descricao, Local
                           </div>
                       </div>
                   </div>
               </div>
           ) : (
             <>
               <form onSubmit={handleAdd} className="flex gap-3 mb-8 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input 
                    type="text" 
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder={`Adicionar novo em ${TABS.find(t => t.id === activeTab)?.label}...`}
                    className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md shadow-blue-100 dark:shadow-none"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Adicionar</span>
                  </button>
               </form>

               <div className="space-y-2">
                  {currentItems.length === 0 ? (
                     <div className="text-center py-12 flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-500">
                            <Box size={32} />
                        </div>
                        <p className="text-slate-400 dark:text-slate-500">Nenhum item cadastrado nesta categoria.</p>
                     </div>
                  ) : (
                    currentItems.map(item => (
                       <div key={item.id} className="flex items-center justify-between p-3 pl-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group hover:border-blue-200 dark:hover:border-slate-500 hover:shadow-sm transition-all">
                          {editingId === item.id ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input 
                                    type="text" 
                                    value={editingName} 
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-500 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    autoFocus
                                />
                                <button onClick={() => saveEdit(item.id)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                                    <Check size={18} />
                                </button>
                                <button onClick={cancelEdit} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                    <X size={18} />
                                </button>
                            </div>
                          ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    {activeTab === 'materials' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                                            M
                                        </div>
                                    )}
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</span>
                                </div>
                                
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => startEdit(item.id, item.name)}
                                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => removeSettingItem(activeTab as keyof SettingsState, item.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </>
                          )}
                       </div>
                    ))
                  )}
               </div>
             </>
           )}
        </div>
      </div>
    </div>
  );
};