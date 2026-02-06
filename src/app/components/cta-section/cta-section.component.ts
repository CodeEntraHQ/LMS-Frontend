import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cta-section',
  standalone: true,
  template: `
    <section class="cta-section">
      <div class="cta-container">
        <h2 class="cta-title">Ready to Revolutionize Your Learning?</h2>
        <p class="cta-description">
          Join thousands of educational institutions already using LMS to deliver exceptional learning experiences.
        </p>
        <div class="cta-buttons">
          <button class="cta-btn-primary" (click)="onStartTrial()">
            <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Start Your 14-Day Free Trial
          </button>
          <button class="cta-btn-secondary" (click)="onSignIn()">Sign In</button>
        </div>
        <p class="cta-disclaimer">
          No credit card required • Full access for 14 days • Set up in minutes
        </p>
      </div>
    </section>
  `,
  styles: [`
    .cta-section {
      background-color: var(--accent-green);
      padding: 6rem 2rem;
      text-align: center;
    }

    .cta-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .cta-title {
      font-size: 3rem;
      font-weight: 700;
      color: var(--primary-bg);
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    .cta-description {
      font-size: 1.125rem;
      color: var(--primary-bg);
      margin-bottom: 2.5rem;
      line-height: 1.7;
      opacity: 0.9;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .cta-btn-primary {
      background-color: var(--text-white);
      color: var(--primary-bg);
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .cta-btn-primary:hover {
      background-color: var(--secondary-bg);
      color: var(--text-white);
    }

    .cta-btn-secondary {
      background-color: var(--accent-green-dark);
      color: var(--text-white);
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
    }

    .cta-btn-secondary:hover {
      background-color: var(--primary-bg);
    }

    .cta-disclaimer {
      color: var(--primary-bg);
      font-size: 0.875rem;
      margin-top: 1rem;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .cta-section {
        padding: 4rem 1.5rem;
      }

      .cta-title {
        font-size: 2rem;
      }

      .cta-description {
        font-size: 1rem;
      }

      .cta-buttons {
        flex-direction: column;
        align-items: stretch;
      }

      .cta-btn-primary,
      .cta-btn-secondary {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class CtaSectionComponent {
  constructor(private router: Router) {}

  onStartTrial() {
    console.log('Start Trial clicked');
  }

  onSignIn() {
    this.router.navigate(['/login']);
  }
}
