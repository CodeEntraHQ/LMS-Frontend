import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { StatisticsComponent } from '../../components/statistics/statistics.component';
import { FeaturesComponent } from '../../components/features/features.component';
import { CtaSectionComponent } from '../../components/cta-section/cta-section.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    StatisticsComponent,
    FeaturesComponent,
    CtaSectionComponent,
    FooterComponent
  ],
  template: `
    <div class="home-page">
      <app-header></app-header>
      <app-hero></app-hero>
      <app-statistics></app-statistics>
      <app-features></app-features>
      <app-cta-section></app-cta-section>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .home-page {
      min-height: 100vh;
      background-color: var(--primary-bg);
    }
  `]
})
export class HomeComponent {
}
