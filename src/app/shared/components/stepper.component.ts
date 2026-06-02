import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { IconComponent } from './icon.component';

/**
 * stepper (DC-070 / DC-085). Fila horizontal de pasos numerados: actual destacado
 * (círculo azul medio + número, label peso 500), completados (check azul profundo),
 * futuros (círculo borde, label gris), conector con tramo completado. "Paso N de M".
 * Número grande peso 500 (no bold). En mobile compacto.
 */
@Component({
  selector: 'app-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="stepper">
      <span class="stepper__count t-small t-secondary">Paso {{ current() }} de {{ steps().length }}</span>
      <ol class="stepper__list">
        @for (label of steps(); track $index; let i = $index) {
          <li class="stepper__item" [class.is-done]="i + 1 < current()" [class.is-current]="i + 1 === current()">
            <span class="stepper__bubble">
              @if (i + 1 < current()) { <app-icon name="check" [size]="16" /> }
              @else { {{ i + 1 }} }
            </span>
            <span class="stepper__label t-small">{{ label }}</span>
            @if (i < steps().length - 1) { <span class="stepper__line"></span> }
          </li>
        }
      </ol>

      <div class="stepper__bar-mobile">
        <span class="stepper__bar-fill" [style.width.%]="(current() / steps().length) * 100"></span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .stepper { display: flex; flex-direction: column; gap: var(--space-3); }
    .stepper__list { list-style: none; margin: 0; padding: 0; display: flex; }
    .stepper__item { display: flex; align-items: center; flex: 1; gap: var(--space-2); }
    .stepper__item:last-child { flex: 0 0 auto; }
    .stepper__bubble {
      display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto;
      width: 32px; height: 32px; border-radius: 50%;
      border: 1px solid var(--color-border); background: var(--color-bg-elevated);
      color: var(--color-text-secondary); font-family: var(--font-display); font-weight: var(--weight-medium); font-size: var(--text-body);
    }
    .stepper__item.is-current .stepper__bubble { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-text); }
    .stepper__item.is-done .stepper__bubble { background: var(--color-accent-deep); border-color: var(--color-accent-deep); color: #fff; }
    .stepper__label { color: var(--color-text-secondary); white-space: nowrap; }
    .stepper__item.is-current .stepper__label { color: var(--color-text); font-weight: var(--weight-medium); }
    .stepper__line { flex: 1; height: 1px; background: var(--color-border); margin: 0 var(--space-2); min-width: 16px; }
    .stepper__item.is-done .stepper__line { background: var(--color-accent); }
    .stepper__bar-mobile { display: none; height: 4px; border-radius: var(--radius-pill); background: var(--color-border); overflow: hidden; }
    .stepper__bar-fill { display: block; height: 100%; background: var(--color-accent); transition: width var(--motion-slow) var(--motion-ease); }
    @media (max-width: 767px) {
      .stepper__label { display: none; }
      .stepper__list { display: none; }
      .stepper__bar-mobile { display: block; }
    }
  `],
})
export class StepperComponent {
  readonly steps = input.required<string[]>();
  readonly current = input.required<number>();
}
