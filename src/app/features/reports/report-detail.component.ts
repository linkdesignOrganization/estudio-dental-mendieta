import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconComponent } from '../../shared/components/icon.component';
import { MiniChartComponent } from '../../shared/components/mini-chart.component';
import { StoreService } from '../../core/persistence/store.service';

interface ChartCard { titulo: string; type: 'bar' | 'line' | 'donut'; values: number[]; labels: string[]; nota: string; }

/**
 * Reportes detallados (DEMO-018 / DC-049/119). Cards aireadas separadas, 1 métrica
 * por card (pacientes 4 / tratamientos 3 / financiero 3 / productividad 3).
 * Gráfico sin datos → "Sin datos suficientes para este gráfico." Montos ARS en financiero.
 */
@Component({
  selector: 'app-report-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, MiniChartComponent],
  template: `
    <div class="page-head">
      <div class="page-head__titles">
        <a class="back-link t-small" routerLink="/reportes"><app-icon name="arrow-left" [size]="16" /> Reportes</a>
        <h2 class="t-display">{{ titulo() }}</h2>
        <span class="page-head__subtitle">{{ subtitulo() }}</span>
      </div>
    </div>

    <div class="charts">
      @for (c of charts(); track c.titulo) {
        <article class="surface-card chart-card">
          <header class="chart-card__head">
            <h3 class="t-title">{{ c.titulo }}</h3>
            <span class="t-small t-secondary">{{ c.nota }}</span>
          </header>
          @if (c.values.length) {
            <app-mini-chart [type]="c.type" [values]="c.values" [labels]="c.labels" [caption]="c.titulo" />
          } @else {
            <p class="chart-card__empty t-body t-secondary">Sin datos suficientes para este gráfico.</p>
          }
        </article>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .back-link { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-accent-deep); margin-bottom: var(--space-1); }
    .back-link:hover { text-decoration: underline; }
    .charts { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-5); }
    .chart-card { display: flex; flex-direction: column; gap: var(--space-5); }
    .chart-card__head { display: flex; flex-direction: column; gap: 2px; }
    .chart-card__empty { padding: var(--space-8) 0; text-align: center; }
    @media (max-width: 767px) { .charts { grid-template-columns: 1fr; } }
  `],
})
export class ReportDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly tema = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

  protected readonly key = computed(() => (this.tema() as { tema?: string })?.tema ?? 'pacientes');
  protected readonly titulo = computed(() => ({
    pacientes: 'Reporte de pacientes', tratamientos: 'Reporte de tratamientos',
    financiero: 'Reporte financiero', productividad: 'Reporte de productividad',
  }[this.key()] ?? 'Reporte'));
  protected readonly subtitulo = computed(() => ({
    pacientes: 'Altas, distribución y obras sociales.', tratamientos: 'Estados y tipos más frecuentes.',
    financiero: 'Facturación, cobranzas y deuda en pesos.', productividad: 'Turnos por profesional y asistencia.',
  }[this.key()] ?? ''));

  private readonly store = inject(StoreService);

  /** Gráficos CALCULADOS del estado real (seed + cambios del usuario — UX-066). */
  protected readonly charts = computed<ChartCard[]>(() => {
    const d = this.store.reportData();
    if (!d) return [];
    switch (this.key()) {
      case 'pacientes': return this.chartsPacientes(d);
      case 'tratamientos': return this.chartsTratamientos(d);
      case 'financiero': return this.chartsFinanciero(d);
      case 'productividad': return this.chartsProductividad(d);
      default: return [];
    }
  });

  private chartsPacientes(d: NonNullable<ReturnType<StoreService['reportData']>>): ChartCard[] {
    // distribución por edad
    const bandas = [0, 0, 0, 0, 0]; // 0-17, 18-29, 30-49, 50-69, 70+
    for (const p of d.patients) {
      if (p.edad <= 17) bandas[0]++;
      else if (p.edad <= 29) bandas[1]++;
      else if (p.edad <= 49) bandas[2]++;
      else if (p.edad <= 69) bandas[3]++;
      else bandas[4]++;
    }
    // por obra social
    const osLabels = d.obrasSociales.map((o) => o.nombre);
    const osValues = d.obrasSociales.map((o) => d.patients.filter((p) => p.obraSocialId === o.id).length);
    // nuevos por mes (últimos 6 meses desde TODAY)
    const meses = this.lastMonths(6);
    const nuevos = meses.map((m) => d.patients.filter((p) => p.altaFecha.startsWith(m.key)).length);
    return [
      { titulo: 'Pacientes nuevos por mes', type: 'bar', values: nuevos, labels: meses.map((m) => m.label), nota: 'Últimos 6 meses' },
      { titulo: 'Distribución por edad', type: 'bar', values: bandas, labels: ['0-17', '18-29', '30-49', '50-69', '70+'], nota: `${d.patients.length} pacientes` },
      { titulo: 'Pacientes por obra social', type: 'bar', values: osValues, labels: osLabels, nota: `${d.patients.length} pacientes` },
    ];
  }

  private chartsTratamientos(d: NonNullable<ReturnType<StoreService['reportData']>>): ChartCard[] {
    const estados = ['en-curso', 'atrasado', 'en-pausa', 'completado'];
    const estValues = estados.map((e) => d.treatmentPlans.filter((t) => t.estado === e).length);
    // tipos más frecuentes (top 5 por cantidad de planes)
    const porTipo = new Map<string, number>();
    for (const t of d.treatmentPlans) porTipo.set(t.tipoId, (porTipo.get(t.tipoId) ?? 0) + 1);
    const top = [...porTipo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const tipoLabels = top.map(([id]) => d.treatmentTypes.find((x) => x.id === id)?.nombre.split(' ')[0] ?? '—');
    const tipoValues = top.map(([, n]) => n);
    const total = d.treatmentPlans.length;
    const completados = d.treatmentPlans.filter((t) => t.estado === 'completado').length;
    const tasa = total ? Math.round((completados / total) * 100) : 0;
    return [
      { titulo: 'Tratamientos por estado', type: 'bar', values: estValues, labels: ['En curso', 'Atrasado', 'En pausa', 'Completado'], nota: 'Estado actual' },
      { titulo: 'Tipos más frecuentes', type: 'bar', values: tipoValues, labels: tipoLabels, nota: 'Por cantidad de planes' },
      { titulo: 'Tasa de finalización', type: 'donut', values: [tasa], labels: [], nota: 'De los planes registrados' },
    ];
  }

  private chartsFinanciero(d: NonNullable<ReturnType<StoreService['reportData']>>): ChartCard[] {
    const meses = this.lastMonths(6);
    const factPorMes = meses.map((m) => {
      const total = d.invoices.filter((i) => i.fechaEmision.startsWith(m.key) && i.estado !== 'anulada').reduce((s, i) => s + i.total, 0);
      return Math.round((total / 1_000_000) * 100) / 100; // en millones
    });
    const facturado = d.invoices.filter((i) => i.estado !== 'anulada').reduce((s, i) => s + i.total, 0);
    const cobrado = d.movements.filter((m) => m.signo === 'pago').reduce((s, m) => s + m.monto, 0);
    const tasaCobranza = facturado ? Math.min(100, Math.round((cobrado / facturado) * 100)) : 0;
    return [
      { titulo: 'Facturación mensual (ARS)', type: 'line', values: factPorMes, labels: meses.map((m) => m.label), nota: 'En millones de pesos' },
      { titulo: 'Cobranzas vs facturado', type: 'bar', values: [Math.round(facturado / 1000), Math.round(cobrado / 1000)], labels: ['Facturado', 'Cobrado'], nota: 'Total acumulado (en miles)' },
      { titulo: 'Tasa de cobranza', type: 'donut', values: [tasaCobranza], labels: [], nota: 'De lo facturado' },
    ];
  }

  private chartsProductividad(d: NonNullable<ReturnType<StoreService['reportData']>>): ChartCard[] {
    const profLabels = d.professionals.map((p) => p.nombre.split(' ').slice(-1)[0]);
    const profValues = d.professionals.map((p) => d.appointments.filter((a) => a.profesionalId === p.id).length);
    const atendidos = d.appointments.filter((a) => a.estado === 'terminado').length;
    const noCancelados = d.appointments.filter((a) => a.estado !== 'cancelado').length;
    const asistencia = noCancelados ? Math.round((atendidos / noCancelados) * 100) : 0;
    // turnos por día de semana
    const dias = [0, 0, 0, 0, 0, 0]; // Lun..Sáb
    for (const a of d.appointments) {
      const [y, m, day] = a.fecha.split('-').map(Number);
      const dow = new Date(y, m - 1, day).getDay(); // 0=Dom
      if (dow >= 1 && dow <= 6) dias[dow - 1]++;
    }
    return [
      { titulo: 'Turnos por profesional', type: 'bar', values: profValues, labels: profLabels, nota: 'Total de turnos' },
      { titulo: 'Asistencia a turnos', type: 'donut', values: [asistencia], labels: [], nota: 'Atendidos sobre agendados' },
      { titulo: 'Turnos por día de semana', type: 'bar', values: dias, labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], nota: 'Acumulado' },
    ];
  }

  /** Últimos N meses (clave "yyyy-mm" + label corto) terminando en junio 2026. */
  private lastMonths(n: number): { key: string; label: string }[] {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const out: { key: string; label: string }[] = [];
    const base = new Date(2026, 5, 1);
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      out.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: meses[d.getMonth()] });
    }
    return out;
  }
}
