
export type Role = 'admin' | 'operator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export type Criticality = 'Alta' | 'Média' | 'Baixa';
export type MaintenanceType = 'Corretiva' | 'Preventiva' | 'Programada';

export interface CatalogItem {
  id: string;
  name: string;
}

export interface SettingsState {
  sectors: CatalogItem[];
  services: CatalogItem[];
  towers: CatalogItem[];
  responsibles: CatalogItem[];
  materials: CatalogItem[]; 
  situations: CatalogItem[]; 
}

export interface Task {
  id: string;
  title: string;
  sectorId: string;
  serviceId: string;
  towerId: string;
  location: string;
  responsibleId: string;
  situation: string; 
  criticality: Criticality;
  type: MaintenanceType; // New field
  materials: string[]; 
  callDate: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  createdAt: string;
}

// New Types based on images

export interface Visit {
  id: string;
  tower: string;
  unit: string;
  situation: string;
  time: string;
  collaborator: string;
  status: string;
  returnDate: string;
}

export interface ScheduleItem {
  id: string;
  shift: string; // Manhã, Tarde, Noite
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  // Obra fields
  workStartDate?: string;
  workEndDate?: string;
  workNoticeDate?: string;
}

export interface MonthlyScheduleItem {
  id: string;
  shift: string; // Using 'shift' for consistency, represents "Turno" or "Category"
  week1: string;
  week2: string;
  week3: string;
  week4: string;
  // Obra fields
  workStartDate?: string;
  workEndDate?: string;
  workNoticeDate?: string;
}

export type Frequency = 'Semanal' | 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';

export interface ThirdPartyScheduleItem {
  id: string;
  company: string;
  service: string;
  frequency: Frequency;
  contact?: string;
  // Obra fields
  workStartDate?: string;
  workEndDate?: string;
  workNoticeDate?: string;
}

export interface PaintingProject {
  id: string;
  tower: string;
  local: string;
  criticality: Criticality;
  startDate: string;
  endDateForecast: string;
  status: string;
  paintDetails: string; // Paint name/brand
  quantity: string;
}

export interface PurchaseRequest {
  id: string;
  quantity: number;
  description: string;
  local: string;
  requestDate: string;
  approvalDate?: string;
  entryDate?: string;
}