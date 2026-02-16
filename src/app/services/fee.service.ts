import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FeeStructure {
  id?: number;
  entityId: number;
  courseId?: number;
  classId?: number;
  sectionId?: number;
  feeName: string;
  feeType: string; // TUITION, EXAM, LAB, LIBRARY, ADMISSION, OTHER
  amount: number;
  isRecurring: boolean;
  recurringPeriod?: string; // MONTHLY, YEARLY, SEMESTER, QUARTERLY
  installmentCount?: number;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  academicYear?: string;
  status: string; // active, inactive, archived
  description?: string;
}

export interface FeeAssignment {
  id?: number;
  entityId: number;
  studentId: number;
  feeStructureId: number;
  courseId?: number;
  classId?: number;
  sectionId?: number;
  totalAmount: number;
  discountAmount?: number;
  discountPercentage?: number;
  scholarshipAmount?: number;
  finalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: string;
  installmentCount?: number;
  currentInstallment?: number;
  status: string; // pending, partial, paid, overdue
  academicYear?: string;
  remarks?: string;
}

export interface FeePayment {
  id?: number;
  entityId: number;
  studentId: number;
  feeAssignmentId: number;
  amount: number;
  paymentDate: string;
  paymentMode: string; // CASH, UPI, CARD, ONLINE_GATEWAY, CHEQUE, BANK_TRANSFER
  transactionId?: string;
  referenceNumber?: string;
  fineAmount?: number;
  fineReason?: string;
  status: string; // completed, pending, failed, refunded
  remarks?: string;
  receiptNumber?: string;
}

export interface FeePolicy {
  id?: number;
  entityId: number;
  lateFineType?: string; // PERCENTAGE, FIXED
  lateFinePercentage?: number;
  lateFineFixedAmount?: number;
  lateFineGracePeriodDays?: number;
  installmentEligibilityPercentage?: number;
  refundPolicy?: string;
  refundAllowed: boolean;
  refundPercentage?: number;
  dueDateReminderDays?: number;
  overdueAlertDays?: number;
  autoAssignFees: boolean;
  financialYearLocked: boolean;
  lockedFinancialYear?: string;
}

export interface Receipt {
  id?: number;
  entityId: number;
  studentId: number;
  feePaymentId: number;
  receiptNumber: string;
  receiptDate: string;
  receiptPdfData?: string;
  receiptPdfUrl?: string;
  status: string; // generated, sent, downloaded
  sentAt?: string;
  sentVia?: string;
  downloadedAt?: string;
}

export interface FinancialDashboard {
  totalCollection: number;
  totalFine: number;
  totalPending: number;
  totalStudents: number;
  paidStudents: number;
  pendingStudents: number;
  overdueCount: number;
  courseCollection: { [key: string]: number };
  classPending: { [key: string]: number };
  fromDate: string;
  toDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeeService {
  // Keeping base URL pattern same as other services (e.g., AssignmentService)
  private apiUrl = 'http://localhost:8080/api/fees';

  constructor(private http: HttpClient) {}

  // ========== FEE STRUCTURE MANAGEMENT ==========
  
  createFeeStructure(feeStructure: FeeStructure, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/structure/create?userId=${userId}`, feeStructure);
  }
  
  updateFeeStructure(id: number, feeStructure: FeeStructure, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/structure/${id}?userId=${userId}`, feeStructure);
  }
  
