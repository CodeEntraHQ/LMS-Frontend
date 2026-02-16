import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { SubjectService, Section, Subject, Course, ClassEntity } from '../../services/subject.service';
import { StudentService, Student } from '../../services/student.service';
import { TeacherService } from '../../services/teacher.service';
import { StudentPerformanceService, StudentPerformance } from '../../services/student-performance.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { SubjectContentService, SubjectContent } from '../../services/subject-content.service';
import { AssignmentService, AssignmentSummary } from '../../services/assignment.service';
import { TeacherAttendanceService } from '../../services/teacher-attendance.service';
import { NoticeService, Notice } from '../../services/notice.service';
import { AnnouncementService, Announcement } from '../../services/announcement.service';
import { ExamService, Exam } from '../../services/exam.service';
import { QuestionService, QuestionBank, QuestionBankOption } from '../../services/question.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  templateUrl: './teacher-dashboard.component.html',
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
      padding: 10px 20px;
      border-radius: 12px;
      background: var(--accent-green);
      color: white;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      border: none;
      position: relative;
      z-index: 1003;
      pointer-events: auto !important;
      user-select: none;
    }
    .btn-primary:hover{ 
      background: color-mix(in srgb, var(--accent-green) 85%, black);
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
      transition: all 0.2s;
    }
    .btn-secondary:hover{ 
      border-color: rgba(148,163,184,0.5);
      background: rgba(255, 255, 255, 0.05);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--border-gray);
      width: 100%;
      box-sizing: border-box;
      flex-shrink: 0;
      margin-left: auto;
      text-align: right;
    }
    .form-actions button {
      flex-shrink: 0;
      white-space: nowrap;
      margin-left: 0;
    }

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
      flex-wrap: wrap;
    }
    .class-selector label{
      font-weight: 700;
      color: var(--text-white);
    }

    .students-filters{
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .filter-group{
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .filter-group label{
      font-weight: 700;
      color: var(--text-white);
      white-space: nowrap;
    }
    .filter-group .form-select{
      min-width: 200px;
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

    .students-grid{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .student-card{
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      padding: 16px;
      transition: all 0.2s;
    }
    .student-card:hover{
      background: rgba(255,255,255,0.04);
      border-color: var(--accent-green);
    }

    .card-header{
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .card-header .student-avatar{
      width: 40px;
      height: 40px;
      min-width: 40px;
    }
    .card-header .student-info{
      flex: 1;
    }
    .card-header .student-name{
      font-weight: 800;
      font-size: 15px;
      margin-bottom: 2px;
    }
    .card-header .student-details{
      font-size: 13px;
      color: var(--text-gray);
    }

    .performance-snapshot{
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .performance-item{
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }
    .perf-label{
      color: var(--text-gray);
      font-weight: 600;
    }
    .perf-value{
      font-weight: 800;
      color: var(--accent-green);
    }
    .perf-value.good{
      color: #22c55e;
    }
    .perf-value.warning{
      color: #f59e0b;
    }

    .no-data{
      text-align: center;
      color: var(--text-gray);
      font-size: 13px;
      padding: 12px 0;
      margin: 0;
    }
    .attendance-summary-table {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }
    .summary-table-header {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1fr 1.5fr 2fr;
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
    .study-material-header {
      grid-template-columns: 1.2fr 2.5fr 1.8fr 1.8fr 2fr 2fr 2.5fr !important;
      gap: 24px !important;
      padding: 14px 20px !important;
    }
    .summary-table-row {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1fr 1.5fr 2fr;
      gap: 20px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      align-items: center;
      transition: all 0.2s;
    }
    .study-material-row {
      grid-template-columns: 1.2fr 2.5fr 1.8fr 1.8fr 2fr 2fr 2.5fr !important;
      gap: 24px !important;
      padding: 18px 20px !important;
    }
    .study-material-row span {
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .study-material-header span {
      font-size: 13px;
      letter-spacing: 0.5px;
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
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-badge.status-active {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--accent-green);
    }
    .status-badge.status-draft {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #f59e0b;
    }
    .status-badge.status-closed {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }
    .announcements-table {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }
    .announcements-table-header {
      display: grid;
      grid-template-columns: 2.5fr 1.5fr 1.5fr 1.2fr 1.8fr 2.5fr;
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
      grid-template-columns: 2.5fr 1.5fr 1.5fr 1.2fr 1.8fr 2.5fr;
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
    .announcement-subject-cell,
    .announcement-type-cell,
    .announcement-date-cell {
      font-size: 14px;
      color: var(--text-white);
      font-weight: 500;
    }
    .announcement-status-cell {
      display: flex;
      align-items: center;
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
    .announcement-actions-cell .btn-edit {
      background: rgba(245, 158, 11, 0.12);
      border-color: rgba(245, 158, 11, 0.25);
      color: #f59e0b;
    }
    .announcement-actions-cell .btn-edit:hover {
      background: rgba(245, 158, 11, 0.2);
      border-color: rgba(245, 158, 11, 0.4);
      transform: translateY(-1px);
    }
    .announcement-actions-cell .btn-delete {
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.25);
      color: #ef4444;
    }
    .announcement-actions-cell .btn-delete:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
      transform: translateY(-1px);
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
      display: flex !important;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      margin-bottom: 12px;
      width: 100%;
      box-sizing: border-box;
    }
    .attendance-item .student-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .attendance-item .student-name {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-white);
    }
    .attendance-item .student-roll {
      font-size: 13px;
      color: var(--text-gray);
    }
    /* Enhanced Attendance Styles */
    .attendance-view-toggle {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border-gray);
      padding-bottom: 12px;
    }
    .toggle-btn {
      padding: 10px 20px;
      background: transparent;
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      color: var(--text-gray);
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .toggle-btn:hover {
      border-color: var(--accent-green);
      color: var(--accent-green);
    }
    .toggle-btn.active {
      background: rgba(16, 185, 129, 0.1);
      border-color: var(--accent-green);
      color: var(--accent-green);
    }
    .attendance-filters, .history-filters, .student-wise-filters {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .filter-group label {
      font-size: 12px;
      color: var(--text-gray);
      font-weight: 700;
      text-transform: uppercase;
    }
    .attendance-status-indicator {
      display: flex;
      gap: 24px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-label {
      font-size: 13px;
      color: var(--text-gray);
      font-weight: 600;
    }
    .status-badge {
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-badge.completed {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--accent-green);
    }
    .status-badge.open {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #f59e0b;
    }
    .status-badge.locked {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }
    .status-value {
      font-size: 13px;
      color: var(--text-white);
      font-weight: 700;
    }
    .bulk-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 20px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      flex-wrap: wrap;
    }
    .attendance-summary {
      display: flex;
      gap: 20px;
      margin-left: auto;
      font-size: 14px;
      color: var(--text-gray);
    }
    .attendance-summary strong {
      color: var(--text-white);
      font-weight: 800;
    }
    .attendance-student-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .attendance-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border-gray);
    }
    .attendance-options{
      display: flex !important;
      gap: 8px;
      flex-shrink: 0;
      align-items: center;
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
      transition: all 0.2s;
      min-width: 80px;
      display: inline-block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    .attendance-btn:hover:not(:disabled) {
      opacity: 0.8;
      transform: translateY(-1px);
    }
    .attendance-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    .syllabus-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .syllabus-left, .syllabus-right {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 24px;
    }
    .syllabus-left {
      display: flex;
      flex-direction: column;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-white);
    }

    .form-hint {
      font-size: 12px;
      color: var(--text-gray);
      margin-top: 4px;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .form-header h3 {
      font-size: 18px;
      font-weight: 700;
      margin: 0;
    }

    .assignments-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .assignment-card {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
    }

    .assignment-info {
      flex: 1;
    }

    .assignment-info p {
      margin: 4px 0;
      font-size: 14px;
      color: var(--text-white);
    }

    .assignment-info a {
      color: var(--accent-green);
      text-decoration: none;
    }

    .assignment-info a:hover {
      text-decoration: underline;
    }

    .btn-view, .btn-edit, .btn-delete {
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
      margin-left: 8px;
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

    .btn-delete {
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.25);
    }

    .btn-delete:hover {
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .loading {
      text-align: center;
      padding: 20px;
      color: var(--text-gray);
      font-weight: 600;
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
      position: relative;
      z-index: 1001;
    }
    .student-modal {
      max-width: 700px;
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
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .close-btn:hover {
      color: var(--accent-green);
    }
    .modal-body {
      margin-bottom: 20px;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
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
    .detail-value a {
      color: var(--accent-green);
      text-decoration: none;
    }
    .detail-value a:hover {
      text-decoration: underline;
    }

    .submissions-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }
    
    .submission-item {
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
    }
    
    .submission-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    
    .submission-student-name {
      font-weight: 800;
      font-size: 16px;
      margin-bottom: 4px;
    }
    
    .submission-meta {
      font-size: 13px;
      color: var(--text-gray);
      margin-bottom: 4px;
    }
    
    .submission-time {
      font-size: 12px;
      color: var(--text-gray);
    }
    
    .submission-marks {
      font-size: 18px;
      font-weight: 900;
      color: var(--accent-green);
    }
    
    .submission-file, .submission-feedback {
      margin-top: 12px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      font-size: 14px;
    }
    
    .file-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      color: var(--text-white);
      font-weight: 700;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }
    
    .file-label svg {
      color: var(--accent-green);
    }
    
    .submission-attachment-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .submission-attachment-preview {
      border-radius: 12px;
      overflow: hidden;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border-gray);
    }
    
    .submission-attachment-image {
      width: 100%;
      max-height: 400px;
      object-fit: contain;
      display: block;
      background: rgba(0, 0, 0, 0.3);
    }
    
    .submission-file-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 12px;
      color: var(--text-gray);
    }
    
    .submission-file-preview svg {
      color: var(--accent-green);
    }
    
    .submission-file-preview span {
      font-weight: 700;
      color: var(--text-white);
    }
    
    .submission-file-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    
    .file-name-display {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-gray);
      font-size: 14px;
      font-weight: 600;
      flex: 1;
      min-width: 200px;
    }
    
    .file-name-display svg {
      color: var(--accent-green);
      flex-shrink: 0;
    }
    
    .btn-file-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 8px;
      color: var(--accent-green);
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }
    
    .btn-file-action:hover {
      background: rgba(16, 185, 129, 0.2);
      border-color: var(--accent-green);
      transform: translateY(-1px);
    }
    
    .btn-file-action svg {
      width: 16px;
      height: 16px;
    }
    
    .submission-actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }
    
    .status-submitted, .status-evaluated {
      color: var(--accent-green);
    }
    
    .status-late {
      color: #f59e0b;
    }
    
    .status-missing {
      color: #ef4444;
    }
    
    .late-badge {
      display: inline-block;
      padding: 2px 8px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 4px;
      color: #f59e0b;
      font-size: 11px;
      font-weight: 700;
      margin-left: 8px;
    }

    @media (max-width: 768px){
      .syllabus-layout {
        grid-template-columns: 1fr;
      }
      .student-details-grid {
        grid-template-columns: 1fr;
      }
      .nav{ padding: 0 20px; }
      .content{ padding: 18px 20px 16px; }
      .stats-grid{ grid-template-columns: 1fr; }
      .reports-grid{ grid-template-columns: 1fr; }
      .section-header{ flex-direction: column; align-items: flex-start; gap: 12px; }
      .attendance-controls, .attendance-filters, .history-filters, .student-wise-filters { flex-direction: column; }
      .bulk-actions { flex-direction: column; align-items: stretch; }
      .attendance-summary { margin-left: 0; margin-top: 12px; }
      .attendance-status-indicator { flex-direction: column; gap: 12px; }
    }
    
    /* History Styles */
    .attendance-history-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .history-item {
      padding: 20px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
    }
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .history-subject {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-white);
      margin-bottom: 4px;
    }
    .history-date {
      font-size: 13px;
      color: var(--text-gray);
    }
    .history-status {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .history-status.completed {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--accent-green);
    }
    .history-status.locked {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }
    .history-stats {
      display: flex;
      gap: 20px;
      margin-bottom: 12px;
      font-size: 14px;
      color: var(--text-gray);
    }
    .history-stats strong {
      color: var(--text-white);
      font-weight: 800;
    }
    
    /* Student-wise Styles */
    .student-wise-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .student-attendance-item {
      padding: 20px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .student-attendance-item.low-attendance {
      border-color: rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.05);
    }
    .attendance-stats {
      display: flex;
      gap: 24px;
      align-items: center;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .stat-label {
      font-size: 12px;
      color: var(--text-gray);
      font-weight: 600;
      text-transform: uppercase;
    }
    .stat-value {
      font-size: 18px;
      font-weight: 900;
      color: var(--text-white);
    }
    .stat-value.good {
      color: var(--accent-green);
    }
    .stat-value.warning {
      color: #f59e0b;
    }

    /* Correction Modal Styles */
    .correction-info {
      padding: 16px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .correction-info p {
      margin: 8px 0;
      font-size: 14px;
    }
    .correction-info strong {
      color: var(--text-white);
      font-weight: 800;
    }
    .info-text {
      color: var(--text-gray);
      font-size: 13px;
      margin-top: 8px;
    }
    .current-status {
      padding: 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
    }
    .status-badge.present {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid #22c55e;
      color: #22c55e;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      display: inline-block;
    }
    .status-badge.absent {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #ef4444;
      color: #ef4444;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      display: inline-block;
    }
    .no-status {
      color: var(--text-gray);
      font-style: italic;
      font-size: 13px;
    }

    /* Attendance history details */
    .attendance-history-details {
      margin-top: 16px;
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      overflow: hidden;
    }
    .history-details-header,
    .history-details-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 8px;
      padding: 10px 12px;
      align-items: center;
    }
    .history-details-header {
      background: rgba(255, 255, 255, 0.03);
      font-size: 12px;
      text-transform: uppercase;
      color: var(--text-gray);
      font-weight: 700;
    }
    .history-details-row:nth-child(odd) {
      background: rgba(255, 255, 255, 0.01);
    }

    @media (max-width: 768px){
      .attendance-controls{ flex-direction: column; }
      .submission-header{ flex-direction: column; gap: 12px; }
    }
  `]
})
export class TeacherDashboardComponent implements OnInit {
  isDarkMode = true;
  activeTab: 'students' | 'study-material' | 'assignments' | 'exams' | 'questions' | 'attendance' | 'notices' | 'announcements' | 'reports' = 'students';
  
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
  teacherId: number | null = null;
  teacherMappings: any[] = [];
  courses: Course[] = [];
  coursesById: Record<number, Course> = {};
  selectedCourseId: number | null = null;
  classesList: ClassEntity[] = [];
  classesById: Record<number, ClassEntity> = {};
  sectionsById: Record<number, Section> = {};
  selectedClassId: number | null = null;
  selectedSectionId: number | null = null;
  isLoadingSections = false;
  isLoadingStudents = false;
  
  students: Student[] = [];
  selectedSubjectId: number | null = null;
  sectionSubjects: Subject[] = [];
  subjectsForFilter: Subject[] = [];
  selectedSubjectFilterId: number | null = null;
  studentPerformanceMap: Record<number, any> = {};
  isLoadingPerformance = false;

  getStudentPerformance(studentId: number | undefined): any {
    if (!studentId) return null;
    return this.studentPerformanceMap[studentId] || null;
  }

  studyMaterials = [
    { id: 1, name: 'Mathematics Chapter 1', type: 'pdf', class: 'Class 10A', subject: 'Mathematics', uploadDate: '30/01/2026' },
    { id: 2, name: 'Physics Video Lecture', type: 'video', class: 'Class 11A', subject: 'Physics', uploadDate: '29/01/2026' }
  ];
  teacherContents: SubjectContent[] = [];
  teacherSubjectsById: Record<number, Subject> = {};
  isLoadingTeacherContents = false;

  // Subject Content Form
  subjectContentForm: SubjectContent = {
    entityId: 0,
    subjectId: 0,
    type: 'SYLLABUS',
    title: '',
    description: '',
    unit: '',
    topicName: '',
    fileName: '',
    fileData: '',
    linkUrl: '',
    visibleToStudents: true,
    visibleToParents: false,
    teacherEditable: true,
    status: 'active'
  };
  selectedSubjectForContentId: number | null = null;
  subjectContentTypes = ['SYLLABUS', 'VIDEO', 'NOTES', 'PPT', 'REFERENCE'];
  subjectListSectionsByClass: Record<number, Section[]> = {};
  
  // Content Filters
  showContentFilters = false;
  contentSearch = {
    subjectId: '',
    type: '',
    unit: '',
    topic: '',
    status: '',
    visibleStudents: '',
    visibleParents: ''
  };
  contentFilterOptions = {
    types: [] as string[],
    units: [] as string[],
    topics: [] as string[],
    statuses: ['active', 'inactive']
  };
  
  // Teacher assigned subjects (filtered)
  teacherAssignedSubjects: Subject[] = [];
  
  // Subject Content Modal
  showSubjectContentModal = false;
  subjectContentModalMode: 'view' | 'edit' = 'view';
  selectedSubjectContent: SubjectContent | null = null;
  subjectContentEditForm: Partial<SubjectContent> = {};

  // Assignments
  assignments: AssignmentSummary[] = [];
  isLoadingAssignments = false;
  assignmentOverview: any = null;
  
  // Assignment Form
  assignmentForm: any = {
    title: '',
    description: '',
    instructions: '',
    subjectId: null,
    classId: null,
    sectionId: null,
    dueDate: '',
    dueTime: '',
    maxMarks: null,
    gradingType: 'NUMERIC',
    fileName: '',
    fileData: '',
    fileUrl: '',
    status: 'draft',
    lockAfterDueDate: false
  };
  
  assignmentEditForm: any = {};
  assignmentModalMode: 'create' | 'edit' = 'create';
  selectedAssignment: AssignmentSummary | null = null;
  
  // Submissions
  showSubmissionsModal = false;
  assignmentSubmissions: any[] = [];
  selectedAssignmentForSubmissions: AssignmentSummary | null = null;
  isLoadingSubmissions = false;
  
  // Evaluation
  evaluatingSubmission: any = null;
  evaluationForm = {
    marks: null as number | null,
    feedback: '',
    allowResubmit: false
  };

  // Notices (received) for teacher
  teacherNotices: any[] = [];
  isLoadingNotices = false;
  showNoticeModal = false;
  selectedNotice: any = null;
  
  // Analytics
  assignmentAnalytics: any = null;
  showAnalyticsModal = false;
  
  // Filters
  assignmentFilters = {
    subjectId: null as number | null,
    classId: null as number | null,
    sectionId: null as number | null,
    status: '' as string
  };
  
  gradingTypes = ['NUMERIC', 'LETTER', 'PASS_FAIL'];

  exams: any[] = [];
  isLoadingExams = false;
  examForm: any = {
    entityId: 0,
    courseId: 0,
    classId: 0,
    subjectId: null as number | null,
    sectionId: null as number | null,
    name: '',
    examType: 'UNIT_TEST',
    totalMarks: 100,
    passingMarks: 33,
    durationMinutes: 60,
    examDate: '',
    startTime: '',
    endTime: '',
    instructions: ''
  };
  examTypes = ['MCQ', 'SUBJECTIVE', 'PRACTICAL', 'UNIT_TEST', 'MID_TERM', 'FINAL_EXAM', 'PRACTICAL_EXAM'];
  examModalMode: 'create' | 'edit' = 'create';
  selectedExamForEdit: any = null;
  selectedExamForView: any = null;
  showExamViewModal = false;
  selectedExamForEvaluate: any = null;
  showEvaluateModal = false;
  examAttemptsForEvaluate: any[] = [];
  isLoadingAttempts = false;
  evaluatingAttempt: any = null;
  examEvaluationForm = { marks: 0, feedback: '' };

  announcements: Announcement[] = [];
  isLoadingAnnouncements = false;
  announcementForm: any = {
    title: '',
    description: '',
    announcementType: 'Assignment reminder',
    subjectId: undefined,
    classId: undefined,
    sectionId: undefined,
    status: 'draft',
    publishAt: '',
    scheduleAt: '',
    attachmentData: '',
    attachmentName: '',
    attachmentType: ''
  };
  isEditingAnnouncement = false;
  selectedAnnouncement: Announcement | null = null;
  announcementTypes = ['Assignment reminder', 'Exam reminder', 'Extra class', 'Instructions'];

  studentPerformance = [
    { studentName: 'John Doe', averageScore: 85 },
    { studentName: 'Jane Smith', averageScore: 92 },
    { studentName: 'Mike Johnson', averageScore: 78 }
  ];

  attendanceSummary = [
    { class: 'Class 10A', present: 28, absent: 2, total: 30 },
    { class: 'Class 10B', present: 25, absent: 5, total: 30 }
  ];

  // Attendance Properties
  attendanceView: 'mark' | 'history' | 'student-wise' = 'mark';
  assignedSubjectsForAttendance: any[] = [];
  selectedAttendanceSubject: any = null;
  attendanceDate = new Date().toISOString().split('T')[0];
  attendanceStudents: any[] = [];
  currentAttendanceSession: any = null;
  isLoadingAttendance = false;
  isSavingAttendance = false;
  attendanceHistory: any[] = [];
  isLoadingHistory = false;
  historySubjectId: number | null = null;
  historyFromDate: string = '';
  historyToDate: string = '';
  studentWiseAttendance: any[] = [];
  isLoadingStudentWise = false;
  studentWiseSubjectId: number | null = null;

  // Attendance history details modal
  showHistoryDetailsModal = false;
  historyDetailsSession: any = null;
  historyDetailsEntries: any[] = [];
  showCorrectionModal = false;
  correctionForm: any = {
    studentId: null,
    requestedStatus: 'present',
    reason: ''
  };
  isSubmittingCorrection = false;

  showUploadModal = false;
  showAssignmentModal = false;
  showExamModal = false;
  showAnnouncementModal = false;
  canCreateExam = true;

  // Questions (Question Bank)
  questions: any[] = [];
  isLoadingQuestions = false;
  questionForm: any = {
    entityId: 0,
    courseId: 0,
    classId: 0,
    subjectId: null as number | null,
    questionText: '',
    questionType: 'MCQ_SINGLE',
    marks: 1,
    difficulty: 'medium',
    chapterUnit: ''
  };
  questionOptions: { optionText: string; isCorrect: boolean }[] = [
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false }
  ];
  showQuestionModal = false;
  questionModalMode: 'create' | 'edit' | 'view' = 'create';
  selectedQuestionForEdit: any = null;
  questionFilterSubjectId: number | null = null;
  questionFilterChapter = '';
  questionTypes = ['MCQ_SINGLE', 'MCQ_MULTIPLE', 'DESCRIPTIVE', 'ONE_WORD', 'FILE_UPLOAD'];
  difficultyLevels = ['easy', 'medium', 'hard'];

  showAddFromBankModal = false;
  bankQuestionsForExam: any[] = [];
  selectedBankQuestionIds: number[] = [];
  isLoadingBankQuestions = false;

  constructor(
    private theme: ThemeService,
    private auth: AuthService,
    private router: Router,
    private profileService: ProfileService,
    private subjectService: SubjectService,
    private studentService: StudentService,
    private teacherService: TeacherService,
    private teacherAttendanceService: TeacherAttendanceService,
    private subjectContentService: SubjectContentService,
    private studentPerformanceService: StudentPerformanceService,
    private assignmentService: AssignmentService,
    private noticeService: NoticeService,
    private announcementService: AnnouncementService,
    private examService: ExamService,
    private questionService: QuestionService,
    private cdr: ChangeDetectorRef
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
    // Load available courses for filters
    this.loadCourses();
    // Load teacher assigned subjects for study material
    this.loadTeacherAssignedSubjects();
    
    // Load assignments will be called after teacherId is loaded
  }

  onNoticesTabClick(): void {
    this.activeTab = 'notices';
    this.loadTeacherNotices();
  }

  loadTeacherNotices(): void {
    const user = this.auth.getUser();
    const entityId = user?.collegeId || 1;
    const userId = user?.id;
    if (!userId) {
      console.warn('No user id found for teacher, cannot load notices');
      return;
    }
    this.isLoadingNotices = true;
    this.noticeService.getTeacherNotices(entityId, userId).subscribe({
      next: (res: any) => {
        const data = res && res.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.teacherNotices = data || [];
        this.isLoadingNotices = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading teacher notices', err);
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
        this.noticeService.markRead(notice.id, userId, 'TEACHER').subscribe({
          next: () => {
            // Update local state
            const index = this.teacherNotices.findIndex(n => n.id === notice.id);
            if (index !== -1) {
              this.teacherNotices[index].isRead = true;
            }
            this.cdr.detectChanges();
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

  // Announcement Methods
  showAnnouncementFilters = false;
  announcementFilters: any = {
    subjectId: undefined,
    status: '',
    type: ''
  };

  onAnnouncementsTabClick(): void {
    this.activeTab = 'announcements';
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    if (!this.teacherId) {
      console.warn('Teacher ID not available');
      return;
    }
    this.isLoadingAnnouncements = true;
    this.announcementService.getAnnouncementsForTeacher(
      this.teacherId,
      this.announcementFilters.subjectId,
      undefined,
      undefined,
      this.announcementFilters.status || undefined
    ).subscribe({
      next: (res: any) => {
        let data = res && res.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        
        // Filter by type if specified
        if (this.announcementFilters.type) {
          data = data.filter((a: Announcement) => a.announcementType === this.announcementFilters.type);
        }
        
        this.announcements = data || [];
        this.isLoadingAnnouncements = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading announcements:', err);
        this.announcements = [];
        this.isLoadingAnnouncements = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateAnnouncementModal(): void {
    this.isEditingAnnouncement = false;
    this.selectedAnnouncement = null;
    this.announcementForm = {
      title: '',
      description: '',
      announcementType: 'Assignment reminder',
      subjectId: undefined,
      classId: undefined,
      sectionId: undefined,
      status: 'draft',
      publishAt: '',
      scheduleAt: '',
      attachmentData: '',
      attachmentName: '',
      attachmentType: ''
    };
    this.showAnnouncementModal = true;
  }

  onAnnouncementSubjectChange(): void {
    if (!this.announcementForm.subjectId) {
      this.announcementForm.classId = undefined;
      this.announcementForm.sectionId = undefined;
      return;
    }
    
    // Normalize subjectId to number
    const subjectId = typeof this.announcementForm.subjectId === 'string' 
      ? parseInt(this.announcementForm.subjectId) 
      : this.announcementForm.subjectId;
    
    if (isNaN(subjectId)) {
      this.announcementForm.classId = undefined;
      this.announcementForm.sectionId = undefined;
      return;
    }
    
    // Find the subject in teacherAssignedSubjects to get classId
    const subject = this.teacherAssignedSubjects.find(s => s.id === subjectId);
    if (subject && subject.classId) {
      this.announcementForm.classId = subject.classId;
    }
    
    // Reset section to undefined (will show "All Sections" option)
    this.announcementForm.sectionId = undefined;
    
    // Force change detection to update section dropdown
    this.cdr.detectChanges();
  }

  onAnnouncementSubjectFilterChange(): void {
    this.loadAnnouncements();
  }

  resetAnnouncementFilters(): void {
    this.announcementFilters = {
      subjectId: undefined,
      status: '',
      type: ''
    };
    this.loadAnnouncements();
  }

  viewAnnouncement(announcement: Announcement): void {
    this.selectedAnnouncement = announcement;
    this.isEditingAnnouncement = false;
    this.showAnnouncementModal = true;
  }

  editAnnouncement(announcement: Announcement): void {
    this.selectedAnnouncement = announcement;
    this.isEditingAnnouncement = true;
    this.announcementForm = {
      id: announcement.id,
      title: announcement.title || '',
      description: announcement.description || '',
      announcementType: announcement.announcementType || 'Assignment reminder',
      subjectId: announcement.subjectId,
      classId: announcement.classId,
      sectionId: announcement.sectionId,
      status: announcement.status || 'draft',
      publishAt: announcement.publishAt ? this.formatDateTimeForInput(announcement.publishAt) : '',
      scheduleAt: announcement.scheduleAt ? this.formatDateTimeForInput(announcement.scheduleAt) : '',
      attachmentData: announcement.attachmentData || '',
      attachmentName: announcement.attachmentName || '',
      attachmentType: announcement.attachmentType || ''
    };
    this.showAnnouncementModal = true;
  }

  deleteAnnouncement(announcement: Announcement): void {
    if (!this.teacherId || !announcement.id) return;
    if (!confirm(`Delete "${announcement.title}"? This action cannot be undone.`)) return;
    
    this.announcementService.deleteAnnouncement(announcement.id, this.teacherId).subscribe({
      next: (result: any) => {
        if (result && result.ok) {
          alert('Announcement deleted successfully');
          this.loadAnnouncements();
        } else {
          alert('Error: ' + (result.message || 'Failed to delete announcement'));
        }
      },
      error: (err) => {
        alert('Error deleting announcement: ' + (err.error?.message || err.message));
        console.error('Error deleting announcement:', err);
      }
    });
  }

  saveAnnouncement(): void {
    if (!this.teacherId) {
      alert('Teacher ID not available');
      return;
    }

    if (!this.announcementForm.title || !this.announcementForm.subjectId) {
      alert('Title and Subject are required');
      return;
    }

    if (this.announcementForm.status === 'scheduled' && !this.announcementForm.scheduleAt) {
      alert('Schedule date & time is required for scheduled announcements');
      return;
    }

    const user = this.auth.getUser();
    const entityId = user?.collegeId || 1;
    const userId = user?.id || this.teacherId;

    // Format dates
    let publishAt = null;
    let scheduleAt = null;
    
    if (this.announcementForm.status === 'published') {
      publishAt = new Date().toISOString();
    } else if (this.announcementForm.status === 'scheduled' && this.announcementForm.scheduleAt) {
      scheduleAt = new Date(this.announcementForm.scheduleAt).toISOString();
      publishAt = scheduleAt;
    }

    const announcementData: Announcement = {
      entityId: entityId,
      title: this.announcementForm.title,
      description: this.announcementForm.description || '',
      announcementType: this.announcementForm.announcementType,
      subjectId: this.announcementForm.subjectId,
      classId: this.announcementForm.classId,
      sectionId: this.announcementForm.sectionId || undefined,
      status: this.announcementForm.status,
      publishAt: publishAt || undefined,
      scheduleAt: scheduleAt || undefined,
      attachmentData: this.announcementForm.attachmentData || undefined,
      attachmentName: this.announcementForm.attachmentName || undefined,
      attachmentType: this.announcementForm.attachmentType || undefined
    };

    if (this.isEditingAnnouncement && this.announcementForm.id) {
      // Update
      this.announcementService.updateAnnouncement(this.announcementForm.id, this.teacherId, announcementData, userId).subscribe({
        next: (result: any) => {
          if (result && result.ok) {
            alert('Announcement updated successfully');
            this.closeAnnouncementModal();
            this.loadAnnouncements();
          } else {
            alert('Error: ' + (result.message || 'Failed to update announcement'));
          }
        },
        error: (err) => {
          alert('Error updating announcement: ' + (err.error?.message || err.message));
          console.error('Error updating announcement:', err);
        }
      });
    } else {
      // Create
      this.announcementService.createAnnouncement(this.teacherId, announcementData, userId).subscribe({
        next: (result: any) => {
          if (result && result.ok) {
            alert('Announcement created successfully');
            this.closeAnnouncementModal();
            this.loadAnnouncements();
          } else {
            alert('Error: ' + (result.message || 'Failed to create announcement'));
          }
        },
        error: (err) => {
          alert('Error creating announcement: ' + (err.error?.message || err.message));
          console.error('Error creating announcement:', err);
        }
      });
    }
  }

  onAnnouncementAttachmentSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.announcementForm.attachmentData = result;
        this.announcementForm.attachmentName = file.name;
        this.announcementForm.attachmentType = file.type;
      };
      reader.readAsDataURL(file);
    }
  }

  downloadAnnouncementAttachment(announcement: Announcement): void {
    if (announcement.attachmentData) {
      const link = document.createElement('a');
      link.href = announcement.attachmentData;
      link.download = announcement.attachmentName || 'attachment';
      link.click();
    }
  }

  closeAnnouncementModal(): void {
    this.showAnnouncementModal = false;
    this.selectedAnnouncement = null;
    this.isEditingAnnouncement = false;
    this.announcementForm = {
      title: '',
      description: '',
      announcementType: 'Assignment reminder',
      subjectId: undefined,
      classId: undefined,
      sectionId: undefined,
      status: 'draft',
      publishAt: '',
      scheduleAt: '',
      attachmentData: '',
      attachmentName: '',
      attachmentType: ''
    };
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

  formatDateTimeForInput(dateStr: string | undefined): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  }

  loadCourses(): void {
    const user = this.auth.getUser();
    const entityId = user?.collegeId || 1;
    this.subjectService.getCoursesByEntity(entityId).subscribe({
      next: (res: any) => {
        const data = res && res.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.courses = data;
        this.coursesById = {};
        this.courses.forEach((c: Course) => { if (c.id) this.coursesById[c.id] = c; });
      },
      error: (err) => {
        console.error('Error loading courses:', err);
        this.courses = [];
      }
    });
  }

  onCourseChange(): void {
    this.selectedClassId = null;
    this.selectedSectionId = null;
    this.sectionSubjects = [];
    this.students = [];
    this.classesList = [];
    this.subjectsForFilter = [];
    this.selectedSubjectFilterId = null;

    if (!this.selectedCourseId) {
      // If no course selected, show all assigned subjects
      this.updateSubjectsForFilter();
      return;
    }
    this.subjectService.getClassesByCourse(this.selectedCourseId).subscribe({
      next: (res: any) => {
        const data = res && res.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.classesList = data;
        this.classesById = {};
        this.classesList.forEach((cl: ClassEntity) => { if (cl.id) this.classesById[cl.id] = cl; });
        this.updateSubjectsForFilter();
      },
      error: (err) => {
        console.error('Error loading classes for course:', err);
        this.classesList = [];
        this.updateSubjectsForFilter();
      }
    });
  }

  onClassChange(): void {
    this.selectedSectionId = null;
    this.sectionSubjects = [];
    this.students = [];
    this.assignedSections = [];
    this.selectedSubjectId = null;
    this.selectedSubjectFilterId = null;

    if (!this.selectedClassId) {
      // If no class selected, show all assigned subjects for the selected course
      this.updateSubjectsForFilter();
      return;
    }

    this.subjectService.getSectionsByClass(this.selectedClassId).subscribe({
      next: (res: any) => {
        const data = res && res.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        // Use sections for the selected class in the dropdown
        this.assignedSections = data.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
        this.sectionsById = {};
        this.assignedSections.forEach((sec: any) => { if (sec.id) this.sectionsById[sec.id] = sec; });
        // Update subjects after sections are loaded
        this.updateSubjectsForFilter();
      },
      error: (err) => {
        console.error('Error loading sections for class:', err);
        this.assignedSections = [];
        this.updateSubjectsForFilter();
      }
    });
  }

  getCourseName(courseId?: number | null): string {
    if (!courseId) return '—';
    if (this.coursesById[courseId]) return this.coursesById[courseId].name || '—';
    // fetch on demand
    this.subjectService.getCourseById(courseId).subscribe({
      next: (res: any) => {
        const data = res && res.data ? res.data : res;
        if (data && data.id) {
          this.coursesById[data.id] = data;
        }
      },
      error: () => {}
    });
    return '—';
  }

  getClassName(classId?: number | null): string {
    if (!classId) return '—';
    if (this.classesById[classId]) return this.classesById[classId].name || '—';
    this.subjectService.getClassById(classId).subscribe({
      next: (res: any) => {
        const data = res && res.data ? res.data : res;
        if (data && data.id) {
          this.classesById[data.id] = data;
        }
      },
      error: () => {}
    });
    return '—';
  }

  getSectionName(sectionId?: number | null): string {
    if (!sectionId) return '—';
    if (this.sectionsById[sectionId]) return this.sectionsById[sectionId].name || '—';
    this.subjectService.getSectionById(sectionId).subscribe({
      next: (res: any) => {
        const data = res && res.data ? res.data : res;
        if (data && data.id) {
          this.sectionsById[data.id] = data;
        }
      },
      error: () => {}
    });
    return '—';
  }

  loadProfileImage(): void {
    this.profileService.getProfile(this.userEmail).subscribe(result => {
      if (result.ok && result.profile.profileImage) {
        this.profileImage = result.profile.profileImage;
      }
    });
  }

  get filteredStudents(): Student[] {
    let list = this.students || [];

    // Subject filter is optional - show all students in the section
    // The subject filter can be used to filter performance data display, but not hide students
    // If you want to filter by subject enrollment, you would need additional student-subject mapping data
    
    // For now, show all students in the selected section
    // Subject selection can be used for filtering performance data in the display
    return list;
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
            this.teacherId = teacher.id;
            
            // Load assignments after teacherId is set (always load, even if tab not active)
            // This ensures assignments are available when user navigates to the tab
            console.log('✅ TeacherId loaded:', this.teacherId, '- Loading assignments...');
            setTimeout(() => {
              this.loadAssignments();
            }, 100); // Small delay to ensure everything is initialized
            
            this.subjectService.getMappingsByTeacher(teacher.id).subscribe({
              next: (mappingResult: any) => {
                this.isLoadingSections = false;
                this.teacherMappings = mappingResult.data || [];
                if (mappingResult.ok && mappingResult.data) {
                  // Extract unique section IDs
                  const sectionIds = Array.from(new Set(
                    mappingResult.data
                      .filter((m: any) => m.sectionId)
                      .map((m: any) => Number(m.sectionId))
                      .filter((id: number) => !isNaN(id))
                  )) as number[];

                  this.loadTeacherContents(entityId, mappingResult.data);
                  
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
      this.sectionsById = {};
      this.assignedSections.forEach((sec: any) => { if (sec.id) this.sectionsById[sec.id] = sec; });
    }).catch(err => {
      console.error('Error loading section details:', err);
    });
  }

  loadTeacherAssignedSubjects(): void {
    const user = this.auth.getUser();
    const entityId = user?.collegeId || 1;
    
    if (!this.teacherId) {
      // Wait for teacher ID to be loaded
      setTimeout(() => this.loadTeacherAssignedSubjects(), 500);
      return;
    }
    
    this.subjectService.getMappingsByTeacher(this.teacherId).subscribe({
      next: (mappingResult: any) => {
        if (mappingResult.ok && mappingResult.data) {
          // Update teacherMappings so getAssignedSectionsForSubject can use it
          this.teacherMappings = mappingResult.data;
          
    const subjectIds = Array.from(new Set(
            mappingResult.data
        .filter((m: any) => m.subjectId)
        .map((m: any) => Number(m.subjectId))
        .filter((id: number) => !isNaN(id))
          )) as number[];

    if (subjectIds.length === 0) {
            this.teacherAssignedSubjects = [];
      return;
    }

          // Also ensure sections are loaded for the assigned sections
          const sectionIds = Array.from(new Set(
            mappingResult.data
              .filter((m: any) => m.sectionId)
              .map((m: any) => Number(m.sectionId))
              .filter((id: number) => !isNaN(id))
          )) as number[];
          
          // Load section details if not already loaded
          if (sectionIds.length > 0) {
            const missingSectionIds = sectionIds.filter(id => !this.sectionsById[id]);
            if (missingSectionIds.length > 0) {
              this.loadSectionDetails(missingSectionIds);
            }
          }
          
    this.subjectService.getSubjectsByEntity(entityId).subscribe({
      next: (result) => {
              const allSubjects = (result && result.data && Array.isArray(result.data)) ? result.data : (Array.isArray(result) ? result : []);
              this.teacherAssignedSubjects = allSubjects.filter((s: Subject) => s.id && subjectIds.includes(s.id));
        this.teacherSubjectsById = {};
              this.teacherAssignedSubjects.forEach((s: Subject) => {
          if (s.id) {
            this.teacherSubjectsById[s.id] = s;
          }
        });

              // Update subject filter with assigned subjects
              this.updateSubjectsForFilter();
              
              // Load contents for assigned subjects
              this.loadTeacherContents(entityId, mappingResult.data);
            },
            error: (err) => {
              console.error('Error loading assigned subjects:', err);
              this.teacherAssignedSubjects = [];
            }
          });
        }
      },
      error: (err) => {
        console.error('Error loading teacher mappings:', err);
      }
    });
  }

  loadTeacherContents(entityId: number, mappings: any[]): void {
    const subjectIds = Array.from(new Set(
      mappings
        .filter((m: any) => m.subjectId)
        .map((m: any) => Number(m.subjectId))
        .filter((id: number) => !isNaN(id))
    ));

    if (subjectIds.length === 0) {
          this.teacherContents = [];
      this.updateContentFilterOptions();
          return;
        }

    this.isLoadingTeacherContents = true;
    
    // Load contents for all assigned subjects
    const requests = subjectIds.map((subjectId) => this.subjectContentService.getBySubject(subjectId, 'TEACHER'));
        Promise.all(requests.map((req) => req.toPromise())).then((responses) => {
          const contents: SubjectContent[] = [];
          responses.forEach((res: any) => {
            if (res && res.ok && Array.isArray(res.data)) {
              contents.push(...res.data);
            }
          });
      
      // Filter to only show content for assigned subjects
      // Also show content created by this teacher
      const user = this.auth.getUser();
      this.teacherContents = contents.filter((content) => {
        const isAssignedSubject = content.subjectId && subjectIds.includes(content.subjectId);
        const isCreatedByTeacher = content.createdByUserId === user?.id && content.createdByRole === 'TEACHER';
        return isAssignedSubject || isCreatedByTeacher;
      });
      
      this.updateContentFilterOptions();
          this.isLoadingTeacherContents = false;
        }).catch(() => {
          this.isLoadingTeacherContents = false;
          this.teacherContents = [];
      this.updateContentFilterOptions();
        });
  }
  
  updateContentFilterOptions(): void {
    const types = new Set<string>();
    const units = new Set<string>();
    const topics = new Set<string>();
    
    this.teacherContents.forEach((content) => {
      if (content.type) types.add(content.type);
      if (content.unit) units.add(content.unit);
      if (content.topicName) topics.add(content.topicName);
    });
    
    this.contentFilterOptions.types = Array.from(types).sort();
    this.contentFilterOptions.units = Array.from(units).sort();
    this.contentFilterOptions.topics = Array.from(topics).sort();
  }
  
  get filteredTeacherContents(): SubjectContent[] {
    const filters = {
      subjectId: this.normalizeFilterValue(this.contentSearch.subjectId),
      type: this.normalizeFilterValue(this.contentSearch.type),
      unit: this.normalizeFilterValue(this.contentSearch.unit),
      topic: this.normalizeFilterValue(this.contentSearch.topic),
      status: this.normalizeFilterValue(this.contentSearch.status),
      visibleStudents: this.normalizeFilterValue(this.contentSearch.visibleStudents),
      visibleParents: this.normalizeFilterValue(this.contentSearch.visibleParents)
    };

    return this.teacherContents.filter((content) => {
      const visibleStudents = content.visibleToStudents ? 'yes' : 'no';
      const visibleParents = content.visibleToParents ? 'yes' : 'no';
      return (!filters.subjectId || this.normalizeFilterValue(String(content.subjectId)) === filters.subjectId)
        && (!filters.type || this.normalizeFilterValue(content.type).includes(filters.type))
        && (!filters.unit || this.normalizeFilterValue(content.unit || '').includes(filters.unit))
        && (!filters.topic || this.normalizeFilterValue(content.topicName || '').includes(filters.topic))
        && (!filters.status || this.normalizeFilterValue(content.status || '').includes(filters.status))
        && (!filters.visibleStudents || this.normalizeFilterValue(visibleStudents) === filters.visibleStudents)
        && (!filters.visibleParents || this.normalizeFilterValue(visibleParents) === filters.visibleParents);
    });
  }
  
  normalizeFilterValue(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value).toLowerCase().trim();
  }
  
  onSubjectContentSubjectChange(): void {
    if (!this.selectedSubjectForContentId) {
      this.subjectContentForm.subjectId = 0;
      this.subjectContentForm.classId = undefined;
      this.subjectContentForm.sectionId = undefined;
      return;
    }
    
    const subjectId = typeof this.selectedSubjectForContentId === 'string'
      ? parseInt(this.selectedSubjectForContentId)
      : this.selectedSubjectForContentId;
    
    const subject = this.teacherAssignedSubjects.find(s => s.id === subjectId);
    if (subject) {
      this.subjectContentForm.subjectId = subjectId;
      this.subjectContentForm.classId = subject.classId || undefined;
      // Reset section when subject changes
      this.subjectContentForm.sectionId = undefined;
    }
  }
  
  onSectionChangeForContent(sectionId: any): void {
    // Normalize sectionId to number or undefined
    if (sectionId === '' || sectionId === null || sectionId === undefined) {
      this.subjectContentForm.sectionId = undefined;
    } else {
      const normalizedId = typeof sectionId === 'string' ? parseInt(sectionId) : sectionId;
      this.subjectContentForm.sectionId = isNaN(normalizedId) ? undefined : normalizedId;
    }
  }
  
  getAssignedSectionsForSubject(subjectId: number | null | undefined): Section[] {
    if (!subjectId || !this.teacherMappings || this.teacherMappings.length === 0) {
      return [];
    }
    
    // Normalize subjectId to number for comparison
    const normalizedSubjectId = typeof subjectId === 'string' ? parseInt(subjectId) : subjectId;
    if (isNaN(normalizedSubjectId)) {
      return [];
    }
    
    // Get section IDs assigned to this teacher for this subject
    // Compare both as numbers to avoid type mismatch issues
    const assignedSectionIds = this.teacherMappings
      .filter((m: any) => {
        const mappingSubjectId = typeof m.subjectId === 'string' ? parseInt(m.subjectId) : m.subjectId;
        const matches = Number(mappingSubjectId) === Number(normalizedSubjectId) && m.sectionId;
        return matches;
      })
      .map((m: any) => {
        const sectionId = typeof m.sectionId === 'string' ? parseInt(m.sectionId) : m.sectionId;
        return Number(sectionId);
      })
      .filter((id: number) => !isNaN(id) && id > 0);
    
    if (assignedSectionIds.length === 0) {
      return [];
    }
    
    // Return sections from sectionsById that match assigned section IDs
    const assignedSections = assignedSectionIds
      .map((id: number) => this.sectionsById[id])
      .filter((section: Section | undefined): section is Section => section !== undefined);
    
    // If sections are not yet loaded, try to load them
    const missingSectionIds = assignedSectionIds.filter(id => !this.sectionsById[id]);
    if (missingSectionIds.length > 0) {
      this.loadSectionDetails(missingSectionIds);
      // Return what we have for now, will update when sections load
    }
    
    return assignedSections.sort((a: Section, b: Section) => (a.name || '').localeCompare(b.name || ''));
  }
  
  onContentSubjectFilterChange(): void {
    // Filter options update when subject changes
    this.updateContentFilterOptions();
  }
  
  onSubjectContentFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.subjectContentForm.fileData = result;
      this.subjectContentForm.fileName = file.name;
    };
    reader.readAsDataURL(file);
  }
  
  submitSubjectContent(): void {
    const user = this.auth.getUser();
    const entityId = user?.collegeId || 1;
    
    if (!this.selectedSubjectForContentId) {
      alert('Please select a subject');
      return;
    }
    
    const subjectId = typeof this.selectedSubjectForContentId === 'string'
      ? parseInt(this.selectedSubjectForContentId)
      : this.selectedSubjectForContentId;
    
    if (!subjectId || Number.isNaN(subjectId)) {
      alert('Please select a valid subject');
      return;
    }
    
    if (!this.subjectContentForm.title || !this.subjectContentForm.type) {
      alert('Please enter title and type');
      return;
    }
    
    // Validate section if provided (allow null for "All Sections")
    if (this.subjectContentForm.sectionId != null && this.subjectContentForm.sectionId !== undefined) {
      const assignedSections = this.getAssignedSectionsForSubject(subjectId);
      const formSectionId = Number(this.subjectContentForm.sectionId);
      
      if (isNaN(formSectionId)) {
        alert('Invalid section selected');
        return;
      }
      
      const isValidSection = assignedSections.some(s => Number(s.id) === formSectionId);
      
      if (!isValidSection) {
        // Double-check by looking directly at teacherMappings as fallback
        const hasMapping = this.teacherMappings && this.teacherMappings.some((m: any) => {
          const mappingSubjectId = Number(m.subjectId);
          const mappingSectionId = Number(m.sectionId);
          return !isNaN(mappingSubjectId) && !isNaN(mappingSectionId) &&
                 mappingSubjectId === subjectId && 
                 mappingSectionId === formSectionId;
        });
        
        if (!hasMapping) {
          alert('You are not assigned to this section for the selected subject');
          return;
        }
      }
    }
    
    const subject = this.teacherAssignedSubjects.find(s => s.id === subjectId);
    const payload: SubjectContent = {
      ...this.subjectContentForm,
      entityId,
      subjectId,
      classId: subject?.classId || this.subjectContentForm.classId || undefined,
      sectionId: this.subjectContentForm.sectionId || undefined,
      status: this.subjectContentForm.type === 'SYLLABUS' ? 'active' : (this.subjectContentForm.status || 'active'),
      createdByRole: 'TEACHER',
      createdByUserId: user?.id
    };
    
    this.subjectContentService.createContent(payload).subscribe({
      next: (result) => {
        if (result && result.ok) {
          alert('Content uploaded successfully');
          this.resetSubjectContentForm();
          this.loadTeacherAssignedSubjects();
        } else {
          alert(result.message || 'Failed to upload content');
        }
      },
      error: (err) => {
        console.error('Error uploading content:', err);
        alert('Failed to upload content');
      }
    });
  }
  
  resetSubjectContentForm(): void {
    this.subjectContentForm = {
      entityId: 0,
      subjectId: 0,
      type: 'SYLLABUS',
      title: '',
      description: '',
      unit: '',
      topicName: '',
      fileName: '',
      fileData: '',
      linkUrl: '',
      visibleToStudents: true,
      visibleToParents: false,
      teacherEditable: true,
      status: 'active',
      classId: this.subjectContentForm.classId
    };
    this.selectedSubjectForContentId = null;
  }
  
  openSubjectContentView(content: SubjectContent): void {
    this.subjectContentModalMode = 'view';
    this.selectedSubjectContent = content;
    this.showSubjectContentModal = true;
  }
  
  openSubjectContentEdit(content: SubjectContent): void {
    if (!this.canEditContent(content)) {
      alert('You can only edit content you created');
      return;
    }
    
    this.subjectContentModalMode = 'edit';
    this.selectedSubjectContent = content;
    const subject = this.teacherAssignedSubjects.find((item) => item.id === content.subjectId);
    this.subjectContentEditForm = {
      ...content,
      classId: content.classId || subject?.classId || undefined,
      visibleToStudents: content.visibleToStudents ?? true,
      visibleToParents: content.visibleToParents ?? false,
      status: content.status || 'active'
    };
    this.showSubjectContentModal = true;
  }
  
  closeSubjectContentModal(): void {
    this.showSubjectContentModal = false;
    this.selectedSubjectContent = null;
    this.subjectContentEditForm = {};
  }
  
  onEditSubjectContentFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.subjectContentEditForm.fileData = result;
        this.subjectContentEditForm.fileName = file.name;
      };
      reader.readAsDataURL(file);
    }
  }
  
  saveSubjectContentChanges(): void {
    if (!this.selectedSubjectContent?.id) {
      return;
    }
    const subjectId = this.subjectContentEditForm.subjectId || this.selectedSubjectContent.subjectId;
    const payload: Partial<SubjectContent> = {
      subjectId,
      classId: this.subjectContentEditForm.classId || this.selectedSubjectContent.classId,
      sectionId: this.subjectContentEditForm.sectionId || undefined,
      type: this.subjectContentEditForm.type || this.selectedSubjectContent.type,
      title: this.subjectContentEditForm.title || '',
      description: this.subjectContentEditForm.description || '',
      unit: this.subjectContentEditForm.unit || '',
      topicName: this.subjectContentEditForm.topicName || '',
      linkUrl: this.subjectContentEditForm.linkUrl || '',
      fileData: this.subjectContentEditForm.fileData,
      fileName: this.subjectContentEditForm.fileName,
      visibleToStudents: this.subjectContentEditForm.visibleToStudents,
      visibleToParents: this.subjectContentEditForm.visibleToParents,
      status: this.subjectContentEditForm.status || 'active'
    };

    if (!payload.fileData) {
      delete payload.fileData;
      delete payload.fileName;
    }

    this.subjectContentService.updateContent(this.selectedSubjectContent.id, payload).subscribe({
      next: (result) => {
        if (result && result.ok) {
          alert('Content updated successfully');
          this.closeSubjectContentModal();
          this.loadTeacherAssignedSubjects();
        } else {
          alert(result.message || 'Failed to update content');
        }
      },
      error: (err) => {
        console.error('saveSubjectContentChanges: Error', err);
        alert('Failed to update content');
      }
    });
  }
  
  canEditContent(content: SubjectContent): boolean {
    const user = this.auth.getUser();
    return content.createdByUserId === user?.id && content.createdByRole === 'TEACHER';
  }
  
  deleteSubjectContent(content: SubjectContent): void {
    if (!content.id) return;
    
    if (!this.canEditContent(content)) {
      alert('You can only delete content you created');
      return;
    }
    
    if (!confirm(`Delete "${content.title}"?`)) return;
    
    this.subjectContentService.deleteContent(content.id).subscribe({
      next: (result) => {
        if (result && result.ok) {
          alert('Content deleted successfully');
          // Close modal if it's open for this content
          if (this.selectedSubjectContent?.id === content.id) {
            this.closeSubjectContentModal();
          }
          this.loadTeacherAssignedSubjects();
        } else {
          alert(result.message || 'Failed to delete content');
        }
      },
      error: () => {
        alert('Failed to delete content');
      }
    });
  }

  getTeacherSubjectName(subjectId: number): string {
    return this.teacherSubjectsById[subjectId]?.name || 'Subject';
  }

  openContentLink(content: SubjectContent): void {
    if (content.linkUrl) {
      window.open(content.linkUrl, '_blank');
      return;
    }
    if (content.fileData) {
      window.open(content.fileData, '_blank');
    }
  }

  onSectionChange(): void {
    if (!this.selectedSectionId) {
      this.students = [];
      this.sectionSubjects = [];
      this.subjectsForFilter = [];
      this.selectedSubjectId = null;
      this.selectedSubjectFilterId = null;
      this.studentPerformanceMap = {};
      return;
    }
    
    this.isLoadingStudents = true;
    this.isLoadingPerformance = true;
    
    // Load students
    this.studentService.getStudentsBySection(this.selectedSectionId).subscribe({
      next: (result) => {
        this.isLoadingStudents = false;
        if (result.ok && result.students) {
          this.students = result.students;
          // Load performance for all students
          this.loadStudentPerformance();
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

    // Load subjects for this section
    this.loadSectionSubjects();
    this.loadSubjectsForFilterByClass();
  }

  updateSubjectsForFilter(): void {
    console.log('updateSubjectsForFilter called:', {
      selectedSectionId: this.selectedSectionId,
      selectedClassId: this.selectedClassId,
      selectedCourseId: this.selectedCourseId,
      teacherAssignedSubjectsCount: this.teacherAssignedSubjects?.length || 0,
      sectionSubjectsCount: this.sectionSubjects?.length || 0,
      teacherMappingsCount: this.teacherMappings?.length || 0
    });

    // If no assigned subjects loaded yet, show empty
    if (!this.teacherAssignedSubjects || this.teacherAssignedSubjects.length === 0) {
      console.log('No teacherAssignedSubjects available yet');
      this.subjectsForFilter = [];
      this.cdr.detectChanges();
      return;
    }

    // Prefer section subjects when a section is selected and sectionSubjects is loaded
    if (this.selectedSectionId && this.sectionSubjects && this.sectionSubjects.length > 0) {
      this.subjectsForFilter = this.sectionSubjects;
      console.log('Using sectionSubjects:', this.subjectsForFilter);
      this.cdr.detectChanges();
      return;
    }

    // Filter assigned subjects based on selected section/class/course using teacherMappings
    let filtered: Subject[] = [];
    
    if (this.selectedSectionId && this.teacherMappings && this.teacherMappings.length > 0) {
      // Get subjects assigned to this teacher for this specific section
      const sectionSubjectIds = this.teacherMappings
        .filter((m: any) => m.sectionId && Number(m.sectionId) === Number(this.selectedSectionId))
        .map((m: any) => Number(m.subjectId))
        .filter((id: number) => !isNaN(id));
      
      filtered = this.teacherAssignedSubjects.filter((s: Subject) => 
        s.id && sectionSubjectIds.includes(s.id)
      );
      console.log('Filtered by section:', filtered);
    } else if (this.selectedClassId && this.teacherMappings && this.teacherMappings.length > 0) {
      // Get subjects assigned to this teacher for sections in this class
      const classSubjectIds = this.teacherMappings
        .filter((m: any) => {
          if (!m.sectionId) return false; // Skip mappings without section
          const section = this.sectionsById[Number(m.sectionId)];
          return section && section.classId && Number(section.classId) === Number(this.selectedClassId);
        })
        .map((m: any) => Number(m.subjectId))
        .filter((id: number) => !isNaN(id));
      
      // Remove duplicates
      const uniqueSubjectIds = Array.from(new Set(classSubjectIds));
      filtered = this.teacherAssignedSubjects.filter((s: Subject) => 
        s.id && uniqueSubjectIds.includes(s.id)
      );
      console.log('Filtered by class:', filtered);
    } else if (this.selectedCourseId && this.teacherMappings && this.teacherMappings.length > 0) {
      // Get subjects assigned to this teacher for sections in classes of this course
      const courseSubjectIds = this.teacherMappings
        .filter((m: any) => {
          if (!m.sectionId) return false;
          const section = this.sectionsById[Number(m.sectionId)];
          if (!section || !section.classId) return false;
          const classEntity = this.classesById[Number(section.classId)];
          return classEntity && classEntity.courseId && Number(classEntity.courseId) === Number(this.selectedCourseId);
        })
        .map((m: any) => Number(m.subjectId))
        .filter((id: number) => !isNaN(id));
      
      // Remove duplicates
      const uniqueSubjectIds = Array.from(new Set(courseSubjectIds));
      filtered = this.teacherAssignedSubjects.filter((s: Subject) => 
        s.id && uniqueSubjectIds.includes(s.id)
      );
      console.log('Filtered by course:', filtered);
    } else {
      // If no class/course/section selected, show ALL assigned subjects
      filtered = this.teacherAssignedSubjects;
      console.log('No filter - showing all assigned subjects:', filtered);
    }
    
    this.subjectsForFilter = filtered;
    console.log('Final subjectsForFilter count:', this.subjectsForFilter.length);
    this.cdr.detectChanges();
  }

  loadSubjectsForFilterByClass(): void {
    // Use teacher's assigned subjects instead of loading all subjects
    if (!this.teacherAssignedSubjects || this.teacherAssignedSubjects.length === 0) {
      this.subjectsForFilter = [];
      this.cdr.detectChanges();
      return;
    }

    console.log('loadSubjectsForFilterByClass: selectedClassId=', this.selectedClassId, 'selectedCourseId=', this.selectedCourseId);

    // Filter assigned subjects based on selected class/course
    this.subjectsForFilter = this.teacherAssignedSubjects.filter((s: Subject) => {
          if (this.selectedClassId && s.classId) {
            const match = Number(s.classId) === Number(this.selectedClassId);
            console.log('Filter check: subject', s.name, 'classId=', s.classId, 'selectedClassId=', this.selectedClassId, 'match=', match);
            return match;
          }
          if (this.selectedCourseId && s.courseId) {
            const match = Number(s.courseId) === Number(this.selectedCourseId);
            return match;
          }
      // If no class/course selected, show all assigned subjects
          return true;
        });
    console.log('Final subjectsForFilter from assigned subjects:', this.subjectsForFilter);
        this.cdr.detectChanges();
  }

  loadSectionSubjects(): void {
    if (!this.selectedSectionId) return;

    // Use teacher's assigned subjects and filter by section
    if (!this.teacherMappings || this.teacherMappings.length === 0) {
      this.sectionSubjects = [];
      this.subjectsForFilter = [];
      return;
    }

    // Get subject IDs assigned to this teacher for this section
    const relevantSubjectIds = this.teacherMappings
      .filter((m: any) => m.sectionId && Number(m.sectionId) === Number(this.selectedSectionId))
      .map((m: any) => Number(m.subjectId))
      .filter((id: number) => !isNaN(id));

    // Filter assigned subjects by section
    this.sectionSubjects = this.teacherAssignedSubjects.filter((s: Subject) => 
      s.id && relevantSubjectIds.includes(s.id)
    );
    
    // Update the filter dropdown
              this.subjectsForFilter = this.sectionSubjects;
              this.selectedSubjectFilterId = null;
              console.debug('Loaded sectionSubjects for section', this.selectedSectionId, this.sectionSubjects);
  }

  loadStudentPerformance(): void {
    if (!this.selectedSectionId || this.students.length === 0) return;

    this.isLoadingPerformance = true;
    const studentIds = this.students.map(s => s.id).filter((id): id is number => id !== undefined);

    // Fetch performance data for all students in the section
    this.studentPerformanceService.getStudentPerformancesInSection(this.selectedSectionId, studentIds).subscribe({
      next: (result) => {
        this.isLoadingPerformance = false;
        if (result.ok && result.data) {
          this.processPerformanceData(result.data);
        }
      },
      error: (err) => {
        this.isLoadingPerformance = false;
        console.error('Error loading performance:', err);
      }
    });
  }

  processPerformanceData(performances: StudentPerformance[]): void {
    // Group performances by student
    const performanceByStudent: Record<number, StudentPerformance[]> = {};

    performances.forEach(perf => {
      if (!performanceByStudent[perf.studentId]) {
        performanceByStudent[perf.studentId] = [];
      }
      performanceByStudent[perf.studentId].push(perf);
    });

    // Calculate aggregated stats for each student
    this.studentPerformanceMap = {};
    Object.keys(performanceByStudent).forEach(studentIdStr => {
      const studentId = Number(studentIdStr);
      const studentPerfs = performanceByStudent[studentId];

      const avgPercentage = studentPerfs
        .filter(p => p.percentage !== null && p.percentage !== undefined)
        .reduce((sum, p) => sum + (p.percentage || 0), 0) / Math.max(studentPerfs.length, 1);

      const avgAttendance = studentPerfs
        .filter(p => p.attendancePercentage !== null && p.attendancePercentage !== undefined)
        .reduce((sum, p) => sum + (p.attendancePercentage || 0), 0) / Math.max(studentPerfs.length, 1);

      this.studentPerformanceMap[studentId] = {
        avgPercentage: isNaN(avgPercentage) ? 0 : avgPercentage,
        avgAttendance: isNaN(avgAttendance) ? 0 : avgAttendance,
        subjectCount: studentPerfs.length,
        performances: studentPerfs
      };
    });
  }

  filterStudentsBySubject(): void {
    // This method can be used to filter students by subject if needed
    // For now, we'll keep showing all students but could filter based on selectedSubjectId
    // The performance data will still show overall stats
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

  onExamsTabClick(): void {
    this.activeTab = 'exams';
    this.loadExams();
  }

  onQuestionsTabClick(): void {
    this.activeTab = 'questions';
    this.loadQuestions();
  }

  loadQuestions(): void {
    if (!this.teacherId) return;
    this.isLoadingQuestions = true;
    const entityId = this.teacherAssignedSubjects?.[0]?.entityId;
    this.questionService.listForTeacher(this.teacherId, entityId || undefined, this.questionFilterSubjectId || undefined, this.questionFilterChapter || undefined).subscribe({
      next: (res: any) => {
        this.questions = res?.ok && res.data ? res.data : [];
        this.isLoadingQuestions = false;
      },
      error: () => { this.isLoadingQuestions = false; }
    });
  }

  questionFormCourses: Course[] = [];
  questionFormClasses: ClassEntity[] = [];
  questionFormSubjects: Subject[] = [];

  openCreateQuestionModal(): void {
    this.questionModalMode = 'create';
    this.selectedQuestionForEdit = null;
    this.questionForm = {
      entityId: this.teacherAssignedSubjects?.[0]?.entityId || 0,
      courseId: 0,
      classId: 0,
      subjectId: null as number | null,
      questionText: '',
      questionType: 'MCQ_SINGLE',
      marks: 1,
      difficulty: 'medium',
      chapterUnit: ''
    };
    this.questionOptions = [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false }
    ];
    const courseIds = [...new Set((this.teacherAssignedSubjects || []).map((s: Subject) => s.courseId).filter(Boolean))];
    this.questionFormCourses = (this.courses || []).filter((c: Course) => c.id && courseIds.includes(c.id));
    this.questionFormClasses = [];
    this.questionFormSubjects = [];
    this.showQuestionModal = true;
  }

  onQuestionCourseChange(): void {
    this.questionForm.classId = 0;
    this.questionForm.subjectId = null;
    this.questionFormClasses = [];
    this.questionFormSubjects = [];
    if (this.questionForm.courseId) {
      this.subjectService.getClassesByCourse(this.questionForm.courseId).subscribe({
        next: (r: any) => {
          const classes = r?.data || (Array.isArray(r) ? r : []);
          const classIds = [...new Set((this.teacherAssignedSubjects || []).filter((s: Subject) => s.courseId === this.questionForm.courseId).map((s: Subject) => s.classId).filter(Boolean))];
          this.questionFormClasses = classes.filter((c: ClassEntity) => c.id && classIds.includes(c.id));
        }
      });
    }
  }

  onQuestionClassChange(): void {
    this.questionForm.subjectId = null;
    this.questionFormSubjects = (this.teacherAssignedSubjects || []).filter(
      (s: Subject) => s.courseId === this.questionForm.courseId && s.classId === this.questionForm.classId
    );
  }

  onQuestionSubjectChange(): void {
    const subj = this.teacherAssignedSubjects.find((s: Subject) => s.id == this.questionForm.subjectId);
    if (subj) {
      this.questionForm.entityId = subj.entityId;
      this.questionForm.courseId = subj.courseId;
      this.questionForm.classId = subj.classId;
    }
  }

  addQuestionOption(): void {
    this.questionOptions.push({ optionText: '', isCorrect: false });
  }

  removeQuestionOption(i: number): void {
    if (this.questionOptions.length > 2) this.questionOptions.splice(i, 1);
  }

  createQuestion(): void {
    const user = this.auth.getUser();
    if (!user?.id || !this.teacherId) { alert('Not authenticated'); return; }
    if (!this.questionForm.subjectId || !this.questionForm.questionText?.trim()) { alert('Subject and Question text are required'); return; }
    const subj = this.teacherAssignedSubjects.find(s => s.id == this.questionForm.subjectId);
    if (!subj) { alert('Invalid subject – ensure you are assigned to this subject'); return; }
    const q: QuestionBank = {
      entityId: subj.entityId,
      courseId: subj.courseId,
      classId: subj.classId,
      subjectId: subj.id!,
      questionText: this.questionForm.questionText,
      questionType: this.questionForm.questionType,
      marks: this.questionForm.marks || 1,
      difficulty: this.questionForm.difficulty || 'medium',
      chapterUnit: this.questionForm.chapterUnit || undefined
    };
    this.questionService.createQuestion(q, this.teacherId).subscribe({
      next: (res: any) => {
        if (res?.ok && res.data) {
          const questionId = res.data.id;
          const needsOptions = ['MCQ_SINGLE', 'MCQ_MULTIPLE'].includes(this.questionForm.questionType);
          if (needsOptions && this.questionOptions.some(o => o.optionText?.trim())) {
            let done = 0;
            const total = this.questionOptions.filter(o => o.optionText?.trim()).length;
            this.questionOptions.forEach((opt, idx) => {
              if (!opt.optionText?.trim()) return;
              this.questionService.addOption({ questionId, optionText: opt.optionText, isCorrect: opt.isCorrect, orderIndex: idx }, this.teacherId!).subscribe({
                next: () => { done++; if (done >= total) { this.showQuestionModal = false; this.loadQuestions(); } }
              });
            });
            if (total === 0) { this.showQuestionModal = false; this.loadQuestions(); }
          } else {
            this.showQuestionModal = false;
            this.loadQuestions();
          }
        } else {
          alert(res?.message || 'Failed to create');
        }
      },
      error: (e: any) => alert(e?.error?.message || 'Failed to create question')
    });
  }

  editQuestion(q: any): void {
    this.questionModalMode = 'edit';
    this.selectedQuestionForEdit = q;
    this.questionForm = {
      entityId: q.entityId,
      courseId: q.courseId,
      classId: q.classId,
      subjectId: q.subjectId,
      questionText: q.questionText,
      questionType: q.questionType,
      marks: q.marks,
      difficulty: q.difficulty || 'medium',
      chapterUnit: q.chapterUnit || ''
    };
    this.questionService.getQuestionForTeacher(q.id).subscribe({
      next: (res: any) => {
        const data = res?.data;
        if (data?.options?.length) {
          this.questionOptions = data.options.map((o: any) => ({ optionText: o.optionText, isCorrect: o.isCorrect }));
        } else {
          this.questionOptions = [{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }];
        }
        this.showQuestionModal = true;
      }
    });
  }

  updateQuestion(): void {
    if (!this.teacherId || !this.selectedQuestionForEdit?.id) return;
    const updates = {
      questionText: this.questionForm.questionText,
      questionType: this.questionForm.questionType,
      marks: this.questionForm.marks,
      difficulty: this.questionForm.difficulty,
      chapterUnit: this.questionForm.chapterUnit
    };
    this.questionService.updateQuestion(this.selectedQuestionForEdit.id, updates, this.teacherId).subscribe({
      next: (res: any) => {
        if (res?.ok) { this.showQuestionModal = false; this.loadQuestions(); }
        else alert(res?.message || 'Failed');
      },
      error: (e: any) => alert(e?.error?.message || 'Failed')
    });
  }

  openAddFromBankModal(exam: any): void {
    this.selectedExamForView = exam;
    this.showAddFromBankModal = true;
    this.selectedBankQuestionIds = [];
    this.isLoadingBankQuestions = true;
    const entityId = exam.entityId;
    const subjectId = exam.subjectId;
    this.questionService.getQuestionsForExam(entityId, subjectId, exam.courseId, exam.classId).subscribe({
      next: (res: any) => {
        this.bankQuestionsForExam = res?.ok && res.data ? res.data : [];
        this.isLoadingBankQuestions = false;
      },
      error: () => { this.isLoadingBankQuestions = false; }
    });
  }

  closeAddFromBankModal(): void {
    this.showAddFromBankModal = false;
    this.bankQuestionsForExam = [];
    this.selectedBankQuestionIds = [];
  }

  toggleBankQuestionSelection(id: number): void {
    const idx = this.selectedBankQuestionIds.indexOf(id);
    if (idx >= 0) this.selectedBankQuestionIds.splice(idx, 1);
    else this.selectedBankQuestionIds.push(id);
  }

  addSelectedFromBank(): void {
    if (!this.teacherId || !this.selectedExamForView?.id || this.selectedBankQuestionIds.length === 0) {
      alert('Select at least one question');
      return;
    }
    this.examService.addQuestionsFromBank(this.selectedExamForView.id, this.selectedBankQuestionIds, this.teacherId).subscribe({
      next: (res: any) => {
        if (res?.ok) {
          this.closeAddFromBankModal();
          alert('Questions added to exam');
        } else {
          alert(res?.message || 'Failed');
        }
      },
      error: (e: any) => alert(e?.error?.message || 'Failed')
    });
  }

  deleteQuestion(q: any): void {
    if (!confirm('Delete this question?')) return;
    if (!this.teacherId) return;
    this.questionService.deleteQuestionByTeacher(q.id, this.teacherId).subscribe({
      next: (res: any) => {
        if (res?.ok) this.loadQuestions();
        else alert(res?.message || 'Failed');
      },
      error: (e: any) => alert(e?.error?.message || 'Failed')
    });
  }

  loadExams(): void {
    if (!this.teacherId) {
      console.warn('Teacher ID not loaded yet');
      return;
    }
    this.isLoadingExams = true;
    this.examService.getExamsForTeacher(this.teacherId).subscribe({
      next: (res: any) => {
        if (res?.ok && Array.isArray(res.data)) {
          this.exams = res.data;
        } else {
          this.exams = [];
        }
        this.isLoadingExams = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading exams:', err);
        this.exams = [];
        this.isLoadingExams = false;
      }
    });
  }

  openCreateExamModal(): void {
    const user = this.auth.getUser();
    this.examModalMode = 'create';
    this.selectedExamForEdit = null;
    this.examForm = {
      entityId: user?.collegeId || 1,
      courseId: 0,
      classId: 0,
      subjectId: null as number | null,
      sectionId: null as number | null,
      name: '',
      examType: 'UNIT_TEST',
      totalMarks: 100,
      passingMarks: 33,
      durationMinutes: 60,
      examDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      instructions: ''
    };
    this.showExamModal = true;
  }

  editExam(exam: any): void {
    this.examModalMode = 'edit';
    this.selectedExamForEdit = exam;
    this.examForm = {
      entityId: exam.entityId || 1,
      courseId: exam.courseId,
      classId: exam.classId,
      subjectId: exam.subjectId,
      sectionId: exam.sectionId || null,
      name: exam.name,
      examType: exam.examType || 'UNIT_TEST',
      totalMarks: exam.totalMarks || 100,
      passingMarks: exam.passingMarks || 33,
      durationMinutes: exam.durationMinutes || 60,
      examDate: exam.examDate ? (typeof exam.examDate === 'string' ? exam.examDate.split('T')[0] : exam.examDate) : '',
      startTime: exam.startTime || '09:00',
      endTime: exam.endTime || '10:00',
      instructions: exam.instructions || ''
    };
    this.showExamModal = true;
  }

  saveExam(): void {
    if (this.examModalMode === 'edit') {
      this.updateExam();
    } else {
      this.createExam();
    }
  }

  updateExam(): void {
    if (!this.teacherId || !this.selectedExamForEdit?.id) return;
    if (!this.examForm.name || !this.examForm.examDate) {
      alert('Please fill name and exam date');
      return;
    }
    const updates = {
      name: this.examForm.name,
      examType: this.examForm.examType,
      totalMarks: this.examForm.totalMarks || 100,
      passingMarks: this.examForm.passingMarks || 33,
      durationMinutes: this.examForm.durationMinutes,
      examDate: this.examForm.examDate,
      startTime: this.examForm.startTime,
      endTime: this.examForm.endTime,
      instructions: this.examForm.instructions
    };
    this.examService.updateExamByTeacher(this.selectedExamForEdit.id, updates, this.teacherId).subscribe({
      next: (res: any) => {
        if (res?.ok) {
          this.showExamModal = false;
          this.selectedExamForEdit = null;
          this.loadExams();
        } else {
          alert(res?.message || 'Failed to update exam');
        }
      },
      error: (err) => {
        alert(err?.error?.message || err?.message || 'Failed to update exam');
      }
    });
  }

  onExamSubjectChange(): void {
    const sid = typeof this.examForm.subjectId === 'string' ? parseInt(this.examForm.subjectId, 10) : this.examForm.subjectId;
    const subj = this.teacherAssignedSubjects.find((s: Subject) => s.id === sid);
    if (subj) {
      this.examForm.courseId = subj.courseId || 0;
      this.examForm.classId = subj.classId || 0;
    }
    this.examForm.sectionId = null;
  }

  createExam(): void {
    if (!this.teacherId || !this.examForm.name || !this.examForm.subjectId || !this.examForm.examDate) {
      alert('Please fill name, subject, and exam date');
      return;
    }
    const subjectId = typeof this.examForm.subjectId === 'string' ? parseInt(this.examForm.subjectId, 10) : this.examForm.subjectId;
    const subj = this.teacherAssignedSubjects.find((s: Subject) => s.id === subjectId);
    if (!subj) {
      alert('Invalid subject');
      return;
    }
    const exam: Exam = {
      entityId: this.examForm.entityId || subj.entityId || 1,
      courseId: subj.courseId!,
      classId: subj.classId!,
      subjectId: subjectId,
      sectionId: this.examForm.sectionId || undefined,
      name: this.examForm.name,
      examType: this.examForm.examType,
      totalMarks: this.examForm.totalMarks || 100,
      passingMarks: this.examForm.passingMarks || 33,
      examDate: this.examForm.examDate,
      startTime: this.examForm.startTime,
      endTime: this.examForm.endTime,
      durationMinutes: this.examForm.durationMinutes,
      instructions: this.examForm.instructions
    };
    this.examService.createExamByTeacher(exam, this.teacherId).subscribe({
      next: (res: any) => {
        if (res?.ok) {
          this.showExamModal = false;
          this.loadExams();
        } else {
          alert(res?.message || 'Failed to create exam');
        }
      },
      error: (err) => {
        alert(err?.error?.message || err?.message || 'Failed to create exam');
      }
    });
  }

  evaluateExam(exam: any): void {
    this.selectedExamForEvaluate = exam;
    this.showEvaluateModal = true;
    this.examAttemptsForEvaluate = [];
    this.isLoadingAttempts = true;
    this.examService.getAttemptsForEvaluation(exam.id, this.teacherId!).subscribe({
      next: (res: any) => {
        if (res?.ok && Array.isArray(res.data)) {
          this.examAttemptsForEvaluate = res.data;
        }
        this.isLoadingAttempts = false;
      },
      error: () => { this.isLoadingAttempts = false; }
    });
  }

  openEvaluationForAttempt(attempt: any): void {
    this.evaluatingAttempt = attempt;
    this.examEvaluationForm = { marks: attempt.obtainedMarks || 0, feedback: '' };
  }

  submitExamEvaluation(): void {
    if (!this.evaluatingAttempt || !this.teacherId) return;
    const attemptId = this.evaluatingAttempt.id;
    const user = this.auth.getUser();
    const userId = user?.id || this.teacherId;
    this.examService.evaluateAttempt(attemptId, this.examEvaluationForm.marks, this.examEvaluationForm.feedback, userId).subscribe({
      next: () => {
        this.evaluatingAttempt = null;
        this.examAttemptsForEvaluate = this.examAttemptsForEvaluate.filter(a => a.id !== attemptId);
        if (this.selectedExamForEvaluate?.id) {
          this.examService.getAttemptsForEvaluation(this.selectedExamForEvaluate.id, this.teacherId!).subscribe({
            next: (res: any) => {
              if (res?.ok) this.examAttemptsForEvaluate = res.data || [];
            }
          });
        }
        this.loadExams();
      }
    });
  }

  closeEvaluateModal(): void {
    this.showEvaluateModal = false;
    this.selectedExamForEvaluate = null;
    this.evaluatingAttempt = null;
  }

  viewExam(exam: any): void {
    this.selectedExamForView = exam;
    this.showExamViewModal = true;
  }

  closeExamViewModal(): void {
    this.showExamViewModal = false;
    this.selectedExamForView = null;
  }

  canEditExam(exam: any): boolean {
    return exam?.createdByTeacherId === this.teacherId && exam?.status === 'draft' && !exam?.examLocked;
  }

  /** Teacher can add questions if they see the exam (created or assigned) and exam is not locked */
  canAddQuestionsToExam(exam: any): boolean {
    if (!exam || exam?.examLocked) return false;
    return exam?.status === 'draft' || exam?.status === 'live';
  }

  deleteExam(exam: any): void {
    if (!confirm(`Delete "${exam.name}"?`)) return;
    if (!this.teacherId) return;
    this.examService.deleteExamByTeacher(exam.id, this.teacherId).subscribe({
      next: (res: any) => {
        if (res?.ok) this.loadExams();
        else alert(res?.message || 'Delete failed');
      },
      error: (err) => alert(err?.error?.message || 'Delete failed')
    });
  }

  // ========== ATTENDANCE METHODS ==========

  onAttendanceTabClick(): void {
    this.activeTab = 'attendance';
    if (this.assignedSubjectsForAttendance.length === 0) {
      this.loadAssignedSubjectsForAttendance();
    }
  }

  loadAssignedSubjectsForAttendance(): void {
    if (!this.teacherId) return;
    
    this.teacherAttendanceService.getAssignedSubjects(this.teacherId).subscribe({
      next: (result: any) => {
        if (result.ok && result.data) {
          this.assignedSubjectsForAttendance = result.data;
        }
      },
      error: (err) => {
        console.error('Error loading assigned subjects:', err);
      }
    });
  }

  onAttendanceSubjectChange(): void {
    this.attendanceStudents = [];
    this.currentAttendanceSession = null;
  }

  loadAttendanceSession(): void {
    if (!this.teacherId || !this.selectedAttendanceSubject) {
      alert('Please select a subject');
        return;
      }

    this.isLoadingAttendance = true;
    const user = this.auth.getUser();
    const entityId = user?.collegeId || 1;

    this.teacherAttendanceService.getOrCreateSession(
      this.teacherId,
      this.selectedAttendanceSubject.subjectId,
      this.selectedAttendanceSubject.classId,
      this.selectedAttendanceSubject.sectionId || null,
      this.attendanceDate,
      entityId
    ).subscribe({
      next: (result: any) => {
        if (result.ok && result.data) {
          this.currentAttendanceSession = result.data;
          this.loadStudentsForAttendance();
        } else {
          alert('Error: ' + (result.message || 'Failed to create session'));
          this.isLoadingAttendance = false;
        }
      },
      error: (err) => {
        alert('Error: ' + (err.error?.message || err.message));
        console.error('Error creating session:', err);
        this.isLoadingAttendance = false;
      }
    });
  }

  loadStudentsForAttendance(): void {
    if (!this.selectedAttendanceSubject) return;

    this.teacherAttendanceService.getStudents(
      this.selectedAttendanceSubject.classId,
      this.selectedAttendanceSubject.sectionId || undefined
    ).subscribe({
      next: (result: any) => {
        if (result.ok && result.data) {
          console.log('Students loaded:', result.data);
          // Load existing attendance entries if session exists
          if (this.currentAttendanceSession?.id) {
            // First set the students, then load existing attendance
            this.attendanceStudents = result.data.map((s: any) => ({
              id: Number(s.id),
              name: s.name || 'Unknown',
              rollNumber: s.rollNumber || 'N/A',
              userId: s.userId ? Number(s.userId) : null,
              status: '',
              entryId: null
            }));
            this.loadExistingAttendance();
          } else {
            this.attendanceStudents = result.data.map((s: any) => ({
              id: Number(s.id),
              name: s.name || 'Unknown',
              rollNumber: s.rollNumber || 'N/A',
              userId: s.userId ? Number(s.userId) : null,
              status: '',
              entryId: null
            }));
            this.isLoadingAttendance = false;
            console.log('Attendance students array:', this.attendanceStudents);
          }
        } else {
          this.attendanceStudents = [];
          this.isLoadingAttendance = false;
        }
      },
      error: (err) => {
        alert('Error loading students: ' + (err.error?.message || err.message));
        console.error('Error loading students:', err);
        this.isLoadingAttendance = false;
      }
    });
  }

  loadExistingAttendance(): void {
    if (!this.teacherId || !this.currentAttendanceSession?.id) {
      this.isLoadingAttendance = false;
      return;
    }

    this.teacherAttendanceService.getSessionDetails(this.teacherId, this.currentAttendanceSession.id).subscribe({
      next: (result: any) => {
        if (result.ok && result.data) {
          const sessionData = result.data;
          this.currentAttendanceSession = {
            ...this.currentAttendanceSession,
            status: sessionData.session.status,
            isLocked: sessionData.isLocked,
            canEdit: sessionData.canEdit,
            lockDate: sessionData.lockDate
          };

          // Map existing entries to students
          const existingEntries = sessionData.entries || [];
          this.attendanceStudents = this.attendanceStudents.map((student: any) => {
            const entry = existingEntries.find((e: any) => Number(e.studentId) === Number(student.id));
            return {
              ...student,
              status: entry ? entry.status : '',
              entryId: entry ? entry.entryId : null
            };
          });
        }
        this.isLoadingAttendance = false;
      },
      error: (err) => {
        console.error('Error loading existing attendance:', err);
        this.isLoadingAttendance = false;
      }
    });
  }

  markAttendance(student: any, status: string): void {
    if (this.currentAttendanceSession?.isLocked) {
      alert('This attendance session is locked. Please request a correction.');
      return;
    }
    student.status = status;
  }

  markAllPresent(): void {
    if (this.currentAttendanceSession?.isLocked) {
      alert('This attendance session is locked.');
      return;
    }
    this.attendanceStudents.forEach((student: any) => {
      student.status = 'present';
    });
  }

  resetAttendance(): void {
    if (this.currentAttendanceSession?.isLocked) {
      alert('This attendance session is locked.');
      return;
    }
    this.attendanceStudents.forEach((student: any) => {
      student.status = '';
    });
  }

  getPresentCount(): number {
    return this.attendanceStudents.filter((s: any) => s.status === 'present').length;
  }

  getAbsentCount(): number {
    return this.attendanceStudents.filter((s: any) => s.status === 'absent').length;
  }

  saveAttendance(): void {
    if (!this.teacherId || !this.currentAttendanceSession?.id) {
      alert('Session not loaded');
      return;
    }

    if (this.currentAttendanceSession.isLocked) {
      alert('This attendance session is locked. Please request a correction.');
      return;
    }

    const attendanceData = this.attendanceStudents
      .filter((s: any) => s.status === 'present' || s.status === 'absent')
      .map((s: any) => ({
        studentId: s.id,
        status: s.status
      }));

    if (attendanceData.length === 0) {
      alert('Please mark attendance for at least one student');
      return;
    }

    this.isSavingAttendance = true;
    this.teacherAttendanceService.markAttendance(
      this.teacherId,
      this.currentAttendanceSession.id,
      attendanceData
    ).subscribe({
      next: (result: any) => {
        if (result.ok) {
    alert('Attendance saved successfully!');
          this.currentAttendanceSession.status = result.data.status;
          // Reload to get updated status
          this.loadExistingAttendance();
        } else {
          alert('Error: ' + (result.message || 'Failed to save attendance'));
        }
        this.isSavingAttendance = false;
      },
      error: (err) => {
        alert('Error saving attendance: ' + (err.error?.message || err.message));
        console.error('Error saving attendance:', err);
        this.isSavingAttendance = false;
      }
    });
  }

  openCorrectionModal(): void {
    if (!this.currentAttendanceSession?.isLocked) {
      alert('This session is not locked. You can edit directly.');
      return;
    }
    this.correctionForm = {
      studentId: null,
      requestedStatus: 'present',
      reason: ''
    };
    this.showCorrectionModal = true;
  }

  getSelectedStudentStatus(): string {
    if (!this.correctionForm.studentId) return '';
    const student = this.attendanceStudents.find((s: any) => s.id === this.correctionForm.studentId);
    return student ? student.status : '';
  }

  submitCorrectionRequest(): void {
    if (!this.teacherId || !this.correctionForm.studentId || !this.correctionForm.reason) {
      alert('Please fill all required fields');
      return;
    }

    const student = this.attendanceStudents.find((s: any) => s.id === this.correctionForm.studentId);
    if (!student || !student.entryId) {
      alert('Selected student does not have an attendance entry');
      return;
    }

    this.isSubmittingCorrection = true;
    this.teacherAttendanceService.requestCorrection(
      this.teacherId,
      student.entryId,
      this.correctionForm.requestedStatus,
      this.correctionForm.reason
    ).subscribe({
      next: (result: any) => {
        if (result.ok) {
          alert(result.message || 'Correction request submitted successfully. Waiting for admin approval.');
          this.showCorrectionModal = false;
          this.correctionForm = {
            studentId: null,
            requestedStatus: 'present',
            reason: ''
          };
        } else {
          alert('Error: ' + (result.message || 'Failed to submit correction request'));
        }
        this.isSubmittingCorrection = false;
      },
      error: (err) => {
        alert('Error submitting correction request: ' + (err.error?.message || err.message));
        console.error('Error submitting correction:', err);
        this.isSubmittingCorrection = false;
      }
    });
  }

  loadAttendanceHistory(): void {
    if (!this.teacherId) return;

    this.isLoadingHistory = true;
    this.teacherAttendanceService.getHistory(
      this.teacherId,
      this.historySubjectId || undefined,
      undefined,
      undefined,
      this.historyFromDate || undefined,
      this.historyToDate || undefined
    ).subscribe({
      next: (result: any) => {
        if (result.ok && result.data) {
          this.attendanceHistory = result.data;
        } else {
          this.attendanceHistory = [];
        }
        this.isLoadingHistory = false;
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.attendanceHistory = [];
        this.isLoadingHistory = false;
      }
    });
  }

  loadStudentWiseAttendance(): void {
    if (!this.teacherId || !this.studentWiseSubjectId) return;

    // Find the selected subject details
    const subject = this.assignedSubjectsForAttendance.find((s: any) => s.subjectId === this.studentWiseSubjectId);
    if (!subject) return;

    this.isLoadingStudentWise = true;
    this.teacherAttendanceService.getStudentWiseAttendance(
      this.teacherId,
      this.studentWiseSubjectId,
      subject.classId,
      subject.sectionId || undefined
    ).subscribe({
      next: (result: any) => {
        if (result.ok && result.data) {
          this.studentWiseAttendance = result.data;
        } else {
          this.studentWiseAttendance = [];
        }
        this.isLoadingStudentWise = false;
      },
      error: (err) => {
        console.error('Error loading student-wise attendance:', err);
        this.studentWiseAttendance = [];
        this.isLoadingStudentWise = false;
      }
    });
  }

  viewHistoryDetails(record: any): void {
    if (!this.teacherId || !record?.id) {
      return;
    }

    this.teacherAttendanceService.getSessionDetails(this.teacherId, record.id).subscribe({
      next: (result: any) => {
        if (result.ok && result.data) {
          this.historyDetailsSession = {
            ...result.data.session,
            subjectName: record.subjectName
          };
          this.historyDetailsEntries = result.data.entries || [];
          this.showHistoryDetailsModal = true;
        } else {
          alert('Could not load attendance details');
        }
      },
      error: (err) => {
        console.error('Error loading attendance session details:', err);
        alert('Error loading attendance details: ' + (err.error?.message || err.message));
      }
    });
  }


  // ========== ASSIGNMENT METHODS ==========
  
  onAssignmentsTabClick(): void {
    this.activeTab = 'assignments';
    console.log('📝 Assignments tab clicked, teacherId:', this.teacherId, 'current assignments count:', this.assignments?.length || 0);
    // Always try to load assignments when tab is clicked (even if already loaded, refresh them)
    if (this.teacherId) {
      console.log('✅ TeacherId available, loading assignments...');
      this.loadAssignments();
    } else {
      console.log('⏳ TeacherId not available yet, waiting...');
      // Wait for teacherId to be loaded with retry mechanism
      let retryCount = 0;
      const maxRetries = 10;
      const checkInterval = setInterval(() => {
        retryCount++;
        if (this.teacherId) {
          console.log('✅ TeacherId now available after', retryCount * 200, 'ms, loading assignments...');
          clearInterval(checkInterval);
          this.loadAssignments();
        } else if (retryCount >= maxRetries) {
          console.error('❌ TeacherId still not available after', maxRetries * 200, 'ms');
          clearInterval(checkInterval);
        }
      }, 200);
    }
  }
  
  loadAssignments(): void {
    if (!this.teacherId) {
      console.log('❌ Cannot load assignments: teacherId not set yet');
      return;
    }
    
    // Clean filters - remove empty strings and null values
    const cleanFilters: any = {};
    if (this.assignmentFilters.subjectId) cleanFilters.subjectId = this.assignmentFilters.subjectId;
    if (this.assignmentFilters.classId) cleanFilters.classId = this.assignmentFilters.classId;
    if (this.assignmentFilters.sectionId) cleanFilters.sectionId = this.assignmentFilters.sectionId;
    if (this.assignmentFilters.status && this.assignmentFilters.status.trim() !== '') {
      cleanFilters.status = this.assignmentFilters.status;
    }
    
    console.log('🔄 Loading assignments for teacherId:', this.teacherId);
    console.log('📋 Filters being sent:', cleanFilters);
    console.log('🌐 API URL will be: http://localhost:8080/api/assignments/teacher/list?teacherId=' + this.teacherId);
    
    this.isLoadingAssignments = true;
    this.assignmentService.getTeacherAssignments(this.teacherId, cleanFilters).subscribe({
      next: (result: any) => {
        console.log('✅ Assignments API response received:', result);
        console.log('📊 Response structure:', {
          ok: result?.ok,
          hasData: !!result?.data,
          dataType: Array.isArray(result?.data) ? 'array' : typeof result?.data,
          dataLength: Array.isArray(result?.data) ? result.data.length : 'N/A'
        });
        
        if (result && result.ok && result.data && Array.isArray(result.data)) {
          this.assignments = result.data;
          console.log('✅ Assignments loaded successfully. Count:', this.assignments.length);
          console.log('📝 All loaded assignments:', JSON.stringify(this.assignments, null, 2));
          if (this.assignments.length > 0) {
            console.log('📝 First assignment:', this.assignments[0]);
          } else {
            console.warn('⚠️ Assignments array is empty after successful API call');
          }
        } else {
          console.warn('⚠️ No assignments data in response. Response:', result);
          this.assignments = [];
        }
        this.isLoadingAssignments = false;
        this.cdr.detectChanges();
        console.log('🔄 Change detection triggered. Final assignments count:', this.assignments.length);
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
        this.cdr.detectChanges();
        alert('Error loading assignments: ' + (err.error?.message || err.message || 'Unknown error'));
      }
    });
  }
  
  getSubjectName(subjectId: number | undefined): string {
    if (!subjectId) return 'N/A';
    const subject = this.teacherAssignedSubjects.find(s => s.id === subjectId);
    return subject ? (subject.subjectCode || '') + ' ' + subject.name : 'N/A';
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
  
  formatTime(dateStr: string | undefined): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  isImageFile(fileName: string | undefined): boolean {
    if (!fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowerFileName = fileName.toLowerCase();
    return imageExtensions.some(ext => lowerFileName.endsWith(ext));
  }

  downloadSubmissionFile(submission: any): void {
    if (submission.fileData) {
      const link = document.createElement('a');
      link.href = submission.fileData;
      link.download = submission.fileName || 'submission-file';
      link.click();
    } else if (submission.fileUrl) {
      window.open(submission.fileUrl, '_blank');
    }
  }

  onSubmissionImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }
  
  viewSubmissions(assignment: AssignmentSummary): void {
    if (!this.teacherId || !assignment.id) return;
    this.selectedAssignmentForSubmissions = assignment;
    this.isLoadingSubmissions = true;
    this.showSubmissionsModal = true;
    
    this.assignmentService.getSubmissionsForTeacher(this.teacherId, assignment.id).subscribe({
      next: (result: any) => {
        if (result.ok && result.data) {
          this.assignmentSubmissions = result.data;
        } else {
          this.assignmentSubmissions = [];
        }
        this.isLoadingSubmissions = false;
      },
      error: (err) => {
        console.error('Error loading submissions:', err);
        this.assignmentSubmissions = [];
        this.isLoadingSubmissions = false;
        alert('Error loading submissions: ' + (err.error?.message || err.message));
      }
    });
  }
  
  editAssignment(assignment: AssignmentSummary): void {
    if (!this.teacherId || !assignment.id) {
      alert('Cannot edit: Missing teacher ID or assignment ID');
      return;
    }
    
    this.assignmentModalMode = 'edit';
    this.selectedAssignment = assignment;
    
    // Fetch full assignment details for editing
    this.assignmentService.getAssignmentForTeacher(this.teacherId, assignment.id).subscribe({
      next: (result: any) => {
        if (result.ok && result.data) {
          const fullAssignment = result.data;
          
          // Parse due date
          const dueDate = fullAssignment.extendedDueDate || fullAssignment.dueDate;
          let dateStr = '';
          let timeStr = '';
          if (dueDate) {
            const dt = new Date(dueDate);
            dateStr = dt.toISOString().split('T')[0];
            timeStr = dt.toTimeString().split(' ')[0].substring(0, 5);
          }
          
          this.assignmentForm = {
            title: fullAssignment.title || '',
            description: fullAssignment.description || '',
            instructions: fullAssignment.instructions || '',
            subjectId: fullAssignment.subjectId || null,
            classId: fullAssignment.classId || null,
            sectionId: fullAssignment.sectionId || null,
            dueDate: dateStr,
            dueTime: timeStr,
            maxMarks: fullAssignment.maxMarks || null,
            gradingType: fullAssignment.gradingType || 'NUMERIC',
            fileName: fullAssignment.fileName || '',
            fileData: fullAssignment.fileData || '',
            fileUrl: fullAssignment.fileUrl || '',
            status: fullAssignment.status || 'draft',
            lockAfterDueDate: fullAssignment.lockAfterDueDate || false
          };
          
          this.showAssignmentModal = true;
        } else {
          alert('Error loading assignment details: ' + (result.message || 'Unknown error'));
        }
      },
      error: (err) => {
        alert('Error loading assignment: ' + (err.error?.message || err.message));
        console.error('Error loading assignment:', err);
      }
    });
  }
  
  deleteAssignment(assignment: AssignmentSummary): void {
    if (!this.teacherId || !assignment.id) return;
    if (!confirm(`Delete "${assignment.title}"? This action cannot be undone.`)) return;
    
    this.assignmentService.deleteAssignmentForTeacher(this.teacherId, assignment.id).subscribe({
      next: (result: any) => {
        if (result.ok) {
          alert('Assignment deleted successfully');
          this.loadAssignments();
        } else {
          alert('Error: ' + (result.message || 'Failed to delete assignment'));
        }
      },
      error: (err) => {
        alert('Error deleting assignment: ' + (err.error?.message || err.message));
      }
    });
  }
  
  openCreateAssignmentModal(): void {
    this.assignmentModalMode = 'create';
    this.assignmentForm = {
      title: '',
      description: '',
      instructions: '',
      subjectId: null,
      classId: null,
      sectionId: null,
      dueDate: '',
      dueTime: '',
      maxMarks: null,
      gradingType: 'NUMERIC',
      fileName: '',
      fileData: '',
      fileUrl: '',
      status: 'draft',
      lockAfterDueDate: false
    };
    this.showAssignmentModal = true;
  }
  
  onAssignmentSubjectChange(): void {
    if (this.assignmentForm.subjectId) {
      // Find all mappings for this subject
      const mappings = this.teacherMappings.filter((m: any) => 
        Number(m.subjectId) === Number(this.assignmentForm.subjectId)
      );
      
      if (mappings.length > 0) {
        // If there's a mapping with a section, use the first one to set classId
        // But don't force sectionId - let user choose or leave null for "all sections"
        const mappingWithSection = mappings.find((m: any) => m.sectionId);
        if (mappingWithSection && mappingWithSection.sectionId) {
          const section = this.sectionsById[Number(mappingWithSection.sectionId)];
          if (section && section.classId) {
            this.assignmentForm.classId = section.classId;
            // Don't auto-set sectionId - let user choose or leave null
            // this.assignmentForm.sectionId = mappingWithSection.sectionId;
          }
        } else {
          // If no section in mappings, try to get classId from subject
          const subject = this.teacherAssignedSubjects.find(s => s.id === this.assignmentForm.subjectId);
          if (subject && subject.classId) {
            this.assignmentForm.classId = subject.classId;
          }
        }
      }
    }
  }
  
  submitAssignment(): void {
    if (!this.teacherId) {
      alert('Teacher ID not found');
      return;
    }
    
    if (!this.assignmentForm.title || !this.assignmentForm.subjectId) {
      alert('Please fill in title and subject');
      return;
    }
    
    // Validate teacher is assigned to subject (simplified - backend will do final validation)
    console.log('Validating assignment submission:', {
      teacherId: this.teacherId,
      subjectId: this.assignmentForm.subjectId,
      sectionId: this.assignmentForm.sectionId,
      classId: this.assignmentForm.classId,
      teacherMappingsCount: this.teacherMappings?.length || 0
    });
    
    // Check if teacher has any mapping for this subject
    const hasSubjectMapping = this.teacherMappings.some((m: any) => {
      const mappingSubjectId = m.subjectId ? Number(m.subjectId) : null;
      const formSubjectId = Number(this.assignmentForm.subjectId);
      return mappingSubjectId === formSubjectId;
    });
    
    if (!hasSubjectMapping) {
      alert('You are not assigned to this subject. Please select a subject you are assigned to.');
      console.error('Validation failed - no mappings found for subjectId:', this.assignmentForm.subjectId);
      console.log('All teacherMappings:', this.teacherMappings);
      return;
    }
    
    // Note: We're not strictly validating section here - if teacher is assigned to the subject,
    // they can create assignment. The backend will validate section access if needed.
    console.log('Frontend validation passed - proceeding with assignment creation');
    
    // Get entityId from user
    const user = this.auth.getUser();
    const entityId = user?.collegeId || 1;
    
    // Combine date and time
    let dueDateTime = null;
    if (this.assignmentForm.dueDate) {
      const dateTimeStr = this.assignmentForm.dueDate + (this.assignmentForm.dueTime ? 'T' + this.assignmentForm.dueTime : 'T23:59:59');
      dueDateTime = new Date(dateTimeStr).toISOString();
    }
    
    const assignmentData = {
      entityId: entityId,
      title: this.assignmentForm.title,
      description: this.assignmentForm.description || '',
      instructions: this.assignmentForm.instructions || '',
      subjectId: this.assignmentForm.subjectId,
      classId: this.assignmentForm.classId,
      sectionId: this.assignmentForm.sectionId || null,
      dueDate: dueDateTime,
      maxMarks: this.assignmentForm.maxMarks || null,
      gradingType: this.assignmentForm.gradingType || 'NUMERIC',
      fileName: this.assignmentForm.fileName || null,
      fileData: this.assignmentForm.fileData || null,
      fileUrl: this.assignmentForm.fileUrl || null,
      status: this.assignmentForm.status || 'draft',
      lockAfterDueDate: this.assignmentForm.lockAfterDueDate || false
    };
    
    if (this.assignmentModalMode === 'create') {
      console.log('🔄 Creating assignment with data:', assignmentData);
      console.log('👤 Teacher ID:', this.teacherId);
      
      this.assignmentService.createAssignmentForTeacher(this.teacherId, assignmentData).subscribe({
        next: (result: any) => {
          console.log('✅ Assignment creation response:', result);
          if (result.ok) {
            alert('Assignment created successfully');
            this.showAssignmentModal = false;
            console.log('🔄 Reloading assignments after creation...');
            this.loadAssignments();
          } else {
            console.error('❌ Assignment creation failed:', result.message);
            alert('Error: ' + (result.message || 'Failed to create assignment'));
          }
        },
        error: (err) => {
          console.error('❌ Error creating assignment:', err);
          console.error('❌ Error details:', {
            status: err.status,
            statusText: err.statusText,
            message: err.message,
            error: err.error
          });
          alert('Error creating assignment: ' + (err.error?.message || err.message || 'Unknown error'));
        }
      });
    } else {
      if (!this.selectedAssignment?.id) return;
      this.assignmentService.updateAssignmentForTeacher(this.teacherId, this.selectedAssignment.id, assignmentData).subscribe({
        next: (result: any) => {
          if (result.ok) {
            alert('Assignment updated successfully');
            this.showAssignmentModal = false;
            this.loadAssignments();
          } else {
            alert('Error: ' + (result.message || 'Failed to update assignment'));
          }
        },
        error: (err) => {
          alert('Error updating assignment: ' + (err.error?.message || err.message));
        }
      });
    }
  }
  
  onAssignmentFileSelect(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    
    this.assignmentForm.fileName = file.name;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.assignmentForm.fileData = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  openEvaluation(submission: any): void {
    this.evaluatingSubmission = submission;
    this.evaluationForm = {
      marks: submission.marks !== null && submission.marks !== undefined ? submission.marks : null,
      feedback: submission.feedback || '',
      allowResubmit: submission.allowResubmit || false
    };
  }
  
  submitEvaluation(): void {
    if (!this.teacherId || !this.evaluatingSubmission?.id) {
      alert('Missing teacher ID or submission ID');
      return;
    }
    
    if (this.evaluationForm.marks === null || this.evaluationForm.marks === undefined) {
      if (!confirm('No marks entered. Continue without marks?')) {
        return;
      }
    }
    
    this.assignmentService.evaluateSubmission(
      this.teacherId,
      this.evaluatingSubmission.id,
      this.evaluationForm.marks,
      this.evaluationForm.feedback,
      this.evaluationForm.allowResubmit
    ).subscribe({
      next: (result: any) => {
        if (result.ok) {
          alert('Evaluation saved successfully');
          this.evaluatingSubmission = null;
          // Reload submissions
          if (this.selectedAssignmentForSubmissions?.id) {
            this.viewSubmissions(this.selectedAssignmentForSubmissions);
          }
        } else {
          alert('Error: ' + (result.message || 'Failed to save evaluation'));
        }
      },
      error: (err) => {
        alert('Error saving evaluation: ' + (err.error?.message || err.message));
        console.error('Evaluation error:', err);
      }
    });
  }
}
