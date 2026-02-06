import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { EntityService, Entity } from '../../services/entity.service';
import { AdmissionService, StudentAdmission, TeacherAdmission } from '../../services/admission.service';
import { SubjectService, Course, ClassEntity, Section } from '../../services/subject.service';
import { StudentService } from '../../services/student.service';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-admissions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  template: `
    <div class="page" [style.--entity-primary-color]="(entity && entity.primaryColor) || '#10b981'">
      <!-- Top Nav -->
      <header class="nav">
        <div class="nav-left">
          <a class="brand" [routerLink]="getDashboardRoute()">
            <svg class="brand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="brand-text">LMS</span>
          </a>
        </div>
        <div class="nav-center">
          <div class="breadcrumb">
            <span class="breadcrumb-link" [routerLink]="getDashboardRoute()">Dashboard</span>
            <span class="breadcrumb-separator">›</span>
            <span class="breadcrumb-current">Admissions</span>
          </div>
        </div>
        <div class="nav-right">
          <button class="icon-btn" (click)="toggleTheme()" aria-label="Toggle theme">
            <svg *ngIf="isDarkMode" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg *ngIf="!isDarkMode" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button class="user-trigger" type="button" (click)="toggleUserMenu($event)" aria-label="Open user menu">
            <div class="avatar" [style.background-image]="profileImage ? 'url(' + profileImage + ')' : 'none'">
              <span *ngIf="!profileImage">{{ userInitial }}</span>
            </div>
            <div class="user-block">
              <div class="user-name">{{ userName }}</div>
              <div class="user-badge">{{ userRole }}</div>
            </div>
          </button>

          <div class="user-menu" *ngIf="isUserMenuOpen">
            <div class="user-menu-head">
              <div class="menu-avatar" [style.background-image]="profileImage ? 'url(' + profileImage + ')' : 'none'">
                <span *ngIf="!profileImage">{{ userInitial }}</span>
              </div>
              <div class="menu-meta">
                <div class="menu-name">{{ userName }}</div>
                <div class="menu-email">{{ userEmail }}</div>
              </div>
            </div>
            <div class="menu-divider"></div>
            <button class="menu-item" (click)="goProfile()">
              <span class="mi-ico">👤</span>
              <span>Profile</span>
            </button>
            <button class="menu-item" (click)="logout()">
              <span class="mi-ico">↩</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main class="content">
        <!-- Entity Header -->
        <div class="entity-header-card" *ngIf="entity">
          <div class="entity-header-left">
            <div class="entity-header-icon">
              <img *ngIf="entity.logoUrl" [src]="entity.logoUrl" alt="Logo" class="entity-logo-img" />
              <span *ngIf="!entity.logoUrl">🏢</span>
            </div>
            <div class="entity-header-info">
              <div class="entity-header-title">
                <h1>{{ entity.name || 'Loading...' }}</h1>
                <span class="status-badge active" *ngIf="entity.status === 'active'">{{ entity.status }}</span>
              </div>
              <div class="entity-header-meta">
                <span class="type-badge">{{ entity.type }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Admissions Section Header -->
        <div class="dashboard-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Admissions</h2>
              <p class="section-subtitle">Manage student and teacher admissions, review applications, and approve enrollments</p>
            </div>
          </div>

          <!-- Main Tabs: Student Admission & Teacher Admission -->
          <div class="main-tabs">
          <button class="main-tab" [class.active]="mainTab === 'student'" (click)="switchMainTab('student')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Student Admission
          </button>
          <button class="main-tab" [class.active]="mainTab === 'teacher'" (click)="switchMainTab('teacher')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Teacher Admission
          </button>
          </div>
        </div>

        <!-- Student Admission Section -->
        <div *ngIf="mainTab === 'student'" class="admission-section">
          <!-- Sub-tabs for Student -->
          <div class="sub-tabs">
            <button class="sub-tab" [class.active]="studentSubTab === 'new'" (click)="studentSubTab = 'new'">
              New Admission
            </button>
            <button class="sub-tab" [class.active]="studentSubTab === 'pending'" (click)="loadStudentAdmissions('pending')">
              Pending Applications
            </button>
            <button class="sub-tab" [class.active]="studentSubTab === 'approved'" (click)="loadStudentAdmissions('approved')">
              Approved Students
            </button>
            <button class="sub-tab" [class.active]="studentSubTab === 'rejected'" (click)="loadStudentAdmissions('rejected')">
              Rejected / Hold
            </button>
          </div>

          <!-- New Student Admission Form -->
          <div *ngIf="studentSubTab === 'new'" class="form-section">
            <div class="section-header">
              <h2>New Student Admission</h2>
              <p>Fill in the student details to create a new admission application</p>
            </div>
            <form (ngSubmit)="submitStudentAdmission()" class="admission-form">
              <div class="form-row">
                <div class="form-group">
                  <label>First Name *</label>
                  <input type="text" class="form-input" [(ngModel)]="studentForm.firstName" name="firstName" required />
                </div>
                <div class="form-group">
                  <label>Last Name *</label>
                  <input type="text" class="form-input" [(ngModel)]="studentForm.lastName" name="lastName" required />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" class="form-input" [(ngModel)]="studentForm.email" name="email" required />
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input type="tel" class="form-input" [(ngModel)]="studentForm.phone" name="phone" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Course *</label>
                  <select class="form-input" [(ngModel)]="studentForm.courseId" name="courseId" (change)="onAdmissionCourseChange()" [disabled]="isLoadingAdmissionCourses" required>
                    <option [value]="null" disabled selected>-- Select Course --</option>
                    <option *ngFor="let course of admissionCourses" [value]="course.id">{{ course.name }}</option>
                  </select>
                  <div *ngIf="isLoadingAdmissionCourses" style="color: var(--text-gray); font-size: 12px; margin-top: 4px;">Loading courses...</div>
                  <div *ngIf="!isLoadingAdmissionCourses && admissionCourses.length === 0" style="color: #ef4444; font-size: 12px; margin-top: 4px;">No courses available</div>
                  <div *ngIf="!isLoadingAdmissionCourses && admissionCourses.length > 0" style="color: #10b981; font-size: 12px; margin-top: 4px;">{{ admissionCourses.length }} course(s) available</div>
                </div>
                <div class="form-group">
                  <label>Academic Year</label>
                  <input type="text" class="form-input" [(ngModel)]="studentForm.academicYear" name="academicYear" placeholder="2024-2025" />
                </div>
              </div>
              <div class="form-group">
                <label>Address</label>
                <textarea class="form-input" [(ngModel)]="studentForm.address" name="address" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label>Previous Qualification</label>
                <textarea class="form-input" [(ngModel)]="studentForm.previousQualification" name="previousQualification" rows="3"></textarea>
              </div>

              <!-- Document Upload Section -->
              <div class="documents-section">
                <h3>Documents</h3>
                <div class="doc-grid">
                  <div class="doc-item">
                    <label>ID Proof</label>
                    <input type="file" #idProofInput (change)="onFileSelect($event, 'student', 'idProof')" accept="image/*,.pdf" style="display: none;" />
                    <button type="button" class="doc-upload-btn" (click)="idProofInput.click()">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 10L12 5L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Upload
                    </button>
                    <img *ngIf="studentForm.idProof" [src]="studentForm.idProof" class="doc-preview" />
                  </div>
                  <div class="doc-item">
                    <label>Marksheet</label>
                    <input type="file" #marksheetInput (change)="onFileSelect($event, 'student', 'marksheet')" accept="image/*,.pdf" style="display: none;" />
                    <button type="button" class="doc-upload-btn" (click)="marksheetInput.click()">Upload</button>
                    <img *ngIf="studentForm.marksheet" [src]="studentForm.marksheet" class="doc-preview" />
                  </div>
                  <div class="doc-item">
                    <label>TC / LC</label>
                    <input type="file" #tcLcInput (change)="onFileSelect($event, 'student', 'tcLc')" accept="image/*,.pdf" style="display: none;" />
                    <button type="button" class="doc-upload-btn" (click)="tcLcInput.click()">Upload</button>
                    <img *ngIf="studentForm.tcLc" [src]="studentForm.tcLc" class="doc-preview" />
                  </div>
                  <div class="doc-item">
                    <label>Photo</label>
                    <input type="file" #photoInput (change)="onFileSelect($event, 'student', 'photo')" accept="image/*" style="display: none;" />
                    <button type="button" class="doc-upload-btn" (click)="photoInput.click()">Upload</button>
                    <img *ngIf="studentForm.photo" [src]="studentForm.photo" class="doc-preview" />
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary" (click)="resetStudentForm()">Reset</button>
                <button type="submit" class="btn-primary" [disabled]="isSubmittingStudent">
                  {{ isSubmittingStudent ? 'Submitting...' : 'Submit Application' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Student Admissions List -->
          <div *ngIf="studentSubTab !== 'new'" class="list-section">
            <div class="section-header">
              <h2>{{ getStudentSubTabTitle() }}</h2>
              <button class="btn-primary" (click)="studentSubTab = 'new'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                New Admission
              </button>
            </div>

            <div *ngIf="isLoadingStudentAdmissions" class="loading">Loading...</div>
            <div *ngIf="!isLoadingStudentAdmissions && studentAdmissions.length === 0" class="empty-state">
              <p>No {{ studentSubTab }} applications found</p>
            </div>

            <div *ngIf="!isLoadingStudentAdmissions && studentAdmissions.length > 0" class="admissions-list">
              <div class="admission-card" *ngFor="let admission of studentAdmissions">
                <div class="card-header">
                  <div class="card-title">
                    <div class="student-avatar">
                      <img *ngIf="admission.photo" [src]="admission.photo" />
                      <span *ngIf="!admission.photo">{{ (admission.firstName && admission.firstName.charAt(0)) || 'S' }}{{ (admission.lastName && admission.lastName.charAt(0)) || '' }}</span>
                    </div>
                    <div>
                      <h3>{{ admission.firstName }} {{ admission.lastName }}</h3>
                      <p>{{ admission.email }}</p>
                    </div>
                  </div>
                  <span class="status-badge" [class]="'status-' + admission.status">{{ admission.status | titlecase }}</span>
                </div>
                <div class="card-body">
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">Course:</span>
                      <span class="info-value">{{ getCourseNameForAdmission(admission) || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Academic Year:</span>
                      <span class="info-value">{{ admission.academicYear || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Phone:</span>
                      <span class="info-value">{{ admission.phone || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Submitted:</span>
                      <span class="info-value">{{ formatDate(admission.submittedAt) }}</span>
                    </div>
                  </div>
                  <div *ngIf="admission.adminRemark" class="remark-section">
                    <strong>Admin Remark:</strong> {{ admission.adminRemark }}
                  </div>
                </div>
                <div class="card-actions" *ngIf="admission.status === 'submitted' || admission.status === 'under_review'">
                  <button class="btn-approve" (click)="approveStudentAdmission(admission.id!)">
                    ✅ Approve
                  </button>
                  <button class="btn-reject" (click)="rejectStudentAdmission(admission.id!)">
                    ❌ Reject
                  </button>
                  <button class="btn-correction" (click)="openCorrectionModal(admission)">
                    🔄 Correction Required
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Teacher Admission Section -->
        <div *ngIf="mainTab === 'teacher'" class="admission-section">
          <!-- Sub-tabs for Teacher -->
          <div class="sub-tabs">
            <button class="sub-tab" [class.active]="teacherSubTab === 'new'" (click)="teacherSubTab = 'new'">
              New Onboarding
            </button>
            <button class="sub-tab" [class.active]="teacherSubTab === 'pending'" (click)="loadTeacherAdmissions('pending')">
              Pending Verification
            </button>
            <button class="sub-tab" [class.active]="teacherSubTab === 'approved'" (click)="loadTeacherAdmissions('approved')">
              Approved Teachers
            </button>
            <button class="sub-tab" [class.active]="teacherSubTab === 'rejected'" (click)="loadTeacherAdmissions('rejected')">
              Rejected / Hold
            </button>
          </div>

          <!-- New Teacher Admission Form -->
          <div *ngIf="teacherSubTab === 'new'" class="form-section">
            <div class="section-header">
              <h2>New Teacher Onboarding</h2>
              <p>Fill in the teacher details to create a new onboarding application</p>
            </div>
            <form (ngSubmit)="submitTeacherAdmission()" class="admission-form">
              <div class="form-row">
                <div class="form-group">
                  <label>First Name *</label>
                  <input type="text" class="form-input" [(ngModel)]="teacherForm.firstName" name="firstName" required />
                </div>
                <div class="form-group">
                  <label>Last Name *</label>
                  <input type="text" class="form-input" [(ngModel)]="teacherForm.lastName" name="lastName" required />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" class="form-input" [(ngModel)]="teacherForm.email" name="email" required />
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input type="tel" class="form-input" [(ngModel)]="teacherForm.phone" name="phone" />
                </div>
              </div>
              <div class="form-group">
                <label>Qualification</label>
                <textarea class="form-input" [(ngModel)]="teacherForm.qualification" name="qualification" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label>Experience</label>
                <textarea class="form-input" [(ngModel)]="teacherForm.experience" name="experience" rows="3"></textarea>
              </div>

              <!-- Document Upload Section -->
              <div class="documents-section">
                <h3>Documents</h3>
                <div class="doc-grid">
                  <div class="doc-item">
                    <label>ID Proof</label>
                    <input type="file" #teacherIdProofInput (change)="onFileSelect($event, 'teacher', 'idProof')" accept="image/*,.pdf" style="display: none;" />
                    <button type="button" class="doc-upload-btn" (click)="teacherIdProofInput.click()">Upload</button>
                    <img *ngIf="teacherForm.idProof" [src]="teacherForm.idProof" class="doc-preview" />
                  </div>
                  <div class="doc-item">
                    <label>Degree Certificate</label>
                    <input type="file" #degreeInput (change)="onFileSelect($event, 'teacher', 'degreeCertificate')" accept="image/*,.pdf" style="display: none;" />
                    <button type="button" class="doc-upload-btn" (click)="degreeInput.click()">Upload</button>
                    <img *ngIf="teacherForm.degreeCertificate" [src]="teacherForm.degreeCertificate" class="doc-preview" />
                  </div>
                  <div class="doc-item">
                    <label>Resume</label>
                    <input type="file" #resumeInput (change)="onFileSelect($event, 'teacher', 'resume')" accept="image/*,.pdf" style="display: none;" />
                    <button type="button" class="doc-upload-btn" (click)="resumeInput.click()">Upload</button>
                    <img *ngIf="teacherForm.resume" [src]="teacherForm.resume" class="doc-preview" />
                  </div>
                  <div class="doc-item">
                    <label>Photo</label>
                    <input type="file" #teacherPhotoInput (change)="onFileSelect($event, 'teacher', 'photo')" accept="image/*" style="display: none;" />
                    <button type="button" class="doc-upload-btn" (click)="teacherPhotoInput.click()">Upload</button>
                    <img *ngIf="teacherForm.photo" [src]="teacherForm.photo" class="doc-preview" />
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary" (click)="resetTeacherForm()">Reset</button>
                <button type="submit" class="btn-primary" [disabled]="isSubmittingTeacher">
                  {{ isSubmittingTeacher ? 'Submitting...' : 'Submit Application' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Teacher Admissions List -->
          <div *ngIf="teacherSubTab !== 'new'" class="list-section">
            <div class="section-header">
              <h2>{{ getTeacherSubTabTitle() }}</h2>
              <button class="btn-primary" (click)="teacherSubTab = 'new'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                New Onboarding
              </button>
            </div>

            <div *ngIf="isLoadingTeacherAdmissions" class="loading">Loading...</div>
            <div *ngIf="!isLoadingTeacherAdmissions && teacherAdmissions.length === 0" class="empty-state">
              <p>No {{ teacherSubTab }} applications found</p>
            </div>

            <div *ngIf="!isLoadingTeacherAdmissions && teacherAdmissions.length > 0" class="admissions-list">
              <div class="admission-card" *ngFor="let admission of teacherAdmissions">
                <div class="card-header">
                  <div class="card-title">
                    <div class="teacher-avatar">
                      <img *ngIf="admission.photo" [src]="admission.photo" />
                      <span *ngIf="!admission.photo">{{ (admission.firstName && admission.firstName.charAt(0)) || 'T' }}{{ (admission.lastName && admission.lastName.charAt(0)) || '' }}</span>
                    </div>
                    <div>
                      <h3>{{ admission.firstName }} {{ admission.lastName }}</h3>
                      <p>{{ admission.email }}</p>
                    </div>
                  </div>
                  <span class="status-badge" [class]="'status-' + admission.status">{{ admission.status | titlecase }}</span>
                </div>
                <div class="card-body">
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">Qualification:</span>
                      <span class="info-value">{{ admission.qualification || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Experience:</span>
                      <span class="info-value">{{ admission.experience || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Phone:</span>
                      <span class="info-value">{{ admission.phone || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Submitted:</span>
                      <span class="info-value">{{ formatDate(admission.submittedAt) }}</span>
                    </div>
                  </div>
                  <div *ngIf="admission.adminRemark" class="remark-section">
                    <strong>Admin Remark:</strong> {{ admission.adminRemark }}
                  </div>
                </div>
                <div class="card-actions" *ngIf="admission.status === 'submitted' || admission.status === 'under_review'">
                  <button class="btn-approve" (click)="approveTeacherAdmission(admission.id!)">
                    ✅ Approve
                  </button>
                  <button class="btn-reject" (click)="rejectTeacherAdmission(admission.id!)">
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <app-footer></app-footer>
    </div>

    <!-- Approval/Rejection Modal -->
    <div class="modal-overlay" *ngIf="showActionModal" (click)="closeActionModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ actionModalTitle }}</h2>
          <button class="close-btn" (click)="closeActionModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Remark (Optional)</label>
            <textarea class="form-input" [(ngModel)]="actionRemark" rows="4" placeholder="Enter any remarks..."></textarea>
          </div>
          <div *ngIf="currentAction === 'approve' && mainTab === 'student'">
            <div class="form-group">
              <label>Course *</label>
              <select class="form-input" [(ngModel)]="selectedCourseId" (change)="onCourseChange()" [disabled]="isLoadingCourses">
                <option value="">Select Course</option>
                <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
              </select>
              <div *ngIf="isLoadingCourses" style="color: var(--text-gray); font-size: 12px; margin-top: 4px;">Loading courses...</div>
              <div *ngIf="!isLoadingCourses && courses.length === 0" style="color: var(--text-gray); font-size: 12px; margin-top: 4px;">No courses found</div>
            </div>
            <div class="form-group" *ngIf="selectedCourseId">
              <label>Class *</label>
              <select class="form-input" [(ngModel)]="selectedClassId" (change)="onClassChange()" [disabled]="isLoadingClasses">
                <option value="">Select Class</option>
                <option *ngFor="let classItem of classes" [value]="classItem.id">{{ classItem.name }}</option>
              </select>
            </div>
            <div class="form-group" *ngIf="selectedClassId">
              <label>Section *</label>
              <select class="form-input" [(ngModel)]="selectedSectionId" (change)="onSectionChange()" [disabled]="isLoadingSections">
                <option value="">Select Section</option>
                <option *ngFor="let section of sections" [value]="section.id">{{ section.name }}</option>
              </select>
            </div>
            <div class="form-row" *ngIf="selectedSectionId">
              <div class="form-group">
                <label>Roll Number</label>
                <input type="text" class="form-input" [(ngModel)]="rollNumber" [readonly]="true" placeholder="Auto-generated" />
              </div>
              <div class="form-group">
                <label>Class Section</label>
                <input type="text" class="form-input" [(ngModel)]="classSection" [readonly]="true" />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeActionModal()">Cancel</button>
          <button class="btn-primary" (click)="confirmAction()">Confirm</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Base styles from admin-dashboard */
    .page {
      background: var(--primary-bg);
      color: var(--text-white);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .nav {
      height: 64px;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      padding: 0 24px;
      border-bottom: 1px solid var(--border-gray);
      position: sticky;
      top: 0;
      background: var(--primary-bg);
      z-index: 100;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text-white);
      font-weight: 700;
      text-decoration: none;
    }
    .brand-icon { width: 28px; height: 28px; }
    .brand-text { font-size: 18px; }

    .nav-center { display: flex; justify-content: center; }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }
    .breadcrumb-link {
      color: var(--text-gray);
      cursor: pointer;
      text-decoration: none;
    }
    .breadcrumb-link:hover { color: var(--text-white); }
    .breadcrumb-separator { color: var(--text-gray); }
    .breadcrumb-current { color: var(--text-white); }

    .nav-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
    }

    .icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .icon-btn:hover {
      background: var(--card-bg);
      border-color: var(--accent-green);
    }

    .user-trigger {
      display: flex;
      align-items: center;
      gap: 10px;
      background: transparent;
      padding: 6px 8px;
      border-radius: 14px;
      border: 1px solid transparent;
      color: var(--text-white);
      cursor: pointer;
    }
    .user-trigger:hover {
      border-color: var(--border-gray);
      background: rgba(255, 255, 255, 0.02);
    }

    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--secondary-bg);
      background-size: cover;
      background-position: center;
      border: 1px solid var(--border-gray);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: var(--text-white);
      text-transform: uppercase;
    }

    .user-block { display: flex; flex-direction: column; gap: 2px; }
    .user-name { font-weight: 600; font-size: 14px; line-height: 1; }
    .user-badge {
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #10b981;
      font-weight: 700;
      width: fit-content;
    }

    .user-menu {
      position: absolute;
      right: 18px;
      top: 58px;
      width: 320px;
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      z-index: 200;
    }
    .user-menu-head {
      display: flex;
      gap: 12px;
      padding: 14px;
      align-items: center;
    }
    .menu-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--secondary-bg);
      background-size: cover;
      background-position: center;
      border: 1px solid var(--border-gray);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      text-transform: uppercase;
      color: var(--text-white);
    }
    .menu-name { font-weight: 900; font-size: 18px; }
    .menu-email { color: var(--text-gray); font-weight: 600; }
    .menu-divider { height: 1px; background: var(--border-gray); }
    .menu-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      background: transparent;
      color: var(--text-white);
      border: none;
      text-align: left;
      font-weight: 800;
      font-size: 18px;
      cursor: pointer;
    }
    .menu-item:hover { background: rgba(255, 255, 255, 0.04); }
    .mi-ico {
      width: 34px;
      height: 34px;
      border-radius: 12px;
      background: var(--secondary-bg);
      border: 1px solid var(--border-gray);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .content {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .entity-header-card {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .entity-header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .entity-header-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      background: var(--secondary-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      border: 1px solid var(--border-gray);
    }
    .entity-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 12px;
    }
    .entity-header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .entity-header-title h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 900;
    }

    .dashboard-section {
      margin-bottom: 24px;
    }
    .section-header {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 6px;
    }
    .section-subtitle {
      color: var(--text-gray);
      font-weight: 600;
    }
    .status-badge {
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .status-badge.active {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #10b981;
    }
    .type-badge {
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.25);
      color: #3b82f6;
      font-size: 12px;
      font-weight: 700;
    }

    .main-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      border-bottom: 2px solid var(--border-gray);
    }
    .main-tab {
      padding: 12px 20px;
      background: transparent;
      border: none;
      color: var(--text-gray);
      font-weight: 700;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .main-tab:hover { color: var(--text-white); }
    .main-tab.active {
      color: var(--accent-green);
      border-bottom-color: var(--accent-green);
    }

    .sub-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .sub-tab {
      padding: 8px 16px;
      border-radius: 10px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .sub-tab:hover {
      border-color: var(--accent-green);
      background: var(--card-bg);
    }
    .sub-tab.active {
      background: var(--accent-green);
      border-color: var(--accent-green);
      color: white;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .section-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 900;
    }
    .section-header p {
      margin: 4px 0 0 0;
      color: var(--text-gray);
    }

    .admission-form {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 24px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      color: var(--text-white);
      font-weight: 700;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .form-input {
      width: 100%;
      padding: 12px 14px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 10px;
      color: var(--text-white);
      outline: none;
      font-size: 14px;
      box-sizing: border-box;
    }
    .form-input:focus {
      border-color: var(--accent-green);
    }

    .documents-section {
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1px solid var(--border-gray);
    }
    .documents-section h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 900;
    }
    .doc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .doc-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .doc-upload-btn {
      padding: 10px 16px;
      border-radius: 10px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .doc-upload-btn:hover {
      border-color: var(--accent-green);
      background: var(--card-bg);
    }
    .doc-preview {
      width: 100%;
      max-height: 150px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid var(--border-gray);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    .btn-primary {
      padding: 12px 24px;
      border-radius: 12px;
      background: var(--accent-green);
      color: white;
      font-weight: 800;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--accent-green-dark);
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-secondary {
      padding: 12px 24px;
      border-radius: 12px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 800;
      cursor: pointer;
    }
    .btn-secondary:hover {
      border-color: rgba(148, 163, 184, 0.5);
    }

    .admissions-list {
      display: grid;
      gap: 16px;
    }
    .admission-card {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 20px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .card-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .student-avatar,
    .teacher-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--secondary-bg);
      border: 1px solid var(--border-gray);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      color: var(--text-white);
      text-transform: uppercase;
      overflow: hidden;
    }
    .student-avatar img,
    .teacher-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .card-title h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 900;
    }
    .card-title p {
      margin: 4px 0 0 0;
      color: var(--text-gray);
      font-size: 14px;
    }
    .status-badge.status-submitted {
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.25);
      color: #3b82f6;
    }
    .status-badge.status-approved {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #10b981;
    }
    .status-badge.status-rejected {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
    }
    .status-badge.status-under_review {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.25);
      color: #f59e0b;
    }
    .status-badge.status-correction_required {
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(168, 85, 247, 0.25);
      color: #a855f7;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 12px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-label {
      color: var(--text-gray);
      font-size: 12px;
      font-weight: 700;
    }
    .info-value {
      color: var(--text-white);
      font-weight: 600;
    }
    .remark-section {
      padding: 12px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
      margin-top: 12px;
      font-size: 14px;
    }

    .card-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      flex-wrap: wrap;
    }
    .btn-approve {
      padding: 8px 16px;
      border-radius: 8px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #10b981;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-approve:hover {
      background: rgba(16, 185, 129, 0.2);
    }
    .btn-reject {
      padding: 8px 16px;
      border-radius: 8px;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-reject:hover {
      background: rgba(239, 68, 68, 0.2);
    }
    .btn-correction {
      padding: 8px 16px;
      border-radius: 8px;
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(168, 85, 247, 0.25);
      color: #a855f7;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-correction:hover {
      background: rgba(168, 85, 247, 0.2);
    }

    .loading, .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--text-gray);
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 900;
    }
    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-white);
      font-size: 32px;
      cursor: pointer;
      line-height: 1;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
    }

    .admission-section {
      width: 100%;
    }

    .form-section,
    .list-section {
      width: 100%;
      margin-bottom: 24px;
    }

    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
      .doc-grid { grid-template-columns: 1fr; }
      .info-grid { grid-template-columns: 1fr; }
      .card-actions { flex-direction: column; }
      .card-actions button { width: 100%; }
      .content { padding: 16px; }
    }
  `]
})
export class AdmissionsComponent implements OnInit {
  // User info
  isDarkMode = true;
  userName = '';
  userEmail = '';
  userInitial = '';
  userRole = '';
  isUserMenuOpen = false;
  profileImage = '';

