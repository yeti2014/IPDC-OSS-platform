// src/services/notificationService.ts

import emailjs from '@emailjs/browser';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  NotificationType,
  EmailNotification,
  NotificationPreferences,
  NotificationPriority,
  EmailTemplateData
} from '../types/notification';
import { emailTemplateService } from './emailTemplates';

/**
 * Notification Service
 * Handles all email notifications for the IPDC platform
 * Uses EmailJS for sending emails (free tier available)
 */

class NotificationService {
  private serviceId: string;
  private publicKey: string;
  private initialized: boolean = false;

  constructor() {
    this.serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    this.publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

    // Initialize EmailJS
    if (this.serviceId && this.publicKey) {
      emailjs.init(this.publicKey);
      this.initialized = true;
      console.log('✅ Email notification service initialized');
    } else {
      console.warn('⚠️  Email service not configured. Set VITE_EMAILJS_* environment variables.');
    }
  }

  /**
   * Check if notification service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create in-app notification for notification bell
   */
  private async createInAppNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error',
    requestId?: string
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        read: false,
        relatedRequestId: requestId,
        createdAt: serverTimestamp()
      });
      console.log(`🔔 In-app notification created for user ${userId}`);
    } catch (error) {
      console.error('Error creating in-app notification:', error);
    }
  }

  /**
   * Send an email notification
   */
  async sendNotification(
    recipientEmail: string,
    recipientName: string,
    type: NotificationType,
    templateData: EmailTemplateData,
    priority: NotificationPriority = 'medium',
    metadata?: { requestId?: string; userId?: string; relatedEntityId?: string }
  ): Promise<{ success: boolean; message: string; notificationId?: string }> {
    try {
      // Check if user wants this notification
      if (metadata?.userId) {
        const preferences = await this.getUserPreferences(metadata.userId);
        if (!this.shouldSendNotification(preferences, type)) {
          console.log(`🔕 Notification skipped based on user preferences: ${type}`);
          return { success: true, message: 'Notification skipped based on preferences' };
        }
      }

      // Get email template
      const template = emailTemplateService.getTemplate(type, templateData);

      // Create IN-APP NOTIFICATION for notification bell
      if (metadata?.userId) {
        let notifType: 'info' | 'success' | 'warning' | 'error' = 'info';
        if (type.includes('approved') || type.includes('completed')) notifType = 'success';
        if (type.includes('rejected')) notifType = 'error';
        if (type.includes('warning') || type.includes('low')) notifType = 'warning';

        await this.createInAppNotification(
          metadata.userId,
          template.subject,
          template.text.substring(0, 200), // First 200 chars for preview
          notifType,
          metadata.requestId
        );
      }

      // Create notification record
      const notificationData: Omit<EmailNotification, 'id'> = {
        recipientEmail,
        recipientName,
        type,
        priority,
        subject: template.subject,
        templateData,
        status: 'pending',
        retryCount: 0,
        createdAt: new Date(),
        metadata
      };

      // Save to Firestore
      const notificationRef = await addDoc(
        collection(db, 'emailNotifications'),
        {
          ...notificationData,
          createdAt: serverTimestamp()
        }
      );

      // Send email if service is initialized
      if (this.initialized) {
        try {
          await this.sendEmailViaEmailJS(
            recipientEmail,
            recipientName,
            template.subject,
            template.html,
            template.text
          );

          // Update status to sent
          await updateDoc(doc(db, 'emailNotifications', notificationRef.id), {
            status: 'sent',
            sentAt: serverTimestamp()
          });

          console.log(`✅ Email sent to ${recipientEmail}: ${template.subject}`);

          return {
            success: true,
            message: 'Notification sent successfully',
            notificationId: notificationRef.id
          };
        } catch (emailError: any) {
          console.error('Email sending error:', emailError);

          // Update status to failed
          await updateDoc(doc(db, 'emailNotifications', notificationRef.id), {
            status: 'failed',
            failureReason: emailError.message || 'Unknown error'
          });

          return {
            success: false,
            message: `Failed to send email: ${emailError.message}`,
            notificationId: notificationRef.id
          };
        }
      } else {
        console.log(`📧 Email would be sent to ${recipientEmail}: ${template.subject}`);
        console.log('(Email service not configured - notification logged only)');

        return {
          success: true,
          message: 'Notification logged (email service not configured)',
          notificationId: notificationRef.id
        };
      }
    } catch (error: any) {
      console.error('Notification error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send notification'
      };
    }
  }

  /**
   * Send email via EmailJS
   */
  private async sendEmailViaEmailJS(
    toEmail: string,
    toName: string,
    subject: string,
    htmlContent: string,
    textContent: string
  ): Promise<void> {
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      subject: subject,
      html_content: htmlContent,
      text_content: textContent,
      from_name: 'IPDC Digital Platform',
      from_email: import.meta.env.VITE_NOTIFICATIONS_FROM_EMAIL || 'noreply@ipdc.gov.et'
    };

    // Note: You need to create a template in EmailJS with these variable names
    // Template ID should be set in environment variables
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_default';

    await emailjs.send(this.serviceId, templateId, templateParams);
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const docRef = doc(db, 'notificationPreferences', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          userId,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as NotificationPreferences;
      }

      // Return default preferences
      return this.getDefaultPreferences(userId);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const docRef = doc(db, 'notificationPreferences', userId);

      const updateData = {
        ...preferences,
        userId,
        updatedAt: serverTimestamp()
      };

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, updateData);
      } else {
        await setDoc(docRef, {
          ...this.getDefaultPreferences(userId),
          ...updateData,
          createdAt: serverTimestamp()
        });
      }

      return { success: true, message: 'Preferences updated successfully' };
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get default notification preferences
   */
  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      emailNotifications: true,
      notificationTypes: {
        request_created: true,
        request_assigned: true,
        request_status_changed: true,
        request_completed: true,
        token_low_balance: true,
        token_allocated: true,
        announcement: true,
        maintenance_scheduled: true,
        system_alert: true
      },
      emailDigest: 'immediate',
      quietHoursEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Check if notification should be sent based on user preferences
   */
  private shouldSendNotification(
    preferences: NotificationPreferences | null,
    type: NotificationType
  ): boolean {
    if (!preferences) return true;

    // Check if email notifications are enabled
    if (!preferences.emailNotifications) return false;

    // Check if this specific notification type is enabled
    if (preferences.notificationTypes[type] === false) return false;

    // Check quiet hours
    if (preferences.quietHoursEnabled && preferences.quietHoursStart && preferences.quietHoursEnd) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const [startHour, startMinute] = preferences.quietHoursStart.split(':').map(Number);
      const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number);

      const quietStart = startHour * 60 + startMinute;
      const quietEnd = endHour * 60 + endMinute;

      // Handle overnight quiet hours (e.g., 22:00 to 08:00)
      if (quietStart > quietEnd) {
        if (currentTime >= quietStart || currentTime <= quietEnd) {
          return false; // In quiet hours
        }
      } else {
        if (currentTime >= quietStart && currentTime <= quietEnd) {
          return false; // In quiet hours
        }
      }
    }

    return true;
  }

  /**
   * Notification trigger helpers - convenience methods for common notifications
   */

  async notifyRequestCreated(
    userId: string,
    userEmail: string,
    userName: string,
    requestId: string,
    requestTitle: string,
    serviceType: string,
    priority: string
  ): Promise<void> {
    await this.sendNotification(
      userEmail,
      userName,
      'request_created',
      {
        userName,
        requestTitle,
        requestId,
        serviceType,
        priority,
        createdAt: new Date().toLocaleString(),
        dashboardUrl: `${window.location.origin}/dashboard`
      },
      'medium',
      { userId, requestId }
    );
  }

  /**
   * Notify admin about new service request from tenant
   */
  async notifyAdminNewRequest(
    tenantName: string,
    requestId: string,
    requestTitle: string,
    serviceType: string,
    priority: string
  ): Promise<void> {
    // Send in-app notification to admin (userId: 'admin' is a placeholder - adjust based on your admin setup)
    await this.sendNotification(
      import.meta.env.VITE_ADMIN_EMAIL || 'admin@ipdc.gov.et',
      'IPDC Admin',
      'admin_new_request',
      {
        tenantName,
        requestTitle,
        requestId,
        serviceType,
        priority,
        createdAt: new Date().toLocaleString(),
        dashboardUrl: `${window.location.origin}/admin`
      },
      'high',
      { userId: 'admin', requestId }
    );
  }

  async notifyRequestStatusChanged(
    userId: string,
    userEmail: string,
    userName: string,
    requestId: string,
    requestTitle: string,
    oldStatus: string,
    newStatus: string,
    changedBy: string,
    notes?: string,
    tokenInfo?: { cost: number; newBalance: number }
  ): Promise<void> {
    const priority: NotificationPriority = newStatus === 'completed' ? 'high' : 'medium';

    // Build template data, only include notes if provided
    const templateData: any = {
      userName,
      requestTitle,
      requestId,
      oldStatus,
      newStatus,
      changedBy,
      dashboardUrl: `${window.location.origin}/dashboard`
    };

    // Only add notes if it's defined
    if (notes !== undefined) {
      templateData.notes = notes;
    }

    // Add token information for completed requests
    if (tokenInfo) {
      templateData.tokensCost = tokenInfo.cost;
      templateData.newBalance = tokenInfo.newBalance;
    }

    await this.sendNotification(
      userEmail,
      userName,
      'request_status_changed',
      templateData,
      priority,
      { userId, requestId }
    );
  }

  async notifyLowTokenBalance(
    userId: string,
    userEmail: string,
    userName: string,
    currentBalance: number,
    tier: string
  ): Promise<void> {
    const recommendedTopUp = Math.max(1000 - currentBalance, 500);

    await this.sendNotification(
      userEmail,
      userName,
      'token_low_balance',
      {
        userName,
        currentBalance,
        tier,
        recommendedTopUp,
        tokenUrl: `${window.location.origin}/dashboard?tab=tokens`
      },
      'high',
      { userId }
    );
  }

  async notifyAnnouncement(
    recipients: Array<{ email: string; name: string; userId: string }>,
    title: string,
    message: string,
    priority: NotificationPriority,
    createdBy: string
  ): Promise<void> {
    const promises = recipients.map(recipient =>
      this.sendNotification(
        recipient.email,
        recipient.name,
        'announcement',
        {
          title,
          message,
          priority,
          createdBy,
          createdAt: new Date().toLocaleString(),
          platformUrl: window.location.origin
        },
        priority,
        { userId: recipient.userId }
      )
    );

    await Promise.all(promises);
  }

  /**
   * Retry failed notifications
   */
  async retryFailedNotifications(maxRetries: number = 3): Promise<number> {
    try {
      const q = query(
        collection(db, 'emailNotifications'),
        where('status', '==', 'failed'),
        where('retryCount', '<', maxRetries)
      );

      const snapshot = await getDocs(q);
      let retriedCount = 0;

      for (const docSnap of snapshot.docs) {
        const notification = docSnap.data() as EmailNotification;

        await this.sendNotification(
          notification.recipientEmail,
          notification.recipientName,
          notification.type,
          notification.templateData,
          notification.priority,
          notification.metadata
        );

        // Update retry count
        await updateDoc(doc(db, 'emailNotifications', docSnap.id), {
          retryCount: notification.retryCount + 1
        });

        retriedCount++;
      }

      console.log(`♻️  Retried ${retriedCount} failed notifications`);
      return retriedCount;
    } catch (error) {
      console.error('Error retrying failed notifications:', error);
      return 0;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
