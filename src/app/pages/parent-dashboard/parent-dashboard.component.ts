import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  template: `
    <div class="page">
      <!-- Top Nav -->
      <header class="nav">
        <div class="nav-left">
          <a class="brand" routerLink="/parent/dashboard">
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
              <div class="user-badge">PARENT</div>
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
          <button class="nav-tab" [class.active]="activeTab === 'overview'" (click)="activeTab = 'overview'">
            <span class="tab-emoji">👨‍🎓</span>
            <span>Child Overview</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'performance'" (click)="activeTab = 'performance'">
            <span class="tab-emoji">📊</span>
            <span>Performance</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'attendance'" (click)="activeTab = 'attendance'">
            <span class="tab-emoji">📅</span>
            <span>Attendance</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'assignments'" (click)="activeTab = 'assignments'">
            <span class="tab-emoji">📝</span>
            <span>Assignments</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'notices'" (click)="activeTab = 'notices'">
            <span class="tab-emoji">📢</span>
            <span>Notices</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'fees'" (click)="activeTab = 'fees'">
            <span class="tab-emoji">💰</span>
            <span>Fees</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'communication'" (click)="activeTab = 'communication'">
            <span class="tab-emoji">📞</span>
            <span>Communication</span>
          </button>
        </div>

        <!-- Child Overview Tab -->
        <div class="tab-content" *ngIf="activeTab === 'overview'">
          <div class="section-header">
            <h2 class="section-title">👨‍🎓 Child Overview</h2>
            <p class="section-subtitle">Student profile • Class & section</p>
            </div>
          <div class="content-card">
            <div class="child-profile">
              <div class="profile-header">
                <div class="child-avatar">
                  <span>{{ (childInfo.name && childInfo.name.charAt(0)) || 'S' }}</span>
          </div>
                <div class="profile-info">
                  <div class="child-name">{{ childInfo.name || 'Student Name' }}</div>
                  <div class="child-id">Student ID: {{ childInfo.studentId || 'N/A' }}</div>
            </div>
            </div>
              <div class="profile-details">
                <div class="detail-row">
                  <div class="detail-label">Class & Section</div>
                  <div class="detail-value">{{ childInfo.classSection || 'Class 10A' }}</div>
            </div>
                <div class="detail-row">
                  <div class="detail-label">Roll Number</div>
                  <div class="detail-value">{{ childInfo.rollNumber || 'N/A' }}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Date of Birth</div>
                  <div class="detail-value">{{ childInfo.dob || 'N/A' }}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Parent/Guardian</div>
                  <div class="detail-value">{{ userName }}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Contact</div>
                  <div class="detail-value">{{ childInfo.contact || 'N/A' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Tab -->
        <div class="tab-content" *ngIf="activeTab === 'performance'">
          <div class="section-header">
            <h2 class="section-title">📊 Performance</h2>
            <p class="section-subtitle">Marks & results • Progress report</p>
            </div>
          <div class="content-card">
            <div class="performance-overview">
              <div class="performance-stats">
                <div class="stat-card">
                  <div class="stat-label">Overall Grade</div>
                  <div class="stat-value grade-a">{{ performance.overallGrade || 'A' }}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Average Marks</div>
                  <div class="stat-value">{{ performance.averageMarks || '85' }}%</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Total Subjects</div>
                  <div class="stat-value">{{ performance.totalSubjects || '5' }}</div>
                </div>
              </div>
              <div class="marks-table">
                <div class="table-header">
                  <div class="table-col">Subject</div>
                  <div class="table-col">Marks</div>
                  <div class="table-col">Grade</div>
                  <div class="table-col">Status</div>
                </div>
                <div class="table-row" *ngFor="let subject of performance.subjects">
                  <div class="table-col">{{ subject.name }}</div>
                  <div class="table-col">{{ subject.marks }}/{{ subject.totalMarks }}</div>
                  <div class="table-col grade-badge" [class.grade-a]="subject.grade === 'A'" [class.grade-b]="subject.grade === 'B'" [class.grade-c]="subject.grade === 'C'">{{ subject.grade }}</div>
                  <div class="table-col">
                    <span class="status-badge" [class.passed]="subject.status === 'Passed'">{{ subject.status }}</span>
                  </div>
                </div>
              </div>
              <div class="progress-section">
                <div class="section-label">Progress Report</div>
                <div class="progress-item" *ngFor="let report of progressReports">
                  <div class="progress-header">
                    <div class="progress-title">{{ report.title }}</div>
                    <div class="progress-date">{{ report.date }}</div>
                  </div>
                  <div class="progress-content">{{ report.content }}</div>
                  <button class="btn-download" (click)="downloadReport(report)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M7 10L12 5L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
                    Download Report
            </button>
                </div>
              </div>
            </div>
          </div>
          </div>

        <!-- Attendance Tab -->
        <div class="tab-content" *ngIf="activeTab === 'attendance'">
          <div class="section-header">
            <h2 class="section-title">📅 Attendance</h2>
            <p class="section-subtitle">Daily / monthly attendance</p>
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
              <div class="daily-attendance">
                <div class="section-label">Daily Attendance</div>
                <div class="attendance-list">
                  <div class="attendance-item" *ngFor="let day of dailyAttendance">
                    <div class="day-date">{{ day.date }}</div>
                    <div class="day-status" [class.present]="day.status === 'Present'" [class.absent]="day.status === 'Absent'">
                      {{ day.status }}
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
            <p class="section-subtitle">Given & submitted status</p>
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

        <!-- Notices Tab -->
        <div class="tab-content" *ngIf="activeTab === 'notices'">
          <div class="section-header">
            <h2 class="section-title">📢 Notices</h2>
            <p class="section-subtitle">School announcements</p>
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
            <p class="section-subtitle">Paid / due fees • Receipt download</p>
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

        <!-- Communication Tab -->
        <div class="tab-content" *ngIf="activeTab === 'communication'">
          <div class="section-header">
            <h2 class="section-title">📞 Communication</h2>
            <p class="section-subtitle">Teacher messages • School notices</p>
                </div>
          <div class="content-card">
            <div class="communication-section">
              <div class="comm-section">
                <div class="section-label">Teacher Messages</div>
                <div class="messages-list">
                  <div class="message-item" *ngFor="let message of teacherMessages">
                    <div class="message-header">
                      <div class="message-from">From: {{ message.from }}</div>
                      <div class="message-date">{{ message.date }}</div>
                  </div>
                    <div class="message-subject">{{ message.subject }}</div>
                    <div class="message-content">{{ message.content }}</div>
                  </div>
                  <div *ngIf="teacherMessages.length === 0" class="empty-text">No messages available</div>
                  </div>
                  </div>
              <div class="comm-section">
                <div class="section-label">School Notices</div>
                <div class="notices-list">
                  <div class="notice-item" *ngFor="let notice of schoolNotices">
                    <div class="notice-header">
                      <div class="notice-title">{{ notice.title }}</div>
                      <div class="notice-date">{{ notice.date }}</div>
                </div>
                    <div class="notice-content">{{ notice.message }}</div>
              </div>
                  <div *ngIf="schoolNotices.length === 0" class="empty-text">No notices available</div>
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

    .content-card{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 24px;
    }

    .child-profile{
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .profile-header{
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .child-avatar{
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--secondary-bg);
      border: 2px solid var(--border-gray);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 900;
      color: var(--text-white);
    }
    .profile-info{
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .child-name{
      font-size: 24px;
      font-weight: 900;
    }
    .child-id{
      color: var(--text-gray);
      font-size: 14px;
    }
    .profile-details{
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .detail-row{
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .detail-label{
      color: var(--text-gray);
      font-size: 14px;
      font-weight: 600;
    }
    .detail-value{
      font-size: 16px;
      font-weight: 800;
    }

    .performance-overview{
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .performance-stats{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .stat-card{
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    .stat-label{
      color: var(--text-gray);
      font-size: 14px;
      margin-bottom: 8px;
    }
    .stat-value{
      font-size: 32px;
      font-weight: 900;
    }
    .stat-value.grade-a{
      color: var(--accent-green);
    }
    .marks-table{
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .table-header, .table-row{
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 16px;
      padding: 12px;
      border-radius: 8px;
    }
    .table-header{
      background: rgba(255,255,255,0.02);
      font-weight: 800;
      border-bottom: 1px solid var(--border-gray);
    }
    .table-row{
      background: rgba(255,255,255,0.01);
    }
    .table-col{
      display: flex;
      align-items: center;
    }
    .grade-badge{
      padding: 4px 12px;
      border-radius: 999px;
      font-weight: 800;
      width: fit-content;
    }
    .grade-badge.grade-a{
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #22c55e;
    }
    .grade-badge.grade-b{
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.25);
      color: #3b82f6;
    }
    .grade-badge.grade-c{
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
    }
    .status-badge{
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .status-badge.passed{
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #22c55e;
    }
    .progress-section{
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .progress-item{
      padding: 16px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
    }
    .progress-header{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .progress-title{
      font-weight: 800;
      font-size: 16px;
    }
    .progress-date{
      color: var(--text-gray);
      font-size: 14px;
    }
    .progress-content{
      color: var(--text-gray);
      margin-bottom: 12px;
      line-height: 1.6;
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
    .daily-attendance{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .attendance-list{
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .attendance-item{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
    }
    .day-date{
      font-weight: 700;
    }
    .day-status{
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .day-status.present{
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #22c55e;
    }
    .day-status.absent{
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
    }

    .assignments-list{
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .assignment-card{
      padding: 20px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
    }
    .assignment-header{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .assignment-title{
      font-size: 18px;
      font-weight: 900;
      margin-bottom: 4px;
    }
    .assignment-meta{
      color: var(--text-gray);
      font-size: 14px;
    }
    .assignment-status{
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .assignment-status.submitted{
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #22c55e;
    }
    .assignment-status.pending{
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
    }
    .assignment-description{
      color: var(--text-gray);
      margin-bottom: 12px;
    }
    .assignment-feedback{
      padding: 16px;
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
      margin-top: 12px;
    }
    .feedback-header{
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .marks{
      font-weight: 800;
      color: var(--accent-green);
    }
    .grade{
      font-weight: 800;
    }
    .feedback-text{
      color: var(--text-gray);
      font-size: 14px;
    }

    .notices-list{
      display: flex;
      flex-direction: column;
      gap: 16px;
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

    .communication-section{
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .comm-section{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .section-label{
      font-weight: 800;
      color: var(--text-white);
      margin-bottom: 8px;
    }
    .messages-list{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .message-item{
      padding: 16px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
    }
    .message-header{
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .message-from{
      font-weight: 800;
      color: var(--accent-green);
    }
    .message-date{
      color: var(--text-gray);
      font-size: 14px;
    }
    .message-subject{
      font-weight: 800;
      margin-bottom: 8px;
    }
    .message-content{
      color: var(--text-gray);
      line-height: 1.6;
    }

    .btn-download{
      padding: 8px 16px;
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
    .btn-download:hover{
      border-color: var(--accent-green);
    }

    .empty-state, .empty-text{
      text-align: center;
      padding: 40px 20px;
      color: var(--text-gray);
      font-weight: 700;
    }

    @media (max-width: 768px){
      .nav{ padding: 0 20px; }
      .content{ padding: 18px 20px 16px; }
      .performance-stats{ grid-template-columns: 1fr; }
      .profile-details{ grid-template-columns: 1fr; }
      .table-header, .table-row{ grid-template-columns: 1fr; }
    }
  `]
})
export class ParentDashboardComponent implements OnInit {
  isDarkMode = true;
  activeTab: 'overview' | 'performance' | 'attendance' | 'assignments' | 'notices' | 'fees' | 'communication' = 'overview';
  
