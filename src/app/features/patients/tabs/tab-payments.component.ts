import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon.component';
import { ArsPipe } from '../../../shared/pipes/ars.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { StoreService } from '../../../core/persistence/store.service';
import { currentPatientId } from '../patient-context';

/**
 * Ficha — Tab 6 Pagos (DEMO-011 / DC-044 / DC-111). Resumen arriba (Facturado·Cobrado·
 * Saldo) + lista de movimientos + 1 acción "Registrar pago" (ruta dedicada DEMO-016).
 */
@Component({
  selector: 'app-tab-payments',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, ArsPipe, EmptyStateComponent],
  template: `
    <div class="pay">
      <div class="pay__summary">
        <div class="surface-card pay__stat">
          <span class="pay__stat-label t-small t-secondary">Facturado</span>
          <span class="pay__stat-value t-display">{{ summary().facturado | ars }}</span>
        </div>
        <div class="surface-card pay__stat">
          <span class="pay__stat-label t-small t-secondary">Cobrado</span>
          <span class="pay__stat-value t-display">{{ summary().cobrado | ars }}</span>
        </div>
        <div class="surface-card pay__stat" [class.pay__stat--debt]="summary().saldo > 0">
          <span class="pay__stat-label t-small t-secondary">Saldo pendiente</span>
          <span class="pay__stat-value t-display">{{ saldoMostrado() | ars }}</span>
        </div>
      </div>

      <section class="surface-card is-lg pay__movements">
        <header class="pay__head">
          <h3 class="t-title">Movimientos</h3>
          <a class="btn-edm btn-edm--primary" [routerLink]="['/pacientes', id, 'pagos', 'nuevo']">
            <app-icon name="plus" [size]="18" /> Registrar pago
          </a>
        </header>

        @if (movements().length) {
          <ul class="movements">
            @for (m of movements(); track m.id) {
              <li class="movement">
                <span class="movement__glyph" [attr.data-sign]="m.signo">
                  <app-icon [name]="m.signo === 'pago' ? 'currency-circle-dollar' : 'receipt'" [size]="18" />
                </span>
                <div class="movement__body">
                  <span class="movement__concept t-body">{{ m.concepto }}</span>
                  <span class="movement__date t-small t-secondary">{{ m.fecha }}{{ m.medioPago ? ' · ' + m.medioPago : '' }}</span>
                </div>
                <span class="movement__amount t-body-medium" [attr.data-sign]="m.signo">
                  {{ m.signo === 'pago' ? '−' : '+' }}{{ m.monto | ars }}
                </span>
              </li>
            }
          </ul>
        } @else {
          <app-empty-state icon="currency-circle-dollar" title="Sin movimientos en la cuenta corriente"
            description="Cuando registres un pago o se genere un cargo, vas a verlo acá." />
        }
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .pay { display: flex; flex-direction: column; gap: var(--space-5); }
    .pay__summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
    .pay__stat { display: flex; flex-direction: column; gap: var(--space-2); }
    .pay__stat-value { color: var(--color-accent-deep); }
    .pay__stat--debt .pay__stat-value { color: var(--color-warning-text); }
    .pay__head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-5); }
    .pay__head h3 { color: var(--color-text); }
    .movements { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
    .movement { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border); }
    .movement:last-child { border-bottom: none; }
    .movement__glyph { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; flex: 0 0 auto; border-radius: 50%; background: var(--color-neutral-bg); color: var(--color-neutral-text); }
    .movement__glyph[data-sign="pago"] { background: var(--color-success-bg); color: var(--color-success-text); }
    .movement__body { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    .movement__concept { color: var(--color-text); }
    .movement__amount { white-space: nowrap; color: var(--color-text); }
    .movement__amount[data-sign="pago"] { color: var(--color-success-text); }
    @media (max-width: 767px) {
      .pay__summary { grid-template-columns: 1fr; gap: var(--space-3); }
      .pay__head { flex-direction: column; align-items: stretch; }
      .pay__head .btn-edm { width: 100%; }
    }
  `],
})
export class TabPaymentsComponent {
  private readonly store = inject(StoreService);
  protected readonly id = currentPatientId();
  protected readonly movements = computed(() => this.store.movementsOf(this.id));
  protected readonly summary = computed(() => this.store.accountSummary(this.id));
  // saldo a favor (negativo) se muestra como 0 pendiente; deuda se muestra tal cual
  protected readonly saldoMostrado = computed(() => Math.max(0, this.summary().saldo));
}
