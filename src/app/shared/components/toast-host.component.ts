import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { IconComponent } from './icon.component';
import { ToastService, ToastKind } from './toast.service';

/**
 * Contenedor de toasts (DC-066/130/131/132). Esquina inferior derecha (hoja
 * inferior en mobile). Fondo blanco con borde semántico + ícono Phosphor de estado.
 * Éxito verde, error coral + "Reintentar", info azul. Entrada ease-in ≤250ms.
 */
@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="toast-host" aria-live="polite">
      @for (t of toasts(); track t.id) {
        <div class="toast" [attr.data-kind]="t.kind" [attr.role]="t.kind === 'error' ? 'alert' : 'status'">
          <span class="toast__glyph"><app-icon [name]="glyph(t.kind)" [size]="20" /></span>
          <span class="toast__msg t-body">{{ t.message }}</span>
          @if (t.persistent) {
            <button type="button" class="toast__action" (click)="svc.dismiss(t.id)">Reintentar</button>
          }
          <button type="button" class="icon-btn toast__close" aria-label="Cerrar notificación" (click)="svc.dismiss(t.id)">
            <app-icon name="x" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-host {
      position: fixed; right: var(--space-6); bottom: var(--space-6);
      display: flex; flex-direction: column; gap: var(--space-3);
      z-index: 1200; max-width: min(380px, calc(100vw - 32px));
    }
    .toast {
      display: flex; align-items: center; gap: var(--space-3);
      background: var(--color-bg-elevated); border-radius: var(--radius-md);
      box-shadow: var(--shadow-overlay); padding: var(--space-3) var(--space-4);
      border-left: 3px solid var(--color-neutral-text);
      animation: toast-in 200ms var(--motion-ease);
    }
    .toast[data-kind="success"] { border-left-color: var(--color-success-text); }
    .toast[data-kind="success"] .toast__glyph { color: var(--color-success-text); }
    .toast[data-kind="error"]   { border-left-color: var(--color-error-text); }
    .toast[data-kind="error"]   .toast__glyph { color: var(--color-error-text); }
    .toast[data-kind="info"]    { border-left-color: var(--color-info-text); }
    .toast[data-kind="info"]    .toast__glyph { color: var(--color-info-text); }
    .toast__glyph { display: inline-flex; flex: 0 0 auto; }
    .toast__msg { flex: 1; color: var(--color-text); }
    .toast__action {
      background: transparent; border: none; cursor: pointer;
      color: var(--color-accent-deep); font-family: var(--font-body);
      font-weight: var(--weight-medium); font-size: var(--text-small); padding: 0 var(--space-2);
    }
    .toast__action:hover { text-decoration: underline; }
    .toast__close { width: 32px; height: 32px; min-width: 32px; }
    @keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @media (prefers-reduced-motion: reduce) { .toast { animation: none; } }
    @media (max-width: 767px) {
      .toast-host { left: var(--space-4); right: var(--space-4); bottom: var(--space-4); max-width: none; }
      /* El botón cerrar (icon-btn) recupera el hit-area ≥44px en mobile (DC-088). */
      .toast__close { width: var(--touch-target-min); height: var(--touch-target-min); min-width: var(--touch-target-min); }
      .toast__action { min-height: var(--touch-target-min); display: inline-flex; align-items: center; }
    }
  `],
})
export class ToastHostComponent {
  protected readonly svc = inject(ToastService);
  protected readonly toasts = this.svc.toasts;

  protected glyph(kind: ToastKind): string {
    return { success: 'check-circle', error: 'warning', info: 'info' }[kind];
  }
}
