// src/types/ossServices.ts
/**
 * Ethiopian IPDC One-Stop-Shop (OSS) Service Types
 * Based on current Ethiopian IPDC system services
 */

export type OSSServiceType =
  | 'investment_permit'
  | 'business_license'
  | 'commercial_registration'
  | 'work_permit'
  | 'trade_name_registration'
  | 'agreements'
  | 'tin_issuance'
  | 'notarization'
  | 'customs_exemption'
  | 'customs_clearance'
  | 'banking_services';

export type OSSServiceStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'pending_documents'
  | 'approved'
  | 'rejected'
  | 'issued'
  | 'expired';

export type OSSPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface OSSServiceRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  serviceType: OSSServiceType;
  title: string;
  description: string;
  status: OSSServiceStatus;
  priority: OSSPriority;

  // Applicant information
  companyName: string;
  companyRegNo?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;

  // Service-specific data
  serviceData: Record<string, any>;

  // Document attachments
  documents: OSSDocument[];

  // Workflow tracking
  submittedAt?: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  issuedAt?: Date;
  expiresAt?: Date;

  // Assignment
  assignedTo?: string;
  assignedToName?: string;
  assignedAt?: Date;

  // Comments and notes
  comments: OSSComment[];
  internalNotes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface OSSDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  category: string;
  required: boolean;
  verified: boolean;
}

export interface OSSComment {
  id: string;
  author: string;
  authorName: string;
  authorRole: string;
  message: string;
  createdAt: Date;
  isInternal: boolean;
}

export interface InvestmentPermitData {
  investmentType: 'new' | 'expansion' | 'modernization';
  investmentSector: string;
  investmentCapital: number;
  currency: 'ETB' | 'USD' | 'EUR';
  employmentForeign: number;
  employmentLocal: number;
  projectLocation: string;
  projectDescription: string;
  expectedStartDate: Date;
  implementationPeriod: number; // in months
}

export interface BusinessLicenseData {
  licenseType: 'new' | 'renewal' | 'amendment';
  businessActivity: string;
  businessCategory: string;
  premiseType: 'owned' | 'rented';
  premiseAddress: string;
  numberOfEmployees: number;
  capitalAmount: number;
  previousLicenseNo?: string;
  expiryDate?: Date;
}

export interface CommercialRegistrationData {
  registrationType: 'new' | 'renewal' | 'amendment';
  businessName: string;
  businessType: 'sole_proprietorship' | 'partnership' | 'private_limited' | 'public_limited' | 'cooperative';
  registeredCapital: number;
  numberOfShareholders: number;
  principalActivity: string;
  registeredAddress: string;
  previousRegNo?: string;
}

export interface WorkPermitData {
  permitType: 'new' | 'renewal' | 'replacement';
  employeeName: string;
  employeeNationality: string;
  employeePassportNo: string;
  position: string;
  qualification: string;
  salaryAmount: number;
  contractDuration: number; // in months
  justification: string;
  cvAttached: boolean;
  contractAttached: boolean;
}

