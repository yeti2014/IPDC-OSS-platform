// src/utils/seedAssets.ts
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Asset, AssetCategory, AssetStatus, AssetCondition } from '../types/asset';

/**
 * Park name to parkId mapping
 */
const PARK_NAME_TO_ID: Record<string, string> = {
  'Hawassa Industrial Park': 'hawassa',
  'Bole Lemi Industrial Park': 'bole_lemi',
  'Kilinto Industrial Park': 'kilinto',
  'Kombolcha Industrial Park': 'kombolcha',
  'Mekelle Industrial Park': 'mekelle',
  'Dire Dawa Industrial Park': 'dire_dawa',
  'Adama Industrial Park': 'adama',
  'Jimma Industrial Park': 'jimma',
  'Bahir Dar Industrial Park': 'bahir_dar',
  'Debre Berhan Industrial Park': 'debre_berhan',
  'Semera Industrial Park': 'semera',
  'Arerti Industrial Park': 'arerti',
  'Addis Industrial Village': 'aiv',
};

/**
 * Migrate existing Firestore assets to add missing parkId field
 * based on their parkName. This fixes assets seeded before parkId was added.
 */
export async function migrateAssetsParkId(): Promise<{ updated: number; skipped: number; errors: number }> {
  const result = { updated: 0, skipped: 0, errors: 0 };

  try {
    const snapshot = await getDocs(collection(db, 'assets'));

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      // Skip if parkId already exists
      if (data.parkId) {
        result.skipped++;
        continue;
      }

      // Determine parkId from parkName
      const parkId = data.parkName ? PARK_NAME_TO_ID[data.parkName] : null;

      if (parkId) {
        try {
          await updateDoc(doc(db, 'assets', docSnap.id), { parkId });
          result.updated++;
          console.log(`✅ Migrated: ${data.name} → parkId: ${parkId}`);
        } catch (err) {
          result.errors++;
          console.error(`❌ Failed to migrate: ${data.name}`, err);
        }
      } else {
        // Default to 'hawassa' if parkName is unknown
        try {
          await updateDoc(doc(db, 'assets', docSnap.id), { parkId: 'hawassa' });
          result.updated++;
          console.log(`⚠️ Migrated with default: ${data.name} → parkId: hawassa`);
        } catch (err) {
          result.errors++;
          console.error(`❌ Failed to migrate: ${data.name}`, err);
        }
      }
    }

    console.log(`🎉 Migration complete: ${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }

  return result;
}

/**
 * Seed demo assets for testing AI Maintenance Prediction
 */
export async function seedDemoAssets(userId: string): Promise<void> {
  const demoAssets: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      assetCode: 'GEN-HIP-001',
      name: 'Industrial Generator 500kW',
      category: 'machinery' as AssetCategory,
      status: 'operational' as AssetStatus,
      condition: 'good' as AssetCondition,
      parkId: 'hawassa',
      parkName: 'Hawassa Industrial Park',
      location: 'Building A - Power Station',
      manufacturer: 'Caterpillar',
      model: 'C18-500',
      serialNumber: 'CAT-GEN-2020-001',
      purchaseDate: new Date('2020-03-15'),
      purchaseCost: 150000,
      currentValue: 120000,
      depreciationRate: 10,
      warrantyExpiry: new Date('2025-03-15'),
      maintenanceInterval: 90, // days
      lastMaintenanceDate: new Date('2025-10-15'),
      nextMaintenanceDate: new Date('2026-01-13'), // Today!
      assignedTo: 'Power Operations Team',
      notes: 'Primary backup generator for industrial zone',
      maintenanceHistory: [
        {
          id: 'maint-001',
          date: new Date('2025-10-15'),
          type: 'preventive',
          description: 'Routine maintenance: oil change, filter replacement',
          cost: 2500,
          performedBy: 'John Maintenance',
          status: 'completed' as const,
          completedDate: new Date('2025-10-15')
        },
        {
          id: 'maint-002',
          date: new Date('2025-07-18'),
          type: 'preventive',
          description: 'Quarterly maintenance check',
          cost: 2200,
          performedBy: 'John Maintenance',
          status: 'completed' as const,
          completedDate: new Date('2025-07-18')
        }
      ],
      attachments: [],
      tags: ['critical', 'power', 'backup'],
      specifications: {
        power_output: '500kW',
        voltage: '415V',
        frequency: '50Hz',
        fuel_type: 'Diesel'
      },
      createdBy: userId
    },
    {
      assetCode: 'HVAC-HIP-002',
      name: 'Central HVAC System',
      category: 'equipment' as AssetCategory,
      status: 'operational' as AssetStatus,
      condition: 'fair' as AssetCondition,
      parkId: 'hawassa',
      parkName: 'Hawassa Industrial Park',
      location: 'Building B - Manufacturing Floor',
      manufacturer: 'Carrier',
      model: 'AquaEdge 19DV',
      serialNumber: 'CARR-HVAC-2019-045',
      purchaseDate: new Date('2019-06-20'),
      purchaseCost: 85000,
      currentValue: 55000,
      depreciationRate: 12,
      warrantyExpiry: new Date('2024-06-20'),
      maintenanceInterval: 60,
      lastMaintenanceDate: new Date('2025-11-01'),
      nextMaintenanceDate: new Date('2025-12-30'), // Overdue!
      assignedTo: 'Facilities Management',
      notes: 'Showing signs of wear, efficiency decreasing',
      maintenanceHistory: [
        {
          id: 'maint-003',
          date: new Date('2025-11-01'),
          type: 'repair',
          description: 'Replaced compressor belt, cleaned filters',
          cost: 3200,
          performedBy: 'HVAC Specialists Ltd',
          status: 'completed' as const,
          completedDate: new Date('2025-11-01')
        },
        {
          id: 'maint-004',
          date: new Date('2025-09-05'),
          type: 'preventive',
          description: 'Routine filter replacement',
          cost: 800,
          performedBy: 'Facilities Team',
          status: 'completed' as const,
          completedDate: new Date('2025-09-05')
        },
        {
          id: 'maint-005',
          date: new Date('2025-07-10'),
          type: 'repair',
          description: 'Fixed refrigerant leak',
          cost: 4500,
          performedBy: 'HVAC Specialists Ltd',
          status: 'completed' as const,
          completedDate: new Date('2025-07-12')
        }
      ],
      attachments: [],
      tags: ['climate-control', 'energy-intensive', 'aging'],
      specifications: {
        cooling_capacity: '250 tons',
        energy_rating: 'A',
        refrigerant: 'R-410A'
      },
      createdBy: userId
    },
    {
      assetCode: 'VEH-HIP-003',
      name: 'Forklift - Toyota 8FBE20U',
      category: 'vehicle' as AssetCategory,
      status: 'operational' as AssetStatus,
      condition: 'excellent' as AssetCondition,
      parkId: 'hawassa',
      parkName: 'Hawassa Industrial Park',
      location: 'Warehouse 3',
      manufacturer: 'Toyota',
      model: '8FBE20U',
      serialNumber: 'TOY-FORK-2023-012',
      purchaseDate: new Date('2023-08-10'),
      purchaseCost: 35000,
      currentValue: 30000,
      depreciationRate: 8,
      warrantyExpiry: new Date('2026-08-10'),
      maintenanceInterval: 120,
      lastMaintenanceDate: new Date('2025-09-15'),
      nextMaintenanceDate: new Date('2026-01-13'),
      assignedTo: 'Warehouse Operations',
      notes: 'Recently purchased, in excellent condition',
      maintenanceHistory: [
        {
          id: 'maint-006',
          date: new Date('2025-09-15'),
          type: 'preventive',
          description: 'First year service check',
          cost: 450,
          performedBy: 'Toyota Service Center',
          status: 'completed' as const,
          completedDate: new Date('2025-09-15')
        }
      ],
      attachments: [],
      tags: ['warehouse', 'material-handling', 'new'],
      specifications: {
        load_capacity: '2000kg',
        lift_height: '4.5m',
        power_type: 'Electric'
      },
      createdBy: userId
    },
    {
      assetCode: 'COMP-BLP-004',
      name: 'Industrial Air Compressor',
      category: 'machinery' as AssetCategory,
      status: 'maintenance' as AssetStatus,
      condition: 'poor' as AssetCondition,
      parkId: 'bole_lemi',
      parkName: 'Bole Lemi Industrial Park',
      location: 'Compressor Room - Building C',
      manufacturer: 'Atlas Copco',
      model: 'GA 75 VSD',
      serialNumber: 'ATLAS-COMP-2018-089',
      purchaseDate: new Date('2018-02-28'),
      purchaseCost: 95000,
      currentValue: 45000,
      depreciationRate: 15,
      warrantyExpiry: new Date('2023-02-28'),
      maintenanceInterval: 90,
      lastMaintenanceDate: new Date('2025-08-20'),
      nextMaintenanceDate: new Date('2025-11-18'), // Very overdue!
      assignedTo: 'Production Engineering',
      notes: 'Currently in maintenance - excessive vibration detected',
      maintenanceHistory: [
        {
          id: 'maint-007',
          date: new Date('2026-01-10'),
          type: 'repair',
          description: 'Investigating excessive vibration and noise',
          cost: 0,
          performedBy: 'Maintenance Team',
          status: 'in_progress' as const
        },
        {
          id: 'maint-008',
          date: new Date('2025-08-20'),
          type: 'preventive',
          description: 'Oil change and filter replacement',
          cost: 1800,
          performedBy: 'Atlas Copco Service',
          status: 'completed' as const,
          completedDate: new Date('2025-08-20')
        },
        {
          id: 'maint-009',
          date: new Date('2025-05-15'),
          type: 'repair',
          description: 'Replaced pressure valve',
          cost: 2400,
          performedBy: 'Atlas Copco Service',
          status: 'completed' as const,
          completedDate: new Date('2025-05-16')
        },
        {
          id: 'maint-010',
          date: new Date('2025-03-10'),
          type: 'repair',
          description: 'Fixed air leak in system',
          cost: 1200,
          performedBy: 'Maintenance Team',
          status: 'completed' as const,
          completedDate: new Date('2025-03-11')
        }
      ],
      attachments: [],
      tags: ['critical', 'aging', 'frequent-issues'],
      specifications: {
        air_delivery: '13.5 m³/min',
        working_pressure: '8.5 bar',
        motor_power: '75 kW'
      },
      createdBy: userId
    },
    {
      assetCode: 'LIFT-HIP-005',
      name: 'Passenger Elevator - Building A',
      category: 'equipment' as AssetCategory,
      status: 'operational' as AssetStatus,
      condition: 'good' as AssetCondition,
      parkId: 'hawassa',
      parkName: 'Hawassa Industrial Park',
      location: 'Building A - Main Lobby',
      manufacturer: 'Otis',
      model: 'Gen2 Premier',
      serialNumber: 'OTIS-ELEV-2021-034',
      purchaseDate: new Date('2021-05-12'),
      purchaseCost: 120000,
      currentValue: 95000,
      depreciationRate: 8,
      warrantyExpiry: new Date('2026-05-12'),
      maintenanceInterval: 30, // Monthly
      lastMaintenanceDate: new Date('2025-12-15'),
      nextMaintenanceDate: new Date('2026-01-14'),
      assignedTo: 'Building Maintenance',
      notes: 'Monthly maintenance required by regulation',
      maintenanceHistory: [
        {
          id: 'maint-011',
          date: new Date('2025-12-15'),
          type: 'preventive',
          description: 'Monthly safety inspection and lubrication',
          cost: 600,
          performedBy: 'Otis Maintenance',
          status: 'completed' as const,
          completedDate: new Date('2025-12-15')
        },
        {
          id: 'maint-012',
          date: new Date('2025-11-18'),
          type: 'preventive',
          description: 'Monthly safety inspection',
          cost: 600,
          performedBy: 'Otis Maintenance',
          status: 'completed' as const,
          completedDate: new Date('2025-11-18')
        }
      ],
      attachments: [],
      tags: ['safety-critical', 'public-access', 'regulated'],
      specifications: {
        capacity: '1600 kg',
        speed: '1.6 m/s',
        floors_served: '6',
        door_type: 'Automatic'
      },
      createdBy: userId
    }
  ];

  console.log('🌱 Seeding demo assets...');

  try {
    const assetsCollection = collection(db, 'assets');

    for (const asset of demoAssets) {
      await addDoc(assetsCollection, {
        ...asset,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Created: ${asset.name} (${asset.assetCode})`);
    }

    console.log('🎉 Successfully seeded all demo assets!');
  } catch (error) {
    console.error('❌ Error seeding assets:', error);
    throw error;
  }
}
