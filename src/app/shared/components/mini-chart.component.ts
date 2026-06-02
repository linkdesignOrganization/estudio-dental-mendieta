import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

/**
 * mini-chart — visualización ESTÁTICA (SVG/CSS, sin librería) para la cáscara de
 * Reportes (DC-049/119). El Developer (4b) cablea la librería de charts real en el
 * módulo reports vía lazy. Aquí: bar | line | donut con datos placeholder, legibles
 * y dentro de la paleta azul. aria-label describe la métrica; sin scroll horizontal.
 */
@Component({
  selector: 'app-mini-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="mc" [attr.aria-label]="caption()">
      @switch (type()) {
        @case ('bar') {
          <div class="mc__bars">
            @for (v of values(); track $index) {
              <div class="mc__bar-col">
                <span class="mc__bar" [style.height.%]="pct(v)"></span>
                <span class="mc__bar-label t-small t-secondary">{{ labelAt($index) }}</span>
              </div>
            }
          </div>
        }
        @case ('line') {
          <svg class="mc__line" viewBox="0 0 300 140" preserveAspectRatio="none" role="img">
            <polyline class="mc__line-area" [attr.points]="areaPoints()" />
            <polyline class="mc__line-path" [attr.points]="linePoints()" />
          </svg>
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
    .mc__bars { display: flex; align-items: flex-end; gap: var(--space-3); height: 140px; }
    .mc__bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--space-2); height: 100%; justify-content: flex-end; }
    .mc__bar { display: block; width: 100%; max-width: 36px; border-radius: var(--radius-sm) var(--radius-sm) 0 0; background: var(--color-accent); min-height: 6px; transition: height var(--motion-slow) var(--motion-ease); }
    .mc__bar-col:nth-child(even) .mc__bar { background: var(--color-accent-sky); }
    .mc__bar-label { white-space: nowrap; }
    .mc__line { width: 100%; height: 140px; }
    .mc__line-path { fill: none; stroke: var(--color-accent); stroke-width: 2.5; vector-effect: non-scaling-stroke; }
    .mc__line-area { fill: var(--color-accent-tint); stroke: none; }
    .mc__donut { position: relative; width: 160px; height: 160px; margin: 0 auto; }
    .mc__donut-track { fill: none; stroke: var(--color-accent-sky); stroke-width: 12; }
    .mc__donut-arc { fill: none; stroke: var(--color-accent); stroke-width: 12; stroke-linecap: round; }
    .mc__donut-num { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--color-accent-deep); }
  `],
})
export class MiniChartComponent {
  readonly type = input<'bar' | 'line' | 'donut'>('bar');
  readonly values = input<number[]>([]);
  readonly labels = input<string[]>([]);
  readonly caption = input<string>('Gráfico');

  protected readonly donutCirc = 2 * Math.PI * 46;
  protected readonly donutOffset = computed(() => this.donutCirc * (1 - (this.values()[0] ?? 0) / 100));

  protected pct(v: number): number {
    const max = Math.max(...this.values(), 1);
    return Math.round((v / max) * 100);
  }
  protected labelAt(i: number): string { return this.labels()[i] ?? ''; }

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
