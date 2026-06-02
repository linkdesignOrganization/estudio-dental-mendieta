import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';
import { IconComponent } from '../shared/components/icon.component';
import { StoreService } from '../core/persistence/store.service';

/**
 * app-shell (DEMO-001..004 / DC-030). Grid 2 columnas en desktop: sidebar fijo
 * ~232px + área de contenido (header sticky arriba, router-outlet en medio, footer
 * al pie). Canvas #fafafa con cards blancas encima. NO envuelve Login.
 * En mobile el sidebar pasa a drawer overlay (DC-080) invocado por hamburguesa.
 */
@Component({
  selector: 'app-app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, FooterComponent, IconComponent],
  template: `
    <div class="shell" [class.shell--drawer-open]="drawerOpen()">
      <aside class="shell__sidebar">
        <app-sidebar (navigate)="closeDrawer()" />
      </aside>

      @if (drawerOpen()) {
        <div class="shell__backdrop" (click)="closeDrawer()" aria-hidden="true"></div>
      }

      <div class="shell__main">
        <app-header class="shell__header" (openMenu)="openDrawer()" />
        <main class="shell__content" id="contenido">
          <div class="shell__inner">
            @if (degraded()) {
              <div class="storage-notice" role="status" aria-live="polite">
                <app-icon name="warning" [size]="18" />
                <p class="storage-notice__text t-small">
                  Estás trabajando sin almacenamiento local: los cambios se mantienen mientras la pestaña esté abierta, pero no se guardarán al cerrarla. Revisá la configuración de privacidad del navegador para conservarlos.
                </p>
              </div>
            }
            <router-outlet />
          </div>
          <app-footer />
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .shell { display: grid; grid-template-columns: var(--sidebar-width) 1fr; height: 100vh; background: var(--color-bg); }
    .shell__sidebar { border-right: 1px solid var(--color-border); height: 100vh; position: sticky; top: 0; }
    .shell__main { display: flex; flex-direction: column; min-width: 0; height: 100vh; overflow: hidden; }
    .shell__header { position: sticky; top: 0; z-index: 50; flex: 0 0 auto; }
    .shell__content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
    .shell__inner { flex: 1; width: 100%; max-width: var(--content-max); margin: 0 auto; padding: var(--space-8) var(--space-8); }
    .shell__backdrop { display: none; }
    .storage-notice {
      display: flex; align-items: flex-start; gap: var(--space-2);
      margin-bottom: var(--space-5); padding: var(--space-3) var(--space-4);
      background: var(--color-warning-bg); color: var(--color-warning-text);
      border: 1px solid color-mix(in srgb, var(--color-warning-text) 25%, transparent);
      border-radius: var(--radius-md);
    }
    .storage-notice app-icon { flex: 0 0 auto; margin-top: 1px; }
    .storage-notice__text { margin: 0; line-height: var(--lh-body); }

    @media (max-width: 1199px) {
      .shell { grid-template-columns: 1fr; }
      .shell__sidebar {
        position: fixed; top: 0; left: 0; z-index: 1001;
        width: var(--drawer-width); max-width: 80vw; height: 100vh;
        transform: translateX(-100%); transition: transform var(--motion-slow) var(--motion-ease);
        box-shadow: var(--shadow-overlay);
      }
      .shell--drawer-open .shell__sidebar { transform: translateX(0); }
      .shell__backdrop {
        display: block; position: fixed; inset: 0; z-index: 1000;
        background: rgba(42,42,53,0.35); animation: fade-in 200ms var(--motion-ease);
      }
      .shell__inner { padding: var(--space-6) var(--space-4); }
    }
    @media (max-width: 767px) {
      .shell__inner { padding: var(--space-4) var(--space-4); }
    }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .shell__sidebar { transition: none; } .shell__backdrop { animation: none; } }
  `],
})
export class AppShellComponent {
  private readonly router = inject(Router);
  /** Aviso visible cuando el almacenamiento local no está disponible (UX-091 / BUG-E06). */
  protected readonly degraded = inject(StoreService).degraded;
  protected readonly drawerOpen = signal(false);

  constructor() {
    // Cierra el drawer al navegar (cubre cualquier navegación, no solo clicks del sidebar).
    this.router.events.subscribe((e) => { if (e instanceof NavigationEnd) this.drawerOpen.set(false); });
  }

  protected openDrawer() { this.drawerOpen.set(true); }
  protected closeDrawer() { this.drawerOpen.set(false); }
}
