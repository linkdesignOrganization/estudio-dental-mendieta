import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { AvatarComponent } from '../../shared/components/avatar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { DataTableComponent, TableRowDirective, TableColumn } from '../../shared/components/data-table.component';
import { StoreService } from '../../core/persistence/store.service';
import { appointmentBadge } from '../../shared/status-map';
import { Appointment } from '../../core/models/models';

/**
 * Agenda — Lista de turnos del día (DEMO-007 / DC-039 / DC-103). Tabla ≤4 columnas
 * (Paciente·Profesional·Hora·Estado) ordenada por hora, filas clickeables. 5 estados.
 */
@Component({
  selector: 'app-day-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, AvatarComponent, StatusBadgeComponent, DataTableComponent, TableRowDirective],
  template: `
    <div class="page-head">
      <div class="page-head__titles">
        <a class="back-link t-small" routerLink="/agenda"><app-icon name="arrow-left" [size]="16" /> Agenda</a>
        <h2 class="t-display">Turnos del día</h2>
        <span class="page-head__subtitle">Lunes 1 de junio · {{ rows().length }} turnos</span>
      </div>
      <div class="page-head__actions">
        <a class="btn-edm btn-edm--primary" routerLink="/agenda/nuevo/paciente"><app-icon name="calendar-plus" [size]="18" /> Nuevo turno</a>
      </div>
    </div>

    <app-data-table
      [columns]="columns" [rows]="rows()" [trackKey]="trackAppt" [rowLabel]="rowLabel"
      emptyIcon="calendar-blank" emptyTitle="No hay turnos para este día"
      emptyDescription="Agendá uno con Nuevo turno para empezar a llenar la agenda." (rowClick)="open($event)">
      <ng-template appRow let-a>
        <td class="cell cell--visual">
          <div class="cell-person">
            <app-avatar [src]="a.pacienteFoto" [name]="a.pacienteNombre" size="sm" />
            <span class="t-body-medium">{{ a.pacienteNombre }}</span>
          </div>
        </td>
        <td class="cell">{{ a.profesional }}</td>
        <td class="cell"><span class="cell-time">{{ a.hora }}</span> <span class="t-small t-secondary">· {{ a.duracionMin }} min</span></td>
        <td class="cell cell--end"><app-status-badge [label]="badge(a).label" [tone]="badge(a).tone" /></td>
      </ng-template>
    </app-data-table>
  `,
  styles: [`
    :host { display: block; }
    .back-link { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-accent-deep); margin-bottom: var(--space-1); }
    .back-link:hover { text-decoration: underline; }
    .cell { padding: var(--space-3) var(--space-3); color: var(--color-text); vertical-align: middle; }
    .cell--end { text-align: right; }
    .cell-person { display: flex; align-items: center; gap: var(--space-3); }
    .cell-time { font-weight: var(--weight-medium); }
  `],
})
export class DayListComponent {
  protected readonly columns: TableColumn[] = [
    { key: 'paciente', label: 'Paciente' },
    { key: 'profesional', label: 'Profesional' },
    { key: 'hora', label: 'Hora' },
    { key: 'estado', label: 'Estado', align: 'end' },
  ];
  private readonly store = inject(StoreService);
  protected readonly rows = computed<Appointment[]>(() => this.store.appointmentsOn('2026-06-01'));

  constructor(private router: Router) {}
  protected open(a: Appointment) { this.router.navigate(['/agenda', a.id]); }
  protected badge(a: Appointment) { return appointmentBadge(a.estado); }
  protected readonly trackAppt = (a: Appointment) => a.id;
  protected readonly rowLabel = (a: Appointment) => `Ver turno de ${a.pacienteNombre} a las ${a.hora}`;
}