  // Entity info
  entity: Entity | null = null;
  entityId: number = 0;

  // Tabs
  mainTab: 'student' | 'teacher' = 'student';
  studentSubTab: 'new' | 'pending' | 'approved' | 'rejected' = 'new';
  teacherSubTab: 'new' | 'pending' | 'approved' | 'rejected' = 'new';

  // Forms
  studentForm: Partial<StudentAdmission> = {};
  teacherForm: Partial<TeacherAdmission> = {};
  
  // Courses for admission form
  admissionCourses: Course[] = [];
  isLoadingAdmissionCourses = false;

  // Lists
  studentAdmissions: StudentAdmission[] = [];
  teacherAdmissions: TeacherAdmission[] = [];
  isLoadingStudentAdmissions = false;
  isLoadingTeacherAdmissions = false;

  // Submission
  isSubmittingStudent = false;
  isSubmittingTeacher = false;

  // Action modal
  showActionModal = false;
  currentAction: 'approve' | 'reject' | 'correction' = 'approve';
  currentAdmissionId: number | null = null;
  actionRemark = '';
  actionModalTitle = '';
  rollNumber = '';
  classSection = '';
  
  // Course/Class/Section for approval
  courses: Course[] = [];
  classes: ClassEntity[] = [];
  sections: Section[] = [];
  selectedCourseId: number | null = null;
  selectedClassId: number | null = null;
  selectedSectionId: number | null = null;
  isLoadingCourses = false;
  isLoadingClasses = false;
  isLoadingSections = false;
  currentYear = new Date().getFullYear();

