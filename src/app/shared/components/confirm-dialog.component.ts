import { Component, ChangeDetectionStrategy, input, output, ElementRef, viewChild, effect } from '@angular/core';
import { IconComponent } from './icon.component';

/**
 * confirm-dialog (DC-067 / BVC-012 / DC-142). Modal centrado <50% viewport (máx ~440px),
 * card blanca radius 10-14, sombra overlay, backdrop translúcido. Título + mensaje guidance
 * + 2 botones (Cancelar secundario + Confirmar primario; destructivo → coral). SOLO
 * confirmaciones cortas. Trap de foco básico, Escape=cancelar. Copy de producción.
 */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="cd-backdrop" (click)="cancel.emit()"></div>
    <div class="cd" role="alertdialog" aria-modal="true" [attr.aria-labelledby]="'cd-title'" (keydown.escape)="cancel.emit()">
      <header class="cd__head">
        @if (destructive()) { <span class="cd__glyph cd__glyph--danger"><app-icon name="warning" [size]="22" /></span> }
        <h2 class="cd__title t-title" id="cd-title">{{ title() }}</h2>
      </header>
      <p class="cd__message t-body t-secondary">{{ message() }}</p>
      <div class="cd__actions">
        <button #cancelBtn type="button" class="btn-edm btn-edm--secondary" (click)="cancel.emit()">{{ cancelLabel() }}</button>
        <button type="button" class="btn-edm" [class.btn-edm--destructive]="destructive()" [class.btn-edm--primary]="!destructive()" (click)="confirm.emit()">
          {{ confirmLabel() }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cd-backdrop { position: fixed; inset: 0; background: rgba(42,42,53,0.45); z-index: 1300; animation: fade 180ms var(--motion-ease); }
    .cd {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 440px; max-width: calc(100vw - 32px); z-index: 1301;
      background: var(--color-bg-elevated); border-radius: var(--radius-lg); box-shadow: var(--shadow-overlay);
      padding: var(--card-padding-lg); display: flex; flex-direction: column; gap: var(--space-4);
      animation: pop 200ms var(--motion-ease);
    }
    .cd__head { display: flex; align-items: center; gap: var(--space-3); }
    .cd__glyph { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; flex: 0 0 auto; border-radius: 50%; }
    .cd__glyph--danger { background: var(--color-error-bg); color: var(--color-error-text); }
    .cd__title { color: var(--color-text); margin: 0; }
    .cd__message { margin: 0; line-height: var(--lh-body); }
    .cd__actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-2); }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pop { from { opacity: 0; transform: translate(-50%, -48%) scale(0.98); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
    @media (prefers-reduced-motion: reduce) { .cd, .cd-backdrop { animation: none; } }
    @media (max-width: 767px) { .cd__actions { flex-direction: column-reverse; } .cd__actions .btn-edm { width: 100%; } }
  `],
})
export class ConfirmDialogComponent {
  readonly title = input.required<string>();
  readonly message = input<string>('');
  readonly confirmLabel = input<string>('Confirmar');
  readonly cancelLabel = input<string>('Cancelar');
  readonly destructive = input<boolean>(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  private readonly cancelBtn = viewChild<ElementRef<HTMLButtonElement>>('cancelBtn');

  constructor() {
    // Foco inicial en Cancelar si es destructivo (DC-067).
    effect(() => {
      const btn = this.cancelBtn();
      if (btn && this.destructive()) queueMicrotask(() => btn.nativeElement.focus());
    });
  }
}
