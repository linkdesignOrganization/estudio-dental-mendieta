import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon.component';
import { AvatarComponent } from './avatar.component';
import { StatusBadgeComponent } from './status-badge.component';
import { Patient } from '../../core/models/models';
import { paymentBadge } from '../status-map';

/**
 * patient-card (DC-058, Patrón 4). Foto circular grande centrada (88px) + nombre
 * peso 500 + subtítulo "edad · obra social" gris + divider + 2 filas de icon-chips
 * azules + status-badge de pago + footer "Ver ficha" (link azul) + icon-button editar.
 * Superficie blanca, radius 10-14, padding 24-32, sombra.
 */
@Component({
  selector: 'app-patient-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, AvatarComponent, StatusBadgeComponent],
  template: `
    <article class="surface-card is-clickable pcard">
      <div class="pcard__head">
        <app-avatar [src]="patient().fotoPath" [name]="fullName()" size="lg" />
        <h3 class="pcard__name t-body-medium">{{ fullName() }}</h3>
        <p class="pcard__sub t-small t-secondary">{{ patient().edad }} años · {{ patient().obraSocial }}</p>
      </div>

      <hr class="divider" />

      <div class="pcard__chips">
        <div class="icon-chip">
          <span class="icon-chip__glyph"><app-icon name="phone" [size]="16" /></span>
          <div class="icon-chip__body">
            <span class="icon-chip__label">Teléfono</span>
            <span class="icon-chip__value">{{ patient().telefono }}</span>
          </div>
        </div>
        <div class="icon-chip">
          <span class="icon-chip__glyph"><app-icon name="calendar-blank" [size]="16" /></span>
          <div class="icon-chip__body">
            <span class="icon-chip__label">Próximo turno</span>
            <span class="icon-chip__value">{{ patient().proximoTurno || 'Sin turno agendado' }}</span>
          </div>
        </div>
        <div class="icon-chip">
          <span class="icon-chip__glyph"><app-icon name="user" [size]="16" /></span>
          <div class="icon-chip__body">
            <span class="icon-chip__label">Profesional</span>
            <span class="icon-chip__value">{{ patient().profesional }}</span>
          </div>
        </div>
      </div>

      <div class="pcard__foot">
        <app-status-badge [label]="badge().label" [tone]="badge().tone" />
        <div class="pcard__actions">
          <a class="pcard__link t-body-medium" [routerLink]="['/pacientes', patient().id]">Ver ficha</a>
          <a class="icon-btn" [routerLink]="['/pacientes', patient().id, 'editar']" aria-label="Editar paciente" (click)="$event.stopPropagation()">
            <app-icon name="pencil-simple" [size]="18" />
          </a>
        </div>
      </div>
    </article>
  `,
  styles: [`
    :host { display: block; }
    .pcard { display: flex; flex-direction: column; gap: var(--space-3); }
    .pcard__head { display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--space-2); }
    .pcard__name { margin: 0; }
    .pcard__sub { margin: 0; }
    .divider { margin: var(--space-2) 0; }
    .pcard__chips { display: flex; flex-direction: column; gap: var(--space-3); }
    .pcard__foot { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); margin-top: var(--space-1); }
    .pcard__actions { display: flex; align-items: center; gap: var(--space-1); }
    .pcard__link { color: var(--color-accent-deep); }
    .pcard__link:hover { text-decoration: underline; }
  `],
})
export class PatientCardComponent {
  readonly patient = input.required<Patient>();
  protected readonly fullName = computed(() => `${this.patient().nombre} ${this.patient().apellido}`);
  protected readonly badge = computed(() => paymentBadge(this.patient().estadoCuenta));
}
