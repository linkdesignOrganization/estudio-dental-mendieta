import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon.component';
import { AvatarStackComponent } from './avatar-stack.component';
import { ObraSocial } from '../../core/models/models';
import { ArsPipe } from '../pipes/ars.pipe';

/**
 * obra-social-card (DC-060, Patrón 10). Logo-en-círculo con borde arriba + nombre
 * peso 500 + divider + mini-stats con icon-chips azules (pacientes · deuda · último
 * pago) + avatar-stack. SIN ARCA/AFIP. Logo placeholder controlado.
 */
@Component({
  selector: 'app-obra-social-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, AvatarStackComponent, ArsPipe],
  template: `
    <article class="surface-card is-clickable oscard">
      <div class="oscard__head">
        <span class="oscard__logo" aria-hidden="true">{{ initials() }}</span>
        <h3 class="oscard__name t-body-medium">{{ os().nombre }}</h3>
      </div>

      <hr class="divider" />

      <div class="oscard__stats">
        <div class="icon-chip">
          <span class="icon-chip__glyph"><app-icon name="users" [size]="16" /></span>
          <div class="icon-chip__body">
            <span class="icon-chip__label">Pacientes activos</span>
            <span class="icon-chip__value">{{ os().pacientesActivos }}</span>
          </div>
        </div>
        <div class="icon-chip">
          <span class="icon-chip__glyph"><app-icon name="receipt" [size]="16" /></span>
          <div class="icon-chip__body">
            <span class="icon-chip__label">Deuda</span>
            <span class="icon-chip__value">{{ os().deuda | ars }}</span>
          </div>
        </div>
        <div class="icon-chip">
          <span class="icon-chip__glyph"><app-icon name="clock" [size]="16" /></span>
          <div class="icon-chip__body">
            <span class="icon-chip__label">Último pago</span>
            <span class="icon-chip__value">{{ os().ultimoPago }}</span>
          </div>
        </div>
      </div>

      <div class="oscard__foot">
        <app-avatar-stack [items]="os().pacientesFotos" [max]="4" />
        <a class="oscard__link t-body-medium" [routerLink]="['/facturacion/obras-sociales', os().id]">Ver detalle</a>
      </div>
    </article>
  `,
  styles: [`
    :host { display: block; }
    .oscard { display: flex; flex-direction: column; gap: var(--space-3); }
    .oscard__head { display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--space-3); }
    .oscard__logo {
      display: inline-flex; align-items: center; justify-content: center;
      width: 64px; height: 64px; border-radius: 50%;
      border: 1px solid var(--color-border); background: var(--color-bg-elevated);
      font-family: var(--font-display); font-weight: var(--weight-medium); font-size: var(--text-title);
      color: var(--color-accent-deep);
    }
    .oscard__name { margin: 0; }
    .divider { margin: var(--space-1) 0; }
    .oscard__stats { display: flex; flex-direction: column; gap: var(--space-3); }
    .oscard__foot { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); margin-top: var(--space-1); }
    .oscard__link { color: var(--color-accent-deep); }
    .oscard__link:hover { text-decoration: underline; }
  `],
})
export class ObraSocialCardComponent {
  readonly os = input.required<ObraSocial>();
  protected initials(): string {
    const n = this.os().nombre.trim();
    const parts = n.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }
}
