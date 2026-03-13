
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, SettingsState, CatalogItem, Visit, ScheduleItem, MonthlyScheduleItem, PaintingProject, PurchaseRequest, ThirdPartyScheduleItem, TrashItem } from '../types';
import { supabase } from '../lib/supabase';

interface DataContextType {
  tasks: Task[];
  visits: Visit[];
  trash: TrashItem[];
  schedule: ScheduleItem[];
  monthlySchedule: MonthlyScheduleItem[];
  thirdPartySchedule: ThirdPartyScheduleItem[];
  paintingProjects: PaintingProject[];
  purchases: PurchaseRequest[];
  settings: SettingsState;
  isLoading: boolean;
  lastUpdated: Date;
  refreshData: () => Promise<void>;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  addVisit: (item: Omit<Visit, 'id'>) => Promise<void>;
  updateVisit: (id: string, updates: Partial<Visit>) => Promise<void>;
  deleteVisit: (id: string) => Promise<void>;

  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => Promise<void>;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => Promise<void>;
  deleteScheduleItem: (id: string) => Promise<void>;

  addMonthlyScheduleItem: (item: Omit<MonthlyScheduleItem, 'id'>) => Promise<void>;
  updateMonthlyScheduleItem: (id: string, updates: Partial<MonthlyScheduleItem>) => Promise<void>;
  deleteMonthlyScheduleItem: (id: string) => Promise<void>;

  addThirdPartyScheduleItem: (item: Omit<ThirdPartyScheduleItem, 'id'>) => Promise<void>;
  updateThirdPartyScheduleItem: (id: string, updates: Partial<ThirdPartyScheduleItem>) => Promise<void>;
  deleteThirdPartyScheduleItem: (id: string) => Promise<void>;
  
  addPaintingProject: (item: Omit<PaintingProject, 'id'>) => Promise<void>;
  updatePaintingProject: (id: string, updates: Partial<PaintingProject>) => Promise<void>;
  deletePaintingProject: (id: string) => Promise<void>;

  addPurchase: (item: Omit<PurchaseRequest, 'id'>) => Promise<void>;
  updatePurchase: (id: string, updates: Partial<PurchaseRequest>) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  
  restoreItem: (item: TrashItem) => Promise<void>;
  permanentlyDeleteItem: (id: string) => Promise<void>;

  addSettingItem: (category: keyof SettingsState, name: string) => Promise<void>;
  updateSettingItem: (category: keyof SettingsState, id: string, newName: string) => Promise<void>;
  removeSettingItem: (category: keyof SettingsState, id: string) => Promise<void>;
  
  exportTasksToCSV: () => void;
  exportVisitsToCSV: () => void;
  exportThirdPartyToCSV: () => void;
  exportPaintingToCSV: () => void;
  exportPurchasesToCSV: () => void;
  importDataFromCSV: (csvContent: string) => Promise<{ success: boolean; message: string; type?: string; count?: number }>;
  
  clearAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialSettings: SettingsState = {
  sectors: [], services: [], towers: [], responsibles: [], materials: [], situations: []
};

const formatDateForDb = (dateStr?: string) => {
    if (!dateStr || dateStr.trim() === '' || dateStr === '-') return null;
    return dateStr;
};

/**
 * Utilitário de ID:
 * Mantemos como string. O cliente do Supabase lida com o casting no servidor.
 * Isso evita estouro de bits em IDs BIGINT do Postgres.
 */
const getQueryId = (id: any) => String(id);

const generateId = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const DataProvider = ({ children }: { children?: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [trash, setTrash] = useState<TrashItem[]>([]);
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
          supabase.from('tasks').select('*').neq('situation', 'Lixeira').order('created_at', { ascending: false }),
          supabase.from('visits').select('*'),
          supabase.from('schedule').select('*'),
          supabase.from('monthly_schedule').select('*'),
          supabase.from('third_party_schedule').select('*').order('company', { ascending: true }),
          supabase.from('painting_projects').select('*'),
          supabase.from('purchases').select('*'),
          supabase.from('sectors').select('*'),
          supabase.from('services').select('*'),
          supabase.from('towers').select('*'),
          supabase.from('responsibles').select('*'),
          supabase.from('materials').select('*'),
          supabase.from('situations').select('*')
        ]);

