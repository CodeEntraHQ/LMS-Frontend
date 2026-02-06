import { Component, OnInit, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { EntityService, Entity } from '../../services/entity.service';
import { AdmissionService, StudentAdmission, TeacherAdmission } from '../../services/admission.service';
import { StudentService, Student } from '../../services/student.service';
import { TeacherService, Teacher } from '../../services/teacher.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { SubjectService, Course, ClassEntity, Section, Subject, SubjectTeacherMapping } from '../../services/subject.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  template: `
    <div class="page" [style.--entity-primary-color]="(entity && entity.primaryColor) || '#10b981'">
      <!-- Top Nav -->
      <header class="nav">
        <div class="nav-left">
          <a class="brand" routerLink="/admin/dashboard">
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
            <a *ngIf="userRole === 'SUPERADMIN'" routerLink="/superadmin/dashboard" class="breadcrumb-link">Dashboard</a>
            <span *ngIf="userRole === 'SUPERADMIN'" class="breadcrumb-separator">></span>
            <span *ngIf="userRole === 'SUPERADMIN' && entity" class="breadcrumb-link">{{ entity.name }}</span>
            <span *ngIf="userRole !== 'SUPERADMIN'" class="breadcrumb-current">Dashboard</span>
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
              <div class="user-badge">{{ userRole === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN' }}</div>
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
        <!-- Loading State -->
        <div *ngIf="isLoading && !entity" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading entity...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="!isLoading && !entity && userRole !== 'SUPERADMIN'" class="error-container">
          <p>⚠️ Entity not loaded. Please check your account or contact support.</p>
          <button class="btn-primary" (click)="loadFirstEntity()">Retry</button>
        </div>

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
                <span class="meta-separator">•</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ entity.address || 'N/A' }}</span>
                <span class="meta-separator">•</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>Created {{ formatDate(entity.createdAt) || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="nav-tabs">
          <button class="nav-tab" [class.active]="activeTab === 'admissions'" (click)="activeTab = 'admissions'">
            <span class="tab-emoji">🎓</span>
            <span>Admissions</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'students'" (click)="activeTab = 'students'">
            <span class="tab-emoji">👨‍🎓</span>
            <span>Students</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'teachers'" (click)="activeTab = 'teachers'">
            <span class="tab-emoji">👩‍🏫</span>
            <span>Teachers</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'reports'" (click)="activeTab = 'reports'">
            <span class="tab-emoji">📊</span>
            <span>Reports</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'fees'" (click)="activeTab = 'fees'">
            <span class="tab-emoji">💰</span>
            <span>Fees</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'dashboard'" (click)="activeTab = 'dashboard'">
            <span class="tab-emoji">📊</span>
            <span>My Dashboard</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'subjects'" (click)="activeTab = 'subjects'" *ngIf="isFeatureEnabled('My Subjects') || isFeatureEnabled('subjects')">
            <span class="tab-emoji">📚</span>
            <span>My Subjects</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'assignments'" (click)="activeTab = 'assignments'">
            <span class="tab-emoji">📝</span>
            <span>Assignments</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'exam-attempts'" (click)="activeTab = 'exam-attempts'">
            <span class="tab-emoji">🧪</span>
            <span>Exams</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'attendance'" (click)="activeTab = 'attendance'">
            <span class="tab-emoji">📅</span>
            <span>Attendance</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'notices'" (click)="activeTab = 'notices'">
            <span class="tab-emoji">📢</span>
            <span>Notices</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'settings'" (click)="activeTab = 'settings'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Settings</span>
          </button>
        </div>

        <!-- My Dashboard Tab -->
        <div class="dashboard-section" *ngIf="activeTab === 'dashboard' && entity">
          <div class="section-header">
            <div>
              <h2 class="section-title">My Dashboard</h2>
              <p class="section-subtitle">Overview of your enrolled courses, exams, and assignments</p>
            </div>
          </div>
          <div class="dashboard-content">
            <div class="dashboard-card">
              <h3 class="card-title">Enrolled course / class</h3>
              <p class="card-text">No enrolled courses yet</p>
            </div>
            <div class="dashboard-card">
              <h3 class="card-title">Upcoming exams</h3>
              <p class="card-text">No upcoming exams</p>
            </div>
            <div class="dashboard-card">
              <h3 class="card-title">Pending assignments</h3>
              <p class="card-text">No pending assignments</p>
            </div>
          </div>
        </div>

        <!-- Admissions Tab -->
        <div class="dashboard-section" *ngIf="activeTab === 'admissions'">
          <div class="section-header">
            <div>
              <h2 class="section-title">Admissions</h2>
              <p class="section-subtitle">Manage student and teacher admissions, review applications, and approve enrollments</p>
            </div>
          </div>

          <!-- Main Tabs: Student Admission & Teacher Admission -->
          <div class="admission-main-tabs">
            <button class="admission-main-tab" [class.active]="admissionMainTab === 'student'" (click)="switchAdmissionMainTab('student')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Student Admission
            </button>
            <button class="admission-main-tab" [class.active]="admissionMainTab === 'teacher'" (click)="switchAdmissionMainTab('teacher')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Teacher Admission
            </button>
          </div>

          <!-- Student Admission Section -->
          <div *ngIf="admissionMainTab === 'student'" class="admission-section">
            <!-- Sub-tabs for Student -->
            <div class="admission-sub-tabs">
              <button class="admission-sub-tab" [class.active]="studentSubTab === 'new'" (click)="studentSubTab = 'new'">
                New Admission
              </button>
              <button class="admission-sub-tab" [class.active]="studentSubTab === 'pending'" (click)="loadStudentAdmissions('pending')">
                Pending Applications
              </button>
              <button class="admission-sub-tab" [class.active]="studentSubTab === 'approved'" (click)="loadStudentAdmissions('approved')">
                Approved Students
              </button>
              <button class="admission-sub-tab" [class.active]="studentSubTab === 'rejected'" (click)="loadStudentAdmissions('rejected')">
                Rejected / Hold
              </button>
            </div>

            <!-- New Student Admission Form -->
            <div *ngIf="studentSubTab === 'new'" class="admission-form-section">
              <div class="admission-form-header">
                <h3>New Student Admission</h3>
                <p>Fill in the student details to create a new admission application</p>
              </div>
              <form (ngSubmit)="submitStudentAdmission()" class="admission-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>First Name *</label>
                    <input type="text" class="form-input" [(ngModel)]="studentForm.firstName" name="studentFirstName" required />
                  </div>
                  <div class="form-group">
                    <label>Last Name *</label>
                    <input type="text" class="form-input" [(ngModel)]="studentForm.lastName" name="studentLastName" required />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Email *</label>
                    <input type="email" class="form-input" [(ngModel)]="studentForm.email" name="studentEmail" required />
                  </div>
                  <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" class="form-input" [(ngModel)]="studentForm.phone" name="studentPhone" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Gender</label>
                    <select class="form-input" [(ngModel)]="studentForm.gender" name="studentGender">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Course *</label>
                    <select class="form-input" [(ngModel)]="studentForm.courseId" name="studentCourseId" (change)="onStudentFormCourseChange()">
                      <option [value]="null" disabled>Select Course</option>
                      <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
                    </select>
                    <div *ngIf="courses.length === 0" style="color: #ef4444; font-size: 12px; margin-top: 4px;">No courses available. Create courses first.</div>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Academic Year</label>
                    <input type="text" class="form-input" [(ngModel)]="studentForm.academicYear" name="studentAcademicYear" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Address</label>
                  <textarea class="form-input" [(ngModel)]="studentForm.address" name="studentAddress" rows="3"></textarea>
                </div>
                <div class="form-group">
                  <label>Previous Qualification</label>
                  <textarea class="form-input" [(ngModel)]="studentForm.previousQualification" name="studentPreviousQualification" rows="3"></textarea>
                </div>

                <!-- Document Upload Section -->
                <div class="documents-section">
                  <h4>Documents</h4>
                  <div class="doc-grid">
                    <div class="doc-item">
                      <label>ID Proof</label>
                      <input type="file" #idProofInput (change)="onFileSelect($event, 'student', 'idProof')" accept="image/*,.pdf" style="display: none;" />
                      <button type="button" class="doc-upload-btn" (click)="idProofInput.click()">Upload</button>
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
            <div *ngIf="studentSubTab !== 'new'" class="admission-list-section">
              <div class="admission-list-header">
                <h3>{{ getStudentSubTabTitle() }}</h3>
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
                  <div class="admission-card-header">
                    <div class="admission-card-title">
                      <div class="admission-avatar">
                        <img *ngIf="admission.photo" [src]="admission.photo" />
                        <span *ngIf="!admission.photo">{{ (admission.firstName && admission.firstName.charAt(0)) || 'S' }}{{ (admission.lastName && admission.lastName.charAt(0)) || '' }}</span>
                      </div>
                      <div>
                        <h4>{{ admission.firstName }} {{ admission.lastName }}</h4>
                        <p>{{ admission.email }}</p>
                      </div>
                    </div>
                    <span class="status-badge" [class]="'status-' + admission.status">{{ admission.status | titlecase }}</span>
                  </div>
                  <div class="admission-card-body">
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="info-label">Class:</span>
                        <span class="info-value">{{ admission.classCourse || 'N/A' }}</span>
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
                        <span class="info-value">{{ formatAdmissionDate(admission.submittedAt) }}</span>
                      </div>
                    </div>
                    <div *ngIf="admission.adminRemark" class="remark-section">
                      <strong>Admin Remark:</strong> {{ admission.adminRemark }}
                    </div>
                  </div>
                  <div class="admission-card-actions">
                    <div>
                      <button class="btn-view" (click)="viewAdmission(admission)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        View
                      </button>
                      <div *ngIf="admission.status === 'submitted' || admission.status === 'under_review'">
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
                    <button class="btn-delete" (click)="deleteStudentAdmission(admission.id!)" [title]="'Delete admission'">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Teacher Admission Section -->
          <div *ngIf="admissionMainTab === 'teacher'" class="admission-section">
            <!-- Sub-tabs for Teacher -->
            <div class="admission-sub-tabs">
              <button class="admission-sub-tab" [class.active]="teacherSubTab === 'new'" (click)="teacherSubTab = 'new'">
                New Onboarding
              </button>
              <button class="admission-sub-tab" [class.active]="teacherSubTab === 'pending'" (click)="loadTeacherAdmissions('pending')">
                Pending Verification
              </button>
              <button class="admission-sub-tab" [class.active]="teacherSubTab === 'approved'" (click)="loadTeacherAdmissions('approved')">
                Approved Teachers
              </button>
              <button class="admission-sub-tab" [class.active]="teacherSubTab === 'rejected'" (click)="loadTeacherAdmissions('rejected')">
                Rejected / Hold
              </button>
            </div>

            <!-- New Teacher Admission Form -->
            <div *ngIf="teacherSubTab === 'new'" class="admission-form-section">
              <div class="admission-form-header">
                <h3>New Teacher Onboarding</h3>
                <p>Fill in the teacher details to create a new onboarding application</p>
              </div>
              <form (ngSubmit)="submitTeacherAdmission()" class="admission-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>First Name *</label>
                    <input type="text" class="form-input" [(ngModel)]="teacherForm.firstName" name="teacherFirstName" required />
                  </div>
                  <div class="form-group">
                    <label>Last Name *</label>
                    <input type="text" class="form-input" [(ngModel)]="teacherForm.lastName" name="teacherLastName" required />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Email *</label>
                    <input type="email" class="form-input" [(ngModel)]="teacherForm.email" name="teacherEmail" required />
                  </div>
                  <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" class="form-input" [(ngModel)]="teacherForm.phone" name="teacherPhone" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Gender</label>
                    <select class="form-input" [(ngModel)]="teacherForm.gender" name="teacherGender">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label>Qualification</label>
                  <textarea class="form-input" [(ngModel)]="teacherForm.qualification" name="teacherQualification" rows="3"></textarea>
                </div>
                <div class="form-group">
                  <label>Experience</label>
                  <textarea class="form-input" [(ngModel)]="teacherForm.experience" name="teacherExperience" rows="3"></textarea>
                </div>
                <div class="form-group">
                  <label>Address</label>
                  <textarea class="form-input" [(ngModel)]="teacherForm.address" name="teacherAddress" rows="3"></textarea>
                </div>

                <!-- Document Upload Section -->
                <div class="documents-section">
                  <h4>Documents</h4>
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
            <div *ngIf="teacherSubTab !== 'new'" class="admission-list-section">
              <div class="admission-list-header">
                <h3>{{ getTeacherSubTabTitle() }}</h3>
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
                  <div class="admission-card-header">
                    <div class="admission-card-title">
                      <div class="admission-avatar">
                        <img *ngIf="admission.photo" [src]="admission.photo" />
                        <span *ngIf="!admission.photo">{{ (admission.firstName && admission.firstName.charAt(0)) || 'T' }}{{ (admission.lastName && admission.lastName.charAt(0)) || '' }}</span>
                      </div>
                      <div>
                        <h4>{{ admission.firstName }} {{ admission.lastName }}</h4>
                        <p>{{ admission.email }}</p>
                      </div>
                    </div>
                    <span class="status-badge" [class]="'status-' + admission.status">{{ admission.status | titlecase }}</span>
                  </div>
                  <div class="admission-card-body">
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
                        <span class="info-value">{{ formatAdmissionDate(admission.submittedAt) }}</span>
                      </div>
                    </div>
                    <div *ngIf="admission.adminRemark" class="remark-section">
                      <strong>Admin Remark:</strong> {{ admission.adminRemark }}
                    </div>
                  </div>
                  <div class="admission-card-actions">
                    <div>
                      <button class="btn-view" (click)="viewTeacherAdmission(admission)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        View
                      </button>
                      <button class="btn-delete" (click)="deleteTeacherAdmission(admission.id!)" [title]="'Delete admission'">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                    <div *ngIf="admission.status === 'submitted' || admission.status === 'under_review'">
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
          </div>
        </div>

        <!-- Students Tab -->
        <div class="dashboard-section" *ngIf="activeTab === 'students'">
          <div class="section-header">
            <div>
              <h2 class="section-title">Students</h2>
              <p class="section-subtitle">Manage all approved students, view profiles, and update information</p>
            </div>
            <button class="btn-primary" (click)="openAddStudentModal()" *ngIf="false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Add Student
            </button>
          </div>

          <!-- Student Status Filters -->
          <div class="student-filters">
            <button class="filter-btn" [class.active]="studentFilter === 'all'" (click)="loadStudents('all')">
              All Students
            </button>
            <button class="filter-btn" [class.active]="studentFilter === 'active'" (click)="loadStudents('active')">
              Active
            </button>
            <button class="filter-btn" [class.active]="studentFilter === 'inactive'" (click)="loadStudents('inactive')">
              Inactive
            </button>
            <button class="filter-btn" [class.active]="studentFilter === 'pass-out'" (click)="loadStudents('pass-out')">
              Pass-out
            </button>
          </div>

          <!-- Students List -->
          <div class="students-list-section">
            <div *ngIf="isLoadingStudents" class="loading">Loading students...</div>
            <div *ngIf="!isLoadingStudents && students.length === 0 && studentAdmissions.length === 0" class="empty-state">
              <p>No students found</p>
            </div>

            <!-- Approved Students -->
            <div *ngIf="!isLoadingStudents && students.length > 0" class="students-grid">
              <div class="student-card" *ngFor="let student of students">
                <div class="student-card-header">
                  <div class="student-avatar">
                    <img *ngIf="student.profileImage" [src]="student.profileImage" />
                    <span *ngIf="!student.profileImage">{{ (student.firstName && student.firstName.charAt(0)) || 'S' }}{{ (student.lastName && student.lastName.charAt(0)) || '' }}</span>
                  </div>
                  <div class="student-info">
                    <h3>{{ student.firstName }} {{ student.lastName }}</h3>
                    <p>{{ student.email }}</p>
                    <p *ngIf="student.rollNumber" class="roll-number">Roll: {{ student.rollNumber }}</p>
                  </div>
                  <span class="status-badge" [class]="student.isActive ? 'status-active' : 'status-inactive'">
                    {{ student.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="student-card-body">
                  <div class="info-row">
                    <span class="info-label">Class:</span>
                    <span class="info-value">{{ student.classCourse || 'N/A' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Section:</span>
                    <span class="info-value">{{ student.classSection || 'N/A' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Academic Year:</span>
                    <span class="info-value">{{ student.academicYear || 'N/A' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">{{ student.phone || 'N/A' }}</span>
                  </div>
                </div>
                <div class="student-card-actions">
                  <button class="btn-view" (click)="viewStudent(student)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    View
                  </button>
                  <button class="btn-edit" (click)="editStudent(student)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Edit
                  </button>
                  <button class="btn-status" (click)="toggleStudentActiveStatus(student)" [title]="student.isActive ? 'Click to deactivate' : 'Click to activate'">
                    Status
                  </button>
                  <button class="btn-delete" (click)="deleteStudent(student)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Teachers Tab -->
        <div class="dashboard-section" *ngIf="activeTab === 'teachers'">
          <div class="section-header">
            <div>
              <h2 class="section-title">Teachers</h2>
              <p class="section-subtitle">Manage all onboarded teachers, view profiles, and update information</p>
            </div>
          </div>

          <!-- Teacher Status Filters -->
          <div class="student-filters">
            <button class="filter-btn" [class.active]="teacherFilter === 'all'" (click)="loadTeachers('all')">
              All Teachers
            </button>
            <button class="filter-btn" [class.active]="teacherFilter === 'active'" (click)="loadTeachers('active')">
              Active
            </button>
            <button class="filter-btn" [class.active]="teacherFilter === 'inactive'" (click)="loadTeachers('inactive')">
              Inactive
            </button>
          </div>

          <!-- Teachers List -->
          <div class="students-list-section">
            <div *ngIf="isLoadingTeachers" class="loading">Loading teachers...</div>
            <div *ngIf="!isLoadingTeachers && teachers.length === 0" class="empty-state">
              <p>No teachers found</p>
            </div>

            <!-- Approved Teachers -->
            <div *ngIf="!isLoadingTeachers && teachers.length > 0" class="students-grid">
              <div class="student-card" *ngFor="let teacher of teachers">
                <div class="student-card-header">
                  <div class="student-avatar">
                    <img *ngIf="teacher.profileImage" [src]="teacher.profileImage" />
                    <span *ngIf="!teacher.profileImage">{{ (teacher.firstName && teacher.firstName.charAt(0)) || 'T' }}{{ (teacher.lastName && teacher.lastName.charAt(0)) || '' }}</span>
                  </div>
                  <div class="student-info">
                    <h3>{{ teacher.firstName }} {{ teacher.lastName }}</h3>
                    <p>{{ teacher.email }}</p>
                    <p *ngIf="teacher.employeeId" class="roll-number">Employee ID: {{ teacher.employeeId }}</p>
                    <p *ngIf="teacher.qualification" class="roll-number">Qualification: {{ teacher.qualification }}</p>
                  </div>
                  <span class="status-badge" [class]="teacher.isActive ? 'status-active' : 'status-inactive'">
                    {{ teacher.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="student-info-grid">
                  <div class="info-item">
                    <span class="info-label">Specialization:</span>
                    <span class="info-value">{{ teacher.specialization || 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Subjects:</span>
                    <span class="info-value">{{ teacher.subjects || 'Not assigned' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">{{ teacher.phone || 'N/A' }}</span>
                  </div>
                </div>
                <div class="student-actions">
                  <button class="btn-view" (click)="openTeacherDetailsModal(teacher)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    View
                  </button>
                  <button class="btn-edit" (click)="openEditTeacherModal(teacher)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Edit
                  </button>
                  <button class="btn-status" (click)="toggleTeacherActiveStatus(teacher)" [title]="teacher.isActive ? 'Click to deactivate' : 'Click to activate'">
                    Status
                  </button>
                  <button class="btn-subjects" (click)="openSubjectAssignmentModal(teacher)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Assign Subjects
                  </button>
                  <button class="btn-delete" (click)="deleteTeacher(teacher)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- My Subjects Tab -->
        <div class="dashboard-section" *ngIf="activeTab === 'subjects'">
          <!-- Feature Disabled Message -->
          <div *ngIf="!isFeatureEnabled('My Subjects') && !isFeatureEnabled('subjects')" class="empty-state" style="padding: 60px 20px; text-align: center; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto 24px; opacity: 0.6;">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h2 style="margin: 0 0 12px 0; color: var(--text-primary); font-size: 24px; font-weight: 700;">Access Denied</h2>
            <p style="color: var(--text-gray); margin: 0; font-size: 16px; max-width: 500px;">You don't have access to this feature. The "My Subjects" feature has been disabled for your institution.</p>
            <p style="color: var(--text-gray); margin: 12px 0 0 0; font-size: 14px; opacity: 0.8;">Please contact your administrator to enable this feature.</p>
          </div>
          
          <!-- My Subjects Content (only shown if feature is enabled) -->
          <div *ngIf="isFeatureEnabled('My Subjects') || isFeatureEnabled('subjects')">
            <div class="section-header">
              <div>
                <h2 class="section-title">My Subjects</h2>
                <p class="section-subtitle">Manage courses, classes, subjects, and teacher assignments</p>
              </div>
            </div>

          <!-- Sub-tabs for Course, Class, Subject Management -->
          <div class="admission-sub-tabs">
            <button class="admission-sub-tab" [class.active]="subjectSubTab === 'courses'" (click)="subjectSubTab = 'courses'">
              Courses
            </button>
            <button class="admission-sub-tab" [class.active]="subjectSubTab === 'classes'" (click)="subjectSubTab = 'classes'">
              Classes / Semesters
            </button>
            <button class="admission-sub-tab" [class.active]="subjectSubTab === 'sections'" (click)="subjectSubTab = 'sections'" *ngIf="isFeatureEnabled('Sections')">
              Sections
            </button>
            <button class="admission-sub-tab" [class.active]="subjectSubTab === 'subjects'" (click)="subjectSubTab = 'subjects'; loadAllSubjects();">
              Subjects
            </button>
            <button class="admission-sub-tab" [class.active]="subjectSubTab === 'teacher-assignment'" (click)="subjectSubTab = 'teacher-assignment'; loadTeachers('all');">
              Teacher Assignment
            </button>
          </div>

          <!-- Courses Tab -->
          <div *ngIf="subjectSubTab === 'courses'" class="admission-form-section">
            <div class="form-header">
              <h3>Course Management</h3>
              <button class="btn-primary" (click)="openCourseModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Create Course
              </button>
            </div>

            <div *ngIf="isLoadingCourses" class="loading">Loading courses...</div>
            <div *ngIf="!isLoadingCourses && courses.length === 0" class="empty-state">
              <p>No courses found. Create your first course to get started.</p>
            </div>

            <div *ngIf="!isLoadingCourses && courses.length > 0" class="courses-grid">
              <div class="course-card" *ngFor="let course of courses">
                <div class="course-card-header">
                  <h4>{{ course.name }}</h4>
                  <span class="status-badge" [class]="'status-' + course.status">
                    {{ course.status }}
                  </span>
                </div>
                <div class="course-card-body">
                  <p><strong>Type:</strong> {{ course.type }}</p>
                  <p *ngIf="course.durationYears"><strong>Duration:</strong> {{ course.durationYears }} years</p>
                  <p *ngIf="course.durationSemesters"><strong>Duration:</strong> {{ course.durationSemesters }} semesters</p>
                </div>
                <div class="course-card-actions">
                  <button class="btn-edit" (click)="editCourse(course)">Edit</button>
                  <button class="btn-delete" (click)="deleteCourse(course.id!)" *ngIf="course.id">Delete</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Classes Tab -->
          <div *ngIf="subjectSubTab === 'classes'" class="admission-form-section">
            <div class="form-header">
              <h3>Class / Semester Management</h3>
              <button class="btn-primary" (click)="openClassModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Create Class / Semester
              </button>
            </div>

            <div *ngIf="courses.length === 0" class="empty-state">
              <p>Please create a course first before creating classes/semesters.</p>
            </div>

            <div *ngIf="courses.length > 0" class="form-group">
              <label>Select Course</label>
              <select class="form-input" [(ngModel)]="selectedCourseForClass" (change)="loadClassesForCourse()">
                <option value="">Select a course</option>
                <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
              </select>
            </div>

            <div *ngIf="isLoadingClasses" class="loading">Loading classes...</div>
            <div *ngIf="!isLoadingClasses && selectedCourseForClass && classes.length === 0" class="empty-state">
              <p>No classes/semesters found for this course.</p>
            </div>

            <div *ngIf="!isLoadingClasses && classes.length > 0" class="classes-grid">
              <div class="class-card" *ngFor="let classItem of classes">
                <div class="class-card-header">
                  <h4>{{ classItem.name }}</h4>
                  <span class="status-badge" [class]="'status-' + classItem.status">
                    {{ classItem.status }}
                  </span>
                </div>
                <div class="class-card-body">
                  <p><strong>Type:</strong> {{ classItem.type }}</p>
                  <p *ngIf="classItem.academicYear"><strong>Academic Year:</strong> {{ classItem.academicYear }}</p>
                </div>
                <div class="class-card-actions">
                  <button class="btn-edit" (click)="editClass(classItem)">Edit</button>
                  <button class="btn-primary" (click)="manageSections(classItem)">Manage Sections</button>
                  <button class="btn-delete" (click)="deleteClass(classItem.id!)" *ngIf="classItem.id">Delete</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sections Tab -->
          <div *ngIf="subjectSubTab === 'sections'" class="admission-form-section">
            <!-- Feature Disabled Message -->
            <div *ngIf="!isFeatureEnabled('Sections')" class="empty-state" style="padding: 40px; text-align: center;">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto 16px; opacity: 0.5;">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h3 style="margin: 0 0 8px 0; color: var(--text-primary);">Sections Feature Disabled</h3>
              <p style="color: var(--text-gray); margin: 0;">This feature has been disabled for your institution. Please contact your administrator to enable it.</p>
            </div>
            
            <!-- Sections Content (only shown if feature is enabled) -->
            <div *ngIf="isFeatureEnabled('Sections')">
              <div class="form-header">
                <h3>Section Management</h3>
                <p style="color: var(--text-gray); font-size: 14px; margin-top: 8px;">
                  Create sections (A, B, C, D, E, etc.) for classes/semesters. Subjects created for a class will automatically be available for ALL sections.
                </p>
              </div>

              <div *ngIf="courses.length === 0" class="empty-state">
                <p>Please create a course and class first before creating sections.</p>
              </div>

              <div *ngIf="courses.length > 0" class="form-row">
                <div class="form-group">
                  <label>Select Course</label>
                  <select class="form-input" [(ngModel)]="selectedCourseForSections" (change)="onCourseChangeForSections()">
                    <option value="">Select a course</option>
                    <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Select Class / Semester</label>
                  <select class="form-input" [(ngModel)]="selectedClassForSectionsTab" [disabled]="!selectedCourseForSections" (change)="onClassChangeForSections()">
                    <option value="">Select a class/semester</option>
                    <option *ngFor="let classItem of classesForSections" [value]="classItem.id">{{ classItem.name }}</option>
                  </select>
                </div>
              </div>

              <!-- Section Creation Form -->
              <div *ngIf="selectedClassForSectionsTab" class="section-management-box" style="margin-top: 24px; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid var(--border-gray);">
              <div class="form-header" style="margin-bottom: 20px;">
                <h4 style="margin: 0;">Add New Section for {{ getClassNameForSections() }}</h4>
                <button class="btn-primary" (click)="sectionForm = { classId: selectedClassForSectionsTab, status: 'active' }; isEditingSection = false">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  Add Section
                </button>
              </div>

              <!-- Section Form (for both create and edit) -->
              <div *ngIf="sectionForm.classId" class="form-row">
                <div class="form-group">
                  <label>Section Name *</label>
                  <input type="text" class="form-input" [(ngModel)]="sectionForm.name" placeholder="e.g., A, B, C, D, E" />
                </div>
                <div class="form-group">
                  <label>Capacity (Optional)</label>
                  <input type="number" class="form-input" [(ngModel)]="sectionForm.capacity" placeholder="Max students" />
                </div>
              </div>
              <div *ngIf="sectionForm.classId" class="form-group" style="margin-top: 12px;">
                <label>Status</label>
                <select class="form-input" [(ngModel)]="sectionForm.status">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div *ngIf="sectionForm.classId" class="form-actions" style="margin-top: 16px;">
                <button class="btn-primary" (click)="saveSection()">{{ isEditingSection ? 'Update Section' : 'Save Section' }}</button>
                <button class="btn-secondary" (click)="cancelSectionEdit()">Cancel</button>
              </div>

              <!-- Existing Sections List -->
              <div *ngIf="sectionsForSectionsTab.length > 0 && !isEditingSection && isFeatureEnabled('Sections')" style="margin-top: 24px;">
                <h4 style="margin-bottom: 16px;">Existing Sections</h4>
                <div class="sections-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
                  <div class="section-card" *ngFor="let section of sectionsForSectionsTab" style="padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-gray); border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-weight: 700; font-size: 18px;">{{ section.name }}</span>
                      <span class="status-badge" [class]="'status-' + section.status">{{ section.status }}</span>
                    </div>
                    <p *ngIf="section.capacity" style="color: var(--text-gray); font-size: 13px; margin: 8px 0;">
                      <span *ngIf="getSectionStudentCount(section.id!) !== null">
                        Capacity: {{ getSectionStudentCount(section.id!) }}/{{ section.capacity }} students
                        <span *ngIf="getRemainingCapacity(section) >= 0" style="color: var(--accent-green); font-weight: 700;">
                          (Remaining: {{ getRemainingCapacity(section) }})
                        </span>
                        <span *ngIf="getRemainingCapacity(section) < 0" style="color: #ef4444; font-weight: 700;">
                          (FULL)
                        </span>
                      </span>
                      <span *ngIf="getSectionStudentCount(section.id!) === null">
                        Capacity: {{ section.capacity }} students
                      </span>
                    </p>
                    <div style="display: flex; gap: 8px; margin-top: 12px;">
                      <button class="btn-view" (click)="viewSectionStudents(section)" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px;" title="View Students">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        View
                      </button>
                      <button class="btn-edit" (click)="editSection(section)" style="flex: 1;">Edit</button>
                      <button class="btn-delete" (click)="deleteSection(section.id!)" *ngIf="section.id" style="flex: 1;">Delete</button>
                    </div>
                  </div>
                </div>
              </div>

              <div *ngIf="selectedClassForSectionsTab && sectionsForSectionsTab.length === 0 && !isLoadingSectionsForTab" class="empty-state" style="margin-top: 24px;">
                <p>No sections created yet. Add your first section (e.g., A, B, C) for this class.</p>
              </div>

              <div *ngIf="isLoadingSectionsForTab" class="loading" style="margin-top: 24px;">Loading sections...</div>
            </div>

            <div *ngIf="!selectedClassForSectionsTab && courses.length > 0" class="empty-state" style="margin-top: 24px;">
              <p>Please select a course and class/semester to manage sections.</p>
            </div>
          </div>

          <!-- Subjects Tab -->
          <div *ngIf="isSubjectsTab()" class="admission-form-section">
            <div class="form-header">
              <h3>Subject Management</h3>
              <button class="btn-primary" (click)="openSubjectModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Create Subject
              </button>
            </div>

            <!-- Debug info (temporary) -->
            <div style="padding: 10px; background: rgba(255,0,0,0.1); margin: 10px 0; border-radius: 4px; font-size: 12px;">
              <p>Debug: subjectSubTab = "{{ subjectSubTab }}"</p>
              <p>Debug: isSubjectsTab() = {{ isSubjectsTab() }}</p>
              <p>Debug: isLoadingAllSubjects = {{ isLoadingAllSubjects }}</p>
              <p>Debug: allSubjects.length = {{ allSubjects.length }}</p>
              <p>Debug: entity?.id = {{ entity?.id }}</p>
            </div>

            <div *ngIf="isLoadingAllSubjects" class="loading">Loading subjects...</div>
            <div *ngIf="!isLoadingAllSubjects && allSubjects.length === 0" class="empty-state">
              <p>No subjects found. Create your first subject to get started.</p>
              <button class="btn-primary" (click)="openSubjectModal()" style="margin-top: 15px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Create Your First Subject
              </button>
            </div>

            <!-- Force render test -->
            <div style="padding: 10px; background: rgba(0,255,0,0.1); margin: 10px 0; border-radius: 4px; border: 2px solid green;">
              <p><strong>RENDER TEST:</strong></p>
              <p>allSubjects.length = {{ allSubjects.length }}</p>
              <p>!isLoadingAllSubjects = {{ !isLoadingAllSubjects }}</p>
              <p>Condition result = {{ !isLoadingAllSubjects && allSubjects.length > 0 }}</p>
              <p>First subject name = {{ allSubjects.length > 0 ? allSubjects[0].name : 'N/A' }}</p>
            </div>

            <div *ngIf="!isLoadingAllSubjects && allSubjects.length > 0" class="courses-grid">
              <div class="course-card" *ngFor="let subject of allSubjects; let i = index">
                <div class="course-card-header">
                  <h4>{{ subject.name }}</h4>
                  <span class="status-badge" [class]="'status-' + subject.status">
                    {{ subject.status }}
                  </span>
                </div>
                <div class="course-card-body">
                  <p><strong>Code:</strong> {{ subject.subjectCode }}</p>
                  <p><strong>Type:</strong> {{ subject.subjectType }}</p>
                  <p><strong>Course:</strong> {{ getCourseName(subject.courseId) }}</p>
                  <p><strong>Class:</strong> {{ getClassName(subject.classId) }}</p>
                  <p *ngIf="subject.maxMarks"><strong>Max Marks:</strong> {{ subject.maxMarks }}</p>
                  <p *ngIf="subject.credits"><strong>Credits:</strong> {{ subject.credits }}</p>
                </div>
                <div class="course-card-actions">
                  <button class="btn-edit" (click)="editSubject(subject)">Edit</button>
                  <button class="btn-delete" (click)="deleteSubject(subject.id!)" *ngIf="subject.id">Delete</button>
                </div>
              </div>
            </div>
          </div>

          </div>
        </div>

        <!-- Teacher Assignment Tab -->
          <div *ngIf="subjectSubTab === 'teacher-assignment'" class="admission-form-section">
            <div class="form-header">
              <h3>Teacher Assignment</h3>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Select Subject</label>
                <select class="form-input" [(ngModel)]="selectedSubjectForAssignment" (change)="loadTeachersForSubject()">
                  <option value="">Select a subject</option>
                  <option *ngFor="let subject of allSubjects" [value]="subject.id">
                    {{ subject.name }} ({{ subject.subjectCode }})
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Select Section (Optional)</label>
                <select class="form-input" [(ngModel)]="selectedSectionForAssignment" (change)="onSectionForAssignmentChange()" [disabled]="!selectedSubjectForAssignment || sectionsForAssignment.length === 0">
                  <option value="">All Sections</option>
                  <option *ngFor="let section of sectionsForAssignment" [value]="section.id">
                    {{ section.name }}
                  </option>
                </select>
                <small class="form-hint" *ngIf="selectedSubjectForAssignment && sectionsForAssignment.length === 0" style="color: #f59e0b;">
                  ⚠️ No sections found for this subject's class. Create sections first.
                </small>
                <small class="form-hint" *ngIf="selectedSubjectForAssignment && sectionsForAssignment.length > 0">
                  📌 Select a specific section (e.g., A, B, C) or leave as "All Sections" to assign for all sections.
                </small>
              </div>
            </div>

            <div class="form-group">
              <label>Select Teacher</label>
              <select class="form-input" [(ngModel)]="selectedTeacherForAssignment" [disabled]="isLoadingTeachers">
                <option value="">{{ isLoadingTeachers ? 'Loading teachers...' : 'Select a teacher' }}</option>
                <option *ngFor="let teacher of filteredTeachersForAssignment" [value]="teacher.id">
                  {{ teacher.firstName }} {{ teacher.lastName }}
                </option>
              </select>
              <small class="form-hint" *ngIf="!isLoadingTeachers && teachers.length === 0" style="color: #f59e0b; margin-top: 8px; display: block;">
                ⚠️ No teachers found. Please add teachers first from the Teachers tab.
              </small>
              <small class="form-hint" *ngIf="!isLoadingTeachers && teachers.length > 0" style="color: var(--text-gray); margin-top: 8px; display: block;">
                📌 {{ teachers.length }} teacher(s) available
              </small>
            </div>

            <div class="form-actions">
              <button class="btn-primary" (click)="assignTeacherToSubject()" [disabled]="!selectedSubjectForAssignment || !selectedTeacherForAssignment">
                Assign Teacher
              </button>
            </div>

            <div *ngIf="isLoadingTeacherAssignments" class="loading">Loading assignments...</div>
            <div *ngIf="!isLoadingTeacherAssignments && filteredTeacherAssignments.length > 0" class="assignments-list">
              <h4>Current Assignments</h4>
              <div class="assignment-card" *ngFor="let assignment of filteredTeacherAssignments">
                <div class="assignment-info">
                  <p><strong>Subject:</strong> {{ getSubjectName(assignment.subjectId) }}</p>
                  <p><strong>Teacher:</strong> {{ getTeacherName(assignment.teacherId) }}</p>
                  <p><strong>Section:</strong> {{ assignment.sectionId ? getSectionName(assignment.sectionId) : 'All Sections' }}</p>
                </div>
                <button class="btn-delete" (click)="removeTeacherAssignment(assignment.id!)" *ngIf="assignment.id">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div class="settings-section" *ngIf="activeTab === 'settings' && entity">
          <div class="settings-header">
            <div>
              <h2 class="settings-title">Entity Settings</h2>
              <p class="settings-subtitle">Update entity information and configuration</p>
            </div>
            <button class="edit-icon-btn" (click)="toggleEditMode()" *ngIf="!isEditing">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div class="settings-content">
            <!-- Left Column: General Settings -->
            <div class="settings-column">
              <div class="settings-card">
                <div class="card-header">
                  <h3 class="card-title">General Settings</h3>
                  <p class="card-subtitle">Basic entity information and configuration</p>
                </div>
                <div class="card-body">
                  <div class="form-group">
                    <label>Institution Name *</label>
                    <input
                      type="text"
                      class="form-input"
                      [(ngModel)]="editForm.name"
                      [disabled]="!isEditing"
                      placeholder="Enter institution name"
                    />
                  </div>
                  <div class="form-group">
                    <label>Type *</label>
                    <select class="form-input" [(ngModel)]="editForm.type" [disabled]="!isEditing">
                      <option value="">Select type</option>
                      <option value="SCHOOL">School</option>
                      <option value="COLLEGE">College</option>
                      <option value="UNIVERSITY">University</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Address *</label>
                    <input
                      type="text"
                      class="form-input"
                      [(ngModel)]="editForm.address"
                      [disabled]="!isEditing"
                      placeholder="City, State/Country" 
                    />
                  </div>
                  <div class="form-group">
                    <label>College Logo</label>
                    <div class="logo-upload-section">
                      <div class="logo-placeholder" (click)="isEditing && triggerFileUpload()">
                        <img *ngIf="logoPreview || entity.logoUrl" [src]="logoPreview || entity.logoUrl || ''" alt="Logo preview" class="logo-preview" />
                        <span *ngIf="!logoPreview && !entity.logoUrl" class="logo-placeholder-text">No logo</span>
                      </div>
                      <button 
                        type="button" 
                        class="logo-upload-btn" 
                        (click)="isEditing && triggerFileUpload()" 
                        *ngIf="isEditing"
                        aria-label="Upload logo"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M7 10L12 5L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M12 5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                      <input
                        type="file"
                        #fileInput
                        (change)="onLogoFileSelect($event)"
                        accept="image/*"
                        style="display: none;"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Contact Information -->
            <div class="settings-column">
              <div class="settings-card">
                <div class="card-header">
                  <h3 class="card-title">Contact Information</h3>
                  <p class="card-subtitle">Contact details and communication preferences</p>
                </div>
                <div class="card-body">
                  <div class="form-group">
                    <label>Contact Email</label>
                    <input 
                      type="email" 
                      class="form-input" 
                      [(ngModel)]="editForm.email" 
                      [disabled]="!isEditing"
                      placeholder="contact@institution.com" 
                    />
                  </div>
                  <div class="form-group">
                    <label>Contact Phone</label>
                    <input 
                      type="tel" 
                      class="form-input" 
                      [(ngModel)]="editForm.phone" 
                      [disabled]="!isEditing"
                      placeholder="+1 234 567 8900" 
                    />
                  </div>
                  <div class="form-group">
                    <label>Description</label>
                    <textarea 
                      class="form-input textarea" 
                      [(ngModel)]="editForm.description" 
                      [disabled]="!isEditing"
                      placeholder="Brief description of the institution"
                    ></textarea>
                  </div>
                  <div class="form-group">
                    <label>Primary Color</label>
                    <input 
                      type="color" 
                      class="form-input color-input" 
                      [(ngModel)]="editForm.primaryColor" 
                      [disabled]="!isEditing"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Save/Cancel Buttons -->
          <div class="settings-actions" *ngIf="isEditing">
            <button class="btn-secondary" (click)="cancelEdit()">Cancel</button>
            <button class="btn-primary" (click)="saveChanges()">Save Changes</button>
          </div>
        </div>
      </main>

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
            <div *ngIf="currentAction === 'approve' && admissionMainTab === 'student'">
              <div class="form-group">
                <label>Course *</label>
                <select class="form-input" [(ngModel)]="actionModalCourseId" (change)="onActionModalCourseChange()">
                  <option [value]="null">Select a course</option>
                  <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
                </select>
              </div>
              <div class="form-group" *ngIf="actionModalCourseId">
                <label>Class / Semester *</label>
                <select class="form-input" [(ngModel)]="actionModalClassId" (ngModelChange)="onActionModalClassIdChange($event)" style="appearance: auto; -webkit-appearance: menulist; -moz-appearance: menulist;" [attr.data-class-id]="actionModalClassId">
                  <option [value]="null">Select a class/semester</option>
                  <option *ngFor="let classItem of actionModalClasses" [value]="classItem.id">{{ classItem.name }}</option>
                </select>
                <div *ngIf="actionModalClasses.length === 0 && actionModalCourseId" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                  ⚠️ No classes/semesters found for this course. Please create classes first.
                </div>
                <div *ngIf="actionModalClasses.length > 0" style="color: #10b981; font-size: 12px; margin-top: 4px;">
                  ✓ {{ actionModalClasses.length }} class(es) available
                </div>
              </div>
              <div class="form-group" *ngIf="actionModalClassId">
                <label>Class Section *</label>
                <select class="form-input" [(ngModel)]="actionModalSectionId" (change)="onActionModalSectionChange()" style="appearance: auto; -webkit-appearance: menulist; -moz-appearance: menulist;">
                  <option [value]="null" disabled selected>-- Select Section (A, B, C, etc.) --</option>
                  <option *ngFor="let section of actionModalSections" [value]="section.id">
                    {{ section.name }}
                    <span *ngIf="section.capacity"> ({{ getSectionStudentCountForAction(section.id!) || 0 }}/{{ section.capacity }}</span>
                    <span *ngIf="section.capacity && getRemainingCapacityForAction(section) >= 0">, Remaining: {{ getRemainingCapacityForAction(section) }})</span>
                    <span *ngIf="section.capacity && getRemainingCapacityForAction(section) < 0">, FULL)</span>
                    <span *ngIf="!section.capacity"> (Unlimited)</span>
                  </option>
                </select>
                <div *ngIf="actionModalSections.length === 0 && actionModalClassId" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                  ⚠️ No sections found for this class. Please create sections first in "My Subjects" → "Sections" tab.
                  <br><small style="color: var(--text-gray);">Debug: actionModalClassId={{ actionModalClassId }}, sections count={{ actionModalSections.length }}</small>
                </div>
                <div *ngIf="actionModalSections.length > 0" style="color: #10b981; font-size: 12px; margin-top: 4px;">
                  ✓ {{ actionModalSections.length }} section(s) available: {{ getActionModalSectionsNames() }}
                </div>
              </div>
              <div class="form-group" *ngIf="actionModalSectionId">
                <label>Roll Number *</label>
                <input type="text" class="form-input" [(ngModel)]="rollNumber" [readonly]="true" placeholder="Auto-generated roll number" />
                <small class="form-hint" *ngIf="rollNumber" style="color: #10b981; font-size: 12px; margin-top: 4px; display: block;">
                  ✓ Roll number generated: <strong>{{ rollNumber }}</strong>
                </small>
                <small class="form-hint" *ngIf="!rollNumber && actionModalSectionId" style="color: #f59e0b; font-size: 12px; margin-top: 4px; display: block;">
                  ⏳ Generating roll number...
                </small>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeActionModal()">Cancel</button>
            <button class="btn-primary" (click)="confirmAdmissionAction()">Confirm</button>
          </div>
        </div>
      </div>

      <!-- Section Students Modal -->
      <div class="modal-overlay" *ngIf="showSectionStudentsModal" (click)="closeSectionStudentsModal()">
        <div class="modal-content student-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Students in Section {{ selectedSectionForView?.name }}</h2>
            <button class="close-btn" (click)="closeSectionStudentsModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div *ngIf="selectedSectionForView" style="margin-bottom: 16px; padding: 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px;">
              <div style="display: flex; gap: 24px; flex-wrap: wrap;">
                <div>
                  <span style="color: var(--text-gray); font-size: 12px;">Capacity:</span>
                  <span style="font-weight: 700; margin-left: 4px;">{{ selectedSectionForView.capacity || 'Unlimited' }} students</span>
                </div>
                <div>
                  <span style="color: var(--text-gray); font-size: 12px;">Current:</span>
                  <span style="font-weight: 700; margin-left: 4px;">{{ sectionStudents.length }} students</span>
                </div>
                <div *ngIf="selectedSectionForView.capacity">
                  <span style="color: var(--text-gray); font-size: 12px;">Remaining:</span>
                  <span style="font-weight: 700; margin-left: 4px; color: {{ getRemainingCapacity(selectedSectionForView) >= 0 ? 'var(--accent-green)' : '#ef4444' }}">
                    {{ getRemainingCapacity(selectedSectionForView) }} students
                  </span>
                </div>
              </div>
            </div>
            <div *ngIf="isLoadingSectionStudents" class="loading">Loading students...</div>
            <div *ngIf="!isLoadingSectionStudents && sectionStudents.length === 0" class="empty-state">
              <p>No students enrolled in this section yet.</p>
            </div>
            <div *ngIf="!isLoadingSectionStudents && sectionStudents.length > 0" class="students-list">
              <div class="student-item" *ngFor="let student of sectionStudents" style="padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-gray); border-radius: 8px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 700; margin-bottom: 4px;">{{ student.firstName }} {{ student.lastName }}</div>
                    <div style="color: var(--text-gray); font-size: 13px;">
                      Roll: {{ student.rollNumber || 'N/A' }} • Email: {{ student.email || 'N/A' }}
                    </div>
                  </div>
                  <span class="status-badge status-active" *ngIf="student.studentStatus === 'active'">Active</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeSectionStudentsModal()">Close</button>
          </div>
        </div>
      </div>

      <!-- Teacher Modal -->
      <div class="modal-overlay" *ngIf="showTeacherModal" (click)="closeTeacherModal()">
        <div class="modal-content student-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditingTeacher ? 'Edit Teacher' : 'Teacher Details' }}</h2>
            <button class="close-btn" (click)="closeTeacherModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div *ngIf="!isEditingTeacher && selectedTeacher" class="student-view">
              <div class="student-profile-header">
                <div class="student-avatar-large">
                  <img *ngIf="selectedTeacher.profileImage" [src]="selectedTeacher.profileImage" />
                  <span *ngIf="!selectedTeacher.profileImage">{{ (selectedTeacher.firstName && selectedTeacher.firstName.charAt(0)) || 'T' }}{{ (selectedTeacher.lastName && selectedTeacher.lastName.charAt(0)) || '' }}</span>
                </div>
                <div>
                  <h3>{{ selectedTeacher.firstName }} {{ selectedTeacher.lastName }}</h3>
                  <p>{{ selectedTeacher.email }}</p>
                  <p *ngIf="selectedTeacher.employeeId">Employee ID: {{ selectedTeacher.employeeId }}</p>
                </div>
              </div>
              <div class="student-details-grid">
                <div class="detail-item">
                  <span class="detail-label">Qualification</span>
                  <span class="detail-value">{{ selectedTeacher.qualification || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Specialization</span>
                  <span class="detail-value">{{ selectedTeacher.specialization || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status</span>
                  <span class="detail-value">{{ selectedTeacher.status || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Phone</span>
                  <span class="detail-value">{{ selectedTeacher.phone || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Gender</span>
                  <span class="detail-value">{{ selectedTeacher.gender || 'N/A' }}</span>
                </div>
                <div class="detail-item full-width">
                  <span class="detail-label">Address</span>
                  <span class="detail-value">{{ selectedTeacher.address || 'N/A' }}</span>
                </div>
                <div class="detail-item full-width" *ngIf="selectedTeacher.bio">
                  <span class="detail-label">Bio</span>
                  <span class="detail-value">{{ selectedTeacher.bio }}</span>
                </div>
              </div>
              
              <!-- Documents Section -->
              <div class="documents-view-section" *ngIf="selectedTeacherAdmissionForView">
                <h4 class="documents-title">Documents</h4>
                <div class="documents-grid-view">
                  <div class="doc-view-item" *ngIf="selectedTeacherAdmissionForView.photo">
                    <label>Photo</label>
                    <div class="doc-preview-container">
                      <img [src]="selectedTeacherAdmissionForView.photo" class="doc-preview-large" />
                    </div>
                  </div>
                  <div class="doc-view-item" *ngIf="selectedTeacherAdmissionForView.idProof">
                    <label>ID Proof</label>
                    <div class="doc-preview-container">
                      <img *ngIf="selectedTeacherAdmissionForView.idProof && selectedTeacherAdmissionForView.idProof.startsWith('data:image')" [src]="selectedTeacherAdmissionForView.idProof" class="doc-preview-large" />
                      <a *ngIf="selectedTeacherAdmissionForView.idProof && !selectedTeacherAdmissionForView.idProof.startsWith('data:image')" [href]="selectedTeacherAdmissionForView.idProof" target="_blank" class="doc-link">View PDF</a>
                    </div>
                  </div>
                  <div class="doc-view-item" *ngIf="selectedTeacherAdmissionForView.degreeCertificate">
                    <label>Degree Certificate</label>
                    <div class="doc-preview-container">
                      <img *ngIf="selectedTeacherAdmissionForView.degreeCertificate && selectedTeacherAdmissionForView.degreeCertificate.startsWith('data:image')" [src]="selectedTeacherAdmissionForView.degreeCertificate" class="doc-preview-large" />
                      <a *ngIf="selectedTeacherAdmissionForView.degreeCertificate && !selectedTeacherAdmissionForView.degreeCertificate.startsWith('data:image')" [href]="selectedTeacherAdmissionForView.degreeCertificate" target="_blank" class="doc-link">View PDF</a>
                    </div>
                  </div>
                  <div class="doc-view-item" *ngIf="selectedTeacherAdmissionForView.resume">
                    <label>Resume</label>
                    <div class="doc-preview-container">
                      <img *ngIf="selectedTeacherAdmissionForView.resume && selectedTeacherAdmissionForView.resume.startsWith('data:image')" [src]="selectedTeacherAdmissionForView.resume" class="doc-preview-large" />
                      <a *ngIf="selectedTeacherAdmissionForView.resume && !selectedTeacherAdmissionForView.resume.startsWith('data:image')" [href]="selectedTeacherAdmissionForView.resume" target="_blank" class="doc-link">View PDF</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="isEditingTeacher" class="student-edit-form">
              <div class="form-group">
                <label>Employee ID</label>
                <input type="text" class="form-input" [(ngModel)]="teacherEditForm.employeeId" />
              </div>
              <div class="form-group">
                <label>Qualification</label>
                <input type="text" class="form-input" [(ngModel)]="teacherEditForm.qualification" />
              </div>
              <div class="form-group">
                <label>Specialization</label>
                <input type="text" class="form-input" [(ngModel)]="teacherEditForm.specialization" />
              </div>
              <div class="form-group">
                <label>First Name</label>
                <input type="text" class="form-input" [(ngModel)]="teacherEditForm.firstName" />
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input type="text" class="form-input" [(ngModel)]="teacherEditForm.lastName" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input type="tel" class="form-input" [(ngModel)]="teacherEditForm.phone" />
              </div>
              <div class="form-group">
                <label>Gender</label>
                <select class="form-input" [(ngModel)]="teacherEditForm.gender">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Address</label>
                <textarea class="form-input" [(ngModel)]="teacherEditForm.address" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label>Bio</label>
                <textarea class="form-input" [(ngModel)]="teacherEditForm.bio" rows="3"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer" *ngIf="isEditingTeacher">
            <button class="btn-secondary" (click)="closeTeacherModal()">Cancel</button>
            <button class="btn-primary" (click)="saveTeacherChanges()">Save Changes</button>
          </div>
        </div>
      </div>

      <!-- Teacher Admission Approval Modal -->
      <div class="modal-overlay" *ngIf="showTeacherAdmissionModal || isApprovingTeacherAdmission" (click)="closeTeacherAdmissionModal()">
        <div class="modal-content student-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isApprovingTeacherAdmission ? 'Approve Teacher Admission' : 'Teacher Admission Details' }}</h2>
            <button class="close-btn" (click)="closeTeacherAdmissionModal()">&times;</button>
          </div>
          <div class="modal-body" *ngIf="selectedTeacherAdmission">
            <div *ngIf="!isApprovingTeacherAdmission" class="student-view">
              <div class="student-profile-header">
                <div class="student-avatar-large">
                  <img *ngIf="selectedTeacherAdmission.photo" [src]="selectedTeacherAdmission.photo" />
                  <span *ngIf="!selectedTeacherAdmission.photo">{{ (selectedTeacherAdmission.firstName && selectedTeacherAdmission.firstName.charAt(0)) || 'T' }}{{ (selectedTeacherAdmission.lastName && selectedTeacherAdmission.lastName.charAt(0)) || '' }}</span>
                </div>
                <div>
                  <h3>{{ selectedTeacherAdmission.firstName }} {{ selectedTeacherAdmission.lastName }}</h3>
                  <p>{{ selectedTeacherAdmission.email }}</p>
                  <p>{{ selectedTeacherAdmission.phone || 'N/A' }}</p>
                </div>
              </div>
              <div class="student-details-grid">
                <div class="detail-item">
                  <span class="detail-label">Qualification</span>
                  <span class="detail-value">{{ selectedTeacherAdmission.qualification || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Experience</span>
                  <span class="detail-value">{{ selectedTeacherAdmission.experience || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status</span>
                  <span class="status-badge" [class]="'status-' + selectedTeacherAdmission.status">
                    {{ selectedTeacherAdmission.status | titlecase }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Submitted At</span>
                  <span class="detail-value">{{ formatAdmissionDate(selectedTeacherAdmission.submittedAt) }}</span>
                </div>
              </div>
              
              <!-- Documents Section -->
              <div class="documents-view-section">
                <h4 class="documents-title">Documents</h4>
                <div class="documents-grid-view">
                  <div class="doc-view-item" *ngIf="selectedTeacherAdmission.photo">
                    <label>Photo</label>
                    <div class="doc-preview-container">
                      <img [src]="selectedTeacherAdmission.photo" class="doc-preview-large" />
                    </div>
                  </div>
                  <div class="doc-view-item" *ngIf="selectedTeacherAdmission.idProof">
                    <label>ID Proof</label>
                    <div class="doc-preview-container">
                      <img *ngIf="selectedTeacherAdmission.idProof && selectedTeacherAdmission.idProof.startsWith('data:image')" [src]="selectedTeacherAdmission.idProof" class="doc-preview-large" />
                      <a *ngIf="selectedTeacherAdmission.idProof && !selectedTeacherAdmission.idProof.startsWith('data:image')" [href]="selectedTeacherAdmission.idProof" target="_blank" class="doc-link">View PDF</a>
                    </div>
                  </div>
                  <div class="doc-view-item" *ngIf="selectedTeacherAdmission.degreeCertificate">
                    <label>Degree Certificate</label>
                    <div class="doc-preview-container">
                      <img *ngIf="selectedTeacherAdmission.degreeCertificate && selectedTeacherAdmission.degreeCertificate.startsWith('data:image')" [src]="selectedTeacherAdmission.degreeCertificate" class="doc-preview-large" />
                      <a *ngIf="selectedTeacherAdmission.degreeCertificate && !selectedTeacherAdmission.degreeCertificate.startsWith('data:image')" [href]="selectedTeacherAdmission.degreeCertificate" target="_blank" class="doc-link">View PDF</a>
                    </div>
                  </div>
                  <div class="doc-view-item" *ngIf="selectedTeacherAdmission.resume">
                    <label>Resume</label>
                    <div class="doc-preview-container">
                      <img *ngIf="selectedTeacherAdmission.resume && selectedTeacherAdmission.resume.startsWith('data:image')" [src]="selectedTeacherAdmission.resume" class="doc-preview-large" />
                      <a *ngIf="selectedTeacherAdmission.resume && !selectedTeacherAdmission.resume.startsWith('data:image')" [href]="selectedTeacherAdmission.resume" target="_blank" class="doc-link">View PDF</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="isApprovingTeacherAdmission" class="student-edit-form">
              <div class="form-group">
                <label>Subjects (Optional)</label>
                <input type="text" class="form-input" [(ngModel)]="approvalSubjects" placeholder="Enter subjects (comma-separated)" />
              </div>
              <div class="form-group">
                <label>Assigned Classes (Optional)</label>
                <input type="text" class="form-input" [(ngModel)]="approvalAssignedClasses" placeholder="Enter assigned classes" />
              </div>
              <div class="form-group">
                <label>Remark (Optional)</label>
                <textarea class="form-input" [(ngModel)]="approvalTeacherRemark" rows="3" placeholder="Add any remarks"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer" *ngIf="isApprovingTeacherAdmission">
            <button class="btn-secondary" (click)="closeTeacherAdmissionModal()">Cancel</button>
            <button class="btn-primary" (click)="submitTeacherAdmissionApproval()">Approve & Create Account</button>
          </div>
        </div>
      </div>

      <!-- Student Admission Approval Modal -->
      <div class="modal-overlay" *ngIf="showAdmissionModal || isApprovingAdmission" (click)="closeAdmissionModal()">
        <div class="modal-content student-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isApprovingAdmission ? 'Approve Student Admission' : 'Student Admission Details' }}</h2>
            <button class="close-btn" (click)="closeAdmissionModal()">&times;</button>
          </div>
          <div class="modal-body" *ngIf="selectedAdmission">
            <div *ngIf="!isApprovingAdmission" class="student-view">
              <div class="student-profile-header">
                <div class="student-avatar-large">
                  <img *ngIf="selectedAdmission.photo" [src]="selectedAdmission.photo" />
                  <span *ngIf="!selectedAdmission.photo">{{ (selectedAdmission.firstName && selectedAdmission.firstName.charAt(0)) || 'S' }}{{ (selectedAdmission.lastName && selectedAdmission.lastName.charAt(0)) || '' }}</span>
                </div>
                <div>
                  <h3>{{ selectedAdmission.firstName }} {{ selectedAdmission.lastName }}</h3>
                  <p>{{ selectedAdmission.email }}</p>
                  <p>{{ selectedAdmission.phone || 'N/A' }}</p>
                </div>
              </div>
              <div class="student-details-grid">
                <div class="detail-item">
                  <span class="detail-label">Course *</span>
                  <select class="form-input" [(ngModel)]="viewCourseId" (change)="onViewCourseChange()" style="width: 100%; margin-top: 4px;">
                    <option [value]="null" disabled>Select Course</option>
                    <option *ngFor="let course of viewCourses" [value]="course.id">{{ course.name }}</option>
                  </select>
                  <div *ngIf="!viewCourses || viewCourses.length === 0" style="color: #ef4444; font-size: 12px; margin-top: 4px;">No courses available</div>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Academic Year</span>
                  <span class="detail-value">{{ selectedAdmission.academicYear || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status</span>
                  <span class="status-badge" [class]="'status-' + selectedAdmission.status">
                    {{ selectedAdmission.status | titlecase }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Submitted At</span>
                  <span class="detail-value">{{ formatAdmissionDate(selectedAdmission.submittedAt) }}</span>
                </div>
                <div class="detail-item full-width">
                  <span class="detail-label">Address</span>
                  <span class="detail-value">{{ selectedAdmission.address || 'N/A' }}</span>
                </div>
                <div class="detail-item full-width">
                  <span class="detail-label">Previous Qualification</span>
                  <span class="detail-value">{{ selectedAdmission.previousQualification || 'N/A' }}</span>
                </div>
              </div>
              
              <!-- Documents Section -->
              <div class="documents-view-section">
                <h4 class="documents-title">Documents</h4>
                <div class="documents-grid-view">
                  <div class="doc-view-item" *ngIf="selectedAdmission.photo">
                    <label>Photo</label>
                    <div class="doc-preview-container">
                      <img [src]="selectedAdmission.photo" class="doc-preview-large" />
                    </div>
                  </div>
                  <div class="doc-view-item" *ngIf="selectedAdmission.idProof">
                    <label>ID Proof</label>
                    <div class="doc-preview-container">
                      <img *ngIf="selectedAdmission.idProof.startsWith('data:image')" [src]="selectedAdmission.idProof" class="doc-preview-large" />
                      <a *ngIf="!selectedAdmission.idProof.startsWith('data:image')" [href]="selectedAdmission.idProof" target="_blank" class="doc-link">View PDF</a>
                    </div>
                  </div>
                  <div class="doc-view-item" *ngIf="selectedAdmission.marksheet">
                    <label>Marksheet</label>
                    <div class="doc-preview-container">
                      <img *ngIf="selectedAdmission.marksheet.startsWith('data:image')" [src]="selectedAdmission.marksheet" class="doc-preview-large" />
                      <a *ngIf="!selectedAdmission.marksheet.startsWith('data:image')" [href]="selectedAdmission.marksheet" target="_blank" class="doc-link">View PDF</a>
                    </div>
                  </div>
                  <div class="doc-view-item" *ngIf="selectedAdmission.tcLc">
                    <label>TC / LC</label>
                    <div class="doc-preview-container">
                      <img *ngIf="selectedAdmission.tcLc.startsWith('data:image')" [src]="selectedAdmission.tcLc" class="doc-preview-large" />
                      <a *ngIf="!selectedAdmission.tcLc.startsWith('data:image')" [href]="selectedAdmission.tcLc" target="_blank" class="doc-link">View PDF</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="isApprovingAdmission" class="student-edit-form">
              <div class="form-group">
                <label>Course *</label>
                <select class="form-input" [(ngModel)]="approvalCourseId" (change)="onApprovalCourseChange()">
                  <option [value]="null">Select a course</option>
                  <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
                </select>
              </div>
              <div class="form-group" *ngIf="approvalCourseId">
                <label>Class / Semester *</label>
                <select class="form-input" [(ngModel)]="approvalClassId" (change)="onApprovalClassChange()">
                  <option [value]="null">Select a class/semester</option>
                  <option *ngFor="let classItem of approvalClasses" [value]="classItem.id">{{ classItem.name }}</option>
                </select>
              </div>
              <div class="form-group" *ngIf="approvalClassId">
                <label>Class Section *</label>
                <select class="form-input" [(ngModel)]="approvalSectionId" (change)="onApprovalSectionChange()" style="appearance: auto; -webkit-appearance: menulist; -moz-appearance: menulist;">
                  <option [value]="null" disabled>-- Select Section (A, B, C, etc.) --</option>
                  <option *ngFor="let section of approvalSections" [value]="section.id">{{ section.name }} (Capacity: {{ section.capacity || 0 }} students)</option>
                </select>
                <small class="form-hint" *ngIf="approvalSectionId && approvalSections.length > 0" style="color: #10b981; font-size: 12px; margin-top: 4px; display: block;">
                  ✓ Selected: <strong>{{ getSectionName(approvalSectionId) }}</strong> | Capacity: {{ getSectionCapacity(approvalSectionId) }} students
                </small>
                <div *ngIf="approvalSections.length === 0 && approvalClassId" style="color: #ef4444; font-size: 12px; margin-top: 4px;">
                  ⚠️ No sections found for this class. Please create sections (A, B, C, etc.) first in "My Subjects" → "Sections" tab.
                </div>
                <div *ngIf="approvalSections.length > 0" style="color: #10b981; font-size: 12px; margin-top: 4px;">
                  ✓ {{ approvalSections.length }} section(s) available: {{ getApprovalSectionsNames() }}
                </div>
              </div>
              <div class="form-group" *ngIf="approvalSectionId">
                <label>Roll Number *</label>
                <input type="text" class="form-input" [(ngModel)]="approvalRollNumber" placeholder="Auto-generated roll number" [readonly]="true" />
                <small class="form-hint">Format: STUD{{ currentYear }}{{ getCourseNameForRoll(approvalCourseId) }}01</small>
              </div>
              <div class="form-group">
                <label>Remark (Optional)</label>
                <textarea class="form-input" [(ngModel)]="approvalRemark" rows="3" placeholder="Add any remarks"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer" *ngIf="isApprovingAdmission">
            <button class="btn-secondary" (click)="closeAdmissionModal()">Cancel</button>
            <button class="btn-primary" (click)="submitAdmissionApproval()">Approve & Create Account</button>
          </div>
        </div>
      </div>

      <!-- Subject Assignment Modal -->
      <div class="modal-overlay" *ngIf="showTeacherSubjectModal" (click)="closeSubjectModal()">
        <div class="modal-content student-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Assign Subjects</h2>
              <p class="modal-subtitle">{{ selectedTeacherForSubjects?.firstName }} {{ selectedTeacherForSubjects?.lastName }}</p>
            </div>
            <button class="close-btn" (click)="closeSubjectModal()" aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Subjects *</label>
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="teacherSubjectsInput" 
                placeholder="Enter subjects (comma-separated, e.g., Mathematics, Physics, Chemistry)"
              />
              <p class="form-hint">Separate multiple subjects with commas</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeSubjectModal()">Cancel</button>
            <button class="btn-primary" (click)="saveTeacherSubjects()">Save Subjects</button>
          </div>
        </div>
      </div>

      <!-- Student Modal -->
      <div class="modal-overlay" *ngIf="showStudentModal" (click)="closeStudentModal()">
        <div class="modal-content student-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditingStudent ? 'Edit Student' : 'Student Details' }}</h2>
            <button class="close-btn" (click)="closeStudentModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div *ngIf="!isEditingStudent && selectedStudent" class="student-view">
              <div class="student-profile-header">
                <div class="student-avatar-large">
                  <img *ngIf="selectedStudent.profileImage" [src]="selectedStudent.profileImage" />
                  <span *ngIf="!selectedStudent.profileImage">{{ (selectedStudent.firstName && selectedStudent.firstName.charAt(0)) || 'S' }}{{ (selectedStudent.lastName && selectedStudent.lastName.charAt(0)) || '' }}</span>
                </div>
                <div>
                  <h3>{{ selectedStudent.firstName }} {{ selectedStudent.lastName }}</h3>
                  <p>{{ selectedStudent.email }}</p>
                  <p *ngIf="selectedStudent.rollNumber">Roll Number: {{ selectedStudent.rollNumber }}</p>
                </div>
              </div>
              <div class="student-details-grid">
                <div class="detail-item">
                  <span class="detail-label">Course *</span>
                  <select class="form-input" [(ngModel)]="studentViewCourseId" (change)="onStudentViewCourseChange()" style="width: 100%; margin-top: 4px;">
                    <option [value]="null" disabled>Select Course</option>
                    <option *ngFor="let course of studentViewCourses" [value]="course.id">{{ course.name }}</option>
                  </select>
                  <div *ngIf="!studentViewCourses || studentViewCourses.length === 0" style="color: #ef4444; font-size: 12px; margin-top: 4px;">No courses available</div>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Class Sect</span>
                  <span class="detail-value">{{ selectedStudent.classSection || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Academic Year</span>
                  <span class="detail-value">{{ selectedStudent.academicYear || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status</span>
                  <span class="detail-value">{{ selectedStudent.studentStatus || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Phone</span>
                  <span class="detail-value">{{ selectedStudent.phone || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Gender</span>
                  <span class="detail-value">{{ selectedStudent.gender || 'N/A' }}</span>
                </div>
                <div class="detail-item full-width">
                  <span class="detail-label">Address</span>
                  <span class="detail-value">{{ selectedStudent.address || 'N/A' }}</span>
                </div>
                <div class="detail-item full-width" *ngIf="selectedStudent.bio">
                  <span class="detail-label">Bio</span>
                  <span class="detail-value">{{ selectedStudent.bio }}</span>
                </div>
              </div>
              
              <!-- Documents Section -->
              <div class="documents-view-section" *ngIf="selectedStudentAdmissionForView">
                <h4 class="documents-title">Documents</h4>
                <div class="documents-grid-view">
                  <div class="doc-view-item" *ngIf="selectedStudentAdmissionForView.photo">
                    <label>Photo</label>
                    <div class="doc-preview-container">
                      <img [src]="selectedStudentAdmissionForView.photo" class="doc-preview-large" />
                    </div>
                  </div>
                  <div class="doc-view-item" *ngIf="selectedStudentAdmissionForView.idProof">
                    <label>ID Proof</label>
                    <div class="doc-preview-container">
                      <img *ngIf="selectedStudentAdmissionForView.idProof && selectedStudentAdmissionForView.idProof.startsWith('data:image')" [src]="selectedStudentAdmissionForView.idProof" class="doc-preview-large" />
                      <a *ngIf="selectedStudentAdmissionForView.idProof && !selectedStudentAdmissionForView.idProof.startsWith('data:image')" [href]="selectedStudentAdmissionForView.idProof" target="_blank" class="doc-link">View PDF</a>
                    </div>
                  </div>
                  <div class="doc-view-item" *ngIf="selectedStudentAdmissionForView.marksheet">
                    <label>Marksheet</label>
                    <div class="doc-preview-container">
                      <img *ngIf="selectedStudentAdmissionForView.marksheet && selectedStudentAdmissionForView.marksheet.startsWith('data:image')" [src]="selectedStudentAdmissionForView.marksheet" class="doc-preview-large" />
                      <a *ngIf="selectedStudentAdmissionForView.marksheet && !selectedStudentAdmissionForView.marksheet.startsWith('data:image')" [href]="selectedStudentAdmissionForView.marksheet" target="_blank" class="doc-link">View PDF</a>
                    </div>
                  </div>
                  <div class="doc-view-item" *ngIf="selectedStudentAdmissionForView.tcLc">
                    <label>TC / LC</label>
                    <div class="doc-preview-container">
                      <img *ngIf="selectedStudentAdmissionForView.tcLc && selectedStudentAdmissionForView.tcLc.startsWith('data:image')" [src]="selectedStudentAdmissionForView.tcLc" class="doc-preview-large" />
                      <a *ngIf="selectedStudentAdmissionForView.tcLc && !selectedStudentAdmissionForView.tcLc.startsWith('data:image')" [href]="selectedStudentAdmissionForView.tcLc" target="_blank" class="doc-link">View PDF</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="isEditingStudent" class="student-edit-form">
              <div class="form-group">
                <label>Roll Number</label>
                <input type="text" class="form-input" [(ngModel)]="studentEditForm.rollNumber" />
              </div>
              <div class="form-group">
                <label>Class/Coe</label>
                <input type="text" class="form-input" [(ngModel)]="studentEditForm.classCourse" />
              </div>
              <div class="form-group">
                <label>Class Secti</label>
                <input type="text" class="form-input" [(ngModel)]="studentEditForm.classSection" />
              </div>
              <div class="form-group">
                <label>Academic Year</label>
                <input type="text" class="form-input" [(ngModel)]="studentEditForm.academicYear" />
              </div>
              <div class="form-group">
                <label>First Name</label>
                <input type="text" class="form-input" [(ngModel)]="studentEditForm.firstName" />
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input type="text" class="form-input" [(ngModel)]="studentEditForm.lastName" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input type="tel" class="form-input" [(ngModel)]="studentEditForm.phone" />
              </div>
              <div class="form-group">
                <label>Gender</label>
                <select class="form-input" [(ngModel)]="studentEditForm.gender">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Address</label>
                <textarea class="form-input" [(ngModel)]="studentEditForm.address" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label>Bio</label>
                <textarea class="form-input" [(ngModel)]="studentEditForm.bio" rows="3"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer" *ngIf="isEditingStudent">
            <button class="btn-secondary" (click)="closeStudentModal()">Cancel</button>
            <button class="btn-primary" (click)="saveStudentChanges()">Save Changes</button>
          </div>
        </div>
      </div>

      <!-- Confirmation Dialog -->
      <div class="modal-overlay" *ngIf="showConfirmDialog" (click)="closeConfirmDialog()">
        <div class="modal-content confirm-dialog" (click)="$event.stopPropagation()">
          <div class="confirm-dialog-header">
            <h3>Confirm Action</h3>
          </div>
          <div class="confirm-dialog-body">
            <p>{{ confirmMessage }}</p>
          </div>
          <div class="confirm-dialog-footer">
            <button class="btn-secondary" (click)="closeConfirmDialog()">Cancel</button>
            <button class="btn-primary" (click)="confirmAction()">OK</button>
          </div>
        </div>
      </div>

      <!-- Snackbar -->
      <div class="snackbar" [class.show]="showSnackbar" [class.success]="snackbarType === 'success'" [class.error]="snackbarType === 'error'">
        <span>{{ snackbarMessage }}</span>
      </div>

      <!-- Course Modal -->
      <div class="modal-overlay" *ngIf="showCourseModal" (click)="showCourseModal = false">
        <div class="modal-content student-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditingCourse ? 'Edit Course' : 'Create Course' }}</h2>
            <button class="close-btn" (click)="showCourseModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Course Name *</label>
              <input type="text" class="form-input" [(ngModel)]="courseForm.name" placeholder="e.g., BCA, BTech, 10th, 12th" />
            </div>
            <div class="form-group">
              <label>Type *</label>
              <select class="form-input" [(ngModel)]="courseForm.type">
                <option value="">Select Type</option>
                <option value="SCHOOL">School</option>
                <option value="COLLEGE">College</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Duration (Years)</label>
                <input type="number" class="form-input" [(ngModel)]="courseForm.durationYears" />
              </div>
              <div class="form-group">
                <label>Duration (Semesters)</label>
                <input type="number" class="form-input" [(ngModel)]="courseForm.durationSemesters" />
              </div>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select class="form-input" [(ngModel)]="courseForm.status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showCourseModal = false">Cancel</button>
            <button class="btn-primary" (click)="saveCourse()">Save</button>
          </div>
        </div>
      </div>

      <!-- Class Modal -->
      <div class="modal-overlay" *ngIf="showClassModal" (click)="showClassModal = false">
        <div class="modal-content student-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditingClass ? 'Edit Class / Semester' : 'Create Class / Semester' }}</h2>
            <button class="close-btn" (click)="showClassModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group" *ngIf="!isEditingClass">
              <label>Course *</label>
              <select class="form-input" [(ngModel)]="classForm.courseId">
                <option [value]="null">Select a course</option>
                <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
              </select>
            </div>
            <div class="form-group" *ngIf="isEditingClass">
              <label>Course</label>
              <input type="text" class="form-input" [value]="getCourseName(classForm.courseId)" disabled />
            </div>
            <div class="form-group">
              <label>Name *</label>
              <input type="text" class="form-input" [(ngModel)]="classForm.name" placeholder="e.g., 10th, 11th, Sem 1, Sem 2" />
            </div>
            <div class="form-group">
              <label>Type *</label>
              <select class="form-input" [(ngModel)]="classForm.type">
                <option value="">Select Type</option>
                <option value="CLASS">Class</option>
                <option value="SEMESTER">Semester</option>
              </select>
            </div>
            <div class="form-group">
              <label>Academic Year</label>
              <input type="text" class="form-input" [(ngModel)]="classForm.academicYear" placeholder="e.g., 2024-2025" />
            </div>
            <div class="form-group">
              <label>Status</label>
              <select class="form-input" [(ngModel)]="classForm.status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showClassModal = false">Cancel</button>
            <button class="btn-primary" (click)="saveClass()">Save</button>
          </div>
        </div>
      </div>

      <!-- Subject Modal -->
      <div class="modal-overlay" *ngIf="showSubjectModal" (click)="showSubjectModal = false">
        <div class="modal-content student-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ isEditingSubject ? 'Edit Subject' : 'Create Subject' }}</h2>
            <button class="close-btn" (click)="showSubjectModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group" *ngIf="!isEditingSubject">
              <label>Course *</label>
              <select class="form-input" [(ngModel)]="subjectForm.courseId" (change)="onSubjectCourseChange()">
                <option [value]="null">Select a course</option>
                <option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</option>
              </select>
            </div>
            <div class="form-group" *ngIf="!isEditingSubject">
              <label>Class / Semester *</label>
              <select class="form-input" [(ngModel)]="subjectForm.classId" [disabled]="!subjectForm.courseId" (change)="onSubjectClassChange()">
                <option [value]="null">Select a class/semester</option>
                <option *ngFor="let classItem of classesForSubject" [value]="classItem.id">{{ classItem.name }}</option>
              </select>
              <small class="form-hint" *ngIf="subjectForm.classId && sectionsForSubjectClass.length > 0">
                📌 This subject will be available for ALL sections: {{ getSectionsNamesForSubject() }}
              </small>
              <small class="form-hint" *ngIf="subjectForm.classId && sectionsForSubjectClass.length === 0" style="color: #f59e0b;">
                ⚠️ No sections created yet. Create sections for this class first.
              </small>
            </div>
            <div class="form-group">
              <label>Subject Name *</label>
              <input type="text" class="form-input" [(ngModel)]="subjectForm.name" />
            </div>
            <div class="form-group">
              <label>Subject Code *</label>
              <input type="text" class="form-input" [(ngModel)]="subjectForm.subjectCode" />
            </div>
            <div class="form-group">
              <label>Subject Type *</label>
              <select class="form-input" [(ngModel)]="subjectForm.subjectType">
                <option value="">Select Type</option>
                <option value="THEORY">Theory</option>
                <option value="PRACTICAL">Practical</option>
                <option value="LAB">Lab</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Max Marks</label>
                <input type="number" class="form-input" [(ngModel)]="subjectForm.maxMarks" />
              </div>
              <div class="form-group">
                <label>Credits</label>
                <input type="number" step="0.01" class="form-input" [(ngModel)]="subjectForm.credits" />
              </div>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select class="form-input" [(ngModel)]="subjectForm.status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showSubjectModal = false" type="button">Cancel</button>
            <button class="btn-primary" (click)="saveSubject()" type="button">Save</button>
          </div>
        </div>
      </div>

      <!-- Section Modal -->
      <div class="modal-overlay" *ngIf="showSectionModal" (click)="showSectionModal = false">
        <div class="modal-content student-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Manage Sections - {{ selectedClassForSections?.name }}</h2>
            <button class="close-btn" (click)="showSectionModal = false">&times;</button>
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
              <button class="btn-primary" (click)="sectionForm = { classId: selectedClassForSections?.id, status: 'active' }; isEditingSection = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Add Section
              </button>
            </div>
            <div *ngIf="!isEditingSection && sectionForm.classId" class="form-row">
              <div class="form-group">
                <label>Section Name *</label>
                <input type="text" class="form-input" [(ngModel)]="sectionForm.name" placeholder="e.g., A, B, C" />
              </div>
              <div class="form-group">
                <label>Capacity</label>
                <input type="number" class="form-input" [(ngModel)]="sectionForm.capacity" />
              </div>
            </div>
            <div *ngIf="!isEditingSection && sectionForm.classId" class="form-actions">
              <button class="btn-primary" (click)="saveSection()">Save Section</button>
              <button class="btn-secondary" (click)="sectionForm = {}">Cancel</button>
            </div>
            <div *ngIf="sections.length > 0" class="sections-list">
              <h4>Existing Sections</h4>
              <div class="section-item" *ngFor="let section of sections">
                <span>{{ section.name }}</span>
                <span *ngIf="section.capacity">(Capacity: {{ section.capacity }})</span>
                <button class="btn-edit" (click)="editSection(section)">Edit</button>
                <button class="btn-delete" (click)="deleteSection(section.id!)" *ngIf="section.id">Delete</button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showSectionModal = false">Close</button>
          </div>
        </div>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .page { 
      min-height: 100vh; 
      background: var(--primary-bg); 
      color: var(--text-white);
      display: flex;
      flex-direction: column;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 16px;
      padding: 40px;
    }
    .loading-container p {
      color: var(--text-gray);
      font-weight: 600;
      font-size: 16px;
    }
    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--border-gray);
      border-top-color: var(--entity-primary-color, #10b981);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 16px;
      padding: 40px;
      text-align: center;
    }
    .error-container p {
      color: var(--text-gray);
      font-weight: 600;
      font-size: 16px;
    }

    .nav{
      height: 64px;
      display:grid;
      grid-template-columns: 1fr auto 1fr;
      align-items:center;
      padding: 0 28px;
      border-bottom: 1px solid var(--border-gray);
      background: var(--primary-bg);
      position: sticky;
      top:0;
      z-index:100;
    }
    .brand{ display:flex; align-items:center; gap:10px; text-decoration:none; color: var(--text-white); font-weight: 800; }
    .brand-icon{ width: 28px; height: 28px; }
    .brand-text{ font-size: 18px; }
    .nav-center{ display:flex; justify-content:center; }
    .breadcrumb{
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-radius: 10px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .breadcrumb-link{
      color: var(--text-white);
      text-decoration: none;
      font-weight: 700;
      transition: color 0.2s;
    }
    .breadcrumb-link:hover{ color: var(--entity-primary-color); }
    .breadcrumb-separator{ color: var(--text-gray); font-weight: 700; }
    .breadcrumb-current{ color: var(--text-white); font-weight: 700; }
    .nav-right{ 
      display:flex; 
      justify-content:flex-end; 
      align-items:center; 
      gap: 10px; 
      position: relative;
    }
    .icon-btn{
      width: 36px; height: 36px;
      border-radius: 10px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      display:flex; align-items:center; justify-content:center;
      cursor: pointer;
    }
    .icon-btn:hover{ border-color: var(--entity-primary-color); transform:none; box-shadow:none; }

    .user-trigger{
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      border-radius: 12px;
      background: var(--secondary-bg);
      border: 1px solid var(--border-gray);
      cursor: pointer;
      transition: all 0.2s;
      color: var(--text-white);
    }
    .user-trigger:hover{
      background: rgba(255,255,255,0.02);
      transform: none;
      box-shadow: none;
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
      text-transform: lowercase;
    }

    .user-block { display: flex; flex-direction: column; gap: 2px; }
    .user-name { font-weight: 600; font-size: 14px; line-height: 1; color: var(--text-white); }
    .user-badge {
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 999px;
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.25);
      color: #3b82f6;
      font-weight: 700;
      width: fit-content;
    }

    .user-menu{
      position: absolute;
      right: 18px;
      top: 58px;
      width: 320px;
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.25);
      overflow: hidden;
      z-index: 200;
    }
    .user-menu-head{
      display:flex;
      gap: 12px;
      padding: 14px 14px 12px;
      align-items: center;
    }
    .menu-avatar{
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--secondary-bg);
      background-size: cover;
      background-position: center;
      border: 1px solid var(--border-gray);
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight: 900;
      text-transform: lowercase;
      color: var(--text-white);
    }
    .menu-name{ font-weight: 900; font-size: 18px; line-height: 1.2; }
    .menu-email{ color: var(--text-gray); font-weight: 600; }
    .menu-divider{ height: 1px; background: var(--border-gray); opacity: .6; }
    .menu-item{
      width: 100%;
      display:flex;
      align-items:center;
      gap: 12px;
      padding: 14px;
      background: transparent;
      color: var(--text-white);
      border-top: 1px solid rgba(255,255,255,0.02);
      text-align: left;
      font-weight: 800;
      font-size: 18px;
      cursor: pointer;
      border: none;
    }
    .menu-item:hover{
      background: rgba(255,255,255,0.02);
    }
    .mi-ico{ font-size: 20px; }

    .content{ 
      flex: 1;
      padding: 18px 28px 16px; 
      display: flex;
      flex-direction: column;
    }

    .entity-header-card{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    .entity-header-icon{
      font-size: 48px;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .entity-logo-img{
      width: 64px;
      height: 64px;
      border-radius: 12px;
      object-fit: cover;
    }
    .type-badge{
      padding: 4px 10px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--entity-primary-color) 15%, transparent);
      border: 1px solid color-mix(in srgb, var(--entity-primary-color) 25%, transparent);
      color: var(--entity-primary-color);
      font-weight: 700;
      font-size: 12px;
    }
    .entity-header-info{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .entity-header-title{
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .entity-header-title h1{
      font-size: 28px;
      font-weight: 900;
      margin: 0;
    }
    .status-badge{
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }
    .entity-header-meta{
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-gray);
      font-size: 14px;
    }
    .meta-separator{ color: var(--text-gray); }

    .nav-tabs{
      display: flex;
      gap: 4px;
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 24px;
      overflow-x: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--border-gray) transparent;
    }
    .nav-tabs::-webkit-scrollbar{
      height: 6px;
    }
    .nav-tabs::-webkit-scrollbar-track{
      background: transparent;
    }
    .nav-tabs::-webkit-scrollbar-thumb{
      background: var(--border-gray);
      border-radius: 3px;
    }
    .nav-tab{
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 8px;
      background: transparent;
      border: none;
      color: var(--text-gray);
      font-weight: 700;
      font-size: 13px;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s;
    }
    .nav-tab:hover{
      background: rgba(255,255,255,0.02);
    }
    .nav-tab.active{
      background: color-mix(in srgb, var(--entity-primary-color) 15%, transparent);
      color: var(--entity-primary-color);
      border: 1px solid color-mix(in srgb, var(--entity-primary-color) 25%, transparent);
    }
    .nav-tab svg{
      width: 18px;
      height: 18px;
    }
    .tab-emoji{
      font-size: 16px;
    }

    .dashboard-section{
      margin-bottom: 24px;
    }
    .section-header{
      margin-bottom: 20px;
    }
    .section-title{
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 6px;
    }
    .section-subtitle{
      color: var(--text-gray);
      font-weight: 600;
    }
    .dashboard-content{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .dashboard-card{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 20px;
    }
    .dashboard-card .card-title{
      font-size: 14px;
      font-weight: 700;
      color: var(--text-gray);
      margin-bottom: 12px;
    }
    .dashboard-card .card-text{
      font-size: 16px;
      font-weight: 600;
      color: var(--text-white);
    }

    .settings-section{
      margin-bottom: 24px;
    }
    .settings-header{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .settings-title{
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 6px;
    }
    .settings-subtitle{
      color: var(--text-gray);
      font-weight: 600;
    }
    .edit-icon-btn{
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: transparent;
      border: 1px solid var(--border-gray);
      color: var(--text-white);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .edit-icon-btn:hover{
      border-color: var(--entity-primary-color);
    }

    .settings-content{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .settings-card{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 24px;
    }
    .card-header{
      margin-bottom: 24px;
    }
    .card-title{
      font-size: 18px;
      font-weight: 900;
      margin-bottom: 4px;
    }
    .card-subtitle{
      color: var(--text-gray);
      font-size: 14px;
    }
    .card-body{
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .form-group{
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-hint {
      display: block;
      margin-top: 6px;
      font-size: 13px;
      color: var(--text-gray);
      font-weight: 500;
    }
    .form-group label{
      color: var(--text-white);
      font-weight: 700;
      font-size: 14px;
    }
    .form-input{
      padding: 12px 14px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 10px;
      color: var(--text-white);
      outline: none;
      font-size: 14px;
    }
    .form-input:focus{ border-color: var(--entity-primary-color); }
    .form-input:disabled{
      background: rgba(255,255,255,0.01);
      opacity: 0.6;
      cursor: not-allowed;
    }
    .textarea{ min-height: 100px; resize: vertical; }
    .color-input{
      height: 48px;
      padding: 4px;
      cursor: pointer;
    }

    .logo-upload-section{
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-placeholder{
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      border: 2px dashed var(--border-gray);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
      flex-shrink: 0;
    }
    .logo-placeholder:hover{
      border-color: var(--entity-primary-color);
    }
    .logo-preview{
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    .logo-placeholder-text{
      color: var(--text-gray);
      font-size: 14px;
      font-weight: 600;
    }
    .logo-upload-btn{
      position: absolute;
      bottom: 0;
      right: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--entity-primary-color);
      border: none;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px color-mix(in srgb, var(--entity-primary-color) 30%, transparent);
      transition: all 0.2s;
    }
    .logo-upload-btn:hover{
      background: color-mix(in srgb, var(--entity-primary-color) 85%, black);
      transform: scale(1.05);
    }
    .logo-upload-btn svg{
      width: 18px;
      height: 18px;
    }

    .settings-actions{
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    .btn-primary{
      padding: 10px 20px;
      border-radius: 12px;
      background: var(--entity-primary-color);
      color: white;
      font-weight: 800;
      cursor: pointer !important;
      border: none;
      position: relative;
      z-index: 1003;
      pointer-events: auto !important;
      user-select: none;
    }
    .btn-primary:hover{ 
      background: color-mix(in srgb, var(--entity-primary-color) 85%, black);
      cursor: pointer !important;
    }
    .btn-secondary{
      padding: 10px 20px;
      border-radius: 12px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 800;
      cursor: pointer;
    }
    .btn-secondary:hover{ border-color: rgba(148,163,184,0.5); }

    /* Admissions Styles */
    .admission-main-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      border-bottom: 2px solid var(--border-gray);
    }
    .admission-main-tab {
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
    .admission-main-tab:hover { color: var(--text-white); }
    .admission-main-tab.active {
      color: var(--accent-green);
      border-bottom-color: var(--accent-green);
    }

    .admission-sub-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .admission-sub-tab {
      padding: 8px 16px;
      border-radius: 10px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .admission-sub-tab:hover {
      border-color: var(--accent-green);
      background: var(--card-bg);
    }
    .admission-sub-tab.active {
      background: var(--accent-green);
      border-color: var(--accent-green);
      color: white;
    }

    .admission-section {
      width: 100%;
    }

    .admission-form-section,
    .admission-list-section {
      width: 100%;
      margin-bottom: 24px;
    }

    .admission-form-header {
      margin-bottom: 20px;
    }
    .admission-form-header h3 {
      font-size: 20px;
      font-weight: 900;
      margin-bottom: 6px;
    }
    .admission-form-header p {
      color: var(--text-gray);
      font-weight: 600;
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
      gap: 20px;
      margin-bottom: 20px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--border-gray);
    }

    .admission-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .admission-list-header h3 {
      font-size: 20px;
      font-weight: 900;
      margin: 0;
    }

    .documents-section {
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1px solid var(--border-gray);
    }
    .documents-section h4 {
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
    .admission-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .admission-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .admission-avatar {
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
    .admission-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .admission-card-title h4 {
      margin: 0;
      font-size: 18px;
      font-weight: 900;
    }
    .admission-card-title p {
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

    .admission-card-body {
      margin-bottom: 16px;
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

    .admission-card-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .admission-card-actions > div:first-child {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      width: 100%;
    }
    .admission-card-actions > div:last-child {
      display: flex;
      gap: 8px;
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
      z-index: 1001;
      position: relative;
      pointer-events: auto;
    }
    .confirm-dialog {
      max-width: 400px;
      padding: 0;
    }
    .confirm-dialog-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-gray);
    }
    .confirm-dialog-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 900;
      color: var(--text-white);
    }
    .confirm-dialog-body {
      padding: 24px;
    }
    .confirm-dialog-body p {
      margin: 0;
      color: var(--text-white);
      font-size: 14px;
      line-height: 1.5;
    }
    .confirm-dialog-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border-gray);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn-secondary {
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--border-gray);
    }
    .btn-primary {
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid var(--primary-color);
      background: var(--primary-color);
      color: var(--text-white);
      font-weight: 700;
      font-size: 14px;
      cursor: pointer !important;
      transition: all 0.2s;
      position: relative;
      z-index: 1003;
      pointer-events: auto !important;
      user-select: none;
    }
    .btn-primary:hover {
      background: var(--primary-color);
      opacity: 0.9;
      cursor: pointer !important;
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
    .modal-body {
      margin-bottom: 20px;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      position: relative;
      z-index: 1002;
      pointer-events: auto;
    }

    /* Students Section Styles */
    .student-filters {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .filter-btn {
      padding: 10px 20px;
      border-radius: 10px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn:hover {
      border-color: var(--accent-green);
      background: var(--card-bg);
    }
    .filter-btn.active {
      background: var(--accent-green);
      border-color: var(--accent-green);
      color: white;
    }

    .students-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      width: 100%;
      box-sizing: border-box;
    }
    .courses-grid, .classes-grid, .subjects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      width: 100%;
      margin-top: 20px;
    }
    .course-card, .class-card, .subject-card {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      padding: 20px;
      transition: all 0.2s;
    }
    .course-card:hover, .class-card:hover, .subject-card:hover {
      border-color: var(--accent-green);
      transform: translateY(-2px);
    }
    .course-card-header, .class-card-header, .subject-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .course-card-header h4, .class-card-header h4, .subject-card-header h4 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
    }
    .course-card-body, .class-card-body, .subject-card-body {
      margin-bottom: 16px;
    }
    .course-card-body p, .class-card-body p, .subject-card-body p {
      margin: 8px 0;
      font-size: 14px;
      color: var(--text-gray);
    }
    .subject-sections {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border-gray);
    }
    .sections-info-box {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .sections-info-box p {
      margin: 8px 0;
      color: var(--text-white);
    }
    .sections-info-box .info-text {
      margin-top: 12px;
      font-size: 13px;
      color: var(--text-gray);
      font-style: italic;
    }
    .sections-badge-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .section-badge {
      display: inline-block;
      padding: 6px 12px;
      background: var(--entity-primary-color);
      color: white;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
    }
    .section-badge-small {
      display: inline-block;
      padding: 4px 8px;
      background: rgba(59, 130, 246, 0.2);
      color: var(--text-white);
      border: 1px solid rgba(59, 130, 246, 0.4);
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin-right: 4px;
    }
    .course-card-actions, .class-card-actions, .subject-card-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .form-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
    }
    .assignments-list {
      margin-top: 20px;
    }
    .assignment-card {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .assignment-info p {
      margin: 4px 0;
      font-size: 14px;
    }
    .sections-list {
      margin-top: 20px;
    }
    .section-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .student-card {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 20px;
      transition: all 0.2s;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }
    .student-card:hover {
      border-color: var(--accent-green);
      transform: translateY(-2px);
    }
    .student-card-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
      width: 100%;
      position: relative;
    }
    .student-avatar {
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
      flex-shrink: 0;
    }
    .student-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .student-info {
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }
    .student-card-header .status-badge {
      flex-shrink: 0;
      margin-left: auto;
      white-space: nowrap;
      position: absolute;
      top: 0;
      right: 0;
    }
    .student-card-header {
      position: relative;
      padding-right: 80px;
    }
    .student-info h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 900;
    }
    .student-info p {
      margin: 4px 0;
      color: var(--text-gray);
      font-size: 14px;
    }
    .roll-number {
      font-weight: 700;
      color: var(--accent-green);
    }
    .status-badge.status-active {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #10b981;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .status-badge.status-inactive {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .status-badge.status-pass-out {
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(168, 85, 247, 0.25);
      color: #a855f7;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .student-card-body {
      margin-bottom: 16px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: var(--text-gray);
      font-size: 14px;
      font-weight: 700;
    }
    .info-value {
      color: var(--text-white);
      font-weight: 600;
    }
    .student-card-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .btn-view, .btn-edit, .btn-status, .btn-reset, .btn-subjects, .btn-activate, .btn-deactivate, .btn-delete {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
      min-width: fit-content;
    }
    .student-card-actions, .teacher-card-actions, .student-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      width: 100%;
    }
    .btn-status {
      font-size: 12px;
      padding: 8px 12px;
    }
    .student-card, .teacher-card {
      overflow: hidden;
      word-wrap: break-word;
    }
    .student-card-actions, .teacher-card-actions, .student-actions {
      max-width: 100%;
      overflow-x: visible;
      overflow-y: visible;
    }
    .btn-subjects:hover {
      background: rgba(168, 85, 247, 0.12);
    }
    .btn-activate:hover {
      background: rgba(34, 197, 94, 0.12);
      border-color: rgba(34, 197, 94, 0.3);
    }
    .btn-deactivate:hover {
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.3);
    }
    .btn-delete:hover {
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.3);
      color: #ef4444;
      border-color: rgba(168, 85, 247, 0.25);
      color: #a855f7;
    }
    .btn-view:hover {
      background: rgba(59, 130, 246, 0.12);
      border-color: rgba(59, 130, 246, 0.25);
      color: #3b82f6;
    }
    .btn-edit:hover {
      background: rgba(245, 158, 11, 0.12);
      border-color: rgba(245, 158, 11, 0.25);
      color: #f59e0b;
    }
    .btn-status:hover {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.25);
      color: #10b981;
    }
    .btn-reset:hover {
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.25);
      color: #ef4444;
    }

    .student-modal {
      max-width: 700px;
    }
    .student-view {
      padding: 20px 0;
    }
    .student-profile-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border-gray);
    }
    .student-avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--secondary-bg);
      border: 1px solid var(--border-gray);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      color: var(--text-white);
      text-transform: uppercase;
      font-size: 24px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .student-avatar-large img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .student-profile-header h3 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 900;
    }
    .student-profile-header p {
      margin: 4px 0;
      color: var(--text-gray);
    }
    .student-details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .detail-item.full-width {
      grid-column: 1 / -1;
    }
    .detail-label {
      color: var(--text-gray);
      font-size: 12px;
      font-weight: 700;
    }
    .detail-value {
      color: var(--text-white);
      font-weight: 600;
    }

    .documents-view-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border-gray);
    }
    .documents-title {
      font-size: 18px;
      font-weight: 900;
      color: var(--text-white);
      margin-bottom: 16px;
    }
    .documents-grid-view {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    .doc-view-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .doc-view-item label {
      color: var(--text-gray);
      font-size: 12px;
      font-weight: 700;
    }
    .doc-preview-container {
      width: 100%;
      min-height: 150px;
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      overflow: hidden;
      background: var(--secondary-bg);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .doc-preview-large {
      max-width: 100%;
      max-height: 300px;
      object-fit: contain;
    }
    .doc-link {
      color: var(--primary-color);
      text-decoration: none;
      padding: 12px;
      text-align: center;
      font-weight: 600;
    }
    .doc-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px){
      .nav{ padding: 0 20px; }
      .content{ padding: 18px 20px 16px; }
      .settings-content{ grid-template-columns: 1fr; }
      .entity-header-card{ flex-direction: column; gap: 16px; }
      .dashboard-content{ grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr; }
      .doc-grid { grid-template-columns: 1fr; }
      .info-grid { grid-template-columns: 1fr; }
      .admission-card-actions { flex-direction: column; }
      .admission-card-actions button { width: 100%; }
      .students-grid { grid-template-columns: 1fr; }
      .student-card-actions { flex-direction: column; }
      .student-card-actions button { width: 100%; }
      .student-details-grid { grid-template-columns: 1fr; }
    }

    /* Snackbar Styles */
    .snackbar {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      padding: 16px 24px;
      color: var(--text-white);
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      opacity: 0;
      transition: all 0.3s ease;
      min-width: 300px;
      text-align: center;
    }
    .snackbar.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .snackbar.success {
      border-color: rgba(16, 185, 129, 0.5);
      background: rgba(16, 185, 129, 0.1);
    }
    .snackbar.error {
      border-color: rgba(239, 68, 68, 0.5);
      background: rgba(239, 68, 68, 0.1);
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  isDarkMode = true;
  entity: Entity | null = null;
  isLoading = false;
  isEditing = false;
  logoPreview: string | null = null;
  activeTab: 'admissions' | 'students' | 'teachers' | 'reports' | 'fees' | 'dashboard' | 'subjects' | 'assignments' | 'exam-attempts' | 'attendance' | 'notices' | 'settings' = 'dashboard';
  
  userName = 'admin';
  userEmail = 'admin@lms.com';
  userInitial = 'a';
  userRole = 'ADMIN';
  isUserMenuOpen = false;
  profileImage = '';

  editForm: any = {
    name: '',
    type: '',
    address: '',
    description: '',
    email: '',
    phone: '',
    logoUrl: '',
    primaryColor: '#10b981'
  };

  originalData: any = {};

  // Admissions properties
  admissionMainTab: 'student' | 'teacher' = 'student';
  studentSubTab: 'new' | 'pending' | 'approved' | 'rejected' = 'new';
  teacherSubTab: 'new' | 'pending' | 'approved' | 'rejected' = 'new';
  studentForm: Partial<StudentAdmission> = {};
  teacherForm: Partial<TeacherAdmission> = {};
  studentAdmissions: StudentAdmission[] = [];
  teacherAdmissions: TeacherAdmission[] = [];
  isLoadingStudentAdmissions = false;
  isLoadingTeacherAdmissions = false;
  isSubmittingStudent = false;
  isSubmittingTeacher = false;
  showActionModal = false;
  currentAction: 'approve' | 'reject' | 'correction' = 'approve';
  currentAdmissionId: number | null = null;
  actionRemark = '';
  actionModalTitle = '';
  rollNumber = '';
  classSection = '';
  actionModalCourseId: any = null;
  actionModalClassId: any = null;
  actionModalSectionId: any = null;
  actionModalClasses: ClassEntity[] = [];
  actionModalSections: Section[] = [];

  // Snackbar properties
  showSnackbar = false;
  snackbarMessage = '';
  snackbarType: 'success' | 'error' = 'success';
  
  // Confirmation dialog
  showConfirmDialog = false;
  confirmMessage = '';
  confirmCallback: (() => void) | null = null;

  // Students properties
  students: Student[] = [];
  isLoadingStudents = false;
  studentFilter: 'all' | 'active' | 'inactive' | 'pass-out' = 'all';
  showStudentModal = false;
  selectedStudent: Student | null = null;
  selectedAdmission: StudentAdmission | null = null;
  isEditingStudent = false;
  studentEditForm: Partial<Student> = {};
  showAdmissionModal = false;
  isApprovingAdmission = false;
  approvalRollNumber = '';
  approvalClassSection = '';
  approvalRemark = '';
  approvalCourseId: any = null;
  approvalClassId: any = null;
  approvalSectionId: any = null;
  approvalClasses: ClassEntity[] = [];
  approvalSections: Section[] = [];
  currentYear = new Date().getFullYear();

  // Teachers properties
  teachers: Teacher[] = [];
  isLoadingTeachers = false;
  teacherFilter: 'all' | 'active' | 'inactive' = 'all';
  showTeacherSubjectModal = false;
  selectedTeacherForSubjects: Teacher | null = null;
  teacherSubjectsInput = '';
  showTeacherModal = false;
  selectedTeacher: Teacher | null = null;
  selectedTeacherAdmission: TeacherAdmission | null = null;
  selectedTeacherAdmissionForView: TeacherAdmission | null = null;
  selectedStudentAdmissionForView: StudentAdmission | null = null;
  isEditingTeacher = false;
  teacherEditForm: Partial<Teacher> = {};
  showTeacherAdmissionModal = false;
  isApprovingTeacherAdmission = false;
  approvalSubjects = '';
  approvalAssignedClasses = '';
  approvalTeacherRemark = '';

  // My Subjects section properties
  subjectSubTab: 'courses' | 'classes' | 'sections' | 'subjects' | 'teacher-assignment' = 'courses';
  courses: Course[] = [];
  viewCourses: Course[] = [];
  viewCourseId: number | null = null;
  studentViewCourses: Course[] = [];
  studentViewCourseId: number | null = null;
  classes: ClassEntity[] = [];
  classesForSubject: ClassEntity[] = [];
  sections: Section[] = [];
  sectionsForClass: Section[] = []; // Sections for the selected class in subjects tab
  subjects: Subject[] = [];
  allSubjects: Subject[] = [];
  isLoadingAllSubjects: boolean = false;
  sectionsForAssignment: Section[] = [];
  teacherAssignments: SubjectTeacherMapping[] = [];
  isLoadingCourses = false;
  isLoadingClasses = false;
  isLoadingSubjects = false;
  isLoadingTeacherAssignments = false;
  selectedCourseForClass: any = null;
  selectedCourseForSubject: any = null;
  selectedClassForSubject: any = null;
  selectedSubjectForAssignment: any = null;
  selectedSectionForAssignment: any = null;
  selectedTeacherForAssignment: any = null;
  selectedClassForSections: ClassEntity | null = null;
  selectedCourseForSections: any = null;
  selectedClassForSectionsTab: any = null;
  classesForSections: ClassEntity[] = [];
  sectionsForSectionsTab: Section[] = [];
  isLoadingSectionsForTab = false;
  sectionsForSubjectClass: Section[] = [];
  showCourseModal = false;
  showClassModal = false;
  showSubjectModal = false;
  showSectionModal = false;
  showSectionStudentsModal = false;
  selectedSectionForView: Section | null = null;
  sectionStudents: Student[] = [];
  isLoadingSectionStudents = false;
  sectionStudentCounts: Map<number, number> = new Map(); // sectionId -> student count
  isEditingCourse = false;
  isEditingClass = false;
  isEditingSubject = false;
  isEditingSection = false;
  courseForm: Partial<Course> = {};
  classForm: Partial<ClassEntity> = {};
  subjectForm: Partial<Subject> = {};
  sectionForm: Partial<Section> = {};

  constructor(
    private theme: ThemeService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private entityService: EntityService,
    private profileService: ProfileService,
    private admissionService: AdmissionService,
    private studentService: StudentService,
    private teacherService: TeacherService,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user?.name) this.userName = user.name;
    if (user?.email) this.userEmail = user.email;
    if (user?.role) this.userRole = user.role;
    this.userInitial = (this.userName?.trim()?.[0] || 'a').toLowerCase();

    this.theme.isDarkMode$.subscribe(v => (this.isDarkMode = v));
    
    // Check if entityId is provided in query params (for superadmin)
    this.route.queryParams.subscribe(params => {
      console.log('Query params received:', params);
      const entityId = params['entityId'];
      if (entityId) {
        console.log('Loading entity with ID:', entityId);
        // Load specific entity for superadmin
        this.loadEntityById(entityId);
      } else {
        console.log('No entityId in query params, loading first entity');
        // Load entity for admin based on their collegeId
        this.loadFirstEntity();
      }
    });

    // Load profile image
    if (this.userEmail) {
      this.loadProfileImage();
    }
  }

  loadProfileImage(): void {
    this.profileService.getProfile(this.userEmail).subscribe(result => {
      if (result.ok && result.profile.profileImage) {
        this.profileImage = result.profile.profileImage;
      }
    });
  }

  loadEntityById(entityId: string | number): void {
    console.log('loadEntityById called with:', entityId);
    this.isLoading = true;
    this.entity = null; // Clear previous entity
    const id = typeof entityId === 'string' ? parseInt(entityId) : entityId;
    if (!id || isNaN(id)) {
      this.isLoading = false;
      console.error('Invalid entity ID:', entityId);
      this.showSnackbarMessage('Invalid entity ID', 'error');
      return;
    }
    console.log('Calling entityService.getEntityById with:', id.toString());
    this.entityService.getEntityById(id.toString()).subscribe({
      next: (result) => {
        console.log('Entity service response:', result);
        this.isLoading = false;
        if (result.ok && result.entity) {
          console.log('Entity loaded successfully:', result.entity);
          this.entity = result.entity;
          // Store features if available
          if (result.features) {
            this.entity.features = result.features;
          }
          this.editForm = {
            name: this.entity.name,
            type: this.entity.type,
            address: this.entity.address,
            description: this.entity.description || '',
            email: this.entity.email || '',
            phone: this.entity.phone || '',
            logoUrl: this.entity.logoUrl || '',
            primaryColor: this.entity.primaryColor || '#10b981'
          };
          this.originalData = { ...this.editForm };
          // Load students and teachers after entity is loaded
          this.loadStudents('all');
          this.loadTeachers('all');
          // Load courses and subjects when entity is loaded
          this.loadCourses();
          this.loadAllSubjects();
        } else {
          console.error('Entity not found:', result);
          const errorMsg = result.ok === false ? result.message : 'Entity not found';
          this.showSnackbarMessage(errorMsg, 'error');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error loading entity:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        });
        this.showSnackbarMessage('Failed to load entity: ' + (err.error?.message || err.message || 'Unknown error'), 'error');
      }
    });
  }

  loadFirstEntity(): void {
    this.isLoading = true;
    const user = this.auth.getUser();
    const collegeId = user?.collegeId;
    
    if (collegeId) {
      // Load specific entity for admin
      this.loadEntityById(collegeId.toString());
    } else {
      // Fallback: load first entity if no collegeId
      this.entityService.getAllEntities().subscribe({
        next: (result) => {
          this.isLoading = false;
          if (result.ok && result.entities && result.entities.length > 0) {
            this.entity = result.entities[0];
            this.editForm = {
              name: this.entity.name,
              type: this.entity.type,
              address: this.entity.address,
              description: this.entity.description || '',
              email: this.entity.email || '',
              phone: this.entity.phone || '',
              logoUrl: this.entity.logoUrl || '',
              primaryColor: this.entity.primaryColor || '#10b981'
            };
            this.originalData = { ...this.editForm };
            // Load students and teachers after entity is loaded
            this.loadStudents('all');
            this.loadTeachers('all');
            // Load courses and subjects when entity is loaded
            this.loadCourses();
            this.loadAllSubjects();
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error loading entities:', err);
        }
      });
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

  toggleUserMenu(evt: MouseEvent): void {
    evt.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isUserMenuOpen = false;
  }

  goProfile(): void {
    this.isUserMenuOpen = false;
    this.router.navigate(['/admin/profile']);
  }

  // Admissions methods
  switchAdmissionMainTab(tab: 'student' | 'teacher'): void {
    this.admissionMainTab = tab;
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
    if (this.entity?.id) {
      this.admissionService.getStudentAdmissionsByStatus(parseInt(this.entity.id), apiStatus).subscribe({
        next: (result) => {
          this.isLoadingStudentAdmissions = false;
          if (result.ok && result.admissions) {
            this.studentAdmissions = result.admissions;
          } else {
            this.studentAdmissions = [];
          }
        },
        error: (err) => {
          this.isLoadingStudentAdmissions = false;
          console.error('Error loading student admissions:', err);
          this.studentAdmissions = [];
        }
      });
    } else {
      this.isLoadingStudentAdmissions = false;
    }
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
    if (this.entity?.id) {
      console.log('Loading teacher admissions for entity:', this.entity.id, 'status:', apiStatus);
      const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
      this.admissionService.getTeacherAdmissionsByStatus(entityId, apiStatus).subscribe(result => {
        this.isLoadingTeacherAdmissions = false;
        console.log('Teacher admissions result:', result);
        if (result.ok && result.admissions) {
          this.teacherAdmissions = result.admissions || [];
          console.log('Teacher admissions loaded:', this.teacherAdmissions.length);
        } else {
          this.teacherAdmissions = [];
          console.log('No teacher admissions found or error:', result.message);
        }
      }, error => {
        this.isLoadingTeacherAdmissions = false;
        this.teacherAdmissions = [];
        console.error('Error loading teacher admissions:', error);
      });
    } else {
      this.isLoadingTeacherAdmissions = false;
      this.teacherAdmissions = [];
      console.log('Entity ID not available');
    }
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
      alert('Please fill in all required fields');
      return;
    }
    if (!this.entity?.id) {
      alert('Entity not loaded');
      return;
    }
    this.isSubmittingStudent = true;
    this.admissionService.createStudentAdmission(parseInt(this.entity.id), this.studentForm).subscribe(result => {
      this.isSubmittingStudent = false;
      if (result.ok) {
        this.showSnackbarMessage('Student admission application submitted successfully!', 'success');
        this.resetStudentForm();
        // Switch to admissions tab, student main tab, pending sub-tab and reload the list
        this.activeTab = 'admissions';
        this.admissionMainTab = 'student';
        this.studentSubTab = 'pending';
        this.loadStudentAdmissions('pending');
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
    if (!this.entity?.id) {
      alert('Entity not loaded');
      return;
    }
    this.isSubmittingTeacher = true;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    console.log('Submitting teacher admission for entity:', entityId, 'form:', this.teacherForm);
    this.admissionService.createTeacherAdmission(entityId, this.teacherForm).subscribe(result => {
      this.isSubmittingTeacher = false;
      console.log('Teacher admission submission result:', result);
      if (result.ok) {
        this.showSnackbarMessage('Teacher admission application submitted successfully!', 'success');
        this.resetTeacherForm();
        // Switch to admissions tab, teacher main tab, pending sub-tab and reload the list
        this.activeTab = 'admissions';
        this.admissionMainTab = 'teacher';
        // Small delay to ensure UI updates before loading
        setTimeout(() => {
          this.teacherSubTab = 'pending';
          this.loadTeacherAdmissions('pending');
        }, 100);
      } else {
        alert(result.message || 'Failed to submit application');
      }
    }, error => {
      this.isSubmittingTeacher = false;
      console.error('Error submitting teacher admission:', error);
      alert('Failed to submit application. Please try again.');
    });
  }

  resetStudentForm(): void {
    this.studentForm = {};
  }
  
  onStudentFormCourseChange(): void {
    // Get course name and set it in classCourse field
    if (this.studentForm.courseId) {
      const courseId = typeof this.studentForm.courseId === 'string' ? parseInt(this.studentForm.courseId) : this.studentForm.courseId;
      const selectedCourse = this.courses.find((c: Course) => c.id === courseId);
      if (selectedCourse) {
        this.studentForm.classCourse = selectedCourse.name;
      }
    } else {
      this.studentForm.classCourse = '';
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
    this.actionModalCourseId = null;
    this.actionModalClassId = null;
    this.actionModalSectionId = null;
    this.actionModalClasses = [];
    this.actionModalSections = [];
    
    // Always load courses to ensure they're available
    console.log('approveStudentAdmission: Loading courses, current courses count:', this.courses.length);
    this.loadCourses();
    
    // Wait a bit for courses to load before showing modal
    setTimeout(() => {
      console.log('approveStudentAdmission: Courses loaded, count:', this.courses.length);
      this.showActionModal = true;
    }, 300);
  }

  onSectionChange(): void {
    if (this.classSection && this.entity?.id) {
      // Call API to get next roll number for this section
      this.studentService.getNextRollNumber(parseInt(this.entity.id), this.classSection).subscribe({
        next: (result: { ok: boolean; rollNumber?: string; message?: string }) => {
          if (result.ok && result.rollNumber) {
            this.rollNumber = result.rollNumber;
          }
        },
        error: () => {
          // If API fails, keep empty or use default
        }
      });
    }
  }

  onActionModalCourseChange(): void {
    this.actionModalClassId = null;
    this.actionModalSectionId = null;
    this.actionModalClasses = [];
    this.actionModalSections = [];
    this.rollNumber = '';
    
    if (this.actionModalCourseId) {
      const courseId = typeof this.actionModalCourseId === 'string' ? parseInt(this.actionModalCourseId) : this.actionModalCourseId;
      console.log('onActionModalCourseChange: Loading classes for courseId:', courseId);
      this.subjectService.getClassesByCourse(courseId).subscribe({
        next: (result) => {
          console.log('onActionModalCourseChange: Classes response:', result);
          if (result.ok && result.data) {
            this.actionModalClasses = result.data;
            console.log('onActionModalCourseChange: Classes loaded:', this.actionModalClasses.length);
          } else {
            console.warn('onActionModalCourseChange: No classes found or API error');
            this.actionModalClasses = [];
          }
        },
        error: (err) => {
          console.error('onActionModalCourseChange: Error loading classes:', err);
          this.actionModalClasses = [];
        }
      });
    }
  }

  onActionModalClassIdChange(classIdValue: any): void {
    this.actionModalClassId = classIdValue;
    this.actionModalSectionId = null;
    this.actionModalSections = [];
    this.rollNumber = '';
    
    if (this.actionModalClassId) {
      const classId = typeof this.actionModalClassId === 'string' ? parseInt(this.actionModalClassId) : this.actionModalClassId;
      console.log('onActionModalClassIdChange: Loading sections for classId:', classId, 'type:', typeof classId);
      this.subjectService.getSectionsByClass(classId).subscribe({
        next: (result) => {
          console.log('onActionModalClassIdChange: API response:', result);
          console.log('onActionModalClassIdChange: result.ok =', result.ok);
          console.log('onActionModalClassIdChange: result.data =', result.data);
          if (result.ok && result.data) {
            this.actionModalSections = result.data;
            console.log('onActionModalClassIdChange: Sections loaded:', this.actionModalSections.length, 'sections');
            console.log('onActionModalClassIdChange: Sections array:', this.actionModalSections);
            console.log('onActionModalClassIdChange: Section IDs:', this.actionModalSections.map(s => ({ id: s.id, name: s.name })));
            // Load student counts for sections in action modal
            result.data.forEach((section: Section) => {
              if (section.id) {
                this.studentService.getStudentsBySection(section.id).subscribe({
                  next: (countResult) => {
                    if (countResult.ok && countResult.count !== undefined) {
                      this.sectionStudentCounts.set(section.id!, countResult.count);
                    }
                  },
                  error: () => {
                    // Ignore errors
                  }
                });
              }
            });
          } else {
            console.warn('onActionModalClassIdChange: No sections found or API error:', result);
            this.actionModalSections = [];
          }
        },
        error: (err) => {
          console.error('onActionModalClassIdChange: Error loading sections:', err);
          this.actionModalSections = [];
        }
      });
    } else {
      console.log('onActionModalClassIdChange: No classId selected');
      this.actionModalSections = [];
    }
  }

  onActionModalClassChange(): void {
    // Legacy method - redirect to new method
    this.onActionModalClassIdChange(this.actionModalClassId);
  }

  onActionModalSectionChange(): void {
    console.log('onActionModalSectionChange: Called with sectionId:', this.actionModalSectionId);
    this.rollNumber = '';
    
    if (!this.actionModalSectionId) {
      console.log('onActionModalSectionChange: No section selected');
      return;
    }
    
    if (!this.actionModalCourseId) {
      console.log('onActionModalSectionChange: No course selected');
      return;
    }
    
    if (!this.entity?.id) {
      console.log('onActionModalSectionChange: Entity not loaded');
      return;
    }
    
    // Find course - handle both string and number ID comparison
    const courseId = typeof this.actionModalCourseId === 'string' ? parseInt(this.actionModalCourseId) : this.actionModalCourseId;
    const course = this.courses.find(c => {
      const cId = typeof c.id === 'string' ? parseInt(c.id) : c.id;
      return cId === courseId;
    });
    
    if (!course) {
      console.error('onActionModalSectionChange: Course not found in courses array', {
        actionModalCourseId: this.actionModalCourseId,
        courseId: courseId,
        coursesArray: this.courses,
        coursesCount: this.courses.length,
        courseIds: this.courses.map(c => ({ id: c.id, name: c.name }))
      });
      
      // Try to load courses if array is empty
      if (this.courses.length === 0) {
        console.log('onActionModalSectionChange: Courses array is empty, loading courses...');
        this.loadCourses();
        // Wait a bit and retry
        setTimeout(() => {
          const retryCourse = this.courses.find(c => {
            const cId = typeof c.id === 'string' ? parseInt(c.id) : c.id;
            return cId === courseId;
          });
          if (retryCourse) {
            console.log('onActionModalSectionChange: Course found after reload, retrying roll number generation');
            this.onActionModalSectionChange();
          }
        }, 500);
      }
      return;
    }
    
    console.log('onActionModalSectionChange: Course found:', course.name, 'ID:', course.id);
    
    const sectionId = typeof this.actionModalSectionId === 'string' ? parseInt(this.actionModalSectionId) : this.actionModalSectionId;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    const courseName = course.name.toUpperCase().replace(/\s+/g, '');
    const currentYear = new Date().getFullYear();
    
    console.log('onActionModalSectionChange: Generating roll number with:', {
      entityId,
      sectionId,
      courseName,
      year: currentYear
    });
    
    // Generate roll number
    console.log('onActionModalSectionChange: Calling API with:', {
      url: `http://localhost:8080/api/students/generate-roll-number/${entityId}/${sectionId}/${courseName}/${currentYear}`,
      entityId,
      sectionId,
      courseName,
      currentYear
    });
    
    this.studentService.generateRollNumber(entityId, sectionId, courseName, currentYear).subscribe({
      next: (result: any) => {
        console.log('onActionModalSectionChange: Backend response (full):', JSON.stringify(result, null, 2));
        console.log('onActionModalSectionChange: result.ok =', result.ok);
        console.log('onActionModalSectionChange: result.rollNumber =', result.rollNumber);
        
        if (result && result.ok === true && result.rollNumber) {
          this.rollNumber = result.rollNumber;
          console.log('onActionModalSectionChange: Roll number generated successfully:', this.rollNumber);
        } else {
          // Check if it's a capacity error
          if (result && result.message && result.message.includes('full')) {
            alert('⚠️ ' + result.message + '\n\nCurrent: ' + (result.currentCount || 0) + ' students\nCapacity: ' + (result.capacity || 0) + ' students');
            this.rollNumber = '';
            this.actionModalSectionId = null; // Clear section selection
          } else {
            // Fallback: generate locally based on section
            const fallbackRoll = `STUD${currentYear}${courseName}01`;
            this.rollNumber = fallbackRoll;
            console.warn('onActionModalSectionChange: Backend did not return roll number. Using fallback:', fallbackRoll);
            console.warn('onActionModalSectionChange: Response was:', result);
          }
        }
      },
      error: (err) => {
        console.error('onActionModalSectionChange: API Error Details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error,
          url: err.url
        });
        // Check if it's a capacity error
        if (err.error && err.error.message && err.error.message.includes('full')) {
          alert('⚠️ ' + err.error.message + '\n\nCurrent: ' + (err.error.currentCount || 0) + ' students\nCapacity: ' + (err.error.capacity || 0) + ' students');
          this.rollNumber = '';
          this.actionModalSectionId = null; // Clear section selection
        } else {
          // Fallback: generate locally
          const fallbackRoll = `STUD${currentYear}${courseName}01`;
          this.rollNumber = fallbackRoll;
          console.error('onActionModalSectionChange: Error generating roll number. Using fallback:', fallbackRoll);
          
          // Show error message to user
          this.showSnackbarMessage('Failed to generate roll number from server. Using default format.', 'error');
        }
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

  confirmAdmissionAction(): void {
    if (!this.currentAdmissionId) return;

    const statusMap: any = {
      'approve': 'approved',
      'reject': 'rejected',
      'correction': 'correction_required'
    };
    const status = statusMap[this.currentAction];

    if (this.admissionMainTab === 'student') {
      // For approval, validate required fields
      if (this.currentAction === 'approve') {
        if (!this.actionModalCourseId || !this.actionModalClassId || !this.actionModalSectionId || !this.rollNumber) {
          this.showSnackbarMessage('Please select Course, Class, Section and ensure Roll Number is generated', 'error');
          return;
        }
      }
      // Student Admission
      // Get section name from dropdown
      const sectionName = this.actionModalSections.find(s => s.id === this.actionModalSectionId)?.name || this.classSection;
      
      this.admissionService.updateStudentAdmissionStatus(
        this.currentAdmissionId,
        status,
        this.actionRemark,
        this.rollNumber,
        sectionName,
        this.actionModalCourseId,
        this.actionModalClassId,
        this.actionModalSectionId
      ).subscribe(result => {
        if (result.ok) {
          this.showSnackbarMessage('Status updated successfully!', 'success');
          this.closeActionModal();
          // Switch to the appropriate tab based on action
          if (this.currentAction === 'approve') {
            // Immediately switch to approved tab
            this.studentSubTab = 'approved';
            // Wait a bit for backend to process, then reload the approved list
            setTimeout(() => {
              this.loadStudentAdmissions('approved');
            }, 300);
            // Also refresh the Students section to show the newly approved student
            setTimeout(() => {
              this.loadStudents('all');
            }, 800);
          } else if (this.currentAction === 'reject') {
            this.studentSubTab = 'rejected';
            this.loadStudentAdmissions('rejected');
          } else {
            // For correction_required, stay on pending tab
            this.loadStudentAdmissions(this.studentSubTab);
          }
        } else {
          this.showSnackbarMessage(result.message || 'Failed to update status', 'error');
        }
      });
    } else {
      // Teacher Admission
      this.admissionService.updateTeacherAdmissionStatus(
        this.currentAdmissionId,
        status,
        this.actionRemark
      ).subscribe(result => {
        if (result.ok) {
          this.showSnackbarMessage('Status updated successfully!', 'success');
          this.closeActionModal();
          // Switch to the appropriate tab based on action
          if (this.currentAction === 'approve') {
            // Immediately switch to approved tab
            this.teacherSubTab = 'approved';
            // Wait a bit for backend to process, then reload the approved list
            setTimeout(() => {
              this.loadTeacherAdmissions('approved');
            }, 300);
            // Also refresh the Teachers section to show the newly approved teacher
            setTimeout(() => {
              this.loadTeachers('all');
            }, 800);
          } else if (this.currentAction === 'reject') {
            this.teacherSubTab = 'rejected';
            this.loadTeacherAdmissions('rejected');
          } else {
            // For other actions, stay on current tab
            this.loadTeacherAdmissions(this.teacherSubTab);
          }
        } else {
          this.showSnackbarMessage(result.message || 'Failed to update status', 'error');
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
    this.actionModalCourseId = null;
    this.actionModalClassId = null;
    this.actionModalSectionId = null;
    this.actionModalClasses = [];
    this.actionModalSections = [];
  }

  formatAdmissionDate(date: string | undefined): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  }

  // Students methods
  loadStudents(filter: 'all' | 'active' | 'inactive' | 'pass-out'): void {
    this.studentFilter = filter;
    this.isLoadingStudents = true;
    
    if (!this.entity?.id) {
      this.isLoadingStudents = false;
      console.log('Entity not loaded, cannot load students');
      return;
    }

    const entityId = parseInt(this.entity.id);
    console.log('Loading students for entity:', entityId, 'filter:', filter);

    if (filter === 'all') {
      // Load all approved students
      this.studentService.getStudentsByEntity(entityId).subscribe({
        next: (result) => {
          this.isLoadingStudents = false;
          console.log('Students API response:', result);
          if (result.ok && result.students) {
            this.students = result.students;
            this.studentAdmissions = [];
            console.log('Loaded students:', this.students.length);
          } else {
            console.log('No students or error:', result.message);
            this.students = [];
            this.studentAdmissions = [];
          }
        },
        error: (err) => {
          this.isLoadingStudents = false;
          console.error('Error loading students:', err);
          this.students = [];
          this.studentAdmissions = [];
        }
      });
    } else {
      // Load students by status (active, inactive, pass-out)
      this.studentService.getStudentsByStatus(entityId, filter).subscribe({
        next: (result) => {
          this.isLoadingStudents = false;
          if (result.ok && result.students) {
            this.students = result.students;
            this.studentAdmissions = [];
          } else {
            this.students = [];
            this.studentAdmissions = [];
          }
        },
        error: (err) => {
          this.isLoadingStudents = false;
          console.error('Error loading students by status:', err);
          this.students = [];
          this.studentAdmissions = [];
        }
      });
    }
  }

  viewStudent(student: Student): void {
    this.selectedStudent = student;
    this.isEditingStudent = false;
    this.showStudentModal = true;
    this.selectedStudentAdmissionForView = null;
    
    // Load courses for dropdown
    this.loadStudentViewCourses();
    
    // Pre-select course if courseId exists
    if (student.courseId) {
      this.studentViewCourseId = student.courseId;
    } else {
      this.studentViewCourseId = null;
    }
    
    // Fetch admission data to show documents
    if (student.email && this.entity?.id) {
      const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
      this.admissionService.getStudentAdmissionsByStatus(entityId, 'approved').subscribe(result => {
        if (result.ok && result.admissions) {
          const admission = result.admissions.find(a => a.email === student.email);
          if (admission) {
            this.selectedStudentAdmissionForView = admission;
          }
        }
      });
    }
  }
  
  loadStudentViewCourses(): void {
    if (!this.entity?.id) {
      console.log('loadStudentViewCourses: Entity ID not available');
      return;
    }
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    this.subjectService.getCoursesByEntity(entityId).subscribe({
      next: (result) => {
        if (result.ok) {
          if (result.data && Array.isArray(result.data)) {
            this.studentViewCourses = result.data.filter((c: Course) => c.status !== 'inactive');
          } else if (Array.isArray(result)) {
            this.studentViewCourses = result.filter((c: Course) => c.status !== 'inactive');
          } else {
            this.studentViewCourses = [];
          }
        } else {
          this.studentViewCourses = [];
        }
      },
      error: (err) => {
        console.error('Error loading student view courses:', err);
        this.studentViewCourses = [];
      }
    });
  }
  
  onStudentViewCourseChange(): void {
    if (this.studentViewCourseId && this.selectedStudent) {
      const courseId = typeof this.studentViewCourseId === 'string' ? parseInt(this.studentViewCourseId) : this.studentViewCourseId;
      const selectedCourse = this.studentViewCourses.find((c: Course) => c.id === courseId);
      if (selectedCourse) {
        // Update the student's course name
        this.selectedStudent.classCourse = selectedCourse.name;
        // Update courseId in the model
        if (this.selectedStudent.courseId !== courseId) {
          this.selectedStudent.courseId = courseId;
        }
      }
    }
  }

  editStudent(student: Student): void {
    this.selectedStudent = student;
    this.isEditingStudent = true;
    this.studentEditForm = {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      gender: student.gender,
      address: student.address,
      bio: student.bio,
      rollNumber: student.rollNumber,
      classCourse: student.classCourse,
      classSection: student.classSection,
      academicYear: student.academicYear,
      studentStatus: student.studentStatus
    };
    this.showStudentModal = true;
  }

  changeStudentStatus(student: Student): void {
    const currentStatus = student.studentStatus || 'active';
    const statuses: ('active' | 'inactive' | 'pass-out')[] = ['active', 'inactive', 'pass-out'];
    const currentIndex = statuses.indexOf(currentStatus as any);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];

    if (student.id) {
      this.studentService.updateStudentStatus(student.id, newStatus).subscribe(result => {
        if (result.ok) {
          alert(`Student status updated to ${newStatus}`);
          this.loadStudents(this.studentFilter);
        } else {
          alert(result.message || 'Failed to update status');
        }
      });
    }
  }

  resetStudentPassword(student: Student): void {
    if (!confirm(`Reset password for ${student.firstName} ${student.lastName}?`)) {
      return;
    }

    if (student.id) {
      this.studentService.resetStudentPassword(student.id).subscribe(result => {
        if (result.ok) {
          alert(`Password reset successfully! Temporary password: ${result.tempPassword}\n\nPlease share this with the student securely.`);
          this.loadStudents(this.studentFilter);
        } else {
          alert(result.message || 'Failed to reset password');
        }
      });
    }
  }

  saveStudentChanges(): void {
    if (!this.selectedStudent?.id) return;

    // Ensure all fields are included, even if empty
    const updateData: any = {
      ...this.studentEditForm
    };
    
    // Always include gender field, even if empty string
    if (this.studentEditForm.gender !== undefined) {
      updateData.gender = this.studentEditForm.gender;
    }
    
    console.log('Saving student data:', updateData);
    
    this.studentService.updateStudent(this.selectedStudent.id, updateData).subscribe(result => {
      if (result.ok) {
        this.showSnackbarMessage('Student updated successfully!', 'success');
        this.closeStudentModal();
        this.loadStudents(this.studentFilter);
      } else {
        this.showSnackbarMessage(result.message || 'Failed to update student', 'error');
      }
    });
  }

  closeStudentModal(): void {
    this.showStudentModal = false;
    this.selectedStudent = null;
    this.selectedStudentAdmissionForView = null;
    this.isEditingStudent = false;
    this.studentEditForm = {};
  }

  openAddStudentModal(): void {
    // This would open a modal to add new student (not from admissions)
    // For now, students should only come from admissions
    alert('New students should be added through the Admissions section.');
  }

  // Student Admission methods
  viewAdmission(admission: StudentAdmission): void {
    this.selectedAdmission = admission;
    this.showAdmissionModal = true;
    // Load courses for view mode dropdown
    this.loadViewCourses();
    // Pre-select course if courseId exists
    if (admission.courseId) {
      this.viewCourseId = admission.courseId;
    } else {
      this.viewCourseId = null;
    }
  }
  
  loadViewCourses(): void {
    if (!this.entity?.id) {
      console.log('loadViewCourses: Entity ID not available');
      return;
    }
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    this.subjectService.getCoursesByEntity(entityId).subscribe({
      next: (result) => {
        if (result.ok) {
          if (result.data && Array.isArray(result.data)) {
            this.viewCourses = result.data.filter((c: Course) => c.status !== 'inactive');
          } else if (Array.isArray(result)) {
            this.viewCourses = result.filter((c: Course) => c.status !== 'inactive');
          } else {
            this.viewCourses = [];
          }
        } else {
          this.viewCourses = [];
        }
      },
      error: (err) => {
        console.error('Error loading view courses:', err);
        this.viewCourses = [];
      }
    });
  }
  
  onViewCourseChange(): void {
    if (this.viewCourseId && this.selectedAdmission) {
      const courseId = typeof this.viewCourseId === 'string' ? parseInt(this.viewCourseId) : this.viewCourseId;
      const selectedCourse = this.viewCourses.find((c: Course) => c.id === courseId);
      if (selectedCourse) {
        // Update the admission's course name
        this.selectedAdmission.classCourse = selectedCourse.name;
        // Optionally update courseId if it exists in the model
        if (this.selectedAdmission.courseId !== courseId) {
          this.selectedAdmission.courseId = courseId;
        }
      }
    }
  }

  approveAdmission(admission: StudentAdmission): void {
    this.selectedAdmission = admission;
    this.isApprovingAdmission = true;
    this.approvalRollNumber = '';
    this.approvalClassSection = '';
    this.approvalRemark = '';
    this.approvalCourseId = null;
    this.approvalClassId = null;
    this.approvalSectionId = null;
    this.approvalClasses = [];
    this.approvalSections = [];
    
    // Load courses for dropdown if not already loaded
    if (!this.courses || this.courses.length === 0) {
      this.loadCourses();
    }
  }

  onApprovalCourseChange(): void {
    this.approvalClassId = null;
    this.approvalSectionId = null;
    this.approvalClasses = [];
    this.approvalSections = [];
    this.approvalRollNumber = '';
    
    if (this.approvalCourseId) {
      const courseId = typeof this.approvalCourseId === 'string' ? parseInt(this.approvalCourseId) : this.approvalCourseId;
      this.subjectService.getClassesByCourse(courseId).subscribe({
        next: (result) => {
          if (result.ok && result.data) {
            this.approvalClasses = result.data;
          }
        }
      });
    }
  }

  onApprovalClassChange(): void {
    this.approvalSectionId = null;
    this.approvalSections = [];
    this.approvalRollNumber = '';
    
    if (this.approvalClassId) {
      const classId = typeof this.approvalClassId === 'string' ? parseInt(this.approvalClassId) : this.approvalClassId;
      console.log('onApprovalClassChange: Loading sections for class ID:', classId);
      this.subjectService.getSectionsByClass(classId).subscribe({
        next: (result) => {
          console.log('onApprovalClassChange: Sections API response:', result);
          if (result.ok && result.data) {
            this.approvalSections = result.data;
            console.log('onApprovalClassChange: Sections loaded:', this.approvalSections.length, 'sections');
            console.log('onApprovalClassChange: Section names:', this.approvalSections.map(s => s.name).join(', '));
          } else {
            console.log('onApprovalClassChange: No sections found or API error');
            this.approvalSections = [];
          }
        },
        error: (err) => {
          console.error('onApprovalClassChange: Error loading sections:', err);
          this.approvalSections = [];
        }
      });
    }
  }

  onApprovalSectionChange(): void {
    this.approvalRollNumber = '';
    console.log('onApprovalSectionChange: Section selected:', this.approvalSectionId);
    if (this.approvalSectionId && this.approvalCourseId && this.entity?.id) {
      const selectedSection = this.approvalSections.find(s => s.id === this.approvalSectionId);
      console.log('onApprovalSectionChange: Selected section:', selectedSection?.name);
      this.generateApprovalRollNumber();
    } else {
      console.log('onApprovalSectionChange: Missing required fields', {
        sectionId: this.approvalSectionId,
        courseId: this.approvalCourseId,
        entityId: this.entity?.id
      });
    }
  }

  generateApprovalRollNumber(): void {
    if (!this.approvalSectionId || !this.approvalCourseId || !this.entity?.id) {
      console.log('generateApprovalRollNumber: Missing required fields');
      return;
    }
    
    const course = this.courses.find(c => c.id === this.approvalCourseId);
    if (!course) {
      console.log('generateApprovalRollNumber: Course not found');
      return;
    }
    
    const sectionId = typeof this.approvalSectionId === 'string' ? parseInt(this.approvalSectionId) : this.approvalSectionId;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    const courseName = course.name.toUpperCase().replace(/\s+/g, '');
    const selectedSection = this.approvalSections.find(s => s.id === sectionId);
    
    console.log('generateApprovalRollNumber: Generating roll number for:', {
      entityId,
      sectionId,
      sectionName: selectedSection?.name,
      courseName,
      year: this.currentYear
    });
    
    // Call backend to get next roll number in format: STUD + Year + CourseName + 01
    this.studentService.generateRollNumber(entityId, sectionId, courseName, this.currentYear).subscribe({
      next: (result: any) => {
        console.log('generateApprovalRollNumber: Backend response:', result);
        if (result.ok && result.rollNumber) {
          this.approvalRollNumber = result.rollNumber;
          console.log('generateApprovalRollNumber: Roll number generated:', this.approvalRollNumber);
        } else {
          // Fallback: generate locally
          this.approvalRollNumber = `STUD${this.currentYear}${courseName}01`;
          console.log('generateApprovalRollNumber: Using fallback roll number:', this.approvalRollNumber);
        }
      },
      error: (err) => {
        console.error('generateApprovalRollNumber: Error from backend:', err);
        // Fallback: generate locally
        this.approvalRollNumber = `STUD${this.currentYear}${courseName}01`;
        console.log('generateApprovalRollNumber: Using fallback roll number (error):', this.approvalRollNumber);
      }
    });
  }

  getSectionCapacity(sectionId: any): number {
    const section = this.approvalSections.find(s => s.id === sectionId);
    return section?.capacity || 0;
  }

  getApprovalSectionsNames(): string {
    if (!this.approvalSections || this.approvalSections.length === 0) {
      return '';
    }
    return this.approvalSections.map(s => s.name).join(', ');
  }

  getCourseNameForRoll(courseId: any): string {
    if (!courseId) return '';
    const course = this.courses.find(c => c.id === courseId);
    return course ? course.name.toUpperCase().replace(/\s+/g, '') : '';
  }

  submitAdmissionApproval(): void {
    if (!this.selectedAdmission?.id) return;

    if (!this.approvalCourseId || !this.approvalClassId || !this.approvalSectionId || !this.approvalRollNumber) {
      this.showSnackbarMessage('Please select Course, Class, Section and ensure Roll Number is generated', 'error');
      return;
    }

    const section = this.approvalSections.find(s => s.id === this.approvalSectionId);
    const sectionName = section?.name || '';

    this.admissionService.updateStudentAdmissionStatus(
      this.selectedAdmission.id,
      'approved',
      this.approvalRemark,
      this.approvalRollNumber,
      sectionName,
      this.approvalCourseId,
      this.approvalClassId,
      this.approvalSectionId
    ).subscribe(result => {
      if (result.ok) {
        this.showSnackbarMessage('Admission approved successfully! Student account created.', 'success');
        this.closeAdmissionModal();
        this.loadStudents('all');
        // Reload student admissions to update the list
        this.loadStudentAdmissions('approved');
      } else {
        this.showSnackbarMessage(result.message || 'Failed to approve admission', 'error');
      }
    });
  }

  closeAdmissionModal(): void {
    this.showAdmissionModal = false;
    this.isApprovingAdmission = false;
    this.selectedAdmission = null;
    this.approvalRollNumber = '';
    this.approvalClassSection = '';
    this.approvalRemark = '';
    this.approvalCourseId = null;
    this.approvalClassId = null;
    this.approvalSectionId = null;
    this.approvalClasses = [];
    this.approvalSections = [];
  }

  // Teacher methods
  loadTeachers(filter: 'all' | 'active' | 'inactive'): void {
    this.teacherFilter = filter;
    this.isLoadingTeachers = true;
    
    if (!this.entity?.id) {
      this.isLoadingTeachers = false;
      console.log('Entity not loaded, cannot load teachers');
      return;
    }

    const entityId = parseInt(this.entity.id);
    console.log('Loading teachers for entity:', entityId, 'filter:', filter);

    if (filter === 'all') {
      // Load all approved teachers
      this.teacherService.getTeachersByEntity(entityId).subscribe({
        next: (result) => {
          this.isLoadingTeachers = false;
          console.log('Teachers API response:', result);
          if (result.ok && result.teachers) {
            this.teachers = result.teachers;
            this.teacherAdmissions = [];
            console.log('Loaded teachers:', this.teachers.length);
          } else {
            console.log('No teachers or error:', result.message);
            this.teachers = [];
            this.teacherAdmissions = [];
          }
        },
        error: (err) => {
          this.isLoadingTeachers = false;
          console.error('Error loading teachers:', err);
          this.teachers = [];
          this.teacherAdmissions = [];
        }
      });
    } else {
      // Load teachers by status (active, inactive)
      this.teacherService.getTeachersByStatus(entityId, filter).subscribe({
        next: (result) => {
          this.isLoadingTeachers = false;
          if (result.ok && result.teachers) {
            this.teachers = result.teachers;
            this.teacherAdmissions = [];
          } else {
            this.teachers = [];
            this.teacherAdmissions = [];
          }
        },
        error: (err) => {
          this.isLoadingTeachers = false;
          console.error('Error loading teachers by status:', err);
          this.teachers = [];
          this.teacherAdmissions = [];
        }
      });
    }
  }

  openTeacherDetailsModal(teacher: Teacher): void {
    this.viewTeacher(teacher);
  }

  viewTeacher(teacher: Teacher): void {
    this.selectedTeacher = teacher;
    this.showTeacherModal = true;
    this.isEditingTeacher = false;
    this.selectedTeacherAdmissionForView = null;
    
    // Fetch admission data to show documents
    if (teacher.email && this.entity?.id) {
      const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
      this.admissionService.getTeacherAdmissionsByStatus(entityId, 'approved').subscribe(result => {
        if (result.ok && result.admissions) {
          const admission = result.admissions.find(a => a.email === teacher.email);
          if (admission) {
            this.selectedTeacherAdmissionForView = admission;
          }
        }
      });
    }
  }

  openEditTeacherModal(teacher: Teacher): void {
    this.selectedTeacher = teacher;
    this.isEditingTeacher = true;
    this.teacherEditForm = {
      employeeId: teacher.employeeId,
      qualification: teacher.qualification,
      specialization: teacher.specialization,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      phone: teacher.phone,
      address: teacher.address,
      gender: teacher.gender,
      bio: teacher.bio
    };
    this.showTeacherModal = true;
  }

  changeTeacherStatus(teacher: Teacher): void {
    if (!teacher.id) return;
    
    const currentStatus = teacher.status || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    if (confirm(`Change status of ${teacher.firstName} ${teacher.lastName} to ${newStatus}?`)) {
      this.teacherService.updateTeacherStatus(teacher.id, newStatus).subscribe(result => {
        if (result.ok) {
          alert(`Teacher status updated to ${newStatus}`);
          this.loadTeachers(this.teacherFilter);
        } else {
          alert(result.message || 'Failed to update status');
        }
      });
    }
  }

  resetTeacherPassword(teacher: Teacher): void {
    if (!confirm(`Reset password for ${teacher.firstName} ${teacher.lastName}?`)) {
      return;
    }

    if (teacher.id) {
      this.teacherService.resetTeacherPassword(teacher.id).subscribe(result => {
        if (result.ok) {
          alert(result.message || 'Password reset successfully');
          this.loadTeachers(this.teacherFilter);
        } else {
          alert(result.message || 'Failed to reset password');
        }
      });
    }
  }

  deleteStudent(student: Student): void {
    this.confirmMessage = `Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone.`;
    this.confirmCallback = () => {
      if (student.id) {
        this.studentService.deleteStudent(student.id).subscribe(result => {
          if (result.ok) {
            this.showSnackbarMessage('Student deleted successfully', 'success');
            this.loadStudents(this.studentFilter);
          } else {
            this.showSnackbarMessage(result.message || 'Failed to delete student', 'error');
          }
        });
      }
    };
    this.showConfirmDialog = true;
  }

  toggleStudentActiveStatus(student: Student): void {
    if (!student.id) return;

    const actionText = student.isActive ? 'Deactivate' : 'Activate';
    const message = student.isActive 
      ? `Deactivate ${student.firstName} ${student.lastName}? They will not be able to login.`
      : `Activate ${student.firstName} ${student.lastName}? They will be able to login.`;
    
    this.confirmMessage = message;
    this.confirmCallback = () => {
      if (!student.id) return;
      if (student.isActive) {
        this.studentService.deactivateStudent(student.id).subscribe(result => {
          if (result.ok) {
            this.showSnackbarMessage('Student deactivated successfully', 'success');
            this.loadStudents(this.studentFilter);
          } else {
            this.showSnackbarMessage(result.message || 'Failed to deactivate student', 'error');
          }
        });
      } else {
        this.studentService.activateStudent(student.id).subscribe(result => {
          if (result.ok) {
            this.showSnackbarMessage('Student activated successfully', 'success');
            this.loadStudents(this.studentFilter);
          } else {
            this.showSnackbarMessage(result.message || 'Failed to activate student', 'error');
          }
        });
      }
    };
    this.showConfirmDialog = true;
  }

  deleteTeacher(teacher: Teacher): void {
    this.confirmMessage = `Are you sure you want to delete ${teacher.firstName} ${teacher.lastName}? This action cannot be undone.`;
    this.confirmCallback = () => {
      if (teacher.id) {
        this.teacherService.deleteTeacher(teacher.id).subscribe(result => {
          if (result.ok) {
            this.showSnackbarMessage('Teacher deleted successfully', 'success');
            this.loadTeachers(this.teacherFilter);
          } else {
            this.showSnackbarMessage(result.message || 'Failed to delete teacher', 'error');
          }
        });
      }
    };
    this.showConfirmDialog = true;
  }

  deleteStudentAdmission(id: number): void {
    this.confirmMessage = 'Are you sure you want to delete this admission? This action cannot be undone.';
    this.confirmCallback = () => {
      this.admissionService.deleteStudentAdmission(id).subscribe(result => {
        if (result.ok) {
          this.showSnackbarMessage('Admission deleted successfully', 'success');
          // Reload the current admission list
          if (this.studentSubTab === 'approved') {
            this.loadStudentAdmissions('approved');
          } else if (this.studentSubTab === 'rejected') {
            this.loadStudentAdmissions('rejected');
          } else {
            this.loadStudentAdmissions('submitted');
          }
        } else {
          this.showSnackbarMessage(result.message || 'Failed to delete admission', 'error');
        }
      });
    };
    this.showConfirmDialog = true;
  }

  deleteTeacherAdmission(id: number): void {
    this.confirmMessage = 'Are you sure you want to delete this admission? This action cannot be undone.';
    this.confirmCallback = () => {
      this.admissionService.deleteTeacherAdmission(id).subscribe(result => {
        if (result.ok) {
          this.showSnackbarMessage('Admission deleted successfully', 'success');
          // Reload the current admission list
          if (this.teacherSubTab === 'approved') {
            this.loadTeacherAdmissions('approved');
          } else if (this.teacherSubTab === 'rejected') {
            this.loadTeacherAdmissions('rejected');
          } else {
            this.loadTeacherAdmissions('submitted');
          }
        } else {
          this.showSnackbarMessage(result.message || 'Failed to delete admission', 'error');
        }
      });
    };
    this.showConfirmDialog = true;
  }

  toggleTeacherActiveStatus(teacher: Teacher): void {
    if (!teacher.id) return;

    const message = teacher.isActive 
      ? `Deactivate ${teacher.firstName} ${teacher.lastName}? They will not be able to login.`
      : `Activate ${teacher.firstName} ${teacher.lastName}? They will be able to login.`;
    
    this.confirmMessage = message;
    this.confirmCallback = () => {
      if (!teacher.id) return;
      if (teacher.isActive) {
        this.teacherService.deactivateTeacher(teacher.id).subscribe(result => {
          if (result.ok) {
            this.showSnackbarMessage('Teacher deactivated successfully', 'success');
            this.loadTeachers(this.teacherFilter);
          } else {
            this.showSnackbarMessage(result.message || 'Failed to deactivate teacher', 'error');
          }
        });
      } else {
        this.teacherService.activateTeacher(teacher.id).subscribe(result => {
          if (result.ok) {
            this.showSnackbarMessage('Teacher activated successfully', 'success');
            this.loadTeachers(this.teacherFilter);
          } else {
            this.showSnackbarMessage(result.message || 'Failed to activate teacher', 'error');
          }
        });
      }
    };
    this.showConfirmDialog = true;
  }

  saveTeacherChanges(): void {
    if (!this.selectedTeacher?.id) return;

    // Ensure all fields are included, even if empty
    const updateData: any = {
      ...this.teacherEditForm
    };
    
    // Always include gender field, even if empty string
    if (this.teacherEditForm.gender !== undefined) {
      updateData.gender = this.teacherEditForm.gender;
    }
    
    console.log('Saving teacher data:', updateData);
    
    this.teacherService.updateTeacher(this.selectedTeacher.id, updateData).subscribe(result => {
      if (result.ok) {
        this.showSnackbarMessage('Teacher updated successfully!', 'success');
        this.closeTeacherModal();
        this.loadTeachers(this.teacherFilter);
      } else {
        this.showSnackbarMessage(result.message || 'Failed to update teacher', 'error');
      }
    });
  }

  closeTeacherModal(): void {
    this.showTeacherModal = false;
    this.selectedTeacher = null;
    this.selectedTeacherAdmissionForView = null;
    this.isEditingTeacher = false;
    this.teacherEditForm = {};
  }

  // Teacher Admission methods
  viewTeacherAdmission(admission: TeacherAdmission): void {
    this.selectedTeacherAdmission = admission;
    this.showTeacherAdmissionModal = true;
  }

  approveTeacherAdmissionFromList(admission: TeacherAdmission): void {
    this.selectedTeacherAdmission = admission;
    this.isApprovingTeacherAdmission = true;
    this.approvalSubjects = '';
    this.approvalAssignedClasses = '';
    this.approvalTeacherRemark = '';
  }

  submitTeacherAdmissionApproval(): void {
    if (!this.selectedTeacherAdmission?.id) return;

    this.admissionService.updateTeacherAdmissionStatus(
      this.selectedTeacherAdmission.id,
      'approved',
      this.approvalTeacherRemark,
      this.approvalSubjects,
      this.approvalAssignedClasses
    ).subscribe(result => {
      if (result.ok) {
        alert('Admission approved successfully! Teacher account created.');
        this.closeTeacherAdmissionModal();
        this.loadTeachers('all');
      } else {
        alert(result.message || 'Failed to approve admission');
      }
    });
  }

  closeTeacherAdmissionModal(): void {
    this.showTeacherAdmissionModal = false;
    this.isApprovingTeacherAdmission = false;
    this.selectedTeacherAdmission = null;
    this.approvalSubjects = '';
    this.approvalAssignedClasses = '';
    this.approvalTeacherRemark = '';
  }

  openSubjectAssignmentModal(teacher: Teacher): void {
    this.selectedTeacherForSubjects = teacher;
    this.teacherSubjectsInput = teacher.subjects || '';
    this.showTeacherSubjectModal = true;
  }

  closeSubjectModal(): void {
    this.showTeacherSubjectModal = false;
    this.selectedTeacherForSubjects = null;
    this.teacherSubjectsInput = '';
  }

  saveTeacherSubjects(): void {
    if (!this.selectedTeacherForSubjects?.id) return;
    if (!this.teacherSubjectsInput.trim()) {
      alert('Please enter at least one subject');
      return;
    }

    const entityId = typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : this.entity?.id;
    if (!entityId) {
      alert('Entity not loaded');
      return;
    }

    this.teacherService.updateTeacher(this.selectedTeacherForSubjects.id, {
      subjects: this.teacherSubjectsInput.trim()
    }).subscribe({
      next: (result) => {
        if (result.ok) {
          alert('Subjects assigned successfully!');
          this.closeSubjectModal();
          this.loadTeachers(this.teacherFilter);
        } else {
          alert(result.message || 'Failed to assign subjects');
        }
      },
      error: (err) => {
        console.error('Error assigning subjects:', err);
        alert('Failed to assign subjects. Please try again.');
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleEditMode(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editForm = { ...this.originalData };
    this.logoPreview = null;
  }

  saveChanges(): void {
    if (!this.editForm.name || !this.editForm.type || !this.editForm.address) {
      alert('Please fill all required fields');
      return;
    }

    if (this.entity) {
      this.isLoading = true;
      this.entityService.updateEntity(this.entity.id, {
        name: this.editForm.name,
        type: this.editForm.type,
        address: this.editForm.address,
        description: this.editForm.description,
        email: this.editForm.email,
        phone: this.editForm.phone,
        logoUrl: this.logoPreview || this.editForm.logoUrl,
        primaryColor: this.editForm.primaryColor
      }).subscribe({
        next: (result) => {
          this.isLoading = false;
          if (result.ok && result.entity) {
            this.entity = result.entity;
            this.originalData = { ...this.editForm };
            this.isEditing = false;
            this.logoPreview = null;
          } else if (!result.ok) {
            alert(result.message || 'Failed to update entity');
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          alert('Failed to update entity: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onLogoFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size cannot exceed 5MB.');
        return;
      }
      this.readAndPreviewFile(file);
    }
  }

  private readAndPreviewFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result as string;
      this.editForm.logoUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // Snackbar methods
  showSnackbarMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackbarMessage = message;
    this.snackbarType = type;
    this.showSnackbar = true;
    setTimeout(() => {
      this.showSnackbar = false;
    }, 3000);
  }

  closeConfirmDialog(): void {
    this.showConfirmDialog = false;
    this.confirmMessage = '';
    this.confirmCallback = null;
  }

  confirmAction(): void {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.closeConfirmDialog();
  }

  // My Subjects Section Methods
  loadCourses(): void {
    if (!this.entity?.id) {
      console.log('loadCourses: Entity ID not available', this.entity);
      return;
    }
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    console.log('loadCourses: Loading courses for entity ID:', entityId);
    this.isLoadingCourses = true;
    this.subjectService.getCoursesByEntity(entityId).subscribe({
      next: (result) => {
        this.isLoadingCourses = false;
        console.log('loadCourses: API response:', result);
        if (result.ok && result.data) {
          // Filter only active courses
          this.courses = result.data.filter((c: Course) => c.status !== 'inactive');
          console.log('loadCourses: Courses loaded:', this.courses.length, 'active courses');
        } else if (Array.isArray(result)) {
          // Handle case where API returns array directly
          this.courses = result.filter((c: Course) => c.status !== 'inactive');
        } else {
          console.log('loadCourses: No courses found or API error');
          this.courses = [];
        }
      },
      error: (err) => {
        console.error('loadCourses: Error loading courses:', err);
        this.isLoadingCourses = false;
        this.courses = [];
      }
    });
  }

  loadClassesForCourse(): void {
    if (!this.selectedCourseForClass) return;
    this.isLoadingClasses = true;
    this.subjectService.getClassesByCourse(this.selectedCourseForClass).subscribe({
      next: (result) => {
        this.isLoadingClasses = false;
        if (result.ok && result.data) {
          this.classes = result.data;
        }
      },
      error: () => {
        this.isLoadingClasses = false;
      }
    });
  }

  onCourseChangeForSubject(): void {
    // Clear class and sections when course changes
    this.selectedClassForSubject = null;
    this.subjects = [];
    this.sectionsForClass = [];
    this.classesForSubject = [];
    
    if (!this.selectedCourseForSubject) return;
    
    const courseId = typeof this.selectedCourseForSubject === 'string' ? parseInt(this.selectedCourseForSubject) : this.selectedCourseForSubject;
    this.subjectService.getClassesByCourse(courseId).subscribe({
      next: (result) => {
        if (result.ok && result.data) {
          this.classesForSubject = result.data;
        }
      }
    });
  }

  onSubjectCourseChange(): void {
    if (!this.subjectForm.courseId) {
      this.classesForSubject = [];
      this.subjectForm.classId = undefined;
      this.sectionsForSubjectClass = [];
      return;
    }
    const courseId = typeof this.subjectForm.courseId === 'string' ? parseInt(this.subjectForm.courseId) : this.subjectForm.courseId;
    this.subjectService.getClassesByCourse(courseId).subscribe({
      next: (result) => {
        if (result.ok && result.data) {
          this.classesForSubject = result.data;
          // If classId is already set and exists in the loaded classes, load sections for it
          if (this.subjectForm.classId) {
            const classId = typeof this.subjectForm.classId === 'string' ? parseInt(this.subjectForm.classId) : this.subjectForm.classId;
            const classExists = result.data.some((c: ClassEntity) => c.id === classId);
            if (classExists) {
              // Load sections for the selected class
              setTimeout(() => {
                this.onSubjectClassChange();
              }, 100);
            } else {
              // Class doesn't exist in this course, clear it
              this.subjectForm.classId = undefined;
              this.sectionsForSubjectClass = [];
            }
          }
        }
      }
    });
  }

  getCourseName(courseId: any): string {
    if (!courseId) return 'N/A';
    const course = this.courses.find(c => c.id === courseId);
    return course ? course.name : 'N/A';
  }

  onClassChangeForSubject(): void {
    this.loadSubjectsForClass();
    this.loadSectionsForClass();
  }

  loadSubjectsForClass(): void {
    if (!this.selectedClassForSubject) {
      this.subjects = [];
      return;
    }
    if (!this.selectedCourseForSubject) {
      this.subjects = [];
      return;
    }
    this.isLoadingSubjects = true;
    const classId = typeof this.selectedClassForSubject === 'string' ? parseInt(this.selectedClassForSubject) : this.selectedClassForSubject;
    const courseId = typeof this.selectedCourseForSubject === 'string' ? parseInt(this.selectedCourseForSubject) : this.selectedCourseForSubject;
    
    this.subjectService.getSubjectsByCourseAndClass(courseId, classId).subscribe({
      next: (result) => {
        this.isLoadingSubjects = false;
        if (result && result.ok && result.data) {
          this.subjects = Array.isArray(result.data) ? result.data : [];
        } else if (Array.isArray(result)) {
          // Handle case where API returns array directly
          this.subjects = result;
        } else {
          this.subjects = [];
        }
      },
      error: () => {
        this.isLoadingSubjects = false;
        this.subjects = [];
      }
    });
  }

  loadSectionsForClass(): void {
    if (!this.selectedClassForSubject) {
      this.sectionsForClass = [];
      return;
    }
    const classId = typeof this.selectedClassForSubject === 'string' ? parseInt(this.selectedClassForSubject) : this.selectedClassForSubject;
    this.subjectService.getSectionsByClass(classId).subscribe({
      next: (result) => {
        if (result.ok && result.data) {
          this.sectionsForClass = result.data;
        } else {
          this.sectionsForClass = [];
        }
      },
      error: () => {
        this.sectionsForClass = [];
      }
    });
  }

  loadAllSubjects(): void {
    if (!this.entity?.id) {
      console.log('loadAllSubjects: No entity ID');
      return;
    }
    this.isLoadingAllSubjects = true;
    console.log('loadAllSubjects: Loading subjects for entity:', this.entity.id);
    this.subjectService.getSubjectsByEntity(parseInt(this.entity.id)).subscribe({
      next: (result) => {
        this.isLoadingAllSubjects = false;
        console.log('loadAllSubjects: API response:', result);
        console.log('loadAllSubjects: result.ok =', result?.ok);
        console.log('loadAllSubjects: result.data =', result?.data);
        console.log('loadAllSubjects: result.data type =', typeof result?.data);
        console.log('loadAllSubjects: result.data isArray =', Array.isArray(result?.data));
        
        if (result && result.ok && result.data) {
          this.allSubjects = Array.isArray(result.data) ? result.data : [];
          console.log('loadAllSubjects: Subjects loaded successfully:', this.allSubjects.length);
        } else if (result && result.data && Array.isArray(result.data)) {
          // Handle case where ok might be missing but data exists
          this.allSubjects = result.data;
          console.log('loadAllSubjects: Subjects loaded (no ok field):', this.allSubjects.length);
        } else if (Array.isArray(result)) {
          // Handle case where API returns array directly
          this.allSubjects = result;
          console.log('loadAllSubjects: Subjects loaded (direct array):', this.allSubjects.length);
        } else {
          console.log('loadAllSubjects: No subjects found or unexpected format');
          this.allSubjects = [];
        }
        console.log('loadAllSubjects: Final allSubjects array:', this.allSubjects);
      },
      error: (err) => {
        this.isLoadingAllSubjects = false;
        console.error('loadAllSubjects: Error loading subjects:', err);
        this.allSubjects = [];
      }
    });
  }

  getClassName(classId: any): string {
    if (!classId) return 'N/A';
    const classItem = this.classes.find(c => c.id === classId);
    return classItem ? classItem.name : 'N/A';
  }

  loadTeachersForSubject(): void {
    if (!this.selectedSubjectForAssignment) {
      this.sectionsForAssignment = [];
      this.selectedSectionForAssignment = null;
      return;
    }
    
    this.isLoadingTeacherAssignments = true;
    // Clear previous section selection
    this.selectedSectionForAssignment = null;
    
    // Find the selected subject to get its classId
    const subjectId = typeof this.selectedSubjectForAssignment === 'string' ? parseInt(this.selectedSubjectForAssignment) : this.selectedSubjectForAssignment;
    const subject = this.allSubjects.find(s => s.id === subjectId);
    
    if (subject && subject.classId) {
      // Directly load sections for this subject's class
      const classId = typeof subject.classId === 'string' ? parseInt(subject.classId) : subject.classId;
      this.subjectService.getSectionsByClass(classId).subscribe({
        next: (sectionResult) => {
          if (sectionResult.ok && sectionResult.data) {
            this.sectionsForAssignment = sectionResult.data;
            console.log('Loaded sections for assignment:', this.sectionsForAssignment);
          } else {
            this.sectionsForAssignment = [];
          }
        },
        error: (err) => {
          console.error('Error loading sections:', err);
          this.sectionsForAssignment = [];
        }
      });
    } else {
      this.sectionsForAssignment = [];
    }
    
    // Load existing teacher assignments for this subject
    this.subjectService.getMappingsBySubject(subjectId).subscribe({
      next: (result) => {
        this.isLoadingTeacherAssignments = false;
        if (result.ok && result.data) {
          this.teacherAssignments = result.data;
        } else {
          this.teacherAssignments = [];
        }
      },
      error: (err) => {
        console.error('Error loading teacher assignments:', err);
        this.isLoadingTeacherAssignments = false;
        this.teacherAssignments = [];
      }
    });
  }

  onSectionForAssignmentChange(): void {
    // This will trigger the filtered getters to update
    // No additional action needed as getters are reactive
  }

  get filteredTeacherAssignments(): SubjectTeacherMapping[] {
    if (!this.selectedSubjectForAssignment) {
      return [];
    }
    
    const subjectId = typeof this.selectedSubjectForAssignment === 'string' 
      ? parseInt(this.selectedSubjectForAssignment) 
      : this.selectedSubjectForAssignment;
    
    // Filter by subject
    let filtered = this.teacherAssignments.filter(a => a.subjectId === subjectId);
    
    // If a section is selected, filter by section
    if (this.selectedSectionForAssignment) {
      const sectionId = typeof this.selectedSectionForAssignment === 'string' 
        ? parseInt(this.selectedSectionForAssignment) 
        : this.selectedSectionForAssignment;
      filtered = filtered.filter(a => a.sectionId === sectionId);
    }
    
    return filtered;
  }

  get filteredTeachersForAssignment(): any[] {
    if (!this.selectedSubjectForAssignment) {
      return this.teachers;
    }
    
    const subjectId = typeof this.selectedSubjectForAssignment === 'string' 
      ? parseInt(this.selectedSubjectForAssignment) 
      : this.selectedSubjectForAssignment;
    
    const sectionId = this.selectedSectionForAssignment 
      ? (typeof this.selectedSectionForAssignment === 'string' 
          ? parseInt(this.selectedSectionForAssignment) 
          : this.selectedSectionForAssignment)
      : null;
    
    // Get already assigned teacher IDs for this subject and section
    const assignedTeacherIds = this.teacherAssignments
      .filter(a => {
        if (a.subjectId !== subjectId) return false;
        if (sectionId !== null) {
          // If section is selected, only exclude teachers assigned to this specific section
          return a.sectionId === sectionId;
        } else {
          // If "All Sections" is selected, exclude teachers assigned to any section for this subject
          return a.sectionId !== null;
        }
      })
      .map(a => a.teacherId);
    
    // Filter out already assigned teachers
    return this.teachers.filter(teacher => teacher.id && !assignedTeacherIds.includes(teacher.id));
  }

  openCourseModal(): void {
    this.courseForm = { entityId: this.entity ? parseInt(this.entity.id) : undefined, status: 'active' };
    this.isEditingCourse = false;
    this.showCourseModal = true;
  }

  editCourse(course: Course): void {
    this.courseForm = { ...course };
    this.isEditingCourse = true;
    this.showCourseModal = true;
  }

  saveCourse(): void {
    if (!this.courseForm.name || !this.courseForm.type) {
      this.showSnackbarMessage('Please fill all required fields', 'error');
      return;
    }
    if (!this.entity?.id) {
      this.showSnackbarMessage('Entity not loaded', 'error');
      return;
    }
    
    // Ensure entityId is a number
    const courseData: Course = {
      ...this.courseForm,
      entityId: typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id,
      status: this.courseForm.status || 'active'
    } as Course;
    
    if (this.isEditingCourse && this.courseForm.id) {
      this.subjectService.updateCourse(this.courseForm.id, courseData).subscribe({
        next: (result) => {
          if (result.ok) {
            this.showSnackbarMessage('Course updated successfully', 'success');
            this.showCourseModal = false;
            this.loadCourses();
          } else {
            this.showSnackbarMessage(result.message || 'Failed to update course', 'error');
          }
        },
        error: (err) => {
          console.error('Error updating course:', err);
          this.showSnackbarMessage('Failed to update course: ' + (err.error?.message || err.message), 'error');
        }
      });
    } else {
      this.subjectService.createCourse(courseData).subscribe({
        next: (result) => {
          if (result.ok) {
            this.showSnackbarMessage('Course created successfully', 'success');
            this.showCourseModal = false;
            this.loadCourses();
          } else {
            this.showSnackbarMessage(result.message || 'Failed to create course', 'error');
          }
        },
        error: (err) => {
          console.error('Error creating course:', err);
          this.showSnackbarMessage('Failed to create course: ' + (err.error?.message || err.message), 'error');
        }
      });
    }
  }

  deleteCourse(id: number): void {
    this.confirmMessage = 'Are you sure you want to delete this course? This will also delete all associated classes and subjects.';
    this.confirmCallback = () => {
      this.subjectService.deleteCourse(id).subscribe({
        next: (result) => {
          if (result.ok) {
            this.showSnackbarMessage('Course deleted successfully', 'success');
            this.loadCourses();
          } else {
            this.showSnackbarMessage(result.message || 'Failed to delete course', 'error');
          }
        }
      });
    };
    this.showConfirmDialog = true;
  }

  openClassModal(): void {
    // Allow opening modal even without course selection - user can select in modal
    if (this.courses.length === 0) {
      this.showSnackbarMessage('Please create a course first', 'error');
      return;
    }
    this.classForm = { 
      courseId: this.selectedCourseForClass ? (typeof this.selectedCourseForClass === 'string' ? parseInt(this.selectedCourseForClass) : this.selectedCourseForClass) : undefined, 
      status: 'active',
      type: 'CLASS'
    };
    this.isEditingClass = false;
    this.showClassModal = true;
  }

  editClass(classItem: ClassEntity): void {
    this.classForm = { ...classItem };
    this.isEditingClass = true;
    this.showClassModal = true;
  }

  saveClass(): void {
    if (!this.classForm.name || !this.classForm.type) {
      this.showSnackbarMessage('Please fill all required fields', 'error');
      return;
    }
    if (!this.classForm.courseId) {
      this.showSnackbarMessage('Please select a course', 'error');
      return;
    }
    // Convert courseId to number if it's a string
    if (typeof this.classForm.courseId === 'string') {
      this.classForm.courseId = parseInt(this.classForm.courseId);
    }
    // Ensure courseId is a number
    const classData: ClassEntity = {
      ...this.classForm,
      courseId: typeof this.classForm.courseId === 'string' ? parseInt(this.classForm.courseId) : this.classForm.courseId,
      status: this.classForm.status || 'active'
    } as ClassEntity;
    
    if (this.isEditingClass && this.classForm.id) {
      this.subjectService.updateClass(this.classForm.id, classData).subscribe({
        next: (result) => {
          if (result.ok) {
            this.showSnackbarMessage('Class updated successfully', 'success');
            this.showClassModal = false;
            this.loadClassesForCourse();
          } else {
            this.showSnackbarMessage(result.message || 'Failed to update class', 'error');
          }
        },
        error: (err) => {
          console.error('Error updating class:', err);
          this.showSnackbarMessage('Failed to update class: ' + (err.error?.message || err.message), 'error');
        }
      });
    } else {
      this.subjectService.createClass(classData).subscribe({
        next: (result) => {
          if (result.ok) {
            this.showSnackbarMessage('Class created successfully', 'success');
            this.showClassModal = false;
            this.loadClassesForCourse();
          } else {
            this.showSnackbarMessage(result.message || 'Failed to create class', 'error');
          }
        },
        error: (err) => {
          console.error('Error creating class:', err);
          this.showSnackbarMessage('Failed to create class: ' + (err.error?.message || err.message), 'error');
        }
      });
    }
  }

  deleteClass(id: number): void {
    this.confirmMessage = 'Are you sure you want to delete this class? This will also delete all associated subjects.';
    this.confirmCallback = () => {
      this.subjectService.deleteClass(id).subscribe({
        next: (result) => {
          if (result.ok) {
            this.showSnackbarMessage('Class deleted successfully', 'success');
            this.loadClassesForCourse();
          } else {
            this.showSnackbarMessage(result.message || 'Failed to delete class', 'error');
          }
        }
      });
    };
    this.showConfirmDialog = true;
  }

  manageSections(classItem: ClassEntity): void {
    this.selectedClassForSections = classItem;
    this.loadSections();
    this.showSectionModal = true;
  }

  loadSections(): void {
    if (!this.selectedClassForSections?.id) {
      this.sections = [];
      return;
    }
    const classId = typeof this.selectedClassForSections.id === 'string' ? parseInt(this.selectedClassForSections.id) : this.selectedClassForSections.id;
    this.subjectService.getSectionsByClass(classId).subscribe({
      next: (result) => {
        if (result.ok && result.data) {
          this.sections = result.data;
        } else {
          this.sections = [];
        }
      },
      error: (err) => {
        console.error('Error loading sections:', err);
        this.sections = [];
        this.showSnackbarMessage('Failed to load sections: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  openSubjectModal(): void {
    if (!this.entity?.id) {
      this.showSnackbarMessage('Entity not loaded', 'error');
      return;
    }
    if (this.courses.length === 0) {
      this.showSnackbarMessage('Please create a course first', 'error');
      return;
    }
    // Allow opening modal - user can select course and class in modal
    this.subjectForm = { 
      entityId: typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id,
      courseId: this.selectedCourseForSubject ? (typeof this.selectedCourseForSubject === 'string' ? parseInt(this.selectedCourseForSubject) : this.selectedCourseForSubject) : undefined,
      classId: this.selectedClassForSubject ? (typeof this.selectedClassForSubject === 'string' ? parseInt(this.selectedClassForSubject) : this.selectedClassForSubject) : undefined,
      status: 'active',
      subjectType: 'THEORY'
    };
    this.isEditingSubject = false;
    this.showSubjectModal = true;
    
    // Load classes if course is already selected
    if (this.subjectForm.courseId) {
      this.onSubjectCourseChange();
    } else if (this.subjectForm.classId) {
      // If no course but class is selected, load sections directly
      setTimeout(() => {
        this.onSubjectClassChange();
      }, 100);
    }
    
    // Load sections if class is already selected
    if (this.subjectForm.classId) {
      this.onSubjectClassChange();
    }
  }

  editSubject(subject: Subject): void {
    this.subjectForm = { ...subject };
    this.isEditingSubject = true;
    this.showSubjectModal = true;
  }

  saveSubject(): void {
    console.log('saveSubject called, form data:', this.subjectForm);
    
    if (!this.subjectForm.name || !this.subjectForm.subjectCode || !this.subjectForm.subjectType) {
      this.showSnackbarMessage('Please fill all required fields', 'error');
      return;
    }
    
    // Convert and validate IDs
    const entityId = typeof this.subjectForm.entityId === 'string' ? parseInt(this.subjectForm.entityId) : this.subjectForm.entityId;
    const courseId = typeof this.subjectForm.courseId === 'string' ? parseInt(this.subjectForm.courseId) : this.subjectForm.courseId;
    const classId = typeof this.subjectForm.classId === 'string' ? parseInt(this.subjectForm.classId) : this.subjectForm.classId;
    
    if (!entityId || !courseId || !classId) {
      this.showSnackbarMessage('Please select entity, course, and class', 'error');
      console.error('Missing IDs:', { entityId, courseId, classId });
      return;
    }
    
    // Ensure all IDs are numbers and format data properly
    const subjectData: any = {
      entityId: entityId,
      courseId: courseId,
      classId: classId,
      name: this.subjectForm.name.trim(),
      subjectCode: this.subjectForm.subjectCode.trim(),
      subjectType: this.subjectForm.subjectType,
      status: this.subjectForm.status || 'active'
    };
    
    // Add optional fields only if they have values
    if (this.subjectForm.maxMarks) {
      subjectData.maxMarks = typeof this.subjectForm.maxMarks === 'string' ? parseInt(this.subjectForm.maxMarks) : this.subjectForm.maxMarks;
    }
    if (this.subjectForm.credits) {
      // Convert credits to number (backend will convert to BigDecimal)
      const creditsValue = typeof this.subjectForm.credits === 'string' ? parseFloat(this.subjectForm.credits) : this.subjectForm.credits;
      if (!isNaN(creditsValue)) {
        subjectData.credits = creditsValue;
      }
    }
    
    console.log('Sending subject data:', subjectData);
    
    if (this.isEditingSubject && this.subjectForm.id) {
      this.subjectService.updateSubject(this.subjectForm.id, subjectData).subscribe({
        next: (result) => {
          if (result.ok) {
            this.showSnackbarMessage('Subject updated successfully', 'success');
            this.showSubjectModal = false;
            this.loadSubjectsForClass();
          } else {
            this.showSnackbarMessage(result.message || 'Failed to update subject', 'error');
          }
        },
        error: (err) => {
          console.error('Error updating subject:', err);
          this.showSnackbarMessage('Failed to update subject: ' + (err.error?.message || err.message), 'error');
        }
      });
    } else {
      this.subjectService.createSubject(subjectData).subscribe({
        next: (result) => {
          if (result.ok) {
            this.showSnackbarMessage('Subject created successfully', 'success');
            this.showSubjectModal = false;
            this.loadSubjectsForClass();
            this.loadAllSubjects();
          } else {
            this.showSnackbarMessage(result.message || 'Failed to create subject', 'error');
          }
        },
        error: (err) => {
          console.error('Error creating subject:', err);
          this.showSnackbarMessage('Failed to create subject: ' + (err.error?.message || err.message), 'error');
        }
      });
    }
  }

  deleteSubject(id: number): void {
    this.confirmMessage = 'Are you sure you want to delete this subject?';
    this.confirmCallback = () => {
      this.subjectService.deleteSubject(id).subscribe({
        next: (result) => {
          if (result.ok) {
            this.showSnackbarMessage('Subject deleted successfully', 'success');
            this.loadSubjectsForClass();
            this.loadAllSubjects();
          } else {
            this.showSnackbarMessage(result.message || 'Failed to delete subject', 'error');
          }
        }
      });
    };
    this.showConfirmDialog = true;
  }

  assignTeacherToSubject(): void {
    if (!this.selectedSubjectForAssignment || !this.selectedTeacherForAssignment) {
      this.showSnackbarMessage('Please select both subject and teacher', 'error');
      return;
    }
    
    // Ensure IDs are numbers
    const subjectId = typeof this.selectedSubjectForAssignment === 'string' ? parseInt(this.selectedSubjectForAssignment) : this.selectedSubjectForAssignment;
    const teacherId = typeof this.selectedTeacherForAssignment === 'string' ? parseInt(this.selectedTeacherForAssignment) : this.selectedTeacherForAssignment;
    const sectionId = this.selectedSectionForAssignment ? (typeof this.selectedSectionForAssignment === 'string' ? parseInt(this.selectedSectionForAssignment) : this.selectedSectionForAssignment) : undefined;
    
    this.subjectService.assignTeacherToSubject(subjectId, teacherId, sectionId).subscribe({
      next: (result) => {
        if (result.ok) {
          this.showSnackbarMessage('Teacher assigned successfully', 'success');
          this.loadTeachersForSubject();
          // Clear selections
          this.selectedSubjectForAssignment = null;
          this.selectedTeacherForAssignment = null;
          this.selectedSectionForAssignment = null;
        } else {
          this.showSnackbarMessage(result.message || 'Failed to assign teacher', 'error');
        }
      },
      error: (err) => {
        console.error('Error assigning teacher:', err);
        this.showSnackbarMessage('Failed to assign teacher: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  removeTeacherAssignment(mappingId: number): void {
    this.confirmMessage = 'Are you sure you want to remove this teacher assignment?';
    this.confirmCallback = () => {
      this.subjectService.removeTeacherFromSubject(mappingId).subscribe({
        next: (result) => {
          if (result.ok) {
            this.showSnackbarMessage('Teacher assignment removed successfully', 'success');
            this.loadTeachersForSubject();
          } else {
            this.showSnackbarMessage(result.message || 'Failed to remove assignment', 'error');
          }
        }
      });
    };
    this.showConfirmDialog = true;
  }

  getSubjectName(subjectId: number): string {
    const subject = this.allSubjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  }

  getTeacherName(teacherId: number): string {
    const teacher = this.teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown';
  }

  getSectionName(sectionId: number): string {
    if (!sectionId) return 'All Sections';
    
    // First check in sectionsForAssignment (for teacher assignment tab)
    let section = this.sectionsForAssignment.find(s => s.id === sectionId);
    
    // If not found, check in sections (for section modal)
    if (!section) {
      section = this.sections.find(s => s.id === sectionId);
    }
    
    // If not found, check in sectionsForClass (for subjects tab)
    if (!section) {
      section = this.sectionsForClass.find(s => s.id === sectionId);
    }
    
    // If not found, check in sectionsForSectionsTab (for sections tab)
    if (!section) {
      section = this.sectionsForSectionsTab.find(s => s.id === sectionId);
    }
    
    return section ? section.name : 'All Sections';
  }

  getSectionsNames(): string {
    if (!this.sectionsForClass || this.sectionsForClass.length === 0) {
      return 'No sections';
    }
    return this.sectionsForClass.map(s => s.name).join(', ');
  }

  getSectionsNamesForSubject(): string {
    if (!this.sectionsForSubjectClass || this.sectionsForSubjectClass.length === 0) {
      return 'No sections';
    }
    return this.sectionsForSubjectClass.map(s => s.name).join(', ');
  }

  onSubjectClassChange(): void {
    // Load sections for the selected class in subject modal
    if (this.subjectForm.classId) {
      const classId = typeof this.subjectForm.classId === 'string' ? parseInt(this.subjectForm.classId) : this.subjectForm.classId;
      console.log('Loading sections for class ID:', classId);
      this.subjectService.getSectionsByClass(classId).subscribe({
        next: (result) => {
          console.log('Sections API response:', result);
          if (result.ok && result.data) {
            this.sectionsForSubjectClass = result.data;
            console.log('Sections loaded successfully:', this.sectionsForSubjectClass);
          } else {
            console.log('No sections found or API error');
            this.sectionsForSubjectClass = [];
          }
        },
        error: (err) => {
          console.error('Error loading sections:', err);
          this.sectionsForSubjectClass = [];
        }
      });
    } else {
      this.sectionsForSubjectClass = [];
    }
  }

  onCourseChangeForSections(): void {
    this.selectedClassForSectionsTab = null;
    this.sectionsForSectionsTab = [];
    if (this.selectedCourseForSections) {
      const courseId = typeof this.selectedCourseForSections === 'string' ? parseInt(this.selectedCourseForSections) : this.selectedCourseForSections;
      this.subjectService.getClassesByCourse(courseId).subscribe({
        next: (result) => {
          if (result.ok && result.data) {
            this.classesForSections = result.data;
          } else {
            this.classesForSections = [];
          }
        },
        error: () => {
          this.classesForSections = [];
        }
      });
    } else {
      this.classesForSections = [];
    }
  }

  onClassChangeForSections(): void {
    if (this.selectedClassForSectionsTab) {
      const classId = typeof this.selectedClassForSectionsTab === 'string' ? parseInt(this.selectedClassForSectionsTab) : this.selectedClassForSectionsTab;
      this.loadSectionsForTab(classId);
    } else {
      this.sectionsForSectionsTab = [];
    }
  }

  loadSectionsForTab(classId: number): void {
    this.isLoadingSectionsForTab = true;
    this.subjectService.getSectionsByClass(classId).subscribe({
      next: (result) => {
        this.isLoadingSectionsForTab = false;
        if (result.ok && result.data) {
          this.sectionsForSectionsTab = result.data;
          // Load student counts for each section
          this.loadSectionStudentCounts();
        } else {
          this.sectionsForSectionsTab = [];
        }
      },
      error: () => {
        this.isLoadingSectionsForTab = false;
        this.sectionsForSectionsTab = [];
      }
    });
  }

  loadSectionStudentCounts(): void {
    this.sectionsForSectionsTab.forEach(section => {
      if (section.id) {
        this.studentService.getStudentsBySection(section.id).subscribe({
          next: (result) => {
            if (result.ok && result.count !== undefined) {
              this.sectionStudentCounts.set(section.id!, result.count);
            }
          },
          error: () => {
            // Ignore errors, just don't show count
          }
        });
      }
    });
  }

  getSectionStudentCount(sectionId: number | null | undefined): number | null {
    if (!sectionId) return null;
    return this.sectionStudentCounts.get(sectionId) ?? null;
  }

  getRemainingCapacity(section: Section): number {
    if (!section.capacity) return -1; // No capacity limit
    const currentCount = this.getSectionStudentCount(section.id);
    if (currentCount === null) return section.capacity; // Count not loaded yet
    return section.capacity - currentCount;
  }

  viewSectionStudents(section: Section): void {
    this.selectedSectionForView = section;
    this.sectionStudents = [];
    this.isLoadingSectionStudents = true;
    this.showSectionStudentsModal = true;
    
    if (section.id) {
      this.studentService.getStudentsBySection(section.id).subscribe({
        next: (result) => {
          this.isLoadingSectionStudents = false;
          if (result.ok && result.students) {
            this.sectionStudents = result.students;
            // Update count in map
            if (result.count !== undefined && section.id) {
              this.sectionStudentCounts.set(section.id, result.count);
            }
          }
        },
        error: (err) => {
          this.isLoadingSectionStudents = false;
          console.error('Error loading section students:', err);
        }
      });
    }
  }

  closeSectionStudentsModal(): void {
    this.showSectionStudentsModal = false;
    this.selectedSectionForView = null;
    this.sectionStudents = [];
  }

  // Feature access control helper method
  isFeatureEnabled(featureName: string): boolean {
    if (!this.entity || !this.entity.features) {
      return true; // Default to enabled if features not loaded
    }
    // Check if feature exists and is enabled
    return this.entity.features[featureName] === true;
  }

  // Helper method to check if subjectSubTab is 'subjects' (to avoid TypeScript narrowing issue)
  isSubjectsTab(): boolean {
    const result = this.subjectSubTab === 'subjects';
    console.log('isSubjectsTab() called: subjectSubTab =', this.subjectSubTab, ', result =', result);
    return result;
  }

  trackBySubjectId(index: number, subject: Subject): any {
    return subject.id || index;
  }

  getActionModalSectionsNames(): string {
    if (!this.actionModalSections || this.actionModalSections.length === 0) {
      return 'No sections';
    }
    return this.actionModalSections.map(s => s.name).join(', ');
  }

  getSectionStudentCountForAction(sectionId: number): number | null {
    if (!sectionId) return null;
    return this.sectionStudentCounts.get(sectionId) ?? null;
  }

  getRemainingCapacityForAction(section: Section): number {
    if (!section.capacity) return -1; // No capacity limit
    const currentCount = this.getSectionStudentCountForAction(section.id!);
    if (currentCount === null) return section.capacity; // Count not loaded yet
    return section.capacity - currentCount;
  }

  getClassNameForSections(): string {
    if (!this.selectedClassForSectionsTab) return '';
    const classItem = this.classesForSections.find(c => c.id === (typeof this.selectedClassForSectionsTab === 'string' ? parseInt(this.selectedClassForSectionsTab) : this.selectedClassForSectionsTab));
    return classItem ? classItem.name : '';
  }

  saveSection(): void {
    if (!this.sectionForm.name) {
      this.showSnackbarMessage('Please enter section name', 'error');
      return;
    }
    if (!this.sectionForm.classId) {
      this.showSnackbarMessage('Class not selected', 'error');
      return;
    }
    
    // Ensure classId is a number
    const sectionData: Section = {
      ...this.sectionForm,
      classId: typeof this.sectionForm.classId === 'string' ? parseInt(this.sectionForm.classId) : this.sectionForm.classId,
      status: this.sectionForm.status || 'active'
    } as Section;
    
    if (this.isEditingSection && this.sectionForm.id) {
      this.subjectService.updateSection(this.sectionForm.id, sectionData).subscribe({
        next: (result) => {
          if (result.ok) {
            this.showSnackbarMessage('Section updated successfully', 'success');
            this.sectionForm = {};
            this.isEditingSection = false;
            this.loadSections();
            // Reload sections for sections tab if class is selected
            if (this.selectedClassForSectionsTab) {
              const classId = typeof this.selectedClassForSectionsTab === 'string' ? parseInt(this.selectedClassForSectionsTab) : this.selectedClassForSectionsTab;
              this.loadSectionsForTab(classId);
            }
            // Also reload sections for subjects tab if class is selected there
            if (this.selectedClassForSubject) {
              this.loadSectionsForClass();
            }
          } else {
            this.showSnackbarMessage(result.message || 'Failed to update section', 'error');
          }
        },
        error: (err) => {
          console.error('Error updating section:', err);
          this.showSnackbarMessage('Failed to update section: ' + (err.error?.message || err.message), 'error');
        }
      });
    } else {
      this.subjectService.createSection(sectionData).subscribe({
        next: (result) => {
          if (result.ok) {
            this.showSnackbarMessage('Section created successfully', 'success');
            this.sectionForm = {};
            this.isEditingSection = false;
            this.loadSections();
            // Reload sections for sections tab if class is selected
            if (this.selectedClassForSectionsTab) {
              const classId = typeof this.selectedClassForSectionsTab === 'string' ? parseInt(this.selectedClassForSectionsTab) : this.selectedClassForSectionsTab;
              this.loadSectionsForTab(classId);
            }
            // Also reload sections for subjects tab if class is selected there
            if (this.selectedClassForSubject) {
              this.loadSectionsForClass();
            }
          } else {
            this.showSnackbarMessage(result.message || 'Failed to create section', 'error');
          }
        },
        error: (err) => {
          console.error('Error creating section:', err);
          this.showSnackbarMessage('Failed to create section: ' + (err.error?.message || err.message), 'error');
        }
      });
    }
  }

  editSection(section: Section): void {
    // Load section data into form for editing
    this.sectionForm = {
      id: section.id,
      classId: section.classId,
      name: section.name,
      capacity: section.capacity,
      status: section.status || 'active'
    };
    this.isEditingSection = true;
  }

  cancelSectionEdit(): void {
    this.sectionForm = {};
    this.isEditingSection = false;
  }

  deleteSection(id: number): void {
    this.confirmMessage = 'Are you sure you want to delete this section? This action cannot be undone.';
    this.confirmCallback = () => {
      this.subjectService.deleteSection(id).subscribe({
        next: (result) => {
          if (result.ok) {
            this.showSnackbarMessage('Section deleted successfully', 'success');
            this.loadSections();
            // Reload sections for sections tab if class is selected
            if (this.selectedClassForSectionsTab) {
              const classId = typeof this.selectedClassForSectionsTab === 'string' ? parseInt(this.selectedClassForSectionsTab) : this.selectedClassForSectionsTab;
              this.loadSectionsForTab(classId);
            }
            // Also reload sections for subjects tab if class is selected there
            if (this.selectedClassForSubject) {
              this.loadSectionsForClass();
            }
          } else {
            this.showSnackbarMessage(result.message || 'Failed to delete section', 'error');
          }
        },
        error: (err) => {
          console.error('Error deleting section:', err);
          this.showSnackbarMessage('Failed to delete section: ' + (err.error?.message || err.message), 'error');
        }
      });
    };
    this.showConfirmDialog = true;
  }
}
