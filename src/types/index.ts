// src/types/index.ts
export type UserRole = 'tenant' | 'admin' | 'operations';

export type RequestStatus = 'pending' | 'approved' | 'in-progress' | 'completed' | 'rejected';

export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ServiceType = 
  | 'maintenance'
  | 'utilities'
  | 'security'
  | 'cleaning'
  | 'it-support'
  | 'waste-management'
  | 'other';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  companyName?: string;
  phoneNumber?: string;
  photoURL?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  serviceType: ServiceType;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  location?: string;
  assignedTo?: string;
  assignedToName?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  rejectionReason?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  relatedRequestId?: string;
  createdAt: Date;
}

export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  createdAt: Date;
  attempts: number;
}
export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: string;
  createdByName: string;
  targetAudience: 'all' | 'tenants' | 'operations' | 'admin';
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface EconomicZone {
  id: string;
  name: string;
  location: string;
  description: string;
  tenantCount: number;
  employeeCount: number;
  totalArea: number;
  occupancyRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ZoneStatistics {
  zoneId: string;
  zoneName: string;
  activeRequests: number;
  completedRequests: number;
  tenants: number;
  employees: number;
}