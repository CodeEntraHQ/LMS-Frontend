import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { SubjectService, Section } from '../../services/subject.service';
import { StudentService, Student } from '../../services/student.service';
import { TeacherService } from '../../services/teacher.service';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  template: `
    <div class="page">
      <!-- Top Nav -->
      <header class="nav">
        <div class="nav-left">
          <a class="brand" routerLink="/teacher/dashboard">
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
            <span class="breadcrumb-current">Dashboard</span>
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
              <div class="user-badge">TEACHER</div>
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
        <!-- Quick Stats Section -->
        <div class="quick-stats-section">
          <h2 class="section-title">📊 Quick Stats</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div class="stat-info">
                <div class="stat-label">Assigned classes</div>
                <div class="stat-value">{{ quickStats.assignedClasses }}</div>
            </div>
              </div>
            <div class="stat-card">
              <div class="stat-icon">📖</div>
              <div class="stat-info">
                <div class="stat-label">Subjects</div>
                <div class="stat-value">{{ quickStats.subjects }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📅</div>
              <div class="stat-info">
                <div class="stat-label">Today's lectures</div>
                <div class="stat-value">{{ quickStats.todaysLectures }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="nav-tabs">
          <button class="nav-tab" [class.active]="activeTab === 'students'" (click)="activeTab = 'students'">
            <span class="tab-emoji">👨‍🎓</span>
            <span>My Students</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'study-material'" (click)="activeTab = 'study-material'">
            <span class="tab-emoji">📚</span>
            <span>Study Material</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'assignments'" (click)="activeTab = 'assignments'">
            <span class="tab-emoji">📝</span>
            <span>Assignments</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'exams'" (click)="activeTab = 'exams'">
            <span class="tab-emoji">🧪</span>
            <span>Exams</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'attendance'" (click)="activeTab = 'attendance'">
            <span class="tab-emoji">📅</span>
            <span>Attendance</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'announcements'" (click)="activeTab = 'announcements'">
            <span class="tab-emoji">📢</span>
            <span>Announcements</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'reports'" (click)="activeTab = 'reports'">
            <span class="tab-emoji">📈</span>
            <span>Reports</span>
          </button>
        </div>

        <!-- My Students Tab -->
        <div class="tab-content" *ngIf="activeTab === 'students'">
          <div class="section-header">
            <h2 class="section-title">👨‍🎓 My Students</h2>
            <p class="section-subtitle">Class-wise student list</p>
            </div>
          <div class="content-card">
            <div class="class-selector">
              <label>Select Section:</label>
              <select 
                class="form-select" 
                [(ngModel)]="selectedSectionId"
                (ngModelChange)="onSectionChange()"
                [disabled]="isLoadingSections"
              >
                <option [value]="null">All Sections</option>
                <option *ngFor="let section of assignedSections" [value]="section.id">
                  {{ section.name }}
                </option>
              </select>
              <span *ngIf="isLoadingSections" class="loading-text">Loading sections...</span>
          </div>
            <div class="students-list">
              <div *ngIf="isLoadingStudents" class="empty-state">
                <p>Loading students...</p>
              </div>
              <div class="student-item" *ngFor="let student of filteredStudents">
                <div class="student-avatar">{{ ((student.firstName || '') + ' ' + (student.lastName || '')).trim().charAt(0) || 'S' }}</div>
                <div class="student-info">
                  <div class="student-name">{{ (student.firstName || '') + ' ' + (student.lastName || '') }}</div>
                  <div class="student-details">{{ student.classSection || student.classCourse || '' }} • Roll No: {{ student.rollNumber || '' }}</div>
            </div>
            </div>
              <div *ngIf="!isLoadingStudents && filteredStudents.length === 0" class="empty-state">
                <p *ngIf="selectedSectionId">No students found in this section</p>
                <p *ngIf="!selectedSectionId">Please select a section to view students</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Study Material Tab -->
        <div class="tab-content" *ngIf="activeTab === 'study-material'">
          <div class="section-header">
            <h2 class="section-title">📚 Study Material</h2>
            <p class="section-subtitle">Upload notes (PDF, video) • Edit / delete content</p>
            <button class="btn-primary" (click)="showUploadModal = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Upload Material
            </button>
            </div>
          <div class="content-card">
            <div class="material-list">
              <div class="material-item" *ngFor="let material of studyMaterials">
                <div class="material-icon">{{ material.type === 'pdf' ? '📄' : '🎥' }}</div>
                <div class="material-info">
                  <div class="material-name">{{ material.name }}</div>
                  <div class="material-meta">{{ material.class }} • {{ material.subject }} • {{ material.uploadDate }}</div>
                </div>
                <div class="material-actions">
                  <button class="action-btn" (click)="editMaterial(material)">Edit</button>
                  <button class="action-btn delete" (click)="deleteMaterial(material)">Delete</button>
                </div>
              </div>
              <div *ngIf="studyMaterials.length === 0" class="empty-state">
                <p>No study material uploaded yet</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Assignments Tab -->
        <div class="tab-content" *ngIf="activeTab === 'assignments'">
          <div class="section-header">
            <h2 class="section-title">📝 Assignments</h2>
            <p class="section-subtitle">Create assignment • View submissions • Give marks & feedback</p>
            <button class="btn-primary" (click)="showAssignmentModal = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Create Assignment
            </button>
          </div>
          <div class="content-card">
            <div class="assignments-list">
              <div class="assignment-item" *ngFor="let assignment of assignments">
                <div class="assignment-header">
                  <div>
                    <div class="assignment-title">{{ assignment.title }}</div>
                    <div class="assignment-meta">{{ assignment.class }} • {{ assignment.subject }} • Due: {{ assignment.dueDate }}</div>
                  </div>
                  <button class="btn-secondary" (click)="viewSubmissions(assignment)">View Submissions ({{ assignment.submissions }})</button>
                </div>
                <div class="assignment-actions">
                  <button class="action-btn" (click)="editAssignment(assignment)">Edit</button>
                  <button class="action-btn delete" (click)="deleteAssignment(assignment)">Delete</button>
                </div>
              </div>
              <div *ngIf="assignments.length === 0" class="empty-state">
                <p>No assignments created yet</p>
              </div>
            </div>
          </div>
          </div>

        <!-- Exams Tab -->
        <div class="tab-content" *ngIf="activeTab === 'exams'">
          <div class="section-header">
            <h2 class="section-title">🧪 Exams</h2>
            <p class="section-subtitle">Create test (if allowed) • Evaluate answers</p>
            <button class="btn-primary" (click)="showExamModal = true" *ngIf="canCreateExam">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Create Exam
            </button>
                </div>
          <div class="content-card">
            <div class="exams-list">
              <div class="exam-item" *ngFor="let exam of exams">
                <div class="exam-header">
                  <div>
                    <div class="exam-title">{{ exam.title }}</div>
                    <div class="exam-meta">{{ exam.class }} • {{ exam.subject }} • Date: {{ exam.examDate }}</div>
                  </div>
                  <button class="btn-secondary" (click)="evaluateExam(exam)">Evaluate ({{ exam.pendingEvaluations }})</button>
                </div>
                <div class="exam-actions">
                  <button class="action-btn" (click)="viewExam(exam)">View</button>
                  <button class="action-btn delete" (click)="deleteExam(exam)">Delete</button>
                </div>
              </div>
              <div *ngIf="exams.length === 0" class="empty-state">
                <p>No exams created yet</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Attendance Tab -->
        <div class="tab-content" *ngIf="activeTab === 'attendance'">
          <div class="section-header">
            <h2 class="section-title">📅 Attendance</h2>
            <p class="section-subtitle">Mark daily attendance</p>
          </div>
          <div class="content-card">
            <div class="attendance-controls">
              <div class="control-group">
                <label>Select Class:</label>
                <select class="form-select" [(ngModel)]="attendanceClass">
                  <option value="">Select Class</option>
                  <option *ngFor="let cls of classes" [value]="cls">{{ cls }}</option>
                    </select>
                  </div>
              <div class="control-group">
                <label>Date:</label>
                <input type="date" class="form-input" [(ngModel)]="attendanceDate" />
                  </div>
              <button class="btn-primary" (click)="loadAttendance()">Load Students</button>
                      </div>
            <div class="attendance-list" *ngIf="attendanceStudents.length > 0">
              <div class="attendance-item" *ngFor="let student of attendanceStudents">
                <div class="student-info">
                  <div class="student-name">{{ student.name }}</div>
                  <div class="student-roll">Roll No: {{ student.rollNo }}</div>
                </div>
                <div class="attendance-options">
                  <button class="attendance-btn present" [class.active]="student.status === 'present'" (click)="markAttendance(student, 'present')">Present</button>
                  <button class="attendance-btn absent" [class.active]="student.status === 'absent'" (click)="markAttendance(student, 'absent')">Absent</button>
                </div>
              </div>
              <button class="btn-primary save-attendance" (click)="saveAttendance()">Save Attendance</button>
            </div>
          </div>
        </div>

        <!-- Announcements Tab -->
        <div class="tab-content" *ngIf="activeTab === 'announcements'">
          <div class="section-header">
            <h2 class="section-title">📢 Announcements</h2>
            <p class="section-subtitle">Class-wise notice</p>
            <button class="btn-primary" (click)="showAnnouncementModal = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
              Create Announcement
                      </button>
                    </div>
          <div class="content-card">
            <div class="announcements-list">
              <div class="announcement-item" *ngFor="let announcement of announcements">
                <div class="announcement-header">
                  <div class="announcement-title">{{ announcement.title }}</div>
                  <div class="announcement-meta">{{ announcement.class }} • {{ announcement.date }}</div>
                  </div>
                <div class="announcement-content">{{ announcement.message }}</div>
                <div class="announcement-actions">
                  <button class="action-btn" (click)="editAnnouncement(announcement)">Edit</button>
                  <button class="action-btn delete" (click)="deleteAnnouncement(announcement)">Delete</button>
                </div>
              </div>
              <div *ngIf="announcements.length === 0" class="empty-state">
                <p>No announcements created yet</p>
              </div>
                </div>
              </div>
            </div>

        <!-- Reports Tab -->
        <div class="tab-content" *ngIf="activeTab === 'reports'">
          <div class="section-header">
            <h2 class="section-title">📈 Reports</h2>
            <p class="section-subtitle">Student performance • Attendance summary</p>
                </div>
          <div class="reports-grid">
            <div class="report-card">
              <h3 class="report-title">Student Performance</h3>
              <div class="report-content">
                <div class="performance-item" *ngFor="let perf of studentPerformance">
                  <div class="perf-student">{{ perf.studentName }}</div>
                  <div class="perf-score">Score: {{ perf.averageScore }}%</div>
                  </div>
                <div *ngIf="studentPerformance.length === 0" class="empty-state">
                  <p>No performance data available</p>
                  </div>
                  </div>
                  </div>
            <div class="report-card">
              <h3 class="report-title">Attendance Summary</h3>
              <div class="report-content">
                <div class="attendance-summary-item" *ngFor="let summary of attendanceSummary">
                  <div class="summary-class">{{ summary.class }}</div>
                  <div class="summary-stats">
                    <span>Present: {{ summary.present }}</span>
                    <span>Absent: {{ summary.absent }}</span>
                    <span>Total: {{ summary.total }}</span>
                </div>
              </div>
                <div *ngIf="attendanceSummary.length === 0" class="empty-state">
                  <p>No attendance data available</p>
            </div>
          </div>
            </div>
          </div>
        </div>
      </main>

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
    .icon-btn:hover{ border-color: var(--accent-green); }

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
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(168, 85, 247, 0.25);
      color: #a855f7;
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

    .quick-stats-section{
      margin-bottom: 24px;
    }
    .section-title{
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 16px;
    }
    .section-subtitle{
      color: var(--text-gray);
      font-weight: 600;
      margin-bottom: 16px;
    }
    .stats-grid{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .stat-card{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .stat-icon{
      font-size: 32px;
    }
    .stat-info{
      flex: 1;
    }
    .stat-label{
      color: var(--text-gray);
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .stat-value{
      font-size: 24px;
      font-weight: 900;
      color: var(--text-white);
    }

    .nav-tabs{
      display: flex;
      gap: 4px;
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 24px;
      overflow-x: auto;
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
      background: rgba(16, 185, 129, 0.15);
      color: var(--accent-green);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .tab-emoji{
      font-size: 16px;
    }

    .tab-content{
      margin-bottom: 24px;
    }
    .section-header{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .content-card{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 24px;
    }

    .btn-primary{
      padding: 10px 16px;
      border-radius: 12px;
      background: var(--accent-green);
      color: white;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      border: none;
    }
    .btn-primary:hover{ background: var(--accent-green-dark); }
    .btn-secondary{
      padding: 10px 16px;
      border-radius: 12px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 800;
      cursor: pointer;
    }
    .btn-secondary:hover{ border-color: rgba(148,163,184,0.5); }

    .form-select, .form-input{
      padding: 10px 14px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 10px;
      color: var(--text-white);
      outline: none;
      font-size: 14px;
    }
    .form-select:focus, .form-input:focus{ border-color: var(--accent-green); }

    .class-selector{
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    .class-selector{
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .class-selector label{
      font-weight: 700;
      color: var(--text-white);
    }
    .loading-text{
      color: var(--text-gray);
      font-size: 14px;
      font-weight: 600;
    }

    .students-list, .material-list, .assignments-list, .exams-list, .announcements-list{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .student-item, .material-item, .assignment-item, .exam-item, .announcement-item{
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
    }
    .student-avatar{
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--accent-green);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 20px;
      color: white;
    }
    .student-info, .material-info, .assignment-header, .exam-header, .announcement-header{
      flex: 1;
    }
    .student-name, .material-name, .assignment-title, .exam-title, .announcement-title{
      font-weight: 800;
      font-size: 16px;
      margin-bottom: 4px;
    }
    .student-details, .material-meta, .assignment-meta, .exam-meta, .announcement-meta{
      color: var(--text-gray);
      font-size: 14px;
    }
    .material-icon{
      font-size: 32px;
    }
    .material-actions, .assignment-actions, .exam-actions, .announcement-actions{
      display: flex;
      gap: 8px;
    }
    .action-btn{
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
    }
    .action-btn:hover{
      border-color: var(--accent-green);
    }
    .action-btn.delete{
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.25);
    }
    .action-btn.delete:hover{
      border-color: #ef4444;
    }

    .attendance-controls{
      display: flex;
      gap: 16px;
      align-items: flex-end;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .control-group{
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .control-group label{
      font-weight: 700;
      color: var(--text-white);
      font-size: 14px;
    }
    .attendance-list{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .attendance-item{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
    }
    .attendance-options{
      display: flex;
      gap: 8px;
    }
    .attendance-btn{
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
    }
    .attendance-btn.present.active{
      background: rgba(34, 197, 94, 0.15);
      border-color: #22c55e;
      color: #22c55e;
    }
    .attendance-btn.absent.active{
      background: rgba(239, 68, 68, 0.15);
      border-color: #ef4444;
      color: #ef4444;
    }
    .save-attendance{
      margin-top: 16px;
      width: 100%;
      justify-content: center;
    }

    .announcement-content{
      margin-top: 12px;
      padding: 12px;
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
      color: var(--text-gray);
    }

    .reports-grid{
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    .report-card{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 24px;
    }
    .report-title{
      font-size: 18px;
      font-weight: 900;
      margin-bottom: 16px;
    }
    .report-content{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .performance-item, .attendance-summary-item{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
    }
    .perf-student, .summary-class{
      font-weight: 800;
    }
    .perf-score, .summary-stats{
      color: var(--text-gray);
      font-size: 14px;
    }
    .summary-stats{
      display: flex;
      gap: 12px;
    }

    .empty-state{
      text-align: center;
      padding: 40px 20px;
      color: var(--text-gray);
      font-weight: 700;
    }

    @media (max-width: 768px){
      .nav{ padding: 0 20px; }
      .content{ padding: 18px 20px 16px; }
      .stats-grid{ grid-template-columns: 1fr; }
      .reports-grid{ grid-template-columns: 1fr; }
      .section-header{ flex-direction: column; align-items: flex-start; gap: 12px; }
      .attendance-controls{ flex-direction: column; }
    }
  `]
})
export class TeacherDashboardComponent implements OnInit {
  isDarkMode = true;
  activeTab: 'students' | 'study-material' | 'assignments' | 'exams' | 'attendance' | 'announcements' | 'reports' = 'students';
  
