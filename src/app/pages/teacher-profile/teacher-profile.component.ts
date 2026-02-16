import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

type TabKey = 'profile' | 'security' | 'preferences';

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './teacher-profile.component.html',
  styles: [`
    .page { min-height: 100vh; background: var(--primary-bg); color: var(--text-white); }

    .nav{
      height: 64px;
      display:grid;
      grid-template-columns: 1fr auto 1fr;
      align-items:center;
      padding: 0 44px;
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
    .pill{
      padding: 10px 18px;
      border-radius: 12px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      font-weight: 700;
    }
    .nav-right{ display:flex; justify-content:flex-end; align-items:center; gap: 10px; }
    .icon-btn{
      width: 36px; height: 36px;
      border-radius: 10px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      display:flex; align-items:center; justify-content:center;
    }
    .icon-btn:hover{ border-color: var(--accent-green); transform:none; box-shadow:none; }
    .btn-primary{
      padding: 10px 14px;
      border-radius: 12px;
      background: var(--accent-green);
      color: white;
      font-weight: 800;
    }
    .btn-primary:hover{ background: var(--accent-green-dark); }

    .btn-secondary{
      padding: 10px 14px;
      border-radius: 12px;
      background: var(--secondary-bg);
      border: 1px solid var(--border-gray);
      color: var(--text-white);
      font-weight: 800;
    }
    .btn-secondary:hover{ border-color: rgba(148,163,184,0.5); transform:none; box-shadow:none; }

    .content{ padding: 18px 24px 28px; }

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
    .breadcrumb-link:hover{
      color: var(--accent-green);
    }
    .breadcrumb-separator{
      color: var(--text-gray);
      font-weight: 700;
    }
    .breadcrumb-current{
      color: var(--text-white);
      font-weight: 700;
    }

    .page-head{ display:flex; justify-content: space-between; align-items:flex-start; gap: 16px; }
    .head-actions{ display:flex; align-items:center; gap: 10px; }
    .title{ font-size: 34px; line-height: 1.15; margin-bottom: 6px; }
    .subtitle{ color: var(--text-gray); font-weight: 600; }

    .tabs{
      margin-top: 14px;
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 14px;
      padding: 8px;
      display:flex;
      gap: 8px;
    }
    .tab{
      flex: 1;
      padding: 10px 12px;
      border-radius: 12px;
      background: transparent;
      color: var(--text-gray);
      font-weight: 800;
    }
    .tab.active{
      background: rgba(255,255,255,0.05);
      color: var(--text-white);
      border: 1px solid rgba(148,163,184,0.25);
    }
    .tab:hover{ transform:none; box-shadow:none; }

    .grid{
      margin-top: 16px;
      display:grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 16px;
      align-items:start;
    }
    .span-8{ grid-column: span 8; }
    .span-4{ grid-column: span 4; }

    .card{
      background: var(--card-bg);
      border: 1px solid var(--border-gray);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.06);
    }
    .card-head{ margin-bottom: 14px; }
    .card-title{ display:flex; gap: 10px; align-items:flex-start; }
    .card-ico{ font-size: 18px; }
    .card-title-text{ font-weight: 900; font-size: 16px; }
    .card-subtitle{ color: var(--text-gray); font-weight: 600; margin-top: 2px; }

    .form{ display:flex; flex-direction: column; gap: 14px; }
    .row{ display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field{ display:flex; flex-direction: column; gap: 8px; }
    label{ color: var(--text-white); font-weight: 800; }
    .input{
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-gray);
      border-radius: 12px;
      padding: 12px 14px;
      color: var(--text-white);
      outline: none;
    }
    .input:focus{ border-color: rgba(16,185,129,0.75); }
    .textarea{ min-height: 86px; resize: none; }
    .input:disabled{
      opacity: 0.75;
      cursor: not-allowed;
    }

    .save-btn{
      width: 100%;
      margin-top: 14px;
      padding: 14px 16px;
      border-radius: 12px;
      background: var(--accent-green);
      color: white;
      font-weight: 900;
      display:flex;
      align-items:center;
      justify-content:center;
      gap: 10px;
    }
    .save-btn:hover{ background: var(--accent-green-dark); }
    .save-ico{ font-size: 16px; }
    .save-btn:disabled{ opacity: 0.6; cursor: not-allowed; }
    
    .avatar-upload-wrapper{
      position: relative;
      display: inline-block;
    }
    .avatar-upload-btn{
      position: absolute;
      bottom: 0;
      right: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent-green);
      border: 2px solid var(--primary-bg);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .avatar-upload-btn:hover{
      background: var(--accent-green-dark);
      transform: scale(1.1);
    }
    
    .error-message{
      margin-top: 14px;
      padding: 12px 14px;
      border-radius: 12px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
      font-weight: 700;
    }
    .success-message{
      margin-top: 14px;
      padding: 12px 14px;
      border-radius: 12px;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #22c55e;
      font-weight: 700;
    }

    .summary{ padding-top: 6px; display:flex; flex-direction: column; align-items:center; gap: 10px; }
    .big-avatar{
      width: 88px; height: 88px;
      border-radius: 50%;
      background: var(--secondary-bg);
      background-size: cover;
      background-position: center;
      border: 1px solid var(--border-gray);
      display:flex; align-items:center; justify-content:center;
      font-size: 28px; font-weight: 900;
      text-transform: lowercase;
      color: var(--text-white);
      margin-top: 8px;
    }
    .name{ font-weight: 900; font-size: 20px; }
    .role{
      font-weight: 900;
      font-size: 12px;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
    }
    .email-row{ display:flex; align-items:center; gap: 10px; color: var(--text-gray); font-weight: 700; }
    .mail-ico{
      width: 34px; height: 34px;
      border-radius: 12px;
      background: var(--secondary-bg);
      border: 1px solid var(--border-gray);
      display:flex; align-items:center; justify-content:center;
      color: var(--text-white);
    }
    .divider{ width: 100%; height: 1px; background: var(--border-gray); opacity: .7; margin: 10px 0; }
    .qs-head{ width: 100%; display:flex; align-items:center; gap: 10px; }
    .qs-ico{ color: var(--accent-green); }
    .qs-title{ font-weight: 900; }
    .stats{ width: 100%; display:flex; flex-direction: column; gap: 10px; }
    .stat-row{ display:flex; justify-content: space-between; color: var(--text-gray); font-weight: 700; }
    .stat-val{ color: var(--text-white); font-weight: 900; }
    .status-pill{
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 900;
      font-size: 12px;
    }
    .status-pill.active{
      background: rgba(34, 197, 94, 0.14);
      border: 1px solid rgba(34, 197, 94, 0.25);
      color: #22c55e;
    }
    .status-pill.inactive{
      background: rgba(239, 68, 68, 0.14);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
    }

    .footer{
      margin-top: 16px;
      padding: 14px 4px;
      display:flex;
      justify-content: space-between;
      align-items:center;
      color: var(--text-gray);
      gap: 12px;
      flex-wrap: wrap;
    }
    .footer-right{ display:flex; align-items:center; gap: 12px; flex-wrap: wrap; }
    .contact-btn{
      padding: 10px 14px;
      border-radius: 999px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      color: var(--text-white);
      font-weight: 800;
    }
    .contact-btn:hover{ border-color: var(--accent-green); transform:none; box-shadow:none; }
    .social{ display:flex; gap: 8px; align-items:center; }
    .social-ico{
      width: 32px; height: 32px;
      border-radius: 999px;
      border: 1px solid var(--border-gray);
      background: var(--secondary-bg);
      display:flex; align-items:center; justify-content:center;
      color: var(--text-white);
      font-weight: 900;
      font-size: 12px;
    }

    @media (max-width: 1024px){
      .span-8{ grid-column: span 12; }
      .span-4{ grid-column: span 12; }
    }
    @media (max-width: 560px){
      .nav{ grid-template-columns: 1fr; height:auto; gap: 10px; padding: 12px 14px; }
      .nav-center{ justify-content: flex-start; }
      .nav-right{ justify-content: flex-start; }
      .content{ padding: 14px 14px 22px; }
      .row{ grid-template-columns: 1fr; }
    }
  `]
})
export class TeacherProfileComponent implements OnInit {
  isDarkMode = true;
  activeTab: TabKey = 'profile';
  isEditing = false;
  isEditingSecurity = false;

