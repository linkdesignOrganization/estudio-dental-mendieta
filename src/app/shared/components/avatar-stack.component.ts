import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { AvatarComponent } from './avatar.component';

/**
 * Avatar-stack (DC-056). Avatares ~32px solapados ~40%, borde blanco 2px.
 * Si excede max (default 4) → círculo "+N" con fondo azul PROFUNDO #246991 (AA) + texto blanco.
 * Número siempre visible (no solo color).
 */
@Component({
  selector: 'app-avatar-stack',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent],
  template: `
    <span class="stack" role="img" [attr.aria-label]="ariaLabel()">
      @for (item of visible(); track $index) {
        <span class="stack__item"><app-avatar [src]="item" size="sm" /></span>
      }
      @if (overflow() > 0) {
        <span class="stack__item stack__more" aria-hidden="true">+{{ overflow() }}</span>
      }
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .stack { display: inline-flex; align-items: center; }
    .stack__item { margin-left: -12px; border-radius: 50%; box-shadow: 0 0 0 2px #ffffff; line-height: 0; transition: transform var(--motion-fast) var(--motion-ease); }
    .stack__item:first-child { margin-left: 0; }
    .stack:hover .stack__item { transform: translateX(1px); }
    .stack__more {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--color-accent-deep); color: #ffffff;
      font-family: var(--font-body); font-size: var(--text-small); font-weight: var(--weight-medium);
    }
  `],
})
export class AvatarStackComponent {
  readonly items = input<string[]>([]);
  readonly max = input<number>(4);

  protected readonly visible = computed(() => this.items().slice(0, this.max()));
  protected readonly overflow = computed(() => Math.max(0, this.items().length - this.max()));
  protected readonly ariaLabel = computed(() => `${this.items().length} personas asociadas`);
}
