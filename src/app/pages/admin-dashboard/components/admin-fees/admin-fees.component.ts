import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Entity } from '../../../../services/entity.service';
import { Course, ClassEntity, Section } from '../../../../services/subject.service';
import { Student } from '../../../../services/student.service';
import { FeeService, FeeStructure, FeeAssignment, FeePayment, FeePolicy, Receipt, FinancialDashboard } from '../../../../services/fee.service';
import { SubjectService } from '../../../../services/subject.service';
import { StudentService } from '../../../../services/student.service';
import { AuthService } from '../../../../services/auth.service';
import { FeeStructureModalComponent } from '../../../../components/fee-structure-modal/fee-structure-modal.component';
import { FeeAssignmentModalComponent } from '../../../../components/fee-assignment-modal/fee-assignment-modal.component';

@Component({
  selector: 'app-admin-fees',
  standalone: true,
  imports: [CommonModule, FormsModule, FeeStructureModalComponent, FeeAssignmentModalComponent],
  templateUrl: './admin-fees.component.html',
  styleUrls: ['./admin-fees.component.css']
})
export class AdminFeesComponent implements OnInit {
  @Input() entity!: Entity;
  @Input() courses: Course[] = [];
  @Input() students: Student[] = [];
  
  @Output() showSnackbar = new EventEmitter<{ message: string; type: 'success' | 'error' }>();

  feesSubTab: 'structure' | 'assignment' | 'payment' | 'dashboard' | 'receipt' | 'policy' = 'structure';
  
  // Fee Structure
  feeStructures: FeeStructure[] = [];
  isLoadingFeeStructures = false;
  showFeeStructureFilters = false;
  feeStructureFilters: any = {
    courseId: '',
    classId: '',
    sectionId: '',
    feeType: '',
    status: ''
  };
  feeStructureFilterClasses: ClassEntity[] = [];
  feeStructureFilterSections: Section[] = [];
  feeStructureForm: Partial<FeeStructure> = {};
  showFeeStructureModal = false;
  isEditingFeeStructure = false;
  isViewingFeeStructure = false;
  selectedFeeStructure: FeeStructure | null = null;

  // Fee Assignment
  feeAssignments: FeeAssignment[] = [];
  feeAssignmentsForPayment: FeeAssignment[] = []; // Unfiltered list for payment modal dropdown
  isLoadingFeeAssignments = false;
  showFeeAssignmentFilters = false;
  feeAssignmentFilters: any = {
    studentName: '',
    courseId: '',
    classId: '',
    sectionId: '',
    status: ''
  };
  feeAssignmentFilterClasses: ClassEntity[] = [];
  feeAssignmentFilterSections: Section[] = [];
  feeAssignmentForm: Partial<FeeAssignment> = {};
  showFeeAssignmentModal = false;
  showFeeAssignmentViewModal = false;
  isEditingFeeAssignment = false;
  isViewingFeeAssignment = false;
  selectedFeeAssignment: FeeAssignment | null = null;

  // Payments
  feePayments: FeePayment[] = [];
  isLoadingFeePayments = false;
  showFeePaymentFilters = false;
  feePaymentFilters: any = {
    studentName: '',
    paymentMode: '',
    status: '',
    fromDate: '',
    toDate: ''
  };
  feePaymentForm: Partial<FeePayment> = {};
  showFeePaymentModal = false;
  isEditingFeePayment = false;
  isViewingFeePayment = false;
  selectedFeePayment: FeePayment | null = null;

  // Financial Dashboard
  financialDashboard: FinancialDashboard | null = null;
  isLoadingFinancialDashboard = false;
  financialDashboardFilters: any = {
    fromDate: '',
    toDate: ''
  };

  // Receipts
  receipts: Receipt[] = [];
  isLoadingReceipts = false;
  showReceiptFilters = false;
  showReceiptViewModal = false;
  selectedReceipt: Receipt | null = null;
  receiptFilters: any = {
    studentName: '',
    status: ''
  };

  // Policy
  feePolicy: FeePolicy | null = null;
  isLoadingFeePolicy = false;
  showFeePolicyModal = false;
  feePolicyForm: Partial<FeePolicy> = {};

  constructor(
    private feeService: FeeService,
    private subjectService: SubjectService,
    private studentService: StudentService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFeeStructures();
    this.loadFeeAssignments();
    this.loadFeePayments();
    this.loadFinancialDashboard();
    this.loadReceipts();
    this.loadFeePolicy();
  }

  // Fee Structure Methods
  loadFeeStructures(): void {
    this.isLoadingFeeStructures = true;
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    this.feeService.getFeeStructures(entityId).subscribe({
      next: (res: any) => {
        if (res.ok && res.data) {
          this.feeStructures = res.data;
        }
        this.isLoadingFeeStructures = false;
      },
      error: () => {
        this.isLoadingFeeStructures = false;
      }
    });
  }