  constructor(
    private theme: ThemeService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private entityService: EntityService,
    private profileService: ProfileService,
    private admissionService: AdmissionService,
    private subjectService: SubjectService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.isDarkMode = this.theme.getCurrentTheme();
    const user = this.auth.getUser();
    if (user?.name) this.userName = user.name;
    if (user?.email) this.userEmail = user.email;
    if (user?.role) this.userRole = user.role;
    if (user?.name) this.userInitial = user.name.charAt(0).toUpperCase();

    this.loadProfileImage();
    this.loadEntity();
  }
  
  loadAdmissionCourses(): void {
    if (!this.entityId) {
      console.log('loadAdmissionCourses: Entity ID not available, waiting...');
      // Wait for entity to load
      setTimeout(() => {
        if (this.entityId) {
          this.loadAdmissionCourses();
        } else {
          console.log('loadAdmissionCourses: Entity ID still not available after timeout');
        }
      }, 500);
      return;
    }
    console.log('loadAdmissionCourses: Loading courses for entity ID:', this.entityId);
    this.isLoadingAdmissionCourses = true;
    this.subjectService.getCoursesByEntity(this.entityId).subscribe({
      next: (result) => {
        this.isLoadingAdmissionCourses = false;
        console.log('loadAdmissionCourses: Full API response:', JSON.stringify(result, null, 2));
        if (result.ok) {
          if (result.data && Array.isArray(result.data)) {
            this.admissionCourses = result.data.filter((c: Course) => c.status !== 'inactive');
            console.log('loadAdmissionCourses: Courses loaded (from data):', this.admissionCourses.length, 'courses');
            console.log('loadAdmissionCourses: Course names:', this.admissionCourses.map(c => c.name));
          } else if (Array.isArray(result)) {
            this.admissionCourses = result.filter((c: Course) => c.status !== 'inactive');
            console.log('loadAdmissionCourses: Courses loaded (direct array):', this.admissionCourses.length, 'courses');
          } else if (result.courses && Array.isArray(result.courses)) {
            this.admissionCourses = result.courses.filter((c: Course) => c.status !== 'inactive');
            console.log('loadAdmissionCourses: Courses loaded (from courses):', this.admissionCourses.length, 'courses');
          } else {
            console.log('loadAdmissionCourses: Unexpected response format, no courses found');
            this.admissionCourses = [];
          }
        } else {
          console.log('loadAdmissionCourses: API returned error:', result.message);
          this.admissionCourses = [];
        }
      },
      error: (err) => {
        this.isLoadingAdmissionCourses = false;
        console.error('loadAdmissionCourses: Error loading courses:', err);
        console.error('loadAdmissionCourses: Error details:', err.error);
        this.admissionCourses = [];
      }
    });
  }
  
