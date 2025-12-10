import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, SettingsState, CatalogItem, Visit, ScheduleItem, MonthlyScheduleItem, PaintingProject, PurchaseRequest } from '../types';
import { supabase } from '../lib/supabase';

interface DataContextType {
  tasks: Task[];
  visits: Visit[];
  schedule: ScheduleItem[];
  monthlySchedule: MonthlyScheduleItem[];
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
                materials: t.materials || [],
                callDate: t.call_date,
                startDate: t.start_date,
                endDate: t.end_date,
                description: t.description,
                createdAt: t.created_at
            }));
            setTasks(mappedTasks);
        }
        if (visitsRes.data) setVisits(visitsRes.data.map((v:any) => ({...v, returnDate: v.return_date})));
        if (scheduleRes.data) setSchedule(scheduleRes.data);
        if (monthlyRes.data) setMonthlySchedule(monthlyRes.data);
        if (paintingRes.data) setPaintingProjects(paintingRes.data.map((p:any) => ({...p, endDateForecast: p.end_date_forecast, startDate: p.start_date, paintDetails: p.paint_details})));
        if (purchasesRes.data) setPurchases(purchasesRes.data.map((p:any) => ({...p, requestDate: p.request_date, approvalDate: p.approval_date, entryDate: p.entry_date})));

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
        console.error('Error fetching data from Supabase:', error);
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
    if (error) console.error('Supabase Error:', error);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));

    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.sectorId) dbUpdates.sector_id = updates.sectorId;
    if (updates.serviceId) dbUpdates.service_id = updates.serviceId;
    if (updates.towerId) dbUpdates.tower_id = updates.towerId;
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.responsibleId) dbUpdates.responsible_id = updates.responsibleId;
    if (updates.situation) dbUpdates.situation = updates.situation;
    if (updates.criticality) dbUpdates.criticality = updates.criticality;
    if (updates.materials) dbUpdates.materials = updates.materials;
    if (updates.callDate) dbUpdates.call_date = updates.callDate;
    if (updates.startDate) dbUpdates.start_date = updates.startDate;
    if (updates.endDate) dbUpdates.end_date = updates.endDate;

    await supabase.from('tasks').update(dbUpdates).eq('id', id);
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  };

  // --- VISITS ---
  const addVisit = async (item: Omit<Visit, 'id'>) => {
     const newId = generateId('V-');
     const newItem = { ...item, id: newId };
     setVisits(prev => [newItem, ...prev]);
     
     await supabase.from('visits').insert({
         id: newId,
         tower: item.tower,
         unit: item.unit,
         situation: item.situation,
         time: item.time,
         collaborator: item.collaborator,
         status: item.status,
         return_date: item.returnDate
     });
  };
  const updateVisit = async (id: string, updates: Partial<Visit>) => {
     setVisits(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
     const dbUpdates: any = {...updates};
     if (updates.returnDate) {
         dbUpdates.return_date = updates.returnDate;
         delete dbUpdates.returnDate;
     }
     await supabase.from('visits').update(dbUpdates).eq('id', id);
  };
  const deleteVisit = async (id: string) => {
     setVisits(prev => prev.filter(v => v.id !== id));
     await supabase.from('visits').delete().eq('id', id);
  };

  // --- SCHEDULE (WEEKLY) ---
  const addScheduleItem = async (item: Omit<ScheduleItem, 'id'>) => {
      const newId = generateId('S-');
      const newItem = { ...item, id: newId };
      setSchedule(prev => [newItem, ...prev]);
      await supabase.from('schedule').insert(newItem);
  };
  const updateScheduleItem = async (id: string, updates: Partial<ScheduleItem>) => {
      setSchedule(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      await supabase.from('schedule').update(updates).eq('id', id);
  };
  const deleteScheduleItem = async (id: string) => {
      setSchedule(prev => prev.filter(s => s.id !== id));
      await supabase.from('schedule').delete().eq('id', id);
  };

  // --- SCHEDULE (MONTHLY) ---
  const addMonthlyScheduleItem = async (item: Omit<MonthlyScheduleItem, 'id'>) => {
      const newId = generateId('M-');
      const newItem = { ...item, id: newId };
      setMonthlySchedule(prev => [newItem, ...prev]);
      await supabase.from('monthly_schedule').insert(newItem);
  };
  const updateMonthlyScheduleItem = async (id: string, updates: Partial<MonthlyScheduleItem>) => {
      setMonthlySchedule(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      await supabase.from('monthly_schedule').update(updates).eq('id', id);
  };
  const deleteMonthlyScheduleItem = async (id: string) => {
      setMonthlySchedule(prev => prev.filter(s => s.id !== id));
      await supabase.from('monthly_schedule').delete().eq('id', id);
  };

  // --- PAINTING ---
  const addPaintingProject = async (item: Omit<PaintingProject, 'id'>) => {
      const newId = generateId('P-');
      const newItem = { ...item, id: newId };
      setPaintingProjects(prev => [newItem, ...prev]);
      
      await supabase.from('painting_projects').insert({
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
  };
  const updatePaintingProject = async (id: string, updates: Partial<PaintingProject>) => {
      setPaintingProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      
      const dbUpdates: any = {};
      if(updates.tower) dbUpdates.tower = updates.tower;
      if(updates.local) dbUpdates.local = updates.local;
      if(updates.criticality) dbUpdates.criticality = updates.criticality;
      if(updates.startDate) dbUpdates.start_date = updates.startDate;
      if(updates.endDateForecast) dbUpdates.end_date_forecast = updates.endDateForecast;
      if(updates.status) dbUpdates.status = updates.status;
      if(updates.paintDetails) dbUpdates.paint_details = updates.paintDetails;
      if(updates.quantity) dbUpdates.quantity = updates.quantity;

      await supabase.from('painting_projects').update(dbUpdates).eq('id', id);
  };
  const deletePaintingProject = async (id: string) => {
      setPaintingProjects(prev => prev.filter(p => p.id !== id));
      await supabase.from('painting_projects').delete().eq('id', id);
  };

  // --- PURCHASES ---
  const addPurchase = async (item: Omit<PurchaseRequest, 'id'>) => {
      const newId = generateId('R-');
      const newItem = { ...item, id: newId };
      setPurchases(prev => [newItem, ...prev]);

      await supabase.from('purchases').insert({
          id: newId,
          quantity: item.quantity,
          description: item.description,
          local: item.local,
          request_date: item.requestDate,
          approval_date: item.approvalDate,
          entry_date: item.entryDate
      });
  };
  const updatePurchase = async (id: string, updates: Partial<PurchaseRequest>) => {
      setPurchases(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

      const dbUpdates: any = {};
      if(updates.quantity) dbUpdates.quantity = updates.quantity;
      if(updates.description) dbUpdates.description = updates.description;
      if(updates.local) dbUpdates.local = updates.local;
      if(updates.requestDate) dbUpdates.request_date = updates.requestDate;
      if(updates.approvalDate) dbUpdates.approval_date = updates.approvalDate;
      if(updates.entryDate) dbUpdates.entry_date = updates.entryDate;

      await supabase.from('purchases').update(dbUpdates).eq('id', id);
  };
  const deletePurchase = async (id: string) => {
      setPurchases(prev => prev.filter(p => p.id !== id));
      await supabase.from('purchases').delete().eq('id', id);
  };

  // --- SETTINGS ---
  const addSettingItem = async (category: keyof SettingsState, name: string) => {
    const newId = generateId('Cat-');
    const newItem: CatalogItem = { id: newId, name };
    
    setSettings((prev) => ({
      ...prev,
      [category]: [...prev[category], newItem],
    }));

    await supabase.from(category).insert(newItem);
  };

  const updateSettingItem = async (category: keyof SettingsState, id: string, newName: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === id ? { ...item, name: newName } : item
      ),
    }));

    await supabase.from(category).update({ name: newName }).eq('id', id);
  };

  const removeSettingItem = async (category: keyof SettingsState, id: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item.id !== id),
    }));
    await supabase.from(category).delete().eq('id', id);
  };

  const exportTasksToCSV = () => {
    const headers = ['ID', 'Serviço', 'Torre', 'Local', 'Situação', 'Criticidade', 'Data Chamado', 'Materiais'];
    const findName = (list: CatalogItem[], id: string) => list.find(i => i.id === id)?.name || id;

    const rows = tasks.map(t => {
        const service = findName(settings.services, t.serviceId);
        const tower = findName(settings.towers, t.towerId);
        const materials = t.materials.map(mId => findName(settings.materials, mId)).join('; ');

        return [t.id, service, tower, t.location, t.situation, t.criticality, t.callDate, materials];
    });
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tarefas_villaprivilege.csv");
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
      setPaintingProjects([]);
      setPurchases([]);

      await Promise.all([
          supabase.from('tasks').delete().neq('id', '0'),
          supabase.from('visits').delete().neq('id', '0'),
          supabase.from('schedule').delete().neq('id', '0'),
          supabase.from('monthly_schedule').delete().neq('id', '0'),
          supabase.from('painting_projects').delete().neq('id', '0'),
          supabase.from('purchases').delete().neq('id', '0')
      ]);
  };

  // Helper to normalize CSV dates (DD/MM/YYYY) to ISO (YYYY-MM-DD)
  const normalizeDate = (dateStr: string) => {
      if (!dateStr || dateStr.trim() === '') return new Date().toISOString().split('T')[0];
      // Check for DD/MM/YYYY
      if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
              const d = parts[0].padStart(2, '0');
              const m = parts[1].padStart(2, '0');
              const y = parts[2];
              return `${y}-${m}-${d}`;
          }
      }
      return dateStr;
  };

  // --- SMART IMPORT LOGIC (ASYNC & SEQUENTIAL) ---
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
        else if (headers.some(h => h.includes('segunda') && h.includes('terca'))) detectedType = 'weekly_schedule';
        else if (headers.some(h => h.includes('semana 1'))) detectedType = 'monthly_schedule';
        else if (headers.some(h => h.includes('titulo') || h.includes('servico') || h.includes('criticidade'))) detectedType = 'tasks';

        // 3. Process Data
        let count = 0;
        
        // Prepare pending inserts for settings (to batch insert them BEFORE tasks)
        const pendingSettingsInserts: Record<keyof SettingsState, CatalogItem[]> = {
            sectors: [],
            services: [],
            towers: [],
            responsibles: [],
            materials: [],
            situations: []
        };

        const tempSettings = { ...settings };

        // Helper: Queue new items for insertion
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
                criticality: (getValue(r, 'criticidade') as any) || 'Média',
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
                 saturday: getValue(r, 'sabado') || '-'
             }));
             
             const { error } = await supabase.from('schedule').insert(newSchedule);
             if (error) throw error;

             setSchedule(prev => [...newSchedule, ...prev]);
             count = newSchedule.length;

        } else if (detectedType === 'monthly_schedule') {
             const newMonthly = rows.map(r => ({
                 id: generateId('M-'),
                 shift: getValue(r, 'turno') || 'AREA',
                 week1: getValue(r, 'semana 1') || '-',
                 week2: getValue(r, 'semana 2') || '-',
                 week3: getValue(r, 'semana 3') || '-',
                 week4: getValue(r, 'semana 4') || '-'
             }));

             const { error } = await supabase.from('monthly_schedule').insert(newMonthly);
             if (error) throw error;

             setMonthlySchedule(prev => [...newMonthly, ...prev]);
             count = newMonthly.length;

        } else {
             // TASKS IMPORT
             const newTasks = rows.map(r => {
                 const rawService = getValue(r, 'servico') || getValue(r, 'tipo');
                 const rawTower = getValue(r, 'torre');
                 const rawSector = getValue(r, 'setor');
                 const rawResp = getValue(r, 'responsavel') || getValue(r, 'colaborador');
                 const rawSit = getValue(r, 'situacao') || getValue(r, 'status');

                 const serviceId = findOrAdd('services', rawService || 'Serviço Geral');
                 const towerId = findOrAdd('towers', rawTower || 'Geral');
                 const sectorId = findOrAdd('sectors', rawSector || 'Geral');
                 const responsibleId = findOrAdd('responsibles', rawResp || 'Não Identificado');
                 
                 let situationName = rawSit ? rawSit.trim() : 'Aberto';
                 situationName = situationName.charAt(0).toUpperCase() + situationName.slice(1);
                 
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
                    criticality: (getValue(r, 'criticidade') as any) || 'Média',
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
        let errorMessage = 'Erro desconhecido';
        if (typeof error === 'string') errorMessage = error;
        else if (error instanceof Error) errorMessage = error.message;
        else if (typeof error === 'object' && error !== null) errorMessage = (error as any).message || JSON.stringify(error);
        
        return { success: false, message: 'Erro ao salvar no banco de dados: ' + errorMessage };
    }
  };

  return (
    <DataContext.Provider value={{ 
        tasks, visits, schedule, monthlySchedule, paintingProjects, purchases, settings, isLoading, lastUpdated, refreshData,
        addTask, updateTask, deleteTask, 
        addVisit, updateVisit, deleteVisit,
        addScheduleItem, updateScheduleItem, deleteScheduleItem,
        addMonthlyScheduleItem, updateMonthlyScheduleItem, deleteMonthlyScheduleItem,
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