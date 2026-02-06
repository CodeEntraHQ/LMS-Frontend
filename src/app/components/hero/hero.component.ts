import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  template: `
    <section class="hero">
      <div class="hero-container">
        <div class="tagline-badge">
          <span>Next-Generation Learning Platform</span>
        </div>
        <h1 class="hero-title">Transform Your Learning Experience</h1>
        <p class="hero-description">
          Comprehensive learning management system with advanced analytics, real-time monitoring, 
          and intelligent automation for educational institutions.
        </p>
        <div class="hero-buttons">
          <button class="btn-primary" (click)="onTryNow()">
            <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Try Now - 14 Days Free
          </button>
          <button class="btn-secondary" (click)="onSignIn()">Sign In</button>
        </div>
        <p class="hero-disclaimer">
          No credit card required • Full access for 14 days • Set up in minutes
        </p>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      background-color: var(--primary-bg);
      padding: 6rem 2rem;
      text-align: center;
    }

    .hero-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .tagline-badge {
      display: inline-block;
      background-color: var(--secondary-bg);
      border: 1px solid var(--accent-green);
      border-radius: 50px;
      padding: 0.5rem 1.25rem;
      margin-bottom: 2rem;
    }

    .tagline-badge span {
      color: var(--text-white);
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      color: var(--accent-green);
      margin-bottom: 1.5rem;
      line-height: 1.2;
      letter-spacing: -1px;
    }

    .hero-description {
      font-size: 1.125rem;
      color: var(--text-gray);
      margin-bottom: 2.5rem;
      line-height: 1.7;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .btn-primary {
      background-color: var(--accent-green);
      color: var(--text-white);
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary:hover {
      background-color: var(--accent-green-dark);
    }

    .btn-icon {
      width: 20px;
      height: 20px;
    }

    .btn-secondary {
      background-color: transparent;
      color: var(--text-white);
      padding: 1rem 2rem;
      border: 1px solid var(--border-gray);
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
    }

    .btn-secondary:hover {
      background-color: var(--secondary-bg);
      border-color: var(--accent-green);
    }

    .hero-disclaimer {
      color: var(--text-gray);
      font-size: 0.875rem;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .hero {
        padding: 4rem 1.5rem;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .hero-description {
        font-size: 1rem;
      }

      .hero-buttons {
        flex-direction: column;
        align-items: stretch;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class HeroComponent {
  constructor(private router: Router) {}

  onTryNow() {
    console.log('Try Now clicked');
  }

  onSignIn() {
    this.router.navigate(['/login']);
  }
}