  onAdmissionCourseChange(): void {
    // Get course name and set it in classCourse field
    if (this.studentForm.courseId) {
      const courseId = typeof this.studentForm.courseId === 'string' ? parseInt(this.studentForm.courseId) : this.studentForm.courseId;
      const selectedCourse = this.admissionCourses.find(c => c.id === courseId);
      console.log('onAdmissionCourseChange: Selected course ID:', courseId);
      console.log('onAdmissionCourseChange: Selected course:', selectedCourse);
      if (selectedCourse) {
        this.studentForm.classCourse = selectedCourse.name;
        console.log('onAdmissionCourseChange: Course name set to:', this.studentForm.classCourse);
      } else {
        console.log('onAdmissionCourseChange: Course not found in admissionCourses array');
      }
    } else {
      this.studentForm.classCourse = '';
    }
  }

  loadEntity(): void {
    const user = this.auth.getUser();
    if (user?.collegeId) {
      this.entityId = user.collegeId;
      console.log('loadEntity: Entity ID set to:', this.entityId);
      this.entityService.getEntityById(user.collegeId.toString()).subscribe(result => {
        if (result.ok) {
          this.entity = result.entity;
          console.log('loadEntity: Entity loaded:', this.entity);
          // Load courses after entity is loaded
          this.loadAdmissionCourses();
        }
      });
    } else {
      console.log('loadEntity: No collegeId found in user:', user);
    }
  }

