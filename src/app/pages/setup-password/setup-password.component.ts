import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-setup-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  template: `
    <div class="page">
      <div class="container">
        <div class="password-setup-card">
          <div class="card-header">
            <div class="logo-section">
              <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h1 class="card-title">Set Your Password</h1>
            </div>
            <p class="card-subtitle" *ngIf="userData">
              Hello <strong>{{ userData.name }}</strong>, please set a password for your {{ userData.role }} account
            </p>
          </div>

          <div *ngIf="isLoading" class="loading-section">
            <div class="spinner"></div>
            <p>Verifying token...</p>
          </div>

          <div *ngIf="errorMessage" class="error-section">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <h3>Invalid Link</h3>
            <p>{{ errorMessage }}</p>
            <button class="btn-primary" routerLink="/login">Go to Login</button>
          </div>

          <form *ngIf="!isLoading && !errorMessage && userData" (ngSubmit)="onSubmit()" class="password-form">
            <div class="form-group">
              <label>Email</label>
              <input
                type="email"
                class="form-input"
                [value]="userData.email"
                disabled
              />
            </div>

            <div class="form-group">
              <label>Password *</label>
              <input
                type="password"
                class="form-input"
                [(ngModel)]="formData.password"
                name="password"
                required
                minlength="6"
                placeholder="Enter password (min 6 characters)"
              />
              <small class="form-hint">Password must be at least 6 characters long</small>
            </div>

            <div class="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                class="form-input"
                [(ngModel)]="formData.confirmPassword"
                name="confirmPassword"
                required
                placeholder="Confirm password"
              />
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" routerLink="/login">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Setting Password...' : 'Set Password' }}
              </button>
            </div>
          </form>
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

    .container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }

    .password-setup-card {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 20px;
      width: 100%;
      max-width: 500px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .card-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      color: var(--accent-green);
    }

    .card-title {
      font-size: 32px;
      font-weight: 900;
      margin: 0;
    }

    .card-subtitle {
      color: var(--text-gray);
      font-size: 16px;
      margin: 0;
    }

    .card-subtitle strong {
      color: var(--accent-green);
    }

    .loading-section,
    .error-section {
      text-align: center;
      padding: 40px 20px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--border-gray);
      border-top-color: var(--accent-green);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-section svg {
      color: #ef4444;
      margin-bottom: 16px;
    }

    .error-section h3 {
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 12px;
    }

    .error-section p {
      color: var(--text-gray);
      margin-bottom: 24px;
    }

    .password-form {
      margin-top: 32px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      color: var(--text-white);
      font-weight: 700;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .form-input {
      width: 100%;
      padding: 12px 14px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-gray);
      border-radius: 10px;
      color: var(--text-white);
      outline: none;
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-input:focus {
      border-color: var(--accent-green);
    }

    .form-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .form-hint {
      display: block;
      color: var(--text-gray);
      font-size: 12px;
      margin-top: 4px;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-top: 32px;
    }

    .btn-primary {
      padding: 12px 24px;
      border-radius: 12px;
      background: var(--accent-green);
      color: white;
      font-weight: 800;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--accent-green-dark);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      padding: 12px 24px;
      border-radius: 12px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 800;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn-secondary:hover {
      border-color: rgba(148, 163, 184, 0.5);
    }

    @media (max-width: 768px) {
      .password-setup-card {
        padding: 24px;
      }
    }
  `]
})
export class SetupPasswordComponent implements OnInit {
  token: string = '';
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  userData: any = null;
  
  formData = {
    password: '',
    confirmPassword: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    
    if (!this.token) {
      this.errorMessage = 'Invalid password setup link. No token provided.';
      this.isLoading = false;
      return;
    }
    
    this.verifyToken();
  }

  verifyToken(): void {
    this.http.get<{ ok: boolean; email?: string; name?: string; role?: string; message?: string }>(
      `http://localhost:8080/api/password-setup/verify/${this.token}`
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.ok && response.email) {
          this.userData = {
            email: response.email,
            name: response.name || 'User',
            role: response.role === 'STUDENT' ? 'Student' : response.role === 'TEACHER' ? 'Teacher' : 'User'
          };
        } else {
          this.errorMessage = response.message || 'Invalid or expired token';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to verify token';
        console.error('Error verifying token:', error);
      }
    });
  }

  onSubmit(): void {
    if (!this.formData.password || this.formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    if (this.formData.password !== this.formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    this.isSubmitting = true;
    
    this.http.post<{ ok: boolean; message?: string }>(
      `http://localhost:8080/api/password-setup/set-password`,
      {
        token: this.token,
        password: this.formData.password,
        confirmPassword: this.formData.confirmPassword
      }
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.ok) {
          // Password set successfully - redirect to login page
          alert('Password set successfully! Please login with your email and password.');
          this.router.navigate(['/login']);
        } else {
          alert('Failed to set password: ' + (response.message || 'Unknown error'));
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error setting password:', error);
        alert('Failed to set password: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }
}
