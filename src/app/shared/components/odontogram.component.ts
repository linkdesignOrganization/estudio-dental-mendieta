import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { IconComponent } from './icon.component';
import { Tooth, ToothState } from '../../core/models/models';

interface StateMeta { label: string; tone: string; }
const STATE_META: Record<ToothState, StateMeta> = {
  'sana': { label: 'Sana', tone: 'sana' },
  'caries': { label: 'Caries', tone: 'caries' },
  'obturacion': { label: 'Obturación', tone: 'obturacion' },
  'ausente': { label: 'Ausente', tone: 'ausente' },
  'en-tratamiento': { label: 'En tratamiento', tone: 'en-tratamiento' },
  'protesis': { label: 'Prótesis', tone: 'protesis' },
};

/**
 * odontogram (DEMO-010 / DC-076). 32 piezas FDI (superior cuadrantes 1-2 / inferior
 * 3-4 distinguidas por eje sutil). Cada pieza = forma sobre superficie blanca,
 * contorno tenue. 6 estados con color/chip pastel + ícono/patrón (no solo color).
 * Leyenda siempre visible. Cada pieza clickeable → detalle, aria-label completo,
 * focus ring de teclado.
 */
@Component({
  selector: 'app-odontogram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="odo">
      <div class="odo__arcade">
        <span class="odo__arcade-label t-small t-secondary">Arcada superior</span>
        <div class="odo__row">
          @for (t of top(); track t.fdi) {
            <button type="button" class="tooth" [attr.data-state]="t.estado"
                    [attr.aria-label]="ariaFor(t)" (click)="select.emit(t)">
              <span class="tooth__crown" aria-hidden="true">
                @if (t.estado === 'ausente') { <span class="tooth__absent"><app-icon name="x" [size]="14" /></span> }
                @else if (t.estado === 'protesis') { <span class="tooth__mark"><app-icon name="shield-check" [size]="12" /></span> }
                @else if (t.estado === 'caries') { <span class="tooth__spot"></span> }
                @else if (t.estado === 'obturacion') { <span class="tooth__fill-mark"></span> }
                @else if (t.estado === 'en-tratamiento') { <span class="tooth__mark"><app-icon name="tooth" [size]="12" /></span> }
              </span>
              <span class="tooth__num t-small">{{ t.fdi }}</span>
            </button>
          }
        </div>
      </div>

      <hr class="odo__axis" />

      <div class="odo__arcade">
        <div class="odo__row">
          @for (t of bottom(); track t.fdi) {
            <button type="button" class="tooth tooth--bottom" [attr.data-state]="t.estado"
                    [attr.aria-label]="ariaFor(t)" (click)="select.emit(t)">
              <span class="tooth__num t-small">{{ t.fdi }}</span>
              <span class="tooth__crown" aria-hidden="true">
                @if (t.estado === 'ausente') { <span class="tooth__absent"><app-icon name="x" [size]="14" /></span> }
                @else if (t.estado === 'protesis') { <span class="tooth__mark"><app-icon name="shield-check" [size]="12" /></span> }
                @else if (t.estado === 'caries') { <span class="tooth__spot"></span> }
                @else if (t.estado === 'obturacion') { <span class="tooth__fill-mark"></span> }
                @else if (t.estado === 'en-tratamiento') { <span class="tooth__mark"><app-icon name="tooth" [size]="12" /></span> }
              </span>
            </button>
          }
        </div>
      </div>

      <div class="odo__legend" role="list" aria-label="Referencia de estados">
        @for (s of legend; track s.key) {
          <span class="legend-item" role="listitem">
            <span class="legend-swatch" [attr.data-state]="s.key"></span>
            <span class="t-small">{{ s.label }}</span>
          </span>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .odo { display: flex; flex-direction: column; gap: var(--space-4); }
    .odo__arcade { display: flex; flex-direction: column; gap: var(--space-2); }
    .odo__arcade-label { padding-left: var(--space-1); }
    .odo__row { display: grid; grid-template-columns: repeat(16, 1fr); gap: var(--space-2); }
    .odo__axis { width: 100%; height: 1px; background: var(--color-border); border: none; margin: var(--space-1) 0; }
    .tooth {
      display: flex; flex-direction: column; align-items: center; gap: var(--space-1);
      padding: var(--space-1); border: none; background: transparent; cursor: pointer;
      border-radius: var(--radius-sm); transition: transform var(--motion-fast) var(--motion-ease), background-color var(--motion-fast) var(--motion-ease);
    }
    .tooth:hover { background: var(--color-accent-tint); transform: translateY(-1px); }
    .tooth:focus-visible { box-shadow: var(--focus-ring); outline: none; }
    .tooth__crown {
      position: relative; width: 100%; aspect-ratio: 1; max-width: 34px;
      border: 1px solid var(--color-border); border-radius: 7px 7px 9px 9px;
      background: var(--color-bg-elevated); display: flex; align-items: center; justify-content: center;
    }
    .tooth__num { color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
    .tooth__spot { width: 9px; height: 9px; border-radius: 50%; background: var(--color-warning-text); opacity: 0.85; }
    .tooth__fill-mark { width: 12px; height: 12px; border-radius: 3px; background: var(--color-info-text); opacity: 0.85; }
    .tooth__mark { color: var(--color-accent-deep); display: inline-flex; }
    .tooth__absent { color: var(--color-neutral-text); display: inline-flex; }
    /* estados: tinte de fondo del crown (color + patrón/ícono, no solo color) */
    .tooth[data-state="caries"] .tooth__crown { background: var(--color-warning-bg); border-color: color-mix(in srgb, var(--color-warning-text) 30%, transparent); }
    .tooth[data-state="obturacion"] .tooth__crown { background: var(--color-info-bg); border-color: color-mix(in srgb, var(--color-info-text) 30%, transparent); }
    .tooth[data-state="en-tratamiento"] .tooth__crown { background: var(--color-accent-tint); border-color: var(--color-accent); }
    .tooth[data-state="protesis"] .tooth__crown { background: var(--color-neutral-bg); border-color: color-mix(in srgb, var(--color-neutral-text) 30%, transparent); }
    .tooth[data-state="ausente"] .tooth__crown { background: repeating-linear-gradient(45deg, #f3f3f6, #f3f3f6 3px, #e8e8ee 3px, #e8e8ee 6px); border-style: dashed; }
    .odo__legend { display: flex; flex-wrap: wrap; gap: var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--color-border); }
    .legend-item { display: inline-flex; align-items: center; gap: var(--space-2); }
    .legend-swatch { width: 16px; height: 16px; border-radius: 4px; border: 1px solid var(--color-border); }
    .legend-swatch[data-state="sana"] { background: var(--color-bg-elevated); }
    .legend-swatch[data-state="caries"] { background: var(--color-warning-bg); }
    .legend-swatch[data-state="obturacion"] { background: var(--color-info-bg); }
    .legend-swatch[data-state="en-tratamiento"] { background: var(--color-accent-tint); border-color: var(--color-accent); }
    .legend-swatch[data-state="protesis"] { background: var(--color-neutral-bg); }
    .legend-swatch[data-state="ausente"] { background: repeating-linear-gradient(45deg, #f3f3f6, #f3f3f6 2px, #e8e8ee 2px, #e8e8ee 4px); border-style: dashed; }
    @media (max-width: 767px) {
      .odo__row { grid-template-columns: repeat(8, 1fr); gap: var(--space-1); }
      .tooth__crown { max-width: none; }
      /* Pieza editable: hit-area vertical ≥44px en mobile (DC-086 / DC-088). El
         ancho lo gobierna la grilla de 8 columnas para NO provocar scroll horizontal
         (DC-086: piezas legibles sin scroll horizontal que rompa el layout). */
      .tooth { min-height: var(--touch-target-min); justify-content: center; }
    }
  `],
})
export class OdontogramComponent {
  readonly top = input<Tooth[]>([]);
  readonly bottom = input<Tooth[]>([]);
  readonly select = output<Tooth>();

  protected readonly legend = (Object.keys(STATE_META) as ToothState[]).map((key) => ({ key, label: STATE_META[key].label }));

  protected ariaFor(t: Tooth): string {
    return `Pieza ${t.fdi} (universal ${t.universal}), ${STATE_META[t.estado].label}`;
  }
}

export { STATE_META };
