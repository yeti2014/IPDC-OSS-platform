// src/types/complaint.ts

export type ComplaintStatus = 'pending' | 'under-review' | 'resolved' | 'rejected';

export type ComplaintCategory =
  | 'quality-issue'
  | 'incomplete-work'
  | 'delayed-service'
  | 'wrong-service'
  | 'damage-caused'
  | 'unfair-rejection'
  | 'incorrect-assessment'
  | 'no-explanation'
  | 'other';

export type ResolutionAction =
  | 'full-refund'
  | 'partial-refund'
  | 'rework-required'
  | 'no-action'
  | 'compensation'
  | 'request-approved'
  | 're-evaluate';

export interface Complaint {
  id: string;
  requestId: string;
  requestTitle: string;
  serviceType: string;

  // Complainant (Tenant)
  tenantId: string;
  tenantName: string;
  tenantEmail: string;

  // Complaint Details
  category: ComplaintCategory;
  subject: string;
  description: string;
  evidence: ComplaintEvidence[];
  severity: 'low' | 'medium' | 'high' | 'critical';

  // Status
  status: ComplaintStatus;

  // Operator who completed the work
  operatorId: string;
  operatorName: string;

  // Original service cost
  originalTokenCost: number;

  // Resolution
  resolutionAction?: ResolutionAction;
  resolutionNotes?: string;
  refundAmount?: number;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: Date;

  // Admin response
  adminNotes?: string;
  adminResponse?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplaintEvidence {
  type: 'image' | 'document' | 'video';
  url: string;
  fileName: string;
  description?: string;
  uploadedAt: Date;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  underReview: number;
  resolved: number;
  rejected: number;
  averageResolutionTime: number; // in hours
}
