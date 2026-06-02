import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Sub-navegación de SECCIÓN de Facturación (GAP-UX03). 3 listas hermanas con rutas
 * dedicadas reales, NO tabs del mismo objeto. Cada destino es una ruta completa.
 */
@Component({
  selector: 'app-billing-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bnav" aria-label="Secciones de facturación">
      <a class="bnav__link" routerLink="/facturacion/presupuestos" routerLinkActive="is-active">Presupuestos</a>
      <a class="bnav__link" routerLink="/facturacion/facturas" routerLinkActive="is-active">Facturas</a>
      <a class="bnav__link" routerLink="/facturacion/obras-sociales" routerLinkActive="is-active">Obras sociales</a>
    </nav>
  `,
  styles: [`
    :host { display: block; margin-bottom: var(--space-5); }
    .bnav { display: flex; gap: var(--space-2); flex-wrap: wrap; }
    .bnav__link {
      padding: var(--space-2) var(--space-4); border-radius: var(--radius-pill);
      border: 1px solid var(--color-border); background: var(--color-bg-elevated);
      color: var(--color-text-secondary); font-size: var(--text-body);
      transition: background-color var(--motion-fast) var(--motion-ease), color var(--motion-fast) var(--motion-ease), border-color var(--motion-fast) var(--motion-ease);
    }
    .bnav__link:hover { background: var(--color-accent-tint); color: var(--color-text); }
    .bnav__link.is-active { background: var(--color-accent-sky); border-color: var(--color-accent-sky); color: var(--color-text); font-weight: var(--weight-medium); }
    .bnav__link:focus-visible { box-shadow: var(--focus-ring); outline: none; }
  `],
})
export class BillingNavComponent {}
