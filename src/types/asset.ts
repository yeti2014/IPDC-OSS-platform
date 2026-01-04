// src/types/asset.ts

/**
 * Asset Management Types
 * For tracking industrial park equipment, infrastructure, and inventory
 */

export type AssetCategory =
  | 'machinery'
  | 'vehicle'
  | 'infrastructure'
  | 'it-equipment'
  | 'furniture'
  | 'tool'
  | 'safety-equipment'
  | 'utility'
  | 'other';

export type AssetStatus =
  | 'operational'
  | 'maintenance'
  | 'repair'
  | 'retired'
  | 'reserved'
  | 'damaged';

export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export type MaintenanceType =
  | 'preventive'
  | 'corrective'
  | 'predictive'
  | 'inspection';

export type MaintenanceStatus =
  | 'scheduled'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'overdue';

export interface Asset {
  id: string;
  assetCode: string; // Unique identifier (e.g., "IPDC-MAC-001")
  name: string;
  description: string;
  category: AssetCategory;
  status: AssetStatus;
  condition: AssetCondition;

  // Location
  parkId: string;
  parkName: string;
  location: string; // Building/zone within park

  // Financial
  purchaseDate: Date;
  purchaseCost: number;
  currentValue: number;
  depreciationRate: number; // Percentage per year

  // Specifications
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  specifications?: Record<string, any>;

  // Maintenance
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  maintenanceInterval?: number; // Days
  warrantyExpiry?: Date;

  // Assignment
  assignedTo?: string; // User ID or department
  assignedToName?: string;

  // Tracking
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  // Additional
  images?: string[]; // URLs to asset images
  documents?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  notes?: string;
  tags?: string[];
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;

  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';

  scheduledDate: Date;
  completedDate?: Date;

  // Details
  title: string;
  description: string;
  procedure?: string;

  // Assignment
  assignedTo?: string;
  assignedToName?: string;
  performedBy?: string;
  performedByName?: string;

  // Costs
  estimatedCost?: number;
  actualCost?: number;
  partsUsed?: Array<{
    name: string;
    quantity: number;
    cost: number;
  }>;

  // Time tracking
  estimatedDuration?: number; // Hours
  actualDuration?: number; // Hours

  // Results
  findings?: string;
  actions?: string;
  recommendations?: string;

  // Attachments
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;

  // Tracking
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  // Recurrence (for scheduled maintenance)
  isRecurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recurrenceInterval?: number;
  nextOccurrence?: Date;
}

export interface AssetCheckout {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;

  checkoutDate: Date;
  expectedReturnDate: Date;
  actualReturnDate?: Date;

  checkedOutBy: string;
  checkedOutByName: string;
  checkedOutTo: string; // Department or person

  purpose: string;
  notes?: string;

  // Condition tracking
  conditionAtCheckout: AssetCondition;
  conditionAtReturn?: AssetCondition;
  damageReported?: string;

  status: 'checked-out' | 'returned' | 'overdue' | 'lost';

  createdAt: Date;
  updatedAt: Date;
}

export interface AssetDepreciationHistory {
  id: string;
  assetId: string;
  assetCode: string;

  date: Date;
  originalValue: number;
  currentValue: number;
  depreciationAmount: number;
  accumulatedDepreciation: number;

  method: 'straight-line' | 'declining-balance' | 'units-of-production';

  createdAt: Date;
}

export interface AssetStatistics {
  totalAssets: number;
  totalValue: number;
  assetsByCategory: Record<AssetCategory, number>;
  assetsByStatus: Record<AssetStatus, number>;
  assetsByCondition: Record<AssetCondition, number>;

  maintenanceDue: number;
  maintenanceOverdue: number;
  assetsUnderWarranty: number;

  avgAssetAge: number; // Days
  avgMaintenanceInterval: number; // Days
  totalMaintenanceCost: number;
}
