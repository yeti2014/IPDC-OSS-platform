// src/scripts/seedIndustrialParks.ts
/**
 * Script to seed Firestore with Ethiopian Industrial Parks data
 * Run this once to populate the database
 */

import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ETHIOPIAN_INDUSTRIAL_PARKS } from '../data/industrialParksData';

export async function seedIndustrialParks() {
  try {
    console.log('🌱 Starting to seed industrial parks...');

    // Check if parks already exist
    const parksSnapshot = await getDocs(collection(db, 'industrialParks'));

    if (parksSnapshot.size > 0) {
      console.log(`⚠️  Database already contains ${parksSnapshot.size} parks. Skipping seed.`);
      console.log('💡 To re-seed, delete the industrialParks collection first.');
      return { success: false, message: 'Parks already exist' };
    }

    let successCount = 0;
    let errorCount = 0;

    for (const parkData of ETHIOPIAN_INDUSTRIAL_PARKS) {
      try {
        const docRef = await addDoc(collection(db, 'industrialParks'), {
          ...parkData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        console.log(`✅ Added: ${parkData.name} (ID: ${docRef.id})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error adding ${parkData.name}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 Seeding complete!`);
    console.log(`✅ Successfully added: ${successCount} parks`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount}`);
    }

    return {
      success: true,
      message: `Added ${successCount} industrial parks`,
      successCount,
      errorCount
    };
  } catch (error) {
    console.error('❌ Fatal error during seeding:', error);
    return {
      success: false,
      message: 'Seeding failed',
      error
    };
  }
}

// Export function to clear parks (use with caution!)
export async function clearIndustrialParks() {
  try {
    console.log('🗑️  Clearing industrial parks...');
    const parksSnapshot = await getDocs(collection(db, 'industrialParks'));

    // Note: In production, you should use batch deletes
    console.warn('⚠️  This operation should use Firebase Admin SDK or batch deletes');
    console.log(`Found ${parksSnapshot.size} parks to delete`);

    return {
      success: false,
      message: 'Please use Firebase Console to delete collections'
    };
  } catch (error) {
    console.error('Error clearing parks:', error);
    return { success: false, error };
  }
}