  userName = 'teacher';
  userEmail = 'teacher@lms.com';
  userInitial = 't';
  isUserMenuOpen = false;
  profileImage = '';

  quickStats = {
    assignedClasses: 3,
    subjects: 5,
    todaysLectures: 2
  };

  classes = ['Class 10A', 'Class 10B', 'Class 11A', 'Class 11B', 'Class 12A'];
  selectedClass = '';
  
  // Teacher sections and students
  assignedSections: Section[] = [];
  selectedSectionId: number | null = null;
  isLoadingSections = false;
  isLoadingStudents = false;
  
  students: Student[] = [];

  studyMaterials = [
    { id: 1, name: 'Mathematics Chapter 1', type: 'pdf', class: 'Class 10A', subject: 'Mathematics', uploadDate: '30/01/2026' },
    { id: 2, name: 'Physics Video Lecture', type: 'video', class: 'Class 11A', subject: 'Physics', uploadDate: '29/01/2026' }
  ];

  assignments = [
    { id: 1, title: 'Math Assignment 1', class: 'Class 10A', subject: 'Mathematics', dueDate: '05/02/2026', submissions: 15 },
    { id: 2, title: 'Physics Project', class: 'Class 11A', subject: 'Physics', dueDate: '10/02/2026', submissions: 8 }
  ];