  loadProfileImage(): void {
    const user = this.auth.getUser();
    if (user?.email) {
      this.profileService.getProfile(user.email).subscribe(result => {
        if (result.ok && result.profile?.profileImage) {
          this.profileImage = result.profile.profileImage;
        }
      });
    }
  }

  switchMainTab(tab: 'student' | 'teacher'): void {
    this.mainTab = tab;
    if (tab === 'student') {
      this.studentSubTab = 'new';
    } else {
      this.teacherSubTab = 'new';
    }
  }

  loadStudentAdmissions(status: string): void {
    this.studentSubTab = status as any;
    this.isLoadingStudentAdmissions = true;
    const statusMap: any = {
      'pending': 'submitted',
      'approved': 'approved',
      'rejected': 'rejected'
    };
    const apiStatus = statusMap[status] || status;
    this.admissionService.getStudentAdmissionsByStatus(this.entityId, apiStatus).subscribe(result => {
      this.isLoadingStudentAdmissions = false;
      if (result.ok && result.admissions) {
        this.studentAdmissions = result.admissions;
      }
    });
  }

  loadTeacherAdmissions(status: string): void {
    this.teacherSubTab = status as any;
    this.isLoadingTeacherAdmissions = true;
    const statusMap: any = {
      'pending': 'submitted',
      'approved': 'approved',
      'rejected': 'rejected'
    };
    const apiStatus = statusMap[status] || status;
    this.admissionService.getTeacherAdmissionsByStatus(this.entityId, apiStatus).subscribe(result => {
      this.isLoadingTeacherAdmissions = false;
      if (result.ok && result.admissions) {
        this.teacherAdmissions = result.admissions;
      }
    });
  }

