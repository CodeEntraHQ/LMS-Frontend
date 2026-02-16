import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeeStructure } from '../../services/fee.service';
import { Course, ClassEntity, Section } from '../../services/subject.service';

@Component({
  selector: 'app-fee-structure-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content student-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isViewing ? 'View Fee Structure' : (isEditing ? 'Edit Fee Structure' : 'Create Fee Structure') }}</h2>
          <button class="close-btn" (click)="onClose()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Fee Name *</label>
              <input type="text" class="form-input" [(ngModel)]="form.feeName" placeholder="e.g., BCA Semester 1 Fees" [readonly]="isViewing" />
            </div>
            <div class="form-group">
              <label>Fee Type *</label>
              <select class="form-input" [(ngModel)]="form.feeType" [disabled]="isViewing">
                <option value="TUITION">Tuition</option>
                <option value="EXAM">Exam</option>
                <option value="LAB">Lab</option>
                <option value="LIBRARY">Library</option>
                <option value="ADMISSION">Admission</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Course</label>
              <select class="form-input" [(ngModel)]="form.courseId" (change)="onCourseChange()" [disabled]="isViewing">
                <option [value]="undefined">All Courses</option>
                <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Class / Semester</label>
              <select class="form-input" [(ngModel)]="form.classId" [disabled]="!form.courseId || isViewing" (change)="onClassChange()">
                <option [value]="undefined">All Classes</option>
                <option *ngFor="let classItem of classes" [value]="classItem.id">{{ classItem.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Section</label>
              <select class="form-input" [(ngModel)]="form.sectionId" [disabled]="!form.classId || isViewing">
                <option [value]="undefined">All Sections</option>
                <option *ngFor="let section of sections" [value]="section.id">{{ section.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Academic Year</label>
              <input type="text" class="form-input" [(ngModel)]="form.academicYear" placeholder="e.g., 2024-2025" [readonly]="isViewing" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Amount *</label>
              <input type="number" class="form-input" [(ngModel)]="form.amount" placeholder="0.00" step="0.01" min="0" [readonly]="isViewing" />
            </div>
            <div class="form-group">
              <label>Status</label>
              <select class="form-input" [(ngModel)]="form.status" [disabled]="isViewing">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="form.isRecurring" [disabled]="isViewing" />
                Is Recurring
              </label>
            </div>
            <div class="form-group" *ngIf="form.isRecurring">
              <label>Recurring Period</label>
              <select class="form-input" [(ngModel)]="form.recurringPeriod" [disabled]="isViewing">
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="SEMESTER">Semester</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <div class="form-row" *ngIf="form.isRecurring">
            <div class="form-group">
              <label>Installment Count</label>
              <input type="number" class="form-input" [(ngModel)]="form.installmentCount" placeholder="e.g., 4" min="1" [readonly]="isViewing" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Due Date</label>
              <input type="date" class="form-input" [(ngModel)]="form.dueDate" [readonly]="isViewing" />
            </div>
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" class="form-input" [(ngModel)]="form.startDate" [readonly]="isViewing" />
            </div>
          </div>

          <div class="form-group">
            <label>End Date</label>
            <input type="date" class="form-input" [(ngModel)]="form.endDate" [readonly]="isViewing" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea class="form-input" rows="3" [(ngModel)]="form.description" placeholder="Fee structure description" [readonly]="isViewing"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="onClose()">{{ isViewing ? 'Close' : 'Cancel' }}</button>
          <button class="btn-primary" (click)="onSave()" *ngIf="!isViewing">{{ isEditing ? 'Update' : 'Create' }}</button>
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
  `]
})
export class FeeStructureModalComponent {
  @Input() form: Partial<FeeStructure> = {};
  @Input() isEditing: boolean = false;
  @Input() isViewing: boolean = false;
  @Input() courses: Course[] = [];
  @Input() classes: ClassEntity[] = [];
  @Input() sections: Section[] = [];
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() courseChange = new EventEmitter<void>();
  @Output() classChange = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit();
  }

  onCourseChange(): void {
    this.courseChange.emit();
  }

  onClassChange(): void {
    this.classChange.emit();
  }
}
