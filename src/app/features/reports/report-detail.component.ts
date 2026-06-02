import { Component, ChangeDetectionStrategy, inject, computed, signal, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconComponent } from '../../shared/components/icon.component';
import { MiniChartComponent } from '../../shared/components/mini-chart.component';
import { SkeletonComponent } from '../../shared/components/skeleton.component';
import { StoreService } from '../../core/persistence/store.service';

type ChartType = 'bar' | 'hbar' | 'line' | 'donut';
type ValueFormat = 'count' | 'ars';
interface ChartCard {
  titulo: string;
  type: ChartType;
  values: number[];
  labels: string[];
  nota: string;
  valueFormat?: ValueFormat;
}
type ReportData = NonNullable<ReturnType<StoreService['reportData']>>;

/**
 * Reportes detallados (DEMO-018 / DC-049/119). Cards aireadas separadas, 1 métrica
 * por card (pacientes 4 / tratamientos 3 / financiero 3 / productividad 3).
 * Gráfico sin datos → "Sin datos suficientes para este gráfico." Montos ARS en financiero.
 */
@Component({
  selector: 'app-report-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, MiniChartComponent, SkeletonComponent],
  template: `
    <div class="page-head">
      <div class="page-head__titles">
        <a class="back-link t-small" routerLink="/reportes"><app-icon name="arrow-left" [size]="16" /> Reportes</a>
        <h2 class="t-display">{{ titulo() }}</h2>
        <span class="page-head__subtitle">{{ subtitulo() }}</span>
      </div>
    </div>

    @if (loading()) {
      <div class="charts" aria-busy="true" aria-label="Cargando reporte">
        @for (i of [0,1,2,3]; track i) {
          <article class="surface-card chart-card">
            <app-skeleton preset="line" width="55%" [index]="i" />
            <app-skeleton preset="block" height="160px" [index]="i" />
          </article>
        }
      </div>
    } @else {
      <div class="charts edm-stagger">
        @for (c of charts(); track c.titulo; let i = $index) {
          <article class="surface-card chart-card edm-rise-in" [style.animation-delay]="i * 50 + 'ms'">
            <header class="chart-card__head">
              <h3 class="t-title">{{ c.titulo }}</h3>
              <span class="t-small t-secondary">{{ c.nota }}</span>
            </header>
            @if (c.values.length) {
              <app-mini-chart [type]="c.type" [values]="c.values" [labels]="c.labels"
                              [valueFormat]="c.valueFormat ?? 'count'" [caption]="c.titulo" />
            } @else {
              <p class="chart-card__empty t-body t-secondary">Sin datos suficientes para este gráfico.</p>
            }
          </article>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .back-link { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-accent-deep); margin-bottom: var(--space-1); }
    .back-link:hover { text-decoration: underline; }
    .charts { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-5); }
    .chart-card { display: flex; flex-direction: column; gap: var(--space-5); }
    .chart-card__head { display: flex; flex-direction: column; gap: 2px; }
    .chart-card__empty { padding: var(--space-8) 0; text-align: center; }
    .edm-rise-in { animation: edm-rise 320ms var(--motion-ease) both; }
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

  /**
   * Estado de carga del reporte (REQ-246). Muestra skeletons brevemente al entrar y al
   * cambiar de reporte (el effect re-arma el timer cuando cambia la key), nunca un spinner.
   */
  protected readonly loading = signal(true);

  constructor() {
    effect((onCleanup) => {
      this.key(); // re-ejecuta al cambiar de reporte
      this.loading.set(true);
      const t = setTimeout(() => this.loading.set(false), 450);
      onCleanup(() => clearTimeout(t));
    });
  }

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

  /** REQ-237: nuevos en el tiempo · distribución por obra social · por edad · por género · ranking profesionales. */
  private chartsPacientes(d: ReportData): ChartCard[] {
    const total = d.patients.length;
    // distribución por edad
    const bandas = [0, 0, 0, 0, 0]; // 0-17, 18-29, 30-49, 50-69, 70+
    for (const p of d.patients) {
      if (p.edad <= 17) bandas[0]++;
      else if (p.edad <= 29) bandas[1]++;
      else if (p.edad <= 49) bandas[2]++;
      else if (p.edad <= 69) bandas[3]++;
      else bandas[4]++;
    }
    // por género
    const mujeres = d.patients.filter((p) => p.genero === 'mujer').length;
    const hombres = d.patients.filter((p) => p.genero === 'hombre').length;
    // por obra social (ranking horizontal — labels largos)
    const osRank = rankBy(d.obrasSociales, (o) => o.nombre, (o) => d.patients.filter((p) => p.obraSocialId === o.id).length);
    // ranking de profesionales por nº de pacientes de cabecera
    const profRank = rankBy(d.professionals, (pr) => shortName(pr.nombre), (pr) => d.patients.filter((p) => p.profesionalId === pr.id).length);
    // nuevos por mes (últimos 6 meses desde TODAY)
    const meses = this.lastMonths(6);
    const nuevos = meses.map((m) => d.patients.filter((p) => p.altaFecha.startsWith(m.key)).length);
    return [
      { titulo: 'Pacientes nuevos por mes', type: 'line', values: nuevos, labels: meses.map((m) => m.label), nota: 'Altas en los últimos 6 meses' },
      { titulo: 'Distribución por edad', type: 'bar', values: bandas, labels: ['0-17', '18-29', '30-49', '50-69', '70+'], nota: `${total} pacientes` },
      { titulo: 'Distribución por género', type: 'bar', values: [mujeres, hombres], labels: ['Mujeres', 'Hombres'], nota: `${total} pacientes` },
      { titulo: 'Pacientes por obra social', type: 'hbar', values: osRank.values, labels: osRank.labels, nota: `${d.obrasSociales.length} obras sociales` },
      { titulo: 'Pacientes por profesional', type: 'hbar', values: profRank.values, labels: profRank.labels, nota: 'Ranking de profesionales' },
    ];
  }

  /** REQ-239: tipos más realizados · tasa de finalización · duración promedio. */
  private chartsTratamientos(d: ReportData): ChartCard[] {
    const estados = ['en-curso', 'atrasado', 'en-pausa', 'completado'];
    const estValues = estados.map((e) => d.treatmentPlans.filter((t) => t.estado === e).length);
    // tipos más frecuentes (ranking horizontal por cantidad de planes)
    const porTipo = new Map<string, number>();
    for (const t of d.treatmentPlans) porTipo.set(t.tipoId, (porTipo.get(t.tipoId) ?? 0) + 1);
    const top = [...porTipo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    const tipoLabels = top.map(([id]) => firstWords(d.treatmentTypes.find((x) => x.id === id)?.nombre, 2));
    const tipoValues = top.map(([, n]) => n);
    const total = d.treatmentPlans.length;
    const completados = d.treatmentPlans.filter((t) => t.estado === 'completado').length;
    const tasa = total ? Math.round((completados / total) * 100) : 0;
    // duración promedio (días) por tipo: completados ⇒ inicio→hoy; resto ⇒ tiempo transcurrido
    const durRank = this.duracionPromedioPorTipo(d).slice(0, 6);
    return [
      { titulo: 'Tratamientos por estado', type: 'bar', values: estValues, labels: ['En curso', 'Atrasado', 'En pausa', 'Completado'], nota: 'Estado actual' },
      { titulo: 'Tipos más realizados', type: 'hbar', values: tipoValues, labels: tipoLabels, nota: 'Por cantidad de planes' },
      { titulo: 'Duración promedio por tipo', type: 'hbar', values: durRank.map((x) => x.dias), labels: durRank.map((x) => x.nombre), nota: 'Días promedio de tratamiento' },
      { titulo: 'Tasa de finalización', type: 'donut', values: [tasa], labels: [], nota: 'De los planes registrados' },
    ];
  }

  /** REQ-241: ingresos por mes · facturación por obra social · deuda por antigüedad. */
  private chartsFinanciero(d: ReportData): ChartCard[] {
    const meses = this.lastMonths(6);
    const factPorMes = meses.map((m) =>
      d.invoices.filter((i) => i.fechaEmision.startsWith(m.key) && i.estado !== 'anulada').reduce((s, i) => s + i.total, 0),
    );
    const facturado = d.invoices.filter((i) => i.estado !== 'anulada').reduce((s, i) => s + i.total, 0);
    const cobrado = d.movements.filter((m) => m.signo === 'pago').reduce((s, m) => s + m.monto, 0);
    const tasaCobranza = facturado ? Math.min(100, Math.round((cobrado / facturado) * 100)) : 0;
    // facturación por obra social (de las facturas con obra social asignada)
    const osFact = rankBy(d.obrasSociales, (o) => o.nombre, (o) => d.invoices.filter((i) => i.obraSocialId === o.id && i.estado !== 'anulada').reduce((s, i) => s + i.total, 0));
    // deuda por antigüedad (saldos vencidos agrupados por tramo de días desde el cargo)
    const aging = this.deudaPorAntiguedad(d);
    return [
      { titulo: 'Ingresos facturados por mes', type: 'line', values: factPorMes, labels: meses.map((m) => m.label), nota: 'Pesos facturados (últimos 6 meses)' },
      { titulo: 'Facturación por obra social', type: 'hbar', values: osFact.values, labels: osFact.labels, nota: 'Total facturado', valueFormat: 'ars' },
      { titulo: 'Deuda por antigüedad', type: 'bar', values: aging, labels: ['0-30 d', '31-60 d', '61-90 d', '+90 d'], nota: 'Saldo pendiente por tramo', valueFormat: 'ars' },
      { titulo: 'Cobranzas vs facturado', type: 'bar', values: [facturado, cobrado], labels: ['Facturado', 'Cobrado'], nota: 'Total acumulado', valueFormat: 'ars' },
      { titulo: 'Tasa de cobranza', type: 'donut', values: [tasaCobranza], labels: [], nota: 'De lo facturado' },
    ];
  }

  /** REQ-243: producción por profesional · atendidos vs cancelados · tasa de presentación. */
  private chartsProductividad(d: ReportData): ChartCard[] {
    const profRank = rankBy(d.professionals, (p) => shortName(p.nombre), (p) => d.appointments.filter((a) => a.profesionalId === p.id).length);
    const atendidos = d.appointments.filter((a) => a.estado === 'terminado').length;
    const cancelados = d.appointments.filter((a) => a.estado === 'cancelado').length;
    // tasa de presentación = atendidos / (atendidos + cancelados) — del histórico cerrado
    const cerrados = atendidos + cancelados;
    const tasaPresentacion = cerrados ? Math.round((atendidos / cerrados) * 100) : 0;
    return [
      { titulo: 'Producción por profesional', type: 'hbar', values: profRank.values, labels: profRank.labels, nota: 'Turnos totales por profesional' },
      { titulo: 'Atendidos vs cancelados', type: 'bar', values: [atendidos, cancelados], labels: ['Atendidos', 'Cancelados'], nota: 'Sobre el histórico de turnos' },
      { titulo: 'Tasa de presentación', type: 'donut', values: [tasaPresentacion], labels: [], nota: 'Atendidos sobre turnos cerrados' },
    ];
  }

  /** Duración promedio (días) por tipo de tratamiento, derivada de inicioFecha al estado actual. */
  private duracionPromedioPorTipo(d: ReportData): { nombre: string; dias: number }[] {
    const acc = new Map<string, { suma: number; n: number }>();
    const hoy = new Date(2026, 5, 1).getTime();
    for (const t of d.treatmentPlans) {
      const ini = parseIso(t.inicioFecha);
      if (!ini) continue;
      const dias = Math.max(1, Math.round((hoy - ini) / 86_400_000));
      const cur = acc.get(t.tipoId) ?? { suma: 0, n: 0 };
      cur.suma += dias; cur.n += 1; acc.set(t.tipoId, cur);
    }
    return [...acc.entries()]
      .map(([id, { suma, n }]) => ({ nombre: firstWords(d.treatmentTypes.find((x) => x.id === id)?.nombre, 2), dias: Math.round(suma / n) }))
      .sort((a, b) => b.dias - a.dias);
  }

  /** Deuda agrupada por antigüedad del cargo impago (FIFO: los pagos saldan los cargos más viejos). */
  private deudaPorAntiguedad(d: ReportData): number[] {
    const hoy = new Date(2026, 5, 1).getTime();
    const tramos = [0, 0, 0, 0]; // 0-30, 31-60, 61-90, +90
    const porPaciente = new Map<string, typeof d.movements>();
    for (const m of d.movements) {
      const arr = porPaciente.get(m.pacienteId) ?? [];
      arr.push(m); porPaciente.set(m.pacienteId, arr);
    }
    for (const movs of porPaciente.values()) {
      const cargos = movs.filter((m) => m.signo === 'cargo').sort((a, b) => a.fecha.localeCompare(b.fecha));
      let pagos = movs.filter((m) => m.signo === 'pago').reduce((s, m) => s + m.monto, 0);
      for (const c of cargos) {
        let pendiente = c.monto;
        if (pagos > 0) { const aplica = Math.min(pagos, pendiente); pendiente -= aplica; pagos -= aplica; }
        if (pendiente <= 0) continue;
        const ini = parseIso(c.fecha);
        const dias = ini ? Math.floor((hoy - ini) / 86_400_000) : 0;
        if (dias <= 30) tramos[0] += pendiente;
        else if (dias <= 60) tramos[1] += pendiente;
        else if (dias <= 90) tramos[2] += pendiente;
        else tramos[3] += pendiente;
      }
    }
    return tramos.map((v) => Math.round(v));
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

/**
 * Ranking ya partido en {labels, values} para alimentar un hbar: mapea cada entidad a su
 * etiqueta y su valor, descarta los ceros y ordena de mayor a menor. Centraliza el patrón
 * que comparten los rankings de obras sociales y profesionales en los 4 reportes.
 */
function rankBy<T>(items: readonly T[], label: (x: T) => string, value: (x: T) => number): { labels: string[]; values: number[] } {
  const rows = items
    .map((x) => ({ label: label(x), value: value(x) }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
  return { labels: rows.map((r) => r.label), values: rows.map((r) => r.value) };
}

/** Apellido (última palabra) del nombre completo, para etiquetas compactas de ranking. */
function shortName(nombre: string): string {
  const parts = nombre.trim().split(/\s+/);
  return parts.length ? parts[parts.length - 1] : nombre;
}
/** Primeras `n` palabras de un nombre (etiqueta de tipo de tratamiento sin recortar a 1 palabra). */
function firstWords(nombre: string | undefined, n: number): string {
  if (!nombre) return '—';
  return nombre.trim().split(/\s+/).slice(0, n).join(' ');
}
/** Parsea una fecha ISO "yyyy-mm-dd" a epoch ms (mediodía local, evita saltos de huso). */
function parseIso(iso: string): number | null {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 12).getTime();
}
