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
import { PatientFlowService } from './patient-flow.service';
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
        <button type="button" class="btn-edm btn-edm--primary" (click)="nuevoPaciente()">
          <app-icon name="plus" [size]="18" /> Nuevo paciente
        </button>
      </div>
    </div>

    <div class="toolbar">
      <div class="filters">
        <button type="button" class="btn-edm btn-edm--ghost filters__toggle"
                [class.is-active]="activeFilters() > 0" [attr.aria-expanded]="filtersOpen()"
                (click)="filtersOpen.set(!filtersOpen())">
          <app-icon name="funnel" [size]="18" /> Filtros
          @if (activeFilters()) { <span class="filters__count">{{ activeFilters() }}</span> }
        </button>
        @if (filtersOpen()) {
          <div class="filters__panel surface-card" role="group" aria-label="Filtros de pacientes">
            <div class="field">
              <label class="field__label" for="f-os">Obra social</label>
              <select id="f-os" class="select-edm" [value]="fObra()" (change)="setFilter('obra', $event)">
                <option value="">Todas</option>
                @for (o of obrasSociales(); track o.id) { <option [value]="o.nombre">{{ o.nombre }}</option> }
              </select>
            </div>
            <div class="field">
              <label class="field__label" for="f-prof">Profesional</label>
              <select id="f-prof" class="select-edm" [value]="fProf()" (change)="setFilter('prof', $event)">
                <option value="">Todos</option>
                @for (p of profesionales(); track p.id) { <option [value]="p.nombre">{{ p.nombre }}</option> }
              </select>
            </div>
            <div class="field">
              <label class="field__label" for="f-edad">Rango de edad</label>
              <select id="f-edad" class="select-edm" [value]="fEdad()" (change)="setFilter('edad', $event)">
                <option value="">Todas</option>
                <option value="0-12">Niños (0–12)</option>
                <option value="13-17">Adolescentes (13–17)</option>
                <option value="18-39">Adultos jóvenes (18–39)</option>
                <option value="40-64">Adultos (40–64)</option>
                <option value="65-200">Adultos mayores (65+)</option>
              </select>
            </div>
            <div class="filters__panel-foot">
              <button type="button" class="btn-edm btn-edm--ghost" [disabled]="!activeFilters()" (click)="clearFilters()">
                Limpiar filtros
              </button>
            </div>
          </div>
        }
      </div>

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
    .toolbar { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-4); }
    .filters { position: relative; }
    .filters__toggle.is-active { border-color: var(--color-accent-deep); color: var(--color-accent-deep); }
    .filters__count {
      display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px;
      padding: 0 5px; border-radius: var(--radius-pill); background: var(--color-accent-deep); color: #fff;
      font-size: 11px; font-weight: var(--weight-medium);
    }
    .filters__panel {
      position: absolute; left: 0; top: calc(100% + 6px); z-index: 60; width: 280px;
      box-shadow: var(--shadow-overlay); display: flex; flex-direction: column; gap: var(--space-4);
    }
    .filters__panel-foot { display: flex; justify-content: flex-end; padding-top: var(--space-1); border-top: 1px solid var(--color-border); }
    @media (max-width: 767px) { .filters__panel { width: min(280px, 78vw); } }
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
         de vista crecen su hit-area a 44px. El <input> es el elemento que recibe el
         tap/foco real, así que su PROPIA caja (no solo la del pill) debe medir ≥44px:
         min-height directo sobre el input. El pill mantiene align-items:center, por lo
         que el ícono (16px, height inline) no se deforma. */
      .search-pill { flex: 1; min-width: 0; height: auto; min-height: var(--touch-target-min); }
      .search-pill__input { min-height: var(--touch-target-min); height: auto; }
      .view-toggle__btn { height: var(--touch-target-min); }
      .cards { grid-template-columns: 1fr; }
    }
  `],
})
export class PatientListComponent {
  protected readonly view = signal<'tabla' | 'cards'>('tabla');
  protected readonly query = signal('');
  protected readonly loading = signal(false);

  // Filtros adicionales (REQ-101): NO permanentemente visibles, se abren con "Filtros".
  protected readonly filtersOpen = signal(false);
  protected readonly fObra = signal('');
  protected readonly fProf = signal('');
  protected readonly fEdad = signal('');

  private readonly store = inject(StoreService);
  private readonly flow = inject(PatientFlowService);
  protected readonly obrasSociales = computed(() => this.store.obrasSociales());
  protected readonly profesionales = computed(() => this.store.professionals());
  protected readonly columns: TableColumn[] = [
    { key: 'visual', label: 'Paciente' },
    { key: 'obra', label: 'Obra social' },
    { key: 'turno', label: 'Próximo turno' },
    { key: 'estado', label: 'Estado de cuenta' },
    { key: 'acciones', label: '', align: 'end' },
  ];

  protected readonly activeFilters = computed(() =>
    [this.fObra(), this.fProf(), this.fEdad()].filter((v) => v !== '').length,
  );

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const obra = this.fObra();
    const prof = this.fProf();
    const [edadMin, edadMax] = this.edadRange();
    return this.store.patients().filter((p) => {
      if (q && !this.matchesQuery(p, q)) return false;
      if (obra && p.obraSocial !== obra) return false;
      if (prof && p.profesional !== prof) return false;
      if (p.edad < edadMin || p.edad > edadMax) return false;
      return true;
    });
  });

  private readonly edadRange = computed<[number, number]>(() => {
    const v = this.fEdad();
    if (!v) return [0, Number.POSITIVE_INFINITY];
    const [min, max] = v.split('-').map(Number);
    return [min, max];
  });

  constructor(private router: Router) {}

  protected onSearch(e: Event) { this.query.set((e.target as HTMLInputElement).value); }
  protected setFilter(which: 'obra' | 'prof' | 'edad', e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    if (which === 'obra') this.fObra.set(value);
    else if (which === 'prof') this.fProf.set(value);
    else this.fEdad.set(value);
  }
  protected clearFilters() {
    this.fObra.set('');
    this.fProf.set('');
    this.fEdad.set('');
  }
  protected open(p: Patient) { this.router.navigate(['/pacientes', p.id]); }
  /** Inicia el alta de paciente desde cero: limpia el wizard y entra al Paso 1 (REQ-173). */
  protected nuevoPaciente() {
    const os = this.store.obrasSocialesRaw();
    this.flow.reset(os.length ? os[0].id : 'os-particular');
    this.router.navigate(['/pacientes', 'nuevo', 'datos']);
  }
  protected badge(p: Patient) { return paymentBadge(p.estadoCuenta); }
  protected readonly trackPatient = (p: Patient) => p.id;
  protected readonly rowLabel = (p: Patient) => `Ver ficha de ${p.nombre} ${p.apellido}`;

  private matchesQuery(p: Patient, q: string): boolean {
    return `${p.nombre} ${p.apellido}`.toLowerCase().includes(q)
      || p.dni.replace(/\./g, '').includes(q.replace(/\./g, ''));
  }
}
