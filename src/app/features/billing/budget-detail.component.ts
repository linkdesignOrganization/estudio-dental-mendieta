import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ArsPipe } from '../../shared/pipes/ars.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { StoreService } from '../../core/persistence/store.service';
import { budgetBadge } from '../../shared/status-map';
import { ToastService } from '../../shared/components/toast.service';

/**
 * Facturación — Detalle de presupuesto (DC-047). Desglose + acción según estado.
 */
@Component({
  selector: 'app-budget-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, StatusBadgeComponent, ArsPipe, EmptyStateComponent],
  template: `
    <a class="back-link t-small" routerLink="/facturacion/presupuestos"><app-icon name="arrow-left" [size]="16" /> Presupuestos</a>

    @if (budget(); as b) {
      <article class="surface-card is-lg bdet">
        <header class="bdet__head">
          <div>
            <h2 class="t-display">Presupuesto {{ b.numero }}</h2>
            <p class="t-body t-secondary">{{ b.pacienteNombre }} · {{ b.fecha }}</p>
          </div>
          <app-status-badge [label]="badge().label" [tone]="badge().tone" />
        </header>

        <hr class="divider" />

        <ul class="bdet__items">
          @for (it of items(); track $index) {
            <li class="bdet__item">
              <span class="t-body">{{ it.concepto }}</span>
              <span class="t-body-medium bdet__item-amount">{{ it.monto | ars }}</span>
            </li>
          }
        </ul>

        <div class="bdet__total">
          <span class="t-title">Total</span>
          <span class="t-title bdet__total-amount">{{ b.total | ars }}</span>
        </div>

        @if (b.estado === 'pendiente') {
          <div class="bdet__actions">
            <button type="button" class="btn-edm btn-edm--secondary" (click)="reject(b.id)">Rechazar</button>
            <button type="button" class="btn-edm btn-edm--primary" (click)="approve(b.id)"><app-icon name="check" [size]="18" /> Aprobar presupuesto</button>
          </div>
        }
      </article>
    } @else {
      <app-empty-state icon="file-text" title="No encontramos este presupuesto"
        description="El presupuesto que buscás no existe." [hasAction]="true">
        <a class="btn-edm btn-edm--primary" routerLink="/facturacion/presupuestos">Volver a presupuestos</a>
      </app-empty-state>
    }
  `,
  styles: [`
    :host { display: block; }
    .back-link { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-accent-deep); margin-bottom: var(--space-5); }
    .back-link:hover { text-decoration: underline; }
    .bdet { max-width: 720px; display: flex; flex-direction: column; gap: var(--space-4); }
    .bdet__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); }
    .bdet__head h2 { color: var(--color-text); }
    .bdet__items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
    .bdet__item { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border); }
    .bdet__item-amount { font-variant-numeric: tabular-nums; }
    .bdet__total { display: flex; align-items: center; justify-content: space-between; padding-top: var(--space-3); }
    .bdet__total .t-title { color: var(--color-text); }
    .bdet__total-amount { color: var(--color-accent-deep); font-variant-numeric: tabular-nums; }
    .bdet__actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-2); }
    @media (max-width: 767px) { .bdet__actions { flex-direction: column-reverse; } .bdet__actions .btn-edm { width: 100%; } }
  `],
})
export class BudgetDetailComponent {
  readonly id = input<string>('');
  private readonly toast = inject(ToastService);
  private readonly store = inject(StoreService);
  protected readonly budget = computed(() => this.store.budgetById(this.id()));
  protected readonly badge = computed(() => {
    const b = this.budget();
    return b ? budgetBadge(b.estado) : { label: '', tone: 'neutral' as const };
  });
  protected readonly items = computed(() => this.store.budgetItems(this.id()));

  protected approve(id: string) { this.store.setBudgetEstado(id, 'aprobado'); this.toast.success('Presupuesto aprobado.'); }
  protected reject(id: string) { this.store.setBudgetEstado(id, 'rechazado'); this.toast.success('Presupuesto rechazado.'); }
}
