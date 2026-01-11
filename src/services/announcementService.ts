// src/services/announcementService.ts
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Announcement } from '../types';

export class AnnouncementService {
  static async createAnnouncement(
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent',
    targetAudience: 'all' | 'tenants' | 'operations' | 'admin',
    createdBy: string,
    createdByName: string,
    expiresInDays?: number
  ): Promise<void> {
    try {
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : undefined;

      await addDoc(collection(db, 'announcements'), {
        title,
        message,
        priority,
        targetAudience,
        createdBy,
        createdByName,
        isActive: true,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt || null,
      });

      console.log('📢 Announcement created:', title);
    } catch (error) {
      console.error('❌ Failed to create announcement:', error);
      throw error;
    }
  }

  static async deactivateAnnouncement(announcementId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'announcements', announcementId), {
        isActive: false,
      });
    } catch (error) {
      console.error('❌ Failed to deactivate announcement:', error);
      throw error;
    }
  }
}