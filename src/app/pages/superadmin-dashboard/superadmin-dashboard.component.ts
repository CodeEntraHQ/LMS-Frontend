import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash-page">
      <!-- Top Nav -->
      <header class="dash-nav">
        <div class="nav-left">
          <div class="brand">
            <svg class="brand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="brand-text">LMS</span>
          </div>
        </div>

        <div class="nav-center">
          <div class="nav-pill">Dashboard</div>
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

      <!-- Content -->
      <main class="dash-content">
        <!-- Welcome Banner -->
        <section class="welcome-banner">
          <div class="welcome-left">
            <h1 class="welcome-title">Welcome back, {{ userName }}!</h1>
            <p class="welcome-subtitle">Global learning platform administration and oversight</p>
            <div class="welcome-stats">
              <div class="mini-stat">
                <span class="mini-dot"></span>
                <span class="mini-text">{{ stats.users }} Users</span>
              </div>
              <div class="mini-stat">
                <span class="mini-dot"></span>
                <span class="mini-text">{{ stats.courses }} Active Courses</span>
              </div>
              <div class="mini-stat">
                <span class="mini-dot"></span>
                <span class="mini-text">{{ stats.uptime }} Uptime</span>
              </div>
            </div>
          </div>

          <div class="welcome-right">
            <div class="time-label">Current Time</div>
            <div class="time-value">{{ currentTime }}</div>
            <div class="date-value">{{ currentDate }}</div>
          </div>
        </section>

        <!-- Grid -->
        <section class="grid">
          <!-- Quick actions -->
          <div class="card span-8">
            <div class="card-head">
              <div class="card-title">
                <span class="card-icon">⚡</span>
                <div>
                  <div class="card-title-text">Quick Actions</div>
                  <div class="card-subtitle">Frequently used administrative tools</div>
                </div>
              </div>
            </div>

            <div class="actions-grid">
              <button class="action-tile" (click)="goToEntityManagement()">
                <div class="tile-icon green">+</div>
                <div class="tile-title">Create Entity</div>
                <div class="tile-desc">Design new curriculum</div>
              </button>
              <button class="action-tile" (click)="goToAdmissions()">
                <div class="tile-icon blue">🎓</div>
                <div class="tile-title">Admissions</div>
                <div class="tile-desc">Student & Teacher Admissions</div>
              </button>
              <button class="action-tile" (click)="noop()">
                <div class="tile-icon purple">📊</div>
                <div class="tile-title">Learning Analytics</div>
                <div class="tile-desc">Performance insights</div>
              </button>
              <button class="action-tile" (click)="noop()">
                <div class="tile-icon orange">🏢</div>
                <div class="tile-title">Organizations</div>
                <div class="tile-desc">Institution control</div>
              </button>
              <button class="action-tile" (click)="noop()">
                <div class="tile-icon green2">⬇</div>
                <div class="tile-title">Export Data</div>
                <div class="tile-desc">Download reports</div>
              </button>
              <button class="action-tile" (click)="noop()">
                <div class="tile-icon gray">⚙</div>
                <div class="tile-title">System Settings</div>
                <div class="tile-desc">Configure platform</div>
              </button>
            </div>
          </div>

          <!-- System health -->
          <div class="card span-4">
            <div class="card-head">
              <div class="card-title">
                <span class="card-icon">🖥</span>
                <div>
                  <div class="card-title-text">System Health</div>
                  <div class="card-subtitle">Real-time platform metrics</div>
                </div>
              </div>
            </div>

            <div class="health">
              <div class="bar-row" *ngFor="let m of health">
                <div class="bar-top">
                  <span class="bar-label">{{ m.label }}</span>
                  <span class="bar-val" [style.color]="m.color">{{ m.value }}%</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" [style.width.%]="m.value" [style.background]="m.color"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Analytics chart placeholder -->
          <div class="card span-8">
            <div class="card-head split">
              <div class="card-title">
                <span class="card-icon">📈</span>
                <div>
                  <div class="card-title-text">Platform Analytics</div>
                  <div class="card-subtitle">Weekly engagement overview</div>
                </div>
              </div>
              <div class="pill">7d</div>
            </div>

            <div class="chart">
              <div class="chart-grid"></div>
              <div class="chart-area"></div>
              <div class="chart-x">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>

          <!-- Recent activity -->
          <div class="card span-4">
            <div class="card-head">
              <div class="card-title">
                <span class="card-icon">📌</span>
                <div>
                  <div class="card-title-text">Recent Activity</div>
                  <div class="card-subtitle">Latest admin events</div>
                </div>
              </div>
            </div>
            <div class="activity">
              <div class="activity-item" *ngFor="let a of activity">
                <div class="activity-avatar">👤</div>
                <div class="activity-body">
                  <div class="activity-name">{{ a.title }}</div>
                  <div class="activity-sub">{{ a.sub }}</div>
                </div>
                <div class="activity-time">{{ a.when }}</div>
              </div>
            </div>
          </div>

          <!-- Entity performance -->
          <div class="card span-8">
            <div class="card-head">
              <div class="card-title">
                <span class="card-icon">🏆</span>
                <div>
                  <div class="card-title-text">Organization Performance</div>
                  <div class="card-subtitle">Top performing institutions</div>
                </div>
              </div>
            </div>
            <div class="entity-row">
              <div class="entity-left">
                <div class="entity-icon">🏫</div>
                <div>
                  <div class="entity-title">Dummy Institute</div>
                  <div class="entity-sub">120 students • 18 active courses</div>
                </div>
              </div>
              <button class="icon-btn" (click)="noop()" aria-label="View">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Stat cards -->
          <div class="card span-4 stat-card blue-bg">
            <div class="stat-top">
              <div>
                <div class="stat-label">Total Courses</div>
                <div class="stat-value">156</div>
              </div>
              <div class="stat-ico">📄</div>
            </div>
          </div>
          <div class="card span-4 stat-card purple-bg">
            <div class="stat-top">
              <div>
                <div class="stat-label">Data Processed</div>
                <div class="stat-value">2.4GB</div>
              </div>
              <div class="stat-ico">🗄</div>
            </div>
          </div>
        </section>

        <footer class="dash-footer">
          <div class="footer-left">© 2026 CodeEntra. All rights reserved.</div>
          <div class="footer-right">
            <button class="contact-btn" (click)="noop()">Contact Us</button>
            <span class="connect">Connect with us</span>
            <div class="social">
              <span class="social-ico">◎</span>
              <span class="social-ico">in</span>
              <span class="social-ico">f</span>
              <span class="social-ico">𝕏</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  `,
  styles: [`
    .dash-page {
      min-height: 100vh;
      background: var(--primary-bg);
      color: var(--text-white);
    }

    .dash-nav {
      height: 64px;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      padding: 0 20px;
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
    }
    .brand-icon { width: 28px; height: 28px; }
    .brand-text { font-size: 18px; }

    .nav-center { display: flex; justify-content: center; }
    .nav-pill {
      padding: 10px 18px;
      border-radius: 12px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      font-weight: 600;
    }

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
      transition: background-color .2s ease, border-color .2s ease, transform .2s ease;
    }
    .icon-btn:hover {
      background: var(--card-bg);
      border-color: var(--accent-green);
      transform: translateY(-1px);
    }

    .user-trigger{
      display:flex;
      align-items:center;
      gap:10px;
      background: transparent;
      padding: 6px 8px;
      border-radius: 14px;
      border: 1px solid transparent;
      color: var(--text-white);
      position: relative;
    }
    .user-trigger:hover{
      border-color: var(--border-gray);
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
    .user-name { font-weight: 600; font-size: 14px; line-height: 1; }
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
    }
    .menu-item:hover{
      background: rgba(255,255,255,0.04);
      transform: none;
      box-shadow: none;
    }
    .mi-ico{
      width: 34px;
      height: 34px;
      border-radius: 12px;
      background: var(--secondary-bg);
      border: 1px solid var(--border-gray);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size: 16px;
    }

    .dash-content {
      max-width: none;
      margin: 0;
      padding: 18px 24px 28px;
    }

    .welcome-banner {
      background: linear-gradient(90deg, rgba(16,185,129,0.95), rgba(16,185,129,0.75));
      border-radius: 16px;
      padding: 22px 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      color: white;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.18);
      box-shadow: 0 8px 24px rgba(16,185,129,0.18);
    }
    .welcome-banner::after{
      content:'';
      position:absolute;
      inset:-40px;
      background-image: radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px);
      background-size: 18px 18px;
      opacity: .35;
      pointer-events:none;
    }
    .welcome-left { position: relative; z-index: 1; }
    .welcome-title { font-size: 36px; line-height: 1.15; margin-bottom: 6px; }
    .welcome-subtitle { opacity: .9; margin-bottom: 12px; }
    .welcome-stats { display: flex; gap: 18px; flex-wrap: wrap; }
    .mini-stat { display:flex; align-items:center; gap:8px; opacity:.95; }
    .mini-dot { width:10px; height:10px; border-radius:50%; background: rgba(255,255,255,0.9); }
    .mini-text { font-weight: 600; }

    .welcome-right { position: relative; z-index: 1; text-align: right; }
    .time-label { opacity:.9; font-size: 13px; }
    .time-value { font-size: 28px; font-weight: 800; letter-spacing: 0.5px; }
    .date-value { opacity:.9; font-size: 12px; }

    .grid {
      margin-top: 18px;
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 16px;
      align-items: start;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.06);
    }
    .span-8 { grid-column: span 8; }
    .span-4 { grid-column: span 4; }

    .card-head { margin-bottom: 12px; }
    .card-head.split { display:flex; justify-content: space-between; align-items:center; gap: 10px; }
    .card-title { display:flex; gap:10px; align-items:flex-start; }
    .card-icon { font-size: 16px; }
    .card-title-text { font-weight: 800; }
    .card-subtitle { color: var(--text-gray); font-size: 13px; margin-top: 2px; }
    .pill {
      padding: 6px 10px;
      border-radius: 10px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      font-weight: 700;
      font-size: 12px;
    }

    .actions-grid {
      display:grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .action-tile {
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 14px;
      padding: 14px;
      text-align:center;
      color: var(--text-white);
      transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
    }
    .action-tile:hover {
      transform: translateY(-2px);
      border-color: rgba(16,185,129,0.6);
      box-shadow: 0 10px 22px rgba(0,0,0,0.10);
    }
    .tile-icon {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      display:flex;
      align-items:center;
      justify-content:center;
      margin: 6px auto 10px;
      font-size: 20px;
      color: white;
      font-weight: 800;
    }
    .tile-title { font-weight: 800; margin-bottom: 4px; }
    .tile-desc { color: var(--text-gray); font-size: 12px; }
    .green { background: #10b981; }
    .green2 { background: #22c55e; }
    .blue { background: #3b82f6; }
    .purple { background: #a855f7; }
    .orange { background: #f97316; }
    .gray { background: #6b7280; }

    .health { display:flex; flex-direction: column; gap: 14px; padding-top: 6px; }
    .bar-top { display:flex; justify-content: space-between; align-items:center; margin-bottom: 8px; }
    .bar-label { font-weight: 700; font-size: 13px; }
    .bar-val { font-weight: 800; font-size: 13px; }
    .bar-track { height: 10px; border-radius: 999px; background: rgba(148,163,184,0.25); overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 999px; }

    .chart { height: 220px; position: relative; border-radius: 14px; overflow:hidden; border: 1px solid var(--border-gray); background: rgba(255,255,255,0.02); }
    .chart-grid {
      position:absolute; inset:0;
      background-image: linear-gradient(rgba(148,163,184,0.25) 1px, transparent 1px);
      background-size: 100% 40px;
      opacity: .35;
    }
    .chart-area{
      position:absolute; inset:12px 12px 34px 12px;
      border-radius: 12px;
      background: linear-gradient(180deg, rgba(16,185,129,0.50), rgba(16,185,129,0.05));
      clip-path: polygon(0% 55%, 15% 42%, 30% 46%, 45% 38%, 60% 24%, 75% 20%, 90% 36%, 100% 42%, 100% 100%, 0% 100%);
    }
    .chart-x{
      position:absolute; left: 12px; right: 12px; bottom: 8px;
      display:flex; justify-content: space-between;
      color: var(--text-gray);
      font-size: 12px;
    }

    .activity { display:flex; flex-direction: column; gap: 12px; }
    .activity-item { display:flex; gap: 10px; align-items: center; }
    .activity-avatar { width: 34px; height: 34px; border-radius: 12px; background: var(--secondary-bg); display:flex; align-items:center; justify-content:center; border: 1px solid var(--border-gray); }
    .activity-body { flex: 1; }
    .activity-name { font-weight: 800; font-size: 13px; }
    .activity-sub { color: var(--text-gray); font-size: 12px; }
    .activity-time { color: var(--text-gray); font-size: 12px; }

    .entity-row { display:flex; justify-content: space-between; align-items:center; padding: 12px; border: 1px solid var(--border-gray); border-radius: 14px; background: rgba(255,255,255,0.02); }
    .entity-left { display:flex; align-items:center; gap: 12px; }
    .entity-icon { width: 38px; height: 38px; border-radius: 12px; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); display:flex; align-items:center; justify-content:center; }
    .entity-title { font-weight: 900; }
    .entity-sub { color: var(--text-gray); font-size: 12px; }

    .stat-card { color: white; border: none; }
    .stat-top { display:flex; justify-content: space-between; align-items: center; }
    .stat-label { font-weight: 700; opacity: .95; }
    .stat-value { font-size: 28px; font-weight: 900; line-height: 1.1; margin-top: 6px; }
    .stat-ico { font-size: 26px; opacity: .95; }
    .blue-bg { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .purple-bg { background: linear-gradient(135deg, #a855f7, #7c3aed); }

    .dash-footer {
      margin-top: 16px;
      padding: 14px 4px;
      display:flex;
      justify-content: space-between;
      align-items:center;
      color: var(--text-gray);
      gap: 12px;
      flex-wrap: wrap;
    }
    .footer-right { display:flex; align-items:center; gap: 12px; flex-wrap: wrap; }
    .contact-btn {
      padding: 10px 14px;
      border-radius: 999px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
    }
    .contact-btn:hover { border-color: var(--accent-green); }
    .connect { font-size: 13px; }
    .social { display:flex; gap: 8px; align-items:center; }
    .social-ico {
      width: 32px; height: 32px;
      border-radius: 999px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      display:flex; align-items:center; justify-content:center;
      color: var(--text-white);
      font-weight: 800;
      font-size: 12px;
    }

    @media (max-width: 1024px) {
      .span-8 { grid-column: span 12; }
      .span-4 { grid-column: span 12; }
      .actions-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 560px) {
      .dash-nav { grid-template-columns: 1fr; gap: 10px; height: auto; padding: 12px 14px; }
      .nav-center { justify-content: flex-start; }
      .nav-right { justify-content: flex-start; flex-wrap: wrap; }
      .dash-content { padding: 14px 14px 22px; }
      .welcome-banner { flex-direction: column; gap: 14px; }
      .welcome-right { text-align: left; }
      .welcome-title { font-size: 28px; }
      .actions-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SuperadminDashboardComponent implements OnInit, OnDestroy {
  isDarkMode = true;
  userName = 'superadmin';
  userEmail = 'superadmin@lms.com';
  userInitial = 's';
  isUserMenuOpen = false;
  profileImage = '';

  currentTime = '00:00:00';
  currentDate = '';
  private timer?: number;

  stats = {
    users: '1,247',
    courses: '23',
    uptime: '99.9%'
  };

  health = [
    { label: 'CPU Usage', value: 67, color: '#10b981' },
    { label: 'Memory', value: 45, color: '#10b981' },
    { label: 'Storage', value: 82, color: '#f97316' },
    { label: 'Network', value: 23, color: '#3b82f6' }
  ];

  activity = [
    { title: 'superadmin', sub: 'Updated course settings', when: '32 seconds ago' },
    { title: 'admin', sub: 'Created a new organization', when: '23 days ago' },
    { title: 'student', sub: 'Completed a course module', when: '23 days ago' }
  ];

  constructor(
    private themeService: ThemeService,
    private auth: AuthService,
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user?.name) this.userName = user.name;
    if (user?.email) this.userEmail = user.email;
    this.userInitial = (this.userName?.trim()?.[0] || 's').toLowerCase();

    this.themeService.isDarkMode$.subscribe(v => (this.isDarkMode = v));

    this.updateClock();
    this.timer = window.setInterval(() => this.updateClock(), 1000);

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

  ngOnDestroy(): void {
    if (this.timer) window.clearInterval(this.timer);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
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

  noop(): void {
    // placeholder actions
  }

  goToEntityManagement(): void {
    this.router.navigate(['/superadmin/entities']);
  }

  goToAdmissions(): void {
    this.router.navigate(['/admissions']);
  }

  private updateClock(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-GB', { hour12: false });
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    this.currentDate = `${dd}/${mm}/${yyyy}`;
  }
}

