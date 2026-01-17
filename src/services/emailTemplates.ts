// src/services/emailTemplates.ts

import {
  NotificationType,
  RequestCreatedEmailData,
  RequestStatusChangedEmailData,
  TokenLowBalanceEmailData,
  AnnouncementEmailData,
  EmailTemplateData
} from '../types/notification';

/**
 * Email Template Service
 * Provides HTML and text templates for all notification types
 */

class EmailTemplateService {
  /**
   * Get the base HTML wrapper for all emails
   */
  private getBaseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IPDC Platform Notification</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #667eea;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #667eea;
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #667eea;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #5568d3;
    }
    .info-box {
      background-color: #f0f4ff;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-box {
      background-color: #fff4e5;
      border-left: 4px solid #ff9800;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      margin-top: 30px;
      color: #666;
      font-size: 12px;
    }
    .label {
      font-weight: 600;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🏭 IPDC Digital Platform</h1>
      <p style="color: #666; margin: 5px 0 0 0;">Ethiopian Industrial Parks Development Corporation</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>This is an automated notification from the IPDC Digital Platform.</p>
      <p>For support, contact: <a href="mailto:${import.meta.env.VITE_SUPPORT_EMAIL || 'support@ipdc.gov.et'}">${import.meta.env.VITE_SUPPORT_EMAIL || 'support@ipdc.gov.et'}</a></p>
      <p>&copy; ${new Date().getFullYear()} Ethiopian Industrial Parks Development Corporation</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Request Created Template
   */
  getRequestCreatedTemplate(data: RequestCreatedEmailData): { html: string; text: string; subject: string } {
    const content = `
      <h2>New Service Request Created</h2>
      <p>Hello <strong>${data.userName}</strong>,</p>
      <p>Your service request has been successfully created and submitted to the operations team.</p>

      <div class="info-box">
        <p><span class="label">Request ID:</span> ${data.requestId}</p>
        <p><span class="label">Title:</span> ${data.requestTitle}</p>
        <p><span class="label">Service Type:</span> ${data.serviceType}</p>
        <p><span class="label">Priority:</span> ${data.priority}</p>
        <p><span class="label">Created:</span> ${data.createdAt}</p>
      </div>

      <p>Our team will review your request and assign it to the appropriate personnel. You will receive notifications as the status changes.</p>

      <a href="${data.dashboardUrl}" class="button">View Request Details</a>

      <p>Thank you for using the IPDC Digital Platform!</p>
    `;

    const text = `
New Service Request Created

Hello ${data.userName},

Your service request has been successfully created and submitted to the operations team.

Request Details:
- Request ID: ${data.requestId}
- Title: ${data.requestTitle}
- Service Type: ${data.serviceType}
- Priority: ${data.priority}
- Created: ${data.createdAt}

Our team will review your request and assign it to the appropriate personnel. You will receive notifications as the status changes.

View Request: ${data.dashboardUrl}

Thank you for using the IPDC Digital Platform!
    `.trim();

    return {
      html: this.getBaseTemplate(content),
      text,
      subject: `Service Request Created: ${data.requestTitle}`
    };
  }

  /**
   * Admin New Request Notification Template
   */
  getAdminNewRequestTemplate(data: any): { html: string; text: string; subject: string } {
    const priorityColors: Record<string, string> = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#f44336',
      urgent: '#d32f2f'
    };

    const priorityColor = priorityColors[data.priority?.toLowerCase()] || '#ff9800';

    const content = `
      <h2>🔔 New Service Request from Tenant</h2>
      <p>Hello <strong>Admin</strong>,</p>
      <p>A new service request has been submitted by a tenant and requires your attention.</p>

      <div class="info-box" style="background-color: #fff3e0; border-left: 4px solid #ff9800;">
        <p><span class="label">Tenant:</span> <strong>${data.tenantName}</strong></p>
        <p><span class="label">Request ID:</span> ${data.requestId}</p>
        <p><span class="label">Title:</span> ${data.requestTitle}</p>
        <p><span class="label">Service Type:</span> ${data.serviceType}</p>
        <p style="margin: 10px 0;">
          <span class="label">Priority:</span>
          <span style="display: inline-block; padding: 4px 12px; background-color: ${priorityColor}; color: white; border-radius: 12px; margin-left: 8px;">${data.priority?.toUpperCase()}</span>
        </p>
        <p><span class="label">Created:</span> ${data.createdAt}</p>
      </div>

      <p style="margin-top: 20px;">Please review and approve this request from the Admin Dashboard.</p>

      <a href="${data.dashboardUrl}" class="button" style="background-color: #1976d2;">Review Request in Admin Dashboard</a>

      <p style="color: #666; font-size: 14px; margin-top: 20px;">This is an automated notification from the IPDC Digital Platform.</p>
    `;

    const text = `
🔔 New Service Request from Tenant

Hello Admin,

A new service request has been submitted by a tenant and requires your attention.

Request Details:
- Tenant: ${data.tenantName}
- Request ID: ${data.requestId}
- Title: ${data.requestTitle}
- Service Type: ${data.serviceType}
- Priority: ${data.priority?.toUpperCase()}
- Created: ${data.createdAt}

Please review and approve this request from the Admin Dashboard.

Admin Dashboard: ${data.dashboardUrl}

This is an automated notification from the IPDC Digital Platform.
    `.trim();

    return {
      html: this.getBaseTemplate(content),
      text,
      subject: `🔔 New ${data.priority?.toUpperCase()} Priority Request: ${data.requestTitle}`
    };
  }

  /**
   * Admin Task Completed Notification Template
   */
  getAdminTaskCompletedTemplate(data: any): { html: string; text: string; subject: string } {
    const content = `
      <h2>✅ Task Completed by Operations</h2>
      <p>Hello <strong>Admin</strong>,</p>
      <p>A service request has been successfully completed by the Operations team.</p>

      <div class="info-box" style="background-color: #e8f5e9; border-left: 4px solid #4caf50;">
        <p><span class="label">Request:</span> ${data.requestTitle}</p>
        <p><span class="label">Request ID:</span> ${data.requestId}</p>
        <p><span class="label">Tenant:</span> <strong>${data.tenantName}</strong></p>
        <p><span class="label">Completed By:</span> ${data.completedBy}</p>
        <p><span class="label">Completed:</span> ${data.completedAt}</p>
      </div>

      <div class="info-box" style="background-color: #fff3e0; border-left: 4px solid #ff9800; margin-top: 16px;">
        <p><strong>💰 Token Transaction</strong></p>
        <p><span class="label">Tokens Deducted from Tenant:</span> <strong>${data.tokensCost} tokens</strong></p>
      </div>

      <p style="margin-top: 20px;">The tenant has been notified about the completion and token deduction.</p>

      <a href="${data.dashboardUrl}" class="button" style="background-color: #4caf50;">View in Admin Dashboard</a>

      <p style="color: #666; font-size: 14px; margin-top: 20px;">This is an automated notification from the IPDC Digital Platform.</p>
    `;

    const text = `
✅ Task Completed by Operations

Hello Admin,

A service request has been successfully completed by the Operations team.

Request Details:
- Request: ${data.requestTitle}
- Request ID: ${data.requestId}
- Tenant: ${data.tenantName}
- Completed By: ${data.completedBy}
- Completed: ${data.completedAt}

💰 Token Transaction:
- Tokens Deducted from Tenant: ${data.tokensCost} tokens

The tenant has been notified about the completion and token deduction.

Admin Dashboard: ${data.dashboardUrl}

This is an automated notification from the IPDC Digital Platform.
    `.trim();

    return {
      html: this.getBaseTemplate(content),
      text,
      subject: `✅ Task Completed: ${data.requestTitle}`
    };
  }

  /**
   * Request Status Changed Template
   */
  getRequestStatusChangedTemplate(data: RequestStatusChangedEmailData): { html: string; text: string; subject: string } {
    const statusColors: Record<string, string> = {
      pending: '#ff9800',
      assigned: '#2196f3',
      'in-progress': '#9c27b0',
      completed: '#4caf50',
      cancelled: '#f44336'
    };

    const statusColor = statusColors[data.newStatus.toLowerCase()] || '#667eea';

    const content = `
      <h2>Request Status Updated</h2>
      <p>Hello <strong>${data.userName}</strong>,</p>
      <p>The status of your service request has been updated.</p>

      <div class="info-box">
        <p><span class="label">Request:</span> ${data.requestTitle}</p>
        <p><span class="label">Request ID:</span> ${data.requestId}</p>
        <p style="margin: 15px 0;">
          <span class="label">Status Change:</span><br>
          <span style="display: inline-block; padding: 4px 12px; background-color: #e0e0e0; border-radius: 12px; margin: 5px 5px 5px 0;">${data.oldStatus}</span>
          ➔
          <span style="display: inline-block; padding: 4px 12px; background-color: ${statusColor}; color: white; border-radius: 12px; margin: 5px 0 5px 5px;">${data.newStatus}</span>
        </p>
        <p><span class="label">Updated By:</span> ${data.changedBy}</p>
        ${data.notes ? `<p><span class="label">Notes:</span> ${data.notes}</p>` : ''}
      </div>

      ${(data as any).tokensCost ? `
      <div class="info-box" style="background-color: #fff3e0; border-left: 4px solid #ff9800; margin-top: 20px;">
        <p><strong>💰 Token Transaction</strong></p>
        <p><span class="label">Tokens Deducted:</span> ${(data as any).tokensCost} tokens</p>
        <p><span class="label">New Balance:</span> ${(data as any).newBalance} tokens</p>
      </div>
      ` : ''}

      <a href="${data.dashboardUrl}" class="button">View Request Details</a>
    `;

    const text = `
Request Status Updated

Hello ${data.userName},

The status of your service request has been updated.

Request: ${data.requestTitle}
Request ID: ${data.requestId}
Status: ${data.oldStatus} → ${data.newStatus}
Updated By: ${data.changedBy}
${data.notes ? `Notes: ${data.notes}` : ''}

${(data as any).tokensCost ? `💰 Token Transaction:
- Tokens Deducted: ${(data as any).tokensCost}
- New Balance: ${(data as any).newBalance}

` : ''}View Request: ${data.dashboardUrl}
    `.trim();

    return {
      html: this.getBaseTemplate(content),
      text,
      subject: `Request ${data.newStatus}: ${data.requestTitle}`
    };
  }

  /**
   * Token Low Balance Template
   */
  getTokenLowBalanceTemplate(data: TokenLowBalanceEmailData): { html: string; text: string; subject: string } {
    const content = `
      <h2>⚠️ Low Token Balance Alert</h2>
      <p>Hello <strong>${data.userName}</strong>,</p>
      <p>Your token balance is running low. To continue using platform services without interruption, we recommend topping up your account.</p>

      <div class="warning-box">
        <p><span class="label">Current Balance:</span> <strong>${data.currentBalance} tokens</strong></p>
        <p><span class="label">Current Tier:</span> ${data.tier}</p>
        <p><span class="label">Recommended Top-Up:</span> ${data.recommendedTopUp} tokens</p>
      </div>

      <p>Benefits of maintaining a healthy token balance:</p>
      <ul>
        <li>Uninterrupted access to all platform services</li>
        <li>Higher tier benefits and discounts</li>
        <li>Priority processing for requests</li>
      </ul>

      <a href="${data.tokenUrl}" class="button">Manage Token Balance</a>
    `;

    const text = `
⚠️ Low Token Balance Alert

Hello ${data.userName},

Your token balance is running low. To continue using platform services without interruption, we recommend topping up your account.

Current Balance: ${data.currentBalance} tokens
Current Tier: ${data.tier}
Recommended Top-Up: ${data.recommendedTopUp} tokens

Benefits of maintaining a healthy token balance:
- Uninterrupted access to all platform services
- Higher tier benefits and discounts
- Priority processing for requests

Manage Balance: ${data.tokenUrl}
    `.trim();

    return {
      html: this.getBaseTemplate(content),
      text,
      subject: '⚠️ Low Token Balance Alert - IPDC Platform'
    };
  }

  /**
   * Announcement Template
   */
  getAnnouncementTemplate(data: AnnouncementEmailData): { html: string; text: string; subject: string } {
    const priorityIcons: Record<string, string> = {
      low: 'ℹ️',
      medium: '📢',
      high: '⚠️',
      urgent: '🚨'
    };

    const icon = priorityIcons[data.priority.toLowerCase()] || '📢';

    const content = `
      <h2>${icon} ${data.title}</h2>
      <p style="color: #666; font-size: 14px;">
        Posted by <strong>${data.createdBy}</strong> on ${data.createdAt}
      </p>

      <div class="info-box">
        ${data.message}
      </div>

      <a href="${data.platformUrl}" class="button">Go to Platform</a>
    `;

    const text = `
${icon} ${data.title}

Posted by ${data.createdBy} on ${data.createdAt}

${data.message}

Platform: ${data.platformUrl}
    `.trim();

    return {
      html: this.getBaseTemplate(content),
      text,
      subject: `${icon} Announcement: ${data.title}`
    };
  }

  /**
   * Get template by notification type
   */
  getTemplate(type: NotificationType, data: EmailTemplateData): { html: string; text: string; subject: string } {
    switch (type) {
      case 'request_created':
        return this.getRequestCreatedTemplate(data as RequestCreatedEmailData);

      case 'admin_new_request':
        return this.getAdminNewRequestTemplate(data);

      case 'admin_task_completed':
        return this.getAdminTaskCompletedTemplate(data);

      case 'request_status_changed':
      case 'request_completed':
      case 'request_assigned':
        return this.getRequestStatusChangedTemplate(data as RequestStatusChangedEmailData);

      case 'token_low_balance':
      case 'token_allocated':
        return this.getTokenLowBalanceTemplate(data as TokenLowBalanceEmailData);

      case 'announcement':
      case 'system_alert':
        return this.getAnnouncementTemplate(data as AnnouncementEmailData);

      case 'complaint_resolved':
        return this.getComplaintResolvedTemplate(data);

      case 'complaint_rejected':
        return this.getComplaintRejectedTemplate(data);

      default:
        // Fallback generic template
        return this.getGenericTemplate(data);
    }
  }

  /**
   * Generic fallback template
   */
  private getGenericTemplate(data: Record<string, any>): { html: string; text: string; subject: string } {
    const content = `
      <h2>Notification from IPDC Platform</h2>
      <p>You have received a notification from the IPDC Digital Platform.</p>

      <div class="info-box">
        ${Object.entries(data).map(([key, value]) => `
          <p><span class="label">${key}:</span> ${value}</p>
        `).join('')}
      </div>
    `;

    const text = `
Notification from IPDC Platform

${Object.entries(data).map(([key, value]) => `${key}: ${value}`).join('\n')}
    `.trim();

    return {
      html: this.getBaseTemplate(content),
      text,
      subject: 'Notification from IPDC Platform'
    };
  }

  /**
   * Complaint Resolved Template
   */
  private getComplaintResolvedTemplate(data: Record<string, any>): { html: string; text: string; subject: string } {
    const content = `
      <h2>Your Complaint Has Been Resolved</h2>
      <p>Dear ${data.userName},</p>

      <p>Good news! Your complaint has been reviewed and resolved by our admin team.</p>

      <div class="info-box">
        <p><span class="label">Complaint Subject:</span> ${data.complaintSubject}</p>
        <p><span class="label">Related Request:</span> ${data.requestTitle}</p>
        <p><span class="label">Resolution Action:</span> ${data.resolutionAction}</p>
        ${data.refundAmount ? `<p><span class="label">Refund Amount:</span> ${data.refundAmount} tokens</p>` : ''}
      </div>

      <div class="warning-box">
        <p><strong>Resolution Notes:</strong></p>
        <p>${data.resolutionNotes}</p>
      </div>

      <p>Thank you for bringing this matter to our attention. We strive to provide the best service possible.</p>

      <a href="${window.location.origin}/dashboard" class="button">View Dashboard</a>
    `;

    const text = `
Your Complaint Has Been Resolved

Dear ${data.userName},

Good news! Your complaint has been reviewed and resolved by our admin team.

Complaint Subject: ${data.complaintSubject}
Related Request: ${data.requestTitle}
Resolution Action: ${data.resolutionAction}
${data.refundAmount ? `Refund Amount: ${data.refundAmount} tokens` : ''}

Resolution Notes:
${data.resolutionNotes}

Thank you for bringing this matter to our attention. We strive to provide the best service possible.

Visit: ${window.location.origin}/dashboard
    `.trim();

    return {
      html: this.getBaseTemplate(content),
      text,
      subject: `Complaint Resolved: ${data.complaintSubject}`
    };
  }

  /**
   * Complaint Rejected Template
   */
  private getComplaintRejectedTemplate(data: Record<string, any>): { html: string; text: string; subject: string } {
    const content = `
      <h2>Complaint Review Update</h2>
      <p>Dear ${data.userName},</p>

      <p>Thank you for submitting your complaint. After careful review, our admin team has completed the investigation.</p>

      <div class="info-box">
        <p><span class="label">Complaint Subject:</span> ${data.complaintSubject}</p>
        <p><span class="label">Related Request:</span> ${data.requestTitle}</p>
      </div>

      <div class="warning-box">
        <p><strong>Admin Response:</strong></p>
        <p>${data.adminResponse}</p>
      </div>

      <p>If you have additional questions or concerns, please don't hesitate to contact us.</p>

      <a href="${window.location.origin}/dashboard" class="button">View Dashboard</a>
    `;

    const text = `
Complaint Review Update

Dear ${data.userName},

Thank you for submitting your complaint. After careful review, our admin team has completed the investigation.

Complaint Subject: ${data.complaintSubject}
Related Request: ${data.requestTitle}

Admin Response:
${data.adminResponse}

If you have additional questions or concerns, please don't hesitate to contact us.

Visit: ${window.location.origin}/dashboard
    `.trim();

    return {
      html: this.getBaseTemplate(content),
      text,
      subject: `Complaint Review Complete: ${data.complaintSubject}`
    };
  }
}

export const emailTemplateService = new EmailTemplateService();
export default emailTemplateService;
