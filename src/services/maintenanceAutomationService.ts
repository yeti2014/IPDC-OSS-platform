// src/services/maintenanceAutomationService.ts

import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { MaintenanceRecord, MaintenanceStatus } from '../types/asset';
import { assetService } from './assetService';
import { notificationService } from './notificationService';

/**
 * Maintenance Scheduling & Automation Service
 * Handles automatic scheduling, reminders, and recurring maintenance tasks
 */

class MaintenanceAutomationService {
  private readonly maintenanceCollection = 'maintenanceRecords';
  private readonly remindersCollection = 'maintenanceReminders';

  /**
   * Get overdue maintenance tasks
   */
  async getOverdueMaintenance(): Promise<MaintenanceRecord[]> {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, this.maintenanceCollection),
        where('scheduledDate', '<=', now),
        where('status', 'in', ['scheduled', 'in-progress'])
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.convertToMaintenanceRecord(doc));
    } catch (error) {
      console.error('Error getting overdue maintenance:', error);
      return [];
    }
  }

  /**
   * Get upcoming maintenance (next 7 days)
   */
  async getUpcomingMaintenance(daysAhead: number = 7): Promise<MaintenanceRecord[]> {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + daysAhead);

      const q = query(
        collection(db, this.maintenanceCollection),
        where('scheduledDate', '>=', Timestamp.fromDate(now)),
        where('scheduledDate', '<=', Timestamp.fromDate(futureDate)),
        where('status', '==', 'scheduled')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.convertToMaintenanceRecord(doc));
    } catch (error) {
      console.error('Error getting upcoming maintenance:', error);
      return [];
    }
  }

  /**
   * Schedule recurring maintenance for an asset
   */
  async scheduleRecurringMaintenance(
    assetId: string,
    maintenanceType: 'preventive' | 'inspection',
    intervalDays: number,
    title: string,
    description: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const asset = await assetService.getAsset(assetId);
      if (!asset) {
        return { success: false, message: 'Asset not found' };
      }

      // Schedule first occurrence in 'intervalDays' days
      const firstOccurrence = new Date();
      firstOccurrence.setDate(firstOccurrence.getDate() + intervalDays);

      const maintenanceRecord: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        assetId: asset.id,
        assetCode: asset.assetCode,
        assetName: asset.name,
        type: maintenanceType,
        status: 'scheduled',
        priority: 'medium',
        scheduledDate: firstOccurrence,
        title,
        description,
        isRecurring: true,
        recurrencePattern: 'daily',
        recurrenceInterval: intervalDays,
        nextOccurrence: firstOccurrence,
        createdBy: userId
      };

      const result = await assetService.createMaintenanceRecord(maintenanceRecord, userId);
      return result;
    } catch (error: any) {
      console.error('Error scheduling recurring maintenance:', error);
      return {
        success: false,
        message: error.message || 'Failed to schedule recurring maintenance'
      };
    }
  }

  /**
   * Auto-create next occurrence for recurring maintenance
   */
  async processRecurringMaintenance(completedRecord: MaintenanceRecord): Promise<void> {
    if (!completedRecord.isRecurring || !completedRecord.recurrencePattern || !completedRecord.recurrenceInterval) {
      return;
    }

    try {
      const nextDate = this.calculateNextOccurrence(
        completedRecord.scheduledDate,
        completedRecord.recurrencePattern,
        completedRecord.recurrenceInterval
      );

      const nextRecord: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        assetId: completedRecord.assetId,
        assetCode: completedRecord.assetCode,
        assetName: completedRecord.assetName,
        type: completedRecord.type,
        status: 'scheduled',
        priority: completedRecord.priority,
        scheduledDate: nextDate,
        title: completedRecord.title,
        description: completedRecord.description,
        procedure: completedRecord.procedure,
        estimatedCost: completedRecord.estimatedCost,
        estimatedDuration: completedRecord.estimatedDuration,
        isRecurring: true,
        recurrencePattern: completedRecord.recurrencePattern,
        recurrenceInterval: completedRecord.recurrenceInterval,
        nextOccurrence: nextDate,
        createdBy: completedRecord.createdBy
      };

      await assetService.createMaintenanceRecord(nextRecord, completedRecord.createdBy);
      console.log('✅ Next recurring maintenance scheduled:', nextDate);
    } catch (error) {
      console.error('Error processing recurring maintenance:', error);
    }
  }

  /**
   * Calculate next occurrence based on recurrence pattern
   */
  private calculateNextOccurrence(
    currentDate: Date,
    pattern: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    interval: number
  ): Date {
    const nextDate = new Date(currentDate);

    switch (pattern) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (interval * 7));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + (interval * 3));
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        break;
    }

    return nextDate;
  }

  /**
   * Send reminder notifications for upcoming maintenance
   */
  async sendMaintenanceReminders(): Promise<void> {
    try {
      // Get maintenance scheduled for next 3 days
      const upcoming = await this.getUpcomingMaintenance(3);

      for (const maintenance of upcoming) {
        // Check if reminder already sent
        const reminderSent = await this.hasReminderBeenSent(maintenance.id);
        if (reminderSent) continue;

        // Send notification (if assigned)
        if (maintenance.assignedTo) {
          // In production, this would send to the assigned user
          console.log(`📧 Reminder: Maintenance "${maintenance.title}" scheduled for ${maintenance.scheduledDate}`);
        }

        // Mark reminder as sent
        await this.markReminderSent(maintenance.id);
      }

      console.log(`✅ Sent ${upcoming.length} maintenance reminders`);
    } catch (error) {
      console.error('Error sending maintenance reminders:', error);
    }
  }

  /**
   * Send overdue notifications
   */
  async sendOverdueNotifications(): Promise<void> {
    try {
      const overdue = await this.getOverdueMaintenance();

      for (const maintenance of overdue) {
        // Update status to overdue if not already
        if (maintenance.status !== 'overdue') {
          await assetService.updateMaintenanceRecord(maintenance.id, {
            status: 'overdue' as MaintenanceStatus
          });
        }

        // Notify assigned user
        if (maintenance.assignedTo) {
          console.log(`⚠️ Overdue: Maintenance "${maintenance.title}" was due ${maintenance.scheduledDate}`);
        }
      }

      console.log(`✅ Processed ${overdue.length} overdue maintenance tasks`);
    } catch (error) {
      console.error('Error sending overdue notifications:', error);
    }
  }

  /**
   * Generate maintenance calendar data
   */
  async getMaintenanceCalendar(startDate: Date, endDate: Date): Promise<MaintenanceRecord[]> {
    try {
      const q = query(
        collection(db, this.maintenanceCollection),
        where('scheduledDate', '>=', Timestamp.fromDate(startDate)),
        where('scheduledDate', '<=', Timestamp.fromDate(endDate))
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.convertToMaintenanceRecord(doc));
    } catch (error) {
      console.error('Error getting maintenance calendar:', error);
      return [];
    }
  }

  /**
   * Auto-schedule preventive maintenance based on asset intervals
   */
  async autoSchedulePreventiveMaintenance(assetId: string, userId: string): Promise<void> {
    try {
      const asset = await assetService.getAsset(assetId);
      if (!asset || !asset.maintenanceInterval) return;

      // Check if already scheduled
      const existingRecords = await assetService.getMaintenanceRecords(assetId);
      const hasScheduled = existingRecords.some(r =>
        r.status === 'scheduled' && r.type === 'preventive'
      );

      if (hasScheduled) return;

      // Calculate next maintenance date
      const nextDate = asset.nextMaintenanceDate || new Date();
      nextDate.setDate(nextDate.getDate() + asset.maintenanceInterval);

      const maintenanceRecord: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        assetId: asset.id,
        assetCode: asset.assetCode,
        assetName: asset.name,
        type: 'preventive',
        status: 'scheduled',
        priority: 'medium',
        scheduledDate: nextDate,
        title: `Scheduled Preventive Maintenance - ${asset.name}`,
        description: `Regular preventive maintenance as per ${asset.maintenanceInterval}-day schedule`,
        isRecurring: true,
        recurrencePattern: 'daily',
        recurrenceInterval: asset.maintenanceInterval,
        nextOccurrence: nextDate,
        createdBy: userId
      };

      await assetService.createMaintenanceRecord(maintenanceRecord, userId);
      console.log(`✅ Auto-scheduled preventive maintenance for ${asset.name}`);
    } catch (error) {
      console.error('Error auto-scheduling preventive maintenance:', error);
    }
  }

  /**
   * Check if reminder has been sent for a maintenance task
   */
  private async hasReminderBeenSent(maintenanceId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.remindersCollection),
        where('maintenanceId', '==', maintenanceId)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      return false;
    }
  }

  /**
   * Mark reminder as sent
   */
  private async markReminderSent(maintenanceId: string): Promise<void> {
    try {
      await addDoc(collection(db, this.remindersCollection), {
        maintenanceId,
        sentAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking reminder sent:', error);
    }
  }

  /**
   * Convert Firestore document to MaintenanceRecord
   */
  private convertToMaintenanceRecord(doc: any): MaintenanceRecord {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      scheduledDate: data.scheduledDate?.toDate() || new Date(),
      completedDate: data.completedDate?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      nextOccurrence: data.nextOccurrence?.toDate()
    } as MaintenanceRecord;
  }
}

export const maintenanceAutomationService = new MaintenanceAutomationService();
export default maintenanceAutomationService;
