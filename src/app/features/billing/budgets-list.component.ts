import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { DataTableComponent, TableRowDirective, TableColumn } from '../../shared/components/data-table.component';
import { BillingNavComponent } from './billing-nav.component';
import { ArsPipe } from '../../shared/pipes/ars.pipe';
import { StoreService } from '../../core/persistence/store.service';
import { budgetBadge } from '../../shared/status-map';
import { Budget } from '../../core/models/models';

/**
 * Facturación — Presupuestos (DEMO-013 / DC-047 / DC-115). Tabla 4-5 col + crear (3 pasos).
 */
@Component({
  selector: 'app-budgets-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, StatusBadgeComponent, DataTableComponent, TableRowDirective, BillingNavComponent, ArsPipe],
  template: `
    <div class="page-head">
      <div class="page-head__titles"><h2 class="t-display">Facturación</h2><span class="page-head__subtitle">{{ rows().length }} presupuestos</span></div>
      <div class="page-head__actions">
        <a class="btn-edm btn-edm--primary" routerLink="/facturacion/presupuestos/nuevo/paciente"><app-icon name="plus" [size]="18" /> Nuevo presupuesto</a>
      </div>
    </div>

    <app-billing-nav />

    <app-data-table [columns]="columns" [rows]="rows()" [trackKey]="trackB" [rowLabel]="rowLabel"
      emptyIcon="file-text" emptyTitle="No hay presupuestos con este criterio"
      emptyDescription="Creá uno con Nuevo presupuesto para enviárselo al paciente." (rowClick)="open($event)">
      <ng-template appRow let-b>
        <td class="cell"><span class="t-body-medium">{{ b.numero }}</span></td>
        <td class="cell">{{ b.pacienteNombre }}</td>
        <td class="cell">{{ b.fecha }}</td>
        <td class="cell cell--money">{{ b.total | ars }}</td>
        <td class="cell cell--end"><app-status-badge [label]="badge(b).label" [tone]="badge(b).tone" /></td>
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
export class BudgetsListComponent {
  protected readonly columns: TableColumn[] = [
    { key: 'numero', label: 'Número' },
    { key: 'paciente', label: 'Paciente' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'total', label: 'Total' },
    { key: 'estado', label: 'Estado', align: 'end' },
  ];
  private readonly store = inject(StoreService);
  protected readonly rows = this.store.budgets;

  constructor(private router: Router) {}
  protected open(b: Budget) { this.router.navigate(['/facturacion/presupuestos', b.id]); }
  protected badge(b: Budget) { return budgetBadge(b.estado); }
  protected readonly trackB = (b: Budget) => b.id;
  protected readonly rowLabel = (b: Budget) => `Ver presupuesto ${b.numero}`;
}
