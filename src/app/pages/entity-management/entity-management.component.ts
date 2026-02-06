import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { EntityService, Entity } from '../../services/entity.service';
import { FooterComponent } from '../../components/footer/footer.component';

type TabKey = 'basic' | 'contact' | 'branding';

@Component({
  selector: 'app-entity-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div class="page">
      <!-- Top Nav -->
      <header class="nav">
        <div class="nav-left">
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
            <span class="breadcrumb-current">Administration</span>
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
        <!-- Header -->
        <div class="page-head">
          <div>
            <h1 class="title">Entity Management</h1>
            <p class="subtitle">Manage and monitor all educational institutions</p>
          </div>
          <div class="head-actions">
            <button class="btn-secondary" routerLink="/superadmin/dashboard">Back to Dashboard</button>
            <button class="btn-primary" (click)="openAddModal()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Add Entity
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card blue">
            <div>
              <div class="card-label">Total Entities</div>
              <div class="card-value">{{ entities.length }}</div>
            </div>
            <div class="card-icon">🏢</div>
          </div>
          <div class="summary-card green">
            <div>
              <div class="card-label">Total Students</div>
              <div class="card-value">{{ totalStudents }}</div>
            </div>
            <div class="card-icon">👥</div>
          </div>
          <div class="summary-card purple">
            <div>
              <div class="card-label">Total Exams</div>
              <div class="card-value">{{ totalExams }}</div>
            </div>
            <div class="card-icon">📊</div>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="search-section">
          <div class="search-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input
              type="text"
              class="search-input"
              placeholder="Search entities by name, location, or type..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="filterEntities()"
            />
          </div>
          <select class="filter-select" [(ngModel)]="filterType" (ngModelChange)="filterEntities()">
            <option value="">All Types</option>
            <option value="SCHOOL">School</option>
            <option value="COLLEGE">College</option>
            <option value="UNIVERSITY">University</option>
          </select>
          <div class="view-toggle">
            <button class="view-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'">Grid</button>
            <button class="view-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">List</button>
          </div>
        </div>

        <!-- Entity Grid -->
        <div class="entities-grid" [class.list-view]="viewMode === 'list'">
          <div *ngIf="isLoading" class="loading-message">Loading entities...</div>
          <div *ngIf="!isLoading && filteredEntities.length === 0" class="empty-message">
            <p>No entities found. Click "Add Entity" to create your first entity.</p>
          </div>
          <div class="entity-card" *ngFor="let entity of filteredEntities">
              <div class="entity-header">
              <div class="entity-icon">
                <img *ngIf="entity.logoUrl" [src]="entity.logoUrl" alt="Logo" class="entity-logo" />
                <span *ngIf="!entity.logoUrl">🏢</span>
              </div>
              <div class="entity-info">
                <div class="entity-name">{{ entity.name }}</div>
                <div class="entity-meta">
                  <span class="status-badge" [class.active]="entity.status === 'active'">{{ entity.status }}</span>
                  <span class="type-badge">{{ entity.type }}</span>
                </div>
              </div>
              <button class="delete-btn" (click)="deleteEntity(entity.id)" aria-label="Delete">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            <div class="entity-stats">
              <div class="stat-item">
                <span class="stat-label">Students</span>
                <span class="stat-value">{{ entity.students }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Exams</span>
                <span class="stat-value">{{ entity.exams }}</span>
              </div>
            </div>

            <div class="entity-address">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ entity.address }}</span>
            </div>

            <div class="entity-actions">
              <button class="action-btn edit" (click)="editEntity(entity)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Edit
              </button>
              <button class="action-btn features" (click)="openFeatureAccessModal(entity)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Features
              </button>
              <button class="action-btn invite" (click)="openInviteAdminModal(entity)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M17 11L19 13L23 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Invite Admin
              </button>
              <button class="action-btn manage" (click)="manageEntity(entity)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Manage
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <app-footer></app-footer>
      </main>

      <!-- Delete Confirmation Dialog -->
      <div class="dialog-overlay" *ngIf="showDeleteDialog" (click)="closeDeleteDialog()">
        <div class="dialog-content" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h3 class="dialog-title">Delete Entity</h3>
            <button class="dialog-close" (click)="closeDeleteDialog()" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="dialog-body">
            <p>Are you sure you want to delete <strong>{{ deleteEntityName }}</strong>?</p>
            <p class="dialog-warning">This action cannot be undone.</p>
          </div>
          <div class="dialog-footer">
            <button type="button" class="btn-secondary" (click)="closeDeleteDialog()">Cancel</button>
            <button type="button" class="btn-danger" (click)="confirmDelete()" [disabled]="isLoading">
              {{ isLoading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Snackbar -->
      <div class="snackbar" *ngIf="showSnackbar" [@slideInOut]>
        <div class="snackbar-content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ snackbarMessage }}</span>
        </div>
      </div>

      <!-- Invite Admin Modal -->
      <div class="modal-overlay" *ngIf="showInviteModal" (click)="closeInviteModal()">
        <div class="modal-content invite-admin-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Admin Management</h2>
              <p class="modal-subtitle">{{ selectedEntityName }}</p>
            </div>
            <button class="close-btn" (click)="closeInviteModal()" aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="modal-tabs">
            <button class="modal-tab" [class.active]="adminModalTab === 'invite'" (click)="adminModalTab = 'invite'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M17 11L19 13L23 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Invite Admin
            </button>
            <button class="modal-tab" [class.active]="adminModalTab === 'existing'" (click)="adminModalTab = 'existing'; loadAdmins()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Existing Admins
            </button>
          </div>

          <div class="modal-body">
            <!-- Invite Tab -->
            <div *ngIf="adminModalTab === 'invite'" class="tab-content">
              <div class="form-group">
                <label>Admin Email *</label>
                <input
                  type="email"
                  class="form-input"
                  [(ngModel)]="inviteForm.email"
                  placeholder="admin@example.com"
                />
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea
                  class="form-input textarea"
                  [(ngModel)]="inviteForm.description"
                  placeholder="Please set your password for the admin of this college..."
                ></textarea>
              </div>
            </div>

            <!-- Existing Admins Tab -->
            <div *ngIf="adminModalTab === 'existing'" class="tab-content">
              <div class="section-header-admin">
                <h3 class="section-title-admin">Existing Admins</h3>
                <button type="button" class="btn-refresh" (click)="loadAdmins()" [disabled]="isLoadingAdmins" title="Refresh">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4V10H7M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <div *ngIf="isLoadingAdmins" class="loading-admins">Loading admins...</div>
              
              <div *ngIf="!isLoadingAdmins && adminsList.length === 0" class="no-admins">
                <p>No admins found for this entity.</p>
              </div>
              
              <div *ngIf="!isLoadingAdmins && adminsList.length > 0" class="admins-list">
                <div class="admin-item" *ngFor="let admin of adminsList">
                  <div class="admin-info">
                    <div class="admin-avatar">
                      <span>{{ (admin.name || admin.email)?.charAt(0)?.toUpperCase() || 'A' }}</span>
                    </div>
                    <div class="admin-details">
                      <div class="admin-name">{{ admin.name || admin.email }}</div>
                      <div class="admin-email">{{ admin.email }}</div>
                      <div class="admin-meta">
                        <span class="admin-status" [class.active]="admin.isActive" [class.inactive]="!admin.isActive">
                          {{ admin.isActive ? 'Active' : 'Inactive' }}
                        </span>
                        <span class="admin-date">Created: {{ formatDate(admin.createdAt) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="admin-actions">
                    <button 
                      type="button" 
                      class="btn-toggle" 
                      [class.active]="admin.isActive"
                      (click)="toggleAdminStatus(admin)"
                      [disabled]="isTogglingAdmin"
                      [title]="admin.isActive ? 'Deactivate' : 'Activate'"
                    >
                      <svg *ngIf="admin.isActive" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      <svg *ngIf="!admin.isActive" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      {{ admin.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                    <button 
                      type="button" 
                      class="btn-delete-admin" 
                      (click)="deleteAdmin(admin)"
                      [disabled]="isDeletingAdmin"
                      title="Delete Admin"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="closeInviteModal()">Cancel</button>
            <button *ngIf="adminModalTab === 'invite'" type="button" class="btn-primary" (click)="sendInvitation()" [disabled]="isLoadingInvite">
              {{ isLoadingInvite ? 'Sending...' : 'Send Invitation' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Feature Access Modal -->
      <div class="modal-overlay" *ngIf="showFeatureModal" (click)="closeFeatureModal()">
        <div class="modal-content feature-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Feature Access Control</h2>
              <p class="modal-subtitle">Enable or disable features for {{ selectedEntityName }}</p>
            </div>
            <button class="close-btn" (click)="closeFeatureModal()" aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="feature-search-section">
              <div class="search-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <input
                  type="text"
                  class="search-input"
                  placeholder="Search features..."
                  [(ngModel)]="featureSearchQuery"
                  (ngModelChange)="filterFeatures()"
                />
              </div>
            </div>

            <div class="features-list">
              <div class="feature-item" *ngFor="let feature of filteredFeatureList">
                <div class="feature-info">
                  <span class="feature-icon">{{ getFeatureIcon(feature.key) }}</span>
                  <div>
                    <div class="feature-name">{{ feature.label }}</div>
                    <div class="feature-key">{{ feature.key }}</div>
                  </div>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [(ngModel)]="featureAccess[feature.key]"
                    (change)="onFeatureToggle(feature.key)"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="closeFeatureModal()">Cancel</button>
            <button type="button" class="btn-primary" (click)="saveFeatureAccess()" [disabled]="isLoadingFeatures">
              {{ isLoadingFeatures ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Add Entity Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">{{ isEditing ? 'Edit Entity' : 'Create New Entity' }}</h2>
              <p class="modal-subtitle">
                {{ isEditing ? 'Update the details for ' + (newEntity.name || 'this entity') : 'Add a new educational institution to the platform' }}
              </p>
            </div>
            <button class="close-btn" (click)="closeModal()" aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="modal-tabs">
            <button class="modal-tab" [class.active]="activeTab === 'basic'" (click)="activeTab = 'basic'">Basic Info</button>
            <button class="modal-tab" [class.active]="activeTab === 'contact'" (click)="activeTab = 'contact'">Contact</button>
            <button class="modal-tab" [class.active]="activeTab === 'branding'" (click)="activeTab = 'branding'">Branding</button>
          </div>

          <div class="modal-body">
            <!-- Basic Info Tab -->
            <div *ngIf="activeTab === 'basic'" class="tab-content">
              <div class="form-group">
                <label>Institution Name *</label>
                <input type="text" class="form-input" [(ngModel)]="newEntity.name" placeholder="Enter institution name" />
              </div>
              <div class="form-group">
                <label>Type *</label>
                <select class="form-input" [(ngModel)]="newEntity.type">
                  <option value="">Select type</option>
                  <option value="SCHOOL">School</option>
                  <option value="COLLEGE">College</option>
                  <option value="UNIVERSITY">University</option>
                </select>
              </div>
              <div class="form-group">
                <label>Address *</label>
                <input type="text" class="form-input" [(ngModel)]="newEntity.address" placeholder="City, State/Country" />
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea class="form-input textarea" [(ngModel)]="newEntity.description" placeholder="Brief description of the institution"></textarea>
              </div>
            </div>

            <!-- Contact Tab -->
            <div *ngIf="activeTab === 'contact'" class="tab-content">
              <div class="form-group">
                <label>Email</label>
                <input type="email" class="form-input" [(ngModel)]="newEntity.email" placeholder="contact@institution.com" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input type="tel" class="form-input" [(ngModel)]="newEntity.phone" placeholder="+1 234 567 8900" />
              </div>
              <div class="form-group">
                <label>Website</label>
                <input type="url" class="form-input" [(ngModel)]="newEntity.website" placeholder="https://institution.com" />
              </div>
            </div>

            <!-- Branding Tab -->
            <div *ngIf="activeTab === 'branding'" class="tab-content">
              <div class="form-group">
                <label>College Logo</label>
                <div class="logo-upload-section">
                  <div class="logo-placeholder" (click)="triggerFileUpload()">
                    <img *ngIf="logoPreview" [src]="logoPreview" alt="Logo preview" class="logo-preview" />
                    <span *ngIf="!logoPreview" class="logo-placeholder-text">Add logo</span>
                  </div>
                  <button type="button" class="logo-upload-btn" (click)="triggerFileUpload()" aria-label="Upload logo">
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
              <div class="form-group">
                <label>Primary Color</label>
                <input type="color" class="form-input color-input" [(ngModel)]="newEntity.primaryColor" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="closeModal()">Cancel</button>
            <button type="button" class="btn-primary" (click)="onCreateEntityClick($event)" [disabled]="isLoading">
              {{ isLoading ? 'Creating...' : (isEditing ? 'Update Entity' : 'Create Entity') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: var(--primary-bg); color: var(--text-white); }

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
    .breadcrumb-link:hover{ color: var(--accent-green); }
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
    .icon-btn:hover{ border-color: var(--accent-green); transform:none; box-shadow:none; }

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

    .content{ padding: 18px 28px 28px; }

    .page-head{ display:flex; justify-content: space-between; align-items:flex-start; gap: 16px; margin-bottom: 24px; }
    .title{ font-size: 34px; line-height: 1.15; margin-bottom: 6px; }
    .subtitle{ color: var(--text-gray); font-weight: 600; }
    .head-actions{ display:flex; gap: 12px; align-items:center; }
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
    .btn-secondary:hover{ border-color: rgba(148,163,184,0.5); transform:none; box-shadow:none; }

    .summary-cards{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .summary-card{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .summary-card.blue{ border-left: 4px solid #3b82f6; }
    .summary-card.green{ border-left: 4px solid var(--accent-green); }
    .summary-card.purple{ border-left: 4px solid #a855f7; }
    .card-label{ color: var(--text-gray); font-weight: 700; font-size: 14px; margin-bottom: 8px; }
    .card-value{ font-size: 32px; font-weight: 900; color: var(--text-white); }
    .card-icon{ font-size: 32px; opacity: 0.7; }

    .search-section{
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      align-items: center;
    }
    .search-wrapper{
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      padding: 12px 16px;
      gap: 12px;
    }
    .search-wrapper svg{ color: var(--text-gray); flex-shrink: 0; }
    .search-input{
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-white);
      outline: none;
      font-size: 14px;
    }
    .search-input::placeholder{ color: var(--text-gray); }
    .filter-select{
      padding: 12px 16px;
      border-radius: 12px;
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      color: var(--text-white);
      font-weight: 700;
      cursor: pointer;
      outline: none;
    }
    .view-toggle{
      display: flex;
      gap: 4px;
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      padding: 4px;
    }
    .view-btn{
      padding: 8px 16px;
      border-radius: 8px;
      background: transparent;
      color: var(--text-gray);
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .view-btn.active{
      background: var(--accent-green);
      color: white;
    }

    .entities-grid{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 0;
    }
    .entities-grid.list-view{
      grid-template-columns: 1fr;
    }
    .loading-message, .empty-message{
      grid-column: 1 / -1;
      text-align: center;
      padding: 40px 20px;
      color: var(--text-gray);
      font-weight: 700;
      font-size: 16px;
    }
    .entity-card{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 26px 26px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .entity-header{
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .entity-icon{ 
      font-size: 32px; 
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .entity-logo{
      width: 48px;
      height: 48px;
      border-radius: 12px;
      object-fit: cover;
    }
    .entity-info{ flex: 1; }
    .entity-name{ font-size: 20px; font-weight: 900; margin-bottom: 8px; }
    .entity-meta{ display: flex; gap: 8px; align-items: center; }
    .status-badge{
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      background: rgba(148,163,184,0.15);
      color: var(--text-gray);
    }
    .status-badge.active{
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }
    .type-badge{
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      background: rgba(16, 185, 129, 0.15);
      color: var(--accent-green);
    }
    .delete-btn{
      background: transparent;
      border: none;
      color: #ef4444;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .delete-btn:hover{ opacity: 0.7; }

    .entity-stats{
      display: flex;
      gap: 24px;
    }
    .stat-item{
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .stat-label{ color: var(--text-gray); font-size: 12px; font-weight: 700; }
    .stat-value{ color: var(--accent-green); font-size: 20px; font-weight: 900; }

    .entity-address{
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-gray);
      font-size: 14px;
    }
    .entity-actions{
      display: flex;
      gap: 8px;
    }
    .action-btn{
      flex: 1;
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 12px;
      transition: all 0.2s;
      white-space: nowrap;
      min-width: 0;
    }
    .action-btn svg{
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }
    .action-btn:hover{
      border-color: var(--accent-green);
      transform: none;
      box-shadow: none;
    }
    .action-btn.features{
      flex: 0.85;
    }
    .action-btn.invite{
      flex: 1.1;
      font-size: 11px;
    }
    .action-btn.manage{
      flex: 0.9;
    }

    /* Feature Access Modal Styles */
    .feature-modal{
      max-width: 600px;
    }
    .feature-search-section{
      margin-bottom: 24px;
    }
    .features-list{
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 400px;
      overflow-y: auto;
    }
    .feature-item{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: var(--secondary-bg);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      transition: all 0.2s;
    }
    .feature-item:hover{
      border-color: var(--accent-green);
      background: rgba(16, 185, 129, 0.05);
    }
    .feature-info{
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .feature-icon{
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--card-bg);
      border-radius: 10px;
    }
    .feature-name{
      font-weight: 700;
      font-size: 16px;
      color: var(--text-white);
      margin-bottom: 4px;
    }
    .feature-key{
      font-size: 12px;
      color: var(--text-gray);
      font-weight: 600;
    }
    .toggle-switch{
      position: relative;
      display: inline-block;
      width: 50px;
      height: 26px;
    }
    .toggle-switch input{
      opacity: 0;
      width: 0;
      height: 0;
    }
    .toggle-slider{
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(148,163,184,0.3);
      transition: 0.3s;
      border-radius: 26px;
    }
    .toggle-slider:before{
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
    .toggle-switch input:checked + .toggle-slider{
      background-color: var(--accent-green);
    }
    .toggle-switch input:checked + .toggle-slider:before{
      transform: translateX(24px);
    }

    /* Modal Styles */
    .modal-overlay{
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    .modal-content{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .invite-admin-modal{
      max-width: 700px;
    }
    .modal-header{
      padding: 24px;
      border-bottom: 1px solid var(--border-gray);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .modal-title{ font-size: 24px; font-weight: 900; margin-bottom: 4px; }
    .modal-subtitle{ color: var(--text-gray); font-size: 14px; }
    .close-btn{
      background: transparent;
      border: none;
      color: var(--text-gray);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .close-btn:hover{ color: var(--text-white); }

    .modal-tabs{
      display: flex;
      padding: 0 24px;
      border-bottom: 1px solid var(--border-gray);
      gap: 8px;
    }
    .modal-tab{
      padding: 12px 16px;
      background: transparent;
      border: none;
      color: var(--text-gray);
      font-weight: 700;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .modal-tab svg{
      width: 18px;
      height: 18px;
    }
    .modal-tab.active{
      color: var(--accent-green);
      border-bottom-color: var(--accent-green);
    }
    .modal-tab:hover{
      color: var(--text-white);
    }
    .modal-tab.active:hover{
      color: var(--accent-green);
    }

    .modal-body{
      padding: 24px;
      flex: 1;
    }
    .form-group{
      margin-bottom: 20px;
    }
    .form-group label{
      display: block;
      color: var(--text-white);
      font-weight: 700;
      margin-bottom: 12px;
      font-size: 14px;
    }
    .logo-upload-section{
      position: relative;
      display: inline-block;
    }
    .logo-placeholder{
      width: 160px;
      height: 160px;
      border-radius: 50%;
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
      border-color: var(--accent-green);
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
      border-radius: 50%;
    }
    .logo-upload-btn{
      position: absolute;
      bottom: 0;
      right: 0;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--accent-green);
      border: none;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
      transition: all 0.2s;
    }
    .logo-upload-btn:hover{
      background: var(--accent-green-dark);
      transform: scale(1.05);
    }
    .logo-upload-btn svg{
      width: 20px;
      height: 20px;
    }
    .form-input{
      width: 100%;
      padding: 12px 14px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 10px;
      color: var(--text-white);
      outline: none;
      font-size: 14px;
    }
    .form-input:focus{ border-color: var(--accent-green); }
    .textarea{ min-height: 100px; resize: vertical; }
    .subscription-inputs{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .sub-input-group label{
      font-size: 12px;
      margin-bottom: 4px;
    }
    .color-input{
      height: 48px;
      padding: 4px;
      cursor: pointer;
    }

    .modal-footer{
      padding: 24px;
      border-top: 1px solid var(--border-gray);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    /* Delete Dialog Styles */
    .dialog-overlay{
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }
    .dialog-content{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      width: 90%;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .dialog-header{
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-gray);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .dialog-title{
      font-size: 20px;
      font-weight: 900;
      color: var(--text-white);
      margin: 0;
    }
    .dialog-close{
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .dialog-close:hover{
      border-color: var(--accent-green);
    }
    .dialog-body{
      padding: 24px;
    }
    .dialog-body p{
      color: var(--text-white);
      font-weight: 600;
      margin: 0 0 12px 0;
      line-height: 1.6;
    }
    .dialog-body strong{
      color: var(--accent-green);
    }
    .dialog-warning{
      color: var(--text-gray);
      font-size: 14px;
      font-weight: 500;
    }
    .dialog-footer{
      padding: 20px 24px;
      border-top: 1px solid var(--border-gray);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn-danger{
      padding: 10px 16px;
      border-radius: 12px;
      background: #ef4444;
      color: white;
      font-weight: 800;
      border: none;
      cursor: pointer;
    }
    .btn-danger:hover{
      background: #dc2626;
    }
    .btn-danger:disabled{
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Snackbar Styles */
    .snackbar{
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2000;
      min-width: 300px;
      max-width: 500px;
    }
    .snackbar-content{
      background: var(--accent-green);
      color: white;
      padding: 14px 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
    }
    .snackbar-content svg{
      flex-shrink: 0;
    }

    /* Admin List Section Styles */
    .admin-list-section{
      margin-bottom: 32px;
    }
    .section-header-admin{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .section-title-admin{
      font-size: 18px;
      font-weight: 900;
      color: var(--text-white);
      margin: 0;
    }
    .btn-refresh{
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-refresh:hover{
      border-color: var(--accent-green);
    }
    .btn-refresh:disabled{
      opacity: 0.5;
      cursor: not-allowed;
    }
    .loading-admins, .no-admins{
      text-align: center;
      padding: 24px;
      color: var(--text-gray);
      font-weight: 600;
    }
    .admins-list{
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 300px;
      overflow-y: auto;
    }
    .admin-item{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: var(--secondary-bg);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      transition: all 0.2s;
    }
    .admin-item:hover{
      border-color: var(--accent-green);
      background: rgba(16, 185, 129, 0.05);
    }
    .admin-info{
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .admin-avatar{
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--accent-green);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 18px;
      color: white;
      flex-shrink: 0;
    }
    .admin-details{
      flex: 1;
      min-width: 0;
    }
    .admin-name{
      font-weight: 800;
      font-size: 16px;
      color: var(--text-white);
      margin-bottom: 4px;
    }
    .admin-email{
      font-size: 14px;
      color: var(--text-gray);
      margin-bottom: 6px;
    }
    .admin-meta{
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
    .admin-status{
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .admin-status.active{
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #22c55e;
    }
    .admin-status.inactive{
      background: rgba(148, 163, 184, 0.15);
      border: 1px solid rgba(148, 163, 184, 0.25);
      color: var(--text-gray);
    }
    .admin-date{
      font-size: 12px;
      color: var(--text-gray);
    }
    .admin-actions{
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .btn-toggle{
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-toggle:hover{
      border-color: var(--accent-green);
    }
    .btn-toggle.active{
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.25);
      color: #ef4444;
    }
    .btn-toggle:disabled{
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-delete-admin{
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid rgba(239, 68, 68, 0.25);
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-delete-admin:hover{
      background: rgba(239, 68, 68, 0.25);
      border-color: rgba(239, 68, 68, 0.5);
    }
    .btn-delete-admin:disabled{
      opacity: 0.5;
      cursor: not-allowed;
    }
    .tab-content{
      padding-top: 8px;
    }

    @media (max-width: 768px){
      .nav{ padding: 0 20px; }
      .content{ padding: 18px 20px 28px; }
      .page-head{ flex-direction: column; align-items: flex-start; }
      .summary-cards{ grid-template-columns: 1fr; }
      .search-section{ flex-direction: column; }
      .entities-grid{ grid-template-columns: 1fr; }
      .subscription-inputs{ grid-template-columns: 1fr; }
      .dialog-content{ width: 95%; }
      .admin-item{ flex-direction: column; align-items: flex-start; gap: 12px; }
      .admin-actions{ width: 100%; justify-content: flex-end; }
    }
  `]
})
export class EntityManagementComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  isDarkMode = true;
  showModal = false;
  showDeleteDialog = false;
  deleteEntityId: string | null = null;
  deleteEntityName: string = '';
  activeTab: TabKey = 'basic';
  isEditing = false;
  editingEntityId: string | null = null;
  viewMode: 'grid' | 'list' = 'grid';
  searchQuery = '';
  filterType = '';
  logoPreview: string | null = null;
  
  userName = 'superadmin';
  userEmail = 'superadmin@lms.com';
  userInitial = 's';
  isUserMenuOpen = false;
  profileImage = '';
  
  entities: Entity[] = [];
  isLoading = false;
  errorMessage = '';
  
  filteredEntities: Entity[] = [];
  
  showSnackbar = false;
  snackbarMessage = '';
  
  // Feature Access Control
  showFeatureModal = false;
  selectedEntityId: string | null = null;
  selectedEntityName = '';
  featureAccess: Record<string, boolean> = {};
  featureSearchQuery = '';
  isLoadingFeatures = false;
  
  // Invite Admin
  showInviteModal = false;
  isLoadingInvite = false;
  adminModalTab: 'invite' | 'existing' = 'invite';
  inviteForm = {
    email: '',
    description: ''
  };
  adminsList: any[] = [];
  isLoadingAdmins = false;
  isTogglingAdmin = false;
  isDeletingAdmin = false;
  
  availableFeatures = [
    { key: 'admissions', label: 'Admissions' },
    { key: 'students', label: 'Students' },
    { key: 'teachers', label: 'Teachers' },
    { key: 'exams', label: 'Exams' },
    { key: 'reports', label: 'Reports' },
    { key: 'fees', label: 'Fees' },
    { key: 'dashboard', label: 'My Dashboard' },
    { key: 'subjects', label: 'My Subjects' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'exam-attempts', label: 'Exams (Attempt)' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'notices', label: 'Notices' },
    { key: 'settings', label: 'Settings' }
  ];
  
  filteredFeatureList = [...this.availableFeatures];
  
  newEntity: any = {
    name: '',
    type: '',
    address: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    logoUrl: '',
    primaryColor: '#10b981'
  };

  constructor(
    private theme: ThemeService,
    private auth: AuthService,
    private router: Router,
    private entityService: EntityService,
    private profileService: ProfileService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user?.name) this.userName = user.name;
    if (user?.email) this.userEmail = user.email;
    this.userInitial = (this.userName?.trim()?.[0] || 's').toLowerCase();

    this.theme.isDarkMode$.subscribe(v => (this.isDarkMode = v));
    this.loadEntities();
    this.loadProfileImage();
  }

  loadProfileImage(): void {
    if (this.userEmail) {
      this.profileService.getProfile(this.userEmail).subscribe(result => {
        if (result.ok && result.profile.profileImage) {
          this.profileImage = result.profile.profileImage;
        }
      });
    }
  }

  loadEntities(): void {
    this.isLoading = true;
    this.errorMessage = '';
    console.log('Loading entities...');
    this.entityService.getAllEntities().subscribe({
      next: (result) => {
        console.log('Load entities result:', result);
        this.isLoading = false;
        if (result.ok) {
          this.entities = result.entities || [];
          console.log('Entities loaded:', this.entities);
          console.log('Entities count:', this.entities.length);
          this.filterEntities();
          console.log('Filtered entities:', this.filteredEntities);
        } else {
          this.errorMessage = result.message;
          console.error('Failed to load entities:', result.message);
        }
      },
      error: (error) => {
        console.error('Error in loadEntities:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to load entities. Please check console for details.';
      }
    });
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

  get totalStudents(): number {
    return this.entities.reduce((sum, e) => sum + e.students, 0);
  }

  get totalExams(): number {
    return this.entities.reduce((sum, e) => sum + e.exams, 0);
  }

  filterEntities(): void {
    console.log('Filtering entities. Total:', this.entities.length);
    console.log('Search query:', this.searchQuery);
    console.log('Filter type:', this.filterType);
    this.filteredEntities = this.entities.filter(e => {
      const matchesSearch = !this.searchQuery || 
        (e.name && e.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (e.address && e.address.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (e.type && e.type.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchesType = !this.filterType || e.type === this.filterType;
      const result = matchesSearch && matchesType;
      console.log(`Entity ${e.name}: matchesSearch=${matchesSearch}, matchesType=${matchesType}, result=${result}`);
      return result;
    });
    console.log('Filtered entities count:', this.filteredEntities.length);
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingEntityId = null;
    this.resetForm();
    this.showModal = true;
  }

  resetForm(): void {
    this.newEntity = {
      name: '',
      type: '',
      address: '',
      description: '',
      email: '',
      phone: '',
      website: '',
      logoUrl: '',
      primaryColor: '#10b981'
    };
    this.logoPreview = null;
    this.activeTab = 'basic';
    this.errorMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.logoPreview = null;
  }

  onCreateEntityClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('=== onCreateEntityClick() CALLED ===');
    console.log('Event:', event);
    console.log('Event target:', event.target);
    console.log('Event currentTarget:', event.currentTarget);
    this.saveEntity();
  }

  saveEntity(): void {
    console.log('=== saveEntity() CALLED ===');
    console.log('newEntity:', JSON.stringify(this.newEntity, null, 2));
    console.log('isEditing:', this.isEditing);
    console.log('editingEntityId:', this.editingEntityId);
    console.log('isLoading:', this.isLoading);
    
    if (this.isLoading) {
      console.log('Already loading, ignoring click');
      return;
    }
    
    if (!this.newEntity.name || !this.newEntity.type || !this.newEntity.address) {
      console.log('Validation failed - missing required fields');
      console.log('name:', this.newEntity.name);
      console.log('type:', this.newEntity.type);
      console.log('address:', this.newEntity.address);
      alert('Please fill all required fields');
      return;
    }
    
    console.log('Validation passed, proceeding with API call...');

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditing && this.editingEntityId) {
      // Update existing entity
      this.entityService.updateEntity(this.editingEntityId, {
        name: this.newEntity.name,
        type: this.newEntity.type,
        address: this.newEntity.address,
        description: this.newEntity.description,
        email: this.newEntity.email,
        phone: this.newEntity.phone,
        website: this.newEntity.website,
        logoUrl: this.newEntity.logoUrl || this.logoPreview,
        primaryColor: this.newEntity.primaryColor
      }).subscribe(result => {
        this.isLoading = false;
        if (result.ok) {
          this.loadEntities();
          this.closeModal();
        } else {
          this.errorMessage = result.message;
          alert(result.message);
        }
      });
    } else {
      // Create new entity
      const entityData = {
        name: this.newEntity.name,
        type: this.newEntity.type,
        address: this.newEntity.address,
        description: this.newEntity.description,
        email: this.newEntity.email,
        phone: this.newEntity.phone,
        website: this.newEntity.website,
        logoUrl: this.newEntity.logoUrl || this.logoPreview,
        primaryColor: this.newEntity.primaryColor
      };
      console.log('🚀 Saving new entity - calling API with data:', JSON.stringify(entityData, null, 2));
      this.entityService.createEntity(entityData).subscribe({
        next: (result) => {
          console.log('✅ Create entity API response received:', result);
          this.isLoading = false;
          if (result.ok) {
            console.log('✅ Entity created successfully, reloading list...');
            this.loadEntities();
            this.closeModal();
            this.resetForm();
          } else {
            console.error('❌ Create failed:', result.message);
            this.errorMessage = result.message;
            alert('Failed to create entity: ' + result.message);
          }
        },
        error: (err) => {
          console.error('❌ ERROR creating entity in component:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
          console.error('Error body:', err.error);
          console.error('Full error:', JSON.stringify(err, null, 2));
          this.isLoading = false;
          this.errorMessage = 'Failed to create entity. Please check console for details.';
          alert('Failed to create entity: ' + (err.error?.message || err.message || 'Unknown error. Check console.'));
        }
      });
    }
  }

  deleteEntity(id: string): void {
    const entity = this.entities.find(e => e.id === id);
    if (entity) {
      this.deleteEntityId = id;
      this.deleteEntityName = entity.name;
      this.showDeleteDialog = true;
    }
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.deleteEntityId = null;
    this.deleteEntityName = '';
  }

  confirmDelete(): void {
    if (!this.deleteEntityId) return;
    
    this.isLoading = true;
    this.entityService.deleteEntity(this.deleteEntityId).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.ok) {
          this.closeDeleteDialog();
          this.showSnackbarMessage('Deleted successfully');
          this.loadEntities();
        } else {
          this.errorMessage = result.message;
          alert(result.message);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to delete entity. Please try again.';
        alert('Failed to delete entity: ' + (err.error?.message || err.message));
      }
    });
  }

  showSnackbarMessage(message: string): void {
    this.snackbarMessage = message;
    this.showSnackbar = true;
    setTimeout(() => {
      this.showSnackbar = false;
    }, 3000);
  }

  updateMonitoring(entity: Entity): void {
    // Update logic here if needed
  }

  editEntity(entity: Entity): void {
    this.isEditing = true;
    this.editingEntityId = entity.id;
    this.showModal = true;
    this.activeTab = 'basic';

    this.newEntity = {
      name: entity.name,
      type: entity.type,
      address: entity.address,
      description: entity.description || '',
      email: entity.email || '',
      phone: entity.phone || '',
      website: entity.website || '',
      logoUrl: entity.logoUrl || '',
      primaryColor: entity.primaryColor || '#10b981'
    };

    this.logoPreview = entity.logoUrl || null;
  }

  manageEntity(entity: Entity): void {
    // Navigate to admin dashboard with entity ID for superadmin to manage that entity
    this.router.navigate(['/admin/dashboard'], { queryParams: { entityId: entity.id } });
  }

  openFeatureAccessModal(entity: Entity): void {
    this.selectedEntityId = entity.id;
    this.selectedEntityName = entity.name;
    this.featureSearchQuery = '';
    this.isLoadingFeatures = true;
    this.showFeatureModal = true;
    
    // Load current feature access
    this.entityService.getEntityFeatures(entity.id).subscribe({
      next: (result) => {
        this.isLoadingFeatures = false;
        if (result.ok) {
          // Initialize with all features enabled by default
          this.featureAccess = {};
          this.availableFeatures.forEach(f => {
            this.featureAccess[f.key] = result.features[f.key] !== false; // Default to true if not set
          });
          this.filterFeatures();
        } else {
          alert('Failed to load features: ' + result.message);
          this.closeFeatureModal();
        }
      },
      error: (error) => {
        this.isLoadingFeatures = false;
        console.error('Error loading features:', error);
        alert('Failed to load features');
        this.closeFeatureModal();
      }
    });
  }

  closeFeatureModal(): void {
    this.showFeatureModal = false;
    this.selectedEntityId = null;
    this.selectedEntityName = '';
    this.featureAccess = {};
    this.featureSearchQuery = '';
    this.filteredFeatureList = [...this.availableFeatures];
  }

  filterFeatures(): void {
    const query = this.featureSearchQuery.toLowerCase();
    this.filteredFeatureList = this.availableFeatures.filter(f =>
      f.label.toLowerCase().includes(query) || f.key.toLowerCase().includes(query)
    );
  }

  getFeatureIcon(key: string): string {
    const icons: Record<string, string> = {
      'admissions': '🎓',
      'students': '👨‍🎓',
      'teachers': '👩‍🏫',
      'exams': '📝',
      'reports': '📊',
      'fees': '💰',
      'dashboard': '📊',
      'subjects': '📚',
      'assignments': '📝',
      'exam-attempts': '🧪',
      'attendance': '📅',
      'notices': '📢',
      'settings': '⚙️'
    };
    return icons[key] || '📋';
  }

  onFeatureToggle(key: string): void {
    // Toggle is handled by ngModel
  }

  saveFeatureAccess(): void {
    if (!this.selectedEntityId) return;
    
    this.isLoadingFeatures = true;
    this.entityService.updateEntityFeatures(this.selectedEntityId, this.featureAccess).subscribe({
      next: (result) => {
        this.isLoadingFeatures = false;
        if (result.ok) {
          this.showSnackbarMessage('Feature access updated successfully');
          this.closeFeatureModal();
        } else {
          alert('Failed to update features: ' + result.message);
        }
      },
      error: (error) => {
        this.isLoadingFeatures = false;
        console.error('Error updating features:', error);
        alert('Failed to update features');
      }
    });
  }

  openInviteAdminModal(entity: Entity): void {
    this.selectedEntityId = entity.id;
    this.selectedEntityName = entity.name;
    this.inviteForm = {
      email: '',
      description: ''
    };
    this.adminModalTab = 'invite'; // Default to invite tab
    this.showInviteModal = true;
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
    this.selectedEntityId = null;
    this.selectedEntityName = '';
    this.adminModalTab = 'invite';
    this.inviteForm = {
      email: '',
      description: ''
    };
    this.adminsList = [];
  }

  loadAdmins(): void {
    if (!this.selectedEntityId) return;
    
    this.isLoadingAdmins = true;
    this.http.get<{ ok: boolean; admins?: any[]; message?: string }>(
      `http://localhost:8080/api/invitations/entity/${this.selectedEntityId}/admins`
    ).subscribe({
      next: (response) => {
        this.isLoadingAdmins = false;
        if (response.ok && response.admins) {
          this.adminsList = response.admins;
        } else {
          this.adminsList = [];
          console.error('Failed to load admins:', response.message);
        }
      },
      error: (error) => {
        this.isLoadingAdmins = false;
        this.adminsList = [];
        console.error('Error loading admins:', error);
      }
    });
  }

  toggleAdminStatus(admin: any): void {
    if (!this.selectedEntityId || !admin.id) return;
    
    if (!confirm(`Are you sure you want to ${admin.isActive ? 'deactivate' : 'activate'} ${admin.name || admin.email}?`)) {
      return;
    }
    
    this.isTogglingAdmin = true;
    this.http.put<{ ok: boolean; message?: string; isActive?: boolean }>(
      `http://localhost:8080/api/invitations/entity/${this.selectedEntityId}/admins/${admin.id}/toggle`,
      {}
    ).subscribe({
      next: (response) => {
        this.isTogglingAdmin = false;
        if (response.ok) {
          admin.isActive = response.isActive;
          this.showSnackbarMessage(response.message || (response.isActive ? 'Admin activated successfully' : 'Admin deactivated successfully'));
        } else {
          alert('Failed to update admin status: ' + (response.message || 'Unknown error'));
        }
      },
      error: (error) => {
        this.isTogglingAdmin = false;
        console.error('Error toggling admin status:', error);
        alert('Failed to update admin status. Please check console for details.');
      }
    });
  }

  deleteAdmin(admin: any): void {
    if (!this.selectedEntityId || !admin.id) return;
    
    if (!confirm(`Are you sure you want to delete ${admin.name || admin.email}? This action cannot be undone.`)) {
      return;
    }
    
    this.isDeletingAdmin = true;
    this.http.delete<{ ok: boolean; message?: string }>(
      `http://localhost:8080/api/invitations/entity/${this.selectedEntityId}/admins/${admin.id}`
    ).subscribe({
      next: (response) => {
        this.isDeletingAdmin = false;
        if (response.ok) {
          this.showSnackbarMessage('Admin deleted successfully');
          this.loadAdmins(); // Reload admin list
        } else {
          alert('Failed to delete admin: ' + (response.message || 'Unknown error'));
        }
      },
      error: (error) => {
        this.isDeletingAdmin = false;
        console.error('Error deleting admin:', error);
        alert('Failed to delete admin. Please check console for details.');
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'N/A';
    }
  }

  sendInvitation(): void {
    if (!this.selectedEntityId) return;
    
    if (!this.inviteForm.email || !this.inviteForm.email.trim()) {
      alert('Please enter admin email');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.inviteForm.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    this.isLoadingInvite = true;
    this.entityService.createInvitation(this.selectedEntityId, {
      email: this.inviteForm.email.trim(),
      description: this.inviteForm.description || ''
    }).subscribe({
      next: (result) => {
        this.isLoadingInvite = false;
        if (result.ok) {
          this.showSnackbarMessage('Invitation sent successfully');
          this.inviteForm = { email: '', description: '' };
          this.loadAdmins(); // Reload admin list to show newly invited admin
        } else {
          alert('Failed to send invitation: ' + result.message);
        }
      },
      error: (error) => {
        this.isLoadingInvite = false;
        console.error('Error sending invitation:', error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to send invitation. Please try again.';
        alert(errorMessage);
      }
    });
  }

  noop(): void {
    // placeholder
  }

  triggerFileUpload(): void {
    this.fileInput?.nativeElement?.click();
  }

  onLogoFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
        this.newEntity.logoUrl = e.target.result; // Store as Base64 data URL
      };
      reader.readAsDataURL(file);
    }
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
}