        const trashRes = await supabase.from('tasks').select('*').eq('situation', 'Lixeira').order('created_at', { ascending: false });

        if (tasksRes.data) {
            setTasks(tasksRes.data.map((t: any) => ({
                id: String(t.id),
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

        if (trashRes.data) {
            setTrash(trashRes.data.map((t: any) => {
                try {
                    const parsed = JSON.parse(t.description || '{}');
                    return {
                        id: String(t.id),
                        originalId: parsed.originalId || String(t.id),
                        tableName: parsed.tableName || 'tasks',
                        title: t.title,
                        data: parsed.data || t,
                        deletedAt: t.created_at
                    };
                } catch {
                    return {
                        id: String(t.id),
                        originalId: String(t.id),
                        tableName: 'tasks',
                        title: t.title,
                        data: t,
                        deletedAt: t.created_at
                    };
                }
            }));
        }
        
        if (visitsRes.data) setVisits(visitsRes.data.map((v:any) => ({ ...v, id: String(v.id), returnDate: v.return_date })));
        if (scheduleRes.data) setSchedule(scheduleRes.data.map((s:any) => ({ ...s, id: String(s.id), workStartDate: s.work_start_date, workEndDate: s.work_end_date, workNoticeDate: s.work_notice_date })));
        if (monthlyRes.data) setMonthlySchedule(monthlyRes.data.map((s:any) => ({ ...s, id: String(s.id), workStartDate: s.work_start_date, workEndDate: s.work_end_date, workNoticeDate: s.work_notice_date })));
        
        if (thirdPartyRes.data) setThirdPartySchedule(thirdPartyRes.data.map((s:any) => ({ 
            id: String(s.id),
            company: s.company,
            service: s.service,
            frequency: s.frequency,
            contact: s.contact,
            workStartDate: s.work_start_date, 
            workEndDate: s.work_end_date, 
            workNoticeDate: s.work_notice_date 
        })));

        if (paintingRes.data) setPaintingProjects(paintingRes.data.map((p:any) => ({ ...p, id: String(p.id), endDateForecast: p.end_date_forecast, startDate: p.start_date, paintDetails: p.paint_details })));
        if (purchasesRes.data) setPurchases(purchasesRes.data.map((p:any) => ({ ...p, id: String(p.id), requestDate: p.request_date, approvalDate: p.approval_date, entryDate: p.entry_date })));

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

  const handleError = useCallback((err: any, context: string, shouldRefresh = true) => {
      console.error(`${context} Error:`, err);
      const msg = err.message || 'Erro de conexão/permissão';
      const detail = err.details || '';
      
      // Avoid alert in background refresh to prevent blocking UI
      if (context !== 'Carregar Dados') {
          alert(`FALHA NA OPERAÇÃO (${context}):\n\nMotivo: ${msg}\n${detail ? `Detalhes: ${detail}` : ''}\n\nSE O ITEM NÃO SUMIU: Provavelmente falta permissão de DELETE no seu Supabase para esta tabela.`);
      }
      
      if (shouldRefresh) {
          refreshData();
      }
  }, [refreshData]);

  const addTask = async (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('tasks').insert({
        id: generateId(),
        title: newTask.title,
        sector_id: newTask.sectorId || null,
        service_id: newTask.serviceId || null,
        tower_id: newTask.towerId || null,
        location: newTask.location,
        responsible_id: newTask.responsibleId || null,
        situation: newTask.situation,
        criticality: newTask.criticality,
        type: newTask.type, 
        materials: newTask.materials || [],
        call_date: formatDateForDb(newTask.callDate),
        start_date: formatDateForDb(newTask.startDate),
        end_date: formatDateForDb(newTask.endDate),
        description: newTask.description
    });
    if (error) handleError(error, 'Adicionar Tarefa');
    else refreshData();
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const qId = getQueryId(id);
    const { error } = await supabase.from('tasks').update({
        title: updates.title,
        sector_id: updates.sectorId,
        service_id: updates.serviceId,
        tower_id: updates.towerId,
        location: updates.location,
        responsible_id: updates.responsibleId,
        situation: updates.situation,
        criticality: updates.criticality,
        type: updates.type,
        materials: updates.materials,
        call_date: updates.callDate ? formatDateForDb(updates.callDate) : undefined,
        start_date: updates.startDate ? formatDateForDb(updates.startDate) : undefined,
        end_date: updates.endDate ? formatDateForDb(updates.endDate) : undefined,
    }).eq('id', qId);
    if (error) handleError(error, 'Atualizar Tarefa');
    else refreshData();
  };

  const deleteTask = async (id: string) => {
    const qId = getQueryId(id);
    const item = tasks.find(t => String(t.id) === String(id));
    if (!item) return;

    setTasks(prev => prev.filter(t => String(t.id) !== String(id)));
    
    const { error } = await supabase.from('tasks').update({ situation: 'Lixeira' }).eq('id', qId);
    if (error) handleError(error, 'Mover para Lixeira');
    else refreshData();
  };

  const addVisit = async (item: Omit<Visit, 'id'>) => {
     const { error } = await supabase.from('visits').insert({ 
         id: generateId(),
         tower: item.tower, unit: item.unit, situation: item.situation, 
         time: item.time, collaborator: item.collaborator, status: item.status, 
         return_date: formatDateForDb(item.returnDate) 
     });
     if (error) handleError(error, 'Adicionar Visita');
     else refreshData();
  };
  
  const updateVisit = async (id: string, updates: Partial<Visit>) => {
     const qId = getQueryId(id);
     // Fix: Map properties explicitly to snake_case column names instead of using spread
     const { error } = await supabase.from('visits').update({ 
         tower: updates.tower,
         unit: updates.unit,
         situation: updates.situation,
         time: updates.time,
         collaborator: updates.collaborator,
         status: updates.status,
         return_date: updates.returnDate ? formatDateForDb(updates.returnDate) : undefined 
     }).eq('id', qId);
     if (error) handleError(error, 'Atualizar Visita');
     else refreshData();
  };

  const deleteVisit = async (id: string) => {
     const qId = getQueryId(id);
     const item = visits.find(v => String(v.id) === String(id));
     if (!item) return;

     setVisits(prev => prev.filter(v => String(v.id) !== String(id)));
     
     const trashPayload = {
         title: `Visita: ${item.tower} - ${item.unit}`,
         situation: 'Lixeira',
         description: JSON.stringify({ originalId: id, tableName: 'visits', data: item })
     };

     const { error: trashError } = await supabase.from('tasks').insert(trashPayload);
     if (trashError) {
         handleError(trashError, 'Mover para Lixeira');
         return;
     }

     const { error } = await supabase.from('visits').delete().eq('id', qId);
     if (error) handleError(error, 'Remover da Tabela Original');
     else refreshData();
  };

  const addThirdPartyScheduleItem = async (item: Omit<ThirdPartyScheduleItem, 'id'>) => {
      const { error } = await supabase.from('third_party_schedule').insert({ 
          id: generateId(),
          company: item.company, 
          service: item.service, 
          frequency: item.frequency || 'Mensal', 
          contact: item.contact || null, 
          work_start_date: formatDateForDb(item.workStartDate), 
          work_end_date: formatDateForDb(item.workEndDate), 
          work_notice_date: formatDateForDb(item.workNoticeDate) 
      });
      if (error) handleError(error, 'Adicionar Obra/Cronograma');
      else refreshData();
  };

  const updateThirdPartyScheduleItem = async (id: string, updates: Partial<ThirdPartyScheduleItem>) => {
      const qId = getQueryId(id);
      const { error } = await supabase.from('third_party_schedule').update({
          company: updates.company,
          service: updates.service,
          frequency: updates.frequency,
          contact: updates.contact,
          work_start_date: updates.workStartDate ? formatDateForDb(updates.workStartDate) : undefined,
          work_end_date: updates.workEndDate ? formatDateForDb(updates.workEndDate) : undefined,
          work_notice_date: updates.workNoticeDate ? formatDateForDb(updates.workNoticeDate) : undefined
      }).eq('id', qId);
      if (error) handleError(error, 'Atualizar Obra/Cronograma');
      else refreshData();
  };

  const deleteThirdPartyScheduleItem = async (id: string) => {
      const qId = getQueryId(id);
      const item = thirdPartySchedule.find(s => String(s.id) === String(id));
      if (!item) return;

      setThirdPartySchedule(prev => prev.filter(s => String(s.id) !== String(id)));
      
      const trashPayload = {
          title: `Contrato: ${item.company} - ${item.service}`,
          situation: 'Lixeira',
          description: JSON.stringify({ originalId: id, tableName: 'third_party_schedule', data: item })
      };

      const { error: trashError } = await supabase.from('tasks').insert(trashPayload);
      if (trashError) {
          handleError(trashError, 'Mover para Lixeira');
          return;
      }

      const { error } = await supabase.from('third_party_schedule').delete().eq('id', qId);
      if (error) handleError(error, 'Remover da Tabela Original');
      else refreshData();
  };

  const addScheduleItem = async (item: Omit<ScheduleItem, 'id'>) => {
      const { error } = await supabase.from('schedule').insert({ 
          id: generateId(),
          shift: item.shift, monday: item.monday, tuesday: item.tuesday, 
          wednesday: item.wednesday, thursday: item.thursday, friday: item.friday, 
          saturday: item.saturday, work_start_date: formatDateForDb(item.workStartDate), 
          work_end_date: formatDateForDb(item.workEndDate), work_notice_date: formatDateForDb(item.workNoticeDate) 
      });
      if (error) handleError(error, 'Adicionar Escala');
      else refreshData();
  };

  const updateScheduleItem = async (id: string, updates: Partial<ScheduleItem>) => {
      const qId = getQueryId(id);
      const { error } = await supabase.from('schedule').update({ 
          shift: updates.shift,
          monday: updates.monday,
          tuesday: updates.tuesday,
          wednesday: updates.wednesday,
          thursday: updates.thursday,
          friday: updates.friday,
          saturday: updates.saturday,
          work_start_date: updates.workStartDate ? formatDateForDb(updates.workStartDate) : undefined,
          work_end_date: updates.workEndDate ? formatDateForDb(updates.workEndDate) : undefined,
          work_notice_date: updates.workNoticeDate ? formatDateForDb(updates.workNoticeDate) : undefined
      }).eq('id', qId);
      if (error) handleError(error, 'Atualizar Escala');
      else refreshData();
  };

  const deleteScheduleItem = async (id: string) => {
      const qId = getQueryId(id);
      const item = schedule.find(s => String(s.id) === String(id));
      if (!item) return;

      setSchedule(prev => prev.filter(s => String(s.id) !== String(id)));
      
      const trashPayload = {
          title: `Escala: ${item.shift}`,
          situation: 'Lixeira',
          description: JSON.stringify({ originalId: id, tableName: 'schedule', data: item })
      };

      const { error: trashError } = await supabase.from('tasks').insert(trashPayload);
      if (trashError) {
          handleError(trashError, 'Mover para Lixeira');
          return;
      }

      const { error } = await supabase.from('schedule').delete().eq('id', qId);
      if (error) handleError(error, 'Remover da Tabela Original');
      else refreshData();
  };

  const addMonthlyScheduleItem = async (item: Omit<MonthlyScheduleItem, 'id'>) => {
      const { error } = await supabase.from('monthly_schedule').insert({ 
          id: generateId(),
          shift: item.shift, week1: item.week1, week2: item.week2, week3: item.week3, 
          week4: item.week4, work_start_date: formatDateForDb(item.workStartDate), 
          work_end_date: formatDateForDb(item.workEndDate), work_notice_date: formatDateForDb(item.workNoticeDate) 
      });
      if (error) handleError(error, 'Adicionar Escala Mensal');
      else refreshData();
  };

  const updateMonthlyScheduleItem = async (id: string, updates: Partial<MonthlyScheduleItem>) => {
      const qId = getQueryId(id);
      const { error } = await supabase.from('monthly_schedule').update({ 
          shift: updates.shift,
          week1: updates.week1,
          week2: updates.week2,
          week3: updates.week3,
          week4: updates.week4,
          work_start_date: updates.workStartDate ? formatDateForDb(updates.workStartDate) : undefined,
          work_end_date: updates.workEndDate ? formatDateForDb(updates.workEndDate) : undefined,
          work_notice_date: updates.workNoticeDate ? formatDateForDb(updates.workNoticeDate) : undefined
      }).eq('id', qId);
      if (error) handleError(error, 'Atualizar Escala Mensal');
      else refreshData();
  };

  const deleteMonthlyScheduleItem = async (id: string) => {
      const qId = getQueryId(id);
      const item = monthlySchedule.find(s => String(s.id) === String(id));
      if (!item) return;

      setMonthlySchedule(prev => prev.filter(s => String(s.id) !== String(id)));
      
      const trashPayload = {
          title: `Escala Mensal: ${item.shift}`,
          situation: 'Lixeira',
          description: JSON.stringify({ originalId: id, tableName: 'monthly_schedule', data: item })
      };

      const { error: trashError } = await supabase.from('tasks').insert(trashPayload);
      if (trashError) {
          handleError(trashError, 'Mover para Lixeira');
          return;
      }

      const { error } = await supabase.from('monthly_schedule').delete().eq('id', qId);
      if (error) handleError(error, 'Remover da Tabela Original');
      else refreshData();
  };

  const addPaintingProject = async (item: Omit<PaintingProject, 'id'>) => {
      const { error } = await supabase.from('painting_projects').insert({ 
          id: generateId(),
          tower: item.tower, local: item.local, criticality: item.criticality, 
          start_date: formatDateForDb(item.startDate), 
          end_date_forecast: formatDateForDb(item.endDateForecast), 
          status: item.status, paint_details: item.paintDetails, quantity: item.quantity 
      });
      if (error) handleError(error, 'Adicionar Pintura');
      else refreshData();
  };

  const updatePaintingProject = async (id: string, updates: Partial<PaintingProject>) => {
      const qId = getQueryId(id);
      const { error } = await supabase.from('painting_projects').update({ 
          tower: updates.tower,
          local: updates.local,
          criticality: updates.criticality,
          status: updates.status,
          paint_details: updates.paintDetails,
          quantity: updates.quantity,
          start_date: updates.startDate ? formatDateForDb(updates.startDate) : undefined, 
          end_date_forecast: updates.endDateForecast ? formatDateForDb(updates.endDateForecast) : undefined 
      }).eq('id', qId);
      if (error) handleError(error, 'Atualizar Pintura');
      else refreshData();
  };

  const deletePaintingProject = async (id: string) => {
      const qId = getQueryId(id);
      const item = paintingProjects.find(p => String(p.id) === String(id));
      if (!item) return;

      setPaintingProjects(prev => prev.filter(p => String(p.id) !== String(id)));
      
      const trashPayload = {
          title: `Pintura: ${item.tower} - ${item.local}`,
          situation: 'Lixeira',
          description: JSON.stringify({ originalId: id, tableName: 'painting_projects', data: item })
      };

      const { error: trashError } = await supabase.from('tasks').insert(trashPayload);
      if (trashError) {
          handleError(trashError, 'Mover para Lixeira');
          return;
      }

      const { error } = await supabase.from('painting_projects').delete().eq('id', qId);
      if (error) handleError(error, 'Remover da Tabela Original');
      else refreshData();
  };

  const addPurchase = async (item: Omit<PurchaseRequest, 'id'>) => {
      const { error } = await supabase.from('purchases').insert({ 
          id: generateId(),
          quantity: item.quantity, description: item.description, local: item.local, 
          request_date: formatDateForDb(item.requestDate), 
          approval_date: formatDateForDb(item.approvalDate), 
          entry_date: formatDateForDb(item.entryDate) 
      });
      if (error) handleError(error, 'Adicionar Compra');
      else refreshData();
  };

  const updatePurchase = async (id: string, updates: Partial<PurchaseRequest>) => {
      const qId = getQueryId(id);
      const { error } = await supabase.from('purchases').update({ 
          quantity: updates.quantity,
          description: updates.description,
          local: updates.local,
          request_date: updates.requestDate ? formatDateForDb(updates.requestDate) : undefined,
          approval_date: updates.approvalDate ? formatDateForDb(updates.approvalDate) : undefined,
          entry_date: updates.entryDate ? formatDateForDb(updates.entryDate) : undefined
      }).eq('id', qId);
      if (error) handleError(error, 'Atualizar Compra');
      else refreshData();
  };

  const deletePurchase = async (id: string) => {
      const qId = getQueryId(id);
      const item = purchases.find(p => String(p.id) === String(id));
      if (!item) return;

      setPurchases(prev => prev.filter(p => String(p.id) !== String(id)));
      
      const trashPayload = {
          title: `Compra: ${item.description}`,
          situation: 'Lixeira',
          description: JSON.stringify({ originalId: id, tableName: 'purchases', data: item })
      };

      const { error: trashError } = await supabase.from('tasks').insert(trashPayload);
      if (trashError) {
          handleError(trashError, 'Mover para Lixeira');
          return;
      }

      const { error } = await supabase.from('purchases').delete().eq('id', qId);
      if (error) handleError(error, 'Remover da Tabela Original');
      else refreshData();
  };

  const restoreItem = async (item: TrashItem) => {
      try {
          if (item.tableName === 'tasks') {
              const { error } = await supabase.from('tasks').update({ situation: 'Pendente' }).eq('id', item.id);
              if (error) throw error;
          } else {
              // Map snake_case for DB
              const dbData: any = {};
              Object.entries(item.data).forEach(([key, value]) => {
                  const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                  dbData[snakeKey] = value;
              });
              
              // Remove id to let DB handle it if needed, or keep it
              dbData.id = item.originalId;

              const { error: insertError } = await supabase.from(item.tableName).insert(dbData);
              if (insertError) throw insertError;

              const { error: deleteError } = await supabase.from('tasks').delete().eq('id', item.id);
              if (deleteError) throw deleteError;
          }
          refreshData();
      } catch (error) {
          handleError(error, 'Restaurar Item');
      }
  };

  const permanentlyDeleteItem = async (id: string) => {
      const qId = getQueryId(id);
      const { error } = await supabase.from('tasks').delete().eq('id', qId);
      if (error) handleError(error, 'Excluir Permanentemente');
      else refreshData();
  };

  const addSettingItem = async (category: keyof SettingsState, name: string) => {
    const { error } = await supabase.from(category).insert({ 
        id: generateId(),
        name 
    });
    if (error) handleError(error, 'Adicionar Configuração');
    else refreshData();
  };

  const updateSettingItem = async (category: keyof SettingsState, id: string, newName: string) => {
    const qId = getQueryId(id);
    const { error } = await supabase.from(category).update({ name: newName }).eq('id', qId);
    if (error) handleError(error, 'Atualizar Configuração');
    else refreshData();
  };

  const removeSettingItem = async (category: keyof SettingsState, id: string) => {
    const qId = getQueryId(id);
    const { error, count } = await supabase.from(category).delete({ count: 'exact' }).eq('id', qId);
    if (error) handleError(error, 'Excluir Configuração');
    else if (count === 0) {
        alert('AVISO: O item não foi encontrado no banco de dados para exclusão.');
        refreshData();
    } else {
        refreshData();
    }
  };

  const downloadCSV = (content: string, filename: string) => {
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI("data:text/csv;charset=utf-8," + content));
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const exportTasksToCSV = () => {
    const headers = ['ID', 'Serviço', 'Tipo', 'Torre', 'Local', 'Situação', 'Criticidade', 'Data Chamado', 'Materiais'];
    const findName = (list: CatalogItem[], id: string) => list.find(i => i.id === id)?.name || id;
    const rows = tasks.map(t => [t.id, findName(settings.services, t.serviceId), t.type, findName(settings.towers, t.towerId), t.location, t.situation, t.criticality, t.callDate, t.materials.map(mId => findName(settings.materials, mId)).join('; ')]);
    downloadCSV(headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n"), "tarefas.csv");
  };

  const exportVisitsToCSV = () => {
      const headers = ['ID', 'Torre', 'Unidade', 'Situação', 'Hora', 'Colaborador', 'Status', 'Retorno'];
      const rows = visits.map(v => [v.id, v.tower, v.unit, v.situation, v.time, v.collaborator, v.status, v.returnDate]);
      downloadCSV(headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n"), "visitas.csv");
  };

  const exportThirdPartyToCSV = () => {
      const headers = ['ID', 'Empresa', 'Serviço', 'Frequência', 'Contato', 'Início', 'Término', 'Aviso'];
      const rows = thirdPartySchedule.map(tp => [tp.id, tp.company, tp.service, tp.frequency, tp.contact || '', tp.workStartDate || '', tp.workEndDate || '', tp.workNoticeDate || '']);
      downloadCSV(headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n"), "obras_cronograma.csv");
  };

  const exportPaintingToCSV = () => {
      const headers = ['ID', 'Torre', 'Local', 'Criticidade', 'Início', 'Previsão', 'Status', 'Detalhes', 'Quantidade'];
      // Fix: Use correct property name 'paintDetails' instead of 'paint_details'
      const rows = paintingProjects.map(p => [p.id, p.tower, p.local, p.criticality, p.startDate, p.endDateForecast, p.status, p.paintDetails, p.quantity]);
      downloadCSV(headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n"), "pintura.csv");
  };

  const exportPurchasesToCSV = () => {
      const headers = ['ID', 'Quantidade', 'Descrição', 'Local', 'Data Solicitação', 'Data Aprovação', 'Data Entrada'];
      const rows = purchases.map(p => [p.id, p.quantity, p.description, p.local, p.requestDate, p.approvalDate || '', p.entryDate || '']);
      downloadCSV(headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n"), "compras.csv");
  };

  const clearAllData = async () => {
      const { error } = await supabase.from('tasks').delete().neq('id', '0');
      if (error) refreshData();
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
        
        const detectedType = headers.some(h => h.includes('unidade')) ? 'visits' : 'tasks';
        const count = rows.length;
        
        if (detectedType === 'visits') {
            const newVisits = rows.map(r => ({ 
                id: generateId(),
                tower: getValue(r, 'torre') || 'T1', 
                unit: getValue(r, 'unidade') || '000', 
                situation: getValue(r, 'situacao') || 'Importado', 
                time: getValue(r, 'hora') || '08:00', 
                collaborator: getValue(r, 'colaborador') || '-', 
                status: getValue(r, 'status') || 'Pendente', 
                return_date: formatDateForDb(getValue(r, 'retorno')) 
            }));
            const { error } = await supabase.from('visits').insert(newVisits);
            if (error) throw error;
        } else {
            const newTasks = rows.map(r => ({ 
                id: generateId(),
                title: getValue(r, 'titulo') || 'Importada', 
                sector_id: null, 
                service_id: null, 
                tower_id: null, 
                location: getValue(r, 'local') || 'Geral', 
                responsible_id: null, 
                situation: getValue(r, 'situacao') || 'Aberto', 
                criticality: 'Média', 
                type: getValue(r, 'tipo') || 'Corretiva', 
                materials: [], 
                call_date: formatDateForDb(new Date().toISOString().split('T')[0]) 
            }));
            const { error } = await supabase.from('tasks').insert(newTasks);
            if (error) throw error;
        }
        refreshData();
        return { success: true, message: 'Importação realizada!', type: detectedType, count };
    } catch (error: any) { return { success: false, message: 'Erro: ' + error.message }; }
  };

  return (
    <DataContext.Provider value={{ 
        tasks, visits, trash, schedule, monthlySchedule, thirdPartySchedule, paintingProjects, purchases, settings, isLoading, lastUpdated, refreshData,
        addTask, updateTask, deleteTask, addVisit, updateVisit, deleteVisit, addScheduleItem, updateScheduleItem, deleteScheduleItem,
        addMonthlyScheduleItem, updateMonthlyScheduleItem, deleteMonthlyScheduleItem, addThirdPartyScheduleItem, updateThirdPartyScheduleItem, deleteThirdPartyScheduleItem,
        addPaintingProject, updatePaintingProject, deletePaintingProject, addPurchase, updatePurchase, deletePurchase, restoreItem, permanentlyDeleteItem, addSettingItem, updateSettingItem, removeSettingItem, 
        exportTasksToCSV, exportVisitsToCSV, exportThirdPartyToCSV, exportPaintingToCSV, exportPurchasesToCSV, importDataFromCSV, clearAllData
    }}>{children}</DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
