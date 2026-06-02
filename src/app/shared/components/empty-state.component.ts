import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { IconComponent } from './icon.component';

/**
 * empty-state (DC-064 / DEMO-017). Ícono Phosphor liviano (gris/azul tenue) + título
 * peso 500 + descripción con guidance + 1 acción primaria opcional (proyectada).
 * Mucho aire, centrado. Copy persona-céntrico anti-demo (nunca delata mock).
 */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="empty" role="status">
      <span class="empty__glyph"><app-icon [name]="icon()" [size]="28" /></span>
      <h3 class="empty__title t-title">{{ title() }}</h3>
      <p class="empty__desc t-body t-secondary">{{ description() }}</p>
      @if (hasAction()) {
        <div class="empty__action"><ng-content></ng-content></div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .empty {
      display: flex; flex-direction: column; align-items: center; text-align: center;
      gap: var(--space-3); padding: var(--space-16) var(--space-6);
      max-width: 420px; margin: 0 auto;
    }
    .empty__glyph {
      display: inline-flex; align-items: center; justify-content: center;
      width: 64px; height: 64px; border-radius: 50%;
      background: var(--color-accent-tint); color: var(--color-accent-deep);
      margin-bottom: var(--space-2);
    }
    .empty__title { margin: 0; }
    .empty__desc { margin: 0; line-height: var(--lh-body); }
    .empty__action { margin-top: var(--space-4); }
  `],
})
export class EmptyStateComponent {
  readonly icon = input<string>('tooth');
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly hasAction = input<boolean>(false);
}