  userName = 'teacher';
  userEmail = 'teacher@lms.com';
  initial = 't';

  // Form fields
  fullName = 'superadmin';
  phone = '';
  gender = '';
  address = '';
  bio = '';
  profileImage = '';

  // Security fields
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  private original = {
    fullName: '',
    phone: '',
    gender: '',
    address: '',
    bio: '',
    profileImage: ''
  };

  profileCompletion = 0;
  joinedOn = '';
  lastLogin = '';
  isActive = true;
  isLoading = false;
  isLoadingSecurity = false;
  errorMessage = '';
  securityErrorMessage = '';
  securitySuccessMessage = '';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private theme: ThemeService,
    private auth: AuthService,
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.theme.isDarkMode$.subscribe(v => (this.isDarkMode = v));
    const u = this.auth.getUser();
    if (u?.name) this.userName = u.name;
    if (u?.email) this.userEmail = u.email;
    this.initial = (this.userName?.trim()?.[0] || 's').toLowerCase();

    // Load profile from backend
    this.loadProfileFromBackend();
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

  onStartEdit(): void {
    this.isEditing = true;
    this.snapshotOriginal();
  }

  onCancelEdit(): void {
    this.isEditing = false;
    this.fullName = this.original.fullName;
    this.phone = this.original.phone;
    this.gender = this.original.gender;
    this.address = this.original.address;
    this.bio = this.original.bio;
    this.profileImage = this.original.profileImage;
    this.errorMessage = '';
  }

