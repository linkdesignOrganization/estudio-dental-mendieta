import { Component, ChangeDetectionStrategy, input, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../../core/persistence/store.service';

/**
 * Redirección: /tratamientos/activos/:id → /pacientes/:pacienteId/plan/:id.
 * El plan vive dentro de la ficha del paciente (la pantalla de detalle de plan es
 * única). Mantiene multi-pantalla con una sola fuente de verdad para el detalle.
 */
@Component({
  selector: 'app-treatment-plan-redirect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="t-body t-secondary" style="padding: var(--space-8)">Abriendo el tratamiento…</p>`,
})
export class TreatmentPlanRedirectComponent {
  readonly id = input<string>('');
  private readonly router = inject(Router);
  private readonly store = inject(StoreService);

  constructor() {
    effect(() => {
      const plan = this.store.planById(this.id());
      if (plan) this.router.navigate(['/pacientes', plan.pacienteId, 'plan', plan.id], { replaceUrl: true });
      else this.router.navigate(['/tratamientos'], { replaceUrl: true });
    });
  }
}
