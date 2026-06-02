import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { DataTableComponent, TableRowDirective, TableColumn } from '../../shared/components/data-table.component';
import { BillingNavComponent } from './billing-nav.component';
import { ArsPipe } from '../../shared/pipes/ars.pipe';
import { StoreService } from '../../core/persistence/store.service';
import { invoiceBadge } from '../../shared/status-map';
import { Invoice } from '../../core/models/models';

/**
 * Facturación — Facturas (DEMO-013 / DC-047 / DC-116). Tabla ≤4 col. Sin mención fiscal.
 */
@Component({
  selector: 'app-invoices-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusBadgeComponent, DataTableComponent, TableRowDirective, BillingNavComponent, ArsPipe],
  template: `
    <div class="page-head">
      <div class="page-head__titles"><h2 class="t-display">Facturación</h2><span class="page-head__subtitle">{{ rows().length }} facturas emitidas</span></div>
    </div>

    <app-billing-nav />

    <app-data-table [columns]="columns" [rows]="rows()" [trackKey]="trackI" [rowLabel]="rowLabel"
      emptyIcon="receipt" emptyTitle="No hay facturas con este criterio"
      emptyDescription="Las facturas que emitas aparecerán acá." (rowClick)="open($event)">
      <ng-template appRow let-i>
        <td class="cell"><span class="t-body-medium">{{ i.numero }}</span></td>
        <td class="cell">{{ i.pacienteNombre }}</td>
        <td class="cell cell--money">{{ i.total | ars }}</td>
        <td class="cell cell--end"><app-status-badge [label]="badge(i).label" [tone]="badge(i).tone" /></td>
      </ng-template>
    </app-data-table>
  `,
  styles: [`
    :host { display: block; }
    .cell { padding: var(--space-3) var(--space-3); color: var(--color-text); vertical-align: middle; }
    .cell--end { text-align: right; }
    .cell--money { font-variant-numeric: tabular-nums; }
  `],
})
export class InvoicesListComponent {
  protected readonly columns: TableColumn[] = [
    { key: 'numero', label: 'Número' },
    { key: 'paciente', label: 'Paciente' },
    { key: 'total', label: 'Total' },
    { key: 'estado', label: 'Estado', align: 'end' },
  ];
  private readonly store = inject(StoreService);
  protected readonly rows = this.store.invoices;

  constructor(private router: Router) {}
  protected open(i: Invoice) { this.router.navigate(['/facturacion/facturas', i.id]); }
  protected badge(i: Invoice) { return invoiceBadge(i.estado); }
  protected readonly trackI = (i: Invoice) => i.id;
  protected readonly rowLabel = (i: Invoice) => `Ver factura ${i.numero}`;
}