  userName = 'parent';
  userEmail = 'parent@lms.com';
  userInitial = 'p';
  isUserMenuOpen = false;
  profileImage = '';

  childInfo = {
    name: 'Student Name',
    studentId: 'STU001',
    classSection: 'Class 10A',
    rollNumber: '25',
    dob: '01/01/2010',
    contact: '+91 9876543210'
  };

  performance = {
    overallGrade: 'A',
    averageMarks: '85',
    totalSubjects: '5',
    subjects: [
      { name: 'Mathematics', marks: 88, totalMarks: 100, grade: 'A', status: 'Passed' },
      { name: 'Physics', marks: 82, totalMarks: 100, grade: 'B', status: 'Passed' },
      { name: 'Chemistry', marks: 90, totalMarks: 100, grade: 'A', status: 'Passed' },
      { name: 'English', marks: 85, totalMarks: 100, grade: 'A', status: 'Passed' },
      { name: 'Computer Science', marks: 80, totalMarks: 100, grade: 'B', status: 'Passed' }
    ]
  };

  progressReports = [
    {
      title: 'Mid-term Progress Report',
      date: '15/01/2026',
      content: 'Student is performing well in all subjects. Good attendance and participation in class activities.'
    },
    {
      title: 'Quarterly Report',
      date: '01/12/2025',
      content: 'Consistent performance with improvement in Mathematics and Physics.'
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
  dailyAttendance = [
    { date: '01/02/2026', status: 'Present' },
    { date: '02/02/2026', status: 'Present' },
    { date: '03/02/2026', status: 'Absent' },
    { date: '04/02/2026', status: 'Present' },
    { date: '05/02/2026', status: 'Present' }
  ];

  assignments = [
    {
      id: 1,
      title: 'Math Assignment 1',
      subject: 'Mathematics',
      dueDate: '03/02/2026',
      description: 'Complete exercises 1-10 from Chapter 2',
      submitted: true,
      marks: 85,
      totalMarks: 100,
      grade: 'A',
      feedback: 'Excellent work! Good understanding of concepts.'
    },
    {
      id: 2,
      title: 'Physics Project',
      subject: 'Physics',
      dueDate: '08/02/2026',
      description: 'Create a project on motion',
      submitted: false
    }
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

  teacherMessages = [
    {
      from: 'Mr. John Smith (Mathematics)',
      date: '02/02/2026',
      subject: 'Assignment Submission',
      content: 'Your child has submitted the assignment on time. Good work!'
    },
    {
      from: 'Ms. Jane Doe (Physics)',
      date: '01/02/2026',
      subject: 'Class Participation',
      content: 'Your child is actively participating in class discussions. Keep it up!'
    }
  ];

  schoolNotices = [
    {
      title: 'Parent-Teacher Meeting',
      date: '10/02/2026',
      message: 'Parent-teacher meeting scheduled for 15th February. Please attend.'
    }
  ];

  constructor(
    private theme: ThemeService,
    private auth: AuthService,
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user?.name) this.userName = user.name;
    if (user?.email) this.userEmail = user.email;
    this.userInitial = (this.userName?.trim()?.[0] || 'p').toLowerCase();

    this.theme.isDarkMode$.subscribe(v => (this.isDarkMode = v));

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
    this.router.navigate(['/parent/profile']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  downloadReport(report: any): void {
    console.log('Download report:', report);
    // TODO: Implement download functionality
  }

  downloadReceipt(receipt: any): void {
    console.log('Download receipt:', receipt);
    // TODO: Implement download receipt
  }
}