  triggerFileUpload(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  onPhotoFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select an image file';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }
      
      // Read file as base64
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result; // Base64 string
        this.errorMessage = '';
      };
      reader.onerror = () => {
        this.errorMessage = 'Error reading image file';
      };
      reader.readAsDataURL(file);
    }
  }

  onStartEditSecurity(): void {
    this.isEditingSecurity = true;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.securityErrorMessage = '';
    this.securitySuccessMessage = '';
  }

  onCancelEditSecurity(): void {
    this.isEditingSecurity = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.securityErrorMessage = '';
    this.securitySuccessMessage = '';
  }

  onSavePassword(): void {
    if (!this.userEmail) {
      this.securityErrorMessage = 'User email not found';
      return;
    }

    // Validation
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.securityErrorMessage = 'All fields are required';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.securityErrorMessage = 'New password and confirm password do not match';
      return;
    }

    if (this.newPassword.length < 6) {
      this.securityErrorMessage = 'New password must be at least 6 characters long';
      return;
    }

    this.isLoadingSecurity = true;
    this.securityErrorMessage = '';
    this.securitySuccessMessage = '';

    this.profileService.changePassword(this.userEmail, this.currentPassword, this.newPassword).subscribe(result => {
      this.isLoadingSecurity = false;
      if (result.ok) {
        this.securitySuccessMessage = 'Password changed successfully';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => {
          this.isEditingSecurity = false;
          this.securitySuccessMessage = '';
        }, 2000);
      } else {
        this.securityErrorMessage = result.message;
      }
    });
  }

  onSave(): void {
    if (!this.userEmail) {
      this.errorMessage = 'User email not found';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Split fullName into firstName and lastName
    const nameParts = (this.fullName || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    this.profileService.updateProfile(this.userEmail, {
      firstName: firstName,
      lastName: lastName,
      phone: this.phone,
      gender: this.gender,
      address: this.address,
      bio: this.bio,
      profileImage: this.profileImage
    }).subscribe(result => {
      this.isLoading = false;
      if (result.ok) {
        // Update local data
        this.userName = result.profile.fullName;
        this.initial = (this.userName?.trim()?.[0] || 's').toLowerCase();
        this.profileImage = result.profile.profileImage || '';
        this.profileCompletion = result.profile.profileCompletion;
        this.joinedOn = this.formatDate(result.profile.createdAt);
        this.lastLogin = this.formatDate(result.profile.updatedAt);
        this.isActive = result.profile.isActive !== undefined ? result.profile.isActive : true;
        
        this.isEditing = false;
        this.snapshotOriginal();
      } else {
        this.errorMessage = result.message;
      }
    });
  }

  noop(): void {
    // placeholder
  }

  private loadProfileFromBackend(): void {
    if (!this.userEmail) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.profileService.getProfile(this.userEmail).subscribe(result => {
      this.isLoading = false;
      if (result.ok) {
        const profile = result.profile;
        this.fullName = profile.fullName || (profile.firstName + ' ' + profile.lastName).trim() || this.userName;
        this.phone = profile.phone || '';
        this.gender = profile.gender || '';
        this.address = profile.address || '';
        this.bio = profile.bio || '';
        this.profileImage = profile.profileImage || '';
        this.userName = profile.fullName || (profile.firstName + ' ' + profile.lastName).trim() || this.userName;
        this.userEmail = profile.email;
        this.initial = (this.userName?.trim()?.[0] || 's').toLowerCase();
        this.profileCompletion = profile.profileCompletion || 0;
        this.joinedOn = this.formatDate(profile.createdAt);
        this.lastLogin = this.formatDate(profile.updatedAt);
        this.isActive = profile.isActive !== undefined ? profile.isActive : true;
        this.snapshotOriginal();
      } else {
        this.errorMessage = result.message;
        // Fallback to default values
        this.snapshotOriginal();
      }
    });
  }

  private formatDate(dateString: string): string {
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

  private snapshotOriginal(): void {
    this.original = {
      fullName: this.fullName,
      phone: this.phone,
      gender: this.gender,
      address: this.address,
      bio: this.bio,
      profileImage: this.profileImage
    };
  }
}

