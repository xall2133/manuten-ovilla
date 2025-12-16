import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, SettingsState, CatalogItem, Visit, ScheduleItem, MonthlyScheduleItem, PaintingProject, PurchaseRequest, ThirdPartyScheduleItem } from '../types';
import { supabase } from '../lib/supabase';

interface DataContextType {
  tasks: Task[];
  visits: Visit[];
  schedule: ScheduleItem[];
  monthlySchedule: MonthlyScheduleItem[];
  thirdPartySchedule: ThirdPartyScheduleItem[];
  paintingProjects: PaintingProject[];
  purchases: PurchaseRequest[];
  settings: SettingsState;
  isLoading: boolean;
  lastUpdated: Date;
  refreshData: () => Promise<void>;
  
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Visits
  addVisit: (item: Omit<Visit, 'id'>) => void;
  updateVisit: (id: string, updates: Partial<Visit>) => void;
  deleteVisit: (id: string) => void;

  // Schedule (Weekly)
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  // Schedule (Monthly)
  addMonthlyScheduleItem: (item: Omit<MonthlyScheduleItem, 'id'>) => void;
  updateMonthlyScheduleItem: (id: string, updates: Partial<MonthlyScheduleItem>) => void;
  deleteMonthlyScheduleItem: (id: string) => void;

  // Schedule (Third Party / Annual)
  addThirdPartyScheduleItem: (item: Omit<ThirdPartyScheduleItem, 'id'>) => void;
  updateThirdPartyScheduleItem: (id: string, updates: Partial<ThirdPartyScheduleItem>) => void;
  deleteThirdPartyScheduleItem: (id: string) => void;
  
  // Painting
  addPaintingProject: (item: Omit<PaintingProject, 'id'>) => void;
  updatePaintingProject: (id: string, updates: Partial<PaintingProject>) => void;
  deletePaintingProject: (id: string) => void;

  // Purchases
  addPurchase: (item: Omit<PurchaseRequest, 'id'>) => void;
  updatePurchase: (id: string, updates: Partial<PurchaseRequest>) => void;
  deletePurchase: (id: string) => void;

  // Settings
  addSettingItem: (category: keyof SettingsState, name: string) => void;
  updateSettingItem: (category: keyof SettingsState, id: string, newName: string) => void;
  removeSettingItem: (category: keyof SettingsState, id: string) => void;
  
  exportTasksToCSV: () => void;
  importDataFromCSV: (csvContent: string) => Promise<{ success: boolean; message: string; type?: string; count?: number }>;
  
