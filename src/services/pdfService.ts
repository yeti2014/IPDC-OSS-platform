// src/services/pdfService.ts

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * PDF Generation Service
 * Generates PDF documents for service requests, analytics reports, and invoices
 */

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface ServiceRequest {
  id?: string;
  title: string;
  description: string;
  serviceType: string;
  priority: string;
  status: string;
  location: string;
  tenantName: string;
  tenantEmail: string;
  tokenCost: number;
  createdAt: Date | any;
  updatedAt: Date | any;
  notes?: string;
  assignedTo?: string;
  attachments?: Array<{
    fileName: string;
    url: string;
  }>;
}

interface AnalyticsData {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completionRate: number;
  avgCompletionTime: string;
  tokensSpent: number;
  requestsByType: Record<string, number>;
  requestsByPriority: Record<string, number>;
  timeRange: string;
}

interface Invoice {
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  tenant: {
    name: string;
    email: string;
    companyName?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

class PDFService {
  private readonly primaryColor = [102, 126, 234]; // #667eea
  private readonly secondaryColor = [118, 75, 162]; // #764ba2

  /**
   * Add header to PDF
   */
  private addHeader(doc: jsPDF, title: string): void {
    // Add logo/title
    doc.setFillColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('🏭 IPDC Digital Platform', 15, 15);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Ethiopian Industrial Parks Development Corporation', 15, 22);

    // Add title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, 45);
  }

  /**
   * Add footer to PDF
   */
  private addFooter(doc: jsPDF, pageNumber: number): void {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'normal');

    // Footer text
    doc.text(
      `Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`,
      15,
      pageHeight - 10
    );

    // Page number
    doc.text(
      `Page ${pageNumber}`,
      pageWidth - 30,
      pageHeight - 10
    );
  }

  /**
   * Generate Service Request PDF
   */
  generateRequestPDF(request: ServiceRequest): void {
    const doc = new jsPDF();

    // Add header
    this.addHeader(doc, 'Service Request Details');

    // Request details section
    let yPos = 60;

    // Request ID and Status
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Request Information', 15, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const requestInfo = [
      ['Request ID:', request.id || 'N/A'],
      ['Title:', request.title],
      ['Service Type:', request.serviceType.toUpperCase()],
      ['Priority:', request.priority.toUpperCase()],
      ['Status:', request.status.toUpperCase()],
      ['Location:', request.location || 'N/A'],
      ['Token Cost:', `${request.tokenCost} tokens`],
      ['Created:', format(this.toDate(request.createdAt), 'MMM dd, yyyy HH:mm')],
      ['Last Updated:', format(this.toDate(request.updatedAt), 'MMM dd, yyyy HH:mm')]
    ];

    if (request.assignedTo) {
      requestInfo.push(['Assigned To:', request.assignedTo]);
    }

    requestInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 60, yPos);
      yPos += 7;
    });

    // Tenant Information
    yPos += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Tenant Information', 15, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.setFont('helvetica', 'bold');
    doc.text('Name:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(request.tenantName, 60, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(request.tenantEmail, 60, yPos);
    yPos += 10;

    // Description
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 15, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const descLines = doc.splitTextToSize(request.description, 180);
    doc.text(descLines, 15, yPos);
    yPos += descLines.length * 5 + 10;

    // Notes (if any)
    if (request.notes) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', 15, yPos);

      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const notesLines = doc.splitTextToSize(request.notes, 180);
      doc.text(notesLines, 15, yPos);
      yPos += notesLines.length * 5 + 10;
    }

    // Attachments (if any)
    if (request.attachments && request.attachments.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Attachments', 15, yPos);

      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      request.attachments.forEach((attachment, index) => {
        doc.text(`${index + 1}. ${attachment.fileName}`, 15, yPos);
        yPos += 7;
      });
    }

    // Add footer
    this.addFooter(doc, 1);

    // Download PDF
    const filename = `service-request-${request.id || 'draft'}-${format(new Date(), 'yyyyMMdd')}.pdf`;
    doc.save(filename);

    console.log('✅ Service request PDF generated:', filename);
  }

  /**
   * Generate Analytics Report PDF
   */
  generateAnalyticsReportPDF(data: AnalyticsData): void {
    const doc = new jsPDF();

    // Add header
    this.addHeader(doc, 'Analytics Report');

    let yPos = 60;

    // Report period
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Period: ${data.timeRange}`, 15, yPos);

    yPos += 15;

    // Key Metrics Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Key Performance Indicators', 15, yPos);

    yPos += 10;

    // KPI Cards as table
    const kpiData = [
      ['Total Requests', data.totalRequests.toString()],
      ['Completed Requests', data.completedRequests.toString()],
      ['Pending Requests', data.pendingRequests.toString()],
      ['In Progress', data.inProgressRequests.toString()],
      ['Completion Rate', `${data.completionRate}%`],
      ['Avg. Completion Time', data.avgCompletionTime],
      ['Total Tokens Spent', `${data.tokensSpent} tokens`]
    ];

    doc.autoTable({
      startY: yPos,
      head: [['Metric', 'Value']],
      body: kpiData,
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        fontSize: 11,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { halign: 'right', cellWidth: 60 }
      }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Requests by Service Type
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Requests by Service Type', 15, yPos);

    yPos += 10;

    const serviceTypeData = Object.entries(data.requestsByType).map(([type, count]) => [
      type.toUpperCase(),
      count.toString(),
      `${((count / data.totalRequests) * 100).toFixed(1)}%`
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Service Type', 'Count', 'Percentage']],
      body: serviceTypeData,
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        fontSize: 11,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' }
      }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Requests by Priority
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Requests by Priority', 15, yPos);

    yPos += 10;

    const priorityData = Object.entries(data.requestsByPriority).map(([priority, count]) => [
      priority.toUpperCase(),
      count.toString(),
      `${((count / data.totalRequests) * 100).toFixed(1)}%`
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Priority', 'Count', 'Percentage']],
      body: priorityData,
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        fontSize: 11,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' }
      }
    });

    // Add footer
    this.addFooter(doc, 1);

    // Download PDF
    const filename = `analytics-report-${format(new Date(), 'yyyyMMdd-HHmmss')}.pdf`;
    doc.save(filename);

    console.log('✅ Analytics report PDF generated:', filename);
  }

  /**
   * Generate Invoice PDF
   */
  generateInvoicePDF(invoice: Invoice): void {
    const doc = new jsPDF();

    // Add header
    this.addHeader(doc, 'INVOICE');

    let yPos = 60;

    // Invoice details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Number:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoiceNumber, 60, yPos);

    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(format(invoice.date, 'MMM dd, yyyy'), 60, yPos);

    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(format(invoice.dueDate, 'MMM dd, yyyy'), 60, yPos);

    yPos += 15;

    // Bill to section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.tenant.name, 15, yPos);
    yPos += 6;
    if (invoice.tenant.companyName) {
      doc.text(invoice.tenant.companyName, 15, yPos);
      yPos += 6;
    }
    doc.text(invoice.tenant.email, 15, yPos);

    yPos += 15;

    // Items table
    const itemsData = invoice.items.map(item => [
      item.description,
      item.quantity.toString(),
      `${item.unitPrice} tokens`,
      `${item.total} tokens`
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Description', 'Quantity', 'Unit Price', 'Total']],
      body: itemsData,
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        fontSize: 11,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10
      },
      columnStyles: {
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35 }
      }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Totals
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', pageWidth - 80, yPos);
    doc.text(`${invoice.subtotal} tokens`, pageWidth - 15, yPos, { align: 'right' });

    yPos += 7;
    doc.text('Tax (0%):', pageWidth - 80, yPos);
    doc.text(`${invoice.tax} tokens`, pageWidth - 15, yPos, { align: 'right' });

    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', pageWidth - 80, yPos);
    doc.text(`${invoice.total} tokens`, pageWidth - 15, yPos, { align: 'right' });

    // Notes
    if (invoice.notes) {
      yPos += 20;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', 15, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      const notesLines = doc.splitTextToSize(invoice.notes, 180);
      doc.text(notesLines, 15, yPos);
    }

    // Add footer
    this.addFooter(doc, 1);

    // Download PDF
    const filename = `invoice-${invoice.invoiceNumber}-${format(new Date(), 'yyyyMMdd')}.pdf`;
    doc.save(filename);

    console.log('✅ Invoice PDF generated:', filename);
  }

  /**
   * Generate invoice PDF from billing system
   */
  generateInvoice(invoice: any): void {
    const doc = new jsPDF();

    // Add header
    this.addHeader(doc, 'TAX INVOICE');

    let yPos = 60;

    // Invoice details (left side)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Number:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoiceNumber, 60, yPos);

    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Issue Date:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(format(this.toDate(invoice.issueDate), 'MMM dd, yyyy'), 60, yPos);

    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(format(this.toDate(invoice.dueDate), 'MMM dd, yyyy'), 60, yPos);

    if (invoice.paidDate) {
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('Paid Date:', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(format(this.toDate(invoice.paidDate), 'MMM dd, yyyy'), 60, yPos);
    }

    yPos += 15;

    // Bill to section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.userName, 15, yPos);
    yPos += 6;
    if (invoice.userCompany) {
      doc.text(invoice.userCompany, 15, yPos);
      yPos += 6;
    }
    doc.text(invoice.userEmail, 15, yPos);
    yPos += 6;

    // Billing address
    if (invoice.billingAddress) {
      doc.text(invoice.billingAddress.street || '', 15, yPos);
      yPos += 6;
      doc.text(`${invoice.billingAddress.city || ''}, ${invoice.billingAddress.state || ''}`, 15, yPos);
      yPos += 6;
      doc.text(`${invoice.billingAddress.postalCode || ''}, ${invoice.billingAddress.country || ''}`, 15, yPos);
    }

    yPos += 15;

    // Items table
    const itemsData = invoice.items.map((item: any) => [
      item.description,
      item.quantity.toString(),
      `$${item.unitPrice.toFixed(2)}`,
      `$${item.amount.toFixed(2)}`
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Description', 'Quantity', 'Unit Price', 'Amount']],
      body: itemsData,
      theme: 'striped',
      headStyles: {
        fillColor: this.primaryColor,
        fontSize: 11,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10
      },
      columnStyles: {
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35 }
      }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Totals
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', pageWidth - 80, yPos);
    doc.text(`$${invoice.subtotal.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });

    yPos += 7;
    doc.text(`Tax (${invoice.taxRate}% VAT):`, pageWidth - 80, yPos);
    doc.text(`$${invoice.taxAmount.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });

    if (invoice.discount > 0) {
      yPos += 7;
      doc.text('Discount:', pageWidth - 80, yPos);
      doc.text(`-$${invoice.discount.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });
    }

    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', pageWidth - 80, yPos);
    doc.text(`$${invoice.total.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });

    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Amount Paid:', pageWidth - 80, yPos);
    doc.text(`$${invoice.amountPaid.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });

    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Amount Due:', pageWidth - 80, yPos);
    doc.text(`$${invoice.amountDue.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });

    // Payment method
    if (invoice.paymentMethod) {
      yPos += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Method:', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.paymentMethod.replace('-', ' ').toUpperCase(), 70, yPos);
    }

    // Terms
    if (invoice.terms) {
      yPos += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Terms & Conditions:', 15, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitTerms = doc.splitTextToSize(invoice.terms, pageWidth - 30);
      doc.text(splitTerms, 15, yPos);
    }

    // Footer
    this.addFooter(doc);

    // Download PDF
    const filename = `invoice-${invoice.invoiceNumber}-${format(new Date(), 'yyyyMMdd')}.pdf`;
    doc.save(filename);

    console.log('✅ Invoice PDF generated:', filename);
  }

  /**
   * Convert Firestore Timestamp to Date
   */
  private toDate(timestamp: any): Date {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  }
}

export const pdfService = new PDFService();
export default pdfService;