  exams = [
    { id: 1, title: 'Math Test 1', class: 'Class 10A', subject: 'Mathematics', examDate: '15/02/2026', pendingEvaluations: 5 },
    { id: 2, title: 'Physics Midterm', class: 'Class 11A', subject: 'Physics', examDate: '20/02/2026', pendingEvaluations: 12 }
  ];

  announcements = [
    { id: 1, title: 'Class Test Notice', class: 'Class 10A', date: '30/01/2026', message: 'There will be a class test next week.' },
    { id: 2, title: 'Holiday Notice', class: 'All Classes', date: '29/01/2026', message: 'School will be closed on 5th February.' }
  ];

  studentPerformance = [
    { studentName: 'John Doe', averageScore: 85 },
    { studentName: 'Jane Smith', averageScore: 92 },
    { studentName: 'Mike Johnson', averageScore: 78 }
  ];

  attendanceSummary = [
    { class: 'Class 10A', present: 28, absent: 2, total: 30 },
    { class: 'Class 10B', present: 25, absent: 5, total: 30 }
  ];

  attendanceClass = '';
  attendanceDate = new Date().toISOString().split('T')[0];
  attendanceStudents: any[] = [];

  showUploadModal = false;
  showAssignmentModal = false;
  showExamModal = false;
  showAnnouncementModal = false;
  canCreateExam = true;