  openCreateFeeStructureModal(): void {
    this.isViewingFeeStructure = false;
    this.isEditingFeeStructure = false;
    this.selectedFeeStructure = null;
    this.feeStructureForm = {
      entityId: typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0),
      feeName: '',
      feeType: 'TUITION',
      amount: 0,
      isRecurring: false,
      status: 'active'
    };
    this.feeStructureFilterClasses = [];
    this.feeStructureFilterSections = [];
    this.showFeeStructureModal = true;
  }

  editFeeStructure(structure: FeeStructure): void {
    this.isViewingFeeStructure = false;
    this.isEditingFeeStructure = true;
    this.selectedFeeStructure = structure;
    this.feeStructureForm = { ...structure };
    this.feeStructureFilterClasses = [];
    this.feeStructureFilterSections = [];

    if (structure.dueDate) {
      this.feeStructureForm.dueDate = new Date(structure.dueDate).toISOString().split('T')[0];
    }
    if (structure.startDate) {
      this.feeStructureForm.startDate = new Date(structure.startDate).toISOString().split('T')[0];
    }
    if (structure.endDate) {
      this.feeStructureForm.endDate = new Date(structure.endDate).toISOString().split('T')[0];
    }

    if (structure.courseId) {
      this.subjectService.getClassesByCourse(structure.courseId).subscribe({
        next: (result) => {
          if (result.ok && result.data) {
            this.feeStructureFilterClasses = result.data;
            if (structure.classId) {
              this.subjectService.getSectionsByClass(structure.classId).subscribe({
                next: (res) => {
                  if (res.ok && res.data) {
                    this.feeStructureFilterSections = res.data;
                  }
                }
              });
            }
          }
        }
      });
    }
    this.showFeeStructureModal = true;
  }

  viewFeeStructure(structure: FeeStructure): void {
    this.isViewingFeeStructure = true;
    this.isEditingFeeStructure = false;
    this.selectedFeeStructure = structure;
    this.feeStructureForm = { ...structure };
    
    if (this.feeStructureForm.dueDate) {
      this.feeStructureForm.dueDate = new Date(this.feeStructureForm.dueDate).toISOString().split('T')[0];
    }
    if (this.feeStructureForm.startDate) {
      this.feeStructureForm.startDate = new Date(this.feeStructureForm.startDate).toISOString().split('T')[0];
    }
    if (this.feeStructureForm.endDate) {
      this.feeStructureForm.endDate = new Date(this.feeStructureForm.endDate).toISOString().split('T')[0];
    }
    
    // Load classes and sections if needed
    if (structure.courseId) {
      this.subjectService.getClassesByCourse(structure.courseId).subscribe({
        next: (result) => {
          if (result.ok && result.data) {
            this.feeStructureFilterClasses = result.data;
            if (structure.classId) {
              this.subjectService.getSectionsByClass(structure.classId).subscribe({
                next: (res) => {
                  if (res.ok && res.data) {
                    this.feeStructureFilterSections = res.data;
                  }
                }
              });
            }
          }
        }
      });
    }
    this.showFeeStructureModal = true;
  }

  closeFeeStructureModal(): void {
    this.showFeeStructureModal = false;
    this.isViewingFeeStructure = false;
    this.isEditingFeeStructure = false;
    this.selectedFeeStructure = null;
    this.feeStructureForm = {};
    this.feeStructureFilterClasses = [];
    this.feeStructureFilterSections = [];
  }

  saveFeeStructure(): void {
    if (!this.entity?.id) {
      this.showSnackbar.emit({ message: 'Entity not found', type: 'error' });
      return;
    }

    const user = this.auth.getUser();
    if (!user || !user.id) {
      this.showSnackbar.emit({ message: 'User not authenticated', type: 'error' });
      return;
    }
    const userId = user.id;

    if (!this.feeStructureForm.feeName || !this.feeStructureForm.feeType || !this.feeStructureForm.amount) {
      this.showSnackbar.emit({ message: 'Please fill all required fields', type: 'error' });
      return;
    }

    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    this.feeStructureForm.entityId = entityId;

    if (this.isEditingFeeStructure && this.feeStructureForm.id) {
      this.feeService.updateFeeStructure(this.feeStructureForm.id, this.feeStructureForm as FeeStructure, userId).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.showSnackbar.emit({ message: 'Fee structure updated successfully', type: 'success' });
            this.showFeeStructureModal = false;
            this.loadFeeStructures();
            this.feeStructureForm = {};
          } else {
            this.showSnackbar.emit({ message: res?.message || 'Failed to update fee structure', type: 'error' });
          }
        },
        error: (err) => {
          console.error('Error updating fee structure:', err);
          this.showSnackbar.emit({ message: 'Failed to update fee structure: ' + (err.error?.message || err.message), type: 'error' });
        }
      });
    } else {
      this.feeService.createFeeStructure(this.feeStructureForm as FeeStructure, userId).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.showSnackbar.emit({ message: 'Fee structure created successfully', type: 'success' });
            this.showFeeStructureModal = false;
            this.loadFeeStructures();
            this.feeStructureForm = {};
          } else {
            this.showSnackbar.emit({ message: res?.message || 'Failed to create fee structure', type: 'error' });
          }
        },
        error: (err) => {
          console.error('Error creating fee structure:', err);
          this.showSnackbar.emit({ message: 'Failed to create fee structure: ' + (err.error?.message || err.message), type: 'error' });
        }
      });
    }
  }

  deleteFeeStructure(structure: FeeStructure): void {
    if (confirm('Are you sure you want to delete this fee structure?')) {
      this.feeService.deleteFeeStructure(structure.id!).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.showSnackbar.emit({ message: 'Fee structure deleted successfully!', type: 'success' });
            this.loadFeeStructures();
          } else {
            this.showSnackbar.emit({ message: res.message || 'Failed to delete fee structure.', type: 'error' });
          }
        },
        error: (err: any) => {
          this.showSnackbar.emit({ message: err.error?.message || 'Error deleting fee structure.', type: 'error' });
        }
      });
    }
  }

  closeFeeAssignmentModal(): void {
    this.showFeeAssignmentModal = false;
    this.isViewingFeeAssignment = false;
    this.isEditingFeeAssignment = false;
    this.selectedFeeAssignment = null;
    this.feeAssignmentForm = {};
  }

  onFeeStructureCourseChange(): void {
    this.feeStructureForm.classId = undefined;
    this.feeStructureForm.sectionId = undefined;
    this.feeStructureFilterClasses = [];
    this.feeStructureFilterSections = [];

    const courseId = this.feeStructureForm.courseId;
    if (courseId) {
      this.subjectService.getClassesByCourse(courseId).subscribe({
        next: (result) => {
          if (result.ok && result.data) {
            this.feeStructureFilterClasses = result.data;
          }
        },
        error: () => {
          this.feeStructureFilterClasses = [];
        }
      });
    }
  }

  onFeeStructureClassChange(): void {
    this.feeStructureForm.sectionId = undefined;
    this.feeStructureFilterSections = [];

    const classId = this.feeStructureForm.classId;
    if (classId) {
      this.subjectService.getSectionsByClass(classId).subscribe({
        next: (result) => {
          if (result.ok && result.data) {
            this.feeStructureFilterSections = result.data;
          }
        },
        error: () => {
          this.feeStructureFilterSections = [];
        }
      });
    }
  }

  resetFeeStructureFilters(): void {
    this.feeStructureFilters = {
      courseId: '',
      classId: '',
      sectionId: '',
      feeType: '',
      status: ''
    };
    this.feeStructureFilterClasses = [];
    this.feeStructureFilterSections = [];
    this.loadFeeStructures();
  }

  // Fee Assignment Methods
  loadFeeAssignments(): void {
    this.isLoadingFeeAssignments = true;
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    
    // Apply filters if they exist
    const courseId = this.feeAssignmentFilters.courseId ? parseInt(this.feeAssignmentFilters.courseId) : undefined;
    const classId = this.feeAssignmentFilters.classId ? parseInt(this.feeAssignmentFilters.classId) : undefined;
    const sectionId = this.feeAssignmentFilters.sectionId ? parseInt(this.feeAssignmentFilters.sectionId) : undefined;
    const status = this.feeAssignmentFilters.status || undefined;
    
    this.feeService.getFeeAssignments(entityId, undefined, courseId, classId, sectionId, status).subscribe({
      next: (res: any) => {
        if (res && res.ok && res.data) {
          this.feeAssignments = res.data;
        } else if (res && res.ok) {
          this.feeAssignments = [];
        }
        this.isLoadingFeeAssignments = false;
      },
      error: (err) => {
        console.error('Error loading fee assignments:', err);
        this.isLoadingFeeAssignments = false;
      }
    });
  }

  /** Loads ALL fee assignments for the payment modal (no tab filters applied) */
  loadFeeAssignmentsForPayment(): void {
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    this.feeService.getFeeAssignments(entityId, undefined, undefined, undefined, undefined, undefined).subscribe({
      next: (res: any) => {
        if (res && res.ok && res.data) {
          this.feeAssignmentsForPayment = res.data;
        } else {
          this.feeAssignmentsForPayment = [];
        }
      },
      error: (err) => {
        console.error('Error loading fee assignments for payment:', err);
        this.feeAssignmentsForPayment = [];
      }
    });
  }

  openCreateFeeAssignmentModal(): void {
    this.isViewingFeeAssignment = false;
    this.isEditingFeeAssignment = false;
    this.selectedFeeAssignment = null;
    this.feeAssignmentForm = {
      entityId: typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0),
      studentId: undefined,
      feeStructureId: undefined,
      totalAmount: 0,
      finalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      status: 'pending',
      dueDate: new Date().toISOString().split('T')[0]
    };
    this.loadStudents('all');
    this.loadFeeStructures();
    this.showFeeAssignmentModal = true;
  }

  editFeeAssignment(assignment: FeeAssignment): void {
    this.isViewingFeeAssignment = false;
    this.isEditingFeeAssignment = true;
    this.selectedFeeAssignment = assignment;
    this.feeAssignmentForm = { ...assignment };

    if (this.feeAssignmentForm.dueDate) {
      this.feeAssignmentForm.dueDate = new Date(this.feeAssignmentForm.dueDate).toISOString().split('T')[0];
    }

    this.feeAssignmentForm.discountAmount = assignment.discountAmount || 0;
    this.feeAssignmentForm.discountPercentage = assignment.discountPercentage || 0;
    this.feeAssignmentForm.scholarshipAmount = assignment.scholarshipAmount || 0;

    this.loadStudents('all');
    this.loadFeeStructures();
    this.calculateFinalAmount();
    this.showFeeAssignmentModal = true;
  }

  viewFeeAssignment(assignment: FeeAssignment): void {
    this.isViewingFeeAssignment = true;
    this.isEditingFeeAssignment = false;
    this.selectedFeeAssignment = assignment;
    this.feeAssignmentForm = { ...assignment };
    
    if (this.feeAssignmentForm.dueDate) {
      this.feeAssignmentForm.dueDate = new Date(this.feeAssignmentForm.dueDate).toISOString().split('T')[0];
    }
    
    this.loadStudents('all');
    this.loadFeeStructures();
    this.showFeeAssignmentModal = true;
  }

  deleteFeeAssignment(assignment: FeeAssignment): void {
    if (confirm(`Are you sure you want to delete fee assignment for ${this.getStudentName(assignment.studentId)}?`)) {
      this.feeService.deleteFeeAssignment(assignment.id!).subscribe({
        next: (res: any) => {
          if (res && res.ok) {
            this.showSnackbar.emit({ message: 'Fee assignment deleted successfully!', type: 'success' });
            this.loadFeeAssignments();
          } else {
            this.showSnackbar.emit({ message: res?.message || 'Failed to delete fee assignment.', type: 'error' });
          }
        },
        error: (err: any) => {
          console.error('Error deleting fee assignment:', err);
          this.showSnackbar.emit({ message: err.error?.message || err.message || 'Error deleting fee assignment.', type: 'error' });
        }
      });
    }
  }

  recordPaymentForAssignment(assignment: FeeAssignment): void {
    this.feePaymentForm = {
      entityId: typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0),
      studentId: assignment.studentId,
      feeAssignmentId: assignment.id,
      amount: assignment.pendingAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'CASH',
      status: 'completed'
    };
    this.loadFeeAssignmentsForPayment(); // Ensure dropdown has fresh data
    this.showFeePaymentModal = true;
  }

  onFeeAssignmentStudentChange(): void {
    this.feeAssignmentForm.feeStructureId = undefined;
    this.feeAssignmentForm.totalAmount = 0;
    this.feeAssignmentForm.finalAmount = 0;
    this.feeAssignmentForm.paidAmount = 0;
    this.feeAssignmentForm.pendingAmount = 0;
    this.calculateFinalAmount();
  }

  onFeeAssignmentStructureChange(): void {
    const selectedStructure = this.feeStructures.find(s => s.id === this.feeAssignmentForm.feeStructureId);
    if (selectedStructure) {
      this.feeAssignmentForm.totalAmount = selectedStructure.amount;
      this.feeAssignmentForm.dueDate = selectedStructure.dueDate;
      this.feeAssignmentForm.academicYear = selectedStructure.academicYear;
      this.feeAssignmentForm.paidAmount = 0;
      this.calculateFinalAmount();
    } else {
      this.feeAssignmentForm.totalAmount = 0;
      this.feeAssignmentForm.finalAmount = 0;
      this.feeAssignmentForm.paidAmount = 0;
      this.feeAssignmentForm.pendingAmount = 0;
      this.feeAssignmentForm.dueDate = undefined;
      this.feeAssignmentForm.academicYear = undefined;
    }
  }

  calculateFinalAmount(): void {
    let total = this.feeAssignmentForm.totalAmount || 0;
    let discountAmount = this.feeAssignmentForm.discountAmount || 0;
    let discountPercentage = this.feeAssignmentForm.discountPercentage || 0;
    let scholarshipAmount = this.feeAssignmentForm.scholarshipAmount || 0;

    if (discountPercentage > 0) {
      discountAmount = total * (discountPercentage / 100);
    }

    let final = total - discountAmount - scholarshipAmount;
    this.feeAssignmentForm.finalAmount = Math.max(0, final);
    this.feeAssignmentForm.pendingAmount = Math.max(0, this.feeAssignmentForm.finalAmount - (this.feeAssignmentForm.paidAmount || 0));
  }

  saveFeeAssignment(): void {
    if (!this.entity?.id) {
      this.showSnackbar.emit({ message: 'Entity not found', type: 'error' });
      return;
    }

    const user = this.auth.getUser();
    if (!user || !user.id) {
      this.showSnackbar.emit({ message: 'User not authenticated', type: 'error' });
      return;
    }
    const userId = user.id;

    if (!this.feeAssignmentForm.studentId || !this.feeAssignmentForm.feeStructureId || !this.feeAssignmentForm.dueDate) {
      this.showSnackbar.emit({ message: 'Please select a student, fee structure, and due date.', type: 'error' });
      return;
    }

    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    this.feeAssignmentForm.entityId = entityId;

    this.feeAssignmentForm.discountAmount = Number(this.feeAssignmentForm.discountAmount || 0);
    this.feeAssignmentForm.discountPercentage = Number(this.feeAssignmentForm.discountPercentage || 0);
    this.feeAssignmentForm.scholarshipAmount = Number(this.feeAssignmentForm.scholarshipAmount || 0);

    if (this.isEditingFeeAssignment && this.feeAssignmentForm.id) {
      this.feeService.updateFeeAssignment(
        this.feeAssignmentForm.id,
        this.feeAssignmentForm,
        userId
      ).subscribe({
        next: (res: any) => {
          if (res && res.ok) {
            this.showSnackbar.emit({ message: 'Fee Assignment updated successfully!', type: 'success' });
            this.closeFeeAssignmentModal();
            // Update the assignment in the list immediately
            if (res.data) {
              const index = this.feeAssignments.findIndex(a => a.id === res.data.id);
              if (index !== -1) {
                this.feeAssignments[index] = res.data;
              }
            }
            // Reload the list to ensure all data is fresh
            this.loadFeeAssignments();
          } else {
            this.showSnackbar.emit({ message: res?.message || 'Failed to update fee assignment.', type: 'error' });
          }
        },
        error: (err: any) => {
          console.error('Error updating fee assignment:', err);
          this.showSnackbar.emit({ message: err.error?.message || err.message || 'Error updating fee assignment. Method PUT may not be supported.', type: 'error' });
        }
      });
    } else {
      this.feeService.assignFeeToStudent(
        entityId,
        this.feeAssignmentForm.studentId!,
        this.feeAssignmentForm.feeStructureId!,
        this.feeAssignmentForm.discountAmount,
        this.feeAssignmentForm.discountPercentage,
        this.feeAssignmentForm.scholarshipAmount,
        this.feeAssignmentForm.academicYear,
        userId
      ).subscribe({
        next: (res: any) => {
          if (res && res.ok) {
            this.showSnackbar.emit({ message: 'Fee Assignment created successfully!', type: 'success' });
            this.closeFeeAssignmentModal();
            this.loadFeeAssignments();
          } else {
            this.showSnackbar.emit({ message: res?.message || 'Failed to create fee assignment.', type: 'error' });
          }
        },
        error: (err: any) => {
          console.error('Error creating fee assignment:', err);
          this.showSnackbar.emit({ message: err.error?.message || err.message || 'Error creating fee assignment.', type: 'error' });
        }
      });
    }
  }

  onFeeAssignmentCourseChange(): void {
    this.feeAssignmentFilters.classId = '';
    this.feeAssignmentFilterClasses = [];
    this.feeAssignmentFilterSections = [];

    if (this.feeAssignmentFilters.courseId) {
      this.subjectService.getClassesByCourse(this.feeAssignmentFilters.courseId).subscribe({
        next: (result) => {
          if (result.ok && result.data) {
            this.feeAssignmentFilterClasses = result.data;
          }
        }
      });
    }
  }

  onFeeAssignmentClassChange(): void {
    this.feeAssignmentFilters.sectionId = '';
    this.feeAssignmentFilterSections = [];

    if (this.feeAssignmentFilters.classId) {
      this.subjectService.getSectionsByClass(this.feeAssignmentFilters.classId).subscribe({
        next: (result) => {
          if (result.ok && result.data) {
            this.feeAssignmentFilterSections = result.data;
          }
        }
      });
    }
  }

  resetFeeAssignmentFilters(): void {
    this.feeAssignmentFilters = {
      studentName: '',
      courseId: '',
      classId: '',
      sectionId: '',
      status: ''
    };
    this.feeAssignmentFilterClasses = [];
    this.feeAssignmentFilterSections = [];
    this.loadFeeAssignments();
  }

  // Payment Methods
  loadFeePayments(): void {
    this.isLoadingFeePayments = true;
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    this.feeService.getPayments(entityId).subscribe({
      next: (res: any) => {
        if (res.ok && res.data) {
          this.feePayments = res.data;
        }
        this.isLoadingFeePayments = false;
      },
      error: () => {
        this.isLoadingFeePayments = false;
      }
    });
  }

  openCreatePaymentModal(): void {
    this.isEditingFeePayment = false;
    this.isViewingFeePayment = false;
    this.selectedFeePayment = null;
    this.feePaymentForm = {
      entityId: typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0),
      studentId: undefined,
      feeAssignmentId: undefined,
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'CASH',
      status: 'completed'
    };
    this.loadStudents('all');
    this.loadFeeAssignmentsForPayment(); // Load ALL assignments (no tab filters) for dropdown
    this.showFeePaymentModal = true;
  }

  saveFeePayment(): void {
    if (!this.entity?.id) {
      this.showSnackbar.emit({ message: 'Entity not found', type: 'error' });
      return;
    }

    const user = this.auth.getUser();
    if (!user || !user.id) {
      this.showSnackbar.emit({ message: 'User not authenticated', type: 'error' });
      return;
    }

    // Edit mode: update existing payment (metadata only)
    if (this.isEditingFeePayment && this.feePaymentForm.id) {
      this.feeService.updatePayment(this.feePaymentForm.id, {
        transactionId: this.feePaymentForm.transactionId,
        referenceNumber: this.feePaymentForm.referenceNumber,
        status: this.feePaymentForm.status,
        remarks: this.feePaymentForm.remarks,
        fineAmount: this.feePaymentForm.fineAmount ? Number(this.feePaymentForm.fineAmount) : undefined,
        fineReason: this.feePaymentForm.fineReason,
        paymentMode: this.feePaymentForm.paymentMode,
        paymentDate: this.feePaymentForm.paymentDate
      }).subscribe({
        next: (res: any) => {
          if (res && res.ok) {
            this.showSnackbar.emit({ message: 'Payment updated successfully!', type: 'success' });
            this.closeFeePaymentModal();
            this.loadFeePayments();
          } else {
            this.showSnackbar.emit({ message: res?.message || 'Failed to update payment.', type: 'error' });
          }
        },
        error: (err: any) => {
          console.error('Error updating payment:', err);
          this.showSnackbar.emit({ message: err.error?.message || err.message || 'Error updating payment.', type: 'error' });
        }
      });
      return;
    }

    // Create mode: record new payment
    if (!this.feePaymentForm.studentId || !this.feePaymentForm.feeAssignmentId || !this.feePaymentForm.amount) {
      this.showSnackbar.emit({ message: 'Please fill all required fields (Student, Fee Assignment, Amount)', type: 'error' });
      return;
    }

    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    const userId = user.id;
    const amount = Number(this.feePaymentForm.amount || 0);
    
    if (amount <= 0) {
      this.showSnackbar.emit({ message: 'Payment amount must be greater than 0', type: 'error' });
      return;
    }

    this.feeService.recordPayment(
      entityId,
      this.feePaymentForm.studentId!,
      this.feePaymentForm.feeAssignmentId!,
      amount,
      this.feePaymentForm.paymentDate,
      this.feePaymentForm.paymentMode || 'CASH',
      this.feePaymentForm.transactionId,
      this.feePaymentForm.referenceNumber,
      this.feePaymentForm.fineAmount ? Number(this.feePaymentForm.fineAmount) : undefined,
      this.feePaymentForm.fineReason,
      this.feePaymentForm.remarks,
      userId
    ).subscribe({
      next: (res: any) => {
        if (res && res.ok) {
          this.showSnackbar.emit({ message: 'Payment recorded successfully!', type: 'success' });
          this.closeFeePaymentModal();
          this.loadFeePayments();
          this.loadFeeAssignments(); // Refresh assignments to update paid/pending amounts
        } else {
          this.showSnackbar.emit({ message: res?.message || 'Failed to record payment.', type: 'error' });
        }
      },
      error: (err: any) => {
        console.error('Error recording payment:', err);
        this.showSnackbar.emit({ message: err.error?.message || err.message || 'Error recording payment.', type: 'error' });
      }
    });
  }

  closeFeePaymentModal(): void {
    this.showFeePaymentModal = false;
    this.isEditingFeePayment = false;
    this.isViewingFeePayment = false;
    this.selectedFeePayment = null;
    this.feePaymentForm = {};
  }

  onPaymentStudentChange(): void {
    // Filter fee assignments by selected student
    this.feePaymentForm.feeAssignmentId = undefined;
  }

  onPaymentAssignmentChange(): void {
    // Auto-fill amount from pending amount if assignment is selected
    const selectedAssignment = this.feeAssignmentsForPayment.find(a => a.id === this.feePaymentForm.feeAssignmentId);
    if (selectedAssignment && !this.feePaymentForm.amount) {
      this.feePaymentForm.amount = selectedAssignment.pendingAmount;
    }
  }

  viewFeePayment(payment: FeePayment): void {
    this.isViewingFeePayment = true;
    this.isEditingFeePayment = false;
    this.selectedFeePayment = payment;
    this.feePaymentForm = {
      ...payment,
      paymentDate: payment.paymentDate ? (typeof payment.paymentDate === 'string' ? payment.paymentDate.split('T')[0] : new Date(payment.paymentDate).toISOString().split('T')[0]) : undefined
    };
    this.loadFeeAssignmentsForPayment();
    this.showFeePaymentModal = true;
  }

  editFeePayment(payment: FeePayment): void {
    this.isViewingFeePayment = false;
    this.isEditingFeePayment = true;
    this.selectedFeePayment = payment;
    this.feePaymentForm = {
      ...payment,
      paymentDate: payment.paymentDate ? (typeof payment.paymentDate === 'string' ? payment.paymentDate.split('T')[0] : new Date(payment.paymentDate).toISOString().split('T')[0]) : undefined
    };
    this.loadFeeAssignmentsForPayment();
    this.showFeePaymentModal = true;
  }

  downloadReceiptForPayment(payment: FeePayment): void {
    // TODO: Implement receipt download
  }

  resetFeePaymentFilters(): void {
    this.feePaymentFilters = {
      studentName: '',
      paymentMode: '',
      status: '',
      fromDate: '',
      toDate: ''
    };
    this.loadFeePayments();
  }

  // Financial Dashboard Methods
  loadFinancialDashboard(): void {
    this.isLoadingFinancialDashboard = true;
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    this.feeService.getFinancialDashboard(entityId, this.financialDashboardFilters.fromDate, this.financialDashboardFilters.toDate).subscribe({
      next: (res: any) => {
        if (res.ok && res.data) {
          this.financialDashboard = res.data;
        }
        this.isLoadingFinancialDashboard = false;
      },
      error: () => {
        this.isLoadingFinancialDashboard = false;
      }
    });
  }

  // Receipt Methods
  loadReceipts(): void {
    this.isLoadingReceipts = true;
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    // Load payments first so we can get receipt amounts
    this.feeService.getPayments(entityId).subscribe({
      next: (paymentsRes: any) => {
        if (paymentsRes.ok && paymentsRes.data) {
          this.feePayments = paymentsRes.data;
        }
        // Then load receipts
        this.feeService.getReceipts(entityId).subscribe({
          next: (res: any) => {
            if (res.ok && res.data) {
              this.receipts = res.data;
            }
            this.isLoadingReceipts = false;
          },
          error: () => {
            this.isLoadingReceipts = false;
          }
        });
      },
      error: () => {
        // Still try to load receipts even if payments fail
        this.feeService.getReceipts(entityId).subscribe({
          next: (res: any) => {
            if (res.ok && res.data) {
              this.receipts = res.data;
            }
            this.isLoadingReceipts = false;
          },
          error: () => {
            this.isLoadingReceipts = false;
          }
        });
      }
    });
  }

  viewReceipt(receipt: Receipt): void {
    this.selectedReceipt = receipt;
    this.showReceiptViewModal = true;
  }

  closeReceiptViewModal(): void {
    this.showReceiptViewModal = false;
    this.selectedReceipt = null;
  }

  downloadReceipt(receipt: Receipt): void {
    this.feeService.getReceiptByPaymentId(receipt.feePaymentId).subscribe({
      next: (res: any) => {
        const fullReceipt = res?.data || res;
        if (fullReceipt?.receiptPdfData) {
          const link = document.createElement('a');
          link.href = fullReceipt.receiptPdfData.startsWith('data:') ? fullReceipt.receiptPdfData : `data:application/pdf;base64,${fullReceipt.receiptPdfData}`;
          link.download = `receipt-${receipt.receiptNumber || receipt.id}.pdf`;
          link.click();
          this.showSnackbar.emit({ message: 'Receipt downloaded successfully', type: 'success' });
        } else {
          this.downloadReceiptAsHtml(receipt);
        }
      },
      error: () => {
        this.downloadReceiptAsHtml(receipt);
      }
    });
  }

  private downloadReceiptAsHtml(receipt: Receipt): void {
    const amount = this.getReceiptAmount(receipt);
    const studentName = this.getStudentName(receipt.studentId);
    const date = this.formatDate(receipt.receiptDate);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt ${receipt.receiptNumber}</title>
      <style>body{font-family:Arial,sans-serif;max-width:500px;margin:40px auto;padding:20px;border:1px solid #ddd;border-radius:8px;}
      h2{color:#059669;margin-bottom:20px;} .row{display:flex;justify-content:space-between;margin:10px 0;}
      .label{font-weight:600;color:#555;} .amount{font-size:24px;color:#059669;margin:20px 0;}</style></head>
      <body><h2>Payment Receipt</h2>
      <div class="row"><span class="label">Receipt No:</span><span>${receipt.receiptNumber || 'N/A'}</span></div>
      <div class="row"><span class="label">Student:</span><span>${studentName || 'N/A'}</span></div>
      <div class="row"><span class="label">Date:</span><span>${date || 'N/A'}</span></div>
      <div class="row"><span class="label">Amount:</span><span class="amount">₹${amount?.toFixed(2) || '0.00'}</span></div>
      <div class="row"><span class="label">Status:</span><span>${receipt.status || 'generated'}</span></div>
      </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `receipt-${receipt.receiptNumber || receipt.id}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
    if (receipt.id) {
      this.feeService.markReceiptDownloaded(receipt.id).subscribe();
    }
    this.showSnackbar.emit({ message: 'Receipt downloaded successfully', type: 'success' });
  }

  sendReceipt(receipt: Receipt): void {
    if (!receipt.id) {
      this.showSnackbar.emit({ message: 'Receipt not found', type: 'error' });
      return;
    }
    this.feeService.sendReceipt(receipt.id, 'EMAIL').subscribe({
      next: (res: any) => {
        if (res?.ok) {
          this.showSnackbar.emit({ message: 'Receipt sent to student email successfully', type: 'success' });
          this.loadReceipts();
        } else {
          this.showSnackbar.emit({ message: res?.message || 'Failed to send receipt', type: 'error' });
        }
      },
      error: (err: any) => {
        this.showSnackbar.emit({ message: err?.error?.message || err?.message || 'Failed to send receipt', type: 'error' });
      }
    });
  }

  getReceiptAmount(receipt: Receipt): number {
    // Get amount from the associated payment
    const payment = this.feePayments.find(p => p.id === receipt.feePaymentId);
    return payment?.amount || 0;
  }

  resetReceiptFilters(): void {
    this.receiptFilters = {
      studentName: '',
      status: ''
    };
    this.loadReceipts();
  }

  // Policy Methods
  loadFeePolicy(): void {
    this.isLoadingFeePolicy = true;
    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0);
    this.feeService.getFeePolicy(entityId).subscribe({
      next: (res: any) => {
        if (res.ok && res.data) {
          this.feePolicy = res.data;
        }
        this.isLoadingFeePolicy = false;
      },
      error: () => {
        this.isLoadingFeePolicy = false;
      }
    });
  }

  openEditFeePolicyModal(): void {
    this.feePolicyForm = this.feePolicy ? { ...this.feePolicy } : {
      entityId: typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0),
      lateFineType: 'PERCENTAGE',
      lateFinePercentage: 0,
      lateFineFixedAmount: 0,
      lateFineGracePeriodDays: 0,
      installmentEligibilityPercentage: 0,
      refundAllowed: false,
      autoAssignFees: false,
      financialYearLocked: false
    };
    this.showFeePolicyModal = true;
  }

  closeFeePolicyModal(): void {
    this.showFeePolicyModal = false;
    this.feePolicyForm = {};
  }

  saveFeePolicy(): void {
    if (!this.entity?.id) {
      this.showSnackbar.emit({ message: 'Entity not found', type: 'error' });
      return;
    }
    const user = this.auth.getUser();
    if (!user || !user.id) {
      this.showSnackbar.emit({ message: 'User not authenticated', type: 'error' });
      return;
    }
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    const policy: FeePolicy = {
      ...this.feePolicyForm,
      entityId,
      refundAllowed: this.feePolicyForm.refundAllowed ?? false,
      autoAssignFees: this.feePolicyForm.autoAssignFees ?? false,
      financialYearLocked: this.feePolicyForm.financialYearLocked ?? false
    } as FeePolicy;
    this.feeService.updateFeePolicy(entityId, policy, user.id).subscribe({
      next: (res: any) => {
        if (res?.ok) {
          this.showSnackbar.emit({ message: 'Fee policy updated successfully', type: 'success' });
          this.closeFeePolicyModal();
          this.loadFeePolicy();
        } else {
          this.showSnackbar.emit({ message: res?.message || 'Failed to update fee policy', type: 'error' });
        }
      },
      error: (err: any) => {
        this.showSnackbar.emit({ message: err?.error?.message || err?.message || 'Failed to update fee policy', type: 'error' });
      }
    });
  }

  // Helper Methods
  loadStudents(filter: string): void {
    // Students are passed as input, no need to load
  }

  getCourseName(courseId?: number): string {
    const course = this.courses.find(c => c.id === courseId);
    return course?.name || '';
  }

  getClassName(classId?: number): string {
    // TODO: Implement class name lookup
    return '';
  }

  getStudentName(studentId?: number): string {
    const student = this.students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : '';
  }

  getFeeStructureName(feeStructureId?: number): string {
    const structure = this.feeStructures.find(s => s.id === feeStructureId);
    return structure?.feeName || '';
  }

  formatDate(date?: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
  }
}
