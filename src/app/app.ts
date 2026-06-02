import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHostComponent } from './shared/components/toast-host.component';

/**
 * Raíz de la aplicación. Renderiza el router-outlet de top-level (Login fuera del
 * shell, resto dentro de app-shell) + el host de toasts global. Un "Saltar al
 * contenido" para a11y de teclado.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ToastHostComponent],
  template: `
    <a class="skip-link" href="#contenido">Saltar al contenido</a>
    <router-outlet />
    <app-toast-host />
  `,
  styles: [`
    .skip-link {
      position: absolute; left: var(--space-4); top: -48px; z-index: 2000;
      display: inline-flex; align-items: center;
      min-height: var(--touch-target-min); /* hit-area ≥44px (DC-072/088 / BVC-017) */
      background: var(--color-accent-deep); color: #fff; padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-sm); transition: top var(--motion-fast) var(--motion-ease);
    }
    .skip-link:focus { top: var(--space-4); color: #fff; }
  `],
})
export class App {}
