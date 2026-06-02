import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ArsPipe } from '../../shared/pipes/ars.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { StoreService } from '../../core/persistence/store.service';
import { invoiceBadge } from '../../shared/status-map';

/**
 * Facturación — Detalle de factura (DC-047). Sin mención fiscal (mock interno).
 */
@Component({
  selector: 'app-invoice-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, StatusBadgeComponent, ArsPipe, EmptyStateComponent],
  template: `
    <a class="back-link t-small" routerLink="/facturacion/facturas"><app-icon name="arrow-left" [size]="16" /> Facturas</a>

    @if (invoice(); as i) {
      <article class="surface-card is-lg idet">
        <header class="idet__head">
          <div>
            <h2 class="t-display">Factura {{ i.numero }}</h2>
            <p class="t-body t-secondary">{{ i.pacienteNombre }} · {{ i.fecha }}</p>
          </div>
          <app-status-badge [label]="badge().label" [tone]="badge().tone" />
        </header>
        <hr class="divider" />
        <ul class="idet__items">
          @for (it of items(); track $index) {
            <li class="idet__item"><span class="t-body">{{ it.concepto }}</span><span class="t-body-medium">{{ it.monto | ars }}</span></li>
          }
        </ul>
        <div class="idet__total"><span class="t-title">Total</span><span class="t-title idet__total-amount">{{ i.total | ars }}</span></div>
      </article>
    } @else {
      <app-empty-state icon="receipt" title="No encontramos esta factura"
        description="La factura que buscás no existe." [hasAction]="true">
        <a class="btn-edm btn-edm--primary" routerLink="/facturacion/facturas">Volver a facturas</a>
      </app-empty-state>
    }
  `,
  styles: [`
    :host { display: block; }
    .back-link { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-accent-deep); margin-bottom: var(--space-5); }
    .back-link:hover { text-decoration: underline; }
    .idet { max-width: 720px; display: flex; flex-direction: column; gap: var(--space-4); }
    .idet__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); }
    .idet__head h2 { color: var(--color-text); }
    .idet__items { list-style: none; margin: 0; padding: 0; }
    .idet__item { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border); }
    .idet__total { display: flex; align-items: center; justify-content: space-between; padding-top: var(--space-3); }
    .idet__total .t-title { color: var(--color-text); }
    .idet__total-amount { color: var(--color-accent-deep); font-variant-numeric: tabular-nums; }
  `],
})
export class InvoiceDetailComponent {
  readonly id = input<string>('');
  private readonly store = inject(StoreService);
  protected readonly invoice = computed(() => this.store.invoiceById(this.id()));
  protected readonly items = computed(() => this.store.invoiceItems(this.id()));
  protected readonly badge = computed(() => {
    const i = this.invoice();
    return i ? invoiceBadge(i.estado) : { label: '', tone: 'neutral' as const };
  });
}
