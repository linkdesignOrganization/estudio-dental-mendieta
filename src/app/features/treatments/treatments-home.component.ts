import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AvatarComponent } from '../../shared/components/avatar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { DataTableComponent, TableRowDirective, TableColumn } from '../../shared/components/data-table.component';
import { TreatmentTypeCardComponent } from '../../shared/components/treatment-type-card.component';
import { StoreService } from '../../core/persistence/store.service';
import { treatmentBadge } from '../../shared/status-map';
import { TreatmentPlan } from '../../core/models/models';

/**
 * Tratamientos (DEMO-012 / DC-046 / DC-113/114). Navegación de sección Activos /
 * Catálogo. Activos: tabla ≤5 columnas (Paciente·Tratamiento·Profesional·Etapas X/Y·
 * Próxima fecha) + filtro por profesional. Catálogo: cards aireadas (≥12 tipos).
 */
@Component({
  selector: 'app-treatments-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, StatusBadgeComponent, DataTableComponent, TableRowDirective, TreatmentTypeCardComponent],
  template: `
    <div class="page-head">
      <div class="page-head__titles">
        <h2 class="t-display">Tratamientos</h2>
        <span class="page-head__subtitle">{{ section() === 'activos' ? activeRows().length + ' tratamientos en curso' : types().length + ' tipos en el catálogo' }}</span>
      </div>
    </div>

    <nav class="section-nav" aria-label="Secciones de tratamientos">
      <button type="button" class="section-nav__tab" [class.is-active]="section() === 'activos'" (click)="section.set('activos')">Activos</button>
      <button type="button" class="section-nav__tab" [class.is-active]="section() === 'catalogo'" (click)="section.set('catalogo')">Catálogo de tipos</button>
    </nav>

    @if (section() === 'activos') {
      <div class="toolbar">
        <select class="select-edm toolbar__filter" aria-label="Filtrar por profesional" [value]="prof()" (change)="onProf($event)">
          <option value="">Todos los profesionales</option>
          @for (p of professionals(); track p.id) { <option [value]="p.nombre">{{ p.nombre }}</option> }
        </select>
      </div>
      <app-data-table
        [columns]="columns" [rows]="activeRows()" [trackKey]="trackPlan" [rowLabel]="rowLabel"
        emptyIcon="tooth" emptyTitle="No hay tratamientos activos con este criterio"
        emptyDescription="Ajustá el filtro o creá un nuevo plan desde la ficha del paciente." (rowClick)="openPlan($event)">
        <ng-template appRow let-t>
          <td class="cell cell--visual">
            <div class="cell-person">
              <app-avatar [src]="patientFoto(t.pacienteId)" [name]="patientName(t.pacienteId)" size="sm" />
              <span class="t-body-medium">{{ patientName(t.pacienteId) }}</span>
            </div>
          </td>
          <td class="cell">{{ t.nombre }}</td>
          <td class="cell">{{ t.profesional }}</td>
          <td class="cell"><span class="cell-stage">{{ t.etapasCompletadas }}/{{ t.etapasTotales }}</span></td>
          <td class="cell cell--end"><app-status-badge [label]="badge(t).label" [tone]="badge(t).tone" /></td>
        </ng-template>
      </app-data-table>
    } @else {
      <div class="catalog">
        @for (t of types(); track t.id) { <app-treatment-type-card [type]="t" /> }
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .section-nav { display: flex; gap: var(--space-1); border-bottom: 1px solid var(--color-border); margin-bottom: var(--space-5); }
    .section-nav__tab { padding: var(--space-3) var(--space-4); border: none; background: transparent; color: var(--color-text-secondary); font-family: var(--font-body); font-size: var(--text-body); cursor: pointer; border-bottom: 2px solid transparent; border-radius: var(--radius-sm) var(--radius-sm) 0 0; transition: background-color var(--motion-fast) var(--motion-ease), color var(--motion-fast) var(--motion-ease); }
    .section-nav__tab:hover { background: var(--color-accent-tint); color: var(--color-text); }
    .section-nav__tab.is-active { color: var(--color-text); font-weight: var(--weight-medium); background: var(--color-accent-tint); border-bottom-color: var(--color-accent); }
    .section-nav__tab:focus-visible { box-shadow: var(--focus-ring); outline: none; }
    .toolbar { display: flex; justify-content: flex-end; margin-bottom: var(--space-4); }
    .toolbar__filter { max-width: 240px; }
    .cell { padding: var(--space-3) var(--space-3); color: var(--color-text); vertical-align: middle; }
    .cell--end { text-align: right; }
    .cell-person { display: flex; align-items: center; gap: var(--space-3); }
    .cell-stage { font-variant-numeric: tabular-nums; font-weight: var(--weight-medium); }
    .catalog { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
    @media (max-width: 1199px) { .catalog { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .catalog { grid-template-columns: 1fr; } }
  `],
})
export class TreatmentsHomeComponent {
  private readonly store = inject(StoreService);
  protected readonly types = this.store.treatmentTypes;
  protected readonly professionals = this.store.professionals;
  protected readonly columns: TableColumn[] = [
    { key: 'paciente', label: 'Paciente' },
    { key: 'tratamiento', label: 'Tratamiento' },
    { key: 'profesional', label: 'Profesional' },
    { key: 'etapas', label: 'Etapas' },
    { key: 'estado', label: 'Estado', align: 'end' },
  ];

  protected readonly section = signal<'activos' | 'catalogo'>(
    inject(ActivatedRoute).snapshot.data['section'] === 'catalogo' ? 'catalogo' : 'activos',
  );
  protected readonly prof = signal('');

  protected readonly activeRows = computed(() => {
    const active = this.store.treatmentPlans().filter((t) => t.estado !== 'completado');
    const p = this.prof();
    return p ? active.filter((t) => t.profesional === p) : active;
  });

  constructor(private router: Router) {}
  protected onProf(e: Event) { this.prof.set((e.target as HTMLSelectElement).value); }
  protected openPlan(t: TreatmentPlan) { this.router.navigate(['/pacientes', t.pacienteId, 'plan', t.id]); }
  protected badge(t: TreatmentPlan) { return treatmentBadge(t.estado); }
  protected patientName(id: string) { const p = this.store.patientById(id); return p ? `${p.nombre} ${p.apellido}` : '—'; }
  protected patientFoto(id: string) { return this.store.patientById(id)?.fotoPath; }
  protected readonly trackPlan = (t: TreatmentPlan) => t.id;
  protected readonly rowLabel = (t: TreatmentPlan) => `Ver tratamiento ${t.nombre}`;
}
