import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { IconComponent } from './icon.component';
import { Kpi } from '../../core/models/models';

/**
 * kpi-card (DC-061, Patrón 3). Valor/número grande display peso 500 color azul
 * profundo + label gris + anillo/gauge opcional (% centrado + marcadores 0/100)
 * cuando es porcentual. Clickeable → reporte. Hover refuerza el valor.
 */
@Component({
  selector: 'app-kpi-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <article class="surface-card is-clickable kpi">
      <div class="kpi__head">
        <span class="kpi__glyph"><app-icon [name]="kpi().icono" [size]="20" /></span>
        <span class="kpi__label t-small t-secondary">{{ kpi().label }}</span>
      </div>

      <div class="kpi__body">
        <div class="kpi__value-wrap">
          <span class="kpi__value t-display">{{ kpi().valor }}</span>
          <span class="kpi__detail t-small t-secondary">{{ kpi().detalle }}</span>
        </div>

        @if (kpi().porcentaje != null) {
          <div class="kpi__gauge" aria-hidden="true">
            <svg viewBox="0 0 72 72" width="72" height="72">
              <circle class="kpi__track" cx="36" cy="36" r="30" />
              <circle class="kpi__arc" cx="36" cy="36" r="30"
                      [attr.stroke-dasharray]="circumference"
                      [attr.stroke-dashoffset]="dashOffset()"
                      transform="rotate(-90 36 36)" />
            </svg>
            <span class="kpi__gauge-num t-body-medium">{{ kpi().porcentaje }}%</span>
          </div>
        }
      </div>
    </article>
  `,
  styles: [`
    :host { display: block; }
    .kpi { display: flex; flex-direction: column; gap: var(--space-4); min-height: 148px; }
    .kpi__head { display: flex; align-items: center; gap: var(--space-2); }
    .kpi__glyph {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      background: var(--color-accent-tint); color: var(--color-accent-deep);
    }
    .kpi__body { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
    .kpi__value-wrap { display: flex; flex-direction: column; gap: var(--space-1); min-width: 0; }
    .kpi__value { color: var(--color-accent-deep); line-height: 1.1; transition: transform var(--motion-fast) var(--motion-ease); }
    .kpi.is-clickable:hover .kpi__value { transform: translateX(1px); }
    .kpi__gauge { position: relative; flex: 0 0 auto; width: 72px; height: 72px; }
    .kpi__track { fill: none; stroke: var(--color-accent-sky); stroke-width: 7; }
    .kpi__arc { fill: none; stroke: var(--color-accent); stroke-width: 7; stroke-linecap: round; transition: stroke-dashoffset var(--motion-slow) var(--motion-ease); }
    .kpi__gauge-num { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--color-accent-deep); }
  `],
})
export class KpiCardComponent {
  readonly kpi = input.required<Kpi>();
  protected readonly circumference = 2 * Math.PI * 30;
  protected readonly dashOffset = computed(() => {
    const pct = this.kpi().porcentaje ?? 0;
    return this.circumference * (1 - pct / 100);
  });
}
