import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { StudentService, Student } from '../../services/student.service';
import { SubjectService, Course, ClassEntity, Section, Subject } from '../../services/subject.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { SubjectContentService, SubjectContent } from '../../services/subject-content.service';
import { AssignmentService } from '../../services/assignment.service';
import { StudentAttendanceService } from '../../services/student-attendance.service';
import { NoticeService } from '../../services/notice.service';
import { AnnouncementService, Announcement } from '../../services/announcement.service';
import { ExamService } from '../../services/exam.service';

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
          <button class="nav-tab" [class.active]="activeTab === 'assignments'" (click)="onAssignmentsTabClick()">
            <span class="tab-emoji">📝</span>
            <span>Assignments</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'exams'" (click)="onExamsTabClick()">
            <span class="tab-emoji">🧪</span>
            <span>Exams</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'attendance'" (click)="activeTab = 'attendance'">
            <span class="tab-emoji">📅</span>
            <span>Attendance</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'notices'" (click)="onNoticesTabClick()">
            <span class="tab-emoji">📋</span>
            <span>Notices</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'announcements'" (click)="onAnnouncementsTabClick()">
            <span class="tab-emoji">📢</span>
            <span>Announcements</span>
          </button>
          <button class="nav-tab" [class.active]="activeTab === 'fees'" (click)="activeTab = 'fees'">
            <span class="tab-emoji">💰</span>
            <span>Fees</span>
          </button>
        </div>

        <!-- My Dashboard Tab -->
        <div class="tab-content" *ngIf="activeTab === 'dashboard'">
          <!-- Loading State -->
          <div class="content-card" *ngIf="isLoadingStudentData" style="margin-bottom: 20px;">
            <div class="empty-text">Loading student data...</div>
          </div>
          
          <!-- Dashboard Header Section -->
          <div class="dashboard-header-section" *ngIf="!isLoadingStudentData">
            <div class="dashboard-header-content">
              <div class="dashboard-header-left">
                <h1 class="dashboard-welcome">Welcome back, {{ (studentData?.firstName || '') + ' ' + (studentData?.lastName || '') || userName }}!</h1>
                <p class="dashboard-subtitle">Your academic dashboard and learning overview</p>
                <div class="dashboard-kpis">
                  <div class="kpi-item">
                    <span class="kpi-bullet"></span>
                    <span class="kpi-text">{{ enrolledCourses.length || 0 }} Enrolled {{ enrolledCourses.length === 1 ? 'Course' : 'Courses' }}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-bullet"></span>
                    <span class="kpi-text">{{ pendingAssignments.length || 0 }} Pending {{ pendingAssignments.length === 1 ? 'Assignment' : 'Assignments' }}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-bullet"></span>
                    <span class="kpi-text">{{ attendancePercentage || 0 }}% Attendance</span>
                  </div>
                </div>
              </div>
              <div class="dashboard-header-right">
                <div class="dashboard-time-label">Current Time</div>
                <div class="dashboard-time">{{ currentTime }}</div>
                <div class="dashboard-date">{{ currentDate }}</div>
              </div>
            </div>
          </div>
          
          <!-- Main Dashboard Content -->
          <div class="dashboard-main-content" *ngIf="!isLoadingStudentData">
            <!-- Two Column Layout for Quick Actions and Performance -->
            <div class="dashboard-sections-layout">
              <!-- Quick Actions Section (Left) -->
              <div class="dashboard-section">
                <div class="dashboard-section-header">
                  <span class="section-icon">⚡</span>
                  <div>
                    <h3 class="dashboard-section-title">Quick Actions</h3>
                    <p class="dashboard-section-subtitle">Frequently used student tools</p>
                  </div>
                </div>
                <div class="quick-actions-grid">
                  <div class="quick-action-card" (click)="activeTab = 'assignments'">
                    <div class="action-icon" style="background: rgba(16, 185, 129, 0.15);">📝</div>
                    <div class="action-title">View Assignments</div>
                    <div class="action-subtitle">Check your tasks</div>
                  </div>
                  <div class="quick-action-card" (click)="activeTab = 'attendance'">
                    <div class="action-icon" style="background: rgba(59, 130, 246, 0.15);">📅</div>
                    <div class="action-title">Attendance</div>
                    <div class="action-subtitle">View attendance records</div>
                  </div>
                  <div class="quick-action-card" (click)="activeTab = 'subjects'">
                    <div class="action-icon" style="background: rgba(139, 92, 246, 0.15);">📚</div>
                    <div class="action-title">Study Materials</div>
                    <div class="action-subtitle">Access learning resources</div>
                  </div>
                  <div class="quick-action-card" (click)="activeTab = 'exams'">
                    <div class="action-icon" style="background: rgba(245, 158, 11, 0.15);">🧪</div>
                    <div class="action-title">Exams</div>
                    <div class="action-subtitle">View exam schedule</div>
                  </div>
                  <div class="quick-action-card" (click)="activeTab = 'notices'">
                    <div class="action-icon" style="background: rgba(239, 68, 68, 0.15);">📢</div>
                    <div class="action-title">Notices</div>
                    <div class="action-subtitle">Check announcements</div>
                  </div>
                  <div class="quick-action-card" (click)="goProfile()">
                    <div class="action-icon" style="background: rgba(107, 114, 128, 0.15);">👤</div>
                    <div class="action-title">My Profile</div>
                    <div class="action-subtitle">Update your details</div>
                  </div>
                </div>
              </div>
              
              <!-- Academic Performance Section (Right) -->
              <div class="dashboard-section">
                <div class="dashboard-section-header">
                  <span class="section-icon">📊</span>
                  <div>
                    <h3 class="dashboard-section-title">Academic Performance</h3>
                    <p class="dashboard-section-subtitle">Your progress overview</p>
                  </div>
                </div>
                <div class="performance-metrics">
                  <div class="metric-item">
                    <div class="metric-label">Attendance</div>
                    <div class="metric-bar-container">
                      <div class="metric-bar" [style.width.%]="attendancePercentage || 0" [class.metric-bar-good]="(attendancePercentage || 0) >= 75" [class.metric-bar-warning]="(attendancePercentage || 0) >= 50 && (attendancePercentage || 0) < 75" [class.metric-bar-danger]="(attendancePercentage || 0) < 50"></div>
                    </div>
                    <div class="metric-value">{{ attendancePercentage || 0 }}%</div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">Assignments Completed</div>
                    <div class="metric-bar-container">
                      <div class="metric-bar" [style.width.%]="getAssignmentsCompletionPercentage()" [class.metric-bar-good]="getAssignmentsCompletionPercentage() >= 75" [class.metric-bar-warning]="getAssignmentsCompletionPercentage() >= 50 && getAssignmentsCompletionPercentage() < 75" [class.metric-bar-danger]="getAssignmentsCompletionPercentage() < 50"></div>
                    </div>
                    <div class="metric-value">{{ getAssignmentsCompletionPercentage() }}%</div>
                  </div>
                  <div class="metric-item">
                    <div class="metric-label">Upcoming Exams</div>
                    <div class="metric-bar-container">
                      <div class="metric-bar metric-bar-info" [style.width.%]="getExamsProgressPercentage()"></div>
                    </div>
                    <div class="metric-value">{{ upcomingExams.length || 0 }} Scheduled</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Two Column Layout for Details -->
            <div class="dashboard-layout" *ngIf="!isLoadingStudentData">
            <!-- Left Side: My Details -->
            <div class="dashboard-left">
              <div class="content-card" *ngIf="studentData">
                <div class="section-header" style="margin-bottom: 20px;">
                  <h3 class="section-title" style="font-size: 20px;">👤 My Details</h3>
                </div>
                <div class="attendance-summary-table student-details-table">
                  <div class="summary-table-header student-details-header">
                    <span>Field</span>
                    <span>Value</span>
                  </div>
                  <div class="summary-table-row student-details-row">
                    <span class="summary-name">Full Name</span>
                    <span class="summary-value">{{ (studentData.firstName || '') + ' ' + (studentData.lastName || '') }}</span>
                  </div>
                  <div class="summary-table-row student-details-row">
                    <span class="summary-name">Email</span>
                    <span class="summary-value">{{ studentData.email || userEmail || 'N/A' }}</span>
                  </div>
                  <div class="summary-table-row student-details-row" *ngIf="studentData.phone">
                    <span class="summary-name">Phone</span>
                    <span class="summary-value">{{ studentData.phone }}</span>
                  </div>
                  <div class="summary-table-row student-details-row" *ngIf="studentData.gender">
                    <span class="summary-name">Gender</span>
                    <span class="summary-value">{{ studentData.gender }}</span>
                  </div>
                  <div class="summary-table-row student-details-row" *ngIf="studentData.address">
                    <span class="summary-name">Address</span>
                    <span class="summary-value">{{ studentData.address }}</span>
                  </div>
                  <div class="summary-table-row student-details-row">
                    <span class="summary-name">Roll Number</span>
                    <span class="summary-value">{{ studentData.rollNumber || studentRollNumber || 'N/A' }}</span>
                  </div>
                  <div class="summary-table-row student-details-row">
                    <span class="summary-name">Course</span>
                    <span class="summary-value">{{ studentCourse || studentData.classCourse || 'N/A' }}</span>
                  </div>
                  <div class="summary-table-row student-details-row">
                    <span class="summary-name">Class</span>
                    <span class="summary-value">{{ studentClass || 'N/A' }}</span>
                  </div>
                  <div class="summary-table-row student-details-row">
                    <span class="summary-name">Section</span>
                    <span class="summary-value">{{ studentSection || studentData.classSection || 'N/A' }}</span>
                  </div>
                  <div class="summary-table-row student-details-row" *ngIf="studentData.academicYear">
                    <span class="summary-name">Academic Year</span>
                    <span class="summary-value">{{ studentData.academicYear }}</span>
                  </div>
                  <div class="summary-table-row student-details-row" *ngIf="studentData.admissionDate">
                    <span class="summary-name">Admission Date</span>
                    <span class="summary-value">{{ studentData.admissionDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="summary-table-row student-details-row" *ngIf="studentData.studentStatus">
                    <span class="summary-name">Status</span>
                    <span class="summary-value">
                      <span class="status-badge" [class.status-active]="studentData.studentStatus === 'active'" [class.status-inactive]="studentData.studentStatus !== 'active'">
                        {{ studentData.studentStatus }}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Right Side: Dashboard Cards -->
            <div class="dashboard-right">
            <div class="content-card">
              <div class="section-header" style="margin-bottom: 20px;">
                <h3 class="section-title" style="font-size: 20px;">📚 Enrolled course / class</h3>
                </div>
              <div class="attendance-summary-table student-details-table" *ngIf="enrolledCourses.length > 0">
                <div class="summary-table-header student-details-header">
                  <span>Field</span>
                  <span>Value</span>
                </div>
                <div class="summary-table-row student-details-row" *ngIf="enrolledCourses[0]">
                  <span class="summary-name">Course</span>
                  <span class="summary-value">{{ enrolledCourses[0].name || 'N/A' }}</span>
                </div>
                <div class="summary-table-row student-details-row" *ngIf="enrolledCourses[0]">
                  <span class="summary-name">Class</span>
                  <span class="summary-value">{{ enrolledCourses[0].class || 'N/A' }}</span>
                </div>
              </div>
              <div *ngIf="enrolledCourses.length === 0" class="empty-text" style="padding: 20px; text-align: center;">
                {{ studentData ? 'No enrolled courses yet' : 'Loading...' }}
              </div>
            </div>
            <div class="content-card">
              <div class="section-header" style="margin-bottom: 20px;">
                <h3 class="section-title" style="font-size: 20px;">📅 Upcoming exams</h3>
              </div>
              <div class="attendance-summary-table exams-table" *ngIf="upcomingExams.length > 0">
                <div class="summary-table-header exams-table-header">
                  <span>Exam Name</span>
                  <span>Date</span>
                </div>
                <div class="summary-table-row exams-table-row" *ngFor="let exam of upcomingExams">
                  <span class="exam-name-cell">{{ exam.name }}</span>
                  <span class="exam-date-cell">{{ exam.date }}</span>
                </div>
              </div>
              <div *ngIf="upcomingExams.length === 0" class="empty-text" style="padding: 20px; text-align: center;">
                No upcoming exams
              </div>
            </div>
            <div class="content-card">
              <div class="section-header" style="margin-bottom: 20px;">
                <h3 class="section-title" style="font-size: 20px;">📋 Pending assignments</h3>
              </div>
              <div class="attendance-summary-table assignments-table" *ngIf="pendingAssignments.length > 0">
                <div class="summary-table-header assignments-table-header">
                  <span>Assignment Name</span>
                  <span>Due Date</span>
                </div>
                <div class="summary-table-row assignments-table-row" *ngFor="let assignment of pendingAssignments">
                  <span class="assignment-name-cell">{{ assignment.name }}</span>
                  <span class="assignment-due-cell">Due: {{ assignment.dueDate }}</span>
                </div>
              </div>
              <div *ngIf="pendingAssignments.length === 0" class="empty-text" style="padding: 20px; text-align: center;">
                No pending assignments
              </div>
            </div>
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
              <div *ngIf="isLoadingStudentContents" class="empty-text">Loading materials...</div>
              <div class="subject-item" *ngFor="let subject of studentSubjectItems">
                <div class="subject-header">
                  <div class="subject-name">{{ subject.name }}</div>
                  </div>
                <div class="subject-materials">
                  <div class="material-section">
                    <div class="section-label">Study Material</div>
                    <div class="material-list">
                      <div class="material-item" *ngFor="let material of subject.materials">
                        <div class="material-icon">📄</div>
                        <div class="material-name">{{ material.name }}</div>
                        <div class="material-actions">
                          <button class="btn-view" (click)="viewMaterial(material)">View</button>
                        <button class="btn-download" (click)="downloadMaterial(material)">Download</button>
                        </div>
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
                        </div>
                        <button class="btn-watch" (click)="viewMaterial(video)">View</button>
                      </div>
                      <div *ngIf="subject.videos.length === 0" class="empty-text">No recorded videos available</div>
                    </div>
                  </div>
                </div>
              </div>
              <div *ngIf="!isLoadingStudentContents && studentSubjectItems.length === 0" class="empty-text">
                No study material available
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
            <div *ngIf="isLoadingAssignments" class="empty-text">Loading assignments...</div>
            <div *ngIf="assignments.length === 0 && !isLoadingAssignments" class="empty-state">
              <p>No assignments available</p>
                  </div>
            <div *ngIf="!isLoadingAssignments && assignments.length > 0" class="attendance-summary-table">
              <div class="summary-table-header">
                <span>Title</span>
                <span>Subject</span>
                <span>Due Date</span>
                <span>Status</span>
                <span>Max Marks</span>
                <span>Submitted</span>
                <span>Actions</span>
                  </div>
              <div class="summary-table-row" *ngFor="let assignment of assignments">
                <span class="summary-name">{{ assignment.title }}</span>
                <span>{{ getSubjectName(assignment.subjectId) }}</span>
                <span>
                  {{ formatDate(assignment.extendedDueDate || assignment.dueDate) }}
                  <span *ngIf="assignment.extendedDueDate" class="extended-badge" style="margin-left: 8px; padding: 2px 6px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 4px; color: #f59e0b; font-size: 10px; font-weight: 700;">Extended</span>
                </span>
                <span>
                  <span class="status-badge" [ngClass]="getStatusClass(getAssignmentStatus(assignment))">
                    {{ getAssignmentStatus(assignment) }}
                  </span>
                </span>
                <span>{{ assignment.maxMarks || 'N/A' }}</span>
                <span>
                  <span *ngIf="assignment.submittedAt">{{ formatDateTime(assignment.submittedAt) }}</span>
                  <span *ngIf="!assignment.submittedAt" style="color: var(--text-gray);">Not submitted</span>
                  <span *ngIf="assignment.isLate" class="late-badge" style="margin-left: 8px; padding: 2px 6px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px; color: #ef4444; font-size: 10px; font-weight: 700;">Late</span>
                </span>
                <span style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
                  <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;" (click)="viewAssignmentDetails(assignment)">View Details</button>
                  <button class="btn-primary" *ngIf="assignment.submissionStatus === 'not_submitted'" style="padding: 6px 12px; font-size: 12px;" (click)="uploadSubmission(assignment)">
                    Submit
                      </button>
                  <button class="btn-primary" *ngIf="assignment.submissionStatus !== 'not_submitted' && assignment.allowResubmit" style="padding: 6px 12px; font-size: 12px;" (click)="uploadSubmission(assignment)">
                    Re-submit
                  </button>
                  <button class="btn-secondary" *ngIf="assignment.marks !== null && assignment.marks !== undefined" style="padding: 6px 12px; font-size: 12px;" (click)="viewFeedback(assignment)">
                    View Evaluation
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Assignments Tab - Old Card Layout (Hidden) -->
        <div class="tab-content" *ngIf="false && activeTab === 'assignments'">
          <div class="section-header">
            <h2 class="section-title">📝 Assignments</h2>
            <p class="section-subtitle">Assignment list • Upload submission • Marks & feedback</p>
          </div>
          <div class="content-card">
            <div *ngIf="isLoadingAssignments" class="empty-text">Loading assignments...</div>
            <div class="assignments-list" *ngIf="!isLoadingAssignments">
              <div class="assignment-card" *ngFor="let assignment of assignments">
                <div class="assignment-header">
                  <div>
                    <div class="assignment-title">{{ assignment.title }}</div>
                    <div class="assignment-meta">
                      {{ getSubjectName(assignment.subjectId) }} • 
                      Due: {{ formatDate(assignment.extendedDueDate || assignment.dueDate) }}
                      <span *ngIf="assignment.extendedDueDate" class="extended-badge">Extended</span>
                  </div>
                  </div>
                  <div class="assignment-status" [ngClass]="getStatusClass(getAssignmentStatus(assignment))">
                    {{ getAssignmentStatus(assignment) }}
                </div>
                </div>
                <div class="assignment-description" *ngIf="assignment.description">{{ assignment.description }}</div>
                <div class="assignment-info">
                  <div *ngIf="assignment.maxMarks" class="info-item">
                    <span class="info-label">Max Marks:</span>
                    <span class="info-value">{{ assignment.maxMarks }}</span>
                  </div>
                  <div *ngIf="assignment.submittedAt" class="info-item">
                    <span class="info-label">Submitted:</span>
                    <span class="info-value">{{ formatDateTime(assignment.submittedAt) }}</span>
                    <span *ngIf="assignment.isLate" class="late-badge">Late</span>
                  </div>
                </div>
                <div class="assignment-actions">
                  <button class="btn-secondary" (click)="viewAssignmentDetails(assignment)">View Details</button>
                  <button class="btn-primary" *ngIf="assignment.submissionStatus === 'not_submitted'" (click)="uploadSubmission(assignment)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M7 10L12 5L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M12 5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    Submit Assignment
                      </button>
                  <button class="btn-primary" *ngIf="assignment.submissionStatus !== 'not_submitted' && assignment.allowResubmit" (click)="uploadSubmission(assignment)">
                    Re-submit
                  </button>
                  <button class="btn-secondary" *ngIf="assignment.marks !== null && assignment.marks !== undefined" (click)="viewFeedback(assignment)">
                    View Evaluation
                  </button>
                    </div>
                <div class="assignment-feedback" *ngIf="assignment.marks !== null && assignment.marks !== undefined">
                  <div class="feedback-header">
                    <span class="marks">Marks: {{ assignment.marks }}/{{ assignment.maxMarks || 'N/A' }}</span>
                  </div>
                  <div class="feedback-text" *ngIf="assignment.feedback">
                    <strong>Feedback:</strong> {{ assignment.feedback }}
                  </div>
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
              <div *ngIf="isLoadingExams" class="empty-state"><p>Loading exams...</p></div>
              <div class="exam-card" *ngFor="let exam of exams">
                <div class="exam-header">
                  <div>
                    <div class="exam-title">{{ exam.name }}</div>
                    <div class="exam-meta">{{ exam.subjectName || 'N/A' }} • Date: {{ formatDate(exam.examDate) }} • Duration: {{ exam.durationMinutes || 0 }} min</div>
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
                <div class="exam-results" *ngIf="exam.attempted && exam.obtainedMarks != null">
                  <div class="result-header">
                    <span class="result-score">Score: {{ exam.obtainedMarks }}/{{ exam.totalMarks || 100 }}</span>
                    <span class="result-grade">Grade: {{ exam.grade || 'N/A' }}</span>
                </div>
                  <div class="result-percentage">Percentage: {{ exam.percentage }}%</div>
                </div>
              </div>
              <div *ngIf="!isLoadingExams && exams.length === 0" class="empty-state">
                <p>No exams available for your class</p>
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
              <!-- Overall Overview -->
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
                    <span class="stat-label">Leave:</span>
                    <span class="stat-value">{{ attendanceStats.leave }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Total:</span>
                    <span class="stat-value">{{ attendanceStats.total }}</span>
                  </div>
                </div>
                <div class="attendance-rule" *ngIf="attendancePolicy?.minAttendancePercent">
                  Minimum required for exams: 
                  <strong>{{ attendancePolicy.minAttendancePercent }}%</strong>
                  <span class="status-badge" 
                        [ngClass]="{'completed': attendancePercentage >= (attendancePolicy.minAttendancePercent || 75),
                                   'locked': attendancePercentage < (attendancePolicy.minAttendancePercent || 75)}">
                    {{ attendancePercentage >= (attendancePolicy.minAttendancePercent || 75) ? 'Eligible' : 'Not Eligible' }}
                  </span>
              </div>
                  </div>

              <!-- Subject-wise -->
              <div class="attendance-subjects">
                <h3 class="subsection-title">Subject-wise Attendance</h3>
                <div *ngIf="attendanceSubjects.length === 0 && !isLoadingAttendance" class="empty-state">
                  <p>No attendance records found yet.</p>
                </div>
                <div class="attendance-subjects-table" *ngIf="attendanceSubjects.length > 0">
                  <div class="subjects-table-header">
                    <span>Subject</span>
                    <span>Present</span>
                    <span>Absent</span>
                    <span>Leave</span>
                    <span>Total</span>
                    <span>Attendance</span>
                  </div>
                  <div class="subjects-table-row" 
                       *ngFor="let subj of attendanceSubjects"
                       [class.low-attendance-row]="subj.lowAttendance">
                    <span class="subject-name">{{ subj.subjectName }}</span>
                    <span class="present-value">{{ subj.present }}</span>
                    <span class="absent-value">{{ subj.absent }}</span>
                    <span class="leave-value">{{ subj.leave || 0 }}</span>
                    <span class="total-value">{{ subj.total }}</span>
                    <span>
                      <span class="attendance-percent-value"
                            [style.color]="subj.percentage >= (attendancePolicy.minAttendancePercent || 75) ? 'var(--accent-green)' : '#f59e0b'">
                        {{ subj.percentage | number:'1.0-1' }}%
                      </span>
                      <span *ngIf="subj.lowAttendance" class="low-attendance-indicator">⚠️</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Date-wise -->
              <div class="attendance-dates">
                <h3 class="subsection-title">Date-wise Attendance</h3>
                <div *ngIf="attendanceDates.length === 0 && !isLoadingAttendance" class="empty-state">
                  <p>No date-wise records found.</p>
                </div>
                <div class="attendance-history-details" *ngIf="attendanceDates.length > 0">
                  <div class="history-details-header">
                    <span>Date</span>
                    <span>Subject</span>
                    <span>Status</span>
                    <span></span>
                  </div>
                  <div class="history-details-row" *ngFor="let d of attendanceDates">
                    <span>{{ d.date | date:'dd/MM/yyyy' }}</span>
                    <span>{{ d.subjectName }}</span>
                    <span>
                      <span class="status-badge"
                            [ngClass]="{'completed': d.status === 'present', 'locked': d.status === 'absent'}">
                        {{ d.status || 'N/A' }}
                      </span>
                    </span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notices Tab -->
        <div class="tab-content" *ngIf="activeTab === 'notices'">
          <div class="section-header">
            <h2 class="section-title">📋 Notices</h2>
            <p class="section-subtitle">Received notices from admin / institution</p>
          </div>
          <div class="content-card">
            <div *ngIf="isLoadingNotices" class="empty-state">
              <p>Loading notices...</p>
            </div>
            <div *ngIf="!isLoadingNotices && studentNotices.length === 0" class="empty-state">
              <p>No notices available.</p>
            </div>
            <div *ngIf="!isLoadingNotices && studentNotices.length > 0" class="attendance-summary-table">
              <div class="summary-table-header">
                <span>Title</span>
                <span>Type</span>
                <span>Publish Date</span>
                <span>Status</span>
              </div>
              <div class="summary-table-row notice-row" *ngFor="let notice of studentNotices" (click)="viewNotice(notice)" style="cursor: pointer;">
                <span class="summary-name">
                  {{ notice.title }}
                  <span *ngIf="!notice.isRead" style="margin-left: 8px; font-size: 11px; color: #facc15;">● New</span>
                </span>
                <span>{{ notice.noticeType || 'General' }}</span>
                <span>{{ notice.publishAt | date:'dd/MM/yyyy HH:mm' }}</span>
                <span>
                  <span class="status-badge" [class.status-active]="notice.isRead" [class.status-inactive]="!notice.isRead">
                    {{ notice.isRead ? 'Read' : 'Unread' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Announcements Tab -->
        <div class="tab-content" *ngIf="activeTab === 'announcements'">
          <div class="section-header">
            <div>
              <h2 class="section-title">📢 Announcements</h2>
              <p class="section-subtitle">Official notices and teacher announcements for your class</p>
            </div>
          </div>

          <!-- Announcements List -->
          <div *ngIf="isLoadingAnnouncements" class="loading">Loading announcements...</div>
          <div *ngIf="!isLoadingAnnouncements && studentAnnouncements.length === 0" class="empty-state">
            <p>No announcements available.</p>
          </div>
          <div *ngIf="!isLoadingAnnouncements && studentAnnouncements.length > 0" class="announcements-table">
            <div class="announcements-table-header">
              <span>Title</span>
              <span>Source</span>
              <span>Subject</span>
              <span>Type</span>
              <span>Date & Time</span>
              <span>Actions</span>
            </div>
            <div class="announcements-table-row" *ngFor="let announcement of studentAnnouncements">
              <span class="announcement-title-cell">
                <strong>{{ announcement.title }}</strong>
                <a *ngIf="announcement.attachmentName && announcement.attachmentData" 
                   [href]="announcement.attachmentData" 
                   [download]="announcement.attachmentName"
                   (click)="$event.stopPropagation()"
                   class="attachment-link">
                  📎 {{ announcement.attachmentName }}
                </a>
                <span *ngIf="!announcement.isRead" class="new-badge">● New</span>
              </span>
              <span class="announcement-source-cell">
                <span class="source-badge" [class.source-admin]="announcement.source === 'ADMIN'" [class.source-teacher]="announcement.source === 'TEACHER'">
                  {{ announcement.source === 'ADMIN' ? 'Admin' : 'Teacher' }}
                </span>
                <span *ngIf="announcement.teacherName && announcement.source === 'TEACHER'" class="teacher-name-small">
                  {{ announcement.teacherName }}
                </span>
              </span>
              <span class="announcement-subject-cell">{{ getSubjectNameById(announcement.subjectId) || 'N/A' }}</span>
              <span class="announcement-type-cell">{{ announcement.type || announcement.announcementType || 'N/A' }}</span>
              <span class="announcement-date-cell">{{ formatAnnouncementDate(announcement.publishAt || announcement.createdAt) || 'N/A' }}</span>
              <span class="announcement-actions-cell">
                <button class="btn-view" (click)="viewAnnouncement(announcement)">View</button>
              </span>
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

      <!-- Study Material View Modal (Student - View Only) -->
      <div class="modal-overlay" *ngIf="showMaterialModal" (click)="closeMaterialModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Study Material Details</h3>
            <button class="modal-close" (click)="closeMaterialModal()">×</button>
          </div>
          <div class="modal-body" *ngIf="selectedMaterial">
            <div class="student-details-grid">
              <div class="detail-item">
                <span class="detail-label">Title:</span>
                <span class="detail-value">{{ selectedMaterial.title }}</span>
              </div>
              <div class="detail-item" *ngIf="selectedMaterial.type">
                <span class="detail-label">Type:</span>
                <span class="detail-value">{{ selectedMaterial.type }}</span>
              </div>
              <div class="detail-item" *ngIf="selectedMaterial.unit">
                <span class="detail-label">Unit:</span>
                <span class="detail-value">{{ selectedMaterial.unit }}</span>
              </div>
              <div class="detail-item" *ngIf="selectedMaterial.topicName">
                <span class="detail-label">Topic:</span>
                <span class="detail-value">{{ selectedMaterial.topicName }}</span>
              </div>
              <div class="detail-item" *ngIf="selectedMaterial.description">
                <span class="detail-label">Description:</span>
                <span class="detail-value">{{ selectedMaterial.description }}</span>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn-primary" (click)="openMaterialContent()">Open Content</button>
              <button class="btn-secondary" (click)="downloadMaterial(selectedMaterial)">Download</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Assignment Detail Modal -->
      <div class="modal-overlay" *ngIf="showAssignmentDetailModal" (click)="showAssignmentDetailModal = false">
        <div class="modal-content" style="max-width: 800px;" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Assignment Details</h3>
            <button class="modal-close" (click)="showAssignmentDetailModal = false">×</button>
          </div>
          <div class="modal-body" *ngIf="selectedAssignment">
            <div class="student-details-grid">
              <div class="detail-item">
                <span class="detail-label">Title:</span>
                <span class="detail-value">{{ selectedAssignment.title }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Subject:</span>
                <span class="detail-value">{{ getSubjectName(selectedAssignment.subjectId) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Due Date:</span>
                <span class="detail-value">{{ formatDate(selectedAssignment.extendedDueDate || selectedAssignment.dueDate) }}</span>
              </div>
              <div class="detail-item" *ngIf="selectedAssignment.maxMarks">
                <span class="detail-label">Max Marks:</span>
                <span class="detail-value">{{ selectedAssignment.maxMarks }}</span>
              </div>
              <div class="detail-item" *ngIf="selectedAssignment.description">
                <span class="detail-label">Description:</span>
                <span class="detail-value">{{ selectedAssignment.description }}</span>
              </div>
              <div class="detail-item" *ngIf="selectedAssignment.instructions">
                <span class="detail-label">Instructions:</span>
                <span class="detail-value">{{ selectedAssignment.instructions }}</span>
              </div>
              <div class="detail-item" *ngIf="selectedAssignment.fileName || selectedAssignment.fileUrl || selectedAssignment.fileData">
                <span class="detail-label">Attachment:</span>
                <div class="attachment-container">
                  <div class="attachment-preview" *ngIf="selectedAssignment.fileData || selectedAssignment.fileUrl">
                    <img *ngIf="isImageFile(selectedAssignment.fileName) && (selectedAssignment.fileData || selectedAssignment.fileUrl)" 
                         [src]="selectedAssignment.fileData || selectedAssignment.fileUrl" 
                         [alt]="selectedAssignment.fileName || 'Attachment'"
                         class="attachment-image"
                         (error)="onImageError($event)" />
                    <div *ngIf="!isImageFile(selectedAssignment.fileName) && (selectedAssignment.fileData || selectedAssignment.fileUrl)" class="file-preview">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>{{ selectedAssignment.fileName || 'File' }}</span>
                    </div>
                  </div>
                  <div class="attachment-actions">
                    <a *ngIf="selectedAssignment.fileUrl" [href]="selectedAssignment.fileUrl" target="_blank" class="btn-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 13V19A2 2 0 0 1 16 21H5A2 2 0 0 1 3 19V8A2 2 0 0 1 5 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M15 3H21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Open File
                    </a>
                    <button *ngIf="selectedAssignment.fileData" (click)="downloadAssignmentFile(selectedAssignment)" class="btn-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Download
                    </button>
                    <span *ngIf="selectedAssignment.fileName && !selectedAssignment.fileData && !selectedAssignment.fileUrl" class="file-name">{{ selectedAssignment.fileName }}</span>
                  </div>
                </div>
              </div>
              <div class="detail-item" *ngIf="selectedAssignment.submittedAt">
                <span class="detail-label">Submitted At:</span>
                <span class="detail-value">{{ formatDateTime(selectedAssignment.submittedAt) }}</span>
                <span *ngIf="selectedAssignment.isLate" class="late-badge">Late</span>
              </div>
              <div class="detail-item" *ngIf="selectedAssignment.marks !== null && selectedAssignment.marks !== undefined">
                <span class="detail-label">Marks Obtained:</span>
                <span class="detail-value marks">{{ selectedAssignment.marks }}/{{ selectedAssignment.maxMarks || 'N/A' }}</span>
              </div>
              <div class="detail-item" *ngIf="selectedAssignment.feedback">
                <span class="detail-label">Teacher Feedback:</span>
                <span class="detail-value">{{ selectedAssignment.feedback }}</span>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showAssignmentDetailModal = false">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Submission Modal -->
      <div class="modal-overlay" *ngIf="showSubmissionModal" (click)="showSubmissionModal = false">
        <div class="modal-content submission-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-header-content">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="modal-icon">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 10L12 5L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h3 class="modal-title">Submit Assignment</h3>
            </div>
            <button class="modal-close" (click)="showSubmissionModal = false">×</button>
          </div>
          <div class="modal-body" *ngIf="selectedAssignment">
            <div class="assignment-info-banner">
              <div class="banner-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="banner-content">
                <div class="banner-title">{{ selectedAssignment.title }}</div>
                <div class="banner-subtitle">{{ getSubjectName(selectedAssignment.subjectId) }}</div>
              </div>
            </div>
            
            <div class="form-section">
              <div class="form-group">
                <label class="form-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7 10L12 5L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Upload File (PDF/DOC/Image)
                </label>
                <div class="file-upload-wrapper">
                  <input type="file" id="file-upload" class="file-input" (change)="onSubmissionFileSelect($event)" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                  <label for="file-upload" class="file-upload-label">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M7 10L12 5L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>{{ submissionForm.fileName || 'Choose file' }}</span>
                  </label>
                </div>
                <small class="form-hint" *ngIf="submissionForm.fileName">✓ Selected: {{ submissionForm.fileName }}</small>
              </div>
              
              <div class="form-group">
                <label class="form-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.46091 20.4791 3.53388C19.5521 2.60685 18.301 2.08097 16.99 2.06958C15.679 2.05818 14.416 2.56216 13.473 3.47298L11.75 5.19298" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 11C13.5705 10.4259 13.0226 9.95085 12.3934 9.60707C11.7643 9.26329 11.0685 9.05886 10.3533 9.00766C9.63824 8.95645 8.92037 9.05972 8.24864 9.31026C7.57691 9.5608 6.96695 9.95302 6.46 10.46L3.46 13.46C2.54918 14.403 2.04519 15.6661 2.05659 16.977C2.06798 18.288 2.59386 19.5391 3.52089 20.4661C4.44792 21.3931 5.69899 21.919 6.99997 21.9304C8.30095 21.9418 9.56403 21.4378 10.507 20.527L12.227 18.807" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  File URL (optional)
                </label>
                <input type="text" class="form-input" [(ngModel)]="submissionForm.fileUrl" placeholder="https://example.com/file.pdf" />
              </div>
              
              <div class="form-group">
                <label class="form-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 17H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Text Answer (optional)
                </label>
                <textarea class="form-textarea" rows="6" [(ngModel)]="submissionForm.textAnswer" placeholder="Enter your answer here..."></textarea>
              </div>
            </div>
            
            <div class="modal-actions">
              <button class="btn-secondary" (click)="showSubmissionModal = false">Cancel</button>
              <button class="btn-primary btn-submit" (click)="submitAssignment()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Submit Assignment
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Notice View Modal -->
      <div class="modal-overlay" *ngIf="showNoticeModal" (click)="closeNoticeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Notice Details</h3>
            <button class="modal-close" (click)="closeNoticeModal()">×</button>
          </div>
          <div class="modal-body" *ngIf="selectedNotice">
            <div class="student-details-grid">
              <div class="detail-item">
                <span class="detail-label">Title</span>
                <span class="detail-value">{{ selectedNotice.title }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Type</span>
                <span class="detail-value">{{ selectedNotice.noticeType || 'General' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Target Audience</span>
                <span class="detail-value">{{ selectedNotice.targetAudience || 'All' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Publish Date</span>
                <span class="detail-value">{{ selectedNotice.publishAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="detail-item" *ngIf="selectedNotice.expiresAt">
                <span class="detail-label">Expires At</span>
                <span class="detail-value">{{ selectedNotice.expiresAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status</span>
                <span class="detail-value">
                  <span class="status-badge" [class.status-active]="selectedNotice.isRead" [class.status-inactive]="!selectedNotice.isRead">
                    {{ selectedNotice.isRead ? 'Read' : 'Unread' }}
                  </span>
                </span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">Description</span>
                <span class="detail-value">{{ selectedNotice.description || 'N/A' }}</span>
              </div>
              <div class="detail-item full-width" *ngIf="selectedNotice.attachmentName || selectedNotice.attachmentData">
                <span class="detail-label">Attachment</span>
                <span class="detail-value">
                  <button class="btn-secondary" (click)="downloadNoticeAttachment(selectedNotice)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Download {{ selectedNotice.attachmentName || 'Attachment' }}
                  </button>
                </span>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeNoticeModal()">Close</button>
          </div>
        </div>
      </div>

      <!-- Announcement View Modal -->
      <div class="modal-overlay" *ngIf="showAnnouncementModal" (click)="closeAnnouncementModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Announcement Details</h3>
            <button class="close-btn" (click)="closeAnnouncementModal()">×</button>
          </div>
          <div class="modal-body" *ngIf="selectedAnnouncement">
            <div class="student-details-grid">
              <div class="detail-item">
                <span class="detail-label">Title</span>
                <span class="detail-value">{{ selectedAnnouncement.title }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Source</span>
                <span class="detail-value">
                  <span class="source-badge" [class.source-admin]="selectedAnnouncement.source === 'ADMIN'" [class.source-teacher]="selectedAnnouncement.source === 'TEACHER'">
                    {{ selectedAnnouncement.source === 'ADMIN' ? 'Admin Notice' : 'Teacher Announcement' }}
                  </span>
                </span>
              </div>
              <div class="detail-item" *ngIf="selectedAnnouncement.teacherName && selectedAnnouncement.source === 'TEACHER'">
                <span class="detail-label">Teacher</span>
                <span class="detail-value">{{ selectedAnnouncement.teacherName }}</span>
              </div>
              <div class="detail-item" *ngIf="selectedAnnouncement.subjectId">
                <span class="detail-label">Subject</span>
                <span class="detail-value">{{ getSubjectNameById(selectedAnnouncement.subjectId) || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Type</span>
                <span class="detail-value">{{ selectedAnnouncement.type || selectedAnnouncement.announcementType || selectedAnnouncement.noticeType || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Publish Date</span>
                <span class="detail-value">{{ formatAnnouncementDate(selectedAnnouncement.publishAt || selectedAnnouncement.createdAt) || 'N/A' }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">Description</span>
                <span class="detail-value">{{ selectedAnnouncement.description || 'N/A' }}</span>
              </div>
              <div class="detail-item full-width" *ngIf="selectedAnnouncement.attachmentName || selectedAnnouncement.attachmentData">
                <span class="detail-label">Attachment</span>
                <span class="detail-value">
                  <button class="btn-secondary" (click)="downloadAnnouncementAttachment(selectedAnnouncement)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Download {{ selectedAnnouncement.attachmentName || 'Attachment' }}
                  </button>
                </span>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeAnnouncementModal()">Close</button>
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

    .dashboard-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      align-items: start;
    }
    .dashboard-left {
      display: flex;
      flex-direction: column;
    }
    .dashboard-right {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .dashboard-content{
      display: flex;
      flex-direction: column;
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
    .attendance-summary-table {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }
    .summary-table-header {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr 1.5fr 2fr;
      gap: 20px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      font-weight: 800;
      font-size: 14px;
      color: var(--text-gray);
      text-transform: uppercase;
    }
    .student-details-header {
      grid-template-columns: 1.5fr 3fr !important;
      gap: 24px !important;
      padding: 14px 20px !important;
    }
    .summary-table-row {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr 1.5fr 2fr;
      gap: 20px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      align-items: center;
      transition: all 0.2s;
    }
    .student-details-row {
      grid-template-columns: 1.5fr 3fr !important;
      gap: 24px !important;
      padding: 18px 20px !important;
    }
    .student-details-row span {
      font-size: 14px;
      line-height: 1.6;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .summary-value {
      color: var(--accent-green);
      font-weight: 700;
    }
    .status-badge.status-active {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--accent-green);
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-badge.status-inactive {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    
    /* Announcements Table Layout */
    .announcements-table {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }
    .announcements-table-header {
      display: grid;
      grid-template-columns: 2.5fr 1.5fr 1.5fr 1.5fr 1.8fr 1.5fr;
      gap: 20px;
      padding: 14px 20px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      font-weight: 800;
      font-size: 13px;
      color: var(--text-gray);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .announcements-table-row {
      display: grid;
      grid-template-columns: 2.5fr 1.5fr 1.5fr 1.5fr 1.8fr 1.5fr;
      gap: 20px;
      padding: 18px 20px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      align-items: center;
      transition: all 0.2s;
    }
    .announcements-table-row:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--accent-green);
      transform: translateY(-1px);
    }
    .announcement-title-cell {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .announcement-title-cell strong {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-white);
    }
    .attachment-link {
      font-size: 12px;
      color: #10b981;
      text-decoration: none;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: color 0.2s;
    }
    .attachment-link:hover {
      color: #34d399;
      text-decoration: underline;
    }
    .new-badge {
      font-size: 11px;
      color: #facc15;
      font-weight: 700;
      margin-top: 4px;
    }
    .announcement-source-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .source-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .source-badge.source-admin {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #3b82f6;
    }
    .source-badge.source-teacher {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #f59e0b;
    }
    .teacher-name-small {
      font-size: 11px;
      color: var(--text-gray);
      margin-top: 2px;
    }
    .announcement-subject-cell,
    .announcement-type-cell,
    .announcement-date-cell {
      font-size: 14px;
      color: var(--text-white);
      font-weight: 500;
    }
    .announcement-actions-cell {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .announcement-actions-cell button {
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
    }
    .announcement-actions-cell .btn-view {
      background: rgba(59, 130, 246, 0.12);
      border-color: rgba(59, 130, 246, 0.25);
      color: #3b82f6;
    }
    .announcement-actions-cell .btn-view:hover {
      background: rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.4);
      transform: translateY(-1px);
    }
    
    /* Exams and Assignments Table Layout */
    .exams-table-header, .assignments-table-header {
      grid-template-columns: 2fr 1.5fr !important;
      gap: 24px !important;
      padding: 14px 20px !important;
    }
    .exams-table-row, .assignments-table-row {
      grid-template-columns: 2fr 1.5fr !important;
      gap: 24px !important;
      padding: 18px 20px !important;
    }
    .exam-name-cell, .assignment-name-cell {
      font-weight: 700;
      font-size: 15px;
      color: var(--text-white);
    }
    .exam-date-cell, .assignment-due-cell {
      font-weight: 600;
      font-size: 14px;
      color: var(--accent-green);
    }
    .exams-table-row:hover, .assignments-table-row:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--accent-green);
    }
    
    /* Dashboard Header Section */
    .dashboard-header-section {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
    }
    .dashboard-header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 32px;
    }
    .dashboard-header-left {
      flex: 1;
    }
    .dashboard-welcome {
      font-size: 32px;
      font-weight: 900;
      color: var(--text-white);
      margin: 0 0 8px 0;
      line-height: 1.2;
    }
    .dashboard-subtitle {
      font-size: 16px;
      color: var(--text-gray);
      margin: 0 0 24px 0;
    }
    .dashboard-kpis {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }
    .kpi-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .kpi-bullet {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-green);
      flex-shrink: 0;
    }
    .kpi-text {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-white);
    }
    .dashboard-header-right {
      text-align: right;
      flex-shrink: 0;
    }
    .dashboard-time-label {
      font-size: 14px;
      color: var(--text-gray);
      margin-bottom: 8px;
      font-weight: 600;
    }
    .dashboard-time {
      font-size: 36px;
      font-weight: 900;
      color: var(--text-white);
      font-family: 'Courier New', monospace;
      margin-bottom: 4px;
    }
    .dashboard-date {
      font-size: 16px;
      color: var(--text-gray);
      font-weight: 600;
    }
    
    /* Dashboard Main Content */
    .dashboard-main-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    /* Dashboard Sections Layout (Two Column) */
    .dashboard-sections-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      align-items: start;
    }
    
    /* Dashboard Section */
    .dashboard-section {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 24px;
    }
    .dashboard-section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    .section-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 10px;
      flex-shrink: 0;
    }
    .dashboard-section-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--text-white);
      margin: 0 0 4px 0;
    }
    .dashboard-section-subtitle {
      font-size: 14px;
      color: var(--text-gray);
      margin: 0;
    }
    
    /* Quick Actions Grid */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .quick-action-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
    }
    .quick-action-card:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--accent-green);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
    }
    .action-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
    }
    .action-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-white);
    }
    .action-subtitle {
      font-size: 13px;
      color: var(--text-gray);
      font-weight: 600;
    }
    
    /* Performance Metrics */
    .performance-metrics {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .metric-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .metric-label {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-white);
    }
    .metric-bar-container {
      width: 100%;
      height: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      overflow: hidden;
      position: relative;
    }
    .metric-bar {
      height: 100%;
      border-radius: 6px;
      transition: width 0.5s ease;
    }
    .metric-bar-good {
      background: linear-gradient(90deg, var(--accent-green) 0%, rgba(16, 185, 129, 0.7) 100%);
    }
    .metric-bar-warning {
      background: linear-gradient(90deg, #f59e0b 0%, rgba(245, 158, 11, 0.7) 100%);
    }
    .metric-bar-danger {
      background: linear-gradient(90deg, #ef4444 0%, rgba(239, 68, 68, 0.7) 100%);
    }
    .metric-bar-info {
      background: linear-gradient(90deg, #3b82f6 0%, rgba(59, 130, 246, 0.7) 100%);
    }
    .metric-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent-green);
    }
    .summary-table-row:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--accent-green);
    }
    .summary-table-row span {
      font-size: 14px;
      color: var(--text-white);
    }
    .summary-name {
      font-weight: 800;
      font-size: 15px;
      color: var(--text-white);
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
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      flex-wrap: wrap;
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

    .attendance-subjects, .attendance-dates {
      margin-top: 32px;
    }
    .subsection-title {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 20px;
      color: var(--text-white);
    }
    .attendance-subjects-table {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .subjects-table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
      gap: 20px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      font-weight: 800;
      font-size: 14px;
      color: var(--text-gray);
      text-transform: uppercase;
    }
    .subjects-table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
      gap: 20px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      align-items: center;
      transition: all 0.2s;
    }
    .subjects-table-row:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--accent-green);
    }
    .subjects-table-row.low-attendance-row {
      border-color: rgba(245, 158, 11, 0.5);
      background: rgba(245, 158, 11, 0.05);
    }
    .subjects-table-row span {
      font-size: 14px;
      color: var(--text-white);
    }
    .subject-name {
      font-weight: 800;
      font-size: 15px;
      color: var(--text-white);
    }
    .present-value {
      color: var(--accent-green);
      font-weight: 700;
    }
    .absent-value {
      color: #ef4444;
      font-weight: 700;
    }
    .leave-value {
      color: #f59e0b;
      font-weight: 700;
    }
    .total-value {
      font-weight: 700;
    }
    .attendance-percent-value {
      font-size: 16px;
      font-weight: 900;
      display: inline-block;
    }
    .low-attendance-indicator {
      margin-left: 8px;
      color: #f59e0b;
      font-size: 14px;
    }
    .attendance-history-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .history-details-header {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr 0.5fr;
      gap: 20px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      font-weight: 800;
      font-size: 14px;
      color: var(--text-gray);
      text-transform: uppercase;
    }
    .history-details-row {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr 0.5fr;
      gap: 20px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      align-items: center;
    }
    .history-details-row span {
      font-size: 14px;
      color: var(--text-white);
    }
    .history-details-row .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .history-details-row .status-badge.completed {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid #22c55e;
      color: #22c55e;
    }
    .history-details-row .status-badge.locked {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #ef4444;
      color: #ef4444;
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

    .material-actions {
      display: flex;
      gap: 8px;
    }
    .btn-view {
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
    }
    .btn-view:hover {
      border-color: var(--accent-green);
      background: rgba(16, 185, 129, 0.1);
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    .modal-content {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-gray);
    }
    .modal-title {
      font-size: 20px;
      font-weight: 900;
      margin: 0;
    }
    .modal-close {
      background: transparent;
      border: none;
      color: var(--text-white);
      font-size: 32px;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }
    .modal-close:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .modal-body {
      padding: 24px;
    }
    .student-details-grid {
      display: grid;
      gap: 16px;
      margin-bottom: 24px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .detail-label {
      font-size: 12px;
      color: var(--text-gray);
      font-weight: 700;
      text-transform: uppercase;
    }
    .detail-value {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-white);
    }
    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border-gray);
    }

    /* Attachment Preview Styles */
    .attachment-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .attachment-preview {
      border-radius: 12px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
    }
    .attachment-image {
      width: 100%;
      max-height: 400px;
      object-fit: contain;
      display: block;
      background: rgba(0, 0, 0, 0.3);
    }
    .file-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 12px;
      color: var(--text-gray);
    }
    .file-preview svg {
      color: var(--accent-green);
    }
    .file-preview span {
      font-weight: 700;
      color: var(--text-white);
    }
    .attachment-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .btn-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 8px;
      color: var(--accent-green);
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-link:hover {
      background: rgba(16, 185, 129, 0.2);
      border-color: var(--accent-green);
      transform: translateY(-1px);
    }
    .btn-link svg {
      width: 16px;
      height: 16px;
    }
    .file-name {
      color: var(--text-gray);
      font-size: 14px;
      font-weight: 600;
    }

    /* Submission Modal Enhanced Styles */
    .submission-modal {
      max-width: 700px;
    }
    .modal-header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .modal-icon {
      color: var(--accent-green);
    }
    .assignment-info-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .banner-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(16, 185, 129, 0.2);
      border-radius: 12px;
      color: var(--accent-green);
      flex-shrink: 0;
    }
    .banner-content {
      flex: 1;
    }
    .banner-title {
      font-size: 18px;
      font-weight: 900;
      color: var(--text-white);
      margin-bottom: 4px;
    }
    .banner-subtitle {
      font-size: 14px;
      color: var(--text-gray);
      font-weight: 600;
    }
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .form-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-white);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-label svg {
      color: var(--accent-green);
    }
    .file-upload-wrapper {
      position: relative;
    }
    .file-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }
    .file-upload-label {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.03);
      border: 2px dashed var(--border-gray);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      color: var(--text-gray);
      font-weight: 600;
    }
    .file-upload-label:hover {
      border-color: var(--accent-green);
      background: rgba(16, 185, 129, 0.05);
      color: var(--accent-green);
    }
    .file-upload-label svg {
      color: var(--accent-green);
    }
    .file-upload-label span {
      flex: 1;
    }
    .form-input {
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-gray);
      border-radius: 10px;
      color: var(--text-white);
      font-size: 15px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--accent-green);
      background: rgba(255, 255, 255, 0.05);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    .form-input::placeholder {
      color: var(--text-gray);
    }
    .form-textarea {
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-gray);
      border-radius: 10px;
      color: var(--text-white);
      font-size: 15px;
      font-weight: 600;
      font-family: inherit;
      resize: vertical;
      min-height: 120px;
      transition: all 0.2s;
    }
    .form-textarea:focus {
      outline: none;
      border-color: var(--accent-green);
      background: rgba(255, 255, 255, 0.05);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    .form-textarea::placeholder {
      color: var(--text-gray);
    }
    .form-hint {
      display: block;
      color: var(--accent-green);
      font-size: 13px;
      font-weight: 600;
      margin-top: 4px;
    }
    .btn-submit {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-weight: 800;
      font-size: 15px;
    }
    .btn-submit svg {
      width: 18px;
      height: 18px;
    }

    @media (max-width: 768px){
      .nav{ padding: 0 20px; }
      .content{ padding: 18px 20px 16px; }
      .dashboard-content{ grid-template-columns: 1fr; }
      .subject-materials{ grid-template-columns: 1fr; }
      .attendance-stats{ flex-direction: column; gap: 12px; }
      .material-actions {
        flex-direction: column;
      }
      .student-profile-section {
        flex-direction: column;
        align-items: center;
      }
      .student-info-grid {
        grid-template-columns: 1fr;
        width: 100%;
      }
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  isDarkMode = true;
  activeTab: 'dashboard' | 'subjects' | 'assignments' | 'exams' | 'attendance' | 'notices' | 'announcements' | 'fees' = 'dashboard';
  
  userName = 'student';
  userEmail = 'student@lms.com';
  userInitial = 's';
  isUserMenuOpen = false;
  profileImage = '';

  enrolledCourses: Array<{name: string, class: string}> = [];

  upcomingExams: Array<{ name: string; date: string }> = [];

  pendingAssignments = [
    { name: 'Math Assignment 1', dueDate: '03/02/2026' },
    { name: 'Physics Project', dueDate: '08/02/2026' }
  ];

  studentSubjectItems: any[] = [];
  isLoadingStudentContents = false;

  // Material view modal
  showMaterialModal = false;
  selectedMaterial: SubjectContent | null = null;

  assignments: any[] = [];

  exams: any[] = [];
  isLoadingExams = false;

  // Attendance (loaded from backend)
  attendancePercentage = 0;
  attendanceStats = {
    present: 0,
    absent: 0,
    total: 0,
    leave: 0
  };
  attendanceSubjects: any[] = [];
  attendanceDates: any[] = [];
  attendancePolicy: any = {};
  isLoadingAttendance = false;

  // Notices (received) for student
  studentNotices: any[] = [];
  isLoadingNotices = false;
  showNoticeModal = false;
  selectedNotice: any = null;

  // Announcements (admin notices + teacher announcements) for student
  studentAnnouncements: any[] = [];
  isLoadingAnnouncements = false;
  showAnnouncementModal = false;
  selectedAnnouncement: any = null;

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
  studentClass: string = '';
  studentSection: string = '';
  studentRollNumber: string = '';
  studentCourseId: number | null = null;
  studentClassId: number | null = null;
  studentSectionId: number | null = null;
  studentId: number | null = null;
  isLoadingStudentData = false;
  
  // Dashboard time
  currentTime: string = '';
  currentDate: string = '';
  
  // Assignment data
  isLoadingAssignments = false;
  showSubmissionModal = false;
  showAssignmentDetailModal = false;
  selectedAssignment: any = null;
  submissionForm: any = {
    fileName: '',
    fileData: '',
    fileUrl: '',
    textAnswer: ''
  };

  constructor(
    private theme: ThemeService,
    private auth: AuthService,
    private router: Router,
    private profileService: ProfileService,
    private studentService: StudentService,
    private subjectService: SubjectService,
    private subjectContentService: SubjectContentService,
    private assignmentService: AssignmentService,
    private studentAttendanceService: StudentAttendanceService,
    private noticeService: NoticeService,
    private announcementService: AnnouncementService,
    private examService: ExamService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(q => {
      if (q['tab'] === 'exams') this.activeTab = 'exams';
    });
    const user = this.auth.getUser();
      if (user?.name) this.userName = user.name;
      if (user?.email) this.userEmail = user.email;
      this.userInitial = (this.userName?.trim()?.[0] || 's').toLowerCase();
      
      // Initialize time and date
      this.updateTime();
      setInterval(() => this.updateTime(), 1000);

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
    this.isLoadingStudentData = true;
    this.studentService.getStudentByUserId(userId).subscribe({
      next: (result) => {
        this.isLoadingStudentData = false;
        console.log('Student data response:', result);
        if (result && result.ok && result.student) {
          this.studentData = result.student;
          this.studentCourse = result.student.classCourse || '';
          this.studentSection = result.student.classSection || '';
          this.studentRollNumber = result.student.rollNumber || '';
          this.studentCourseId = result.student.courseId || null;
          this.studentClassId = result.student.classId || null;
          this.studentSectionId = result.student.sectionId || null;
          this.studentId = result.student.id || null;
          
          // Load assignments and exams when student data is loaded
          if (this.studentId && this.studentClassId) {
            this.loadAssignments();
          }
          if (this.studentId) {
            this.loadExams();
          }

          // Load attendance summary
          if (this.studentId) {
            this.loadAttendanceSummary();
          }
          
          console.log('Student data loaded:', {
            course: this.studentCourse,
            section: this.studentSection,
            rollNumber: this.studentRollNumber,
            courseId: this.studentCourseId,
            classId: this.studentClassId,
            sectionId: this.studentSectionId
          });
          
          // Update enrolled courses in dashboard - always set it
          this.enrolledCourses = [];
          if (this.studentCourse) {
            this.enrolledCourses.push({
              name: this.studentCourse,
              class: this.studentSection || 'N/A'
            });
          }
          console.log('Enrolled courses updated:', this.enrolledCourses);
          
          // Load course name if courseId exists
          if (this.studentCourseId && result.student.entityId) {
            this.loadCourseName(result.student.entityId, this.studentCourseId);
          }
          
          // Load class name if classId exists
          if (this.studentClassId) {
            this.loadClassName(this.studentClassId);
          }
          
          // Load section name if sectionId exists
          if (this.studentSectionId) {
            this.loadSectionName(this.studentSectionId);
          }
          
          // Load subjects and study materials
          if (this.studentCourseId && this.studentClassId) {
            this.loadStudentSubjectsAndContents();
          } else {
            console.warn('Cannot load subjects - missing courseId or classId');
          }
        } else {
          console.error('Invalid student data response:', result);
          this.studentData = null;
          this.enrolledCourses = [];
        }
      },
      error: (err) => {
        this.isLoadingStudentData = false;
        console.error('Error loading student data:', err);
        this.studentData = null;
        this.enrolledCourses = [];
      }
    });
  }

  loadAttendanceSummary(): void {
    if (!this.studentId) return;
    this.isLoadingAttendance = true;
    this.studentAttendanceService.getSummary(this.studentId).subscribe({
      next: (result: any) => {
        this.isLoadingAttendance = false;
        if (result && result.ok && result.data) {
          const data = result.data;
          const ov = data.overview || {};
          this.attendancePercentage = Math.round((ov.percentage || 0) * 10) / 10;
          this.attendanceStats = {
            present: ov.present || 0,
            absent: ov.absent || 0,
            total: ov.total || 0,
            leave: ov.leave || 0
          };
          this.attendanceSubjects = Array.isArray(data.subjects) ? data.subjects : [];
          this.attendanceDates = Array.isArray(data.dates) ? data.dates : [];
          this.attendancePolicy = data.policy || {};
        } else {
          this.attendancePercentage = 0;
          this.attendanceStats = { present: 0, absent: 0, total: 0, leave: 0 };
          this.attendanceSubjects = [];
          this.attendanceDates = [];
          this.attendancePolicy = {};
        }
      },
      error: (err) => {
        console.error('Error loading attendance summary:', err);
        this.isLoadingAttendance = false;
        this.attendancePercentage = 0;
        this.attendanceStats = { present: 0, absent: 0, total: 0, leave: 0 };
        this.attendanceSubjects = [];
        this.attendanceDates = [];
        this.attendancePolicy = {};
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
            // Update enrolled courses
            this.enrolledCourses = [];
            this.enrolledCourses.push({
              name: course.name,
              class: this.studentSection || 'N/A'
            });
            console.log('Course name loaded, enrolled courses:', this.enrolledCourses);
          }
        }
      },
      error: (err) => {
        console.error('Error loading course name:', err);
      }
    });
  }

  loadClassName(classId: number): void {
    this.subjectService.getClassById(classId).subscribe({
      next: (result) => {
        if (result && result.ok && result.data) {
          this.studentClass = result.data.name || '';
          console.log('Class name loaded:', this.studentClass);
        } else if (result && result.name) {
          // Handle direct class object response
          this.studentClass = result.name;
          console.log('Class name loaded (direct):', this.studentClass);
        }
      },
      error: (err) => {
        console.error('Error loading class name:', err);
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
              // Update enrolled courses with section name
              this.enrolledCourses = [];
              if (this.studentCourse) {
                this.enrolledCourses.push({
                  name: this.studentCourse,
                  class: section.name
                });
              }
              console.log('Section name loaded, enrolled courses:', this.enrolledCourses);
            }
          }
        },
        error: (err) => {
          console.error('Error loading section name:', err);
        }
      });
    }
  }

  loadStudentSubjectsAndContents(): void {
    if (!this.studentCourseId || !this.studentClassId) {
      return;
    }
    this.isLoadingStudentContents = true;

    this.subjectService.getSubjectsByCourseAndClass(this.studentCourseId, this.studentClassId).subscribe({
      next: (subjectsResult) => {
        const subjects: Subject[] = (subjectsResult && subjectsResult.ok && Array.isArray(subjectsResult.data))
          ? subjectsResult.data
          : (Array.isArray(subjectsResult) ? subjectsResult : []);

        console.log('Loaded subjects:', subjects.length, subjects);

        // Initialize with empty materials for all subjects
        this.studentSubjectItems = subjects.map((subject) => ({
          id: subject.id,
          name: subject.name,
          materials: [],
          videos: []
        }));

        // Use new student-materials endpoint that filters by section and visibility
        // Always pass sectionId if student has one, so backend can filter correctly
        // If student has no section, pass undefined to get all materials for the class
        const sectionIdParam = (this.studentSectionId !== null && this.studentSectionId !== undefined) 
          ? this.studentSectionId 
          : undefined;
        
        console.log('Loading student materials:', {
          classId: this.studentClassId,
          sectionId: sectionIdParam,
          courseId: this.studentCourseId,
          subjectsCount: subjects.length
        });

        this.subjectContentService.getStudentMaterials(
          this.studentClassId!,
          sectionIdParam,
          undefined
        ).subscribe({
          next: (contentResult) => {
            console.log('Student materials response:', contentResult);
            const contents: SubjectContent[] = (contentResult && contentResult.ok && Array.isArray(contentResult.data))
              ? contentResult.data
              : [];

            console.log('Loaded contents:', contents.length, contents);

            // Map materials to subjects
            this.studentSubjectItems = subjects.map((subject) => {
              // Match materials by subjectId - ensure type comparison works
              const subjectContents = contents.filter((c) => {
                const contentSubjectId = typeof c.subjectId === 'string' ? parseInt(c.subjectId) : c.subjectId;
                const subjId = typeof subject.id === 'string' ? parseInt(subject.id) : subject.id;
                return contentSubjectId === subjId;
              });
              
              console.log(`Subject ${subject.name} (ID: ${subject.id}) has ${subjectContents.length} materials`);
              
              const materials = subjectContents
                .filter((c) => c.type !== 'VIDEO')
                .map((c) => ({
                  ...c,
                  name: c.title,
                  fileData: c.fileData,
                  linkUrl: c.linkUrl,
                  fileUrl: c.fileUrl
                }));
              const videos = subjectContents
                .filter((c) => c.type === 'VIDEO')
                .map((c) => ({
                  ...c,
                  name: c.title,
                  linkUrl: c.linkUrl || c.fileData,
                  fileUrl: c.fileUrl
                }));
              return {
                id: subject.id,
                name: subject.name,
                materials: materials || [],
                videos: videos || []
              };
            });
            
            console.log('Student subject items:', this.studentSubjectItems);
            console.log('Total subjects:', this.studentSubjectItems.length);
            console.log('Subjects with materials:', this.studentSubjectItems.filter(s => s.materials.length > 0 || s.videos.length > 0).length);
            this.isLoadingStudentContents = false;
          },
          error: (err) => {
            console.error('Error loading student materials:', err);
            // Keep subjects even if materials fail to load
            this.isLoadingStudentContents = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading subjects:', err);
        this.isLoadingStudentContents = false;
        this.studentSubjectItems = [];
      }
    });
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

  viewMaterial(material: any): void {
    this.selectedMaterial = material as SubjectContent;
    this.showMaterialModal = true;
  }

  closeMaterialModal(): void {
    this.showMaterialModal = false;
    this.selectedMaterial = null;
  }

  openMaterialContent(): void {
    if (!this.selectedMaterial) return;
    
    // Priority: linkUrl > fileUrl > fileData
    if (this.selectedMaterial.linkUrl) {
      window.open(this.selectedMaterial.linkUrl, '_blank');
      return;
    }
    
    if (this.selectedMaterial.fileUrl) {
      window.open(this.selectedMaterial.fileUrl, '_blank');
      return;
    }
    
    if (this.selectedMaterial.fileData) {
      // Try to open in new tab, fallback to download
      try {
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`<iframe src="${this.selectedMaterial.fileData}" style="width:100%;height:100%;border:none;"></iframe>`);
        } else {
          // Popup blocked, download instead
          this.downloadMaterial(this.selectedMaterial);
        }
      } catch (e) {
        // Fallback to download
        this.downloadMaterial(this.selectedMaterial);
      }
      return;
    }
    
    alert('No content available for this material.');
  }

  downloadMaterial(material: any): void {
    if (material.fileData) {
      const link = document.createElement('a');
      link.href = material.fileData;
      link.download = material.fileName || material.title || 'material';
      link.click();
      return;
    }
    if (material.fileUrl) {
      window.open(material.fileUrl, '_blank');
      return;
    }
    if (material.linkUrl) {
      window.open(material.linkUrl, '_blank');
    }
  }

  watchVideo(video: any): void {
    this.viewMaterial(video);
  }

  viewFeedback(assignment: any): void {
    this.viewAssignmentDetails(assignment);
  }

  // ========== ASSIGNMENT METHODS ==========
  
  onAssignmentsTabClick(): void {
    this.activeTab = 'assignments';
    if (this.studentId && this.studentClassId) {
      this.loadAssignments();
    }
  }

  onExamsTabClick(): void {
    this.activeTab = 'exams';
    this.loadExams();
  }

  loadExams(): void {
    if (!this.studentId) return;
    this.isLoadingExams = true;
    this.examService.getExamsForStudent(this.studentId).subscribe({
      next: (res: any) => {
        if (res?.ok && Array.isArray(res.data)) {
          this.exams = res.data;
          this.upcomingExams = res.data
            .filter((e: any) => !e.attempted && e.status === 'live')
            .slice(0, 5)
            .map((e: any) => ({
              name: e.name,
              date: this.formatDate(e.examDate)
            }));
        } else {
          this.exams = [];
          this.upcomingExams = [];
        }
        this.isLoadingExams = false;
      },
      error: () => {
        this.exams = [];
        this.upcomingExams = [];
        this.isLoadingExams = false;
      }
    });
  }

  onNoticesTabClick(): void {
    this.activeTab = 'notices';
    this.loadStudentNotices();
  }

  loadStudentNotices(): void {
    const user = this.auth.getUser();
    const entityId = user?.collegeId || 1;
    const userId = user?.id;
    if (!userId) {
      console.warn('No user id found for student, cannot load notices');
      return;
    }
    this.isLoadingNotices = true;
    this.noticeService.getStudentNotices(
      entityId, 
      userId, 
      this.studentCourseId || undefined, 
      this.studentClassId || undefined, 
      this.studentSectionId || undefined
    ).subscribe({
      next: (res: any) => {
        const data = res && res.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.studentNotices = data || [];
        this.isLoadingNotices = false;
      },
      error: (err) => {
        console.error('Error loading student notices', err);
        this.isLoadingNotices = false;
      }
    });
  }

  viewNotice(notice: any): void {
    this.selectedNotice = notice;
    this.showNoticeModal = true;
    
    // Mark as read if not already read
    if (!notice.isRead) {
      const user = this.auth.getUser();
      const userId = user?.id;
      if (userId && notice.id) {
        this.noticeService.markRead(notice.id, userId, 'STUDENT').subscribe({
          next: () => {
            // Update local state
            const index = this.studentNotices.findIndex(n => n.id === notice.id);
            if (index !== -1) {
              this.studentNotices[index].isRead = true;
            }
          },
          error: (err) => {
            console.error('Error marking notice as read:', err);
          }
        });
      }
    }
  }

  closeNoticeModal(): void {
    this.showNoticeModal = false;
    this.selectedNotice = null;
  }

  downloadNoticeAttachment(notice: any): void {
    if (notice.attachmentData) {
      const link = document.createElement('a');
      link.href = notice.attachmentData;
      link.download = notice.attachmentName || 'attachment';
      link.click();
    } else if (notice.attachmentUrl) {
      window.open(notice.attachmentUrl, '_blank');
    }
  }

  // Announcements Methods
  onAnnouncementsTabClick(): void {
    this.activeTab = 'announcements';
    this.loadStudentAnnouncements();
  }

  loadStudentAnnouncements(): void {
    const user = this.auth.getUser();
    const entityId = user?.collegeId || 1;
    const userId = user?.id;
    if (!userId) {
      console.warn('No user id found for student, cannot load announcements');
      return;
    }
    
    console.log('🔄 Loading student announcements:', {
      entityId,
      userId,
      courseId: this.studentCourseId,
      classId: this.studentClassId,
      sectionId: this.studentSectionId
    });
    
    this.isLoadingAnnouncements = true;
    this.announcementService.getAnnouncementsForStudent(
      entityId,
      userId,
      this.studentCourseId || undefined,
      this.studentClassId || undefined,
      this.studentSectionId || undefined,
      undefined // subjectId - optional
    ).subscribe({
      next: (res: any) => {
        console.log('✅ Student announcements API response:', res);
        const data = res && res.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        console.log('✅ Loaded ' + data.length + ' announcements');
        // Mark all as unread initially (will be updated when viewed)
        this.studentAnnouncements = (data || []).map((a: any) => ({
          ...a,
          isRead: false
        }));
        this.isLoadingAnnouncements = false;
      },
      error: (err) => {
        console.error('❌ Error loading student announcements:', err);
        this.studentAnnouncements = [];
        this.isLoadingAnnouncements = false;
      }
    });
  }

  viewAnnouncement(announcement: any): void {
    this.selectedAnnouncement = announcement;
    this.showAnnouncementModal = true;
    
    // Mark as read if not already read
    if (!announcement.isRead) {
      const user = this.auth.getUser();
      const userId = user?.id;
      if (userId) {
        // Update local state
        const index = this.studentAnnouncements.findIndex(a => a.id === announcement.id);
        if (index !== -1) {
          this.studentAnnouncements[index].isRead = true;
        }
        // For admin notices, mark via notice service
        if (announcement.source === 'ADMIN' && announcement.id) {
          this.noticeService.markRead(announcement.id, userId, 'STUDENT').subscribe({
            next: () => {
              console.log('Notice marked as read');
            },
            error: (err) => {
              console.error('Error marking notice as read:', err);
            }
          });
        }
        // For teacher announcements, we can track read status locally
        // (No backend endpoint needed for now, but can be added if required)
      }
    }
  }

  closeAnnouncementModal(): void {
    this.showAnnouncementModal = false;
    this.selectedAnnouncement = null;
  }

  downloadAnnouncementAttachment(announcement: any): void {
    if (announcement.attachmentData) {
      const link = document.createElement('a');
      link.href = announcement.attachmentData;
      link.download = announcement.attachmentName || 'attachment';
      link.click();
    } else if (announcement.attachmentUrl) {
      window.open(announcement.attachmentUrl, '_blank');
    }
  }

  getSubjectNameById(subjectId: number | undefined): string {
    if (!subjectId) return 'N/A';
    // Try to find in student's subjects
    const subject = this.studentSubjectItems.find(s => s.id === subjectId);
    return subject ? (subject.subjectCode ? `${subject.subjectCode} - ${subject.name}` : subject.name) : 'N/A';
  }

  formatAnnouncementDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  }
  
  loadAssignments(): void {
    if (!this.studentId || !this.studentClassId) {
      console.log('Cannot load assignments: studentId or classId not set', {
        studentId: this.studentId,
        classId: this.studentClassId,
        sectionId: this.studentSectionId
      });
      return;
    }
    
    console.log('🔄 Loading assignments for student:', {
      studentId: this.studentId,
      classId: this.studentClassId,
      sectionId: this.studentSectionId
    });
    
    this.isLoadingAssignments = true;
    this.assignmentService.getStudentAssignments(
      this.studentId,
      this.studentClassId,
      this.studentSectionId || undefined,
      undefined
    ).subscribe({
      next: (result: any) => {
        console.log('✅ Assignments API response:', result);
        if (result.ok && result.data) {
          this.assignments = result.data;
          console.log('✅ Loaded ' + this.assignments.length + ' assignments');
          if (this.assignments.length > 0) {
            console.log('📝 First assignment:', this.assignments[0]);
          }
        } else {
          console.warn('⚠️ No assignments in response:', result);
          this.assignments = [];
        }
        this.isLoadingAssignments = false;
      },
      error: (err) => {
        console.error('❌ Error loading assignments:', err);
        console.error('❌ Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        });
        this.assignments = [];
        this.isLoadingAssignments = false;
        alert('Error loading assignments: ' + (err.error?.message || err.message || 'Unknown error'));
      }
    });
  }
  
  getAssignmentStatus(assignment: any): string {
    if (!assignment.submissionStatus || assignment.submissionStatus === 'not_submitted') {
      return 'Not Submitted';
    }
    if (assignment.isLate) {
      return 'Late Submitted';
    }
    if (assignment.marks !== null && assignment.marks !== undefined) {
      return 'Evaluated';
    }
    return 'Submitted';
  }
  
  getStatusClass(status: string): string {
    switch(status) {
      case 'Not Submitted': return 'pending';
      case 'Late Submitted': return 'late';
      case 'Evaluated': return 'evaluated';
      case 'Submitted': return 'submitted';
      default: return 'pending';
    }
  }
  
  viewAssignmentDetails(assignment: any): void {
    this.selectedAssignment = assignment;
    this.showAssignmentDetailModal = true;
  }

  uploadSubmission(assignment: any): void {
    this.selectedAssignment = assignment;
    this.submissionForm = {
      fileName: '',
      fileData: '',
      fileUrl: '',
      textAnswer: ''
    };
    this.showSubmissionModal = true;
  }
  
  onSubmissionFileSelect(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    
    this.submissionForm.fileName = file.name;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.submissionForm.fileData = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  submitAssignment(): void {
    if (!this.studentId || !this.selectedAssignment?.id) {
      alert('Missing student ID or assignment ID');
      return;
    }
    
    if (!this.submissionForm.fileName && !this.submissionForm.fileUrl && !this.submissionForm.textAnswer) {
      alert('Please provide a file or text answer');
      return;
    }
    
    this.assignmentService.submitAssignment(
      this.studentId,
      this.selectedAssignment.id,
      this.submissionForm
    ).subscribe({
      next: (result: any) => {
        if (result.ok) {
          alert('Assignment submitted successfully');
          this.showSubmissionModal = false;
          this.loadAssignments();
        } else {
          alert('Error: ' + (result.message || 'Failed to submit assignment'));
        }
      },
      error: (err) => {
        alert('Error submitting assignment: ' + (err.error?.message || err.message));
        console.error('Submission error:', err);
      }
    });
  }
  
  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }
  
  formatDateTime(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }
  
  getSubjectName(subjectId: number | undefined): string {
    if (!subjectId) return 'N/A';
    const subject = this.studentSubjectItems.find((s: any) => s.id === subjectId);
    return subject ? subject.name : 'N/A';
  }

  isImageFile(fileName: string | undefined): boolean {
    if (!fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowerFileName = fileName.toLowerCase();
    return imageExtensions.some(ext => lowerFileName.endsWith(ext));
  }

  downloadAssignmentFile(assignment: any): void {
    if (assignment.fileData) {
      const link = document.createElement('a');
      link.href = assignment.fileData;
      link.download = assignment.fileName || 'assignment-file';
      link.click();
    } else if (assignment.fileUrl) {
      window.open(assignment.fileUrl, '_blank');
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  updateTime(): void {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;
    
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    this.currentDate = `${day}/${month}/${year}`;
  }

  getAssignmentsCompletionPercentage(): number {
    const total = this.assignments.length;
    if (total === 0) return 0;
    const completed = this.assignments.filter((a: any) => 
      a.status === 'submitted' || a.status === 'evaluated'
    ).length;
    return Math.round((completed / total) * 100);
  }

  getExamsProgressPercentage(): number {
    if (this.upcomingExams.length === 0) return 0;
    // Simple progress based on number of exams (for visual purposes)
    return Math.min(100, (this.upcomingExams.length / 5) * 100);
  }

  attemptExam(exam: any): void {
    if (exam?.id) this.router.navigate(['/student/exam', exam.id]);
  }

  viewResults(exam: any): void {
    if (exam?.id && exam?.attemptId) {
      this.router.navigate(['/student/exam', exam.id], { queryParams: { attemptId: exam.attemptId } });
    }
  }

  downloadReceipt(receipt: any): void {
    console.log('Download receipt:', receipt);
    // TODO: Implement download receipt
  }
}
