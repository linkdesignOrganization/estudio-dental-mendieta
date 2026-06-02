import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

/**
 * skeleton (DC-065 / DC-120 / BVC-016). Bloques con shimmer sutil.
 * Presets: 'card-row' (círculo + líneas), 'card', 'line', 'block'.
 * Stagger ~40ms incremental por índice. Contenedor padre pone aria-busy="true".
 * NUNCA spinners.
 */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (preset()) {
      @case ('card-row') {
        <div class="sk-row" [style.animation-delay]="delay()">
          <span class="sk sk--circle"></span>
          <div class="sk-row__lines">
            <span class="sk sk--line" style="width:42%"></span>
            <span class="sk sk--line" style="width:26%"></span>
          </div>
          <span class="sk sk--pill"></span>
        </div>
      }
      @case ('card') {
        <div class="sk-card" [style.animation-delay]="delay()">
          <span class="sk sk--circle sk--lg"></span>
          <span class="sk sk--line" style="width:60%"></span>
          <span class="sk sk--line" style="width:40%"></span>
          <span class="sk sk--block" style="height:48px"></span>
        </div>
      }
      @case ('kpi') {
        <div class="sk-kpi" [style.animation-delay]="delay()">
          <span class="sk sk--line" style="width:50%; height:14px"></span>
          <span class="sk sk--line" style="width:70%; height:32px; margin-top:8px"></span>
          <span class="sk sk--block" style="height:8px; margin-top:16px"></span>
        </div>
      }
      @case ('line') { <span class="sk sk--line" [style.width]="width()" [style.animation-delay]="delay()"></span> }
      @default { <span class="sk sk--block" [style.height]="height()" [style.animation-delay]="delay()"></span> }
    }
  `,
  styles: [`
    :host { display: block; }
    .sk {
      display: block; border-radius: var(--radius-sm);
      background: linear-gradient(100deg, var(--color-border) 30%, #f2f2f6 50%, var(--color-border) 70%);
      background-size: 200% 100%;
      animation: edm-shimmer 1.4s ease-in-out infinite;
    }
    .sk--line { height: 12px; }
    .sk--pill { width: 64px; height: 22px; border-radius: var(--radius-sm); }
    .sk--circle { width: 40px; height: 40px; border-radius: 50%; flex: 0 0 auto; }
    .sk--circle.sk--lg { width: 88px; height: 88px; margin: 0 auto var(--space-4); }
    .sk--block { width: 100%; border-radius: var(--radius-sm); }
    .sk-row { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) 0; }
    .sk-row__lines { display: flex; flex-direction: column; gap: var(--space-2); flex: 1; }
    .sk-card { background: var(--color-bg-elevated); border-radius: var(--radius-md); box-shadow: var(--shadow-card); padding: var(--card-padding); display: flex; flex-direction: column; gap: var(--space-2); text-align: center; align-items: center; }
    .sk-card .sk--line { margin: 0 auto; }
    .sk-card .sk--block { margin-top: var(--space-3); }
    .sk-kpi { background: var(--color-bg-elevated); border-radius: var(--radius-md); box-shadow: var(--shadow-card); padding: var(--card-padding); }
    @media (prefers-reduced-motion: reduce) { .sk { animation: none; } }
  `],
})
export class SkeletonComponent {
  readonly preset = input<'card-row' | 'card' | 'kpi' | 'line' | 'block'>('line');
  readonly width = input<string>('100%');
  readonly height = input<string>('16px');
  /** índice para stagger 40ms */
  readonly index = input<number>(0);

  protected readonly delay = computed(() => `${this.index() * 40}ms`);
}
