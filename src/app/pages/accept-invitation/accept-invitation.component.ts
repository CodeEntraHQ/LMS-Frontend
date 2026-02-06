import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  template: `
    <div class="page">
      <div class="container">
        <div class="invitation-card">
          <div class="card-header">
            <div class="logo-section">
              <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h1 class="card-title">Admin Invitation</h1>
            </div>
            <p class="card-subtitle" *ngIf="invitationData">
              You have been invited to become an admin for <strong>{{ invitationData.entityName }}</strong>
            </p>
          </div>

          <div *ngIf="isLoading" class="loading-section">
            <div class="spinner"></div>
            <p>Loading invitation details...</p>
          </div>

          <div *ngIf="errorMessage" class="error-section">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <h3>Invalid Invitation</h3>
            <p>{{ errorMessage }}</p>
            <button class="btn-primary" routerLink="/login">Go to Login</button>
          </div>

          <form *ngIf="!isLoading && !errorMessage && invitationData" (ngSubmit)="onSubmit()" class="invitation-form">
            <!-- Step 1: Profile Information -->
            <div class="form-step" *ngIf="currentStep === 1">
              <h2 class="step-title">Step 1: Profile Information</h2>
              <p class="step-subtitle">Please fill in your personal details</p>

              <div class="form-row">
                <div class="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    class="form-input"
                    [(ngModel)]="formData.firstName"
                    name="firstName"
                    required
                    placeholder="Enter first name"
                  />
                </div>
                <div class="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    class="form-input"
                    [(ngModel)]="formData.lastName"
                    name="lastName"
                    required
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  class="form-input"
                  [(ngModel)]="formData.phone"
                  name="phone"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div class="form-group">
                <label>Gender</label>
                <select class="form-input" [(ngModel)]="formData.gender" name="gender">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label>Address</label>
                <input
                  type="text"
                  class="form-input"
                  [(ngModel)]="formData.address"
                  name="address"
                  placeholder="Enter your address"
                />
              </div>

              <div class="form-group">
                <label>Bio</label>
                <textarea
                  class="form-input textarea"
                  [(ngModel)]="formData.bio"
                  name="bio"
                  placeholder="Tell us about yourself"
                  rows="4"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Profile Photo</label>
                <div class="photo-upload-section">
                  <div class="photo-preview" (click)="triggerFileUpload()">
                    <img *ngIf="photoPreview" [src]="photoPreview" alt="Profile preview" class="preview-image" />
                    <div *ngIf="!photoPreview" class="photo-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      <span>Click to upload photo</span>
                    </div>
                  </div>
                  <button type="button" class="upload-btn" (click)="triggerFileUpload()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M7 10L12 5L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M12 5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Upload Photo
                  </button>
                  <input
                    type="file"
                    #fileInput
                    (change)="onPhotoSelect($event)"
                    accept="image/*"
                    style="display: none;"
                  />
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary" routerLink="/login">Cancel</button>
                <button type="button" class="btn-primary" (click)="nextStep()">Next: Set Password</button>
              </div>
            </div>

            <!-- Step 2: Set Password -->
            <div class="form-step" *ngIf="currentStep === 2">
              <h2 class="step-title">Step 2: Set Password</h2>
              <p class="step-subtitle">Create a secure password for your account</p>

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
                <button type="button" class="btn-secondary" (click)="prevStep()">Back</button>
                <button type="submit" class="btn-primary" [disabled]="isSubmitting">
                  {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
                </button>
              </div>
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

    .invitation-card {
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 20px;
      width: 100%;
      max-width: 600px;
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

    .invitation-form {
      margin-top: 32px;
    }

    .form-step {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .step-title {
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 8px;
    }

    .step-subtitle {
      color: var(--text-gray);
      font-size: 14px;
      margin-bottom: 24px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
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

    .form-hint {
      display: block;
      color: var(--text-gray);
      font-size: 12px;
      margin-top: 4px;
    }

    .textarea {
      min-height: 100px;
      resize: vertical;
    }

    .photo-upload-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .photo-preview {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 2px dashed var(--border-gray);
      background: var(--secondary-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      overflow: hidden;
      position: relative;
    }

    .photo-preview:hover {
      border-color: var(--accent-green);
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .photo-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--text-gray);
    }

    .photo-placeholder svg {
      width: 32px;
      height: 32px;
    }

    .photo-placeholder span {
      font-size: 12px;
      font-weight: 700;
    }

    .upload-btn {
      padding: 10px 20px;
      border-radius: 10px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .upload-btn:hover {
      border-color: var(--accent-green);
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
      .invitation-card {
        padding: 24px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AcceptInvitationComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  token: string = '';
  currentStep = 1;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  invitationData: any = null;
  photoPreview: string | null = null;
  
  formData = {
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    address: '',
    bio: '',
    profileImage: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    
    if (!this.token) {
      this.errorMessage = 'Invalid invitation link. No token provided.';
      this.isLoading = false;
      return;
    }
    
    this.loadInvitation();
  }

  loadInvitation(): void {
    this.http.get<{ ok: boolean; invitation?: any; entity?: any; message?: string }>(
      `http://localhost:8080/api/invitations/token/${this.token}`
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.ok && response.invitation) {
          this.invitationData = {
            ...response.invitation,
            entityName: response.entity?.name || 'Unknown Entity'
          };
        } else {
          this.errorMessage = response.message || 'Invalid or expired invitation';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load invitation';
        console.error('Error loading invitation:', error);
      }
    });
  }

  triggerFileUpload(): void {
    this.fileInput?.nativeElement?.click();
  }

  onPhotoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.photoPreview = result;
        this.formData.profileImage = result;
      };
      reader.readAsDataURL(file);
    }
  }

  nextStep(): void {
    if (!this.formData.firstName || !this.formData.lastName) {
      alert('Please fill in first name and last name');
      return;
    }
    this.currentStep = 2;
  }

  prevStep(): void {
    this.currentStep = 1;
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
    
    const acceptData = {
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      phone: this.formData.phone || null,
      gender: this.formData.gender || null,
      address: this.formData.address || null,
      bio: this.formData.bio || null,
      profileImage: this.formData.profileImage || null,
      password: this.formData.password
    };
    
    this.http.post<{ ok: boolean; message?: string; email?: string; password?: string; user?: any }>(
      `http://localhost:8080/api/invitations/accept/${this.token}`,
      acceptData
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.ok) {
          // Account created successfully - redirect to login page
          alert('Account created successfully! Please login with your email and password.');
          this.router.navigate(['/login']);
        } else {
          alert('Failed to create account: ' + (response.message || 'Unknown error'));
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error accepting invitation:', error);
        alert('Failed to create account: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }
}
