import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { CalApptBlockComponent } from '../../shared/components/cal-appt-block.component';
import { Appointment } from '../../core/models/models';

export interface WeekDay { iso: string; weekday: string; day: number; isToday: boolean; appts: Appointment[]; }

/**
 * Agenda — Vista SEMANAL (REQ-060). 7 columnas-día (lunes→domingo de la semana que contiene
 * "hoy") con los turnos del día apilados como bloques coloreados por estado, clickeables →
 * detalle. Sub-componente presentacional del calendario: recibe los días ya calculados.
 */
@Component({
  selector: 'app-week-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent, CalApptBlockComponent],
  template: `
    <section class="surface-card is-lg">
      <div class="week">
        @for (d of days(); track d.iso) {
          <div class="week__col" [class.is-today]="d.isToday">
            <div class="week__colhead">
              <span class="week__weekday t-small t-secondary">{{ d.weekday }}</span>
              <span class="week__daynum t-body-medium" [class.is-today]="d.isToday">{{ d.day }}</span>
            </div>
            <div class="week__appts">
              @for (a of d.appts; track a.id) {
                <app-cal-appt-block [appt]="a" layout="stacked" />
              } @empty {
                <span class="week__empty t-small t-secondary">—</span>
              }
            </div>
          </div>
        }
      </div>
      @if (!hasAny()) {
        <app-empty-state icon="calendar-blank" title="No hay turnos esta semana"
          description="Creá uno con Nuevo turno para empezar a llenar la agenda." />
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .week { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--space-2); }
    .week__col { display: flex; flex-direction: column; gap: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: var(--space-2); min-height: 220px; }
    .week__col.is-today { border-color: var(--color-accent); background: var(--color-accent-tint); }
    .week__colhead { display: flex; flex-direction: column; align-items: center; gap: 2px; padding-bottom: var(--space-1); border-bottom: 1px solid var(--color-border); }
    .week__weekday { text-transform: uppercase; letter-spacing: 0.04em; }
    .week__daynum { color: var(--color-text); font-variant-numeric: tabular-nums; }
    .week__daynum.is-today { background: var(--color-accent); color: var(--color-text); border-radius: var(--radius-pill); width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center; }
    .week__appts { display: flex; flex-direction: column; gap: var(--space-1); }
    .week__empty { text-align: center; padding: var(--space-2) 0; }
    @media (max-width: 767px) {
      .week { grid-template-columns: 1fr; }
      .week__col { min-height: 0; }
      .week__colhead { flex-direction: row; justify-content: flex-start; gap: var(--space-2); }
    }
  `],
})
export class WeekViewComponent {
  readonly days = input.required<WeekDay[]>();
  readonly hasAny = input.required<boolean>();
}
