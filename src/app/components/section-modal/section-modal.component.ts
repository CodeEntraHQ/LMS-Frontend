import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassEntity, Section } from '../../services/subject.service';

@Component({
  selector: 'app-section-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content student-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Manage Sections - {{ selectedClass?.name }}</h2>
          <button class="close-btn" (click)="onClose()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="section-info-box" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 12px; margin-bottom: 20px;">
            <p style="margin: 0; color: #10b981; font-weight: 600; font-size: 14px;">
              📌 <strong>Note:</strong> Sections created here (e.g., A, B, C, D, E) will be used for student enrollment. 
              Subjects created for this class will automatically be available for <strong>ALL</strong> sections.
            </p>
          </div>
          <div class="form-header">
            <h3>Add New Section</h3>
            <button class="btn-primary" (click)="onAddNew()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Add Section
            </button>
          </div>
          <div *ngIf="!isEditing && sectionForm.classId" class="form-row">
            <div class="form-group">
              <label>Section Name *</label>
              <input type="text" class="form-input" [(ngModel)]="sectionForm.name" placeholder="e.g., A, B, C" />
            </div>
            <div class="form-group">
              <label>Capacity</label>
              <input type="number" class="form-input" [(ngModel)]="sectionForm.capacity" />
            </div>
          </div>
          <div *ngIf="!isEditing && sectionForm.classId" class="form-actions">
            <button class="btn-primary" (click)="onSave()">Save Section</button>
            <button class="btn-secondary" (click)="onCancel()">Cancel</button>
          </div>
          <div *ngIf="sections.length > 0" class="sections-list">
            <h4>Existing Sections</h4>
            <div class="section-item" *ngFor="let section of sections">
              <span>{{ section.name }}</span>
              <span *ngIf="section.capacity">(Capacity: {{ section.capacity }})</span>
              <button class="btn-edit" (click)="onEdit(section)">Edit</button>
              <button class="btn-delete" (click)="onDelete(section)" *ngIf="section.id">Delete</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="onClose()">Close</button>
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
      max-width: 600px;
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
    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
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
    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
    .btn-primary, .btn-secondary, .btn-edit, .btn-delete {
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
    .btn-edit {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }
    .btn-delete {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }
    .sections-list {
      margin-top: 24px;
    }
    .section-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      margin-bottom: 8px;
    }
  `]
})
export class SectionModalComponent {
  @Input() selectedClass: ClassEntity | null = null;
  @Input() sections: Section[] = [];
  @Input() sectionForm: Partial<Section> = {};
  @Input() isEditing: boolean = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() addNew = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Section>();
  @Output() delete = new EventEmitter<Section>();

  onClose(): void {
    this.close.emit();
  }

  onAddNew(): void {
    this.addNew.emit();
  }

  onSave(): void {
    this.save.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onEdit(section: Section): void {
    this.edit.emit(section);
  }

  onDelete(section: Section): void {
    this.delete.emit(section);
  }
}
