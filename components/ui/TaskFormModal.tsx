import React, { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';
import { Task, Criticality, MaintenanceType } from '../../types';
import { X, Save, Calendar, MapPin, CheckSquare, Square } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Task;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const { settings, addTask, updateTask } = useData();

  // Form State
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    sectorId: '',
    serviceId: '',
    towerId: '',
    location: '',
    responsibleId: '',
    situation: settings.situations[0]?.name || 'Aberto',
    criticality: 'Média',
    type: 'Corretiva',
    materials: [],
    callDate: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (initialData) {
        setFormData({
            ...initialData,
            callDate: initialData.callDate.split('T')[0],
            startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
            endDate: initialData.endDate ? initialData.endDate.split('T')[0] : ''
        });
    } else {
        // Reset for new entry
        setFormData({
            title: '',
            sectorId: settings.sectors[0]?.id || '',
            serviceId: settings.services[0]?.id || '',
            towerId: settings.towers[0]?.id || '',
            location: '',
            responsibleId: settings.responsibles[0]?.id || '',
            situation: settings.situations[0]?.name || 'Aberto',
            criticality: 'Média',
            type: 'Corretiva',
            materials: [],
            callDate: new Date().toISOString().split('T')[0],
            startDate: '',
            endDate: ''
        });
    }
  }, [initialData, isOpen, settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMaterialToggle = (materialId: string) => {
    setFormData(prev => {
        const current = prev.materials || [];
        if (current.includes(materialId)) {
            return { ...prev, materials: current.filter(id => id !== materialId) };
        } else {
            return { ...prev, materials: [...current, materialId] };
        }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if(!formData.title || !formData.location) {
        alert("Preencha os campos obrigatórios (Título e Localização)");
        return;
    }

    if (initialData) {
        updateTask(initialData.id, formData);
    } else {
        addTask(formData as Omit<Task, 'id' | 'createdAt'>);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
       <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {initialData ? 'Editar Tarefa' : 'Nova Ordem de Manutenção'}
             </h3>
             <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={24} />
             </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
             {/* Main Info Group */}
             <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título da Tarefa *</label>
                        <input 
                           type="text" 
                           name="title" 
                           value={formData.title} 
                           onChange={handleChange}
                           className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                           placeholder="Ex: Manutenção Preventiva Motor A"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Localização *</label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                            type="text" 
                            name="location" 
                            value={formData.location} 
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Ex: Sala de Máquinas 02"
                            />
                        </div>
                    </div>
                 </div>
             </div>

             <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                <h4 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-4">Detalhes Operacionais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Setor</label>
                        <select name="sectorId" value={formData.sectorId} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                           {settings.sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Serviço</label>
                        <select name="serviceId" value={formData.serviceId} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                           {settings.services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Torre</label>
                        <select name="towerId" value={formData.towerId} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                           {settings.towers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsável Técnico</label>
                        <select name="responsibleId" value={formData.responsibleId} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                           {settings.responsibles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
             </div>

             <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                <h4 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-4">Status & Classificação</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Situação</label>
                        <select name="situation" value={formData.situation} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                           {settings.situations.map(s => (
                               <option key={s.id} value={s.name}>{s.name}</option>
                           ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Manutenção</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                           <option value="Corretiva">Corretiva</option>
                           <option value="Preventiva">Preventiva</option>
                           <option value="Programada">Programada</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Criticidade</label>
                        <select name="criticality" value={formData.criticality} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                           <option value="Baixa">Baixa</option>
                           <option value="Média">Média</option>
                           <option value="Alta">Alta</option>
                        </select>
                    </div>
                </div>
             </div>
            
             {/* Materials */}
             <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                <h4 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-4">Materiais Disponíveis</h4>
                <div className="flex flex-col gap-3">
                   {settings.materials.map(mat => {
                       const isChecked = formData.materials?.includes(mat.id);
                       return (
                           <div key={mat.id} 
                                onClick={() => handleMaterialToggle(mat.id)}
                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                                    isChecked 
                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-700 shadow-sm' 
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                           >
                              <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isChecked ? 'bg-blue-500 border-blue-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                                      {isChecked && <CheckSquare size={14} className="text-white" />}
                                  </div>
                                  <span className={`text-sm font-medium ${isChecked ? 'text-blue-900 dark:text-blue-200' : 'text-slate-600 dark:text-slate-400'}`}>{mat.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${isChecked ? 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                                      {isChecked ? 'SIM' : 'NÃO'}
                                  </span>
                              </div>
                           </div>
                       );
                   })}
                </div>
             </div>

             {/* Dates */}
             <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                <h4 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-4">Agendamento</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Chamado</label>
                        <div className="relative">
                            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="date" name="callDate" value={formData.callDate} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Início</label>
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Término</label>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>
             </div>
          </form>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 p-6 flex items-center justify-end gap-3 rounded-b-2xl">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                  Cancelar
              </button>
              <button 
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-200 dark:shadow-none transition-transform active:scale-95"
              >
                  <Save size={18} />
                  Salvar Tarefa
              </button>
          </div>
       </div>
    </div>
  );
};