import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Appointment } from '../../core/models/models';
import { appointmentBadge } from '../status-map';

/**
 * Bloque de turno coloreado por estado, clickeable → detalle. Pieza presentacional
 * COMPARTIDA por las vistas Mes y Semana del calendario (antes duplicaban markup + el
 * mapeo de 5 tonos + el helper badge()). El tono sale de `appointmentBadge` (misma fuente
 * que el resto de la app). `layout` ajusta sólo la disposición:
 *   - 'inline'  → hora y nombre en línea (grid mensual, celdas compactas)
 *   - 'stacked' → hora sobre nombre (columna semanal)
 * El DOM y los colores renderizados son idénticos a los de las vistas previas.
 */
@Component({
  selector: 'app-cal-appt-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <a class="capt" [class]="'capt--' + layout()" [attr.data-tone]="badge.tone" [routerLink]="['/agenda', appt().id]"
       [attr.aria-label]="appt().hora + ' ' + appt().pacienteNombre + ' — ' + badge.label">
      <span class="capt__time">{{ appt().hora }}</span>
      <span class="capt__name">{{ appt().pacienteNombre }}</span>
    </a>
  `,
  styles: [`
    :host { display: block; }
    .capt { display: flex; border-radius: 8px; line-height: 1.3; overflow: hidden; }
    .capt__time { font-weight: var(--weight-medium); }
    .capt__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }

    /* mensual: hora + nombre en línea, celdas compactas */
    .capt--inline { gap: var(--space-1); align-items: baseline; padding: 3px 6px; border-radius: 6px; font-size: 12px; }
    .capt--inline .capt__time { flex: 0 0 auto; }

    /* semanal: hora sobre nombre, columna del día */
    .capt--stacked { flex-direction: column; gap: 1px; padding: var(--space-1) var(--space-2); line-height: 1.25; }
    .capt--stacked .capt__time { font-size: 12px; }
    .capt--stacked .capt__name { font-size: 12px; }

    .capt[data-tone="success"] { background: var(--color-success-bg); color: var(--color-success-text); }
    .capt[data-tone="warning"] { background: var(--color-warning-bg); color: var(--color-warning-text); }
    .capt[data-tone="info"]    { background: var(--color-info-bg);    color: var(--color-info-text); }
    .capt[data-tone="neutral"] { background: var(--color-neutral-bg); color: var(--color-neutral-text); }
    .capt[data-tone="error"]   { background: var(--color-error-bg);   color: var(--color-error-text); }
    .capt:focus-visible { box-shadow: var(--focus-ring); outline: none; }

    @media (max-width: 767px) {
      .capt--inline .capt__name { display: none; }
    }
  `],
})
export class CalApptBlockComponent {
  readonly appt = input.required<Appointment>();
  readonly layout = input<'inline' | 'stacked'>('inline');
  protected get badge() { return appointmentBadge(this.appt().estado); }
}
