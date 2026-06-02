import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconComponent } from '../../shared/components/icon.component';
import { StoreService } from '../../core/persistence/store.service';
import { appointmentBadge } from '../../shared/status-map';
import { Appointment } from '../../core/models/models';

interface DayCell { day: number; inMonth: boolean; iso: string; appts: Appointment[]; }

/**
 * Agenda — Calendario (DEMO-007 / DC-036 / DC-100..102). Header (título + 1 filtro por
 * profesional + "Nuevo turno") sobre calendario como card blanca. Toggles Mes/Semana/Día.
 * Turnos = bloques coloreados por estado. Mucho aire. Vacío → empty state con guidance.
 */
@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="page-head">
      <div class="page-head__titles">
        <h2 class="t-display">Agenda</h2>
        <span class="page-head__subtitle">Junio 2026</span>
      </div>
      <div class="page-head__actions">
        <div class="field field--inline">
          <select class="select-edm" aria-label="Filtrar por profesional" [value]="prof()" (change)="onProf($event)">
            <option value="">Todos los profesionales</option>
            @for (p of professionals(); track p.id) { <option [value]="p.nombre">{{ p.nombre }}</option> }
          </select>
        </div>
        <a class="btn-edm btn-edm--primary" routerLink="/agenda/nuevo/paciente">
          <app-icon name="calendar-plus" [size]="18" /> Nuevo turno
        </a>
      </div>
    </div>

    <div class="cal-toolbar">
      <div class="view-toggle" role="group" aria-label="Vista del calendario">
        @for (v of views; track v.key) {
          <button type="button" class="view-toggle__btn" [class.is-active]="view() === v.key" (click)="setView(v.key)">{{ v.label }}</button>
        }
      </div>
      <a class="btn-edm btn-edm--ghost" routerLink="/agenda/dia">
        <app-icon name="list-bullets" [size]="18" /> Ver lista del día
      </a>
    </div>

    <section class="surface-card is-lg cal">
      <div class="cal__weekdays">
        @for (w of weekdays; track w) { <span class="cal__weekday t-small t-secondary">{{ w }}</span> }
      </div>
      <div class="cal__grid">
        @for (cell of cells(); track cell.iso) {
          <div class="cal__cell" [class.is-out]="!cell.inMonth" [class.is-today]="cell.iso === today">
            <span class="cal__daynum t-small" [class.is-today]="cell.iso === today">{{ cell.day }}</span>
            <div class="cal__appts">
              @for (a of cell.appts.slice(0, 3); track a.id) {
                <a class="cal__appt" [attr.data-tone]="badge(a).tone" [routerLink]="['/agenda', a.id]"
                   [attr.aria-label]="a.hora + ' ' + a.pacienteNombre + ' — ' + badge(a).label">
                  <span class="cal__appt-time">{{ a.hora }}</span>
                  <span class="cal__appt-name">{{ a.pacienteNombre }}</span>
                </a>
              }
              @if (cell.appts.length > 3) {
                <a class="cal__more t-small" routerLink="/agenda/dia">+{{ cell.appts.length - 3 }} más</a>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .field--inline { min-width: 220px; }
    .cal-toolbar { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-4); flex-wrap: wrap; }
    .view-toggle { display: inline-flex; border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow: hidden; }
    .view-toggle__btn { height: 36px; padding: 0 var(--space-4); border: none; background: var(--color-bg-elevated); color: var(--color-text-secondary); font-family: var(--font-body); font-size: var(--text-small); cursor: pointer; transition: background-color var(--motion-fast) var(--motion-ease), color var(--motion-fast) var(--motion-ease); }
    .view-toggle__btn:hover { background: var(--color-accent-tint); }
    .view-toggle__btn.is-active { background: var(--color-accent-sky); color: var(--color-text); }
    .view-toggle__btn:focus-visible { box-shadow: inset var(--focus-ring); outline: none; }
    .cal__weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--space-2); margin-bottom: var(--space-2); }
    .cal__weekday { text-align: center; text-transform: uppercase; letter-spacing: 0.04em; }
    .cal__grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--space-2); }
    .cal__cell { min-height: 104px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: var(--space-2); display: flex; flex-direction: column; gap: var(--space-1); }
    .cal__cell.is-out { background: var(--color-bg); opacity: 0.6; }
    .cal__cell.is-today { border-color: var(--color-accent); }
    .cal__daynum { color: var(--color-text-secondary); font-variant-numeric: tabular-nums; align-self: flex-start; padding: 2px; }
    .cal__daynum.is-today { background: var(--color-accent); color: var(--color-text); border-radius: var(--radius-pill); width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; }
    .cal__appts { display: flex; flex-direction: column; gap: 3px; }
    .cal__appt { display: flex; gap: var(--space-1); align-items: baseline; padding: 3px 6px; border-radius: 6px; font-size: 12px; line-height: 1.3; overflow: hidden; }
    .cal__appt-time { font-weight: var(--weight-medium); flex: 0 0 auto; }
    .cal__appt-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cal__appt[data-tone="success"] { background: var(--color-success-bg); color: var(--color-success-text); }
    .cal__appt[data-tone="warning"] { background: var(--color-warning-bg); color: var(--color-warning-text); }
    .cal__appt[data-tone="info"] { background: var(--color-info-bg); color: var(--color-info-text); }
    .cal__appt[data-tone="neutral"] { background: var(--color-neutral-bg); color: var(--color-neutral-text); }
    .cal__appt[data-tone="error"] { background: var(--color-error-bg); color: var(--color-error-text); }
    .cal__more { color: var(--color-accent-deep); padding: 2px 6px; }
    @media (max-width: 767px) {
      .cal__cell { min-height: 72px; }
      .cal__appt-name { display: none; }
      .cal__weekday { font-size: 11px; }
      /* Toggles del calendario touch ≥44px en mobile (DC-086 / DC-088). */
      .view-toggle__btn { height: var(--touch-target-min); }
    }
  `],
})
export class CalendarComponent {
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly professionals = this.store.professionals;
  protected readonly weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  protected readonly views = [{ key: 'mes', label: 'Mes' }, { key: 'semana', label: 'Semana' }, { key: 'dia', label: 'Día' }] as const;
  protected readonly today = '2026-06-01';

  // Vista activa reflejada en query param (UX-005): ?vista=semana | ?vista=dia
  private readonly qp = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly view = computed<'mes' | 'semana' | 'dia'>(() => {
    const v = this.qp().get('vista');
    return v === 'semana' || v === 'dia' ? v : 'mes';
  });
  protected readonly prof = signal('');

  private readonly appts = computed(() => {
    const all = this.store.appointments();
    const p = this.prof();
    return p ? all.filter((a) => a.profesional === p) : all;
  });

  // Junio 2026 (1 jun = lunes). Los turnos del seed están anclados a este mes/entorno.
  protected readonly cells = computed<DayCell[]>(() => {
    const cells: DayCell[] = [];
    const apptsByDay = new Map<string, Appointment[]>();
    for (const a of this.appts()) {
      const list = apptsByDay.get(a.fecha) ?? [];
      list.push(a);
      apptsByDay.set(a.fecha, list);
    }
    for (const list of apptsByDay.values()) list.sort((a, b) => a.hora.localeCompare(b.hora));
    for (let d = 1; d <= 30; d++) {
      const iso = `2026-06-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, inMonth: true, iso, appts: apptsByDay.get(iso) ?? [] });
    }
    for (let d = 1; d <= 5; d++) {
      cells.push({ day: d, inMonth: false, iso: `2026-07-${String(d).padStart(2, '0')}`, appts: [] });
    }
    return cells;
  });

  protected setView(v: 'mes' | 'semana' | 'dia') {
    if (v === 'dia') { this.router.navigate(['/agenda/dia']); return; }
    this.router.navigate([], { relativeTo: this.route, queryParams: { vista: v === 'mes' ? null : v }, queryParamsHandling: 'merge' });
  }
  protected onProf(e: Event) { this.prof.set((e.target as HTMLSelectElement).value); }
  protected badge(a: Appointment) { return appointmentBadge(a.estado); }
}
