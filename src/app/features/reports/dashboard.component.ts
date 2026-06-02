import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KpiCardComponent } from '../../shared/components/kpi-card.component';
import { SkeletonComponent } from '../../shared/components/skeleton.component';
import { IconComponent } from '../../shared/components/icon.component';
import { StoreService } from '../../core/persistence/store.service';

/**
 * Reportes — Dashboard (DEMO-014 / DC-048, anti-clutter). Grilla aireada de ≤6 KPI
 * cards clickeables. Cada KPI = número grande (peso 500, azul) + anillo opcional +
 * label. PROHIBIDO amontonar tablas; cada card respira.
 * Estados (DC-118): carga = skeletons de card (stagger); éxito = grid clickeable.
 */
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, KpiCardComponent, SkeletonComponent, IconComponent],
  template: `
    <div class="page-head">
      <div class="page-head__titles">
        <h2 class="t-display">Resumen de la clínica</h2>
        <span class="page-head__subtitle">Una vista de la operación de hoy. Mes en curso.</span>
      </div>
      <div class="page-head__actions">
        <button type="button" class="btn-edm btn-edm--secondary" (click)="reload()">
          <app-icon name="arrow-clockwise" [size]="18" /> Actualizar
        </button>
      </div>
    </div>

    @if (loading()) {
      <div class="grid" aria-busy="true" aria-label="Cargando indicadores">
        @for (i of [0,1,2,3,4,5]; track i) { <app-skeleton preset="kpi" [index]="i" /> }
      </div>
    } @else {
      <div class="grid edm-stagger">
        @for (kpi of kpis(); track kpi.id; let i = $index) {
          <a class="grid__cell edm-rise-in" [style.animation-delay]="i * 40 + 'ms'" [routerLink]="reportLink(kpi.id)">
            <app-kpi-card [kpi]="kpi" />
          </a>
        }
      </div>

      <section class="reports-nav">
        <h3 class="t-title reports-nav__title">Reportes detallados</h3>
        <div class="reports-nav__grid">
          @for (r of detailed; track r.route) {
            <a class="surface-bordered is-clickable rnav" [routerLink]="r.route">
              <span class="rnav__glyph"><app-icon [name]="r.icon" [size]="20" /></span>
              <span class="rnav__body">
                <span class="rnav__label t-body-medium">{{ r.label }}</span>
                <span class="rnav__desc t-small t-secondary">{{ r.desc }}</span>
              </span>
              <app-icon name="caret-right" [size]="18" />
            </a>
          }
        </div>
      </section>
    }
  `,
  styles: [`
    :host { display: block; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
    .grid__cell { display: block; border-radius: var(--radius-md); }
    .grid__cell:focus-visible { box-shadow: var(--focus-ring); outline: none; }
    .edm-rise-in { animation: edm-rise 320ms var(--motion-ease) both; }
    .reports-nav { margin-top: var(--section-gap); }
    .reports-nav__title { margin-bottom: var(--space-4); }
    .reports-nav__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--card-gap); }
    .rnav { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); color: var(--color-text); }
    .rnav:hover { border-color: var(--color-accent-sky); background: var(--color-accent-tint); }
    .rnav:focus-visible { box-shadow: var(--focus-ring); }
    .rnav__glyph { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; flex: 0 0 auto; border-radius: var(--radius-sm); background: var(--color-accent-tint); color: var(--color-accent-deep); }
    .rnav__body { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    @media (max-width: 1199px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) {
      .grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
      .reports-nav__grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 479px) { .grid { grid-template-columns: 1fr; } }
  `],
})
export class DashboardComponent {
  private readonly store = inject(StoreService);
  protected readonly kpis = this.store.kpis;
  protected readonly loading = signal(false);

  protected readonly detailed = [
    { label: 'Pacientes', desc: 'Altas, distribución por edad y obra social', icon: 'users', route: '/reportes/pacientes' },
    { label: 'Tratamientos', desc: 'Activos, completados y por tipo', icon: 'tooth', route: '/reportes/tratamientos' },
    { label: 'Financiero', desc: 'Facturación, cobranzas y deuda', icon: 'chart-line', route: '/reportes/financiero' },
    { label: 'Productividad', desc: 'Turnos por profesional y asistencia', icon: 'chart-bar', route: '/reportes/productividad' },
  ];

  protected reportLink(kpiId: string): string {
    const map: Record<string, string> = {
      'kpi-01': '/reportes/pacientes', 'kpi-02': '/reportes/productividad', 'kpi-03': '/reportes/tratamientos',
      'kpi-04': '/reportes/financiero', 'kpi-05': '/reportes/financiero', 'kpi-06': '/reportes/financiero',
    };
    return map[kpiId] ?? '/reportes/financiero';
  }

  protected reload() {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 900);
  }
}
