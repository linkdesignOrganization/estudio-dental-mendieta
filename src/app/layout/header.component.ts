import { Component, ChangeDetectionStrategy, signal, output, inject, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { IconComponent } from '../shared/components/icon.component';
import { AvatarComponent } from '../shared/components/avatar.component';
import { NotificationPanelComponent } from './notification-panel.component';
import { StoreService } from '../core/persistence/store.service';

/**
 * header (DEMO-002 / DC-032 / DC-051 / BVC-008). Izq→der: hamburguesa (mobile),
 * nombre del módulo activo (sincronizado con ruta), spacer, campana con badge,
 * avatar "AD". SIN búsqueda global / command palette / carrito / badge demo.
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, AvatarComponent, NotificationPanelComponent],
  template: `
    <header class="header">
      <button type="button" class="icon-btn header__burger" aria-label="Abrir menú de navegación" (click)="openMenu.emit()">
        <app-icon name="list" [size]="22" />
      </button>

      <h1 class="header__title t-title">{{ moduleTitle() }}</h1>

      <div class="header__spacer"></div>

      <div class="header__actions">
        <div class="header__bell-wrap">
          <button type="button" class="icon-btn header__bell" [attr.aria-expanded]="panelOpen()"
                  aria-label="Notificaciones" (click)="togglePanel()">
            <app-icon name="bell" [size]="20" />
            @if (unread() > 0) { <span class="header__badge" aria-hidden="true">{{ unread() }}</span> }
          </button>
          @if (panelOpen()) {
            <app-notification-panel (closed)="panelOpen.set(false)" />
          }
        </div>

        <button type="button" class="header__avatar-btn" aria-label="Cuenta de la administradora">
          <app-avatar name="Ana Domínguez" size="sm" />
        </button>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }
    .header {
      display: flex; align-items: center; gap: var(--space-3);
      height: var(--header-height); padding: 0 var(--space-6);
      background: var(--color-bg-elevated); border-bottom: 1px solid var(--color-border);
    }
    .header__burger { display: none; }
    .header__title { margin: 0; }
    .header__spacer { flex: 1; }
    .header__actions { display: flex; align-items: center; gap: var(--space-2); }
    .header__bell-wrap { position: relative; }
    .header__badge {
      position: absolute; top: 4px; right: 4px;
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 18px; height: 18px; padding: 0 5px; border-radius: var(--radius-pill);
      background: var(--color-accent-deep); color: #ffffff; font-size: 11px; font-weight: var(--weight-medium);
      border: 2px solid var(--color-bg-elevated);
    }
    .header__avatar-btn {
      border: none; background: transparent; padding: 0; cursor: pointer; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;   /* centra el avatar visual de 32px */
    }
    .header__avatar-btn:focus-visible { box-shadow: var(--focus-ring); }
    @media (max-width: 1199px) {
      .header { padding: 0 var(--space-4); }
      .header__burger { display: inline-flex; }
    }
    /* Touch target ≥44px en mobile (DC-088): el botón crece a 44×44 manteniendo
       el avatar visual de 32px centrado por el flex de arriba. */
    @media (max-width: 767px) {
      .header__avatar-btn { min-width: var(--touch-target-min); min-height: var(--touch-target-min); }
    }
  `],
})
export class HeaderComponent {
  readonly openMenu = output<void>();
  private readonly router = inject(Router);
  private readonly store = inject(StoreService);

  protected readonly panelOpen = signal(false);
  protected readonly unread = this.store.unreadCount;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly moduleTitle = computed(() => {
    const u = this.url().split('?')[0];
    const map: Record<string, string> = {
      '/agenda': 'Agenda',
      '/pacientes': 'Pacientes',
      '/tratamientos': 'Tratamientos',
      '/facturacion': 'Facturación',
      '/reportes': 'Reportes',
      '/configuracion': 'Configuración',
      '/ayuda': 'Ayuda',
    };
    const key = Object.keys(map).find((k) => u.startsWith(k));
    return key ? map[key] : 'Estudio Dental Mendieta';
  });

  protected togglePanel() { this.panelOpen.update((v) => !v); }
}
