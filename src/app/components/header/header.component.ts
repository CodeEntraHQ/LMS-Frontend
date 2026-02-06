import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-container">
        <div class="logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M15 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="logo-text">LMS</span>
        </div>
        <div class="header-actions">
          <button class="theme-toggle" (click)="toggleTheme()" aria-label="Toggle theme">
            <!-- Sun Icon (Light Mode) -->
            <svg *ngIf="isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <!-- Moon Icon (Dark Mode) -->
            <svg *ngIf="!isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="sign-in-btn" (click)="onSignIn()">Sign In</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: var(--primary-bg);
      padding: 1.5rem 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid var(--border-gray);
    }

    .header-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-white);
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      color: var(--text-white);
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .theme-toggle {
      background: transparent;
      border: none;
      color: var(--text-white);
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .theme-toggle:hover {
      background-color: var(--secondary-bg);
      transform: none;
    }

    .sign-in-btn {
      background-color: var(--accent-green);
      color: var(--text-white);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .sign-in-btn:hover {
      background-color: var(--accent-green-dark);
    }

    @media (max-width: 768px) {
      .header {
        padding: 1rem 1.5rem;
      }

      .logo-text {
        font-size: 1.25rem;
      }

      .sign-in-btn {
        padding: 0.625rem 1.25rem;
        font-size: 0.875rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  isDarkMode: boolean = true;

  constructor(
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onSignIn() {
    this.router.navigate(['/login']);
  }
}
