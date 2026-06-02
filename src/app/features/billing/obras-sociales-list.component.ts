import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ObraSocialCardComponent } from '../../shared/components/obra-social-card.component';
import { BillingNavComponent } from './billing-nav.component';
import { StoreService } from '../../core/persistence/store.service';

/**
 * Facturación — Obras sociales (DEMO-013 / DC-047 / DC-117). Cards aireadas (logo-en-
 * círculo + mini-stats pacientes/deuda/último pago + avatar-stack). SIN ARCA/AFIP.
 */
@Component({
  selector: 'app-obras-sociales-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ObraSocialCardComponent, BillingNavComponent],
  template: `
    <div class="page-head">
      <div class="page-head__titles"><h2 class="t-display">Facturación</h2><span class="page-head__subtitle">{{ obras().length }} obras sociales</span></div>
    </div>

    <app-billing-nav />

    <div class="os-grid">
      @for (os of obras(); track os.id) { <app-obra-social-card [os]="os" /> }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .os-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
    @media (max-width: 1199px) { .os-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .os-grid { grid-template-columns: 1fr; } }
  `],
})
export class ObrasSocialesListComponent {
  private readonly store = inject(StoreService);
  protected readonly obras = this.store.obrasSociales;
}
