import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { StudentService, Student } from '../../services/student.service';
import { SubjectService, Course, ClassEntity, Section } from '../../services/subject.service';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  template: `
    <div class="page">
      <!-- Top Nav -->
      <header class="nav">
        <div class="nav-left">
          <a class="brand" routerLink="/student/dashboard">
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
              <div class="user-badge">STUDENT</div>
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
        <!-- Navigation Tabs -->
        <div class="nav-tabs">
          <button class="nav-tab" [class.active]="activeTab === 'dashboard'" (click)="activeTab = 'dashboard'">
            <span class="tab-emoji">📊</span>
            <span>My Dashboard</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'subjects'" (click)="activeTab = 'subjects'">
            <span class="tab-emoji">📚</span>
            <span>My Subjects</span>
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
          <button class="nav-tab" [class.active]="activeTab === 'notices'" (click)="activeTab = 'notices'">
            <span class="tab-emoji">📢</span>
            <span>Notices</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'fees'" (click)="activeTab = 'fees'">
            <span class="tab-emoji">💰</span>
            <span>Fees</span>
          </button>
        </div>

        <!-- My Dashboard Tab -->
        <div class="tab-content" *ngIf="activeTab === 'dashboard'">
          <div class="section-header">
            <h2 class="section-title">📊 My Dashboard</h2>
              <p class="section-subtitle">Overview of your enrolled courses, exams, and assignments</p>
          </div>
          <div class="dashboard-content">
            <div class="dashboard-card">
              <h3 class="card-title">Enrolled course / class</h3>
              <div class="card-content">
                <div class="enrolled-item" *ngFor="let course of enrolledCourses">
                  <div class="course-name">{{ course.name }}</div>
                  <div class="course-class">{{ course.class }}</div>
                </div>
                <div *ngIf="enrolledCourses.length === 0" class="empty-text">No enrolled courses yet</div>
              </div>
            </div>
            <div class="dashboard-card">
              <h3 class="card-title">Upcoming exams</h3>
              <div class="card-content">
                <div class="exam-item" *ngFor="let exam of upcomingExams">
                  <div class="exam-name">{{ exam.name }}</div>
                  <div class="exam-date">{{ exam.date }}</div>
                </div>
                <div *ngIf="upcomingExams.length === 0" class="empty-text">No upcoming exams</div>
              </div>
            </div>
            <div class="dashboard-card">
              <h3 class="card-title">Pending assignments</h3>
              <div class="card-content">
                <div class="assignment-item" *ngFor="let assignment of pendingAssignments">
                  <div class="assignment-name">{{ assignment.name }}</div>
                  <div class="assignment-due">Due: {{ assignment.dueDate }}</div>
            </div>
                <div *ngIf="pendingAssignments.length === 0" class="empty-text">No pending assignments</div>
          </div>
        </div>
            </div>
          </div>

        <!-- My Subjects Tab -->
        <div class="tab-content" *ngIf="activeTab === 'subjects'">
          <div class="section-header">
            <h2 class="section-title">📚 My Subjects</h2>
            <p class="section-subtitle">Study material • Recorded videos</p>
          </div>
          
          <!-- Course and Section Info -->
          <div class="content-card" *ngIf="studentCourse || studentSection">
            <div class="enrollment-info">
              <div class="info-item">
                <span class="info-label">Course:</span>
                <span class="info-value">{{ studentCourse || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Section:</span>
                <span class="info-value">{{ studentSection || 'N/A' }}</span>
              </div>
              <div class="info-item" *ngIf="studentRollNumber">
                <span class="info-label">Roll Number:</span>
                <span class="info-value">{{ studentRollNumber }}</span>
              </div>
            </div>
          </div>
          
          <div class="content-card">
            <div class="subjects-list">
              <div class="subject-item" *ngFor="let subject of subjects">
                <div class="subject-header">
                  <div class="subject-name">{{ subject.name }}</div>
                  <div class="subject-teacher">Teacher: {{ subject.teacher }}</div>
                  </div>
                <div class="subject-materials">
                  <div class="material-section">
                    <div class="section-label">Study Material</div>
                    <div class="material-list">
                      <div class="material-item" *ngFor="let material of subject.materials">
                        <div class="material-icon">{{ material.type === 'pdf' ? '📄' : '📝' }}</div>
                        <div class="material-name">{{ material.name }}</div>
                        <button class="btn-download" (click)="downloadMaterial(material)">Download</button>
                  </div>
                      <div *ngIf="subject.materials.length === 0" class="empty-text">No study material available</div>
                  </div>
                      </div>
                  <div class="material-section">
                    <div class="section-label">Recorded Videos</div>
                    <div class="video-list">
                      <div class="video-item" *ngFor="let video of subject.videos">
                        <div class="video-icon">🎥</div>
                        <div class="video-info">
                          <div class="video-name">{{ video.name }}</div>
                          <div class="video-duration">{{ video.duration }}</div>
                        </div>
                        <button class="btn-watch" (click)="watchVideo(video)">Watch</button>
                      </div>
                      <div *ngIf="subject.videos.length === 0" class="empty-text">No recorded videos available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Assignments Tab -->
        <div class="tab-content" *ngIf="activeTab === 'assignments'">
          <div class="section-header">
            <h2 class="section-title">📝 Assignments</h2>
            <p class="section-subtitle">Assignment list • Upload submission • Marks & feedback</p>
          </div>
          <div class="content-card">
            <div class="assignments-list">
              <div class="assignment-card" *ngFor="let assignment of assignments">
                <div class="assignment-header">
                  <div>
                    <div class="assignment-title">{{ assignment.title }}</div>
                    <div class="assignment-meta">{{ assignment.subject }} • Due: {{ assignment.dueDate }}</div>
                  </div>
                  <div class="assignment-status" [class.submitted]="assignment.submitted" [class.pending]="!assignment.submitted">
                    {{ assignment.submitted ? 'Submitted' : 'Pending' }}
                  </div>
                </div>
                <div class="assignment-description">{{ assignment.description }}</div>
                <div class="assignment-actions">
                  <button class="btn-primary" *ngIf="!assignment.submitted" (click)="uploadSubmission(assignment)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M7 10L12 5L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M12 5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    Upload Submission
                      </button>
                  <button class="btn-secondary" *ngIf="assignment.submitted" (click)="viewFeedback(assignment)">
                    View Marks & Feedback
                  </button>
                    </div>
                <div class="assignment-feedback" *ngIf="assignment.submitted && assignment.marks">
                  <div class="feedback-header">
                    <span class="marks">Marks: {{ assignment.marks }}/{{ assignment.totalMarks }}</span>
                    <span class="grade">Grade: {{ assignment.grade }}</span>
                  </div>
                  <div class="feedback-text" *ngIf="assignment.feedback">{{ assignment.feedback }}</div>
                </div>
              </div>
              <div *ngIf="assignments.length === 0" class="empty-state">
                <p>No assignments available</p>
              </div>
                </div>
              </div>
            </div>

        <!-- Exams Tab -->
        <div class="tab-content" *ngIf="activeTab === 'exams'">
          <div class="section-header">
            <h2 class="section-title">🧪 Exams</h2>
            <p class="section-subtitle">Attempt exams • View results</p>
                </div>
          <div class="content-card">
            <div class="exams-list">
              <div class="exam-card" *ngFor="let exam of exams">
                <div class="exam-header">
                  <div>
                    <div class="exam-title">{{ exam.title }}</div>
                    <div class="exam-meta">{{ exam.subject }} • Date: {{ exam.date }} • Duration: {{ exam.duration }}</div>
                  </div>
                  <div class="exam-status" [class.attempted]="exam.attempted" [class.available]="!exam.attempted">
                    {{ exam.attempted ? 'Attempted' : 'Available' }}
                  </div>
                  </div>
                <div class="exam-actions">
                  <button class="btn-primary" *ngIf="!exam.attempted" (click)="attemptExam(exam)">
                    Attempt Exam
                  </button>
                  <button class="btn-secondary" *ngIf="exam.attempted" (click)="viewResults(exam)">
                    View Results
                  </button>
                  </div>
                <div class="exam-results" *ngIf="exam.attempted && exam.result">
                  <div class="result-header">
                    <span class="result-score">Score: {{ exam.result.score }}/{{ exam.result.totalMarks }}</span>
                    <span class="result-grade">Grade: {{ exam.result.grade }}</span>
                </div>
                  <div class="result-percentage">Percentage: {{ exam.result.percentage }}%</div>
                </div>
              </div>
              <div *ngIf="exams.length === 0" class="empty-state">
                <p>No exams available</p>
              </div>
              </div>
            </div>
          </div>

        <!-- Attendance Tab -->
        <div class="tab-content" *ngIf="activeTab === 'attendance'">
          <div class="section-header">
            <h2 class="section-title">📅 Attendance</h2>
            <p class="section-subtitle">Attendance percentage</p>
          </div>
          <div class="content-card">
            <div class="attendance-overview">
              <div class="attendance-card">
                <div class="attendance-percentage">{{ attendancePercentage }}%</div>
                <div class="attendance-label">Overall Attendance</div>
                <div class="attendance-stats">
                  <div class="stat-item">
                    <span class="stat-label">Present:</span>
                    <span class="stat-value">{{ attendanceStats.present }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Absent:</span>
                    <span class="stat-value">{{ attendanceStats.absent }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Total:</span>
                    <span class="stat-value">{{ attendanceStats.total }}</span>
                  </div>
                </div>
              </div>
              <div class="attendance-chart">
                <div class="chart-item" *ngFor="let record of attendanceRecords">
                  <div class="chart-date">{{ record.date }}</div>
                  <div class="chart-bar">
                    <div class="chart-fill" [style.width.%]="record.percentage"></div>
                  </div>
                  <div class="chart-percentage">{{ record.percentage }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notices Tab -->
        <div class="tab-content" *ngIf="activeTab === 'notices'">
          <div class="section-header">
            <h2 class="section-title">📢 Notices</h2>
            <p class="section-subtitle">School / class announcements</p>
          </div>
          <div class="content-card">
            <div class="notices-list">
              <div class="notice-item" *ngFor="let notice of notices">
                <div class="notice-header">
                  <div class="notice-title">{{ notice.title }}</div>
                  <div class="notice-date">{{ notice.date }}</div>
                </div>
                <div class="notice-type">{{ notice.type }}</div>
                <div class="notice-content">{{ notice.message }}</div>
              </div>
              <div *ngIf="notices.length === 0" class="empty-state">
                <p>No notices available</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Fees Tab -->
        <div class="tab-content" *ngIf="activeTab === 'fees'">
          <div class="section-header">
            <h2 class="section-title">💰 Fees</h2>
            <p class="section-subtitle">Fee status • Download receipt</p>
          </div>
          <div class="content-card">
            <div class="fees-overview">
              <div class="fee-card">
                <div class="fee-header">
                  <div class="fee-label">Total Fee</div>
                  <div class="fee-amount">₹{{ feeStatus.totalAmount }}</div>
                </div>
                <div class="fee-header">
                  <div class="fee-label">Paid</div>
                  <div class="fee-amount paid">₹{{ feeStatus.paidAmount }}</div>
                </div>
                <div class="fee-header">
                  <div class="fee-label">Pending</div>
                  <div class="fee-amount pending">₹{{ feeStatus.pendingAmount }}</div>
                </div>
                <div class="fee-status-badge" [class.paid]="feeStatus.status === 'paid'" [class.pending]="feeStatus.status === 'pending'">
                  {{ feeStatus.status === 'paid' ? 'Paid' : 'Pending' }}
                </div>
              </div>
              <div class="fee-receipts">
                <div class="receipt-item" *ngFor="let receipt of receipts">
                  <div class="receipt-info">
                    <div class="receipt-date">{{ receipt.date }}</div>
                    <div class="receipt-amount">₹{{ receipt.amount }}</div>
                  </div>
                  <button class="btn-download" (click)="downloadReceipt(receipt)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M7 10L12 5L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Download Receipt
                  </button>
                </div>
                <div *ngIf="receipts.length === 0" class="empty-text">No receipts available</div>
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
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #22c55e;
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
    .card-title{
      font-size: 16px;
      font-weight: 800;
      margin-bottom: 16px;
      color: var(--text-white);
    }
    .card-content{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .enrolled-item, .exam-item, .assignment-item{
      padding: 12px;
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
    }
    .course-name, .exam-name, .assignment-name{
      font-weight: 800;
      margin-bottom: 4px;
    }
    .course-class, .exam-date, .assignment-due{
      color: var(--text-gray);
      font-size: 14px;
    }
    .empty-text{
      color: var(--text-gray);
      font-style: italic;
      text-align: center;
      padding: 20px;
    }

    .content-card{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 24px;
    }

    .subjects-list{
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .subject-item{
      padding: 20px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
    }
    .subject-header{
      margin-bottom: 16px;
    }
    .subject-name{
      font-size: 18px;
      font-weight: 900;
      margin-bottom: 4px;
    }
    .subject-teacher{
      color: var(--text-gray);
      font-size: 14px;
    }
    .subject-materials{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .material-section{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .section-label{
      font-weight: 800;
      color: var(--text-white);
      margin-bottom: 8px;
    }
    .material-list, .video-list{
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .material-item, .video-item{
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
    }
    .material-icon, .video-icon{
      font-size: 24px;
    }
    .material-name, .video-name{
      flex: 1;
      font-weight: 700;
    }
    .video-info{
      flex: 1;
    }
    .video-duration{
      color: var(--text-gray);
      font-size: 12px;
    }
    .btn-download, .btn-watch{
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-download:hover, .btn-watch:hover{
      border-color: var(--accent-green);
    }

    .assignments-list, .exams-list, .notices-list{
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .assignment-card, .exam-card{
      padding: 20px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
    }
    .assignment-header, .exam-header{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .assignment-title, .exam-title{
      font-size: 18px;
      font-weight: 900;
      margin-bottom: 4px;
    }
    .assignment-meta, .exam-meta{
      color: var(--text-gray);
      font-size: 14px;
    }
    .assignment-status, .exam-status{
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .assignment-status.submitted, .exam-status.attempted{
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #22c55e;
    }
    .assignment-status.pending, .exam-status.available{
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
    }
    .assignment-description{
      color: var(--text-gray);
      margin-bottom: 16px;
    }
    .assignment-actions, .exam-actions{
      margin-bottom: 12px;
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
    .assignment-feedback, .exam-results{
      padding: 16px;
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
      margin-top: 12px;
    }
    .feedback-header, .result-header{
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .marks, .result-score{
      font-weight: 800;
      color: var(--accent-green);
    }
    .grade, .result-grade{
      font-weight: 800;
    }
    .feedback-text{
      color: var(--text-gray);
      font-size: 14px;
    }
    .result-percentage{
      font-weight: 800;
      font-size: 16px;
    }

    .attendance-overview{
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .attendance-card{
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 24px;
      text-align: center;
    }
    .attendance-percentage{
      font-size: 48px;
      font-weight: 900;
      color: var(--accent-green);
      margin-bottom: 8px;
    }
    .attendance-label{
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 16px;
    }
    .attendance-stats{
      display: flex;
      justify-content: center;
      gap: 24px;
    }
    .stat-item{
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .stat-label{
      color: var(--text-gray);
      font-size: 14px;
    }
    .stat-value{
      font-size: 20px;
      font-weight: 900;
    }
    .attendance-chart{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .chart-item{
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .chart-date{
      width: 100px;
      font-size: 14px;
      color: var(--text-gray);
    }
    .chart-bar{
      flex: 1;
      height: 24px;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      overflow: hidden;
    }
    .chart-fill{
      height: 100%;
      background: var(--accent-green);
      transition: width 0.3s;
    }
    .chart-percentage{
      width: 60px;
      text-align: right;
      font-weight: 700;
    }

    .notice-item{
      padding: 20px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
    }
    .notice-header{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .notice-title{
      font-size: 18px;
      font-weight: 900;
    }
    .notice-date{
      color: var(--text-gray);
      font-size: 14px;
    }
    .notice-type{
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: var(--accent-green);
      font-size: 12px;
      font-weight: 700;
      width: fit-content;
      margin-bottom: 12px;
    }
    .notice-content{
      color: var(--text-gray);
      line-height: 1.6;
    }

    .fees-overview{
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .fee-card{
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 24px;
    }
    .fee-header{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-gray);
    }
    .fee-header:last-child{
      border-bottom: none;
    }
    .fee-label{
      font-weight: 700;
      color: var(--text-gray);
    }
    .fee-amount{
      font-size: 20px;
      font-weight: 900;
    }
    .fee-amount.paid{
      color: var(--accent-green);
    }
    .fee-amount.pending{
      color: #ef4444;
    }
    .fee-status-badge{
      margin-top: 16px;
      padding: 10px 16px;
      border-radius: 8px;
      text-align: center;
      font-weight: 800;
    }
    .fee-status-badge.paid{
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #22c55e;
    }
    .fee-status-badge.pending{
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
    }
    .fee-receipts{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .receipt-item{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
    }
    .receipt-info{
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .receipt-date{
      color: var(--text-gray);
      font-size: 14px;
    }
    .receipt-amount{
      font-size: 18px;
      font-weight: 900;
    }

    .empty-state{
      text-align: center;
      padding: 40px 20px;
      color: var(--text-gray);
      font-weight: 700;
    }

    .enrollment-info{
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      padding: 16px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .info-item{
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-label{
      font-size: 12px;
      color: var(--text-gray);
      font-weight: 700;
      text-transform: uppercase;
    }
    .info-value{
      font-size: 18px;
      font-weight: 900;
      color: var(--accent-green);
    }

    @media (max-width: 768px){
      .nav{ padding: 0 20px; }
      .content{ padding: 18px 20px 16px; }
      .dashboard-content{ grid-template-columns: 1fr; }
      .subject-materials{ grid-template-columns: 1fr; }
      .attendance-stats{ flex-direction: column; gap: 12px; }
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  isDarkMode = true;
  activeTab: 'dashboard' | 'subjects' | 'assignments' | 'exams' | 'attendance' | 'notices' | 'fees' = 'dashboard';
  
  userName = 'student';
  userEmail = 'student@lms.com';
  userInitial = 's';
  isUserMenuOpen = false;
  profileImage = '';

  enrolledCourses = [
    { name: 'Mathematics', class: 'Class 10A' },
    { name: 'Physics', class: 'Class 10A' },
    { name: 'Chemistry', class: 'Class 10A' }
  ];

  upcomingExams = [
    { name: 'Math Test 1', date: '05/02/2026' },
    { name: 'Physics Midterm', date: '10/02/2026' }
  ];

  pendingAssignments = [
    { name: 'Math Assignment 1', dueDate: '03/02/2026' },
    { name: 'Physics Project', dueDate: '08/02/2026' }
  ];

  subjects = [
    {
      name: 'Mathematics',
      teacher: 'Mr. John Smith',
      materials: [
        { name: 'Chapter 1 Notes', type: 'pdf' },
        { name: 'Practice Problems', type: 'pdf' }
      ],
      videos: [
        { name: 'Algebra Basics', duration: '45 min' },
        { name: 'Geometry Introduction', duration: '30 min' }
      ]
    },
    {
      name: 'Physics',
      teacher: 'Ms. Jane Doe',
      materials: [
        { name: 'Mechanics Notes', type: 'pdf' }
      ],
      videos: [
        { name: 'Newton\'s Laws', duration: '50 min' }
      ]
    }
  ];

  assignments = [
    {
      id: 1,
      title: 'Math Assignment 1',
      subject: 'Mathematics',
      dueDate: '03/02/2026',
      description: 'Complete exercises 1-10 from Chapter 2',
      submitted: false
    },
    {
      id: 2,
      title: 'Physics Project',
      subject: 'Physics',
      dueDate: '08/02/2026',
      description: 'Create a project on motion',
      submitted: true,
      marks: 85,
      totalMarks: 100,
      grade: 'A',
      feedback: 'Excellent work! Good understanding of concepts.'
    }
  ];

  exams = [
    {
      id: 1,
      title: 'Math Test 1',
      subject: 'Mathematics',
      date: '05/02/2026',
      duration: '90 min',
      attempted: false
    },
    {
      id: 2,
      title: 'Physics Midterm',
      subject: 'Physics',
      date: '10/02/2026',
      duration: '120 min',
      attempted: true,
      result: {
        score: 78,
        totalMarks: 100,
        percentage: 78,
        grade: 'B+'
      }
    }
  ];

  attendancePercentage = 92;
  attendanceStats = {
    present: 46,
    absent: 4,
    total: 50
  };
  attendanceRecords = [
    { date: 'Jan 2026', percentage: 95 },
    { date: 'Feb 2026', percentage: 90 },
    { date: 'Mar 2026', percentage: 92 }
  ];

  notices = [
    {
      title: 'Class Test Notice',
      date: '30/01/2026',
      type: 'Class Announcement',
      message: 'There will be a class test next week. Please prepare accordingly.'
    },
    {
      title: 'Holiday Notice',
      date: '29/01/2026',
      type: 'School Announcement',
      message: 'School will be closed on 5th February for a public holiday.'
    }
  ];

  feeStatus = {
    totalAmount: 50000,
    paidAmount: 30000,
    pendingAmount: 20000,
    status: 'pending'
  };

  receipts = [
    { date: '15/01/2026', amount: 15000 },
    { date: '15/12/2025', amount: 15000 }
  ];

  // Student data
  studentData: Student | null = null;
  studentCourse: string = '';
  studentSection: string = '';
  studentRollNumber: string = '';
  studentCourseId: number | null = null;
  studentClassId: number | null = null;
  studentSectionId: number | null = null;

  constructor(
    private theme: ThemeService,
    private auth: AuthService,
    private router: Router,
    private profileService: ProfileService,
    private studentService: StudentService,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user?.name) this.userName = user.name;
    if (user?.email) this.userEmail = user.email;
    this.userInitial = (this.userName?.trim()?.[0] || 's').toLowerCase();

    this.theme.isDarkMode$.subscribe(v => (this.isDarkMode = v));
    
    // Load profile image
    if (this.userEmail) {
      this.loadProfileImage();
    }
    
    // Load student data
    if (user?.id) {
      this.loadStudentData(user.id);
    }
  }

  loadStudentData(userId: number): void {
    this.studentService.getStudentByUserId(userId).subscribe({
      next: (result) => {
        if (result.ok && result.student) {
          this.studentData = result.student;
          this.studentCourse = result.student.classCourse || '';
          this.studentSection = result.student.classSection || '';
          this.studentRollNumber = result.student.rollNumber || '';
          this.studentCourseId = result.student.courseId || null;
          this.studentClassId = result.student.classId || null;
          this.studentSectionId = result.student.sectionId || null;
          
          // Update enrolled courses in dashboard
          if (this.studentCourse) {
            this.enrolledCourses = [
              { name: this.studentCourse, class: this.studentSection || 'N/A' }
            ];
          }
          
          // Load course name if courseId exists
          if (this.studentCourseId && result.student.entityId) {
            this.loadCourseName(result.student.entityId, this.studentCourseId);
          }
          
          // Load section name if sectionId exists
          if (this.studentSectionId) {
            this.loadSectionName(this.studentSectionId);
          }
        }
      },
      error: (err) => {
        console.error('Error loading student data:', err);
      }
    });
  }

  loadCourseName(entityId: number, courseId: number): void {
    this.subjectService.getCoursesByEntity(entityId).subscribe({
      next: (result) => {
        if (result.ok && result.data) {
          const course = result.data.find((c: Course) => c.id === courseId);
          if (course) {
            this.studentCourse = course.name;
            this.enrolledCourses = [
              { name: course.name, class: this.studentSection || 'N/A' }
            ];
          }
        }
      },
      error: (err) => {
        console.error('Error loading course name:', err);
      }
    });
  }

  loadSectionName(sectionId: number): void {
    if (this.studentClassId) {
      this.subjectService.getSectionsByClass(this.studentClassId).subscribe({
        next: (result) => {
          if (result.ok && result.data) {
            const section = result.data.find((s: Section) => s.id === sectionId);
            if (section) {
              this.studentSection = section.name;
              if (this.studentCourse) {
                this.enrolledCourses = [
                  { name: this.studentCourse, class: section.name }
                ];
              }
            }
          }
        },
        error: (err) => {
          console.error('Error loading section name:', err);
        }
      });
    }
  }

  loadProfileImage(): void {
    this.profileService.getProfile(this.userEmail).subscribe(result => {
      if (result.ok && result.profile.profileImage) {
        this.profileImage = result.profile.profileImage;
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
    this.router.navigate(['/student/profile']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  downloadMaterial(material: any): void {
    console.log('Download material:', material);
    // TODO: Implement download functionality
  }

  watchVideo(video: any): void {
    console.log('Watch video:', video);
    // TODO: Implement video player
  }

  uploadSubmission(assignment: any): void {
    console.log('Upload submission for:', assignment);
    // TODO: Implement upload functionality
  }

  viewFeedback(assignment: any): void {
    console.log('View feedback for:', assignment);
    // TODO: Implement view feedback
  }

  attemptExam(exam: any): void {
    console.log('Attempt exam:', exam);
    // TODO: Implement exam attempt
  }

  viewResults(exam: any): void {
    console.log('View results for:', exam);
    // TODO: Implement view results
  }

  downloadReceipt(receipt: any): void {
    console.log('Download receipt:', receipt);
    // TODO: Implement download receipt
  }
}
