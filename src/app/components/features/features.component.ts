import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  title: string;
  description: string;
  iconType: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="features">
      <div class="features-container">
        <h2 class="features-title">Everything You Need for Modern Learning</h2>
        <p class="features-subtitle">
          Powerful features designed to streamline course creation, administration, and analysis.
        </p>
        <div class="features-grid">
          <div class="feature-card" *ngFor="let feature of features">
            <div class="feature-icon">
              <ng-container [ngSwitch]="feature.iconType">
                <!-- Smart Course Creation -->
                <svg *ngSwitchCase="'course'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 14L9 11L10.41 9.59L12 11.17L15.59 7.58L17 9M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <!-- Role-Based Access -->
                <svg *ngSwitchCase="'access'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M19 10V7C19 5.9 18.1 5 17 5H15M19 10H21M19 10V14M19 18H21M19 14V18M19 14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <!-- Advanced Analytics -->
                <svg *ngSwitchCase="'analytics'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3V21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 10V6H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <!-- Enterprise Security -->
                <svg *ngSwitchCase="'security'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.4 7 14.8 8.6 14.8 10V11.5C15.4 11.5 16 12.1 16 12.7V16.2C16 16.8 15.4 17.3 14.8 17.3H9.2C8.6 17.3 8 16.7 8 16.1V12.6C8 12 8.6 11.5 9.2 11.5V10C9.2 8.6 10.6 7 12 7ZM12 8.2C11.2 8.2 10.5 8.7 10.5 9.5V11.5H13.5V9.5C13.5 8.7 12.8 8.2 12 8.2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <!-- Real-Time Monitoring -->
                <svg *ngSwitchCase="'monitoring'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <!-- Automated Assessments -->
                <svg *ngSwitchCase="'assessment'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </ng-container>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .features {
      background-color: var(--primary-bg);
      padding: 6rem 2rem;
    }

    .features-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .features-title {
      font-size: 3rem;
      font-weight: 700;
      color: var(--text-white);
      text-align: center;
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    .features-subtitle {
      font-size: 1.125rem;
      color: var(--text-gray);
      text-align: center;
      margin-bottom: 4rem;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .feature-card {
      background-color: var(--card-bg);
      border-radius: 12px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
    }

    .feature-icon {
      width: 48px;
      height: 48px;
      color: var(--accent-green);
      margin-bottom: 0.5rem;
    }

    .feature-icon svg {
      width: 100%;
      height: 100%;
    }

    .feature-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-white);
      margin-bottom: 0.5rem;
    }

    .feature-description {
      font-size: 1rem;
      color: var(--text-gray);
      line-height: 1.6;
    }

    @media (max-width: 1024px) {
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .features {
        padding: 4rem 1.5rem;
      }

      .features-title {
        font-size: 2rem;
      }

      .features-subtitle {
        font-size: 1rem;
      }

      .features-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .feature-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class FeaturesComponent {
  features: Feature[] = [
    {
      iconType: 'course',
      title: 'Smart Course Creation',
      description: 'Create comprehensive courses with multiple content types, automated assessments, and instant feedback.'
    },
    {
      iconType: 'access',
      title: 'Role-Based Access',
      description: 'Secure multi-tier access control for superadmins, administrators, instructors, and students.'
    },
    {
      iconType: 'analytics',
      title: 'Advanced Analytics',
      description: 'Detailed performance insights, progress tracking, and comprehensive reporting tools.'
    },
    {
      iconType: 'security',
      title: 'Enterprise Security',
      description: 'Bank-level security with encrypted data storage and secure authentication protocols.'
    },
    {
      iconType: 'monitoring',
      title: 'Real-Time Monitoring',
      description: 'Live course monitoring, automatic progress tracking, and instant notification processing.'
    },
    {
      iconType: 'assessment',
      title: 'Automated Assessments',
      description: 'Intelligent auto-grading system with customizable scoring and detailed feedback.'
    }
  ];
}