  constructor(
    private theme: ThemeService,
    private auth: AuthService,
    private router: Router,
    private profileService: ProfileService,
    private subjectService: SubjectService,
    private studentService: StudentService,
    private teacherService: TeacherService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user?.name) this.userName = user.name;
    if (user?.email) this.userEmail = user.email;
    this.userInitial = (this.userName?.trim()?.[0] || 't').toLowerCase();

    this.theme.isDarkMode$.subscribe(v => (this.isDarkMode = v));
    
    // Load profile image
    if (this.userEmail) {
      this.loadProfileImage();
    }
    
    // Load teacher's assigned sections
    this.loadTeacherSections();
  }

  loadProfileImage(): void {
    this.profileService.getProfile(this.userEmail).subscribe(result => {
      if (result.ok && result.profile.profileImage) {
        this.profileImage = result.profile.profileImage;
      }
    });
  }

  get filteredStudents() {
    return this.students;
  }

  loadTeacherSections(): void {
    if (!this.userEmail) return;
    
    this.isLoadingSections = true;
    
    const user = this.auth.getUser();
    const entityId = user?.collegeId || 1; // Use collegeId from user or default to 1
    
    // First, get teacher ID from email
    this.teacherService.getTeachersByEntity(entityId).subscribe({
      next: (result) => {
        if (result.ok && result.teachers) {
          const teacher = result.teachers.find(t => t.email === this.userEmail);
          if (teacher && teacher.id) {
            // Load teacher's assignments
            this.subjectService.getMappingsByTeacher(teacher.id).subscribe({
              next: (mappingResult: any) => {
                this.isLoadingSections = false;
                if (mappingResult.ok && mappingResult.data) {
                  // Extract unique section IDs
                  const sectionIds = Array.from(new Set(
                    mappingResult.data
                      .filter((m: any) => m.sectionId)
                      .map((m: any) => Number(m.sectionId))
                      .filter((id: number) => !isNaN(id))
                  )) as number[];
                  
                  // Load section details
                  if (sectionIds.length > 0) {
                    this.loadSectionDetails(sectionIds);
                  } else {
                    console.log('No sections assigned to this teacher');
                  }
                }
              },
              error: (err) => {
                this.isLoadingSections = false;
                console.error('Error loading teacher assignments:', err);
              }
            });
          } else {
            this.isLoadingSections = false;
            console.log('Teacher not found for email:', this.userEmail);
          }
        } else {
          this.isLoadingSections = false;
        }
      },
      error: (err) => {
        this.isLoadingSections = false;
        console.error('Error loading teacher:', err);
      }
    });
  }

  loadSectionDetails(sectionIds: number[]): void {
    const sectionPromises = sectionIds.map(id => 
      this.subjectService.getSectionById(id).toPromise()
    );
    
    Promise.all(sectionPromises).then(sections => {
      this.assignedSections = sections
        .filter(s => s && s.ok !== false)
        .map((s: any) => s.data || s)
        .filter((s: any) => s && s.id)
        .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
    }).catch(err => {
      console.error('Error loading section details:', err);
    });
  }

  onSectionChange(): void {
    if (!this.selectedSectionId) {
      this.students = [];
      return;
    }
    
    this.isLoadingStudents = true;
    this.studentService.getStudentsBySection(this.selectedSectionId).subscribe({
      next: (result) => {
        this.isLoadingStudents = false;
        if (result.ok && result.students) {
          this.students = result.students;
        } else {
          this.students = [];
        }
      },
      error: (err) => {
        this.isLoadingStudents = false;
        console.error('Error loading students:', err);
        this.students = [];
      }
    });
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
    this.router.navigate(['/teacher/profile']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  editMaterial(material: any): void {
    console.log('Edit material:', material);
    // TODO: Implement edit functionality
  }

  deleteMaterial(material: any): void {
    if (confirm(`Delete "${material.name}"?`)) {
      this.studyMaterials = this.studyMaterials.filter(m => m.id !== material.id);
    }
  }

  viewSubmissions(assignment: any): void {
    console.log('View submissions for:', assignment);
    // TODO: Implement view submissions
  }

  editAssignment(assignment: any): void {
    console.log('Edit assignment:', assignment);
    // TODO: Implement edit functionality
  }

  deleteAssignment(assignment: any): void {
    if (confirm(`Delete "${assignment.title}"?`)) {
      this.assignments = this.assignments.filter(a => a.id !== assignment.id);
    }
  }

  evaluateExam(exam: any): void {
    console.log('Evaluate exam:', exam);
    // TODO: Implement evaluate functionality
  }

  viewExam(exam: any): void {
    console.log('View exam:', exam);
    // TODO: Implement view functionality
  }

  deleteExam(exam: any): void {
    if (confirm(`Delete "${exam.title}"?`)) {
      this.exams = this.exams.filter(e => e.id !== exam.id);
    }
  }

  loadAttendance(): void {
    if (!this.attendanceClass) {
      alert('Please select a class');
        return;
      }
    // Load students for selected class
    this.attendanceStudents = this.students
      .filter(s => (s.classSection || s.classCourse || '') === this.attendanceClass)
      .map(s => ({ ...s, status: '' }));
  }

  markAttendance(student: any, status: string): void {
    student.status = status;
  }

  saveAttendance(): void {
    console.log('Save attendance:', this.attendanceStudents);
    alert('Attendance saved successfully!');
    // TODO: Implement save to backend
  }

  editAnnouncement(announcement: any): void {
    console.log('Edit announcement:', announcement);
    // TODO: Implement edit functionality
  }

  deleteAnnouncement(announcement: any): void {
    if (confirm(`Delete "${announcement.title}"?`)) {
      this.announcements = this.announcements.filter(a => a.id !== announcement.id);
    }
  }
}
