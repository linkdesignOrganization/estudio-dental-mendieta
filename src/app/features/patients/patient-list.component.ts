import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { AvatarComponent } from '../../shared/components/avatar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { PatientCardComponent } from '../../shared/components/patient-card.component';
import { DataTableComponent, TableRowDirective, TableColumn } from '../../shared/components/data-table.component';
import { SkeletonComponent } from '../../shared/components/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { StoreService } from '../../core/persistence/store.service';
import { Patient } from '../../core/models/models';
import { paymentBadge } from '../../shared/status-map';

/**
 * Pacientes — Lista (DEMO-008 / DC-040). Header (título + buscador inline contextual
 * + 1 acción "Nuevo paciente") + tabla ≤5 columnas (Foto·Nombre·Obra social·Próximo
 * turno·Estado de cuenta) con paginación. Toggle Card/Tabla (Tabla = vista primaria).
 * Estados (DC-105): vacío sin resultados, carga skeleton, éxito navegable, paginación.
 */
@Component({
  selector: 'app-patient-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, AvatarComponent, StatusBadgeComponent, PatientCardComponent, DataTableComponent, TableRowDirective, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="page-head">
      <div class="page-head__titles">
        <h2 class="t-display">Pacientes</h2>
        <span class="page-head__subtitle">{{ filtered().length }} pacientes en el sistema</span>
      </div>
      <div class="page-head__actions">
        <div class="search-pill">
          <app-icon name="magnifying-glass" [size]="16" />
          <input class="search-pill__input" type="search" placeholder="Buscar por nombre…"
                 aria-label="Buscar pacientes" [value]="query()" (input)="onSearch($event)" />
        </div>
        <a class="btn-edm btn-edm--primary" routerLink="/pacientes/nuevo/datos">
          <app-icon name="plus" [size]="18" /> Nuevo paciente
        </a>
      </div>
    </div>

    <div class="toolbar">
      <div class="view-toggle" role="group" aria-label="Cambiar vista">
        <button type="button" class="view-toggle__btn" [class.is-active]="view() === 'tabla'" (click)="view.set('tabla')" aria-label="Vista de tabla">
          <app-icon name="rows" [size]="18" /> Tabla
        </button>
        <button type="button" class="view-toggle__btn" [class.is-active]="view() === 'cards'" (click)="view.set('cards')" aria-label="Vista de tarjetas">
          <app-icon name="squares-four" [size]="18" /> Tarjetas
        </button>
      </div>
    </div>

    @if (view() === 'tabla') {
      <app-data-table
        [columns]="columns" [rows]="filtered()" [loading]="loading()" [trackKey]="trackPatient"
        [rowLabel]="rowLabel" emptyIcon="magnifying-glass" emptyTitle="No encontramos pacientes con ese criterio"
        emptyDescription="Probá con otro nombre o ajustá los filtros para ver más resultados."
        (rowClick)="open($event)">
        <ng-template appRow let-p>
          <td class="cell cell--visual">
            <div class="cell-person">
              <app-avatar [src]="p.fotoPath" [name]="p.nombre + ' ' + p.apellido" size="sm" />
              <span class="cell-person__name t-body-medium">{{ p.nombre }} {{ p.apellido }}</span>
            </div>
          </td>
          <td class="cell">{{ p.obraSocial }}</td>
          <td class="cell">{{ p.proximoTurno || '—' }}</td>
          <td class="cell"><app-status-badge [label]="badge(p).label" [tone]="badge(p).tone" /></td>
          <td class="cell cell--end">
            <a class="icon-btn" [routerLink]="['/pacientes', p.id, 'editar']" aria-label="Editar paciente" (click)="$event.stopPropagation()">
              <app-icon name="pencil-simple" [size]="18" />
            </a>
          </td>
        </ng-template>
      </app-data-table>
    } @else {
      @if (loading()) {
        <div class="cards" aria-busy="true">@for (i of [0,1,2,3,4,5]; track i) { <app-skeleton preset="card" [index]="i" /> }</div>
      } @else {
        <div class="cards">
          @for (p of filtered(); track p.id) { <app-patient-card [patient]="p" />
          } @empty {
            <app-empty-state class="cards__empty" icon="magnifying-glass" title="No encontramos pacientes con ese criterio"
              description="Probá con otro nombre o ajustá los filtros para ver más resultados." />
          }
        </div>
      }
    }
  `,
  styles: [`
    :host { display: block; }
    .toolbar { display: flex; justify-content: flex-end; margin-bottom: var(--space-4); }
    .search-pill {
      display: inline-flex; align-items: center; gap: var(--space-2);
      height: var(--control-height); padding: 0 var(--space-3);
      border: 1px solid var(--color-border); border-radius: var(--radius-sm);
      background: var(--color-bg-elevated); color: var(--color-text-secondary);
      min-width: 240px; transition: border-color var(--motion-fast) var(--motion-ease);
    }
    .search-pill:focus-within { border-color: var(--color-accent-deep); box-shadow: var(--focus-ring); }
    .search-pill__input { border: none; outline: none; background: transparent; font-family: var(--font-body); font-size: var(--text-body); color: var(--color-text); width: 100%; height: 100%; min-height: 0; align-self: stretch; }
    .view-toggle { display: inline-flex; border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow: hidden; }
    .view-toggle__btn {
      display: inline-flex; align-items: center; gap: var(--space-2);
      height: 36px; padding: 0 var(--space-3); border: none; background: var(--color-bg-elevated);
      color: var(--color-text-secondary); font-family: var(--font-body); font-size: var(--text-small); cursor: pointer;
      transition: background-color var(--motion-fast) var(--motion-ease), color var(--motion-fast) var(--motion-ease);
    }
    .view-toggle__btn:hover { background: var(--color-accent-tint); }
    .view-toggle__btn.is-active { background: var(--color-accent-sky); color: var(--color-text); }
    .view-toggle__btn:focus-visible { box-shadow: inset var(--focus-ring); outline: none; }
    .cell { padding: var(--space-3) var(--space-3); color: var(--color-text); vertical-align: middle; }
    .cell--end { text-align: right; }
    .cell-person { display: flex; align-items: center; gap: var(--space-3); }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
    .cards__empty { grid-column: 1 / -1; }
    @media (max-width: 1199px) { .cards { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) {
      .page-head__actions { width: 100%; }
      /* Touch target ≥44px en mobile (DC-088 / BVC-017): el buscador y los toggles
         de vista crecen su hit-area a 44px (el input estira al alto del pill). */
      .search-pill { flex: 1; min-width: 0; height: auto; min-height: var(--touch-target-min); }
      .view-toggle__btn { height: var(--touch-target-min); }
      .cards { grid-template-columns: 1fr; }
    }
  `],
})
export class PatientListComponent {
  protected readonly view = signal<'tabla' | 'cards'>('tabla');
  protected readonly query = signal('');
  protected readonly loading = signal(false);

  private readonly store = inject(StoreService);
  protected readonly columns: TableColumn[] = [
    { key: 'visual', label: 'Paciente' },
    { key: 'obra', label: 'Obra social' },
    { key: 'turno', label: 'Próximo turno' },
    { key: 'estado', label: 'Estado de cuenta' },
    { key: 'acciones', label: '', align: 'end' },
  ];

  protected readonly filtered = computed(() => {
    const all = this.store.patients();
    const q = this.query().trim().toLowerCase();
    if (!q) return all;
    return all.filter((p) =>
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(q) || p.dni.replace(/\./g, '').includes(q.replace(/\./g, '')),
    );
  });

  constructor(private router: Router) {}

  protected onSearch(e: Event) { this.query.set((e.target as HTMLInputElement).value); }
  protected open(p: Patient) { this.router.navigate(['/pacientes', p.id]); }
  protected badge(p: Patient) { return paymentBadge(p.estadoCuenta); }
  protected readonly trackPatient = (p: Patient) => p.id;
  protected readonly rowLabel = (p: Patient) => `Ver ficha de ${p.nombre} ${p.apellido}`;
}
