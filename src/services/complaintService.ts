// src/services/complaintService.ts
// Complaint handling service based on Chinese Smart Park OSS platforms

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Complaint, ComplaintStatus, ComplaintCategory, ResolutionAction } from '../types/complaint';
import { tokenService } from './tokenService';
import { notificationService } from './notificationService';

class ComplaintService {
  private readonly COMPLAINT_COLLECTION = 'complaints';
  private readonly SLA_HOURS = 48; // Service Level Agreement: 48 hours to resolve

  /**
   * Get human-readable resolution message
   */
  private getResolutionMessage(action: ResolutionAction, refundAmount?: number): string {
    switch (action) {
      case 'full-refund':
        return 'Full Refund Issued';
      case 'partial-refund':
        return `Partial Refund Issued (${refundAmount} tokens)`;
      case 'rework-required':
        return 'Rework Required';
      case 'compensation':
        return `Compensation Provided (${refundAmount} tokens)`;
      case 'request-approved':
        return 'Request Approved';
      case 're-evaluate':
        return 'Request Re-evaluation';
      case 'no-action':
        return 'No Action Required';
      default:
        return action;
    }
  }

  /**
   * File a complaint against a completed service request
   */
  async fileComplaint(data: {
    requestId: string;
    requestTitle: string;
    serviceType: string;
    tenantId: string;
    tenantName: string;
    tenantEmail: string;
    operatorId: string;
    operatorName: string;
    category: ComplaintCategory;
    subject: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    evidence: any[];
    originalTokenCost: number;
  }): Promise<{ success: boolean; complaintId?: string; message?: string }> {
    try {
      console.log('📝 Filing complaint...');

      // Check if complaint already exists for this request
      const existingQuery = query(
        collection(db, this.COMPLAINT_COLLECTION),
        where('requestId', '==', data.requestId),
        where('status', 'in', ['pending', 'under-review'])
      );

      const existingComplaints = await getDocs(existingQuery);

      if (!existingComplaints.empty) {
        return {
          success: false,
          message: 'A complaint is already pending for this request.',
        };
      }

      const complaintData = {
        ...data,
        status: 'pending' as ComplaintStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.COMPLAINT_COLLECTION), complaintData);

      console.log('✅ Complaint filed successfully:', docRef.id);

      // Note: In-app notifications for complaint filing could be added here
      // Currently focusing on email notifications for resolution/rejection

      return {
        success: true,
        complaintId: docRef.id,
        message: 'Complaint filed successfully. Admin will review within 48 hours.',
      };
    } catch (error: any) {
      console.error('Error filing complaint:', error);
      return {
        success: false,
        message: error.message || 'Failed to file complaint',
      };
    }
  }

  /**
   * Get complaints for a tenant
   */
  async getTenantComplaints(tenantId: string): Promise<Complaint[]> {
    try {
      // Fetch all complaints and filter in memory to avoid composite index requirement
      const snapshot = await getDocs(collection(db, this.COMPLAINT_COLLECTION));
      const complaints: Complaint[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter for this tenant's complaints
        if (data.tenantId === tenantId) {
          complaints.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            resolvedAt: data.resolvedAt?.toDate(),
          } as Complaint);
        }
      });

      // Sort by createdAt in memory (descending)
      complaints.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return complaints;
    } catch (error) {
      console.error('Error getting tenant complaints:', error);
      return [];
    }
  }

  /**
   * Get all pending complaints (for admin)
   */
  async getPendingComplaints(): Promise<Complaint[]> {
    try {
      // Fetch all complaints and filter in memory to avoid composite index requirement
      const snapshot = await getDocs(collection(db, this.COMPLAINT_COLLECTION));
      const complaints: Complaint[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter for pending and under-review statuses
        if (data.status === 'pending' || data.status === 'under-review') {
          complaints.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Complaint);
        }
      });

      // Sort by createdAt in memory
      complaints.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return complaints;
    } catch (error) {
      console.error('Error getting pending complaints:', error);
      return [];
    }
  }

  /**
   * Update complaint status
   */
  async updateComplaintStatus(
    complaintId: string,
    status: ComplaintStatus,
    adminNotes?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await updateDoc(doc(db, this.COMPLAINT_COLLECTION, complaintId), {
        status,
        adminNotes: adminNotes || '',
        updatedAt: serverTimestamp(),
      });

      console.log(`✅ Complaint status updated to: ${status}`);

      return {
        success: true,
        message: 'Complaint status updated successfully',
      };
    } catch (error: any) {
      console.error('Error updating complaint status:', error);
      return {
        success: false,
        message: error.message || 'Failed to update complaint status',
      };
    }
  }

  /**
   * Resolve complaint with action
   */
  async resolveComplaint(data: {
    complaintId: string;
    action: ResolutionAction;
    resolutionNotes: string;
    refundAmount?: number;
    resolvedBy: string;
    resolvedByName: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🔧 Resolving complaint...');

      // Get complaint details
      const complaintDoc = await getDoc(doc(db, this.COMPLAINT_COLLECTION, data.complaintId));

      if (!complaintDoc.exists()) {
        return {
          success: false,
          message: 'Complaint not found',
        };
      }

      const complaint = complaintDoc.data() as Complaint;

      // Handle request approval for rejected requests
      if (data.action === 'request-approved') {
        // Get the original request
        const requestRef = doc(db, 'serviceRequests', complaint.requestId);
        const requestDoc = await getDoc(requestRef);

        if (requestDoc.exists()) {
          // Approve the previously rejected request
          await updateDoc(requestRef, {
            status: 'approved',
            updatedAt: serverTimestamp(),
            notes: `Request approved after complaint review by ${data.resolvedByName}`,
          });

          console.log(`✅ Request ${complaint.requestId} approved after complaint review`);
        }
      }

      // Handle refund if applicable
      if (data.action === 'full-refund' || data.action === 'partial-refund') {
        const refundAmount =
          data.action === 'full-refund'
            ? complaint.originalTokenCost
            : data.refundAmount || 0;

        if (refundAmount > 0) {
          // Refund tokens to tenant
          const refundResult = await tokenService.creditTokens(
            complaint.tenantId,
            refundAmount,
            'refund',
            `Complaint refund: ${complaint.subject}`,
            data.resolvedBy,
            data.complaintId
          );

          if (!refundResult.success) {
            return {
              success: false,
              message: 'Failed to process refund',
            };
          }

          console.log(`💰 Refunded ${refundAmount} tokens to tenant`);
        }
      }

      // Update complaint
      await updateDoc(doc(db, this.COMPLAINT_COLLECTION, data.complaintId), {
        status: 'resolved',
        resolutionAction: data.action,
        resolutionNotes: data.resolutionNotes,
        refundAmount: data.refundAmount || 0,
        resolvedBy: data.resolvedBy,
        resolvedByName: data.resolvedByName,
        resolvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Complaint resolved successfully');

      // Send email notification to tenant about resolution
      try {
        const resolutionMessage = this.getResolutionMessage(data.action, data.refundAmount);
        await notificationService.sendNotification(
          complaint.tenantEmail,
          complaint.tenantName,
          'complaint_resolved',
          {
            userName: complaint.tenantName,
            complaintSubject: complaint.subject,
            resolutionAction: resolutionMessage,
            resolutionNotes: data.resolutionNotes,
            refundAmount: data.refundAmount,
            requestTitle: complaint.requestTitle,
          },
          'high',
          {
            userId: complaint.tenantId,
            relatedEntityId: data.complaintId,
          }
        );
        console.log('📧 Resolution email sent to tenant:', complaint.tenantEmail);
      } catch (emailError) {
        console.error('Failed to send resolution email to tenant:', emailError);
        // Don't fail the whole operation if email fails
      }

      return {
        success: true,
        message: 'Complaint resolved successfully',
      };
    } catch (error: any) {
      console.error('Error resolving complaint:', error);
      return {
        success: false,
        message: error.message || 'Failed to resolve complaint',
      };
    }
  }

  /**
   * Reject complaint
   */
  async rejectComplaint(data: {
    complaintId: string;
    adminResponse: string;
    resolvedBy: string;
    resolvedByName: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      // Get complaint details
      const complaintDoc = await getDoc(doc(db, this.COMPLAINT_COLLECTION, data.complaintId));

      if (!complaintDoc.exists()) {
        return {
          success: false,
          message: 'Complaint not found',
        };
      }

      const complaint = complaintDoc.data() as Complaint;

      await updateDoc(doc(db, this.COMPLAINT_COLLECTION, data.complaintId), {
        status: 'rejected',
        resolutionAction: 'no-action',
        adminResponse: data.adminResponse,
        resolvedBy: data.resolvedBy,
        resolvedByName: data.resolvedByName,
        resolvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Complaint rejected');

      // Send email notification to tenant about rejection
      try {
        await notificationService.sendNotification(
          complaint.tenantEmail,
          complaint.tenantName,
          'complaint_rejected',
          {
            userName: complaint.tenantName,
            complaintSubject: complaint.subject,
            adminResponse: data.adminResponse,
            requestTitle: complaint.requestTitle,
          },
          'medium',
          {
            userId: complaint.tenantId,
            relatedEntityId: data.complaintId,
          }
        );
        console.log('📧 Rejection email sent to tenant:', complaint.tenantEmail);
      } catch (emailError) {
        console.error('Failed to send rejection email to tenant:', emailError);
        // Don't fail the whole operation if email fails
      }

      return {
        success: true,
        message: 'Complaint rejected',
      };
    } catch (error: any) {
      console.error('Error rejecting complaint:', error);
      return {
        success: false,
        message: error.message || 'Failed to reject complaint',
      };
    }
  }

  /**
   * Get complaint statistics
   */
  async getComplaintStats(): Promise<{
    total: number;
    pending: number;
    underReview: number;
    resolved: number;
    rejected: number;
    averageResolutionTime: number;
  }> {
    try {
      const snapshot = await getDocs(collection(db, this.COMPLAINT_COLLECTION));

      let total = 0;
      let pending = 0;
      let underReview = 0;
      let resolved = 0;
      let rejected = 0;
      let totalResolutionTime = 0;
      let resolvedCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        total++;

        switch (data.status) {
          case 'pending':
            pending++;
            break;
          case 'under-review':
            underReview++;
            break;
          case 'resolved':
            resolved++;
            if (data.createdAt && data.resolvedAt) {
              const created = data.createdAt.toDate();
              const resolvedDate = data.resolvedAt.toDate();
              const hours = (resolvedDate.getTime() - created.getTime()) / (1000 * 60 * 60);
              totalResolutionTime += hours;
              resolvedCount++;
            }
            break;
          case 'rejected':
            rejected++;
            break;
        }
      });

      const averageResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

      return {
        total,
        pending,
        underReview,
        resolved,
        rejected,
        averageResolutionTime,
      };
    } catch (error) {
      console.error('Error getting complaint stats:', error);
      return {
        total: 0,
        pending: 0,
        underReview: 0,
        resolved: 0,
        rejected: 0,
        averageResolutionTime: 0,
      };
    }
  }

  /**
   * Check if request can be complained about
   */
  async canFileComplaint(requestId: string): Promise<{
    canFile: boolean;
    reason?: string;
  }> {
    try {
      // Check if complaint already exists
      const existingQuery = query(
        collection(db, this.COMPLAINT_COLLECTION),
        where('requestId', '==', requestId)
      );

      const existingComplaints = await getDocs(existingQuery);

      if (!existingComplaints.empty) {
        return {
          canFile: false,
          reason: 'A complaint has already been filed for this request',
        };
      }

      // Can complain about completed or rejected requests
      // Completed: Quality issues, incomplete work, etc.
      // Rejected: Unfair rejection, no explanation, etc.

      return {
        canFile: true,
      };
    } catch (error) {
      console.error('Error checking complaint eligibility:', error);
      return {
        canFile: false,
        reason: 'Error checking eligibility',
      };
    }
  }
}

export const complaintService = new ComplaintService();
export default complaintService;