  // Danger Zone
  clearAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialSettings: SettingsState = {
  sectors: [],
  services: [],
  towers: [],
  responsibles: [],
  materials: [], 
  situations: []
};

// Helper to generate unique IDs
const generateId = (prefix: string = '') => {
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
};

export const DataProvider = ({ children }: { children?: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [monthlySchedule, setMonthlySchedule] = useState<MonthlyScheduleItem[]>([]);
  const [thirdPartySchedule, setThirdPartySchedule] = useState<ThirdPartyScheduleItem[]>([]);
  const [paintingProjects, setPaintingProjects] = useState<PaintingProject[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRequest[]>([]);
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // --- FETCH DATA FROM SUPABASE ---
  const refreshData = useCallback(async () => {
      setIsLoading(true);
      try {
        const [
          tasksRes, 
          visitsRes, 
          scheduleRes, 
          monthlyRes, 
          thirdPartyRes,
          paintingRes, 
          purchasesRes,
          sectorsRes,
          servicesRes,
          towersRes,
          responsiblesRes,
          materialsRes,
          situationsRes
        ] = await Promise.all([
          supabase.from('tasks').select('*').order('created_at', { ascending: false }),
          supabase.from('visits').select('*'),
          supabase.from('schedule').select('*'),
          supabase.from('monthly_schedule').select('*'),
          supabase.from('third_party_schedule').select('*'),
          supabase.from('painting_projects').select('*'),
          supabase.from('purchases').select('*'),
          supabase.from('sectors').select('*'),
          supabase.from('services').select('*'),
          supabase.from('towers').select('*'),
          supabase.from('responsibles').select('*'),
          supabase.from('materials').select('*'),
          supabase.from('situations').select('*')
        ]);

        if (tasksRes.error) console.error("Error fetching tasks:", tasksRes.error);
        
        // --- MAPEAMENTO: DO BANCO (snake_case) PARA O APP (camelCase) ---
        if (tasksRes.data) {
            const mappedTasks = tasksRes.data.map((t: any) => ({
                id: t.id,
                title: t.title,
                sectorId: t.sector_id,
                serviceId: t.service_id,
                towerId: t.tower_id,
                location: t.location,
                responsibleId: t.responsible_id,
                situation: t.situation,
                criticality: t.criticality,
                // ALTERADO: de t.maintenance_type para t.type
                type: t.type || 'Corretiva',
                materials: t.materials || [],
                callDate: t.call_date,
                startDate: t.start_date,
                endDate: t.end_date,
                description: t.description,
                createdAt: t.created_at
            }));
            setTasks(mappedTasks);
        }
        
        if (visitsRes.data) {
            setVisits(visitsRes.data.map((v:any) => ({
                ...v, 
                returnDate: v.return_date 
            })));
        }
        
        if (scheduleRes.data) {
             setSchedule(scheduleRes.data.map((s:any) => ({
                 ...s,
                 workStartDate: s.work_start_date,
                 workEndDate: s.work_end_date,
                 workNoticeDate: s.work_notice_date
             })));
        }

        if (monthlyRes.data) {
            setMonthlySchedule(monthlyRes.data.map((s:any) => ({
                 ...s,
                 workStartDate: s.work_start_date,
                 workEndDate: s.work_end_date,
                 workNoticeDate: s.work_notice_date
             })));
        }

        if (thirdPartyRes.data) {
            setThirdPartySchedule(thirdPartyRes.data.map((s:any) => ({
                ...s,
                workStartDate: s.work_start_date,
                workEndDate: s.work_end_date,
                workNoticeDate: s.work_notice_date
            })));
        }

        if (paintingRes.data) {
            setPaintingProjects(paintingRes.data.map((p:any) => ({
                ...p, 
                endDateForecast: p.end_date_forecast, 
                startDate: p.start_date, 
                paintDetails: p.paint_details
            })));
        }

        if (purchasesRes.data) {
            setPurchases(purchasesRes.data.map((p:any) => ({
                ...p, 
                requestDate: p.request_date, 
                approvalDate: p.approval_date, 
                entryDate: p.entry_date
            })));
        }

        setSettings({
            sectors: sectorsRes.data || [],
            services: servicesRes.data || [],
            towers: towersRes.data || [],
            responsibles: responsiblesRes.data || [],
            materials: materialsRes.data || [],
            situations: situationsRes.data || []
        });

        setLastUpdated(new Date());
      } catch (error) {
        console.error('CRITICAL: Error fetching data from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // --- TASKS ---
  const addTask = async (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const tempId = generateId('T-');
    const now = new Date().toISOString();
    
    // Mapeamento: App (camelCase) -> Banco (snake_case)
    const dbTask = {
        id: tempId,
        title: newTask.title,
        sector_id: newTask.sectorId,
        service_id: newTask.serviceId,
        tower_id: newTask.towerId,
        location: newTask.location,
        responsible_id: newTask.responsibleId,
        situation: newTask.situation,
        criticality: newTask.criticality,
        // ALTERADO: de maintenance_type para type
        type: newTask.type,
        materials: newTask.materials,
        call_date: newTask.callDate,
        start_date: newTask.startDate,
        end_date: newTask.endDate,
        description: newTask.description,
        created_at: now
    };

    const feTask = { ...newTask, id: tempId, createdAt: now };
    setTasks((prev) => [feTask, ...prev]);

    const { error } = await supabase.from('tasks').insert(dbTask);
    
    if (error) {
        console.error('Supabase Error (Task):', error);
        setTasks((prev) => prev.filter(t => t.id !== tempId));
        alert(`ERRO AO SALVAR TAREFA: ${error.message}. Verifique se a coluna 'type' existe no banco de dados.`);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));

    const dbUpdates: any = {};
    // Mapeamento manual para garantir nomes corretos
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.sectorId !== undefined) dbUpdates.sector_id = updates.sectorId;
    if (updates.serviceId !== undefined) dbUpdates.service_id = updates.serviceId;
    if (updates.towerId !== undefined) dbUpdates.tower_id = updates.towerId;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.responsibleId !== undefined) dbUpdates.responsible_id = updates.responsibleId;
    if (updates.situation !== undefined) dbUpdates.situation = updates.situation;
    if (updates.criticality !== undefined) dbUpdates.criticality = updates.criticality;
    // ALTERADO: de maintenance_type para type
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.materials !== undefined) dbUpdates.materials = updates.materials;
    if (updates.callDate !== undefined) dbUpdates.call_date = updates.callDate;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;

    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
    if (error) {
        alert(`Erro ao atualizar tarefa: ${error.message}`);
        refreshData(); 
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
        alert(`Erro ao excluir: ${error.message}`);
        refreshData();
    }
  };

  // --- VISITS ---
  const addVisit = async (item: Omit<Visit, 'id'>) => {
     const newId = generateId('V-');
     const newItem = { ...item, id: newId };
     setVisits(prev => [newItem, ...prev]);
     
     const { error } = await supabase.from('visits').insert({
         id: newId,
         tower: item.tower,
         unit: item.unit,
         situation: item.situation,
         time: item.time,
         collaborator: item.collaborator,
         status: item.status,
         return_date: item.returnDate
     });

     if (error) {
         setVisits(prev => prev.filter(v => v.id !== newId));
         alert(`ERRO AO SALVAR VISITA: ${error.message}`);
     }
  };

  const updateVisit = async (id: string, updates: Partial<Visit>) => {
     setVisits(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
     
     const dbUpdates: any = {};
     if (updates.tower !== undefined) dbUpdates.tower = updates.tower;
     if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
     if (updates.situation !== undefined) dbUpdates.situation = updates.situation;
     if (updates.time !== undefined) dbUpdates.time = updates.time;
     if (updates.collaborator !== undefined) dbUpdates.collaborator = updates.collaborator;
     if (updates.status !== undefined) dbUpdates.status = updates.status;
     if (updates.returnDate !== undefined) dbUpdates.return_date = updates.returnDate;

     const { error } = await supabase.from('visits').update(dbUpdates).eq('id', id);
     if (error) {
         alert(`Erro ao atualizar visita: ${error.message}`);
         refreshData();
     }
  };
  const deleteVisit = async (id: string) => {
     setVisits(prev => prev.filter(v => v.id !== id));
     const { error } = await supabase.from('visits').delete().eq('id', id);
     if (error) {
         alert(`Erro ao excluir visita: ${error.message}`);
         refreshData();
     }
  };

  // --- SCHEDULE (WEEKLY) ---
  const addScheduleItem = async (item: Omit<ScheduleItem, 'id'>) => {
      const newId = generateId('S-');
      const newItem = { ...item, id: newId };
      setSchedule(prev => [newItem, ...prev]);
      
      const dbItem = {
          id: newId,
          shift: item.shift,
          monday: item.monday,
          tuesday: item.tuesday,
          wednesday: item.wednesday,
          thursday: item.thursday,
          friday: item.friday,
          saturday: item.saturday,
          work_start_date: item.workStartDate,
          work_end_date: item.workEndDate,
          work_notice_date: item.workNoticeDate
      };

      const { error } = await supabase.from('schedule').insert(dbItem);

      if (error) {
          setSchedule(prev => prev.filter(s => s.id !== newId));
          alert(`ERRO AO SALVAR CRONOGRAMA: ${error.message}`);
      }
  };
  
  const updateScheduleItem = async (id: string, updates: Partial<ScheduleItem>) => {
      setSchedule(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      const dbUpdates: any = { ...updates };
      // Conversão
      if(updates.workStartDate !== undefined) { dbUpdates.work_start_date = updates.workStartDate; delete dbUpdates.workStartDate; }
      if(updates.workEndDate !== undefined) { dbUpdates.work_end_date = updates.workEndDate; delete dbUpdates.workEndDate; }
      if(updates.workNoticeDate !== undefined) { dbUpdates.work_notice_date = updates.workNoticeDate; delete dbUpdates.workNoticeDate; }

      const { error } = await supabase.from('schedule').update(dbUpdates).eq('id', id);
      if (error) { alert(`Erro ao atualizar: ${error.message}`); refreshData(); }
  };
  const deleteScheduleItem = async (id: string) => {
      setSchedule(prev => prev.filter(s => s.id !== id));
      const { error } = await supabase.from('schedule').delete().eq('id', id);
      if (error) { alert(`Erro ao excluir: ${error.message}`); refreshData(); }
  };

  // --- SCHEDULE (MONTHLY) ---
  const addMonthlyScheduleItem = async (item: Omit<MonthlyScheduleItem, 'id'>) => {
      const newId = generateId('M-');
      const newItem = { ...item, id: newId };
      setMonthlySchedule(prev => [newItem, ...prev]);
      
      const dbItem = {
          id: newId,
          shift: item.shift,
          week1: item.week1,
          week2: item.week2,
          week3: item.week3,
          week4: item.week4,
          work_start_date: item.workStartDate,
          work_end_date: item.workEndDate,
          work_notice_date: item.workNoticeDate
      };

      const { error } = await supabase.from('monthly_schedule').insert(dbItem);
      
      if (error) {
          setMonthlySchedule(prev => prev.filter(s => s.id !== newId));
          alert(`ERRO AO SALVAR MENSAL: ${error.message}`);
      }
  };
  
  const updateMonthlyScheduleItem = async (id: string, updates: Partial<MonthlyScheduleItem>) => {
      setMonthlySchedule(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      const dbUpdates: any = { ...updates };
      if(updates.workStartDate !== undefined) { dbUpdates.work_start_date = updates.workStartDate; delete dbUpdates.workStartDate; }
      if(updates.workEndDate !== undefined) { dbUpdates.work_end_date = updates.workEndDate; delete dbUpdates.workEndDate; }
      if(updates.workNoticeDate !== undefined) { dbUpdates.work_notice_date = updates.workNoticeDate; delete dbUpdates.workNoticeDate; }

      const { error } = await supabase.from('monthly_schedule').update(dbUpdates).eq('id', id);
      if (error) { alert(`Erro ao atualizar: ${error.message}`); refreshData(); }
  };
  const deleteMonthlyScheduleItem = async (id: string) => {
      setMonthlySchedule(prev => prev.filter(s => s.id !== id));
      const { error } = await supabase.from('monthly_schedule').delete().eq('id', id);
      if (error) { alert(`Erro ao excluir: ${error.message}`); refreshData(); }
  };

  // --- SCHEDULE (THIRD PARTY) ---
  const addThirdPartyScheduleItem = async (item: Omit<ThirdPartyScheduleItem, 'id'>) => {
      const newId = generateId('TP-');
      const newItem = { ...item, id: newId };
      setThirdPartySchedule(prev => [newItem, ...prev]);
      
      const dbItem = {
          id: newId,
          company: item.company,
          service: item.service,
          frequency: item.frequency,
          contact: item.contact,
          work_start_date: item.workStartDate,
          work_end_date: item.workEndDate,
          work_notice_date: item.workNoticeDate
      };

      const { error } = await supabase.from('third_party_schedule').insert(dbItem);

      if (error) {
          setThirdPartySchedule(prev => prev.filter(s => s.id !== newId));
          alert(`ERRO AO SALVAR TERCEIRO: ${error.message}`);
      }
  };

  const updateThirdPartyScheduleItem = async (id: string, updates: Partial<ThirdPartyScheduleItem>) => {
      setThirdPartySchedule(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      const dbUpdates: any = { ...updates };
      if(updates.workStartDate !== undefined) { dbUpdates.work_start_date = updates.workStartDate; delete dbUpdates.workStartDate; }
      if(updates.workEndDate !== undefined) { dbUpdates.work_end_date = updates.workEndDate; delete dbUpdates.workEndDate; }
      if(updates.workNoticeDate !== undefined) { dbUpdates.work_notice_date = updates.workNoticeDate; delete dbUpdates.workNoticeDate; }

      const { error } = await supabase.from('third_party_schedule').update(dbUpdates).eq('id', id);
      if (error) { alert(`Erro ao atualizar: ${error.message}`); refreshData(); }
  };
  const deleteThirdPartyScheduleItem = async (id: string) => {
      setThirdPartySchedule(prev => prev.filter(s => s.id !== id));
      const { error } = await supabase.from('third_party_schedule').delete().eq('id', id);
      if (error) { alert(`Erro ao excluir: ${error.message}`); refreshData(); }
  };

  // --- PAINTING ---
  const addPaintingProject = async (item: Omit<PaintingProject, 'id'>) => {
      const newId = generateId('P-');
      const newItem = { ...item, id: newId };
      setPaintingProjects(prev => [newItem, ...prev]);
      
      const { error } = await supabase.from('painting_projects').insert({
          id: newId,
          tower: item.tower,
          local: item.local,
          criticality: item.criticality,
          start_date: item.startDate,
          end_date_forecast: item.endDateForecast,
          status: item.status,
          paint_details: item.paintDetails,
          quantity: item.quantity
      });

      if (error) {
          setPaintingProjects(prev => prev.filter(p => p.id !== newId));
          alert(`ERRO AO SALVAR PINTURA: ${error.message}`);
      }
  };
  const updatePaintingProject = async (id: string, updates: Partial<PaintingProject>) => {
      setPaintingProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      
      const dbUpdates: any = {};
      if(updates.tower !== undefined) dbUpdates.tower = updates.tower;
      if(updates.local !== undefined) dbUpdates.local = updates.local;
      if(updates.criticality !== undefined) dbUpdates.criticality = updates.criticality;
      if(updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if(updates.endDateForecast !== undefined) dbUpdates.end_date_forecast = updates.endDateForecast;
      if(updates.status !== undefined) dbUpdates.status = updates.status;
      if(updates.paintDetails !== undefined) dbUpdates.paint_details = updates.paintDetails;
      if(updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;

      const { error } = await supabase.from('painting_projects').update(dbUpdates).eq('id', id);
      if (error) { alert(`Erro ao atualizar: ${error.message}`); refreshData(); }
  };
  const deletePaintingProject = async (id: string) => {
      setPaintingProjects(prev => prev.filter(p => p.id !== id));
      const { error } = await supabase.from('painting_projects').delete().eq('id', id);
      if (error) { alert(`Erro ao excluir: ${error.message}`); refreshData(); }
  };

  // --- PURCHASES ---
  const addPurchase = async (item: Omit<PurchaseRequest, 'id'>) => {
      const newId = generateId('R-');
      const newItem = { ...item, id: newId };
      setPurchases(prev => [newItem, ...prev]);

      const { error } = await supabase.from('purchases').insert({
          id: newId,
          quantity: item.quantity,
          description: item.description,
          local: item.local,
          request_date: item.requestDate,
          approval_date: item.approvalDate,
          entry_date: item.entryDate
      });

      if (error) {
          setPurchases(prev => prev.filter(p => p.id !== newId));
          alert(`ERRO AO SALVAR COMPRA: ${error.message}`);
      }
  };
  const updatePurchase = async (id: string, updates: Partial<PurchaseRequest>) => {
      setPurchases(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

      const dbUpdates: any = {};
      if(updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if(updates.description !== undefined) dbUpdates.description = updates.description;
      if(updates.local !== undefined) dbUpdates.local = updates.local;
      if(updates.requestDate !== undefined) dbUpdates.request_date = updates.requestDate;
      if(updates.approvalDate !== undefined) dbUpdates.approval_date = updates.approvalDate;
      if(updates.entryDate !== undefined) dbUpdates.entry_date = updates.entryDate;

      const { error } = await supabase.from('purchases').update(dbUpdates).eq('id', id);
      if (error) { alert(`Erro ao atualizar: ${error.message}`); refreshData(); }
  };
  const deletePurchase = async (id: string) => {
      setPurchases(prev => prev.filter(p => p.id !== id));
      const { error } = await supabase.from('purchases').delete().eq('id', id);
      if (error) { alert(`Erro ao excluir: ${error.message}`); refreshData(); }
  };

  // --- SETTINGS ---
  const addSettingItem = async (category: keyof SettingsState, name: string) => {
    const newId = generateId('Cat-');
    const newItem: CatalogItem = { id: newId, name };
    
    setSettings((prev) => ({
      ...prev,
      [category]: [...prev[category], newItem],
    }));

    const { error } = await supabase.from(category).insert(newItem);
    if (error) {
        alert(`Erro ao salvar configuração: ${error.message}`);
        setSettings((prev) => ({
            ...prev,
            [category]: prev[category].filter(i => i.id !== newId),
        }));
    }
  };

  const updateSettingItem = async (category: keyof SettingsState, id: string, newName: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === id ? { ...item, name: newName } : item
      ),
    }));

    const { error } = await supabase.from(category).update({ name: newName }).eq('id', id);
    if (error) { alert(`Erro: ${error.message}`); refreshData(); }
  };

  const removeSettingItem = async (category: keyof SettingsState, id: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item.id !== id),
    }));
    const { error } = await supabase.from(category).delete().eq('id', id);
    if (error) { alert(`Erro: ${error.message}`); refreshData(); }
  };

  const exportTasksToCSV = () => {
    const headers = ['ID', 'Serviço', 'Tipo', 'Torre', 'Local', 'Situação', 'Criticidade', 'Data Chamado', 'Materiais'];
    const findName = (list: CatalogItem[], id: string) => list.find(i => i.id === id)?.name || id;

    const rows = tasks.map(t => {
        const service = findName(settings.services, t.serviceId);
        const tower = findName(settings.towers, t.towerId);
        const materials = t.materials.map(mId => findName(settings.materials, mId)).join('; ');

        return [t.id, service, t.type, tower, t.location, t.situation, t.criticality, t.callDate, materials];
    });
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tarefas_vilaprivilege.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- DANGER ZONE: CLEAR ALL DATA ---
  const clearAllData = async () => {
      setTasks([]);
      setVisits([]);
      setSchedule([]);
      setMonthlySchedule([]);
      setThirdPartySchedule([]);
      setPaintingProjects([]);
      setPurchases([]);

      await Promise.all([
          supabase.from('tasks').delete().neq('id', '0'),
          supabase.from('visits').delete().neq('id', '0'),
          supabase.from('schedule').delete().neq('id', '0'),
          supabase.from('monthly_schedule').delete().neq('id', '0'),
          supabase.from('third_party_schedule').delete().neq('id', '0'),
          supabase.from('painting_projects').delete().neq('id', '0'),
          supabase.from('purchases').delete().neq('id', '0')
      ]);
  };

  // ... (normalize helpers)
  const normalizeDate = (dateStr: string) => {
      if (!dateStr || dateStr.trim() === '') return new Date().toISOString().split('T')[0];
      const cleanStr = dateStr.trim();
      if (cleanStr.includes('/')) {
          const parts = cleanStr.split('/');
          if (parts.length === 3) {
              const d = parts[0].padStart(2, '0');
              const m = parts[1].padStart(2, '0');
              const y = parts[2];
              return `${y}-${m}-${d}`;
          }
      }
      if (cleanStr.includes('-') && cleanStr.split('-')[0].length <= 2) {
          const parts = cleanStr.split('-');
          if (parts.length === 3) {
              const d = parts[0].padStart(2, '0');
              const m = parts[1].padStart(2, '0');
              const y = parts[2];
              return `${y}-${m}-${d}`;
          }
      }
      return cleanStr;
  };

  const normalizeCriticality = (val: string): 'Alta' | 'Média' | 'Baixa' => {
      const v = val.toLowerCase().trim();
      if (v.includes('alt') || v.includes('high') || v.includes('urge') || v.includes('crit') || v.includes('crít')) return 'Alta';
      if (v.includes('méd') || v.includes('med')) return 'Média';
      if (v.includes('baix') || v.includes('low')) return 'Baixa';
      return 'Média';
  };

  const normalizeSituation = (val: string): string => {
      if (!val) return 'Aberto';
      const v = val.toLowerCase().trim();
      if (v === 'em andamento') return 'Em Andamento';
      if (v === 'concluido' || v === 'concluído') return 'Concluído';
      if (v === 'cancelado') return 'Cancelado';
      if (v === 'aberto') return 'Aberto';
      return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
  };

  const importDataFromCSV = async (csvContent: string): Promise<{ success: boolean; message: string; type?: string; count?: number }> => {
    try {
        const lines = csvContent.split(/\r\n|\n/);
        if (lines.length < 2) return { success: false, message: 'Arquivo vazio ou formato inválido.' };

        // 1. Detect Delimiter (Comma or Semicolon)
        const headerLine = lines[0];
        const delimiter = headerLine.includes(';') ? ';' : ',';
        const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

        const getValue = (row: string[], headerName: string): string => {
            const index = headers.findIndex(h => h.includes(headerName));
            if (index === -1) return '';
            return row[index]?.trim().replace(/^"|"$/g, '') || '';
        };

        const rows = lines.slice(1).map(line => {
            if (!line.trim()) return null;
            if (delimiter === ',') {
                 return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            }
            return line.split(';');
        }).filter(r => r && r.length > 1) as string[][];

        // 2. Identify Section
        let detectedType = '';
        if (headers.some(h => h.includes('unidade') && h.includes('torre'))) detectedType = 'visits';
        else if (headers.some(h => h.includes('tinta') || h.includes('pintura') || h.includes('demao'))) detectedType = 'painting';
        else if (headers.some(h => h.includes('quantidade') && (h.includes('descricao') || h.includes('descrição')))) detectedType = 'purchases';
        else if (headers.some(h => h.includes('empresa') || h.includes('frequencia'))) detectedType = 'third_party';
        else if (headers.some(h => h.includes('segunda') && h.includes('terca'))) detectedType = 'weekly_schedule';
        else if (headers.some(h => h.includes('semana 1'))) detectedType = 'monthly_schedule';
        else if (headers.some(h => h.includes('titulo') || h.includes('servico') || h.includes('criticidade'))) detectedType = 'tasks';

        // 3. Process Data
        let count = 0;
        
        // ... (Settings Logic) ...
        const pendingSettingsInserts: Record<keyof SettingsState, CatalogItem[]> = {
            sectors: [],
            services: [],
            towers: [],
            responsibles: [],
            materials: [],
            situations: []
        };

        const tempSettings = { ...settings };

        const findOrAdd = (category: keyof SettingsState, rawValue: string): string => {
             if (!rawValue) {
                if (tempSettings[category].length > 0) return tempSettings[category][0].id;
                const defaultExists = pendingSettingsInserts[category].find(i => i.name === 'Geral');
                if (defaultExists) return defaultExists.id;

                const newId = generateId('Cat-');
                const newItem = { id: newId, name: 'Geral' };
                pendingSettingsInserts[category].push(newItem);
                return newId;
            }

            const cleanVal = rawValue.trim();
            const matchId = tempSettings[category].find(i => i.id === cleanVal || i.name.toLowerCase() === cleanVal.toLowerCase());
            if (matchId) return matchId.id;

            const pendingMatch = pendingSettingsInserts[category].find(i => i.name.toLowerCase() === cleanVal.toLowerCase());
            if (pendingMatch) return pendingMatch.id;

            const newId = generateId('Cat-');
            const newItem = { id: newId, name: cleanVal };
            pendingSettingsInserts[category].push(newItem);
            return newId;
        };

        // ... (Process types)
        if (detectedType === 'visits') {
            const newVisits = rows.map(r => ({
                id: generateId('V-'),
                tower: getValue(r, 'torre') || 'T1',
                unit: getValue(r, 'unidade') || '000',
                situation: getValue(r, 'situacao') || getValue(r, 'motivo') || 'Importado',
                time: getValue(r, 'hora') || '08:00',
                collaborator: getValue(r, 'colaborador') || getValue(r, 'responsavel') || '-',
                status: getValue(r, 'status') || 'Pendente',
                return_date: getValue(r, 'retorno') || '-'
            }));
            const { error } = await supabase.from('visits').insert(newVisits);
            if (error) throw error;
            setVisits(prev => [...newVisits.map(v => ({...v, returnDate: v.return_date})), ...prev]);
            count = newVisits.length;

        } else if (detectedType === 'painting') {
            const newProjects = rows.map(r => ({
                id: generateId('P-'),
                tower: getValue(r, 'torre') || 'Geral',
                local: getValue(r, 'local') || 'Importado',
                criticality: normalizeCriticality(getValue(r, 'criticidade')), 
                start_date: normalizeDate(getValue(r, 'inicio')),
                end_date_forecast: normalizeDate(getValue(r, 'previsao')),
                status: getValue(r, 'status') || '',
                paint_details: getValue(r, 'tinta') || getValue(r, 'detalhe') || '',
                quantity: getValue(r, 'quantidade') || ''
            }));
            const { error } = await supabase.from('painting_projects').insert(newProjects);
            if (error) throw error;
            setPaintingProjects(prev => [...newProjects.map(p => ({...p, startDate: p.start_date, endDateForecast: p.end_date_forecast, paintDetails: p.paint_details})), ...prev]);
            count = newProjects.length;

        } else if (detectedType === 'purchases') {
             const newPurchases = rows.map(r => ({
                id: generateId('R-'),
                quantity: Number(getValue(r, 'quantidade')) || 1,
                description: getValue(r, 'descricao') || 'Item Importado',
                local: getValue(r, 'local') || 'Almoxarifado',
                request_date: normalizeDate(getValue(r, 'solicitacao')),
                approval_date: normalizeDate(getValue(r, 'aprovacao')),
                entry_date: normalizeDate(getValue(r, 'entrada'))
             }));
             const { error } = await supabase.from('purchases').insert(newPurchases);
             if (error) throw error;
             setPurchases(prev => [...newPurchases.map(p => ({...p, requestDate: p.request_date, approvalDate: p.approval_date, entryDate: p.entry_date})), ...prev]);
             count = newPurchases.length;

        } else if (detectedType === 'weekly_schedule') {
             const newSchedule = rows.map(r => ({
                 id: generateId('S-'),
                 shift: getValue(r, 'turno') || 'MANHÃ',
                 monday: getValue(r, 'segunda') || '-',
                 tuesday: getValue(r, 'terca') || '-',
                 wednesday: getValue(r, 'quarta') || '-',
                 thursday: getValue(r, 'quinta') || '-',
                 friday: getValue(r, 'sexta') || '-',
                 saturday: getValue(r, 'sabado') || '-',
                 work_start_date: normalizeDate(getValue(r, 'inicio_obra')),
                 work_end_date: normalizeDate(getValue(r, 'fim_obra')),
                 work_notice_date: normalizeDate(getValue(r, 'aviso_obra')),
             }));
             const { error } = await supabase.from('schedule').insert(newSchedule);
             if (error) throw error;
             setSchedule(prev => [...newSchedule.map(s => ({...s, workStartDate: s.work_start_date, workEndDate: s.work_end_date, workNoticeDate: s.work_notice_date})), ...prev]);
             count = newSchedule.length;

        } else if (detectedType === 'monthly_schedule') {
             const newMonthly = rows.map(r => ({
                 id: generateId('M-'),
                 shift: getValue(r, 'turno') || 'AREA',
                 week1: getValue(r, 'semana 1') || '-',
                 week2: getValue(r, 'semana 2') || '-',
                 week3: getValue(r, 'semana 3') || '-',
                 week4: getValue(r, 'semana 4') || '-',
                 work_start_date: normalizeDate(getValue(r, 'inicio_obra')),
                 work_end_date: normalizeDate(getValue(r, 'fim_obra')),
                 work_notice_date: normalizeDate(getValue(r, 'aviso_obra')),
             }));
             const { error } = await supabase.from('monthly_schedule').insert(newMonthly);
             if (error) throw error;
             setMonthlySchedule(prev => [...newMonthly.map(s => ({...s, workStartDate: s.work_start_date, workEndDate: s.work_end_date, workNoticeDate: s.work_notice_date})), ...prev]);
             count = newMonthly.length;
        
        } else if (detectedType === 'third_party') {
             const newThirdParty = rows.map(r => ({
                 id: generateId('TP-'),
                 company: getValue(r, 'empresa') || 'Terceiro',
                 service: getValue(r, 'servico') || '-',
                 frequency: (getValue(r, 'frequencia') || 'Mensal') as any,
                 contact: getValue(r, 'contato') || '-',
                 work_start_date: normalizeDate(getValue(r, 'inicio_obra')),
                 work_end_date: normalizeDate(getValue(r, 'fim_obra')),
                 work_notice_date: normalizeDate(getValue(r, 'aviso_obra')),
             }));
             const { error } = await supabase.from('third_party_schedule').insert(newThirdParty);
             if (error) throw error;
             setThirdPartySchedule(prev => [...newThirdParty.map(s => ({...s, workStartDate: s.work_start_date, workEndDate: s.work_end_date, workNoticeDate: s.work_notice_date})), ...prev]);
             count = newThirdParty.length;

        } else {
             // TASKS IMPORT
             const newTasks = rows.map(r => {
                 const rawService = getValue(r, 'servico') || getValue(r, 'tipo');
                 const rawTower = getValue(r, 'torre');
                 const rawSector = getValue(r, 'setor');
                 const rawResp = getValue(r, 'responsavel') || getValue(r, 'colaborador');
                 const rawSit = getValue(r, 'situacao') || getValue(r, 'status');
                 const rawType = getValue(r, 'tipo_manutencao') || 'Corretiva';

                 const serviceId = findOrAdd('services', rawService || 'Serviço Geral');
                 const towerId = findOrAdd('towers', rawTower || 'Geral');
                 const sectorId = findOrAdd('sectors', rawSector || 'Geral');
                 const responsibleId = findOrAdd('responsibles', rawResp || 'Não Identificado');
                 
                 const situationName = normalizeSituation(rawSit); 
                 const criticality = normalizeCriticality(getValue(r, 'criticidade'));
                 
                 const sitExists = tempSettings.situations.find(s => s.name.toLowerCase() === situationName.toLowerCase());
                 if (!sitExists) {
                     const pendingSit = pendingSettingsInserts['situations'].find(s => s.name.toLowerCase() === situationName.toLowerCase());
                     if (!pendingSit) {
                         const newSitId = generateId('Cat-');
                         pendingSettingsInserts['situations'].push({ id: newSitId, name: situationName });
                     }
                 }

                 return {
                    id: generateId('T-'),
                    title: getValue(r, 'titulo') || getValue(r, 'descricao') || 'Tarefa Importada',
                    sector_id: sectorId, 
                    service_id: serviceId,
                    tower_id: towerId,
                    location: getValue(r, 'local') || 'Geral',
                    responsible_id: responsibleId,
                    situation: situationName,
                    criticality: criticality,
                    // ALTERADO: de maintenance_type para type
                    type: rawType,
                    materials: [],
                    call_date: normalizeDate(getValue(r, 'data')),
                    created_at: new Date().toISOString()
                 };
             });

             let hasUpdates = false;
             await Promise.all(
                 (Object.keys(pendingSettingsInserts) as Array<keyof SettingsState>).map(async (key) => {
                     const items = pendingSettingsInserts[key];
                     if (items.length > 0) {
                         const { error } = await supabase.from(key).insert(items);
                         if (error) throw new Error(`Falha ao criar novos cadastros para ${key}: ${error.message}`);
                         tempSettings[key] = [...tempSettings[key], ...items];
                         hasUpdates = true;
                     }
                 })
             );

             if (hasUpdates) setSettings(tempSettings);

             const { error } = await supabase.from('tasks').insert(newTasks);
             if (error) throw error;

             const feTasks = newTasks.map(t => ({
                 id: t.id,
                 title: t.title,
                 sectorId: t.sector_id,
                 serviceId: t.service_id,
                 towerId: t.tower_id,
                 location: t.location,
                 responsibleId: t.responsible_id,
                 situation: t.situation,
                 criticality: t.criticality,
                 type: t.type as any,
                 materials: t.materials,
                 callDate: t.call_date,
                 createdAt: t.created_at
             }));

             setTasks(prev => [...feTasks, ...prev]);
             count = newTasks.length;
             detectedType = 'tasks';
        }

        return { success: true, message: 'Importação realizada e salva no servidor!', type: detectedType, count };

    } catch (error: any) {
        console.error("Import Error Full Object:", error);
        return { success: false, message: 'Erro ao salvar: ' + (error.message || 'Desconhecido') };
    }
  };

  return (
    <DataContext.Provider value={{ 
        tasks, visits, schedule, monthlySchedule, thirdPartySchedule, paintingProjects, purchases, settings, isLoading, lastUpdated, refreshData,
        addTask, updateTask, deleteTask, 
        addVisit, updateVisit, deleteVisit,
        addScheduleItem, updateScheduleItem, deleteScheduleItem,
        addMonthlyScheduleItem, updateMonthlyScheduleItem, deleteMonthlyScheduleItem,
        addThirdPartyScheduleItem, updateThirdPartyScheduleItem, deleteThirdPartyScheduleItem,
        addPaintingProject, updatePaintingProject, deletePaintingProject,
        addPurchase, updatePurchase, deletePurchase,
        addSettingItem, updateSettingItem, removeSettingItem, 
        exportTasksToCSV, importDataFromCSV,
        clearAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};