export interface TradeNameData {
  proposedName: string;
  alternativeName1?: string;
  alternativeName2?: string;
  businessActivity: string;
  ownerName: string;
  ownerNationality: string;
  nameCheckStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface AgreementData {
  agreementType: 'mou' | 'lease' | 'service' | 'partnership' | 'other';
  partyA: string;
  partyB: string;
  agreementTitle: string;
  agreementValue?: number;
  duration?: number; // in months
  effectiveDate: Date;
  expiryDate?: Date;
  terms: string;
}

export interface TINData {
  applicantType: 'individual' | 'business';
  applicantName: string;
  applicantIdNo: string;
  businessActivity?: string;
  estimatedAnnualIncome?: number;
  registrationReason: string;
}

export interface NotarizationData {
  documentType: 'mou' | 'aoa' | 'contract' | 'power_of_attorney' | 'other';
  documentTitle: string;
  parties: string[];
  witnessRequired: boolean;
  numberOfCopies: number;
  languageRequired: 'amharic' | 'english' | 'both';
}

export interface CustomsExemptionData {
  exemptionType: 'import_duty' | 'vat' | 'both';
  itemDescription: string;
  hsCode: string;
  quantity: number;
  unitOfMeasure: string;
  estimatedValue: number;
  currency: 'ETB' | 'USD' | 'EUR';
  countryOfOrigin: string;
  justification: string;
  investmentPermitNo: string;
}

export interface CustomsClearanceData {
  clearanceType: 'import' | 'export';
  declarationType: 'normal' | 'expedited';
  billOfLadingNo: string;
  invoiceNo: string;
  invoiceValue: number;
  currency: 'ETB' | 'USD' | 'EUR';
  numberOfPackages: number;
  grossWeight: number;
  itemDescription: string;
  hsCode: string;
  portOfEntry: string;
  exemptionApplies: boolean;
  exemptionCertNo?: string;
}

export interface BankingServiceData {
  serviceType: 'account_opening' | 'loan_application' | 'letter_of_credit' | 'currency_exchange' | 'other';
  accountType?: 'current' | 'savings' | 'fixed_deposit';
  loanType?: 'working_capital' | 'term_loan' | 'trade_finance';
  requestedAmount?: number;
  currency: 'ETB' | 'USD' | 'EUR';
  purpose: string;
  additionalDetails: string;
}

// Service type to data type mapping
export type OSSServiceDataType<T extends OSSServiceType> = T extends 'investment_permit'
  ? InvestmentPermitData
  : T extends 'business_license'
  ? BusinessLicenseData
  : T extends 'commercial_registration'
  ? CommercialRegistrationData
  : T extends 'work_permit'
  ? WorkPermitData
  : T extends 'trade_name_registration'
  ? TradeNameData
  : T extends 'agreements'
  ? AgreementData
  : T extends 'tin_issuance'
  ? TINData
  : T extends 'notarization'
  ? NotarizationData
  : T extends 'customs_exemption'
  ? CustomsExemptionData
  : T extends 'customs_clearance'
  ? CustomsClearanceData
  : T extends 'banking_services'
  ? BankingServiceData
  : Record<string, any>;

// Service metadata
export interface OSSServiceMetadata {
  type: OSSServiceType;
  name: string;
  nameAm: string; // Amharic name
  description: string;
  descriptionAm: string;
  category: 'permits' | 'licensing' | 'registration' | 'facilitation' | 'customs' | 'financial';
  processingTime: number; // in days
  fee: number;
  requiredDocuments: string[];
  enabled: boolean;
  icon: string;
}

export const OSS_SERVICE_METADATA: Record<OSSServiceType, OSSServiceMetadata> = {
  investment_permit: {
    type: 'investment_permit',
    name: 'Investment Permit',
    nameAm: 'የኢንቨስትመንት ፈቃድ',
    description: 'Processing & issuance of investment permits for new and existing projects',
    descriptionAm: 'የኢንቨስትመንት ፈቃድ ማቀናበር እና መስጠት',
    category: 'permits',
    processingTime: 15,
    fee: 5000,
    requiredDocuments: [
      'Business plan',
      'Company registration certificate',
      'Proof of capital',
      'Land lease agreement',
      'Environmental impact assessment',
    ],
    enabled: true,
    icon: 'DocumentText',
  },
  business_license: {
    type: 'business_license',
    name: 'Business License',
    nameAm: 'የንግድ ፈቃድ',
    description: 'Issuance and renewal of business operating licenses',
    descriptionAm: 'የንግድ ፈቃድ መስጠት እና እድሳት',
    category: 'licensing',
    processingTime: 10,
    fee: 2000,
    requiredDocuments: [
      'Application form',
      'Commercial registration certificate',
      'TIN certificate',
      'Lease agreement',
      'Previous license (for renewal)',
    ],
    enabled: true,
    icon: 'Briefcase',
  },
  commercial_registration: {
    type: 'commercial_registration',
    name: 'Commercial Registration',
    nameAm: 'የንግድ ምዝገባ',
    description: 'Commercial registration certificates for businesses',
    descriptionAm: 'የንግድ ምዝገባ የምስክር ወረቀት',
    category: 'registration',
    processingTime: 7,
    fee: 1500,
    requiredDocuments: [
      'Memorandum of Association',
      'Articles of Association',
      'ID copies of founders',
      'Proof of capital deposit',
      'Office lease agreement',
    ],
    enabled: true,
    icon: 'Building',
  },
  work_permit: {
    type: 'work_permit',
    name: 'Work Permit',
    nameAm: 'የስራ ፈቃድ',
    description: 'Work permits for foreign employees',
    descriptionAm: 'ለውጭ ሀገር ተቀጣሪዎች የስራ ፈቃድ',
    category: 'permits',
    processingTime: 20,
    fee: 3000,
    requiredDocuments: [
      'Application letter',
      'Employee CV',
      'Employment contract',
      'Passport copy',
      'Educational certificates',
      'Justification letter',
    ],
    enabled: true,
    icon: 'Badge',
  },
  trade_name_registration: {
    type: 'trade_name_registration',
    name: 'Trade Name Registration',
    nameAm: 'የንግድ ስም ምዝገባ',
    description: 'Registration of trade or firm names',
    descriptionAm: 'የንግድ ወይም የድርጅት ስም ምዝገባ',
    category: 'registration',
    processingTime: 3,
    fee: 500,
    requiredDocuments: ['Application form', 'ID copy', 'Name search report', 'Business plan summary'],
    enabled: true,
    icon: 'Tag',
  },
  agreements: {
    type: 'agreements',
    name: 'Agreements',
    nameAm: 'ስምምነቶች',
    description: 'Processing and registration of business agreements',
    descriptionAm: 'የንግድ ስምምነቶች ማዘጋጀት እና ምዝገባ',
    category: 'facilitation',
    processingTime: 5,
    fee: 1000,
    requiredDocuments: ['Draft agreement', 'ID copies of parties', 'Supporting documents'],
    enabled: true,
    icon: 'DocumentCheck',
  },
  tin_issuance: {
    type: 'tin_issuance',
    name: 'TIN Issuance',
    nameAm: 'የግብር ከፋይ መለያ ቁጥር',
    description: 'Tax Identification Number (TIN) issuance',
    descriptionAm: 'የግብር ከፋይ መለያ ቁጥር መስጠት',
    category: 'registration',
    processingTime: 2,
    fee: 0,
    requiredDocuments: ['Application form', 'ID copy', 'Business registration (for businesses)'],
    enabled: true,
    icon: 'Calculator',
  },
  notarization: {
    type: 'notarization',
    name: 'Notarization',
    nameAm: 'ማረጋገጫ',
    description: 'Notarization of MoU, AoA, and other legal documents',
    descriptionAm: 'የማስታወሻ ደብተር፣ የመመስረቻ ደንብ እና ሌሎች ሰነዶች ማረጋገጫ',
    category: 'facilitation',
    processingTime: 1,
    fee: 500,
    requiredDocuments: ['Original documents', 'ID copies of signatories', 'Witness IDs (if required)'],
    enabled: true,
    icon: 'Stamp',
  },
  customs_exemption: {
    type: 'customs_exemption',
    name: 'Customs Duty Exemption',
    nameAm: 'ከጉምሩክ ነፃነት',
    description: 'Customs duty exemption certificates',
    descriptionAm: 'የጉምሩክ ቀረጥ ነፃነት የምስክር ወረቀት',
    category: 'customs',
    processingTime: 10,
    fee: 0,
    requiredDocuments: [
      'Investment permit',
      'Proforma invoice',
      'Import list',
      'Project document',
      'Company registration',
    ],
    enabled: true,
    icon: 'ShieldCheck',
  },
  customs_clearance: {
    type: 'customs_clearance',
    name: 'Customs Clearance',
    nameAm: 'የጉምሩክ መልቀቂያ',
    description: 'Customs clearance services in industrial parks',
    descriptionAm: 'በኢንዱስትሪ ፓርኮች ውስጥ የጉምሩክ መልቀቂያ አገልግሎት',
    category: 'customs',
    processingTime: 5,
    fee: 1000,
    requiredDocuments: [
      'Bill of lading',
      'Commercial invoice',
      'Packing list',
      'Import declaration',
      'Exemption certificate (if applicable)',
    ],
    enabled: true,
    icon: 'Truck',
  },
  banking_services: {
    type: 'banking_services',
    name: 'Banking Services',
    nameAm: 'የባንክ አገልግሎቶች',
    description: 'Banking and financial services facilitation',
    descriptionAm: 'የባንክ እና የፋይናንስ አገልግሎቶች አመቻቸት',
    category: 'financial',
    processingTime: 7,
    fee: 0,
    requiredDocuments: [
      'Application form',
      'Company documents',
      'Financial statements',
      'Business plan (for loans)',
    ],
    enabled: true,
    icon: 'CurrencyDollar',
  },
};