  deleteFeeStructure(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/structure/${id}`);
  }
  
  getFeeStructures(entityId: number, courseId?: number, classId?: number, sectionId?: number, feeType?: string, status?: string): Observable<any> {
    let params = new HttpParams().set('entityId', entityId.toString());
    if (courseId) params = params.set('courseId', courseId.toString());
    if (classId) params = params.set('classId', classId.toString());
    if (sectionId) params = params.set('sectionId', sectionId.toString());
    if (feeType) params = params.set('feeType', feeType);
    if (status) params = params.set('status', status);
    return this.http.get(`${this.apiUrl}/admin/structure/list`, { params });
  }
  
  getFeeStructureById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/structure/${id}`);
  }

  // ========== STUDENT FEE ASSIGNMENT ==========
  
  assignFeeToStudent(entityId: number, studentId: number, feeStructureId: number, 
                     discountAmount?: number, discountPercentage?: number,
                     scholarshipAmount?: number, academicYear?: string, userId?: number): Observable<any> {
    let params = new HttpParams()
      .set('entityId', entityId.toString())
      .set('studentId', studentId.toString())
      .set('feeStructureId', feeStructureId.toString());
    if (discountAmount) params = params.set('discountAmount', discountAmount.toString());
    if (discountPercentage) params = params.set('discountPercentage', discountPercentage.toString());
    if (scholarshipAmount) params = params.set('scholarshipAmount', scholarshipAmount.toString());
    if (academicYear) params = params.set('academicYear', academicYear);
    if (userId) params = params.set('userId', userId.toString());
    return this.http.post(`${this.apiUrl}/admin/assignment/create`, null, { params });
  }
  
  assignFeesToAllStudents(entityId: number, feeStructureId: number, courseId?: number, 
                          classId?: number, sectionId?: number, academicYear?: string, userId?: number): Observable<any> {
    let params = new HttpParams()
      .set('entityId', entityId.toString())
      .set('feeStructureId', feeStructureId.toString());
    if (courseId) params = params.set('courseId', courseId.toString());
    if (classId) params = params.set('classId', classId.toString());
    if (sectionId) params = params.set('sectionId', sectionId.toString());
    if (academicYear) params = params.set('academicYear', academicYear);
    if (userId) params = params.set('userId', userId.toString());
    return this.http.post(`${this.apiUrl}/admin/assignment/bulk-assign`, null, { params });
  }
  
  getFeeAssignments(entityId: number, studentId?: number, courseId?: number, classId?: number, sectionId?: number, status?: string): Observable<any> {
    let params = new HttpParams().set('entityId', entityId.toString());
    if (studentId) params = params.set('studentId', studentId.toString());
    if (courseId) params = params.set('courseId', courseId.toString());
    if (classId) params = params.set('classId', classId.toString());
    if (sectionId) params = params.set('sectionId', sectionId.toString());
    if (status) params = params.set('status', status);
    return this.http.get(`${this.apiUrl}/admin/assignment/list`, { params });
  }
  
  getFeeAssignmentById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/assignment/${id}`);
  }
  
  updateFeeAssignment(id: number, assignment: Partial<FeeAssignment>, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/assignment/${id}?userId=${userId}`, assignment);
  }
  
  deleteFeeAssignment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/assignment/${id}`);
  }
  
  getOverdueAssignments(entityId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/assignment/overdue`, {
      params: new HttpParams().set('entityId', entityId.toString())
    });
  }

  // ========== PAYMENT TRACKING ==========
  
  recordPayment(entityId: number, studentId: number, feeAssignmentId: number, amount: number,
                paymentDate?: string, paymentMode: string = 'CASH', transactionId?: string,
                referenceNumber?: string, fineAmount?: number, fineReason?: string,
                remarks?: string, userId?: number): Observable<any> {
    let params = new HttpParams()
      .set('entityId', entityId.toString())
      .set('studentId', studentId.toString())
      .set('feeAssignmentId', feeAssignmentId.toString())
      .set('amount', amount.toString())
      .set('paymentMode', paymentMode);
    if (paymentDate) params = params.set('paymentDate', paymentDate);
    if (transactionId) params = params.set('transactionId', transactionId);
    if (referenceNumber) params = params.set('referenceNumber', referenceNumber);
    if (fineAmount) params = params.set('fineAmount', fineAmount.toString());
    if (fineReason) params = params.set('fineReason', fineReason);
    if (remarks) params = params.set('remarks', remarks);
    if (userId) params = params.set('userId', userId.toString());
    return this.http.post(`${this.apiUrl}/admin/payment/create`, null, { params });
  }
  
  getPayments(entityId: number, studentId?: number, status?: string, paymentMode?: string, fromDate?: string, toDate?: string): Observable<any> {
    let params = new HttpParams().set('entityId', entityId.toString());
    if (studentId) params = params.set('studentId', studentId.toString());
    if (status) params = params.set('status', status);
    if (paymentMode) params = params.set('paymentMode', paymentMode);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get(`${this.apiUrl}/admin/payment/list`, { params });
  }
  
  getPaymentById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/payment/${id}`);
  }

  updatePayment(id: number, updates: {
    transactionId?: string;
    referenceNumber?: string;
    status?: string;
    remarks?: string;
    fineAmount?: number;
    fineReason?: string;
    paymentMode?: string;
    paymentDate?: string;
  }): Observable<any> {
    let params = new HttpParams();
    if (updates.transactionId !== undefined) params = params.set('transactionId', updates.transactionId);
    if (updates.referenceNumber !== undefined) params = params.set('referenceNumber', updates.referenceNumber);
    if (updates.status !== undefined) params = params.set('status', updates.status);
    if (updates.remarks !== undefined) params = params.set('remarks', updates.remarks);
    if (updates.fineAmount !== undefined) params = params.set('fineAmount', updates.fineAmount.toString());
    if (updates.fineReason !== undefined) params = params.set('fineReason', updates.fineReason);
    if (updates.paymentMode !== undefined) params = params.set('paymentMode', updates.paymentMode);
    if (updates.paymentDate !== undefined) params = params.set('paymentDate', updates.paymentDate);
    return this.http.put(`${this.apiUrl}/admin/payment/${id}`, null, { params });
  }

  // ========== FINANCIAL DASHBOARD ==========
  
  getFinancialDashboard(entityId: number, fromDate?: string, toDate?: string): Observable<any> {
    let params = new HttpParams().set('entityId', entityId.toString());
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get(`${this.apiUrl}/admin/dashboard`, { params });
  }

  // ========== RECEIPT & INVOICE MANAGEMENT ==========
  
  getReceipts(entityId: number, studentId?: number, status?: string): Observable<any> {
    let params = new HttpParams().set('entityId', entityId.toString());
    if (studentId) params = params.set('studentId', studentId.toString());
    if (status) params = params.set('status', status);
    return this.http.get(`${this.apiUrl}/admin/receipt/list`, { params });
  }
  
  getReceiptByPaymentId(feePaymentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/receipt/payment/${feePaymentId}`);
  }
  
  getReceiptByReceiptNumber(receiptNumber: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/receipt/${receiptNumber}`);
  }
  
  sendReceipt(receiptId: number, sentVia: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/receipt/${receiptId}/send`, null, {
      params: new HttpParams().set('sentVia', sentVia)
    });
  }
  
  markReceiptDownloaded(receiptId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/receipt/${receiptId}/download`, null);
  }

  // ========== FEE POLICIES & RULES ==========
  
  getFeePolicy(entityId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/policy`, {
      params: new HttpParams().set('entityId', entityId.toString())
    });
  }
  
  updateFeePolicy(entityId: number, feePolicy: FeePolicy, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/policy?entityId=${entityId}&userId=${userId}`, feePolicy);
  }
  
  calculateLateFine(assignmentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/policy/calculate-fine`, {
      params: new HttpParams().set('assignmentId', assignmentId.toString())
    });
  }
}
