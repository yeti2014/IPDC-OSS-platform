// src/types/industrialPark.ts

export type IndustryType =
  | 'textile'
  | 'leather'
  | 'pharmaceutical'
  | 'automotive'
  | 'electronics'
  | 'food-processing'
  | 'metal-manufacturing'
  | 'agro-processing'
  | 'other';

export type InfrastructureType =
  | 'power'
  | 'water'
  | 'waste-treatment'
  | 'telecommunications'
  | 'roads'
  | 'railway'
  | 'warehouse';

export interface IndustrialPark {
  id: string;
  name: string;
  location: {
    city: string;
    region: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  description: string;
  totalArea: number; // in hectares
  occupiedArea: number; // in hectares
  availableArea: number; // in hectares
  occupancyRate: number; // percentage

  // Capacity
  maxTenants: number;
  currentTenants: number;
  maxEmployees: number;
  currentEmployees: number;

  // Industry Focus
  primaryIndustries: IndustryType[];
  secondaryIndustries: IndustryType[];

  // Infrastructure
  infrastructure: {
    type: InfrastructureType;
    capacity: number;
    available: number;
    quality: 'excellent' | 'good' | 'average' | 'poor';
  }[];

  // Financial
  rentPerSqm: number; // ETB per square meter
  utilityRates: {
    electricity: number; // ETB per kWh
    water: number; // ETB per cubic meter
    internet: number; // ETB per month
  };

  // Incentives
  incentives: {
    taxHoliday: number; // years
    customsDutyExemption: boolean;
    incomeTaxExemption: number; // percentage
    exportIncentive: boolean;
    other: string[];
  };

  // Services
  availableServices: string[];
  nearbyFacilities: {
    port?: { name: string; distance: number }; // km
    airport?: { name: string; distance: number }; // km
    cityCenter?: { name: string; distance: number }; // km
  };

  // Contact
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
    managerName?: string;
  };

  // Statistics
  statistics: {
    activeRequests: number;
    completedRequests: number;
    averageResponseTime: number; // hours
    satisfactionRating: number; // 1-5
  };

  // Status
  isActive: boolean;
  acceptingTenants: boolean;
  certifications: string[];

  createdAt: Date;
  updatedAt: Date;
}

export interface TenantProfile {
  industryType: IndustryType;
  productionCapacity?: number;
  requiredArea: number; // square meters
  employeeCount: number;
  powerRequirement: number; // kW
  waterRequirement: number; // cubic meters per day
  budgetRange: {
    min: number;
    max: number;
  };
  preferredLocation?: {
    region?: string;
    nearPort?: boolean;
    nearAirport?: boolean;
  };
  requiresCertifications?: string[];
  exportOriented?: boolean;
}

export interface ParkRecommendation {
  park: IndustrialPark;
  matchScore: number; // 0-100
  reasons: string[];
  pros: string[];
  cons: string[];
  estimatedMonthlyCost: number;
}
