import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-page">
      <!-- Top Bar -->
      <div class="top-bar">
        <a routerLink="/" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back to Home
        </a>
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
      </div>

      <!-- Login Card -->
      <div class="login-container">
        <div class="login-card">
          <!-- Logo and Title -->
          <div class="login-header">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h1 class="login-title">LMS</h1>
          </div>

          <!-- Welcome Message -->
          <div class="welcome-section">
            <h2 class="welcome-title">Welcome Back</h2>
            <p class="welcome-subtitle">Sign in to your account to continue</p>
          </div>

          <div class="error-banner" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <!-- Login Form -->
          <form class="login-form" (ngSubmit)="onSubmit()">
            <!-- Email Input -->
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                type="email"
                id="email"
                class="form-input"
                [(ngModel)]="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <!-- Password Input -->
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <div class="password-input-wrapper">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  id="password"
                  class="form-input"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  class="password-toggle"
                  (click)="togglePasswordVisibility()"
                  aria-label="Toggle password visibility"
                >
                  <svg *ngIf="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <svg *ngIf="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65661 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1751 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.5719 9.14351 13.1984C8.99262 12.8249 8.91853 12.4247 8.92564 12.0219C8.93275 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88M1 1L23 23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Remember Me -->
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  class="checkbox-input"
                  [(ngModel)]="rememberMe"
                  name="rememberMe"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-text">Remember me</span>
              </label>
            </div>

            <!-- reCAPTCHA -->
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  class="checkbox-input"
                  [(ngModel)]="recaptcha"
                  name="recaptcha"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-text">I'm not a robot</span>
                <span class="recaptcha-text">reCAPTCHA</span>
              </label>
            </div>

            <!-- Sign In Button -->
            <button type="submit" class="sign-in-button" [disabled]="!recaptcha">
              Sign In
            </button>

            <!-- Forgot Password -->
            <a href="#" class="forgot-password" (click)="onForgotPassword($event)">Forgot your password?</a>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background-color: var(--primary-bg);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      transition: background-color 0.3s ease;
    }

    .top-bar {
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .back-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-gray);
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: var(--accent-green);
    }

    .back-link svg {
      width: 16px;
      height: 16px;
    }

    .theme-toggle {
      background: transparent;
      border: none;
      color: var(--text-gray);
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 8px;
      transition: background-color 0.2s, color 0.2s;
    }

    .theme-toggle:hover {
      background-color: var(--secondary-bg);
      color: var(--text-white);
    }

    .login-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    .login-card {
      background-color: var(--card-bg);
      border-radius: 16px;
      padding: 2rem 2.25rem;
      width: 100%;
      max-width: 380px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }

    .login-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .logo-icon {
      width: 34px;
      height: 34px;
      color: var(--accent-green);
    }

    .login-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-white);
      margin: 0;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 1.25rem;
    }

    .welcome-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-white);
      margin-bottom: 0.5rem;
    }

    .welcome-subtitle {
      font-size: 0.95rem;
      color: var(--text-gray);
      margin: 0;
    }

    .error-banner {
      margin: 0 0 1rem 0;
      padding: 0.75rem 0.9rem;
      border-radius: 12px;
      border: 1px solid rgba(239, 68, 68, 0.35);
      background: rgba(239, 68, 68, 0.10);
      color: #ef4444;
      font-weight: 700;
      font-size: 0.9rem;
      text-align: center;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-white);
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      font-size: 0.95rem;
      background-color: var(--primary-bg);
      color: var(--text-white);
      transition: border-color 0.2s ease, background-color 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--accent-green);
    }

    .form-input::placeholder {
      color: var(--text-gray);
      opacity: 0.6;
    }

    .password-input-wrapper {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: var(--text-gray);
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s ease;
    }

    .password-toggle:hover {
      color: var(--accent-green);
    }

    .checkbox-group {
      flex-direction: row;
      align-items: center;
      gap: 0.75rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      position: relative;
    }

    .checkbox-input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
    }

    .checkbox-custom {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border-gray);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .checkbox-input:checked + .checkbox-custom {
      background-color: var(--accent-green);
      border-color: var(--accent-green);
    }

    .checkbox-input:checked + .checkbox-custom::after {
      content: '';
      width: 6px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      margin-top: -2px;
    }

    .checkbox-text {
      font-size: 0.9rem;
      color: var(--text-white);
      user-select: none;
    }

    .recaptcha-text {
      font-size: 0.85rem;
      color: var(--text-gray);
      margin-left: auto;
    }

    .sign-in-button {
      width: 100%;
      padding: 0.875rem;
      background-color: var(--accent-green);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.1s ease;
      margin-top: 0.25rem;
    }

    .sign-in-button:hover:not(:disabled) {
      background-color: var(--accent-green-dark);
      transform: translateY(-1px);
    }

    .sign-in-button:active:not(:disabled) {
      transform: translateY(0);
    }

    .sign-in-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .forgot-password {
      text-align: center;
      color: #3b82f6;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s ease;
    }

    .forgot-password:hover {
      color: #2563eb;
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .login-page {
        padding: 1rem;
      }

      .login-card {
        padding: 1.5rem 1.25rem;
        max-width: 340px;
      }

      .welcome-title {
        font-size: 1.4rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  email: string = 'superadmin@lms.com';
  password: string = '';
  rememberMe: boolean = true;
  recaptcha: boolean = false;
  showPassword: boolean = false;
  isDarkMode: boolean = true;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (!this.recaptcha) {
      this.errorMessage = 'Please confirm reCAPTCHA to continue';
      return;
    }

    this.auth.login(this.email, this.password).subscribe({
      next: (result) => {
        if (result.ok) {
          // Redirect based on user role
          if (result.user.role === 'SUPERADMIN') {
            this.router.navigate(['/superadmin/dashboard']);
          } else if (result.user.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (result.user.role === 'TEACHER') {
            this.router.navigate(['/teacher/dashboard']);
          } else if (result.user.role === 'STUDENT') {
            this.router.navigate(['/student/dashboard']);
          } else if (result.user.role === 'PARENT') {
            this.router.navigate(['/parent/dashboard']);
          } else {
            this.router.navigate(['/superadmin/dashboard']); // Default fallback
          }
        } else {
          this.errorMessage = result.message;
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    });
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    console.log('Forgot password clicked');
    // TODO: Implement forgot password logic
  }
}
