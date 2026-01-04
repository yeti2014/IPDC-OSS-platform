// src/data/industrialParksData.ts
import { IndustrialPark } from '../types/industrialPark';

/**
 * Comprehensive data for Ethiopian Industrial Parks
 * Based on real IPDC facilities
 */

export const ETHIOPIAN_INDUSTRIAL_PARKS: Omit<IndustrialPark, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Hawassa Industrial Park',
    location: {
      city: 'Hawassa',
      region: 'SNNPR (Southern Nations, Nationalities, and Peoples Region)',
      coordinates: { latitude: 7.0621, longitude: 38.4760 }
    },
    description: 'Ethiopia\'s flagship industrial park focusing on textile and garment manufacturing. Features world-class infrastructure and is a pioneer in sustainable industrial development.',
    totalArea: 300,
    occupiedArea: 255,
    availableArea: 45,
    occupancyRate: 85,

    maxTenants: 30,
    currentTenants: 23,
    maxEmployees: 60000,
    currentEmployees: 25000,

    primaryIndustries: ['textile', 'leather'],
    secondaryIndustries: ['agro-processing'],

    infrastructure: [
      { type: 'power', capacity: 50000, available: 15000, quality: 'excellent' },
      { type: 'water', capacity: 20000, available: 8000, quality: 'excellent' },
      { type: 'waste-treatment', capacity: 15000, available: 5000, quality: 'excellent' },
      { type: 'telecommunications', capacity: 1000, available: 300, quality: 'excellent' },
      { type: 'roads', capacity: 100, available: 100, quality: 'excellent' },
      { type: 'warehouse', capacity: 50000, available: 15000, quality: 'good' }
    ],

    rentPerSqm: 1.5, // USD per sqm per month
    utilityRates: {
      electricity: 0.05, // ETB per kWh
      water: 8.5, // ETB per cubic meter
      internet: 5000 // ETB per month
    },

    incentives: {
      taxHoliday: 10,
      customsDutyExemption: true,
      incomeTaxExemption: 100,
      exportIncentive: true,
      other: ['Duty-free import of capital goods', 'Income tax exemption on exported goods']
    },

    availableServices: [
      'One-stop service center',
      'Customs clearance',
      'Banking services',
      'Health clinic',
      'Cafeteria',
      'Security 24/7',
      'Transportation services',
      'Waste management'
    ],

    nearbyFacilities: {
      airport: { name: 'Hawassa Airport', distance: 6 },
      cityCenter: { name: 'Hawassa City Center', distance: 3 }
    },

    contactInfo: {
      phone: '+251-11-517-0000',
      email: 'hawassa@ipdc.gov.et',
      website: 'www.ipdc.gov.et',
      managerName: 'Park Manager - Hawassa IP'
    },

    statistics: {
      activeRequests: 12,
      completedRequests: 145,
      averageResponseTime: 18,
      satisfactionRating: 4.5
    },

    isActive: true,
    acceptingTenants: true,
    certifications: ['ISO 14001', 'LEED Certified', 'OHSAS 18001']
  },
  {
    name: 'Bole Lemi Industrial Park',
    location: {
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      coordinates: { latitude: 8.8900, longitude: 38.7450 }
    },
    description: 'Located in the heart of Ethiopia\'s capital, Bole Lemi IP is a premier destination for textile and garment industries with direct access to international markets.',
    totalArea: 156,
    occupiedArea: 144,
    availableArea: 12,
    occupancyRate: 92,

    maxTenants: 25,
    currentTenants: 21,
    maxEmployees: 30000,
    currentEmployees: 18000,

    primaryIndustries: ['textile', 'leather'],
    secondaryIndustries: ['food-processing'],

    infrastructure: [
      { type: 'power', capacity: 40000, available: 5000, quality: 'excellent' },
      { type: 'water', capacity: 15000, available: 2000, quality: 'excellent' },
      { type: 'waste-treatment', capacity: 10000, available: 1500, quality: 'good' },
      { type: 'telecommunications', capacity: 1000, available: 200, quality: 'excellent' },
      { type: 'roads', capacity: 100, available: 100, quality: 'excellent' },
      { type: 'railway', capacity: 50, available: 20, quality: 'good' }
    ],

    rentPerSqm: 2.0,
    utilityRates: {
      electricity: 0.06,
      water: 9.0,
      internet: 6000
    },

    incentives: {
      taxHoliday: 8,
      customsDutyExemption: true,
      incomeTaxExemption: 100,
      exportIncentive: true,
      other: ['Fast-track licensing', 'Export quota allocation']
    },

    availableServices: [
      'One-stop service center',
      'Customs office on-site',
      'Commercial bank branches',
      'Medical center',
      'Dining facilities',
      '24/7 security',
      'Shuttle bus service',
      'Training center'
    ],

    nearbyFacilities: {
      airport: { name: 'Bole International Airport', distance: 8 },
      port: { name: 'Djibouti Port (via road)', distance: 900 },
      cityCenter: { name: 'Addis Ababa CBD', distance: 10 }
    },

    contactInfo: {
      phone: '+251-11-557-3000',
      email: 'bolelemi@ipdc.gov.et',
      website: 'www.ipdc.gov.et',
      managerName: 'Park Manager - Bole Lemi IP'
    },

    statistics: {
      activeRequests: 8,
      completedRequests: 203,
      averageResponseTime: 12,
      satisfactionRating: 4.7
    },

    isActive: true,
    acceptingTenants: true,
    certifications: ['ISO 9001', 'ISO 14001']
  },
  {
    name: 'Kilinto Industrial Park',
    location: {
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      coordinates: { latitude: 8.9500, longitude: 38.6500 }
    },
    description: 'A diversified industrial park supporting pharmaceutical, food processing, and manufacturing industries with modern facilities.',
    totalArea: 75,
    occupiedArea: 58,
    availableArea: 17,
    occupancyRate: 77,

    maxTenants: 20,
    currentTenants: 15,
    maxEmployees: 15000,
    currentEmployees: 8500,

    primaryIndustries: ['pharmaceutical', 'food-processing'],
    secondaryIndustries: ['metal-manufacturing', 'electronics'],

    infrastructure: [
      { type: 'power', capacity: 25000, available: 8000, quality: 'good' },
      { type: 'water', capacity: 12000, available: 4500, quality: 'good' },
      { type: 'waste-treatment', capacity: 8000, available: 3000, quality: 'good' },
      { type: 'telecommunications', capacity: 800, available: 300, quality: 'good' },
      { type: 'roads', capacity: 100, available: 100, quality: 'good' }
    ],

    rentPerSqm: 1.8,
    utilityRates: {
      electricity: 0.055,
      water: 8.8,
      internet: 5500
    },

    incentives: {
      taxHoliday: 7,
      customsDutyExemption: true,
      incomeTaxExemption: 80,
      exportIncentive: true,
      other: ['Pharmaceutical product incentives', 'R&D tax credits']
    },

    availableServices: [
      'One-stop service',
      'Quality testing lab',
      'Banking',
      'Medical clinic',
      'Cafeteria',
      'Security',
      'Cold storage',
      'Logistics support'
    ],

    nearbyFacilities: {
      airport: { name: 'Bole International Airport', distance: 15 },
      cityCenter: { name: 'Addis Ababa CBD', distance: 12 }
    },

    contactInfo: {
      phone: '+251-11-567-4000',
      email: 'kilinto@ipdc.gov.et',
      managerName: 'Park Manager - Kilinto IP'
    },

    statistics: {
      activeRequests: 15,
      completedRequests: 98,
      averageResponseTime: 20,
      satisfactionRating: 4.2
    },

    isActive: true,
    acceptingTenants: true,
    certifications: ['GMP Certified', 'ISO 14001']
  },
  {
    name: 'Kombolcha Industrial Park',
    location: {
      city: 'Kombolcha',
      region: 'Amhara',
      coordinates: { latitude: 11.0833, longitude: 39.7417 }
    },
    description: 'Strategic location connecting northern and southern Ethiopia, focusing on textile, leather, and agro-processing industries.',
    totalArea: 100,
    occupiedArea: 65,
    availableArea: 35,
    occupancyRate: 65,

    maxTenants: 18,
    currentTenants: 12,
    maxEmployees: 20000,
    currentEmployees: 6000,

    primaryIndustries: ['textile', 'agro-processing'],
    secondaryIndustries: ['leather', 'food-processing'],

    infrastructure: [
      { type: 'power', capacity: 30000, available: 12000, quality: 'good' },
      { type: 'water', capacity: 14000, available: 7000, quality: 'good' },
      { type: 'waste-treatment', capacity: 9000, available: 5000, quality: 'average' },
      { type: 'telecommunications', capacity: 600, available: 350, quality: 'good' },
      { type: 'roads', capacity: 100, available: 100, quality: 'good' }
    ],

    rentPerSqm: 1.2,
    utilityRates: {
      electricity: 0.048,
      water: 7.5,
      internet: 4500
    },

    incentives: {
      taxHoliday: 9,
      customsDutyExemption: true,
      incomeTaxExemption: 100,
      exportIncentive: true,
      other: ['Regional development bonus', 'Training subsidies']
    },

    availableServices: [
      'One-stop service',
      'Customs',
      'Banking',
      'Health services',
      'Dining',
      'Security',
      'Transportation'
    ],

    nearbyFacilities: {
      airport: { name: 'Kombolcha Airport', distance: 5 },
      port: { name: 'Djibouti Port', distance: 800 },
      cityCenter: { name: 'Kombolcha City', distance: 4 }
    },

    contactInfo: {
      phone: '+251-33-551-0000',
      email: 'kombolcha@ipdc.gov.et',
      managerName: 'Park Manager - Kombolcha IP'
    },

    statistics: {
      activeRequests: 6,
      completedRequests: 67,
      averageResponseTime: 22,
      satisfactionRating: 4.0
    },

    isActive: true,
    acceptingTenants: true,
    certifications: ['ISO 14001']
  },
  {
    name: 'Mekelle Industrial Park',
    location: {
      city: 'Mekelle',
      region: 'Tigray',
      coordinates: { latitude: 13.4967, longitude: 39.4753 }
    },
    description: 'Northern Ethiopia\'s premier industrial park with focus on textile, cement, and mineral processing industries.',
    totalArea: 90,
    occupiedArea: 63,
    availableArea: 27,
    occupancyRate: 70,

    maxTenants: 15,
    currentTenants: 10,
    maxEmployees: 18000,
    currentEmployees: 5000,

    primaryIndustries: ['textile', 'metal-manufacturing'],
    secondaryIndustries: ['agro-processing'],

    infrastructure: [
      { type: 'power', capacity: 28000, available: 10000, quality: 'good' },
      { type: 'water', capacity: 11000, available: 5500, quality: 'average' },
      { type: 'waste-treatment', capacity: 7000, available: 3500, quality: 'average' },
      { type: 'telecommunications', capacity: 500, available: 250, quality: 'good' },
      { type: 'roads', capacity: 100, available: 100, quality: 'good' }
    ],

    rentPerSqm: 1.1,
    utilityRates: {
      electricity: 0.047,
      water: 7.0,
      internet: 4000
    },

    incentives: {
      taxHoliday: 10,
      customsDutyExemption: true,
      incomeTaxExemption: 100,
      exportIncentive: true,
      other: ['Northern corridor development incentive', 'Mining sector support']
    },

    availableServices: [
      'One-stop service',
      'Customs',
      'Banking',
      'Health clinic',
      'Cafeteria',
      'Security',
      'Transport'
    ],

    nearbyFacilities: {
      airport: { name: 'Alula Aba Nega Airport', distance: 7 },
      cityCenter: { name: 'Mekelle City', distance: 5 }
    },

    contactInfo: {
      phone: '+251-34-441-0000',
      email: 'mekelle@ipdc.gov.et',
      managerName: 'Park Manager - Mekelle IP'
    },

    statistics: {
      activeRequests: 4,
      completedRequests: 45,
      averageResponseTime: 24,
      satisfactionRating: 3.9
    },

    isActive: true,
    acceptingTenants: true,
    certifications: []
  }
];
