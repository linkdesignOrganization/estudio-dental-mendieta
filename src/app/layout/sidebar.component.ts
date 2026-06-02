import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../shared/components/icon.component';

interface NavItem { label: string; icon: string; route: string; badge?: number; }

/**
 * sidebar (DEMO-001 / DC-031 / DC-050 / BVC-007). Columna fija blanca. Logo arriba.
 * EXACTAMENTE 5 items principales + separador + Configuración/Ayuda.
 * Ícono Phosphor 20 + label SIEMPRE visible (BVC-025: nunca solo ícono).
 * Item activo = píldora #c5d8e8 tintada, texto #2a2a35, aria-current="page".
 * Badge de conteo circular azul profundo + texto blanco.
 */
@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav class="sidebar" aria-label="Navegación principal">
      <a class="sidebar__brand" routerLink="/reportes" (click)="navigate.emit()">
        <span class="sidebar__mark" aria-hidden="true"><app-icon name="tooth" [size]="22" /></span>
        <span class="sidebar__wordmark">
          <span class="sidebar__name">Estudio Dental</span>
          <span class="sidebar__name sidebar__name--accent">Mendieta</span>
        </span>
      </a>

      <ul class="sidebar__list">
        @for (item of primary; track item.route) {
          <li>
            <a class="sidebar__item" [routerLink]="item.route" routerLinkActive="is-active"
               [routerLinkActiveOptions]="{ exact: false }" ariaCurrentWhenActive="page" (click)="navigate.emit()">
              <span class="sidebar__icon"><app-icon [name]="item.icon" [size]="20" /></span>
              <span class="sidebar__label">{{ item.label }}</span>
              @if (item.badge) { <span class="sidebar__badge" aria-label="{{ item.badge }} pendientes">{{ item.badge }}</span> }
            </a>
          </li>
        }
      </ul>

      <hr class="sidebar__sep" />

      <ul class="sidebar__list">
        @for (item of secondary; track item.route) {
          <li>
            <a class="sidebar__item" [routerLink]="item.route" routerLinkActive="is-active"
               ariaCurrentWhenActive="page" (click)="navigate.emit()">
              <span class="sidebar__icon"><app-icon [name]="item.icon" [size]="20" /></span>
              <span class="sidebar__label">{{ item.label }}</span>
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .sidebar {
      display: flex; flex-direction: column; gap: var(--space-2);
      height: 100%; padding: var(--space-6) var(--space-4);
      background: var(--color-bg-elevated); overflow-y: auto;
    }
    .sidebar__brand { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) var(--space-3); margin-bottom: var(--space-6); }
    .sidebar__mark {
      display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto;
      width: 36px; height: 36px; border-radius: var(--radius-sm);
      background: var(--color-accent-deep); color: #ffffff;
    }
    .sidebar__wordmark { display: flex; flex-direction: column; line-height: 1.15; }
    .sidebar__name { font-family: var(--font-display); font-weight: var(--weight-medium); font-size: var(--text-body); color: var(--color-text); letter-spacing: -0.01em; }
    .sidebar__name--accent { color: var(--color-accent-deep); }
    .sidebar__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-1); }
    .sidebar__item {
      display: flex; align-items: center; gap: var(--space-3);
      min-height: 44px; padding: 0 var(--space-3); border-radius: var(--radius-md);
      color: var(--color-text-secondary); font-size: var(--text-body);
      transition: background-color var(--motion-fast) var(--motion-ease), color var(--motion-fast) var(--motion-ease);
    }
    .sidebar__item:hover { background: var(--color-accent-tint); color: var(--color-text); }
    .sidebar__item.is-active { background: var(--color-accent-sky); color: var(--color-text); font-weight: var(--weight-medium); }
    .sidebar__item:focus-visible { box-shadow: var(--focus-ring); }
    .sidebar__icon { display: inline-flex; flex: 0 0 auto; }
    .sidebar__label { flex: 1; }
    .sidebar__badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 20px; height: 20px; padding: 0 6px; border-radius: var(--radius-pill);
      background: var(--color-accent-deep); color: #ffffff;
      font-size: 12px; font-weight: var(--weight-medium);
    }
    .sidebar__sep { height: 1px; background: var(--color-border); border: none; margin: var(--space-3) var(--space-2); }
  `],
})
export class SidebarComponent {
  readonly navigate = output<void>();

  protected readonly primary: NavItem[] = [
    { label: 'Agenda', icon: 'calendar-blank', route: '/agenda' },
    { label: 'Pacientes', icon: 'users', route: '/pacientes' },
    { label: 'Tratamientos', icon: 'tooth', route: '/tratamientos' },
    { label: 'Facturación', icon: 'receipt', route: '/facturacion' },
    { label: 'Reportes', icon: 'chart-bar', route: '/reportes' },
  ];
  protected readonly secondary: NavItem[] = [
    { label: 'Configuración', icon: 'gear', route: '/configuracion' },
    { label: 'Ayuda', icon: 'question', route: '/ayuda' },
  ];
}
