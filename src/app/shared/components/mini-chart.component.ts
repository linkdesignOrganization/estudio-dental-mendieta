import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

type ChartType = 'bar' | 'hbar' | 'line' | 'donut';
type ValueFormat = 'count' | 'ars';

/**
 * mini-chart — visualización de Reportes 100% SVG/CSS, SIN librería de charting
 * (DC-049/119). Decisión de stack: bar/hbar/line/donut cubren todas las métricas de los
 * 4 reportes con cero dependencias → no suma nada al bundle (el budget inicial queda
 * holgado y el chunk de reportes es lazy). Todo respeta la paleta azul y los tokens; cada
 * gráfico lleva aria-label/role. Los datos los CALCULA el report-detail desde el estado.
 *
 * Tipos:
 *  - bar   : barras verticales (categorías cortas: edades, estados, días).
 *  - hbar  : barras horizontales con label + valor a la derecha (ranking; labels largos
 *            como nombres de profesional u obra social → sin recorte ni scroll).
 *  - line  : serie temporal (facturación/altas por mes).
 *  - donut  : un porcentaje (tasas de finalización/cobranza/presentación).
 */
@Component({
  selector: 'app-mini-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="mc" role="img" [attr.aria-label]="ariaLabel()">
      @switch (type()) {
        @case ('bar') {
          <div class="mc__bars">
            @for (v of values(); track $index) {
              <div class="mc__bar-col">
                <span class="mc__bar-val t-small">{{ fmt(v) }}</span>
                <span class="mc__bar" [style.height.%]="pct(v)"></span>
                <span class="mc__bar-label t-small t-secondary">{{ labelAt($index) }}</span>
              </div>
            }
          </div>
        }
        @case ('hbar') {
          <ul class="mc__hbars">
            @for (v of values(); track $index) {
              <li class="mc__hrow">
                <span class="mc__hlabel t-small">{{ labelAt($index) }}</span>
                <span class="mc__htrack"><span class="mc__hfill" [style.width.%]="pct(v)"></span></span>
                <span class="mc__hval t-small t-secondary">{{ fmt(v) }}</span>
              </li>
            }
          </ul>
        }
        @case ('line') {
          <div class="mc__linewrap">
            <svg class="mc__line" viewBox="0 0 300 140" preserveAspectRatio="none">
              <polyline class="mc__line-area" [attr.points]="areaPoints()" />
              <polyline class="mc__line-path" [attr.points]="linePoints()" />
            </svg>
            <div class="mc__line-labels">
              @for (l of labels(); track $index) { <span class="mc__line-label t-small t-secondary">{{ l }}</span> }
            </div>
          </div>
        }
        @case ('donut') {
          <div class="mc__donut">
            <svg viewBox="0 0 120 120" width="160" height="160">
              <circle class="mc__donut-track" cx="60" cy="60" r="46" />
              <circle class="mc__donut-arc" cx="60" cy="60" r="46"
                      [attr.stroke-dasharray]="donutCirc"
                      [attr.stroke-dashoffset]="donutOffset()"
                      transform="rotate(-90 60 60)" />
            </svg>
            <span class="mc__donut-num t-display">{{ values()[0] }}%</span>
          </div>
        }
      }
    </figure>
  `,
  styles: [`
    :host { display: block; }
    .mc { margin: 0; }
    /* barras verticales */
    .mc__bars { display: flex; align-items: flex-end; gap: var(--space-3); height: 160px; }
    .mc__bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--space-1); height: 100%; justify-content: flex-end; }
    .mc__bar-val { color: var(--color-text-secondary); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .mc__bar { display: block; width: 100%; max-width: 40px; border-radius: var(--radius-sm) var(--radius-sm) 0 0; background: var(--color-accent); min-height: 4px; transition: height var(--motion-slow) var(--motion-ease); }
    .mc__bar-col:nth-child(even) .mc__bar { background: var(--color-accent-sky); }
    .mc__bar-label { white-space: nowrap; text-align: center; }
    /* barras horizontales (ranking) */
    .mc__hbars { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-3); }
    .mc__hrow { display: grid; grid-template-columns: minmax(72px, 0.9fr) 2fr auto; align-items: center; gap: var(--space-3); }
    .mc__hlabel { color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mc__htrack { height: 12px; border-radius: var(--radius-sm); background: var(--color-accent-tint); overflow: hidden; }
    .mc__hfill { display: block; height: 100%; border-radius: var(--radius-sm); background: var(--color-accent); min-width: 4px; transition: width var(--motion-slow) var(--motion-ease); }
    .mc__hval { color: var(--color-text-secondary); font-variant-numeric: tabular-nums; white-space: nowrap; text-align: right; }
    /* línea */
    .mc__linewrap { display: flex; flex-direction: column; gap: var(--space-2); }
    .mc__line { width: 100%; height: 140px; }
    .mc__line-path { fill: none; stroke: var(--color-accent); stroke-width: 2.5; vector-effect: non-scaling-stroke; }
    .mc__line-area { fill: var(--color-accent-tint); stroke: none; }
    .mc__line-labels { display: flex; justify-content: space-between; }
    .mc__line-label { white-space: nowrap; }
    /* donut */
    .mc__donut { position: relative; width: 160px; height: 160px; margin: 0 auto; }
    .mc__donut-track { fill: none; stroke: var(--color-accent-sky); stroke-width: 12; }
    .mc__donut-arc { fill: none; stroke: var(--color-accent); stroke-width: 12; stroke-linecap: round; transition: stroke-dashoffset var(--motion-slow) var(--motion-ease); }
    .mc__donut-num { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--color-accent-deep); }
    @media (prefers-reduced-motion: reduce) {
      .mc__bar, .mc__hfill, .mc__donut-arc { transition: none; }
    }
  `],
})
export class MiniChartComponent {
  readonly type = input<ChartType>('bar');
  readonly values = input<number[]>([]);
  readonly labels = input<string[]>([]);
  readonly caption = input<string>('Gráfico');
  /** formato de los valores mostrados sobre/junto a las barras. */
  readonly valueFormat = input<ValueFormat>('count');

  protected readonly donutCirc = 2 * Math.PI * 46;
  protected readonly donutOffset = computed(() => this.donutCirc * (1 - (this.values()[0] ?? 0) / 100));

  /** aria-label descriptivo: caption + cada categoría con su valor formateado (a11y, REQ-238). */
  protected readonly ariaLabel = computed(() => {
    if (this.type() === 'donut') return `${this.caption()}: ${this.values()[0] ?? 0}%`;
    const parts = this.values().map((v, i) => `${this.labelAt(i) || '—'}: ${this.fmt(v)}`);
    return parts.length ? `${this.caption()}. ${parts.join('; ')}` : this.caption();
  });

  protected pct(v: number): number {
    const max = Math.max(...this.values(), 1);
    return Math.round((v / max) * 100);
  }
  protected labelAt(i: number): string { return this.labels()[i] ?? ''; }

  /** Formatea el valor de una barra según valueFormat (cuenta · ARS). */
  protected fmt(v: number): string {
    return this.valueFormat() === 'ars' ? formatArs(v) : String(v);
  }

  protected linePoints(): string {
    const vals = this.values();
    if (vals.length === 0) return '';
    const max = Math.max(...vals, 1);
    const stepX = 300 / Math.max(vals.length - 1, 1);
    return vals.map((v, i) => `${(i * stepX).toFixed(1)},${(130 - (v / max) * 120).toFixed(1)}`).join(' ');
  }
  protected areaPoints(): string {
    const line = this.linePoints();
    if (!line) return '';
    return `0,140 ${line} 300,140`;
  }
}

/** Monto ARS compacto y legible para etiquetas de gráfico ($ 1,2 M / $ 320 K / $ 8.500). */
function formatArs(value: number): string {
  if (value >= 1_000_000) return `$ ${(value / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })} M`;
  if (value >= 100_000) return `$ ${Math.round(value / 1_000)} K`;
  return `$ ${Math.round(value).toLocaleString('es-AR')}`;
}
