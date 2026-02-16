import { Component, OnInit, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { EntityService, Entity } from '../../services/entity.service';
import { AdmissionService, StudentAdmission, TeacherAdmission } from '../../services/admission.service';
import { StudentService, Student } from '../../services/student.service';
import { TeacherService, Teacher } from '../../services/teacher.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { SubjectService, Course, ClassEntity, Section, Subject, SubjectTeacherMapping } from '../../services/subject.service';
import { AssignmentService, AssignmentOverview, AssignmentSummary } from '../../services/assignment.service';
import { AttendanceService, AttendanceOverview, AttendanceStudentReport, AttendanceTeacherActivity, AttendancePolicy, AttendanceCorrection, AttendanceAuditLog } from '../../services/attendance.service';
import { SubjectContentService, SubjectContent, SubjectContentType } from '../../services/subject-content.service';
import { NoticeService, Notice, NoticeOverview } from '../../services/notice.service';
import { AnnouncementService, Announcement } from '../../services/announcement.service';
import { FeeService, FeeStructure, FeeAssignment, FeePayment, FeePolicy, Receipt, FinancialDashboard } from '../../services/fee.service';
import { SectionModalComponent } from '../../components/section-modal/section-modal.component';
import { FeeStructureModalComponent } from '../../components/fee-structure-modal/fee-structure-modal.component';
import { FeeAssignmentModalComponent } from '../../components/fee-assignment-modal/fee-assignment-modal.component';
import { AdminFeesComponent } from './components/admin-fees/admin-fees.component';
import { AdminExamsComponent } from './components/admin-exams/admin-exams.component';
import { AdminQuestionsComponent } from './components/admin-questions/admin-questions.component';
import { AdminReportsComponent } from './components/admin-reports/admin-reports.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent, SectionModalComponent, FeeStructureModalComponent, FeeAssignmentModalComponent, AdminFeesComponent, AdminExamsComponent, AdminQuestionsComponent, AdminReportsComponent],
  templateUrl: './admin-dashboard.component.html',
  styles: [`
    .page {
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
    .subject-content-right {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 14px;
      padding: 18px;
    }
    .syllabus-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      gap: 24px;
      align-items: start;
    }
    .syllabus-left {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 14px;
      padding: 18px;
    }
    .syllabus-right {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 14px;
      padding: 18px;
    }
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      padding: 14px;
    }
    .stat-label {
      color: var(--text-gray);
      font-size: 12px;
      margin-bottom: 6px;
    }
    .stat-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-white);
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

    .admission-sub-tabs, .sub-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .admission-sub-tab, .sub-tab {
      padding: 8px 16px;
      border-radius: 10px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .admission-sub-tab:hover, .sub-tab:hover {
      border-color: var(--accent-green);
      background: var(--card-bg);
    }
    .admission-sub-tab.active, .sub-tab.active {
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
    .attendance-summary-table {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }
    .summary-table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
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
    .summary-table-header:has(span:nth-child(8)) {
      grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1.5fr 1fr 1.5fr 2fr;
    }
    .summary-table-header:has(span:nth-child(9)) {
      grid-template-columns: 2fr 1fr 1fr 1.2fr 1.5fr 1.5fr 1.8fr 1.2fr 2.5fr;
    }
    .notices-table {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }
    .notices-table-header {
      display: grid;
      grid-template-columns: 2.5fr 1fr 1.2fr 1.5fr 1.2fr 2fr;
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
    .notices-table-header:has(span:nth-child(7)) {
      grid-template-columns: 1.2fr 1fr 1.2fr 1.5fr 1.8fr 1.8fr 1.5fr;
    }
    .notices-table-row {
      display: grid;
      grid-template-columns: 2.5fr 1fr 1.2fr 1.5fr 1.2fr 2fr;
      gap: 20px;
      padding: 18px 20px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      align-items: center;
      transition: all 0.2s;
    }
    .notices-table-row:has(span:nth-child(7)) {
      grid-template-columns: 1.2fr 1fr 1.2fr 1.5fr 1.8fr 1.8fr 1.5fr;
    }
    .notices-table-row:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--accent-green);
      transform: translateY(-1px);
    }
    .teacher-announcements-table {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }
    .teacher-announcements-header {
      display: grid;
      grid-template-columns: 3fr 1.5fr 1.5fr 1.2fr 1.8fr 2.5fr;
      gap: 24px;
      padding: 16px 24px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      font-weight: 800;
      font-size: 13px;
      color: var(--text-gray);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .teacher-announcements-row {
      display: grid;
      grid-template-columns: 3fr 1.5fr 1.5fr 1.2fr 1.8fr 2.5fr;
      gap: 24px;
      padding: 20px 24px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      align-items: center;
      transition: all 0.2s;
    }
    .teacher-announcements-row:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--accent-green);
      transform: translateY(-1px);
    }
    .announcement-title-cell {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .title-main {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .title-main strong {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-white);
    }
    .teacher-name-badge {
      font-size: 11px;
      padding: 4px 8px;
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 4px;
      color: #60a5fa;
      font-weight: 700;
    }
    .title-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 4px;
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
    .meta-badge {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 700;
    }
    .hidden-badge {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    .remark-badge {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
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
    .notice-title {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .notice-title strong {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-white);
    }
    .notice-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .notice-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .notice-actions button {
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
    .notice-actions .btn-edit {
      background: rgba(245, 158, 11, 0.12);
      border-color: rgba(245, 158, 11, 0.25);
      color: #f59e0b;
    }
    .notice-actions .btn-edit:hover {
      background: rgba(245, 158, 11, 0.2);
      border-color: rgba(245, 158, 11, 0.4);
      transform: translateY(-1px);
    }
    .notice-actions .btn-secondary {
      background: rgba(59, 130, 246, 0.12);
      border-color: rgba(59, 130, 246, 0.25);
      color: #3b82f6;
    }
    .notice-actions .btn-secondary:hover {
      background: rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.4);
      transform: translateY(-1px);
    }
    .notice-actions .btn-delete {
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.25);
      color: #ef4444;
    }
    .notice-actions .btn-delete:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
      transform: translateY(-1px);
    }
    .study-material-header {
      grid-template-columns: 1.2fr 2.5fr 1.8fr 1.8fr 2fr 2fr 2.5fr !important;
      gap: 24px !important;
      padding: 14px 20px !important;
    }
    .summary-table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 20px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      align-items: center;
      transition: all 0.2s;
    }
    .summary-table-row:has(span:nth-child(8)) {
      grid-template-columns: 2fr 1.5fr 1fr 1.5fr 1.5fr 1fr 1.5fr 2fr;
    }
    .summary-table-row:has(span:nth-child(9)) {
      grid-template-columns: 2fr 1fr 1fr 1.2fr 1.5fr 1.5fr 1.8fr 1.2fr 2.5fr;
    }
    .study-material-row {
      grid-template-columns: 1.2fr 2.5fr 1.8fr 1.8fr 2fr 2fr 2.5fr !important;
      gap: 24px !important;
      padding: 18px 20px !important;
    }
    .study-material-row span {
      font-size: 14px;
      line-height: 1.6;
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
    .summary-present {
      color: var(--accent-green);
      font-weight: 700;
    }
    .summary-total {
      font-weight: 700;
    }
    .summary-percent {
      font-size: 16px;
      font-weight: 900;
      display: inline-block;
    }
    .summary-pending {
      color: #f59e0b;
      font-weight: 700;
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
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--accent-green);
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-badge.status-closed {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
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
      .syllabus-layout{ grid-template-columns: 1fr; }
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

    /* Teacher Attendance Styles */
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
    .attendance-filters, .history-filters {
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
    .attendance-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
    }
    .student-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .student-name {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-white);
    }
    .student-roll {
      font-size: 13px;
      color: var(--text-gray);
    }
    .attendance-options {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .attendance-btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }
    .attendance-btn.present.active {
      background: rgba(34, 197, 94, 0.15);
      border-color: #22c55e;
      color: #22c55e;
    }
    .attendance-btn.absent.active {
      background: rgba(239, 68, 68, 0.15);
      border-color: #ef4444;
      color: #ef4444;
    }
    .attendance-btn.leave.active {
      background: rgba(245, 158, 11, 0.15);
      border-color: #f59e0b;
      color: #f59e0b;
    }
    .attendance-btn.half-day.active {
      background: rgba(59, 130, 246, 0.15);
      border-color: #3b82f6;
      color: #3b82f6;
    }
    .attendance-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border-gray);
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
  activeTab: 'admissions' | 'students' | 'teachers' | 'reports' | 'fees' | 'dashboard' | 'subjects' | 'subject-list' | 'syllabus-materials' | 'assignments' | 'exam-attempts' | 'questions' | 'attendance' | 'notices' | 'teacher-announcements' | 'settings' = 'dashboard';
  
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
  showStudentFilters = false;
  studentSearch = {
    name: '',
    email: '',
    roll: '',
    phone: '',
    course: '',
    className: '',
    section: '',
    academicYear: ''
  };
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
  showTeacherFilters = false;
  teacherSearch = {
    name: '',
    email: '',
    employeeId: '',
    phone: '',
    qualification: '',
    specialization: ''
  };
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
  subjectSubTab: 'courses' | 'classes' | 'sections' | 'teacher-assignment' = 'courses';
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
  
  // Subject List section properties
  subjectList: Subject[] = [];
  isLoadingSubjectList: boolean = false;
  subjectListClasses: ClassEntity[] = [];
  subjectListSectionsByClass: Record<number, Section[]> = {};
  showSubjectFilters = false;
  subjectContentTypes: SubjectContentType[] = ['SYLLABUS', 'VIDEO', 'NOTE', 'PPT', 'REFERENCE'];
  subjectContents: SubjectContent[] = [];
  isLoadingSubjectContents = false;
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
  selectedSubjectForContentId: number | null = null;
  showSubjectContentModal = false;
  subjectContentModalMode: 'view' | 'edit' = 'view';
  selectedSubjectContent: SubjectContent | null = null;
  subjectContentEditForm: Partial<SubjectContent> = {};
  assignmentOverview: AssignmentOverview | null = null;
  adminAssignments: AssignmentSummary[] = [];
  isLoadingAssignmentOverview = false;
  isLoadingAdminAssignments = false;
  showAssignmentFilters = false;
  assignmentFilterClasses: ClassEntity[] = [];
  assignmentFilterSections: Section[] = [];
  assignmentFilters = {
    courseId: '',
    classId: '',
    sectionId: '',
    subjectId: '',
    teacherId: '',
    status: '',
    fromDate: '',
    toDate: ''
  };
  attendanceOverview: AttendanceOverview | null = null;
  attendanceStudentReports: AttendanceStudentReport[] = [];
  attendanceTeacherActivity: AttendanceTeacherActivity[] = [];
  
  // Teacher Attendance Properties
  teacherAttendanceView: 'mark' | 'dashboard' | 'reports' = 'mark';
  teacherAttendanceDate = new Date().toISOString().split('T')[0];
  teacherAttendanceList: any[] = [];
  teacherAttendanceSession: any = null;
  teacherAttendanceData: any = null;
  isLoadingTeacherAttendance = false;
  isSavingTeacherAttendance = false;
  teacherAttendanceDashboard: any = null;
  teacherAttendanceReports: any[] = [];
  isLoadingTeacherReports = false;
  teacherReportFromDate: string = '';
  teacherReportToDate: string = '';
  attendancePolicy: AttendancePolicy | null = null;
  attendanceCorrections: AttendanceCorrection[] = [];
  attendanceAuditLogs: AttendanceAuditLog[] = [];
  isLoadingAttendanceOverview = false;
  isLoadingAttendanceReports = false;
  isLoadingAttendanceTeachers = false;
  isLoadingAttendancePolicy = false;
  isLoadingAttendanceCorrections = false;
  isLoadingAttendanceAudit = false;
  showAttendanceFilters = false;
  attendanceFilterClasses: ClassEntity[] = [];
  attendanceFilterSections: Section[] = [];
  attendanceFilters = {
    courseId: '',
    classId: '',
    sectionId: '',
    subjectId: '',
    teacherId: '',
    fromDate: '',
    toDate: ''
  };
  noticesOverview: NoticeOverview | null = null;
  adminNotices: any[] = [];
  noticeAuditLogs: any[] = [];
  isLoadingNotices = false;
  isLoadingNoticeOverview = false;
  isLoadingNoticeAudit = false;
  showNoticeFilters = false;
  noticeTypes = ['General', 'Academic', 'Exam', 'Holiday', 'Fee'];
  noticeTargets = ['ALL', 'STUDENTS', 'TEACHERS', 'PARENTS'];
  noticeFilters = {
    courseId: '',
    classId: '',
    sectionId: '',
    noticeType: '',
    targetAudience: '',
    status: '',
    fromDate: '',
    toDate: ''
  };
  noticeFilterClasses: ClassEntity[] = [];
  noticeFilterSections: Section[] = [];
  noticeFormClasses: ClassEntity[] = [];
  noticeFormSections: Section[] = [];
  isEditingNotice = false;
  noticeForm: Partial<Notice> = {
    title: '',
    description: '',
    noticeType: 'General',
    targetAudience: 'ALL',
    status: 'draft',
    visibleToStudents: true,
    visibleToTeachers: true,
    visibleToParents: true,
    sendEmail: false,
    sendSms: false,
    sendWhatsapp: false
  };
  // Teacher Announcements
  teacherAnnouncements: any[] = [];
  isLoadingTeacherAnnouncements = false;
  showTeacherAnnouncementFilters = false;
  teacherAnnouncementFilters: any = {
    status: '',
    type: '',
    includeHidden: false
  };
  selectedTeacherAnnouncement: any = null;
  showTeacherAnnouncementModal = false;
  showAdminRemarkModal = false;
  adminRemarkForm: any = {
    remark: ''
  };
  
  // Fees properties
  feesSubTab: 'structure' | 'assignment' | 'payment' | 'dashboard' | 'receipt' | 'policy' = 'structure';
  feeStructures: FeeStructure[] = [];
  isLoadingFeeStructures = false;
  showFeeStructureFilters = false;
  feeStructureFilters: any = {
    courseId: undefined,
    classId: undefined,
    sectionId: undefined,
    feeType: '',
    status: ''
  };
  feeStructureFilterClasses: ClassEntity[] = [];
  feeStructureFilterSections: Section[] = [];
  feeStructureForm: Partial<FeeStructure> = {};
  isEditingFeeStructure = false;
  showFeeStructureModal = false;
  selectedFeeStructure: FeeStructure | null = null;

  feeAssignments: FeeAssignment[] = [];
  isLoadingFeeAssignments = false;
  showFeeAssignmentFilters = false;
  feeAssignmentFilters: any = {
    studentName: '',
    courseId: undefined,
    classId: undefined,
    sectionId: undefined,
    status: ''
  };
  feeAssignmentFilterClasses: ClassEntity[] = [];
  feeAssignmentFilterSections: Section[] = [];
  feeAssignmentForm: Partial<FeeAssignment> = {};
  isEditingFeeAssignment = false;
  showFeeAssignmentModal = false;
  selectedFeeAssignment: FeeAssignment | null = null;

  feePayments: FeePayment[] = [];
  isLoadingFeePayments = false;
  showFeePaymentFilters = false;
  feePaymentFilters: any = {
    studentName: '',
    paymentMode: '',
    status: '',
    fromDate: '',
    toDate: ''
  };
  feePaymentForm: Partial<FeePayment> = {};
  isEditingFeePayment = false;
  showFeePaymentModal = false;
  selectedFeePayment: FeePayment | null = null;

  financialDashboard: FinancialDashboard | null = null;
  isLoadingFinancialDashboard = false;
  financialDashboardFilters: any = {
    fromDate: '',
    toDate: ''
  };

  receipts: Receipt[] = [];
  isLoadingReceipts = false;
  showReceiptFilters = false;
  receiptFilters: any = {
    studentName: '',
    status: ''
  };

  feePolicy: FeePolicy | null = null;
  isLoadingFeePolicy = false;
  feePolicyForm: Partial<FeePolicy> = {};
  isEditingFeePolicy = false;
  showFeePolicyModal = false;

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
  subjectSearch = {
    name: '',
    code: '',
    type: '',
    status: '',
    course: '',
    className: ''
  };
  showSubjectStudentsModal = false;
  selectedSubjectForView: Subject | null = null;
  subjectStudents: Student[] = [];
  isLoadingSubjectStudents = false;
  subjectTeacherMappingsForSubject: SubjectTeacherMapping[] = [];
  isLoadingSubjectTeachers = false;
  sectionTeacherMappings: SubjectTeacherMapping[] = [];
  isLoadingSectionTeachers = false;
  
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
    private subjectService: SubjectService,
    private subjectContentService: SubjectContentService,
    private assignmentService: AssignmentService,
    private attendanceService: AttendanceService,
    private noticeService: NoticeService,
    private announcementService: AnnouncementService,
    private feeService: FeeService
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

  formatNoticeDate(date: string | undefined): string {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  }

  formatAuditDate(date: string | undefined): string {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  }

  // Teacher Announcements Methods
  onTeacherAnnouncementsTabClick(): void {
    this.activeTab = 'teacher-announcements';
    this.loadTeacherAnnouncements();
  }

  loadTeacherAnnouncements(): void {
    if (!this.entity?.id) return;
    this.isLoadingTeacherAnnouncements = true;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    
    this.announcementService.getAllAnnouncementsForAdmin(
      entityId,
      this.teacherAnnouncementFilters.includeHidden
    ).subscribe({
      next: (res: any) => {
        let data = res && res.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        
        // Apply filters
        if (this.teacherAnnouncementFilters.status) {
          data = data.filter((a: any) => a.status === this.teacherAnnouncementFilters.status);
        }
        if (this.teacherAnnouncementFilters.type) {
          data = data.filter((a: any) => a.announcementType === this.teacherAnnouncementFilters.type);
        }
        
        this.teacherAnnouncements = data || [];
        this.isLoadingTeacherAnnouncements = false;
      },
      error: (err) => {
        console.error('Error loading teacher announcements:', err);
        this.teacherAnnouncements = [];
        this.isLoadingTeacherAnnouncements = false;
      }
    });
  }

  resetTeacherAnnouncementFilters(): void {
    this.teacherAnnouncementFilters = {
      status: '',
      type: '',
      includeHidden: false
    };
    this.loadTeacherAnnouncements();
  }

  viewTeacherAnnouncement(announcement: any): void {
    this.selectedTeacherAnnouncement = announcement;
    this.showTeacherAnnouncementModal = true;
  }

  closeTeacherAnnouncementModal(): void {
    this.showTeacherAnnouncementModal = false;
    this.selectedTeacherAnnouncement = null;
  }

  toggleHideAnnouncement(announcement: any): void {
    if (!announcement?.id) return;
    const user = this.auth.getUser();
    const adminUserId = user?.id;
    if (!adminUserId) {
      alert('Admin user ID not found');
      return;
    }
    
    const newHideStatus = !announcement.isHidden;
    this.announcementService.toggleHide(announcement.id, adminUserId, newHideStatus).subscribe({
      next: (result: any) => {
        if (result && result.ok) {
          this.showSnackbarMessage(
            newHideStatus ? 'Announcement hidden successfully' : 'Announcement shown successfully',
            'success'
          );
          this.loadTeacherAnnouncements();
        } else {
          this.showSnackbarMessage(result?.message || 'Failed to update announcement', 'error');
        }
      },
      error: (err) => {
        console.error('Error toggling hide:', err);
        this.showSnackbarMessage('Failed to update announcement: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  addAdminRemark(announcement: any): void {
    this.selectedTeacherAnnouncement = announcement;
    this.adminRemarkForm.remark = announcement.adminRemark || '';
    this.showAdminRemarkModal = true;
  }

  closeAdminRemarkModal(): void {
    this.showAdminRemarkModal = false;
    this.adminRemarkForm.remark = '';
    this.selectedTeacherAnnouncement = null;
  }

  saveAdminRemark(): void {
    if (!this.selectedTeacherAnnouncement?.id) return;
    const user = this.auth.getUser();
    const adminUserId = user?.id;
    if (!adminUserId) {
      alert('Admin user ID not found');
      return;
    }
    
    this.announcementService.updateAdminRemark(
      this.selectedTeacherAnnouncement.id,
      adminUserId,
      this.adminRemarkForm.remark || ''
    ).subscribe({
      next: (result: any) => {
        if (result && result.ok) {
          this.showSnackbarMessage('Remark saved successfully', 'success');
          this.closeAdminRemarkModal();
          this.loadTeacherAnnouncements();
        } else {
          this.showSnackbarMessage(result?.message || 'Failed to save remark', 'error');
        }
      },
      error: (err) => {
        console.error('Error saving remark:', err);
        this.showSnackbarMessage('Failed to save remark: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  downloadTeacherAnnouncementAttachment(announcement: any): void {
    if (announcement.attachmentData) {
      const link = document.createElement('a');
      link.href = announcement.attachmentData;
      link.download = announcement.attachmentName || 'attachment';
      link.click();
    }
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

  getSubjectNameById(subjectId: number | undefined): string {
    if (!subjectId) return 'N/A';
    const subject = this.subjectList.find(s => s.id === subjectId);
    return subject ? (subject.subjectCode ? `${subject.subjectCode} - ${subject.name}` : subject.name) : 'N/A';
  }

  // Fees Methods
  onFeesTabClick(): void {
    this.activeTab = 'fees';
    this.feesSubTab = 'structure';
    this.loadCourses();
    this.loadFeeStructures();
    this.loadFeePolicy();
  }

  loadFeeStructures(): void {
    if (!this.entity?.id) return;
    this.isLoadingFeeStructures = true;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    
    this.feeService.getFeeStructures(
      entityId,
      this.feeStructureFilters.courseId,
      this.feeStructureFilters.classId,
      this.feeStructureFilters.sectionId,
      this.feeStructureFilters.feeType || undefined,
      this.feeStructureFilters.status || undefined
    ).subscribe({
      next: (res: any) => {
        const data = res && res.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.feeStructures = data || [];
        this.isLoadingFeeStructures = false;
      },
      error: (err) => {
        console.error('Error loading fee structures:', err);
        this.feeStructures = [];
        this.isLoadingFeeStructures = false;
      }
    });
  }

  onFeeStructureCourseChange(): void {
    // Check if modal is open (use feeStructureForm) or filter is being used (use feeStructureFilters)
    const courseId = this.showFeeStructureModal && this.feeStructureForm.courseId 
      ? (typeof this.feeStructureForm.courseId === 'string' ? parseInt(this.feeStructureForm.courseId) : this.feeStructureForm.courseId)
      : (this.feeStructureFilters.courseId ? (typeof this.feeStructureFilters.courseId === 'string' ? parseInt(this.feeStructureFilters.courseId) : this.feeStructureFilters.courseId) : null);
    
    if (this.showFeeStructureModal) {
      // Modal is open - update form
      this.feeStructureForm.classId = undefined;
      this.feeStructureForm.sectionId = undefined;
    } else {
      // Filter is being used
      this.feeStructureFilters.classId = undefined;
      this.feeStructureFilters.sectionId = undefined;
    }
    
    this.feeStructureFilterClasses = [];
    this.feeStructureFilterSections = [];
    
    if (courseId) {
      this.subjectService.getClassesByCourse(courseId).subscribe({
        next: (result) => {
          if (result.ok && result.data) {
            this.feeStructureFilterClasses = result.data;
          }
        },
        error: () => {
          this.feeStructureFilterClasses = [];
        }
      });
    }
  }

  onFeeStructureClassChange(): void {
    // Check if modal is open (use feeStructureForm) or filter is being used (use feeStructureFilters)
    const classId = this.showFeeStructureModal && this.feeStructureForm.classId
      ? (typeof this.feeStructureForm.classId === 'string' ? parseInt(this.feeStructureForm.classId) : this.feeStructureForm.classId)
      : (this.feeStructureFilters.classId ? (typeof this.feeStructureFilters.classId === 'string' ? parseInt(this.feeStructureFilters.classId) : this.feeStructureFilters.classId) : null);
    
    if (this.showFeeStructureModal) {
      // Modal is open - update form
      this.feeStructureForm.sectionId = undefined;
    } else {
      // Filter is being used
      this.feeStructureFilters.sectionId = undefined;
    }
    
    this.feeStructureFilterSections = [];
    
    if (classId) {
      this.subjectService.getSectionsByClass(classId).subscribe({
        next: (result) => {
          if (result.ok && result.data) {
            this.feeStructureFilterSections = result.data;
          }
        },
        error: () => {
          this.feeStructureFilterSections = [];
        }
      });
    }
  }

  resetFeeStructureFilters(): void {
    this.feeStructureFilters = {
      courseId: undefined,
      classId: undefined,
      sectionId: undefined,
      feeType: '',
      status: ''
    };
    this.feeStructureFilterClasses = [];
    this.feeStructureFilterSections = [];
    this.loadFeeStructures();
  }

  openCreateFeeStructureModal(): void {
    this.isEditingFeeStructure = false;
    this.feeStructureForm = {
      entityId: typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0),
      feeName: '',
      feeType: 'TUITION',
      amount: 0,
      isRecurring: false,
      status: 'active'
    };
    // Reset classes and sections when opening new modal
    this.feeStructureFilterClasses = [];
    this.feeStructureFilterSections = [];
    this.showFeeStructureModal = true;
  }

  viewFeeStructure(structure: FeeStructure): void {
    this.selectedFeeStructure = structure;
    // TODO: Open view modal
  }

  editFeeStructure(structure: FeeStructure): void {
    this.isEditingFeeStructure = true;
    this.selectedFeeStructure = structure;
    this.feeStructureForm = { ...structure };
    // Load classes if courseId exists
    if (this.feeStructureForm.courseId) {
      const courseId = typeof this.feeStructureForm.courseId === 'string' ? parseInt(this.feeStructureForm.courseId) : this.feeStructureForm.courseId;
      this.subjectService.getClassesByCourse(courseId).subscribe({
        next: (result) => {
          if (result.ok && result.data) {
            this.feeStructureFilterClasses = result.data;
            // Load sections if classId exists
            if (this.feeStructureForm.classId) {
              const classId = typeof this.feeStructureForm.classId === 'string' ? parseInt(this.feeStructureForm.classId) : this.feeStructureForm.classId;
              this.subjectService.getSectionsByClass(classId).subscribe({
                next: (sectionResult) => {
                  if (sectionResult.ok && sectionResult.data) {
                    this.feeStructureFilterSections = sectionResult.data;
                  }
                }
              });
            }
          }
        }
      });
    } else {
      this.feeStructureFilterClasses = [];
      this.feeStructureFilterSections = [];
    }
    this.showFeeStructureModal = true;
  }

  saveFeeStructure(): void {
    if (!this.entity?.id) {
      this.showSnackbarMessage('Entity not found', 'error');
      return;
    }

    const user = this.auth.getUser();
    if (!user || !user.id) {
      this.showSnackbarMessage('User not authenticated', 'error');
      return;
    }
    const userId = user.id;

    if (!this.feeStructureForm.feeName || !this.feeStructureForm.feeType || !this.feeStructureForm.amount) {
      this.showSnackbarMessage('Please fill all required fields', 'error');
      return;
    }

    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    this.feeStructureForm.entityId = entityId;

    if (this.isEditingFeeStructure && this.feeStructureForm.id) {
      // Update existing
      this.feeService.updateFeeStructure(this.feeStructureForm.id, this.feeStructureForm as FeeStructure, userId).subscribe({
        next: (res: any) => {
          if (res && res.ok) {
            this.showSnackbarMessage('Fee structure updated successfully', 'success');
            this.showFeeStructureModal = false;
            this.loadFeeStructures();
            this.feeStructureForm = {};
          } else {
            this.showSnackbarMessage(res?.message || 'Failed to update fee structure', 'error');
          }
        },
        error: (err) => {
          console.error('Error updating fee structure:', err);
          this.showSnackbarMessage('Failed to update fee structure: ' + (err.error?.message || err.message), 'error');
        }
      });
    } else {
      // Create new
      this.feeService.createFeeStructure(this.feeStructureForm as FeeStructure, userId).subscribe({
        next: (res: any) => {
          if (res && res.ok) {
            this.showSnackbarMessage('Fee structure created successfully', 'success');
            this.showFeeStructureModal = false;
            this.loadFeeStructures();
            this.feeStructureForm = {};
          } else {
            this.showSnackbarMessage(res?.message || 'Failed to create fee structure', 'error');
          }
        },
        error: (err) => {
          console.error('Error creating fee structure:', err);
          this.showSnackbarMessage('Failed to create fee structure: ' + (err.error?.message || err.message), 'error');
        }
      });
    }
  }

  deleteFeeStructure(structure: FeeStructure): void {
    if (!structure.id) return;
    this.confirmMessage = 'Delete this fee structure? This action cannot be undone.';
    this.confirmCallback = () => {
      this.feeService.deleteFeeStructure(structure.id!).subscribe({
        next: (res: any) => {
          if (res && res.ok) {
            this.showSnackbarMessage('Fee structure deleted successfully', 'success');
            this.loadFeeStructures();
          } else {
            this.showSnackbarMessage(res?.message || 'Failed to delete fee structure', 'error');
          }
        },
        error: (err) => {
          console.error('Error deleting fee structure:', err);
          this.showSnackbarMessage('Failed to delete fee structure: ' + (err.error?.message || err.message), 'error');
        }
      });
    };
    this.showConfirmDialog = true;
  }

  loadFeeAssignments(): void {
    if (!this.entity?.id) return;
    this.isLoadingFeeAssignments = true;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    
    this.feeService.getFeeAssignments(
      entityId,
      undefined, // studentId
      this.feeAssignmentFilters.courseId,
      this.feeAssignmentFilters.classId,
      this.feeAssignmentFilters.sectionId,
      this.feeAssignmentFilters.status || undefined
    ).subscribe({
      next: (res: any) => {
        const data = res && res.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.feeAssignments = data || [];
        this.isLoadingFeeAssignments = false;
      },
      error: (err) => {
        console.error('Error loading fee assignments:', err);
        this.feeAssignments = [];
        this.isLoadingFeeAssignments = false;
      }
    });
  }

  onFeeAssignmentCourseChange(): void {
    this.feeAssignmentFilters.classId = undefined;
    this.feeAssignmentFilters.sectionId = undefined;
    this.feeAssignmentFilterClasses = [];
    this.feeAssignmentFilterSections = [];
    
    if (this.feeAssignmentFilters.courseId) {
      const courseId = typeof this.feeAssignmentFilters.courseId === 'string' ? parseInt(this.feeAssignmentFilters.courseId) : this.feeAssignmentFilters.courseId;
      this.subjectService.getClassesByCourse(courseId).subscribe({
        next: (result) => {
          if (result.ok && result.data) {
            this.feeAssignmentFilterClasses = result.data;
          }
        }
      });
    }
  }

  onFeeAssignmentClassChange(): void {
    this.feeAssignmentFilters.sectionId = undefined;
    this.feeAssignmentFilterSections = [];
    
    if (this.feeAssignmentFilters.classId) {
      const classId = typeof this.feeAssignmentFilters.classId === 'string' ? parseInt(this.feeAssignmentFilters.classId) : this.feeAssignmentFilters.classId;
      this.subjectService.getSectionsByClass(classId).subscribe({
        next: (result) => {
          if (result.ok && result.data) {
            this.feeAssignmentFilterSections = result.data;
          }
        }
      });
    }
  }

  resetFeeAssignmentFilters(): void {
    this.feeAssignmentFilters = {
      studentName: '',
      courseId: undefined,
      classId: undefined,
      sectionId: undefined,
      status: ''
    };
    this.feeAssignmentFilterClasses = [];
    this.feeAssignmentFilterSections = [];
    this.loadFeeAssignments();
  }

  openCreateFeeAssignmentModal(): void {
    this.isEditingFeeAssignment = false;
    this.feeAssignmentForm = {
      entityId: typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0),
      studentId: 0,
      feeStructureId: 0,
      totalAmount: 0,
      finalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      status: 'pending'
    };
    // Ensure students and fee structures are loaded
    if (this.students.length === 0) {
      this.loadStudents('all');
    }
    if (this.feeStructures.length === 0) {
      this.loadFeeStructures();
    }
    this.showFeeAssignmentModal = true;
  }

  viewFeeAssignment(assignment: FeeAssignment): void {
    this.selectedFeeAssignment = assignment;
    // TODO: Open view modal
  }

  editFeeAssignment(assignment: FeeAssignment): void {
    this.isEditingFeeAssignment = true;
    this.selectedFeeAssignment = assignment;
    this.feeAssignmentForm = { ...assignment };
    this.showFeeAssignmentModal = true;
  }

  recordPaymentForAssignment(assignment: FeeAssignment): void {
    this.selectedFeeAssignment = assignment;
    this.feePaymentForm = {
      entityId: typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0),
      studentId: assignment.studentId,
      feeAssignmentId: assignment.id || 0,
      amount: assignment.pendingAmount || 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'CASH',
      status: 'completed'
    };
    this.showFeePaymentModal = true;
  }

  onFeeAssignmentStudentChange(): void {
    // Student selected, can load student details if needed
  }

  onFeeAssignmentStructureChange(): void {
    // Fee structure selected, load amount
    if (this.feeAssignmentForm.feeStructureId) {
      const structure = this.feeStructures.find(s => s.id === this.feeAssignmentForm.feeStructureId);
      if (structure) {
        this.feeAssignmentForm.totalAmount = structure.amount || 0;
        this.calculateFinalAmount();
      }
    }
  }

  calculateFinalAmount(): void {
    const totalAmount = this.feeAssignmentForm.totalAmount || 0;
    const discountAmount = this.feeAssignmentForm.discountAmount || 0;
    const discountPercentage = this.feeAssignmentForm.discountPercentage || 0;
    const scholarshipAmount = this.feeAssignmentForm.scholarshipAmount || 0;

    // Calculate discount from percentage
    const discountFromPercentage = totalAmount * (discountPercentage / 100);
    const totalDiscount = discountAmount + discountFromPercentage;
    
    // Calculate final amount
    this.feeAssignmentForm.finalAmount = Math.max(0, totalAmount - totalDiscount - scholarshipAmount);
    this.feeAssignmentForm.pendingAmount = this.feeAssignmentForm.finalAmount - (this.feeAssignmentForm.paidAmount || 0);
  }

  saveFeeAssignment(): void {
    if (!this.entity?.id) {
      this.showSnackbarMessage('Entity not found', 'error');
      return;
    }

    if (!this.feeAssignmentForm.studentId || this.feeAssignmentForm.studentId === 0) {
      this.showSnackbarMessage('Please select a student', 'error');
      return;
    }

    if (!this.feeAssignmentForm.feeStructureId || this.feeAssignmentForm.feeStructureId === 0) {
      this.showSnackbarMessage('Please select a fee structure', 'error');
      return;
    }

    if (!this.feeAssignmentForm.dueDate) {
      this.showSnackbarMessage('Please select a due date', 'error');
      return;
    }

    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    // Get userId from auth service or use 0 as default
    const user = this.auth.getUser();
    const userId = user?.id ? (typeof user.id === 'string' ? parseInt(user.id) : user.id) : 0;

    if (this.isEditingFeeAssignment && this.feeAssignmentForm.id) {
      // Update existing assignment
      this.feeService.updateFeeAssignment(
        this.feeAssignmentForm.id,
        {
          ...this.feeAssignmentForm,
          entityId: entityId,
          studentId: this.feeAssignmentForm.studentId,
          feeStructureId: this.feeAssignmentForm.feeStructureId,
          totalAmount: this.feeAssignmentForm.totalAmount || 0,
          finalAmount: this.feeAssignmentForm.finalAmount || 0,
          paidAmount: this.feeAssignmentForm.paidAmount || 0,
          pendingAmount: this.feeAssignmentForm.pendingAmount || 0,
          dueDate: this.feeAssignmentForm.dueDate,
          discountAmount: this.feeAssignmentForm.discountAmount || 0,
          discountPercentage: this.feeAssignmentForm.discountPercentage || 0,
          scholarshipAmount: this.feeAssignmentForm.scholarshipAmount || 0,
          academicYear: this.feeAssignmentForm.academicYear,
          status: this.feeAssignmentForm.status || 'pending',
          remarks: this.feeAssignmentForm.remarks
        },
        userId
      ).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.showSnackbarMessage('Fee assignment updated successfully', 'success');
            this.showFeeAssignmentModal = false;
            this.loadFeeAssignments();
          } else {
            this.showSnackbarMessage(res.message || 'Failed to update fee assignment', 'error');
          }
        },
        error: (err: any) => {
          this.showSnackbarMessage(err.error?.message || 'Error updating fee assignment', 'error');
        }
      });
    } else {
      // Create new assignment
      this.feeService.assignFeeToStudent(
        entityId,
        this.feeAssignmentForm.studentId,
        this.feeAssignmentForm.feeStructureId,
        this.feeAssignmentForm.discountAmount,
        this.feeAssignmentForm.discountPercentage,
        this.feeAssignmentForm.scholarshipAmount,
        this.feeAssignmentForm.academicYear,
        userId
      ).subscribe({
        next: (res: any) => {
          if (res.ok) {
            this.showSnackbarMessage('Fee assigned successfully', 'success');
            this.showFeeAssignmentModal = false;
            this.loadFeeAssignments();
          } else {
            this.showSnackbarMessage(res.message || 'Failed to assign fee', 'error');
          }
        },
        error: (err: any) => {
          this.showSnackbarMessage(err.error?.message || 'Error assigning fee', 'error');
        }
      });
    }
  }

  loadFeePayments(): void {
    if (!this.entity?.id) return;
    this.isLoadingFeePayments = true;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    
    this.feeService.getPayments(
      entityId,
      undefined, // studentId
      this.feePaymentFilters.status || undefined,
      this.feePaymentFilters.paymentMode || undefined,
      this.feePaymentFilters.fromDate || undefined,
      this.feePaymentFilters.toDate || undefined
    ).subscribe({
      next: (res: any) => {
        const data = res && res.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.feePayments = data || [];
        this.isLoadingFeePayments = false;
      },
      error: (err) => {
        console.error('Error loading payments:', err);
        this.feePayments = [];
        this.isLoadingFeePayments = false;
      }
    });
  }

  resetFeePaymentFilters(): void {
    this.feePaymentFilters = {
      studentName: '',
      paymentMode: '',
      status: '',
      fromDate: '',
      toDate: ''
    };
    this.loadFeePayments();
  }

  openCreatePaymentModal(): void {
    this.isEditingFeePayment = false;
    this.feePaymentForm = {
      entityId: typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0),
      studentId: 0,
      feeAssignmentId: 0,
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'CASH',
      status: 'completed'
    };
    this.showFeePaymentModal = true;
  }

  viewFeePayment(payment: FeePayment): void {
    this.selectedFeePayment = payment;
    // TODO: Open view modal
  }

  editFeePayment(payment: FeePayment): void {
    this.isEditingFeePayment = true;
    this.selectedFeePayment = payment;
    this.feePaymentForm = { ...payment };
    this.showFeePaymentModal = true;
  }

  downloadReceiptForPayment(payment: FeePayment): void {
    if (!payment.id) return;
    this.feeService.getReceiptByPaymentId(payment.id).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const receipt = res.data;
          if (receipt.receiptPdfData) {
            const link = document.createElement('a');
            link.href = receipt.receiptPdfData;
            link.download = `receipt-${receipt.receiptNumber || payment.id}.pdf`;
            link.click();
          } else if (receipt.receiptPdfUrl) {
            window.open(receipt.receiptPdfUrl, '_blank');
          } else {
            this.showSnackbarMessage('Receipt not available', 'error');
          }
        }
      },
      error: (err) => {
        console.error('Error downloading receipt:', err);
        this.showSnackbarMessage('Failed to download receipt', 'error');
      }
    });
  }

  loadFinancialDashboard(): void {
    if (!this.entity?.id) return;
    this.isLoadingFinancialDashboard = true;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    
    this.feeService.getFinancialDashboard(
      entityId,
      this.financialDashboardFilters.fromDate || undefined,
      this.financialDashboardFilters.toDate || undefined
    ).subscribe({
      next: (res: any) => {
        const data = res && res.data ? res.data : res;
        this.financialDashboard = data || null;
        this.isLoadingFinancialDashboard = false;
      },
      error: (err) => {
        console.error('Error loading financial dashboard:', err);
        this.financialDashboard = null;
        this.isLoadingFinancialDashboard = false;
      }
    });
  }

  loadReceipts(): void {
    if (!this.entity?.id) return;
    this.isLoadingReceipts = true;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    
    // Load payments first to get amounts for receipts
    if (this.feePayments.length === 0) {
      this.loadFeePayments();
    }
    
    this.feeService.getReceipts(
      entityId,
      undefined, // studentId
      this.receiptFilters.status || undefined
    ).subscribe({
      next: (res: any) => {
        const data = res && res.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.receipts = data || [];
        this.isLoadingReceipts = false;
      },
      error: (err) => {
        console.error('Error loading receipts:', err);
        this.receipts = [];
        this.isLoadingReceipts = false;
      }
    });
  }

  resetReceiptFilters(): void {
    this.receiptFilters = {
      studentName: '',
      status: ''
    };
    this.loadReceipts();
  }

  viewReceipt(receipt: Receipt): void {
    // TODO: Open view modal
  }

  downloadReceipt(receipt: Receipt): void {
    if (receipt.receiptPdfData) {
      const link = document.createElement('a');
      link.href = receipt.receiptPdfData;
      link.download = `receipt-${receipt.receiptNumber || receipt.id}.pdf`;
      link.click();
    } else if (receipt.receiptPdfUrl) {
      window.open(receipt.receiptPdfUrl, '_blank');
    } else {
      this.showSnackbarMessage('Receipt PDF not available', 'error');
    }
  }

  sendReceipt(receipt: Receipt): void {
    if (!receipt.id) return;
    this.feeService.sendReceipt(receipt.id, 'EMAIL').subscribe({
      next: (res: any) => {
        if (res && res.ok) {
          this.showSnackbarMessage('Receipt sent successfully', 'success');
          this.loadReceipts();
        } else {
          this.showSnackbarMessage(res?.message || 'Failed to send receipt', 'error');
        }
      },
      error: (err) => {
        console.error('Error sending receipt:', err);
        this.showSnackbarMessage('Failed to send receipt: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  loadFeePolicy(): void {
    if (!this.entity?.id) return;
    this.isLoadingFeePolicy = true;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    
    this.feeService.getFeePolicy(entityId).subscribe({
      next: (res: any) => {
        const data = res && res.data ? res.data : res;
        this.feePolicy = data || null;
        this.isLoadingFeePolicy = false;
      },
      error: (err) => {
        console.error('Error loading fee policy:', err);
        this.feePolicy = null;
        this.isLoadingFeePolicy = false;
      }
    });
  }

  openEditFeePolicyModal(): void {
    this.isEditingFeePolicy = true;
    this.feePolicyForm = this.feePolicy ? { ...this.feePolicy } : {
      entityId: typeof this.entity?.id === 'string' ? parseInt(this.entity.id) : (this.entity?.id || 0),
      lateFineType: 'PERCENTAGE',
      lateFinePercentage: 0,
      lateFineFixedAmount: 0,
      lateFineGracePeriodDays: 0,
      installmentEligibilityPercentage: 0,
      refundAllowed: false,
      autoAssignFees: true,
      financialYearLocked: false
    };
    this.showFeePolicyModal = true;
  }

  getFeeStructureName(feeStructureId: number | undefined): string {
    if (!feeStructureId) return 'N/A';
    const structure = this.feeStructures.find(f => f.id === feeStructureId);
    return structure ? (structure.feeName || 'N/A') : 'N/A';
  }

  deleteAuditLog(log: any): void {
    if (!log?.id) return;
    this.confirmMessage = 'Delete this audit log entry? This action cannot be undone.';
    this.confirmCallback = () => {
      const user = this.auth.getUser();
      const userId = user?.id;
      this.noticeService.deleteAuditLog(log.id, userId).subscribe({
        next: (result) => {
          if (result && result.ok) {
            this.showSnackbarMessage('Audit log deleted', 'success');
            this.loadNoticeAuditLogs();
          } else {
            this.showSnackbarMessage('Failed to delete audit log', 'error');
          }
        },
        error: (err) => {
          console.error('Error deleting audit log:', err);
          this.showSnackbarMessage('Failed to delete audit log: ' + (err.error?.message || err.message), 'error');
        }
      });
    };
    this.showConfirmDialog = true;
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
    this.loadSubjectListLookups(entityId);

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

  // Load subjects for Subject List tab
  loadSubjectList(): void {
    if (!this.entity?.id) {
      console.log('loadSubjectList: No entity ID');
      return;
    }
    const entityId = Number(this.entity.id);
    this.loadSubjectListLookups(entityId);
    this.isLoadingSubjectList = true;
    console.log('loadSubjectList: Loading subjects for entity:', entityId);
    this.subjectService.getSubjectsByEntity(entityId).subscribe({
      next: (result) => {
        this.isLoadingSubjectList = false;
        console.log('loadSubjectList: API response:', result);
        if (result && result.ok && result.data) {
          this.subjectList = Array.isArray(result.data) ? result.data : [];
        } else if (result && result.data && Array.isArray(result.data)) {
          this.subjectList = result.data;
        } else if (Array.isArray(result)) {
          this.subjectList = result;
        } else {
          this.subjectList = [];
        }
        console.log('loadSubjectList: Subjects loaded:', this.subjectList.length);
        if (this.activeTab === 'syllabus-materials' && !this.selectedSubjectForContentId && this.subjectList.length > 0) {
          this.selectedSubjectForContentId = this.subjectList[0].id ?? null;
          this.onSubjectContentSubjectChange();
        }
      },
      error: (err) => {
        this.isLoadingSubjectList = false;
        console.error('loadSubjectList: Error loading subjects:', err);
        this.subjectList = [];
      }
    });
  }

  onSubjectContentSubjectChange(): void {
    if (!this.selectedSubjectForContentId) {
      this.subjectContentForm.subjectId = 0;
      return;
    }
    const subjectId = typeof this.selectedSubjectForContentId === 'string'
      ? parseInt(this.selectedSubjectForContentId)
      : this.selectedSubjectForContentId;
    if (!subjectId || Number.isNaN(subjectId)) {
      this.subjectContentForm.subjectId = 0;
      return;
    }
    this.selectedSubjectForContentId = subjectId;
    const subject = this.subjectList.find(s => s.id === subjectId);
    if (subject?.classId) {
      this.subjectContentForm.classId = subject.classId;
    }
    this.subjectContentForm.subjectId = subjectId;
  }

  onContentSubjectFilterChange(): void {
    if (!this.contentSearch.subjectId) {
      this.subjectContents = [];
      return;
    }
    const subjectId = parseInt(this.contentSearch.subjectId, 10);
    if (!Number.isNaN(subjectId)) {
      this.loadSubjectContents(subjectId);
    }
  }

  openSubjectContentView(content: SubjectContent): void {
    this.subjectContentModalMode = 'view';
    this.selectedSubjectContent = content;
    this.showSubjectContentModal = true;
  }

  openSubjectContentEdit(content: SubjectContent): void {
    this.subjectContentModalMode = 'edit';
    this.selectedSubjectContent = content;
    const subject = this.subjectList.find((item) => item.id === content.subjectId);
    this.subjectContentEditForm = {
      ...content,
      classId: content.classId || subject?.classId || undefined,
      visibleToStudents: content.visibleToStudents ?? true,
      visibleToParents: content.visibleToParents ?? false,
      teacherEditable: content.teacherEditable ?? true,
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
      teacherEditable: this.subjectContentEditForm.teacherEditable,
      status: this.subjectContentEditForm.status || 'active'
    };

    if (!payload.fileData) {
      delete payload.fileData;
      delete payload.fileName;
    }

    this.subjectContentService.updateContent(this.selectedSubjectContent.id, payload).subscribe({
      next: (result) => {
        if (result && result.ok) {
          this.showSnackbarMessage('Content updated successfully', 'success');
          this.closeSubjectContentModal();
          this.loadSubjectContents(subjectId);
        } else {
          this.showSnackbarMessage(result.message || 'Failed to update content', 'error');
        }
      },
      error: (err) => {
        console.error('saveSubjectContentChanges: Error', err);
        this.showSnackbarMessage('Failed to update content', 'error');
      }
    });
  }

  onAssignmentsTabClick(): void {
    this.activeTab = 'assignments';
    this.loadCourses();
    this.loadAllSubjects();
    this.loadTeachers('all');
    this.loadAssignmentOverview();
    this.loadAdminAssignments();
  }

  onAssignmentCourseChange(): void {
    this.assignmentFilters.classId = '';
    this.assignmentFilters.sectionId = '';
    this.assignmentFilterSections = [];
    this.assignmentFilterClasses = [];
    if (!this.assignmentFilters.courseId) {
      return;
    }
    const courseId = parseInt(this.assignmentFilters.courseId, 10);
    if (Number.isNaN(courseId)) {
      return;
    }
    this.subjectService.getClassesByCourse(courseId).subscribe({
      next: (result) => {
        if (result && result.ok && Array.isArray(result.data)) {
          this.assignmentFilterClasses = result.data;
        } else {
          this.assignmentFilterClasses = [];
        }
      },
      error: () => {
        this.assignmentFilterClasses = [];
      }
    });
  }

  onAssignmentClassChange(): void {
    this.assignmentFilters.sectionId = '';
    this.assignmentFilterSections = [];
    if (!this.assignmentFilters.classId) {
      return;
    }
    const classId = parseInt(this.assignmentFilters.classId, 10);
    if (Number.isNaN(classId)) {
      return;
    }
    this.subjectService.getSectionsByClass(classId).subscribe({
      next: (result) => {
        if (result && result.ok && Array.isArray(result.data)) {
          this.assignmentFilterSections = result.data;
        } else {
          this.assignmentFilterSections = [];
        }
      },
      error: () => {
        this.assignmentFilterSections = [];
      }
    });
  }

  applyAssignmentFilters(): void {
    this.loadAssignmentOverview();
    this.loadAdminAssignments();
  }

  resetAssignmentFilters(): void {
    this.assignmentFilters = {
      courseId: '',
      classId: '',
      sectionId: '',
      subjectId: '',
      teacherId: '',
      status: '',
      fromDate: '',
      toDate: ''
    };
    this.assignmentFilterClasses = [];
    this.assignmentFilterSections = [];
    this.applyAssignmentFilters();
  }

  loadAssignmentOverview(): void {
    if (!this.entity?.id) {
      return;
    }
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    const params = { entityId, ...this.assignmentFilters };
    this.isLoadingAssignmentOverview = true;
    this.assignmentService.getAdminOverview(params).subscribe({
      next: (result) => {
        this.isLoadingAssignmentOverview = false;
        this.assignmentOverview = result && result.ok ? result.data : null;
      },
      error: () => {
        this.isLoadingAssignmentOverview = false;
        this.assignmentOverview = null;
      }
    });
  }

  loadAdminAssignments(): void {
    if (!this.entity?.id) {
      return;
    }
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    const params = { entityId, ...this.assignmentFilters };
    this.isLoadingAdminAssignments = true;
    this.assignmentService.getAdminAssignments(params).subscribe({
      next: (result) => {
        this.isLoadingAdminAssignments = false;
        if (result && result.ok && Array.isArray(result.data)) {
          this.adminAssignments = result.data;
        } else {
          this.adminAssignments = [];
        }
      },
      error: () => {
        this.isLoadingAdminAssignments = false;
        this.adminAssignments = [];
      }
    });
  }

  updateAssignmentStatus(assignment: AssignmentSummary, status: string): void {
    if (!assignment.id) return;
    this.assignmentService.updateStatus(assignment.id, status).subscribe({
      next: () => {
        this.showSnackbarMessage('Assignment updated', 'success');
        this.loadAssignmentOverview();
        this.loadAdminAssignments();
      },
      error: () => this.showSnackbarMessage('Failed to update assignment', 'error')
    });
  }

  extendAssignmentDueDate(assignment: AssignmentSummary): void {
    if (!assignment.id) return;
    const newDate = prompt('Enter new due date (YYYY-MM-DD):');
    if (!newDate) return;
    const reason = prompt('Reason for extension:') || '';
    const extendedDueDate = `${newDate}T23:59:59`;
    this.assignmentService.extendDueDate(assignment.id, extendedDueDate, reason).subscribe({
      next: () => {
        this.showSnackbarMessage('Due date extended', 'success');
        this.loadAssignmentOverview();
        this.loadAdminAssignments();
      },
      error: () => this.showSnackbarMessage('Failed to extend due date', 'error')
    });
  }

  toggleAssignmentLock(assignment: AssignmentSummary): void {
    if (!assignment.id) return;
    const nextLock = !assignment.lockAfterDueDate;
    this.assignmentService.updateLock(assignment.id, nextLock).subscribe({
      next: () => {
        this.showSnackbarMessage('Assignment lock updated', 'success');
        this.loadAdminAssignments();
      },
      error: () => this.showSnackbarMessage('Failed to update lock', 'error')
    });
  }

  exportAssignmentsCsv(): void {
    if (!this.adminAssignments.length) return;
    const rows = this.adminAssignments.map((a) => ({
      Title: a.title,
      Subject: this.getSubjectName(a.subjectId || 0),
      Course: this.getCourseName(a.courseId || 0),
      Class: this.getClassName(a.classId || 0),
      Section: a.sectionId ? this.getSectionName(a.sectionId) : 'All',
      Teacher: a.teacherId ? this.getTeacherName(a.teacherId) : 'N/A',
      DueDate: a.extendedDueDate || a.dueDate || '',
      Status: a.status || '',
      SubmissionStatus: a.submissionStatus || '',
      TotalStudents: a.totalStudents || 0,
      Submitted: a.submittedCount || 0,
      Pending: a.pendingCount || 0,
      Late: a.lateSubmissions || 0,
      EvaluationPending: a.evaluationsPending || 0,
      AverageMarks: a.averageMarks || 0
    }));
    const header = Object.keys(rows[0]).join(',');
    const csv = [header, ...rows.map((row) => Object.values(row).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'assignments-export.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  exportAssignmentsPdf(): void {
    if (!this.adminAssignments.length) return;
    const html = `
      <html>
      <head><title>Assignments Report</title></head>
      <body>
        <h2>Assignments Report</h2>
        <table border="1" cellspacing="0" cellpadding="6">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Course</th>
              <th>Class</th>
              <th>Section</th>
              <th>Teacher</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${this.adminAssignments.map((a) => `
              <tr>
                <td>${a.title || ''}</td>
                <td>${this.getSubjectName(a.subjectId || 0)}</td>
                <td>${this.getCourseName(a.courseId || 0)}</td>
                <td>${this.getClassName(a.classId || 0)}</td>
                <td>${a.sectionId ? this.getSectionName(a.sectionId) : 'All'}</td>
                <td>${a.teacherId ? this.getTeacherName(a.teacherId) : 'N/A'}</td>
                <td>${a.extendedDueDate || a.dueDate || ''}</td>
                <td>${a.status || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  }

  onAttendanceTabClick(): void {
    this.activeTab = 'attendance';
    this.loadCourses();
    this.loadAllSubjects();
    this.loadTeachers('all');
    this.loadAttendanceOverview();
    this.loadAttendanceStudentReports();
    this.loadAttendanceTeacherActivity();
    this.loadAttendancePolicy();
    this.loadAttendanceCorrections();
    this.loadAttendanceAuditLogs();
  }

  onAttendanceCourseChange(): void {
    this.attendanceFilters.classId = '';
    this.attendanceFilters.sectionId = '';
    this.attendanceFilterSections = [];
    this.attendanceFilterClasses = [];
    if (!this.attendanceFilters.courseId) {
      return;
    }
    const courseId = parseInt(this.attendanceFilters.courseId, 10);
    if (Number.isNaN(courseId)) {
      return;
    }
    this.subjectService.getClassesByCourse(courseId).subscribe({
      next: (result) => {
        if (result && result.ok && Array.isArray(result.data)) {
          this.attendanceFilterClasses = result.data;
        } else {
          this.attendanceFilterClasses = [];
        }
      },
      error: () => {
        this.attendanceFilterClasses = [];
      }
    });
  }

  onAttendanceClassChange(): void {
    this.attendanceFilters.sectionId = '';
    this.attendanceFilterSections = [];
    if (!this.attendanceFilters.classId) {
      return;
    }
    const classId = parseInt(this.attendanceFilters.classId, 10);
    if (Number.isNaN(classId)) {
      return;
    }
    this.subjectService.getSectionsByClass(classId).subscribe({
      next: (result) => {
        if (result && result.ok && Array.isArray(result.data)) {
          this.attendanceFilterSections = result.data;
        } else {
          this.attendanceFilterSections = [];
        }
      },
      error: () => {
        this.attendanceFilterSections = [];
      }
    });
  }

  applyAttendanceFilters(): void {
    this.loadAttendanceOverview();
    this.loadAttendanceStudentReports();
    this.loadAttendanceTeacherActivity();
  }

  resetAttendanceFilters(): void {
    this.attendanceFilters = {
      courseId: '',
      classId: '',
      sectionId: '',
      subjectId: '',
      teacherId: '',
      fromDate: '',
      toDate: ''
    };
    this.attendanceFilterClasses = [];
    this.attendanceFilterSections = [];
    this.applyAttendanceFilters();
  }

  loadAttendanceOverview(): void {
    if (!this.entity?.id) return;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    const params = { entityId, ...this.attendanceFilters };
    this.isLoadingAttendanceOverview = true;
    this.attendanceService.getOverview(params).subscribe({
      next: (result) => {
        this.isLoadingAttendanceOverview = false;
        this.attendanceOverview = result && result.ok ? result.data : null;
      },
      error: () => {
        this.isLoadingAttendanceOverview = false;
        this.attendanceOverview = null;
      }
    });
  }

  loadAttendanceStudentReports(): void {
    if (!this.entity?.id) return;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    const params = { entityId, ...this.attendanceFilters };
    this.isLoadingAttendanceReports = true;
    this.attendanceService.getStudentReports(params).subscribe({
      next: (result) => {
        this.isLoadingAttendanceReports = false;
        this.attendanceStudentReports = result && result.ok && Array.isArray(result.data) ? result.data : [];
      },
      error: () => {
        this.isLoadingAttendanceReports = false;
        this.attendanceStudentReports = [];
      }
    });
  }

  loadAttendanceTeacherActivity(): void {
    if (!this.entity?.id) return;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    const params = { entityId, ...this.attendanceFilters };
    this.isLoadingAttendanceTeachers = true;
    this.attendanceService.getTeacherActivity(params).subscribe({
      next: (result) => {
        this.isLoadingAttendanceTeachers = false;
        this.attendanceTeacherActivity = result && result.ok && Array.isArray(result.data) ? result.data : [];
      },
      error: () => {
        this.isLoadingAttendanceTeachers = false;
        this.attendanceTeacherActivity = [];
      }
    });
  }

  loadAttendancePolicy(): void {
    if (!this.entity?.id) return;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    this.isLoadingAttendancePolicy = true;
    this.attendanceService.getPolicy(entityId).subscribe({
      next: (result) => {
        this.isLoadingAttendancePolicy = false;
        this.attendancePolicy = result && result.ok ? result.data : null;
      },
      error: () => {
        this.isLoadingAttendancePolicy = false;
        this.attendancePolicy = null;
      }
    });
  }

  saveAttendancePolicy(): void {
    if (!this.entity?.id || !this.attendancePolicy) return;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    this.attendanceService.updatePolicy(entityId, this.attendancePolicy).subscribe({
      next: () => this.showSnackbarMessage('Policy updated', 'success'),
      error: () => this.showSnackbarMessage('Failed to update policy', 'error')
    });
  }

  loadAttendanceCorrections(): void {
    this.isLoadingAttendanceCorrections = true;
    this.attendanceService.getCorrections('pending').subscribe({
      next: (result) => {
        this.isLoadingAttendanceCorrections = false;
        this.attendanceCorrections = result && result.ok && Array.isArray(result.data) ? result.data : [];
      },
      error: () => {
        this.isLoadingAttendanceCorrections = false;
        this.attendanceCorrections = [];
      }
    });
  }

  updateAttendanceCorrection(request: AttendanceCorrection, status: string): void {
    if (!request.id) return;
    this.attendanceService.updateCorrection(request.id, status).subscribe({
      next: () => {
        this.showSnackbarMessage('Correction updated', 'success');
        this.loadAttendanceCorrections();
      },
      error: () => this.showSnackbarMessage('Failed to update correction', 'error')
    });
  }

  // ========== TEACHER ATTENDANCE METHODS ==========

  loadTeacherDailyAttendance(): void {
    if (!this.entity?.id) {
      alert('Entity not loaded');
      return;
    }

    this.isLoadingTeacherAttendance = true;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    
    this.attendanceService.getTeacherDailyAttendance(entityId, this.teacherAttendanceDate).subscribe({
      next: (result: any) => {
        if (result.ok && result.data) {
          this.teacherAttendanceData = result.data;
          this.teacherAttendanceSession = result.data.session;
          this.teacherAttendanceList = result.data.teachers.map((t: any) => ({
            ...t,
            status: t.status || '',
            entryId: t.entryId || null
          }));
        } else {
          this.teacherAttendanceList = [];
        }
        this.isLoadingTeacherAttendance = false;
      },
      error: (err) => {
        alert('Error loading teacher attendance: ' + (err.error?.message || err.message));
        console.error('Error loading teacher attendance:', err);
        this.teacherAttendanceList = [];
        this.isLoadingTeacherAttendance = false;
      }
    });
  }

  markTeacherAttendanceStatus(teacher: any, status: string): void {
    teacher.status = status;
  }

  markAllTeachersPresent(): void {
    this.teacherAttendanceList.forEach((teacher: any) => {
      teacher.status = 'present';
    });
  }

  resetTeacherAttendance(): void {
    this.teacherAttendanceList.forEach((teacher: any) => {
      teacher.status = '';
    });
  }

  getTeacherPresentCount(): number {
    return this.teacherAttendanceList.filter((t: any) => t.status === 'present').length;
  }

  getTeacherAbsentCount(): number {
    return this.teacherAttendanceList.filter((t: any) => t.status === 'absent').length;
  }

  getTeacherLeaveCount(): number {
    return this.teacherAttendanceList.filter((t: any) => t.status === 'leave').length;
  }

  getTeacherHalfDayCount(): number {
    return this.teacherAttendanceList.filter((t: any) => t.status === 'half-day').length;
  }

  saveTeacherAttendance(): void {
    if (!this.entity?.id || !this.teacherAttendanceSession?.id) {
      alert('Session not loaded');
      return;
    }

    const user = this.auth.getUser();
    const markedByUserId = user?.id || 1;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;

    const attendanceData = this.teacherAttendanceList
      .filter((t: any) => t.status === 'present' || t.status === 'absent' || t.status === 'leave' || t.status === 'half-day')
      .map((t: any) => ({
        teacherId: t.teacherId,
        status: t.status,
        remarks: t.remarks || null
      }));

    if (attendanceData.length === 0) {
      alert('Please mark attendance for at least one teacher');
      return;
    }

    this.isSavingTeacherAttendance = true;
    this.attendanceService.markTeacherAttendance(
      entityId,
      this.teacherAttendanceSession.id,
      markedByUserId,
      attendanceData
    ).subscribe({
      next: (result: any) => {
        if (result.ok) {
          alert('Teacher attendance saved successfully!');
          this.teacherAttendanceSession.status = result.data.status;
          this.loadTeacherDailyAttendance();
        } else {
          alert('Error: ' + (result.message || 'Failed to save attendance'));
        }
        this.isSavingTeacherAttendance = false;
      },
      error: (err) => {
        alert('Error saving teacher attendance: ' + (err.error?.message || err.message));
        console.error('Error saving teacher attendance:', err);
        this.isSavingTeacherAttendance = false;
      }
    });
  }

  loadTeacherAttendanceDashboard(): void {
    if (!this.entity?.id) return;

    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    
    this.attendanceService.getTeacherAttendanceDashboard(entityId).subscribe({
      next: (result: any) => {
        if (result.ok && result.data) {
          this.teacherAttendanceDashboard = result.data;
        } else {
          this.teacherAttendanceDashboard = null;
        }
      },
      error: (err) => {
        console.error('Error loading teacher attendance dashboard:', err);
        this.teacherAttendanceDashboard = null;
      }
    });
  }

  loadTeacherAttendanceReports(): void {
    if (!this.entity?.id || !this.teacherReportFromDate || !this.teacherReportToDate) {
      alert('Please select both from and to dates');
      return;
    }

    this.isLoadingTeacherReports = true;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    
    this.attendanceService.getTeacherAttendanceReports(
      entityId,
      this.teacherReportFromDate,
      this.teacherReportToDate
    ).subscribe({
      next: (result: any) => {
        if (result.ok && result.data) {
          this.teacherAttendanceReports = result.data;
        } else {
          this.teacherAttendanceReports = [];
        }
        this.isLoadingTeacherReports = false;
      },
      error: (err) => {
        alert('Error loading reports: ' + (err.error?.message || err.message));
        console.error('Error loading teacher attendance reports:', err);
        this.teacherAttendanceReports = [];
        this.isLoadingTeacherReports = false;
      }
    });
  }

  loadAttendanceAuditLogs(): void {
    if (!this.entity?.id) return;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    this.isLoadingAttendanceAudit = true;
    this.attendanceService.getAuditLogs(entityId).subscribe({
      next: (result) => {
        this.isLoadingAttendanceAudit = false;
        this.attendanceAuditLogs = result && result.ok && Array.isArray(result.data) ? result.data : [];
      },
      error: () => {
        this.isLoadingAttendanceAudit = false;
        this.attendanceAuditLogs = [];
      }
    });
  }

  exportAttendanceReportsCsv(): void {
    if (!this.attendanceStudentReports.length) return;
    const rows = this.attendanceStudentReports.map((report) => ({
      StudentId: report.studentId,
      AttendancePercent: report.percent || 0,
      Present: report.present || 0,
      Total: report.total || 0
    }));
    const header = Object.keys(rows[0]).join(',');
    const csv = [header, ...rows.map((row) => Object.values(row).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'attendance-student-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  exportAttendanceReportsPdf(): void {
    if (!this.attendanceStudentReports.length) return;
    const html = `
      <html>
      <head><title>Attendance Report</title></head>
      <body>
        <h2>Student Attendance Report</h2>
        <table border="1" cellspacing="0" cellpadding="6">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Attendance %</th>
              <th>Present</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${this.attendanceStudentReports.map((r) => `
              <tr>
                <td>${r.studentId}</td>
                <td>${(r.percent || 0).toFixed(1)}</td>
                <td>${r.present || 0}</td>
                <td>${r.total || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  }

  onNoticesTabClick(): void {
    this.activeTab = 'notices';
    this.loadCourses();
    this.loadAllSubjects();
    this.loadTeachers('all');
    this.loadNoticesOverview();
    this.loadAdminNotices();
    this.loadNoticeAuditLogs();
  }

  onNoticeCourseChange(): void {
    this.noticeFilters.classId = '';
    this.noticeFilters.sectionId = '';
    this.noticeFilterClasses = [];
    this.noticeFilterSections = [];
    if (!this.noticeFilters.courseId) return;
    const courseId = parseInt(this.noticeFilters.courseId, 10);
    if (Number.isNaN(courseId)) return;
    this.subjectService.getClassesByCourse(courseId).subscribe({
      next: (result) => {
        if (result && result.ok && Array.isArray(result.data)) {
          this.noticeFilterClasses = result.data;
        } else {
          this.noticeFilterClasses = [];
        }
      },
      error: () => {
        this.noticeFilterClasses = [];
      }
    });
  }

  onNoticeClassChange(): void {
    this.noticeFilters.sectionId = '';
    this.noticeFilterSections = [];
    if (!this.noticeFilters.classId) return;
    const classId = parseInt(this.noticeFilters.classId, 10);
    if (Number.isNaN(classId)) return;
    this.subjectService.getSectionsByClass(classId).subscribe({
      next: (result) => {
        if (result && result.ok && Array.isArray(result.data)) {
          this.noticeFilterSections = result.data;
        } else {
          this.noticeFilterSections = [];
        }
      },
      error: () => {
        this.noticeFilterSections = [];
      }
    });
  }

  onNoticeFormCourseChange(): void {
    this.noticeForm.classId = undefined;
    this.noticeForm.sectionId = undefined;
    this.noticeFormClasses = [];
    this.noticeFormSections = [];
    if (!this.noticeForm.courseId) return;
    const courseId = Number(this.noticeForm.courseId);
    if (Number.isNaN(courseId)) return;
    this.subjectService.getClassesByCourse(courseId).subscribe({
      next: (result) => {
        if (result && result.ok && Array.isArray(result.data)) {
          this.noticeFormClasses = result.data;
        } else {
          this.noticeFormClasses = [];
        }
      },
      error: () => {
        this.noticeFormClasses = [];
      }
    });
  }

  onNoticeFormClassChange(): void {
    this.noticeForm.sectionId = undefined;
    this.noticeFormSections = [];
    if (!this.noticeForm.classId) return;
    const classId = Number(this.noticeForm.classId);
    if (Number.isNaN(classId)) return;
    this.subjectService.getSectionsByClass(classId).subscribe({
      next: (result) => {
        if (result && result.ok && Array.isArray(result.data)) {
          this.noticeFormSections = result.data;
        } else {
          this.noticeFormSections = [];
        }
      },
      error: () => {
        this.noticeFormSections = [];
      }
    });
  }

  applyNoticeFilters(): void {
    this.loadNoticesOverview();
    this.loadAdminNotices();
  }

  resetNoticeFilters(): void {
    this.noticeFilters = {
      courseId: '',
      classId: '',
      sectionId: '',
      noticeType: '',
      targetAudience: '',
      status: '',
      fromDate: '',
      toDate: ''
    };
    this.noticeFilterClasses = [];
    this.noticeFilterSections = [];
    this.applyNoticeFilters();
  }

  loadNoticesOverview(): void {
    if (!this.entity?.id) return;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    const params = { entityId, ...this.noticeFilters };
    this.isLoadingNoticeOverview = true;
    this.noticeService.getAdminOverview(params).subscribe({
      next: (result) => {
        this.isLoadingNoticeOverview = false;
        this.noticesOverview = result && result.ok ? result.data : null;
      },
      error: () => {
        this.isLoadingNoticeOverview = false;
        this.noticesOverview = null;
      }
    });
  }

  loadAdminNotices(): void {
    if (!this.entity?.id) return;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    const params = { entityId, ...this.noticeFilters };
    this.isLoadingNotices = true;
    this.noticeService.getAdminList(params).subscribe({
      next: (result) => {
        this.isLoadingNotices = false;
        this.adminNotices = result && result.ok && Array.isArray(result.data) ? result.data : [];
      },
      error: () => {
        this.isLoadingNotices = false;
        this.adminNotices = [];
      }
    });
  }

  loadNoticeAuditLogs(): void {
    if (!this.entity?.id) return;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    this.isLoadingNoticeAudit = true;
    this.noticeService.getAuditLogs(entityId).subscribe({
      next: (result) => {
        this.isLoadingNoticeAudit = false;
        this.noticeAuditLogs = result && result.ok && Array.isArray(result.data) ? result.data : [];
      },
      error: () => {
        this.isLoadingNoticeAudit = false;
        this.noticeAuditLogs = [];
      }
    });
  }

  onNoticeAttachmentSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.noticeForm.attachmentData = result;
        this.noticeForm.attachmentName = file.name;
        this.noticeForm.attachmentType = file.type;
      };
      reader.readAsDataURL(file);
    }
  }

  editNotice(notice: any): void {
    if (!notice?.id) {
      console.error('Cannot edit notice: no ID found', notice);
      return;
    }
    
    // Ensure we're on the notices tab
    this.activeTab = 'notices';
    
    this.isEditingNotice = true;
    this.noticeForm = { ...notice };
    this.noticeForm.id = notice.id;
    
    // Format dates for datetime-local inputs (YYYY-MM-DDTHH:mm)
    if (this.noticeForm.publishAt) {
      try {
        const publishDate = new Date(this.noticeForm.publishAt);
        const year = publishDate.getFullYear();
        const month = String(publishDate.getMonth() + 1).padStart(2, '0');
        const day = String(publishDate.getDate()).padStart(2, '0');
        const hours = String(publishDate.getHours()).padStart(2, '0');
        const minutes = String(publishDate.getMinutes()).padStart(2, '0');
        this.noticeForm.publishAt = `${year}-${month}-${day}T${hours}:${minutes}`;
      } catch (e) {
        console.error('Error formatting publishAt date:', e);
      }
    }
    
    if (this.noticeForm.expiresAt) {
      try {
        const expiresDate = new Date(this.noticeForm.expiresAt);
        const year = expiresDate.getFullYear();
        const month = String(expiresDate.getMonth() + 1).padStart(2, '0');
        const day = String(expiresDate.getDate()).padStart(2, '0');
        const hours = String(expiresDate.getHours()).padStart(2, '0');
        const minutes = String(expiresDate.getMinutes()).padStart(2, '0');
        this.noticeForm.expiresAt = `${year}-${month}-${day}T${hours}:${minutes}`;
      } catch (e) {
        console.error('Error formatting expiresAt date:', e);
      }
    }
    
    if (this.noticeForm.courseId) {
      this.onNoticeFormCourseChange();
    }
    if (this.noticeForm.classId) {
      this.onNoticeFormClassChange();
    }
    
    // Scroll to form after a brief delay to ensure DOM is updated
    setTimeout(() => {
      const formElement = document.querySelector('.form-header h3');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  }

  resetNoticeForm(): void {
    this.isEditingNotice = false;
    this.noticeFormClasses = [];
    this.noticeFormSections = [];
    this.noticeForm = {
      title: '',
      description: '',
      noticeType: 'General',
      targetAudience: 'ALL',
      status: 'draft',
      visibleToStudents: true,
      visibleToTeachers: true,
      visibleToParents: true,
      sendEmail: false,
      sendSms: false,
      sendWhatsapp: false
    };
  }

  saveNotice(): void {
    if (!this.entity?.id || !this.noticeForm.title) {
      this.showSnackbarMessage('Please fill required fields', 'error');
      return;
    }
    const user = this.auth.getUser();
    const userId = user?.id;
    const entityId = typeof this.entity.id === 'string' ? parseInt(this.entity.id) : this.entity.id;
    
    const isUpdate = this.isEditingNotice && this.noticeForm.id;
    console.log('Saving notice:', { isUpdate, noticeId: this.noticeForm.id, isEditing: this.isEditingNotice });
    
    const payload: Notice = {
      ...this.noticeForm,
      entityId,
      courseId: this.noticeForm.courseId ? Number(this.noticeForm.courseId) : undefined,
      classId: this.noticeForm.classId ? Number(this.noticeForm.classId) : undefined,
      sectionId: this.noticeForm.sectionId ? Number(this.noticeForm.sectionId) : undefined
    } as Notice;

    const action = isUpdate
      ? this.noticeService.updateNotice(this.noticeForm.id!, payload, userId)
      : this.noticeService.createNotice(payload, userId);

    action.subscribe({
      next: (result) => {
        console.log('Notice save result:', result);
        if (result && result.ok) {
          this.showSnackbarMessage(isUpdate ? 'Notice updated successfully' : 'Notice created successfully', 'success');
          this.resetNoticeForm();
          this.loadNoticesOverview();
          this.loadAdminNotices();
          this.loadNoticeAuditLogs();
        } else {
          this.showSnackbarMessage(result?.message || 'Failed to save notice', 'error');
        }
      },
      error: (err) => {
        console.error('Error saving notice:', err);
        this.showSnackbarMessage('Failed to save notice: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  updateNoticeStatus(notice: any, status: string): void {
    if (!notice?.id) return;
    const user = this.auth.getUser();
    const userId = user?.id;
    this.noticeService.updateStatus(notice.id, status, userId).subscribe({
      next: () => {
        this.showSnackbarMessage('Notice updated', 'success');
        this.loadNoticesOverview();
        this.loadAdminNotices();
        this.loadNoticeAuditLogs();
      },
      error: () => this.showSnackbarMessage('Failed to update notice', 'error')
    });
  }

  deleteNotice(notice: any): void {
    if (!notice?.id) return;
    this.confirmMessage = 'Delete this notice? This cannot be undone.';
    this.confirmCallback = () => {
      const user = this.auth.getUser();
      const userId = user?.id;
      this.noticeService.deleteNotice(notice.id, userId).subscribe({
        next: (result) => {
          if (result && result.ok) {
            this.showSnackbarMessage('Notice deleted', 'success');
            this.loadNoticesOverview();
            this.loadAdminNotices();
            this.loadNoticeAuditLogs();
          } else {
            this.showSnackbarMessage('Failed to delete notice', 'error');
          }
        },
        error: () => this.showSnackbarMessage('Failed to delete notice', 'error')
      });
    };
    this.showConfirmDialog = true;
  }

  loadSubjectContents(subjectId: number): void {
    this.isLoadingSubjectContents = true;
    this.subjectContentService.getBySubject(subjectId, 'ADMIN').subscribe({
      next: (result) => {
        this.isLoadingSubjectContents = false;
        if (result && result.ok && Array.isArray(result.data)) {
          this.subjectContents = result.data;
        } else {
          this.subjectContents = [];
        }
      },
      error: (err) => {
        this.isLoadingSubjectContents = false;
        console.error('loadSubjectContents: Error', err);
        this.subjectContents = [];
      }
    });
  }

  onSubjectContentFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.subjectContentForm.fileData = result;
        this.subjectContentForm.fileName = file.name;
      };
      reader.readAsDataURL(file);
    }
  }

  submitSubjectContent(): void {
    if (!this.entity?.id) {
      this.showSnackbarMessage('Entity not loaded', 'error');
      return;
    }
    if (!this.selectedSubjectForContentId) {
      this.showSnackbarMessage('Please select a subject', 'error');
      return;
    }
    const subjectId = typeof this.selectedSubjectForContentId === 'string'
      ? parseInt(this.selectedSubjectForContentId)
      : this.selectedSubjectForContentId;
    if (!subjectId || Number.isNaN(subjectId)) {
      this.showSnackbarMessage('Please select a valid subject', 'error');
      return;
    }
    if (!this.subjectContentForm.title || !this.subjectContentForm.type) {
      this.showSnackbarMessage('Please enter title and type', 'error');
      return;
    }

    const subject = this.subjectList.find(s => s.id === subjectId);
    const payload: SubjectContent = {
      ...this.subjectContentForm,
      entityId: Number(this.entity.id),
      subjectId,
      classId: subject?.classId || this.subjectContentForm.classId || undefined,
      sectionId: this.subjectContentForm.sectionId || undefined,
      status: this.subjectContentForm.type === 'SYLLABUS' ? 'active' : (this.subjectContentForm.status || 'active'),
      createdByRole: 'ADMIN'
    };

    this.subjectContentService.createContent(payload).subscribe({
      next: (result) => {
        if (result && result.ok) {
          this.showSnackbarMessage('Content uploaded successfully', 'success');
          this.resetSubjectContentForm();
          this.loadSubjectContents(subjectId);
        } else {
          this.showSnackbarMessage(result.message || 'Failed to upload content', 'error');
        }
      },
      error: (err) => {
        console.error('submitSubjectContent: Error', err);
        this.showSnackbarMessage('Failed to upload content', 'error');
      }
    });
  }

  resetSubjectContentForm(): void {
    this.subjectContentForm = {
      entityId: Number(this.entity?.id || 0),
      subjectId: this.selectedSubjectForContentId || 0,
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
  }

  deleteSubjectContent(content: SubjectContent): void {
    if (!content.id) return;
    this.confirmMessage = `Delete ${content.title}?`;
    this.confirmCallback = () => {
      this.subjectContentService.deleteContent(content.id!).subscribe({
        next: (result) => {
          if (result && result.ok) {
            this.showSnackbarMessage('Content deleted', 'success');
            if (this.selectedSubjectForContentId) {
              this.loadSubjectContents(this.selectedSubjectForContentId);
            }
          } else {
            this.showSnackbarMessage(result.message || 'Failed to delete content', 'error');
          }
        },
        error: () => {
          this.showSnackbarMessage('Failed to delete content', 'error');
        }
      });
    };
    this.showConfirmDialog = true;
  }

  private loadSubjectListLookups(entityId: number): void {
    this.subjectService.getCoursesByEntity(entityId).subscribe({
      next: (result) => {
        if (result && result.ok && Array.isArray(result.data)) {
          this.courses = result.data.filter((c: Course) => c.status !== 'inactive');
        } else if (Array.isArray(result)) {
          this.courses = result.filter((c: Course) => c.status !== 'inactive');
        } else {
          this.courses = [];
        }

        const courseIds = this.courses.map((course) => course.id).filter((id): id is number => !!id);
        if (courseIds.length === 0) {
          this.subjectListClasses = [];
          return;
        }

        forkJoin(courseIds.map((courseId) => this.subjectService.getClassesByCourse(courseId))).subscribe({
          next: (results) => {
            const allClasses: ClassEntity[] = [];
            results.forEach((res) => {
              if (res && res.ok && Array.isArray(res.data)) {
                allClasses.push(...res.data);
              } else if (Array.isArray(res)) {
                allClasses.push(...res);
              }
            });
            this.subjectListClasses = allClasses;
            this.loadSubjectListSections(allClasses);
          },
          error: () => {
            this.subjectListClasses = [];
            this.subjectListSectionsByClass = {};
          }
        });
      },
      error: () => {
        this.courses = [];
        this.subjectListClasses = [];
        this.subjectListSectionsByClass = {};
      }
    });
  }

  private loadSubjectListSections(classes: ClassEntity[]): void {
    const classIds = classes.map((classItem) => classItem.id).filter((id): id is number => !!id);
    if (classIds.length === 0) {
      this.subjectListSectionsByClass = {};
      return;
    }

    forkJoin(classIds.map((classId) => this.subjectService.getSectionsByClass(classId))).subscribe({
      next: (results) => {
        const sectionsByClass: Record<number, Section[]> = {};
        results.forEach((res, index) => {
          const classId = classIds[index];
          if (res && res.ok && Array.isArray(res.data)) {
            sectionsByClass[classId] = res.data;
          } else if (Array.isArray(res)) {
            sectionsByClass[classId] = res;
          } else {
            sectionsByClass[classId] = [];
          }
        });
        this.subjectListSectionsByClass = sectionsByClass;
      },
      error: () => {
        this.subjectListSectionsByClass = {};
      }
    });
  }

  // Helper method to check if activeTab is 'subject-list' (to avoid TypeScript narrowing issue)
  isSubjectListTab(): boolean {
    const result = this.activeTab === 'subject-list';
    console.log('🔥 isSubjectListTab() called: activeTab =', this.activeTab, ', result =', result);
    return result;
  }

  isSyllabusMaterialsTab(): boolean {
    return this.activeTab === 'syllabus-materials';
  }

  // Helper method to check if subjectSubTab is 'teacher-assignment' (to avoid TypeScript narrowing issue)
  isTeacherAssignmentTab(): boolean {
    return this.subjectSubTab === 'teacher-assignment';
  }

  getClassName(classId: any): string {
    if (!classId) return 'N/A';
    const classItem = this.subjectListClasses.find(c => c.id === classId) || this.classes.find(c => c.id === classId);
    return classItem ? classItem.name : 'N/A';
  }

  getSectionNamesForClass(classId: any): string {
    if (!classId) return 'N/A';
    const sections = this.subjectListSectionsByClass[classId];
    if (!sections || sections.length === 0) return 'All Sections';
    return sections.map((section) => section.name).join(', ');
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
            this.loadSubjectList(); // Reload Subject List tab
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
            this.loadSubjectList(); // Reload Subject List tab
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
            this.loadSubjectList(); // Also reload Subject List tab
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

  getSubjectName(subjectId: number | string): string {
    const id = typeof subjectId === 'string' ? parseInt(subjectId, 10) : subjectId;
    const subject = this.allSubjects.find(s => s.id === id);
    return subject ? subject.name : 'Unknown';
  }

  getTeacherName(teacherId: number): string {
    const teacher = this.teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown';
  }

  getStudentName(studentId: number | undefined): string {
    if (!studentId) return 'N/A';
    const student = this.students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'N/A';
  }

  getReceiptAmount(receipt: Receipt): number {
    if (!receipt.feePaymentId) return 0;
    const payment = this.feePayments.find(p => p.id === receipt.feePaymentId);
    return payment ? payment.amount : 0;
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

    if (!section) {
      const allSubjectListSections = Object.values(this.subjectListSectionsByClass).flat();
      section = allSubjectListSections.find(s => s.id === sectionId);
    }
    
    return section ? section.name : 'All Sections';
  }

  getStudentCourseName(student: Student): string {
    if (student.courseId) {
      const courseName = this.getCourseName(student.courseId);
      if (courseName !== 'N/A') {
        return courseName;
      }
    }

    if (student.classId) {
      const classItem = this.subjectListClasses.find(c => c.id === student.classId) || this.classes.find(c => c.id === student.classId);
      if (classItem?.courseId) {
        const courseName = this.getCourseName(classItem.courseId);
        if (courseName !== 'N/A') {
          return courseName;
        }
      }
    }

    return student.classCourse || 'N/A';
  }

  getStudentClassName(student: Student): string {
    if (student.classId) {
      return this.getClassName(student.classId);
    }
    return 'N/A';
  }

  getStudentSectionName(student: Student): string {
    if (student.sectionId) {
      return this.getSectionName(student.sectionId);
    }
    return student.classSection || 'N/A';
  }

  private normalizeFilterValue(value: any): string {
    return (value ?? '').toString().trim().toLowerCase();
  }

  private buildUniqueOptions(values: string[]): string[] {
    return Array.from(new Set(values.filter((value) => value && value.trim() !== '')))
      .sort((a, b) => a.localeCompare(b));
  }

  get studentFilterOptions() {
    const students = this.students || [];
    return {
      names: this.buildUniqueOptions(
        students.map((student) => `${student.firstName || ''} ${student.lastName || ''}`.trim())
      ),
      emails: this.buildUniqueOptions(students.map((student) => student.email || '')),
      rolls: this.buildUniqueOptions(students.map((student) => student.rollNumber || '')),
      phones: this.buildUniqueOptions(students.map((student) => student.phone || '')),
      courses: this.buildUniqueOptions(students.map((student) => this.getStudentCourseName(student))),
      classes: this.buildUniqueOptions(students.map((student) => this.getStudentClassName(student))),
      sections: this.buildUniqueOptions(students.map((student) => this.getStudentSectionName(student))),
      academicYears: this.buildUniqueOptions(students.map((student) => student.academicYear || ''))
    };
  }

  get teacherFilterOptions() {
    const teachers = this.teachers || [];
    return {
      names: this.buildUniqueOptions(
        teachers.map((teacher) => `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim())
      ),
      emails: this.buildUniqueOptions(teachers.map((teacher) => teacher.email || '')),
      employeeIds: this.buildUniqueOptions(teachers.map((teacher) => teacher.employeeId || '')),
      phones: this.buildUniqueOptions(teachers.map((teacher) => teacher.phone || '')),
      qualifications: this.buildUniqueOptions(teachers.map((teacher) => teacher.qualification || '')),
      specializations: this.buildUniqueOptions(teachers.map((teacher) => teacher.specialization || ''))
    };
  }

  get subjectFilterOptions() {
    const subjects = this.subjectList || [];
    return {
      names: this.buildUniqueOptions(subjects.map((subject) => subject.name || '')),
      codes: this.buildUniqueOptions(subjects.map((subject) => subject.subjectCode || '')),
      types: this.buildUniqueOptions(subjects.map((subject) => subject.subjectType || '')),
      statuses: this.buildUniqueOptions(subjects.map((subject) => subject.status || '')),
      courses: this.buildUniqueOptions(subjects.map((subject) => this.getCourseName(subject.courseId))),
      classes: this.buildUniqueOptions(subjects.map((subject) => this.getClassName(subject.classId)))
    };
  }

  get contentFilterOptions() {
    const baseTypes = (this.subjectContentTypes || []).map((type) => type || '');
    const baseStatuses = ['active', 'inactive'];
    return {
      types: this.buildUniqueOptions([
        ...baseTypes,
        ...this.subjectContents.map((c) => c.type || '')
      ]),
      units: this.buildUniqueOptions(this.subjectContents.map((c) => c.unit || '')),
      topics: this.buildUniqueOptions(this.subjectContents.map((c) => c.topicName || '')),
      statuses: this.buildUniqueOptions([
        ...baseStatuses,
        ...this.subjectContents.map((c) => c.status || '')
      ])
    };
  }

  get filteredSubjectContents(): SubjectContent[] {
    const filters = {
      subjectId: this.normalizeFilterValue(this.contentSearch.subjectId),
      type: this.normalizeFilterValue(this.contentSearch.type),
      unit: this.normalizeFilterValue(this.contentSearch.unit),
      topic: this.normalizeFilterValue(this.contentSearch.topic),
      status: this.normalizeFilterValue(this.contentSearch.status),
      visibleStudents: this.normalizeFilterValue(this.contentSearch.visibleStudents),
      visibleParents: this.normalizeFilterValue(this.contentSearch.visibleParents)
    };

    return this.subjectContents.filter((content) => {
      const visibleStudents = content.visibleToStudents ? 'yes' : 'no';
      const visibleParents = content.visibleToParents ? 'yes' : 'no';
      return (!filters.subjectId || this.normalizeFilterValue(content.subjectId) === filters.subjectId)
        && (!filters.type || this.normalizeFilterValue(content.type).includes(filters.type))
        && (!filters.unit || this.normalizeFilterValue(content.unit).includes(filters.unit))
        && (!filters.topic || this.normalizeFilterValue(content.topicName).includes(filters.topic))
        && (!filters.status || this.normalizeFilterValue(content.status).includes(filters.status))
        && (!filters.visibleStudents || this.normalizeFilterValue(visibleStudents) === filters.visibleStudents)
        && (!filters.visibleParents || this.normalizeFilterValue(visibleParents) === filters.visibleParents);
    });
  }

  get filteredStudents(): Student[] {
    if (!this.students || this.students.length === 0) {
      return [];
    }
    const filters = {
      name: this.normalizeFilterValue(this.studentSearch.name),
      email: this.normalizeFilterValue(this.studentSearch.email),
      roll: this.normalizeFilterValue(this.studentSearch.roll),
      phone: this.normalizeFilterValue(this.studentSearch.phone),
      course: this.normalizeFilterValue(this.studentSearch.course),
      className: this.normalizeFilterValue(this.studentSearch.className),
      section: this.normalizeFilterValue(this.studentSearch.section),
      academicYear: this.normalizeFilterValue(this.studentSearch.academicYear)
    };

    return this.students.filter((student) => {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
      const courseName = this.getStudentCourseName(student);
      const className = this.getStudentClassName(student);
      const sectionName = this.getStudentSectionName(student);
      const academicYear = student.academicYear || '';
      const rollNumber = student.rollNumber || '';
      const email = student.email || '';
      const phone = student.phone || '';

      return (!filters.name || this.normalizeFilterValue(fullName).includes(filters.name))
        && (!filters.email || this.normalizeFilterValue(email).includes(filters.email))
        && (!filters.roll || this.normalizeFilterValue(rollNumber).includes(filters.roll))
        && (!filters.phone || this.normalizeFilterValue(phone).includes(filters.phone))
        && (!filters.course || this.normalizeFilterValue(courseName).includes(filters.course))
        && (!filters.className || this.normalizeFilterValue(className).includes(filters.className))
        && (!filters.section || this.normalizeFilterValue(sectionName).includes(filters.section))
        && (!filters.academicYear || this.normalizeFilterValue(academicYear).includes(filters.academicYear));
    });
  }

  get filteredTeachers(): Teacher[] {
    if (!this.teachers || this.teachers.length === 0) {
      return [];
    }
    const filters = {
      name: this.normalizeFilterValue(this.teacherSearch.name),
      email: this.normalizeFilterValue(this.teacherSearch.email),
      employeeId: this.normalizeFilterValue(this.teacherSearch.employeeId),
      phone: this.normalizeFilterValue(this.teacherSearch.phone),
      qualification: this.normalizeFilterValue(this.teacherSearch.qualification),
      specialization: this.normalizeFilterValue(this.teacherSearch.specialization)
    };

    return this.teachers.filter((teacher) => {
      const fullName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
      const email = teacher.email || '';
      const employeeId = teacher.employeeId || '';
      const phone = teacher.phone || '';
      const qualification = teacher.qualification || '';
      const specialization = teacher.specialization || '';

      return (!filters.name || this.normalizeFilterValue(fullName).includes(filters.name))
        && (!filters.email || this.normalizeFilterValue(email).includes(filters.email))
        && (!filters.employeeId || this.normalizeFilterValue(employeeId).includes(filters.employeeId))
        && (!filters.phone || this.normalizeFilterValue(phone).includes(filters.phone))
        && (!filters.qualification || this.normalizeFilterValue(qualification).includes(filters.qualification))
        && (!filters.specialization || this.normalizeFilterValue(specialization).includes(filters.specialization));
    });
  }

  get filteredSubjectList(): Subject[] {
    if (!this.subjectList || this.subjectList.length === 0) {
      return [];
    }
    const filters = {
      name: this.normalizeFilterValue(this.subjectSearch.name),
      code: this.normalizeFilterValue(this.subjectSearch.code),
      type: this.normalizeFilterValue(this.subjectSearch.type),
      status: this.normalizeFilterValue(this.subjectSearch.status),
      course: this.normalizeFilterValue(this.subjectSearch.course),
      className: this.normalizeFilterValue(this.subjectSearch.className)
    };

    return this.subjectList.filter((subject) => {
      const name = subject.name || '';
      const code = subject.subjectCode || '';
      const type = subject.subjectType || '';
      const status = subject.status || '';
      const courseName = this.getCourseName(subject.courseId);
      const className = this.getClassName(subject.classId);

      return (!filters.name || this.normalizeFilterValue(name).includes(filters.name))
        && (!filters.code || this.normalizeFilterValue(code).includes(filters.code))
        && (!filters.type || this.normalizeFilterValue(type).includes(filters.type))
        && (!filters.status || this.normalizeFilterValue(status).includes(filters.status))
        && (!filters.course || this.normalizeFilterValue(courseName).includes(filters.course))
        && (!filters.className || this.normalizeFilterValue(className).includes(filters.className));
    });
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
    this.sectionTeacherMappings = [];
    this.isLoadingSectionTeachers = true;
    this.loadTeachers('all');
    
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

      this.subjectService.getMappingsBySection(section.id).subscribe({
        next: (result) => {
          this.isLoadingSectionTeachers = false;
          if (result && result.ok && Array.isArray(result.data)) {
            this.sectionTeacherMappings = result.data;
          } else {
            this.sectionTeacherMappings = [];
          }
        },
        error: () => {
          this.isLoadingSectionTeachers = false;
          this.sectionTeacherMappings = [];
        }
      });
    } else {
      this.isLoadingSectionTeachers = false;
    }
  }

  closeSectionStudentsModal(): void {
    this.showSectionStudentsModal = false;
    this.selectedSectionForView = null;
    this.sectionStudents = [];
  }

  viewSubjectStudents(subject: Subject): void {
    this.selectedSubjectForView = subject;
    this.subjectStudents = [];
    this.isLoadingSubjectStudents = true;
    this.showSubjectStudentsModal = true;
    this.subjectTeacherMappingsForSubject = [];
    this.isLoadingSubjectTeachers = true;
    this.loadTeachers('all');

    if (!subject.classId) {
      this.isLoadingSubjectStudents = false;
      this.isLoadingSubjectTeachers = false;
      return;
    }

    this.studentService.getStudentsByClass(subject.classId).subscribe({
      next: (result) => {
        this.isLoadingSubjectStudents = false;
        if (result.ok && result.students) {
          this.subjectStudents = result.students;
        } else {
          this.subjectStudents = [];
        }
      },
      error: (err) => {
        this.isLoadingSubjectStudents = false;
        console.error('Error loading subject students:', err);
        this.subjectStudents = [];
      }
    });

    if (subject.id) {
      this.subjectService.getMappingsBySubject(subject.id).subscribe({
        next: (result) => {
          this.isLoadingSubjectTeachers = false;
          if (result && result.ok && Array.isArray(result.data)) {
            this.subjectTeacherMappingsForSubject = result.data;
          } else {
            this.subjectTeacherMappingsForSubject = [];
          }
        },
        error: () => {
          this.isLoadingSubjectTeachers = false;
          this.subjectTeacherMappingsForSubject = [];
        }
      });
    } else {
      this.isLoadingSubjectTeachers = false;
    }
  }

  closeSubjectStudentsModal(): void {
    this.showSubjectStudentsModal = false;
    this.selectedSubjectForView = null;
    this.subjectStudents = [];
    this.subjectTeacherMappingsForSubject = [];
  }

  // Feature access control helper method
  isFeatureEnabled(featureName: string): boolean {
    if (!this.entity || !this.entity.features) {
      return true; // Default to enabled if features not loaded
    }
    // Check if feature exists and is enabled
    return this.entity.features[featureName] === true;
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