  getStudentSubTabTitle(): string {
    const titles: any = {
      'pending': 'Pending Applications',
      'approved': 'Approved Students',
      'rejected': 'Rejected / Hold'
    };
    return titles[this.studentSubTab] || 'Student Admissions';
  }

  getTeacherSubTabTitle(): string {
    const titles: any = {
      'pending': 'Pending Verification',
      'approved': 'Approved Teachers',
      'rejected': 'Rejected / Hold'
    };
    return titles[this.teacherSubTab] || 'Teacher Admissions';
  }

  onFileSelect(event: Event, type: 'student' | 'teacher', field: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'student') {
          (this.studentForm as any)[field] = result;
        } else {
          (this.teacherForm as any)[field] = result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  submitStudentAdmission(): void {
    if (!this.studentForm.firstName || !this.studentForm.lastName || !this.studentForm.email) {
      alert('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }
    if (!this.studentForm.courseId) {
      alert('Please select a course from the dropdown');
      return;
    }
    this.isSubmittingStudent = true;
    this.admissionService.createStudentAdmission(this.entityId, this.studentForm).subscribe(result => {
      this.isSubmittingStudent = false;
      if (result.ok) {
        alert('Student admission application submitted successfully!');
        this.resetStudentForm();
      } else {
        alert(result.message || 'Failed to submit application');
      }
    });
  }

  submitTeacherAdmission(): void {
    if (!this.teacherForm.firstName || !this.teacherForm.lastName || !this.teacherForm.email) {
      alert('Please fill in all required fields');
      return;
    }
    this.isSubmittingTeacher = true;
    this.admissionService.createTeacherAdmission(this.entityId, this.teacherForm).subscribe(result => {
      this.isSubmittingTeacher = false;
      if (result.ok) {
        alert('Teacher admission application submitted successfully!');
        this.resetTeacherForm();
      } else {
        alert(result.message || 'Failed to submit application');
      }
    });
  }

  resetStudentForm(): void {
    this.studentForm = {};
    // Reload courses after reset to ensure they're available
    if (this.entityId) {
      this.loadAdmissionCourses();
    }
  }

  resetTeacherForm(): void {
    this.teacherForm = {};
  }

  approveStudentAdmission(id: number): void {
    this.currentAdmissionId = id;
    this.currentAction = 'approve';
    this.actionModalTitle = 'Approve Student Admission';
    this.actionRemark = '';
    this.rollNumber = '';
    this.classSection = '';
    this.selectedCourseId = null;
    this.selectedClassId = null;
    this.selectedSectionId = null;
    this.courses = [];
    this.classes = [];
    this.sections = [];
    this.loadCourses();
    this.showActionModal = true;
  }
  
  loadCourses(): void {
    if (!this.entityId) {
      console.log('loadCourses: Entity ID not available');
      return;
    }
    console.log('loadCourses: Loading courses for entity ID:', this.entityId);
    this.isLoadingCourses = true;
    this.subjectService.getCoursesByEntity(this.entityId).subscribe({
      next: (result) => {
        this.isLoadingCourses = false;
        console.log('loadCourses: API response:', result);
        if (result.ok) {
          // Handle different response formats
          if (result.data && Array.isArray(result.data)) {
            // Show all courses except inactive ones
            this.courses = result.data.filter((c: Course) => c.status !== 'inactive');
            console.log('loadCourses: Total courses from API:', result.data.length);
            console.log('loadCourses: Active courses:', this.courses.length);
            console.log('loadCourses: Course details:', this.courses.map(c => ({ id: c.id, name: c.name, status: c.status })));
          } else if (Array.isArray(result)) {
            // If result is directly an array
            this.courses = result.filter((c: Course) => c.status !== 'inactive');
            console.log('loadCourses: Courses loaded (direct array):', this.courses.length, 'courses');
          } else if (result.courses && Array.isArray(result.courses)) {
            this.courses = result.courses.filter((c: Course) => c.status !== 'inactive');
            console.log('loadCourses: Courses loaded (from courses):', this.courses.length, 'courses');
          } else {
            console.log('loadCourses: Unexpected response format:', result);
            this.courses = [];
          }
        } else {
          console.log('loadCourses: API returned error:', result.message);
          this.courses = [];
        }
      },
      error: (err) => {
        this.isLoadingCourses = false;
        console.error('Error loading courses:', err);
        console.error('Error details:', err.error);
        this.courses = [];
      }
    });
  }
  
  onCourseChange(): void {
    this.selectedClassId = null;
    this.selectedSectionId = null;
    this.classes = [];
    this.sections = [];
    this.rollNumber = '';
    this.classSection = '';
    
    if (!this.selectedCourseId) return;
    
    this.isLoadingClasses = true;
    const courseId = typeof this.selectedCourseId === 'string' ? parseInt(this.selectedCourseId) : this.selectedCourseId;
    this.subjectService.getClassesByCourse(courseId).subscribe({
      next: (result) => {
        this.isLoadingClasses = false;
        if (result.ok && result.data) {
          this.classes = result.data.filter((c: ClassEntity) => c.status === 'active');
        }
      },
      error: (err) => {
        this.isLoadingClasses = false;
        console.error('Error loading classes:', err);
      }
    });
  }
  
  onClassChange(): void {
    this.selectedSectionId = null;
    this.sections = [];
    this.rollNumber = '';
    this.classSection = '';
    
    if (!this.selectedClassId) return;
    
    this.isLoadingSections = true;
    const classId = typeof this.selectedClassId === 'string' ? parseInt(this.selectedClassId) : this.selectedClassId;
    this.subjectService.getSectionsByClass(classId).subscribe({
      next: (result) => {
        this.isLoadingSections = false;
        if (result.ok && result.data) {
          this.sections = result.data.filter((s: Section) => s.status === 'active');
        }
      },
      error: (err) => {
        this.isLoadingSections = false;
        console.error('Error loading sections:', err);
      }
    });
  }
  
  onSectionChange(): void {
    if (!this.selectedSectionId || !this.selectedCourseId) return;
    
    const sectionId = typeof this.selectedSectionId === 'string' ? parseInt(this.selectedSectionId) : this.selectedSectionId;
    const selectedSection = this.sections.find(s => s.id === sectionId);
    if (selectedSection) {
      this.classSection = selectedSection.name;
    }
    
    // Get course name
    const courseId = typeof this.selectedCourseId === 'string' ? parseInt(this.selectedCourseId) : this.selectedCourseId;
    const selectedCourse = this.courses.find(c => c.id === courseId);
    const courseName = selectedCourse ? selectedCourse.name : '';
    
    // Generate roll number
    this.generateRollNumber(courseName, sectionId);
  }
  
  generateRollNumber(courseName: string, sectionId: number): void {
    if (!this.entityId || !sectionId || !courseName) return;
    
    this.studentService.generateRollNumber(this.entityId, sectionId, courseName, this.currentYear).subscribe({
      next: (result) => {
        if (result.ok && result.rollNumber) {
          this.rollNumber = result.rollNumber;
        } else {
          // Fallback: generate basic roll number
          this.rollNumber = `STUD${this.currentYear}${courseName}01`;
        }
      },
      error: (err) => {
        console.error('Error generating roll number:', err);
        // Fallback: generate basic roll number
        this.rollNumber = `STUD${this.currentYear}${courseName}01`;
      }
    });
  }

  rejectStudentAdmission(id: number): void {
    this.currentAdmissionId = id;
    this.currentAction = 'reject';
    this.actionModalTitle = 'Reject Student Admission';
    this.actionRemark = '';
    this.showActionModal = true;
  }

  openCorrectionModal(admission: StudentAdmission): void {
    this.currentAdmissionId = admission.id!;
    this.currentAction = 'correction';
    this.actionModalTitle = 'Correction Required';
    this.actionRemark = '';
    this.showActionModal = true;
  }

  approveTeacherAdmission(id: number): void {
    this.currentAdmissionId = id;
    this.currentAction = 'approve';
    this.actionModalTitle = 'Approve Teacher Admission';
    this.actionRemark = '';
    this.showActionModal = true;
  }

  rejectTeacherAdmission(id: number): void {
    this.currentAdmissionId = id;
    this.currentAction = 'reject';
    this.actionModalTitle = 'Reject Teacher Admission';
    this.actionRemark = '';
    this.showActionModal = true;
  }

  confirmAction(): void {
    if (!this.currentAdmissionId) return;

    const statusMap: any = {
      'approve': 'approved',
      'reject': 'rejected',
      'correction': 'correction_required'
    };
    const status = statusMap[this.currentAction];

    if (this.mainTab === 'student') {
      const courseId = this.selectedCourseId ? (typeof this.selectedCourseId === 'string' ? parseInt(this.selectedCourseId) : this.selectedCourseId) : undefined;
      const classId = this.selectedClassId ? (typeof this.selectedClassId === 'string' ? parseInt(this.selectedClassId) : this.selectedClassId) : undefined;
      const sectionId = this.selectedSectionId ? (typeof this.selectedSectionId === 'string' ? parseInt(this.selectedSectionId) : this.selectedSectionId) : undefined;
      
      if (status === 'approved' && (!courseId || !classId || !sectionId || !this.rollNumber)) {
        alert('Please select Course, Class, and Section. Roll number will be auto-generated.');
        return;
      }
      
      this.admissionService.updateStudentAdmissionStatus(
        this.currentAdmissionId,
        status,
        this.actionRemark,
        this.rollNumber,
        this.classSection,
        courseId,
        classId,
        sectionId
      ).subscribe(result => {
        if (result.ok) {
          alert('Status updated successfully!');
          this.closeActionModal();
          this.loadStudentAdmissions(this.studentSubTab);
        } else {
          alert(result.message || 'Failed to update status');
        }
      });
    } else {
      this.admissionService.updateTeacherAdmissionStatus(
        this.currentAdmissionId,
        status,
        this.actionRemark
      ).subscribe(result => {
        if (result.ok) {
          alert('Status updated successfully!');
          this.closeActionModal();
          this.loadTeacherAdmissions(this.teacherSubTab);
        } else {
          alert(result.message || 'Failed to update status');
        }
      });
    }
  }

  closeActionModal(): void {
    this.showActionModal = false;
    this.currentAdmissionId = null;
    this.actionRemark = '';
    this.rollNumber = '';
    this.classSection = '';
    this.selectedCourseId = null;
    this.selectedClassId = null;
    this.selectedSectionId = null;
    this.courses = [];
    this.classes = [];
    this.sections = [];
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  }
  
  getCourseNameForAdmission(admission: StudentAdmission): string {
    // If courseId is available, find course name from admissionCourses
    if (admission.courseId) {
      const course = this.admissionCourses.find(c => c.id === admission.courseId);
      if (course) return course.name;
    }
    // Fallback to classCourse
    return admission.classCourse || '';
  }
  
  getCourseNamesString(): string {
    if (!this.admissionCourses || this.admissionCourses.length === 0) {
      return '';
    }
    return this.admissionCourses.map(c => c.name).join(', ');
  }

  getDashboardRoute(): string {
    const user = this.auth.getUser();
    if (user?.role === 'SUPERADMIN') {
      return '/superadmin/dashboard';
    } else if (user?.role === 'ADMIN') {
      return '/admin/dashboard';
    }
    return '/login';
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
    this.isDarkMode = this.theme.getCurrentTheme();
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  @HostListener('document:click')
  closeUserMenuOnOutsideClick(): void {
    this.isUserMenuOpen = false;
  }

  goProfile(): void {
    const user = this.auth.getUser();
    if (user?.role === 'SUPERADMIN') {
      this.router.navigate(['/superadmin/profile']);
    } else if (user?.role === 'ADMIN') {
      this.router.navigate(['/admin/profile']);
    }
    this.isUserMenuOpen = false;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
