import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { EntityService, Entity } from '../../services/entity.service';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-entity-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  template: `
    <div class="page" [style.--entity-primary-color]="entity?.primaryColor || '#10b981'">
      <!-- Top Nav -->
      <header class="nav">
        <div class="nav-left">
          <button class="back-btn" (click)="goBack()" aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <a class="brand" routerLink="/superadmin/dashboard">
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
            <a routerLink="/superadmin/dashboard" class="breadcrumb-link">Dashboard</a>
            <span class="breadcrumb-separator">></span>
            <a routerLink="/superadmin/entities" class="breadcrumb-link">Administration</a>
            <span class="breadcrumb-separator">></span>
            <span class="breadcrumb-current">Entity Details</span>
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
              <div class="user-badge">SUPERADMIN</div>
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
        <div class="entity-header-card">
          <div class="entity-header-left">
            <div class="entity-header-icon">
              <img *ngIf="entity?.logoUrl" [src]="entity?.logoUrl" alt="Logo" class="entity-logo-img" />
              <span *ngIf="!entity?.logoUrl">🏢</span>
            </div>
            <div class="entity-header-info">
              <div class="entity-header-title">
                <h1>{{ entity?.name || 'Loading...' }}</h1>
                <span class="status-badge active" *ngIf="entity?.status === 'active'">{{ entity?.status }}</span>
              </div>
              <div class="entity-header-meta">
                <span class="type-badge">{{ entity?.type }}</span>
                <span class="meta-separator">•</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ entity?.address || 'N/A' }}</span>
                <span class="meta-separator">•</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>Created {{ formatDate(entity?.createdAt) || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="nav-tabs">
          <button 
            class="nav-tab" 
            [class.active]="activeTab === 'admissions'" 
            [class.disabled]="!isFeatureEnabled('admissions')"
            (click)="onTabClick('admissions')"
            *ngIf="isFeatureEnabled('admissions')"
          >
            <span class="tab-emoji">🎓</span>
            <span>Admissions</span>
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab === 'students'" 
            [class.disabled]="!isFeatureEnabled('students')"
            (click)="onTabClick('students')"
            *ngIf="isFeatureEnabled('students')"
          >
            <span class="tab-emoji">👨‍🎓</span>
            <span>Students</span>
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab === 'teachers'" 
            [class.disabled]="!isFeatureEnabled('teachers')"
            (click)="onTabClick('teachers')"
            *ngIf="isFeatureEnabled('teachers')"
          >
            <span class="tab-emoji">👩‍🏫</span>
            <span>Teachers</span>
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab === 'exams'" 
            [class.disabled]="!isFeatureEnabled('exams')"
            (click)="onTabClick('exams')"
            *ngIf="isFeatureEnabled('exams')"
          >
            <span class="tab-emoji">📝</span>
            <span>Exams</span>
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab === 'reports'" 
            [class.disabled]="!isFeatureEnabled('reports')"
            (click)="onTabClick('reports')"
            *ngIf="isFeatureEnabled('reports')"
          >
            <span class="tab-emoji">📊</span>
            <span>Reports</span>
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab === 'fees'" 
            [class.disabled]="!isFeatureEnabled('fees')"
            (click)="onTabClick('fees')"
            *ngIf="isFeatureEnabled('fees')"
          >
            <span class="tab-emoji">💰</span>
            <span>Fees</span>
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab === 'dashboard'" 
            [class.disabled]="!isFeatureEnabled('dashboard')"
            (click)="onTabClick('dashboard')"
            *ngIf="isFeatureEnabled('dashboard')"
          >
            <span class="tab-emoji">📊</span>
            <span>My Dashboard</span>
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab === 'subjects'" 
            [class.disabled]="!isFeatureEnabled('subjects')"
            (click)="onTabClick('subjects')"
            *ngIf="isFeatureEnabled('subjects')"
          >
            <span class="tab-emoji">📚</span>
            <span>My Subjects</span>
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab === 'assignments'" 
            [class.disabled]="!isFeatureEnabled('assignments')"
            (click)="onTabClick('assignments')"
            *ngIf="isFeatureEnabled('assignments')"
          >
            <span class="tab-emoji">📝</span>
            <span>Assignments</span>
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab === 'exam-attempts'" 
            [class.disabled]="!isFeatureEnabled('exam-attempts')"
            (click)="onTabClick('exam-attempts')"
            *ngIf="isFeatureEnabled('exam-attempts')"
          >
            <span class="tab-emoji">🧪</span>
            <span>Exams</span>
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab === 'attendance'" 
            [class.disabled]="!isFeatureEnabled('attendance')"
            (click)="onTabClick('attendance')"
            *ngIf="isFeatureEnabled('attendance')"
          >
            <span class="tab-emoji">📅</span>
            <span>Attendance</span>
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab === 'notices'" 
            [class.disabled]="!isFeatureEnabled('notices')"
            (click)="onTabClick('notices')"
            *ngIf="isFeatureEnabled('notices')"
          >
            <span class="tab-emoji">📢</span>
            <span>Notices</span>
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab === 'settings'" 
            [class.disabled]="!isFeatureEnabled('settings')"
            (click)="onTabClick('settings')"
            *ngIf="isFeatureEnabled('settings')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Settings</span>
          </button>
        </div>

        <!-- Access Denied Message -->
        <div class="access-denied-section" *ngIf="!isFeatureEnabled(activeTab)">
          <div class="access-denied-content">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <h2 class="access-denied-title">You don't have access</h2>
            <p class="access-denied-message">This feature is not enabled for your entity. Please contact your administrator.</p>
          </div>
        </div>

        <!-- My Dashboard Tab -->
        <div class="dashboard-section" *ngIf="activeTab === 'dashboard' && isFeatureEnabled('dashboard')">
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

        <!-- Settings Tab -->
        <div class="settings-section" *ngIf="activeTab === 'settings' && isFeatureEnabled('settings')">
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
                    <label>Entity Name *</label>
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
                    <select 
                      class="form-input" 
                      [(ngModel)]="editForm.type"
                      [disabled]="!isEditing"
                    >
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
                        <img *ngIf="logoPreview || entity?.logoUrl" [src]="logoPreview || entity?.logoUrl" alt="Logo preview" class="logo-preview" />
                        <span *ngIf="!logoPreview && !entity?.logoUrl" class="logo-placeholder-text">No logo</span>
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
    .back-btn{
      background: transparent;
      border: none;
      color: var(--text-white);
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }
    .back-btn:hover{ opacity: 0.7; }
    .brand{ display:flex; align-items:center; gap:10px; text-decoration:none; color: var(--text-white); font-weight: 800; }
    .brand-icon{ width: 28px; height: 28px; }
    .brand-text{ font-size: 18px; }
    .nav-left{ display:flex; align-items:center; }
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
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
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
      padding: 18px 28px 16px; 
      flex: 1;
    }

    .entity-header-card{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .entity-header-left{
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
      font-size: 18px;
      line-height: 1;
    }

    .dashboard-section{
      margin-top: 24px;
    }
    .section-header{
      margin-bottom: 24px;
    }
    .section-title{
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 4px;
    }
    .section-subtitle{
      color: var(--text-gray);
      font-size: 14px;
    }
    .dashboard-content{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    .dashboard-card{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 24px;
    }
    .dashboard-card .card-title{
      font-size: 18px;
      font-weight: 900;
      margin-bottom: 12px;
    }
    .dashboard-card .card-text{
      color: var(--text-gray);
      font-size: 14px;
    }

    .settings-section{
      margin-top: 24px;
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
      margin-bottom: 4px;
    }
    .settings-subtitle{
      color: var(--text-gray);
      font-size: 14px;
    }
    .edit-icon-btn{
      background: transparent;
      border: 1px solid var(--border-gray);
      border-radius: 10px;
      padding: 10px;
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
    .color-input{
      height: 48px;
      padding: 4px;
      cursor: pointer;
    }
    .textarea{
      min-height: 100px;
      resize: vertical;
    }

    .logo-upload-section{
      position: relative;
      display: inline-block;
    }
    .logo-placeholder{
      width: 120px;
      height: 120px;
      border-radius: 12px;
      border: 2px dashed var(--border-gray);
      background: var(--secondary-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;
    }
    .logo-placeholder:hover{
      border-color: var(--entity-primary-color);
    }
    .logo-placeholder-text{
      color: var(--text-gray);
      font-weight: 700;
      font-size: 14px;
    }
    .logo-preview{
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 12px;
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
      cursor: pointer;
      border: none;
    }
    .btn-primary:hover{ background: color-mix(in srgb, var(--entity-primary-color) 85%, black); }
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

    .access-denied-section{
      margin-top: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
    .access-denied-content{
      text-align: center;
      max-width: 500px;
      padding: 40px;
    }
    .access-denied-content svg{
      color: var(--text-gray);
      margin-bottom: 24px;
      opacity: 0.6;
    }
    .access-denied-title{
      font-size: 28px;
      font-weight: 900;
      color: var(--text-white);
      margin-bottom: 12px;
    }
    .access-denied-message{
      color: var(--text-gray);
      font-size: 16px;
      line-height: 1.6;
    }
    .nav-tab.disabled{
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px){
      .nav{ padding: 0 20px; }
      .content{ padding: 18px 20px 28px; }
      .settings-content{ grid-template-columns: 1fr; }
      .entity-header-card{ flex-direction: column; gap: 16px; }
    }
  `]
})
export class EntityDetailsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  isDarkMode = true;
  entity: Entity | null = null;
  isLoading = false;
  isEditing = false;
  logoPreview: string | null = null;
  activeTab: 'admissions' | 'students' | 'teachers' | 'exams' | 'reports' | 'fees' | 'dashboard' | 'subjects' | 'assignments' | 'exam-attempts' | 'attendance' | 'notices' | 'settings' = 'dashboard';
  featureAccess: Record<string, boolean> = {};
  
  userName = 'superadmin';
  userEmail = 'superadmin@lms.com';
  userInitial = 's';
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

  constructor(
    private theme: ThemeService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private entityService: EntityService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user?.name) this.userName = user.name;
    if (user?.email) this.userEmail = user.email;
    this.userInitial = (this.userName?.trim()?.[0] || 's').toLowerCase();

    this.theme.isDarkMode$.subscribe(v => (this.isDarkMode = v));

    // Get entity ID from route
    const entityId = this.route.snapshot.paramMap.get('id');
    if (entityId) {
      this.loadEntity(entityId);
    }

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

  loadEntity(id: string): void {
    this.isLoading = true;
    this.entityService.getEntityById(id).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.ok && result.entity) {
          this.entity = result.entity;
          // Load feature access
          if (result.features) {
            this.featureAccess = result.features;
          } else {
            // Default all features enabled if not set
            this.featureAccess = {
              'admissions': true, 'students': true, 'teachers': true, 'exams': true,
              'reports': true, 'fees': true, 'dashboard': true, 'subjects': true,
              'assignments': true, 'exam-attempts': true, 'attendance': true,
              'notices': true, 'settings': true
            };
          }
          
          // Set active tab to first enabled tab
          this.setFirstEnabledTab();
          
          // Initialize edit form
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
        } else if (!result.ok) {
          console.error('Failed to load entity:', result.message || 'Unknown error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading entity:', err);
      }
    });
  }

  setFirstEnabledTab(): void {
    const tabs = ['dashboard', 'admissions', 'students', 'teachers', 'exams', 'reports', 'fees', 'subjects', 'assignments', 'exam-attempts', 'attendance', 'notices', 'settings'];
    for (const tab of tabs) {
      if (this.isFeatureEnabled(tab)) {
        this.activeTab = tab as any;
        return;
      }
    }
  }

  isFeatureEnabled(feature: string): boolean {
    return this.featureAccess[feature] !== false; // Default to true if not set
  }

  onTabClick(tab: string): void {
    if (this.isFeatureEnabled(tab)) {
      this.activeTab = tab as any;
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
  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  goProfile(): void {
    this.isUserMenuOpen = false;
    this.router.navigate(['/superadmin/profile']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goBack(): void {
    this.router.navigate(['/superadmin/entities']);
  }

  toggleEditMode(): void {
    this.isEditing = true;
    this.originalData = { ...this.editForm };
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

    // Update entity via API
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

    // Save to localStorage (mock persistence)
    const entities = JSON.parse(localStorage.getItem('entities') || '[]');
    const index = entities.findIndex((e: Entity) => e.id === this.entity?.id);
    if (index !== -1) {
      entities[index] = { ...entities[index], ...this.editForm };
      localStorage.setItem('entities', JSON.stringify(entities));
    }

    this.isEditing = false;
    this.logoPreview = null;
  }

  triggerFileUpload(): void {
    this.fileInput?.nativeElement?.click();
  }

  onLogoFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
        this.editForm.logoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
