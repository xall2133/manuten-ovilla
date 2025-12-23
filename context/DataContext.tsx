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
  
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  addVisit: (item: Omit<Visit, 'id'>) => void;
  updateVisit: (id: string, updates: Partial<Visit>) => void;
  deleteVisit: (id: string) => void;

  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  addMonthlyScheduleItem: (item: Omit<MonthlyScheduleItem, 'id'>) => void;
  updateMonthlyScheduleItem: (id: string, updates: Partial<MonthlyScheduleItem>) => void;
  deleteMonthlyScheduleItem: (id: string) => void;

  addThirdPartyScheduleItem: (item: Omit<ThirdPartyScheduleItem, 'id'>) => void;
  updateThirdPartyScheduleItem: (id: string, updates: Partial<ThirdPartyScheduleItem>) => void;
  deleteThirdPartyScheduleItem: (id: string) => void;
  
  addPaintingProject: (item: Omit<PaintingProject, 'id'>) => void;
  updatePaintingProject: (id: string, updates: Partial<PaintingProject>) => void;
  deletePaintingProject: (id: string) => void;

  addPurchase: (item: Omit<PurchaseRequest, 'id'>) => void;
  updatePurchase: (id: string, updates: Partial<PurchaseRequest>) => void;
  deletePurchase: (id: string) => void;

  addSettingItem: (category: keyof SettingsState, name: string) => void;
  updateSettingItem: (category: keyof SettingsState, id: string, newName: string) => void;
  removeSettingItem: (category: keyof SettingsState, id: string) => void;
  
  exportTasksToCSV: () => void;
  importDataFromCSV: (csvContent: string) => Promise<{ success: boolean; message: string; type?: string; count?: number }>;
  
  clearAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialSettings: SettingsState = {
  sectors: [], services: [], towers: [], responsibles: [], materials: [], situations: []
};

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

  const refreshData = useCallback(async () => {
      setIsLoading(true);
      try {
        const [
          tasksRes, visitsRes, scheduleRes, monthlyRes, thirdPartyRes,
          paintingRes, purchasesRes, sectorsRes, servicesRes,
          towersRes, responsiblesRes, materialsRes, situationsRes
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

        if (tasksRes.data) {
            setTasks(tasksRes.data.map((t: any) => ({
                id: t.id,
                title: t.title,
                sectorId: t.sector_id,
                serviceId: t.service_id,
                towerId: t.tower_id,
                location: t.location,
                responsibleId: t.responsible_id,
                situation: t.situation,
                criticality: t.criticality,
                type: t.type || 'Corretiva',
                materials: t.materials || [],
                callDate: t.call_date,
                startDate: t.start_date,
                endDate: t.end_date,
                description: t.description,
                createdAt: t.created_at
            })));
        }
        
        if (visitsRes.data) setVisits(visitsRes.data.map((v:any) => ({ ...v, returnDate: v.return_date })));
        if (scheduleRes.data) setSchedule(scheduleRes.data.map((s:any) => ({ ...s, workStartDate: s.work_start_date, workEndDate: s.work_end_date, workNoticeDate: s.work_notice_date })));
        if (monthlyRes.data) setMonthlySchedule(monthlyRes.data.map((s:any) => ({ ...s, workStartDate: s.work_start_date, workEndDate: s.work_end_date, workNoticeDate: s.work_notice_date })));
        if (thirdPartyRes.data) setThirdPartySchedule(thirdPartyRes.data.map((s:any) => ({ ...s, workStartDate: s.work_start_date, workEndDate: s.work_end_date, workNoticeDate: s.work_notice_date })));
        if (paintingRes.data) setPaintingProjects(paintingRes.data.map((p:any) => ({ ...p, endDateForecast: p.end_date_forecast, startDate: p.start_date, paintDetails: p.paint_details })));
        if (purchasesRes.data) setPurchases(purchasesRes.data.map((p:any) => ({ ...p, requestDate: p.request_date, approvalDate: p.approval_date, entryDate: p.entry_date })));

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
        console.error('Error fetching data:', error);
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
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.sectorId !== undefined) dbUpdates.sector_id = updates.sectorId;
    if (updates.serviceId !== undefined) dbUpdates.service_id = updates.serviceId;
    if (updates.towerId !== undefined) dbUpdates.tower_id = updates.towerId;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.responsibleId !== undefined) dbUpdates.responsible_id = updates.responsibleId;
    if (updates.situation !== undefined) dbUpdates.situation = updates.situation;
    if (updates.criticality !== undefined) dbUpdates.criticality = updates.criticality;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.materials !== undefined) dbUpdates.materials = updates.materials;
    if (updates.callDate !== undefined) dbUpdates.call_date = updates.callDate;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;

    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
    if (error) { alert(`Erro ao atualizar: ${error.message}`); refreshData(); }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { alert(`Erro ao excluir: ${error.message}`); refreshData(); }
  };

  // --- VISITS ---
  const addVisit = async (item: Omit<Visit, 'id'>) => {
     const newId = generateId('V-');
     const newItem = { ...item, id: newId };
     setVisits(prev => [newItem, ...prev]);
     const { error } = await supabase.from('visits').insert({ id: newId, tower: item.tower, unit: item.unit, situation: item.situation, time: item.time, collaborator: item.collaborator, status: item.status, return_date: item.returnDate });
     if (error) { setVisits(prev => prev.filter(v => v.id !== newId)); alert(`ERRO: ${error.message}`); }
  };
  const updateVisit = async (id: string, updates: Partial<Visit>) => {
     setVisits(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
     const dbUpdates: any = { ...updates };
     if(updates.returnDate !== undefined) { dbUpdates.return_date = updates.returnDate; delete dbUpdates.returnDate; }
     const { error } = await supabase.from('visits').update(dbUpdates).eq('id', id);
     if (error) { alert(`Erro: ${error.message}`); refreshData(); }
  };
  const deleteVisit = async (id: string) => {
     setVisits(prev => prev.filter(v => v.id !== id));
     const { error } = await supabase.from('visits').delete().eq('id', id);
     if (error) { alert(`Erro: ${error.message}`); refreshData(); }
  };

  // --- SCHEDULES ---
  const addScheduleItem = async (item: Omit<ScheduleItem, 'id'>) => {
      const newId = generateId('S-');
      setSchedule(prev => [{...item, id: newId}, ...prev]);
      const { error } = await supabase.from('schedule').insert({ id: newId, shift: item.shift, monday: item.monday, tuesday: item.tuesday, wednesday: item.wednesday, thursday: item.thursday, friday: item.friday, saturday: item.saturday, work_start_date: item.workStartDate, work_end_date: item.workEndDate, work_notice_date: item.workNoticeDate });
      if (error) { refreshData(); alert(`Erro: ${error.message}`); }
  };
  const updateScheduleItem = async (id: string, updates: Partial<ScheduleItem>) => {
      setSchedule(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      const dbUpdates: any = { ...updates };
      if(updates.workStartDate) dbUpdates.work_start_date = updates.workStartDate;
      if(updates.workEndDate) dbUpdates.work_end_date = updates.workEndDate;
      if(updates.workNoticeDate) dbUpdates.work_notice_date = updates.workNoticeDate;
      const { error } = await supabase.from('schedule').update(dbUpdates).eq('id', id);
      if (error) refreshData();
  };
  const deleteScheduleItem = async (id: string) => {
      setSchedule(prev => prev.filter(s => s.id !== id));
      await supabase.from('schedule').delete().eq('id', id);
  };

  const addMonthlyScheduleItem = async (item: Omit<MonthlyScheduleItem, 'id'>) => {
      const newId = generateId('M-');
      setMonthlySchedule(prev => [{...item, id: newId}, ...prev]);
      const { error } = await supabase.from('monthly_schedule').insert({ id: newId, shift: item.shift, week1: item.week1, week2: item.week2, week3: item.week3, week4: item.week4, work_start_date: item.workStartDate, work_end_date: item.workEndDate, work_notice_date: item.workNoticeDate });
      if (error) refreshData();
  };
  const updateMonthlyScheduleItem = async (id: string, updates: Partial<MonthlyScheduleItem>) => {
      setMonthlySchedule(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      const dbUpdates: any = { ...updates };
      if(updates.workStartDate) dbUpdates.work_start_date = updates.workStartDate;
      const { error } = await supabase.from('monthly_schedule').update(dbUpdates).eq('id', id);
      if (error) refreshData();
  };
  const deleteMonthlyScheduleItem = async (id: string) => {
      setMonthlySchedule(prev => prev.filter(s => s.id !== id));
      await supabase.from('monthly_schedule').delete().eq('id', id);
  };

  const addThirdPartyScheduleItem = async (item: Omit<ThirdPartyScheduleItem, 'id'>) => {
      const newId = generateId('TP-');
      setThirdPartySchedule(prev => [{...item, id: newId}, ...prev]);
      const { error } = await supabase.from('third_party_schedule').insert({ id: newId, company: item.company, service: item.service, frequency: item.frequency, contact: item.contact, work_start_date: item.workStartDate, work_end_date: item.workEndDate, work_notice_date: item.workNoticeDate });
      if (error) refreshData();
  };
  const updateThirdPartyScheduleItem = async (id: string, updates: Partial<ThirdPartyScheduleItem>) => {
      setThirdPartySchedule(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      const dbUpdates: any = { ...updates };
      if(updates.workStartDate) dbUpdates.work_start_date = updates.workStartDate;
      const { error } = await supabase.from('third_party_schedule').update(dbUpdates).eq('id', id);
      if (error) refreshData();
  };
  const deleteThirdPartyScheduleItem = async (id: string) => {
      setThirdPartySchedule(prev => prev.filter(s => s.id !== id));
      await supabase.from('third_party_schedule').delete().eq('id', id);
  };

  // --- PAINTING & PURCHASES ---
  const addPaintingProject = async (item: Omit<PaintingProject, 'id'>) => {
      const newId = generateId('P-');
      setPaintingProjects(prev => [{...item, id: newId}, ...prev]);
      const { error } = await supabase.from('painting_projects').insert({ id: newId, tower: item.tower, local: item.local, criticality: item.criticality, start_date: item.startDate, end_date_forecast: item.endDateForecast, status: item.status, paint_details: item.paintDetails, quantity: item.quantity });
      if (error) refreshData();
  };
  const updatePaintingProject = async (id: string, updates: Partial<PaintingProject>) => {
      setPaintingProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      const dbUpdates: any = { ...updates };
      if(updates.endDateForecast) dbUpdates.end_date_forecast = updates.endDateForecast;
      if(updates.startDate) dbUpdates.start_date = updates.startDate;
      if(updates.paintDetails) dbUpdates.paint_details = updates.paintDetails;
      const { error } = await supabase.from('painting_projects').update(dbUpdates).eq('id', id);
      if (error) refreshData();
  };
  const deletePaintingProject = async (id: string) => {
      setPaintingProjects(prev => prev.filter(p => p.id !== id));
      await supabase.from('painting_projects').delete().eq('id', id);
  };

  const addPurchase = async (item: Omit<PurchaseRequest, 'id'>) => {
      const newId = generateId('R-');
      setPurchases(prev => [{...item, id: newId}, ...prev]);
      const { error } = await supabase.from('purchases').insert({ id: newId, quantity: item.quantity, description: item.description, local: item.local, request_date: item.requestDate, approval_date: item.approvalDate, entry_date: item.entryDate });
      if (error) refreshData();
  };
  const updatePurchase = async (id: string, updates: Partial<PurchaseRequest>) => {
      setPurchases(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      const dbUpdates: any = { ...updates };
      if(updates.requestDate) dbUpdates.request_date = updates.requestDate;
      if(updates.approvalDate) dbUpdates.approval_date = updates.approvalDate;
      if(updates.entryDate) dbUpdates.entry_date = updates.entryDate;
      const { error } = await supabase.from('purchases').update(dbUpdates).eq('id', id);
      if (error) refreshData();
  };
  const deletePurchase = async (id: string) => {
      setPurchases(prev => prev.filter(p => p.id !== id));
      await supabase.from('purchases').delete().eq('id', id);
  };

  // --- SETTINGS ---
  const addSettingItem = async (category: keyof SettingsState, name: string) => {
    const newId = generateId('Cat-');
    setSettings((prev) => ({ ...prev, [category]: [...prev[category], { id: newId, name }] }));
    const { error } = await supabase.from(category).insert({ id: newId, name });
    if (error) refreshData();
  };
  const updateSettingItem = async (category: keyof SettingsState, id: string, newName: string) => {
    setSettings((prev) => ({ ...prev, [category]: prev[category].map(item => item.id === id ? { ...item, name: newName } : item) }));
    await supabase.from(category).update({ name: newName }).eq('id', id);
  };
  const removeSettingItem = async (category: keyof SettingsState, id: string) => {
    setSettings((prev) => ({ ...prev, [category]: prev[category].filter((item) => item.id !== id) }));
    await supabase.from(category).delete().eq('id', id);
  };

  const exportTasksToCSV = () => {
    const headers = ['ID', 'Serviço', 'Tipo', 'Torre', 'Local', 'Situação', 'Criticidade', 'Data Chamado', 'Materiais'];
    const findName = (list: CatalogItem[], id: string) => list.find(i => i.id === id)?.name || id;
    const rows = tasks.map(t => [t.id, findName(settings.services, t.serviceId), t.type, findName(settings.towers, t.towerId), t.location, t.situation, t.criticality, t.callDate, t.materials.map(mId => findName(settings.materials, mId)).join('; ')]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "tarefas_vilaprivilege.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAllData = async () => {
      setTasks([]); setVisits([]); setSchedule([]); setMonthlySchedule([]); setThirdPartySchedule([]); setPaintingProjects([]); setPurchases([]);
      await Promise.all([ supabase.from('tasks').delete().neq('id', '0'), supabase.from('visits').delete().neq('id', '0'), supabase.from('schedule').delete().neq('id', '0'), supabase.from('monthly_schedule').delete().neq('id', '0'), supabase.from('third_party_schedule').delete().neq('id', '0'), supabase.from('painting_projects').delete().neq('id', '0'), supabase.from('purchases').delete().neq('id', '0') ]);
  };

  const importDataFromCSV = async (csvContent: string): Promise<{ success: boolean; message: string; type?: string; count?: number }> => {
    try {
        const lines = csvContent.split(/\r\n|\n/);
        if (lines.length < 2) return { success: false, message: 'Arquivo vazio.' };
        const headerLine = lines[0];
        const delimiter = headerLine.includes(';') ? ';' : ',';
        const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        const getValue = (row: string[], headerName: string): string => {
            const index = headers.findIndex(h => h.includes(headerName));
            return index === -1 ? '' : row[index]?.trim().replace(/^"|"$/g, '') || '';
        };
        const rows = lines.slice(1).map(line => line.trim() ? (delimiter === ',' ? line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/) : line.split(';')) : null).filter(r => r && r.length > 1) as string[][];
        
        // Simples detecção de tipo por cabeçalho
        let detectedType = headers.some(h => h.includes('unidade')) ? 'visits' : 'tasks';
        let count = rows.length;
        
        if (detectedType === 'visits') {
            const newVisits = rows.map(r => ({ id: generateId('V-'), tower: getValue(r, 'torre') || 'T1', unit: getValue(r, 'unidade') || '000', situation: getValue(r, 'situacao') || 'Importado', time: getValue(r, 'hora') || '08:00', collaborator: getValue(r, 'colaborador') || '-', status: getValue(r, 'status') || 'Pendente', return_date: getValue(r, 'retorno') || '-' }));
            await supabase.from('visits').insert(newVisits);
        } else {
            const newTasks = rows.map(r => ({ id: generateId('T-'), title: getValue(r, 'titulo') || 'Importada', sector_id: generateId('Cat-'), service_id: generateId('Cat-'), tower_id: generateId('Cat-'), location: getValue(r, 'local') || 'Geral', responsible_id: generateId('Cat-'), situation: getValue(r, 'situacao') || 'Aberto', criticality: 'Média', type: getValue(r, 'tipo') || 'Corretiva', materials: [], call_date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() }));
            await supabase.from('tasks').insert(newTasks);
        }
        refreshData();
        return { success: true, message: 'Importação realizada!', type: detectedType, count };
    } catch (error: any) { return { success: false, message: 'Erro: ' + error.message }; }
  };

  return (
    <DataContext.Provider value={{ 
        tasks, visits, schedule, monthlySchedule, thirdPartySchedule, paintingProjects, purchases, settings, isLoading, lastUpdated, refreshData,
        addTask, updateTask, deleteTask, addVisit, updateVisit, deleteVisit, addScheduleItem, updateScheduleItem, deleteScheduleItem,
        addMonthlyScheduleItem, updateMonthlyScheduleItem, deleteMonthlyScheduleItem, addThirdPartyScheduleItem, updateThirdPartyScheduleItem, deleteThirdPartyScheduleItem,
        addPaintingProject, updatePaintingProject, deletePaintingProject, addPurchase, updatePurchase, deletePurchase, addSettingItem, updateSettingItem, removeSettingItem, 
        exportTasksToCSV, importDataFromCSV, clearAllData
    }}>{children}</DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};