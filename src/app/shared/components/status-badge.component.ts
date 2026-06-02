import { Component, ChangeDetectionStrategy, input } from '@angular/core';

type Tone = 'success' | 'error' | 'warning' | 'info' | 'neutral';

/**
 * status-badge (DC-053 / BVC-018). Pill pastel: fondo --color-{tone}-bg + texto/dot
 * --color-{tone}-text, radius suave, padding 8/4, texto cuerpo peso 500.
 * Color NUNCA único portador → siempre texto + dot. No interactivo.
 * `label` es el texto; `tone` el hue semántico (mapeado por los callers).
 */
@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [attr.data-tone]="tone()">
      <span class="badge__dot" aria-hidden="true"></span>
      <span class="badge__label">{{ label() }}</span>
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .badge {
      display: inline-flex; align-items: center; gap: var(--space-2);
      padding: 4px 10px; border-radius: var(--radius-sm);
      font-family: var(--font-body); font-size: var(--text-small); font-weight: var(--weight-medium);
      line-height: 1.3; white-space: nowrap;
    }
    .badge__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: 0 0 auto; opacity: 0.85; }
    .badge[data-tone="success"] { background: var(--color-success-bg); color: var(--color-success-text); }
    .badge[data-tone="error"]   { background: var(--color-error-bg);   color: var(--color-error-text); }
    .badge[data-tone="warning"] { background: var(--color-warning-bg); color: var(--color-warning-text); }
    .badge[data-tone="info"]    { background: var(--color-info-bg);    color: var(--color-info-text); }
    .badge[data-tone="neutral"] { background: var(--color-neutral-bg); color: var(--color-neutral-text); }
  `],
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly tone = input<Tone>('neutral');
}
