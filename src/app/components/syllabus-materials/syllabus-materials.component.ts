import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectService, Subject } from '../../services/subject.service';
import { SubjectContentService, SubjectContent } from '../../services/subject-content.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-syllabus-materials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="syllabus-container">
      <!-- Upload Form -->
      <div class="syllabus-upload-card">
        <div class="card-header">
          <h2 class="card-title">📋 Syllabus & Materials</h2>
          <p class="card-subtitle">Upload syllabus, videos, notes, and PPTs</p>
        </div>
        
        <div class="form">
          <div class="form-row">
            <div class="form-field">
              <label>Subject *</label>
              <select class="form-select" [(ngModel)]="syllabusForm.subject" name="subject">
                <option [ngValue]="null">Select Subject</option>
                <option *ngFor="let subject of sectionSubjects" [ngValue]="subject.id">
                  {{ subject.name }}
                </option>
              </select>
            </div>
            <div class="form-field">
              <label>Type *</label>
              <select class="form-select" [(ngModel)]="syllabusForm.type" name="type">
                <option value="">Select Type</option>
                <option value="SYLLABUS">Syllabus</option>
                <option value="NOTES">Notes</option>
                <option value="VIDEO">Video</option>
                <option value="PPT">PPT</option>
              </select>
            </div>
          </div>

          <div class="form-field">
            <label>Title *</label>
            <input class="form-input" [(ngModel)]="syllabusForm.title" name="title" placeholder="Title" />
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Unit / Chapter</label>
              <input class="form-input" [(ngModel)]="syllabusForm.unit" name="unit" placeholder="Unit / Chapter" />
            </div>
            <div class="form-field">
              <label>Topic</label>
              <input class="form-input" [(ngModel)]="syllabusForm.topic" name="topic" placeholder="Topic name" />
            </div>
          </div>

          <div class="form-field">
            <label>Description</label>
            <textarea class="form-input textarea" [(ngModel)]="syllabusForm.description" name="description" placeholder="Description"></textarea>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Upload File (PDF/PPT/Video)</label>
              <input type="file" #fileUpload class="file-input" (change)="onFileSelected($event)" />
            </div>
            <div class="form-field">
              <label>Video / Link URL</label>
              <input class="form-input" [(ngModel)]="syllabusForm.videoUrl" name="videoUrl" placeholder="YouTube / Drive link" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Visible to Students</label>
              <select class="form-select" [(ngModel)]="syllabusForm.visibleToStudents" name="visibleToStudents">
                <option [ngValue]="true">Yes</option>
                <option [ngValue]="false">No</option>
              </select>
            </div>
            <div class="form-field">
              <label>Visible to Parents</label>
              <select class="form-select" [(ngModel)]="syllabusForm.visibleToParents" name="visibleToParents">
                <option [ngValue]="false">No</option>
                <option [ngValue]="true">Yes</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-primary" (click)="uploadSyllabusMaterial()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Upload Material
            </button>
            <button class="btn-secondary" (click)="resetSyllabusForm()">Reset</button>
          </div>
        </div>
      </div>

      <!-- Materials Display -->
      <div class="content-card">
        <div class="material-list">
          <div *ngIf="isLoadingSyllabusMaterials" class="empty-state">
            <p>Loading content...</p>
          </div>
          <div *ngIf="!isLoadingSyllabusMaterials && filteredSyllabusMaterials.length === 0" class="empty-state">
            <p>No materials uploaded yet</p>
          </div>
          
          <div class="content-grid">
            <div class="content-item" *ngFor="let material of filteredSyllabusMaterials">
              <div class="material-header">
                <div class="material-icon">{{ getIconForType(material.type) }}</div>
                <div class="material-info">
                  <div class="material-title">{{ material.title }}</div>
                  <div class="material-meta">{{ material.type }} • {{ material.unit || 'General' }} • {{ material.topicName || 'N/A' }}</div>
                  <div class="material-visibility">
                    <span *ngIf="material.visibleToStudents" class="badge visible">👁 Students</span>
                    <span *ngIf="material.visibleToParents" class="badge visible">👨‍👩‍👧 Parents</span>
                  </div>
                </div>
              </div>
              <div class="material-actions">
                <button class="action-btn" (click)="editSyllabusMaterial(material)">Edit</button>
                <button class="action-btn delete" (click)="deleteSyllabusMaterial(material)">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .syllabus-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .syllabus-upload-card, .content-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      padding: 24px;
    }

    .card-header {
      margin-bottom: 20px;
    }

    .card-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .card-subtitle {
      font-size: 13px;
      color: var(--text-gray);
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-field label {
      font-size: 13px;
      font-weight: 600;
    }

    .form-select, .form-input {
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      color: var(--text-white);
      font-size: 13px;
    }

    .textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 8px;
    }

    .btn-primary, .btn-secondary {
      flex: 1;
      padding: 10px 16px;
      border-radius: 8px;
      border: 1px solid var(--border-gray);
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .btn-primary {
      background: var(--accent-green);
      color: #000;
      border-color: var(--accent-green);
    }

    .btn-primary:hover {
      background: #0ea578;
    }

    .btn-secondary {
      background: var(--secondary-bg);
      color: var(--text-white);
    }

    .btn-secondary:hover {
      border-color: var(--accent-green);
    }

    .material-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .empty-state {
      padding: 40px 20px;
      text-align: center;
      color: var(--text-gray);
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .content-item {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      align-items: start;
    }

    .material-header {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .material-icon {
      font-size: 24px;
      min-width: 40px;
      text-align: center;
    }

    .material-info {
      flex: 1;
    }

    .material-title {
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .material-meta {
      font-size: 12px;
      color: var(--text-gray);
      margin-bottom: 6px;
    }

    .material-visibility {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .badge {
      font-size: 11px;
      padding: 4px 8px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 4px;
      color: var(--accent-green);
    }

    .material-actions {
      display: flex;
      gap: 6px;
      flex-direction: column;
    }

    .action-btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
    }

    .action-btn:hover {
      border-color: var(--accent-green);
    }

    .action-btn.delete {
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.25);
    }

    .action-btn.delete:hover {
      border-color: #ef4444;
    }
  `]
})
export class SyllabusMaterialsComponent implements OnInit {
  @Input() selectedSectionId: number | null = null;
  @Input() sectionSubjects: Subject[] = [];
  @Output() materialsLoaded = new EventEmitter<any[]>();

  syllabusForm = {
    subject: null as number | null,
    type: '',
    title: '',
    unit: '',
    topic: '',
    description: '',
    videoUrl: '',
    visibleToStudents: true,
    visibleToParents: false,
    file: null as any
  };

  syllabusMaterials: any[] = [];
  isLoadingSyllabusMaterials = false;
  syllabusFilterSubject = '';
  syllabusFilterType = '';
  syllabusFilterUnit = '';
  syllabusFilterTopic = '';

  get filteredSyllabusMaterials(): any[] {
    return this.syllabusMaterials.filter(material => {
      if (this.syllabusFilterSubject && material.subjectId !== this.syllabusFilterSubject) return false;
      if (this.syllabusFilterType && material.type !== this.syllabusFilterType) return false;
      if (this.syllabusFilterUnit && material.unit !== this.syllabusFilterUnit) return false;
      if (this.syllabusFilterTopic && material.topicName !== this.syllabusFilterTopic) return false;
      return true;
    });
  }

  constructor(
    private subjectContentService: SubjectContentService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this.selectedSectionId) {
      this.loadSyllabusMaterials();
    }
  }

  ngOnChanges(): void {
    if (this.selectedSectionId) {
      this.loadSyllabusMaterials();
    }
  }

  loadSyllabusMaterials(): void {
    if (!this.selectedSectionId || this.sectionSubjects.length === 0) return;

    this.isLoadingSyllabusMaterials = true;
    
    // Load materials for each subject in this section
    const subjectIds = this.sectionSubjects.map(s => s.id).filter(id => id !== undefined) as number[];
    const requests = subjectIds.map(subjectId => 
      this.subjectContentService.getBySubject(subjectId, 'TEACHER').toPromise()
    );

    Promise.all(requests).then((results: any[]) => {
      this.isLoadingSyllabusMaterials = false;
      const allMaterials: any[] = [];
      
      results.forEach((result: any) => {
        if (result && result.ok && Array.isArray(result.data)) {
          allMaterials.push(...result.data);
        } else if (result && Array.isArray(result)) {
          allMaterials.push(...result);
        }
      });

      this.syllabusMaterials = allMaterials;
      this.materialsLoaded.emit(this.syllabusMaterials);
    }).catch((err: any) => {
      this.isLoadingSyllabusMaterials = false;
      console.error('Error loading syllabus materials:', err);
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.syllabusForm.file = file;
    }
  }

  getIconForType(type: string): string {
    const icons: { [key: string]: string } = {
      SYLLABUS: '📋',
      NOTES: '📝',
      NOTE: '📝',
      VIDEO: '🎥',
      PPT: '🎪',
      REFERENCE: '📚'
    };
    return icons[type] || '📄';
  }

  uploadSyllabusMaterial(): void {
    if (!this.syllabusForm.subject || !this.syllabusForm.type || !this.syllabusForm.title) {
      alert('Please fill in required fields (Subject, Type, Title)');
      return;
    }

    const content: any = {
      subjectId: this.syllabusForm.subject,
      sectionId: this.selectedSectionId,
      type: this.syllabusForm.type,
      title: this.syllabusForm.title,
      unit: this.syllabusForm.unit || '',
      topicName: this.syllabusForm.topic || '',
      description: this.syllabusForm.description || '',
      linkUrl: this.syllabusForm.videoUrl || '',
      visibleToStudents: this.syllabusForm.visibleToStudents,
      visibleToParents: this.syllabusForm.visibleToParents,
      teacherEditable: true
    };

    this.subjectContentService.createContent(content).subscribe({
      next: () => {
        alert('Material uploaded successfully!');
        this.resetSyllabusForm();
        this.loadSyllabusMaterials();
      },
      error: (err: any) => {
        console.error('Error uploading material:', err);
        alert('Error uploading material');
      }
    });
  }

  resetSyllabusForm(): void {
    this.syllabusForm = {
      subject: null,
      type: '',
      title: '',
      unit: '',
      topic: '',
      description: '',
      videoUrl: '',
      visibleToStudents: true,
      visibleToParents: false,
      file: null
    };
  }

  editSyllabusMaterial(material: any): void {
    console.log('Edit syllabus material:', material);
  }

  deleteSyllabusMaterial(material: any): void {
    if (confirm(`Delete "${material.title}"?`)) {
      this.subjectContentService.deleteContent(material.id).subscribe({
        next: () => {
          alert('Material deleted successfully!');
          this.loadSyllabusMaterials();
        },
        error: (err: any) => {
          console.error('Error deleting material:', err);
          alert('Error deleting material');
        }
      });
    }
  }
}
