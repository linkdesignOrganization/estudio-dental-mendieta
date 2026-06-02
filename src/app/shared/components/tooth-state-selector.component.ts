import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ToothState } from '../../core/models/models';
import { STATE_META } from './odontogram.component';

/**
 * tooth-state-selector (DC-077). Grupo de radio-cards, cada una con chip de color
 * pastel del estado + label. Opción actual marcada (fondo tintado + borde acentuado).
 * NO dropdown denso — opciones visibles y tocables. role="radiogroup" + aria-checked.
 */
@Component({
  selector: 'app-tooth-state-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tss" role="radiogroup" aria-label="Estado de la pieza">
      @for (s of options; track s.key) {
        <button type="button" class="tss__opt" role="radio" [attr.aria-checked]="value() === s.key"
                [class.is-selected]="value() === s.key" (click)="change.emit(s.key)">
          <span class="tss__swatch" [attr.data-state]="s.key"></span>
          <span class="tss__label t-body">{{ s.label }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .tss { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); }
    .tss__opt {
      display: flex; align-items: center; gap: var(--space-3); min-height: 44px;
      padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md);
      background: var(--color-bg-elevated); cursor: pointer; text-align: left;
      transition: background-color var(--motion-fast) var(--motion-ease), border-color var(--motion-fast) var(--motion-ease);
    }
    .tss__opt:hover { background: var(--color-accent-tint); }
    .tss__opt.is-selected { background: var(--color-accent-tint); border-color: var(--color-accent); }
    .tss__opt:focus-visible { box-shadow: var(--focus-ring); outline: none; }
    .tss__swatch { width: 18px; height: 18px; border-radius: 5px; border: 1px solid var(--color-border); flex: 0 0 auto; }
    .tss__swatch[data-state="sana"] { background: var(--color-bg-elevated); }
    .tss__swatch[data-state="caries"] { background: var(--color-warning-bg); }
    .tss__swatch[data-state="obturacion"] { background: var(--color-info-bg); }
    .tss__swatch[data-state="en-tratamiento"] { background: var(--color-accent-tint); border-color: var(--color-accent); }
    .tss__swatch[data-state="protesis"] { background: var(--color-neutral-bg); }
    .tss__swatch[data-state="ausente"] { background: repeating-linear-gradient(45deg, #f3f3f6, #f3f3f6 2px, #e8e8ee 2px, #e8e8ee 4px); border-style: dashed; }
    .tss__label { color: var(--color-text); }
    @media (max-width: 767px) { .tss { grid-template-columns: 1fr 1fr; } }
  `],
})
export class ToothStateSelectorComponent {
  readonly value = input<ToothState>('sana');
  readonly change = output<ToothState>();

  protected readonly options = (Object.keys(STATE_META) as ToothState[]).map((key) => ({ key, label: STATE_META[key].label }));
}
