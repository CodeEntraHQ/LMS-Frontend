import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeeAssignment } from '../../services/fee.service';
import { Student } from '../../services/student.service';
import { FeeStructure } from '../../services/fee.service';

@Component({
  selector: 'app-fee-assignment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content student-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isViewing ? 'View Fee Assignment' : (isEditing ? 'Edit Fee Assignment' : 'Assign Fee to Student') }}</h2>
          <button class="close-btn" (click)="onClose()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Student *</label>
              <select class="form-input" [(ngModel)]="form.studentId" (change)="onStudentChange()" [disabled]="isViewing">
                <option [value]="0">Select a student</option>
                <option *ngFor="let student of students" [value]="student.id">
                  {{ student.firstName }} {{ student.lastName }} ({{ student.rollNumber || 'N/A' }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Fee Structure *</label>
              <select class="form-input" [(ngModel)]="form.feeStructureId" (change)="onStructureChange()" [disabled]="isViewing">
                <option [value]="0">Select a fee structure</option>
                <option *ngFor="let structure of feeStructures" [value]="structure.id">
                  {{ structure.feeName }} - ₹{{ (structure.amount || 0) | number:'1.2-2' }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Total Amount</label>
              <input type="number" class="form-input" [(ngModel)]="form.totalAmount" readonly placeholder="Auto-calculated" />
            </div>
            <div class="form-group">
              <label>Discount Amount</label>
              <input type="number" class="form-input" [(ngModel)]="form.discountAmount" placeholder="0.00" step="0.01" min="0" (input)="onCalculateFinalAmount()" [readonly]="isViewing" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Discount Percentage</label>
              <input type="number" class="form-input" [(ngModel)]="form.discountPercentage" placeholder="0" step="0.01" min="0" max="100" (input)="onCalculateFinalAmount()" [readonly]="isViewing" />
            </div>
            <div class="form-group">
              <label>Scholarship Amount</label>
              <input type="number" class="form-input" [(ngModel)]="form.scholarshipAmount" placeholder="0.00" step="0.01" min="0" (input)="onCalculateFinalAmount()" [readonly]="isViewing" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Final Amount</label>
              <input type="number" class="form-input" [(ngModel)]="form.finalAmount" readonly placeholder="Auto-calculated" />
            </div>
            <div class="form-group">
              <label>Paid Amount</label>
              <input type="number" class="form-input" [(ngModel)]="form.paidAmount" placeholder="0.00" step="0.01" min="0" (input)="onCalculateFinalAmount()" [readonly]="isViewing" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Pending Amount</label>
              <input type="number" class="form-input" [(ngModel)]="form.pendingAmount" readonly placeholder="Auto-calculated" />
            </div>
            <div class="form-group">
              <label>Due Date *</label>
              <input type="date" class="form-input" [(ngModel)]="form.dueDate" [readonly]="isViewing" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Academic Year</label>
              <input type="text" class="form-input" [(ngModel)]="form.academicYear" placeholder="e.g., 2024-2025" [readonly]="isViewing" />
            </div>
            <div class="form-group">
              <label>Status</label>
              <select class="form-input" [(ngModel)]="form.status" [disabled]="isViewing">
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Remarks</label>
            <textarea class="form-input" rows="3" [(ngModel)]="form.remarks" placeholder="Additional remarks" [readonly]="isViewing"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="onClose()">{{ isViewing ? 'Close' : 'Cancel' }}</button>
          <button class="btn-primary" (click)="onSave()" *ngIf="!isViewing">{{ isEditing ? 'Update' : 'Assign' }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: var(--card-bg);
      border-radius: 12px;
      max-width: 700px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid var(--border-gray);
    }
    .modal-body {
      padding: 20px;
    }
    .modal-footer {
      padding: 20px;
      border-top: 1px solid var(--border-gray);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-input {
      padding: 10px 12px;
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      background: var(--input-bg);
      color: var(--text-white);
    }
    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 600;
    }
    .btn-primary {
      background: var(--accent-green);
      color: white;
    }
    .btn-secondary {
      background: var(--bg-secondary);
      color: var(--text-white);
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: var(--text-white);
      cursor: pointer;
    }
  `]
})
export class FeeAssignmentModalComponent {
  @Input() form: Partial<FeeAssignment> = {};
  @Input() isEditing: boolean = false;
  @Input() isViewing: boolean = false;
  @Input() students: Student[] = [];
  @Input() feeStructures: FeeStructure[] = [];
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() studentChange = new EventEmitter<void>();
  @Output() structureChange = new EventEmitter<void>();
  @Output() calculateFinalAmount = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit();
  }

  onStudentChange(): void {
    this.studentChange.emit();
  }

  onStructureChange(): void {
    this.structureChange.emit();
  }

  onCalculateFinalAmount(): void {
    this.calculateFinalAmount.emit();
  }
}
