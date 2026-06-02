import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';

/**
 * Avatar circular (DC-055 / DC-078).
 * Imagen object-fit:cover o iniciales (fondo --color-accent-tint + texto azul profundo).
 * NUNCA imagen rota: fallback determinista a iniciales vía (error).
 * Tamaños: xs(24) sm(32) md(48) lg(88) xl(120). En lg/xl borde blanco (efecto recortado).
 */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="avatar" [class.has-ring]="size() === 'lg' || size() === 'xl'" [style.width.px]="px()" [style.height.px]="px()">
      @if (src() && !failed()) {
        <img class="avatar__img" [src]="src()" [alt]="alt()" (error)="failed.set(true)" loading="lazy" />
      } @else {
        <span class="avatar__initials" [style.font-size.px]="fontPx()" aria-hidden="true">{{ initials() }}</span>
      }
    </span>
  `,
  styles: [`
    :host { display: inline-flex; flex: 0 0 auto; }
    .avatar {
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 50%; overflow: hidden; background: var(--color-accent-tint);
      position: relative;
    }
    .avatar.has-ring { box-shadow: 0 0 0 3px #ffffff, var(--shadow-card); }
    .avatar__img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .avatar__initials {
      font-family: var(--font-display); font-weight: var(--weight-medium);
      color: var(--color-accent-deep); line-height: 1; letter-spacing: 0;
      user-select: none;
    }
  `],
})
export class AvatarComponent {
  readonly src = input<string | undefined | null>(null);
  readonly name = input<string>('');
  readonly size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');

  protected readonly failed = signal(false);

  protected readonly px = computed(() => ({ xs: 24, sm: 32, md: 48, lg: 88, xl: 120 }[this.size()]));
  protected readonly fontPx = computed(() => Math.round(this.px() * 0.4));
  protected readonly alt = computed(() => this.name() ? `Foto de ${this.name()}` : 'Foto de paciente');

  protected readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });
}
