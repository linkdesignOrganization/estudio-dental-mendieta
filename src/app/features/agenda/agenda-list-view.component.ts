import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../../shared/components/avatar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { Appointment } from '../../core/models/models';
import { appointmentBadge } from '../../shared/status-map';

export interface DayGroup { iso: string; titulo: string; appts: Appointment[]; }

/**
 * Agenda — Vista AGENDA/LISTA. Turnos de hoy en adelante agrupados por día, como filas
 * cómodas al tacto (≥44px). Es el DEFAULT en mobile (ajuste de feedback de la demo): resuelve
 * el touch target de los chips chicos del grid. Sub-componente presentacional del calendario.
 */
@Component({
  selector: 'app-agenda-list-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AvatarComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    @if (groups().length) {
      <div class="agenda-list">
        @for (g of groups(); track g.iso) {
          <section class="agenda-day">
            <h3 class="agenda-day__title t-small t-secondary">{{ g.titulo }}</h3>
            <div class="agenda-day__rows">
              @for (a of g.appts; track a.id) {
                <a class="agenda-row" [routerLink]="['/agenda', a.id]"
                   [attr.aria-label]="a.hora + ' ' + a.pacienteNombre + ' — ' + badge(a).label">
                  <span class="agenda-row__time t-body-medium">{{ a.hora }}</span>
                  <app-avatar [src]="a.pacienteFoto" [name]="a.pacienteNombre" size="sm" />
                  <span class="agenda-row__body">
                    <span class="t-body-medium">{{ a.pacienteNombre }}</span>
                    <span class="t-small t-secondary">{{ a.tratamiento }} · {{ a.profesional }}</span>
                  </span>
                  <app-status-badge [label]="badge(a).label" [tone]="badge(a).tone" />
                </a>
              }
            </div>
          </section>
        }
      </div>
    } @else {
      <section class="surface-card is-lg">
        <app-empty-state icon="calendar-blank" title="No hay turnos para mostrar"
          description="Creá uno con Nuevo turno para empezar a llenar la agenda." />
      </section>
    }
  `,
  styles: [`
    :host { display: block; }
    .agenda-list { display: flex; flex-direction: column; gap: var(--space-5); }
    .agenda-day { display: flex; flex-direction: column; gap: var(--space-2); }
    .agenda-day__title { text-transform: uppercase; letter-spacing: 0.04em; }
    .agenda-day__rows { display: flex; flex-direction: column; gap: var(--space-2); }
    .agenda-row { display: flex; align-items: center; gap: var(--space-3); min-height: var(--touch-target-min); padding: var(--space-3) var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-elevated); color: var(--color-text); transition: border-color var(--motion-fast) var(--motion-ease), background-color var(--motion-fast) var(--motion-ease); }
    .agenda-row:hover { border-color: var(--color-accent-sky); background: var(--color-accent-tint); }
    .agenda-row:focus-visible { box-shadow: var(--focus-ring); outline: none; }
    .agenda-row__time { flex: 0 0 auto; min-width: 48px; font-variant-numeric: tabular-nums; }
    .agenda-row__body { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    .agenda-row__body span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `],
})
export class AgendaListViewComponent {
  readonly groups = input.required<DayGroup[]>();
  protected badge(a: Appointment) { return appointmentBadge(a.estado); }
}
