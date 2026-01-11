// src/types/notification.ts

/**
 * Notification Types for IPDC Platform
 * Supports email notifications for various platform events
 */

export type NotificationType =
  | 'request_created'
  | 'request_assigned'
  | 'request_status_changed'
  | 'request_completed'
  | 'token_low_balance'
  | 'token_allocated'
  | 'announcement'
  | 'maintenance_scheduled'
  | 'system_alert';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  notificationTypes: {
    [K in NotificationType]?: boolean;
  };
  emailDigest: 'immediate' | 'daily' | 'weekly' | 'never';
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // e.g., "22:00"
  quietHoursEnd?: string; // e.g., "08:00"
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailNotification {
  id?: string;
  recipientEmail: string;
  recipientName: string;
  type: NotificationType;
  priority: NotificationPriority;
  subject: string;
  templateData: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  scheduledFor?: Date;
  sentAt?: Date;
  failureReason?: string;
  retryCount: number;
  createdAt: Date;
  metadata?: {
    requestId?: string;
    userId?: string;
    relatedEntityId?: string;
  };
}

export interface EmailTemplate {
  type: NotificationType;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[]; // List of template variables like {{userName}}, {{requestTitle}}, etc.
}

export interface NotificationTrigger {
  event: string;
  notificationType: NotificationType;
  recipientRoles: ('tenant' | 'admin' | 'operations')[];
  enabled: boolean;
  templateId: string;
}

/**
 * Email template data interfaces for type safety
 */

export interface RequestCreatedEmailData {
  userName: string;
  requestTitle: string;
  requestId: string;
  serviceType: string;
  priority: string;
  createdAt: string;
  dashboardUrl: string;
}

export interface RequestStatusChangedEmailData {
  userName: string;
  requestTitle: string;
  requestId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  notes?: string;
  dashboardUrl: string;
}

export interface TokenLowBalanceEmailData {
  userName: string;
  currentBalance: number;
  tier: string;
  tokenUrl: string;
  recommendedTopUp: number;
}

export interface AnnouncementEmailData {
  title: string;
  message: string;
  priority: string;
  createdBy: string;
  createdAt: string;
  platformUrl: string;
}

export type EmailTemplateData =
  | RequestCreatedEmailData
  | RequestStatusChangedEmailData
  | TokenLowBalanceEmailData
  | AnnouncementEmailData
  | Record<string, any>;
