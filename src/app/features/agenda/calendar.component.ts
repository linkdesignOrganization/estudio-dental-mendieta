import { Component, ChangeDetectionStrategy, signal, computed, inject, DestroyRef } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconComponent } from '../../shared/components/icon.component';
import { SkeletonComponent } from '../../shared/components/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { WeekViewComponent, WeekDay } from './week-view.component';
import { AgendaListViewComponent, DayGroup } from './agenda-list-view.component';
import { CalApptBlockComponent } from '../../shared/components/cal-appt-block.component';
import { StoreService } from '../../core/persistence/store.service';
import { Appointment, AppointmentStatus } from '../../core/models/models';
import { parseIsoDate, formatLongDate } from '../../shared/date-format';

interface DayCell { day: number; inMonth: boolean; iso: string; appts: Appointment[]; }

const ESTADOS: { key: AppointmentStatus; label: string }[] = [
  { key: 'confirmado', label: 'Confirmado' },
  { key: 'en-espera', label: 'En espera' },
  { key: 'atendiendo', label: 'Atendiendo' },
  { key: 'terminado', label: 'Terminado' },
  { key: 'cancelado', label: 'Cancelado' },
];

/**
 * Agenda — Calendario (DEMO-007 / DC-036 / DC-100..102 / REQ-059..069). Header (título + 1
 * filtro por profesional + "Nuevo turno") sobre el calendario. Toggles Mes/Semana/Día con la
 * vista activa reflejada en `?vista` (Día abre la lista del día en ruta propia). Filtros
 * secundarios (estado/tipo) detrás de un botón "Filtros" (NO siempre visibles). Turnos =
 * bloques coloreados por estado, clickeables → detalle. Vacío → empty state con guidance.
 *
 * Ajuste mobile (feedback demo): en <768px la agenda arranca en vista "agenda/lista" (turnos
 * como filas cómodas ≥44px), no en el grid con chips chicos. Mes/Semana quedan disponibles
 * vía toggle pero son secundarias en mobile. En desktop el default sigue siendo Mes.
 */
@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, SkeletonComponent, EmptyStateComponent, WeekViewComponent, AgendaListViewComponent, CalApptBlockComponent],
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
      <div class="cal-toolbar__left">
        <div class="view-toggle" role="group" aria-label="Vista del calendario">
          @for (v of views; track v.key) {
            <button type="button" class="view-toggle__btn" [class.is-active]="activeToggle() === v.key" (click)="setView(v.key)">{{ v.label }}</button>
          }
        </div>
        <div class="filters">
          <button type="button" class="btn-edm btn-edm--ghost filters__toggle"
                  [class.is-active]="activeFilters() > 0" [attr.aria-expanded]="filtersOpen()"
                  (click)="filtersOpen.set(!filtersOpen())">
            <app-icon name="funnel" [size]="18" /> Filtros
            @if (activeFilters()) { <span class="filters__count">{{ activeFilters() }}</span> }
          </button>
          @if (filtersOpen()) {
            <div class="filters__panel surface-card" role="group" aria-label="Filtros de la agenda">
              <div class="field">
                <label class="field__label" for="f-estado">Estado</label>
                <select id="f-estado" class="select-edm" [value]="fEstado()" (change)="onEstado($event)">
                  <option value="">Todos</option>
                  @for (e of estados; track e.key) { <option [value]="e.key">{{ e.label }}</option> }
                </select>
              </div>
              <div class="field">
                <label class="field__label" for="f-tipo">Tipo de tratamiento</label>
                <select id="f-tipo" class="select-edm" [value]="fTipo()" (change)="onTipo($event)">
                  <option value="">Todos</option>
                  @for (t of types(); track t.id) { <option [value]="t.id">{{ t.nombre }}</option> }
                </select>
              </div>
              <div class="filters__panel-foot">
                <button type="button" class="btn-edm btn-edm--ghost" [disabled]="!activeFilters()" (click)="clearFilters()">Limpiar filtros</button>
              </div>
            </div>
          }
        </div>
      </div>
      <a class="btn-edm btn-edm--ghost cal-toolbar__list" routerLink="/agenda/dia">
        <app-icon name="list-bullets" [size]="18" /> Ver lista del día
      </a>
    </div>

    @if (loading()) {
      <section class="surface-card is-lg" aria-busy="true" aria-label="Cargando la agenda">
        <div class="cal-skel">@for (i of [0,1,2,3,4,5]; track i) { <app-skeleton preset="card-row" [index]="i" /> }</div>
      </section>
    } @else {
      @switch (effectiveView()) {
        @case ('semana') {
          <app-week-view [days]="weekDays()" [hasAny]="hasAnyApptThisWeek()" />
        }
        @case ('agenda') {
          <app-agenda-list-view [groups]="dayGroups()" />
        }
        @default {
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
                      <app-cal-appt-block [appt]="a" layout="inline" />
                    }
                    @if (cell.appts.length > 3) {
                      <a class="cal__more t-small" routerLink="/agenda/dia">+{{ cell.appts.length - 3 }} más</a>
                    }
                  </div>
                </div>
              }
            </div>
            @if (!hasAnyApptThisMonth()) {
              <app-empty-state icon="calendar-blank" title="No hay turnos en este período"
                description="Creá uno con Nuevo turno para empezar a llenar la agenda." />
            }
          </section>
        }
      }
    }
  `,
  styles: [`
    :host { display: block; }
    .field--inline { min-width: 220px; }
    .cal-toolbar { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-4); flex-wrap: wrap; }
    .cal-toolbar__left { display: flex; align-items: flex-start; gap: var(--space-3); flex-wrap: wrap; }
    .view-toggle { display: inline-flex; border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow: hidden; }
    .view-toggle__btn { height: 36px; padding: 0 var(--space-4); border: none; background: var(--color-bg-elevated); color: var(--color-text-secondary); font-family: var(--font-body); font-size: var(--text-small); cursor: pointer; transition: background-color var(--motion-fast) var(--motion-ease), color var(--motion-fast) var(--motion-ease); }
    .view-toggle__btn:hover { background: var(--color-accent-tint); }
    .view-toggle__btn.is-active { background: var(--color-accent-sky); color: var(--color-text); }
    .view-toggle__btn:focus-visible { box-shadow: inset var(--focus-ring); outline: none; }

    .filters { position: relative; }
    .filters__toggle.is-active { border-color: var(--color-accent-deep); color: var(--color-accent-deep); }
    .filters__count { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; padding: 0 5px; border-radius: var(--radius-pill); background: var(--color-accent-deep); color: #fff; font-size: 11px; font-weight: var(--weight-medium); }
    .filters__panel { position: absolute; left: 0; top: calc(100% + 6px); z-index: 60; width: 280px; box-shadow: var(--shadow-overlay); display: flex; flex-direction: column; gap: var(--space-4); }
    .filters__panel-foot { display: flex; justify-content: flex-end; padding-top: var(--space-1); border-top: 1px solid var(--color-border); }

    .cal-skel { padding: var(--space-2) 0; }
    .cal-toolbar__list { white-space: nowrap; }

    /* Vista mensual (grid 7 columnas) */
    .cal__weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--space-2); margin-bottom: var(--space-2); }
    .cal__weekday { text-align: center; text-transform: uppercase; letter-spacing: 0.04em; }
    .cal__grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--space-2); }
    .cal__cell { min-height: 104px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: var(--space-2); display: flex; flex-direction: column; gap: var(--space-1); }
    .cal__cell.is-out { background: var(--color-bg); opacity: 0.6; }
    .cal__cell.is-today { border-color: var(--color-accent); }
    .cal__daynum { color: var(--color-text-secondary); font-variant-numeric: tabular-nums; align-self: flex-start; padding: 2px; }
    .cal__daynum.is-today { background: var(--color-accent); color: var(--color-text); border-radius: var(--radius-pill); width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; }
    .cal__appts { display: flex; flex-direction: column; gap: 3px; }
    .cal__more { color: var(--color-accent-deep); padding: 2px 6px; }

    @media (max-width: 767px) {
      .cal-toolbar { flex-direction: column; align-items: stretch; }
      .cal-toolbar__left { justify-content: space-between; }
      .cal-toolbar__list { display: none; }
      /* Toggles del calendario touch ≥44px en mobile (DC-086 / DC-088). */
      .view-toggle__btn { height: var(--touch-target-min); }
      .filters__toggle { min-height: var(--touch-target-min); }
      .filters__panel { width: min(280px, 78vw); }
      .cal__cell { min-height: 64px; }
      .cal__weekday { font-size: 11px; }
    }
  `],
})
export class CalendarComponent {
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly professionals = this.store.professionals;
  protected readonly types = this.store.treatmentTypes;
  protected readonly weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  protected readonly views = [{ key: 'mes', label: 'Mes' }, { key: 'semana', label: 'Semana' }, { key: 'dia', label: 'Día' }] as const;
  protected readonly estados = ESTADOS;
  protected readonly today = '2026-06-01';
  // Skeletons mientras el store no esté hidratado (REQ-067). El guard normalmente hidrata
  // antes del 1er render; la skeleton cubre la carrera del deep-link/refresh.
  protected readonly loading = computed(() => !this.store.ready());

  // Vista activa reflejada en query param (UX-005): ?vista=semana | ?vista=mes (Día = ruta propia).
  private readonly qp = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly view = computed<'mes' | 'semana' | null>(() => {
    const v = this.qp().get('vista');
    return v === 'semana' || v === 'mes' ? v : null;
  });

  // Viewport reactivo: en mobile, sin vista explícita, la agenda arranca en lista (feedback demo).
  private readonly isMobile = signal(typeof matchMedia !== 'undefined' && matchMedia('(max-width: 767px)').matches);

  /** Vista efectivamente renderizada: respeta el toggle si lo hay; si no, default responsivo. */
  protected readonly effectiveView = computed<'mes' | 'semana' | 'agenda'>(() => {
    const v = this.view();
    if (v) return v;
    return this.isMobile() ? 'agenda' : 'mes';
  });
  /**
   * Toggle marcado como activo = la vista realmente renderizada. En desktop sin param se
   * resalta "Mes" (default real); en mobile el default es la lista (ninguno de Mes/Semana/Día).
   */
  protected readonly activeToggle = computed<'mes' | 'semana' | 'agenda'>(() => this.effectiveView());

  protected readonly prof = signal('');
  protected readonly fEstado = signal<'' | AppointmentStatus>('');
  protected readonly fTipo = signal('');
  protected readonly filtersOpen = signal(false);
  protected readonly activeFilters = computed(() => (this.fEstado() ? 1 : 0) + (this.fTipo() ? 1 : 0));

  constructor() {
    if (typeof matchMedia !== 'undefined') {
      const mq = matchMedia('(max-width: 767px)');
      const onChange = (e: MediaQueryListEvent) => this.isMobile.set(e.matches);
      mq.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => mq.removeEventListener('change', onChange));
    }
  }

  /** Turnos filtrados por profesional + filtros secundarios (estado/tipo). */
  private readonly appts = computed(() => {
    const p = this.prof();
    const est = this.fEstado();
    const tipo = this.fTipo();
    return this.store.appointments().filter((a) =>
      (!p || a.profesional === p) &&
      (!est || a.estado === est) &&
      (!tipo || a.tipoTratamientoId === tipo),
    );
  });

  /** Turnos agrupados por fecha (yyyy-mm-dd) y ordenados por hora dentro del día. */
  private readonly apptsByDay = computed(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of this.appts()) {
      const list = map.get(a.fecha) ?? [];
      list.push(a);
      map.set(a.fecha, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.hora.localeCompare(b.hora));
    return map;
  });

  // Junio 2026 (1 jun = lunes). Los turnos del seed están anclados a este mes/entorno.
  protected readonly cells = computed<DayCell[]>(() => {
    const byDay = this.apptsByDay();
    const cells: DayCell[] = [];
    for (let d = 1; d <= 30; d++) {
      const iso = `2026-06-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, inMonth: true, iso, appts: byDay.get(iso) ?? [] });
    }
    for (let d = 1; d <= 5; d++) {
      cells.push({ day: d, inMonth: false, iso: `2026-07-${String(d).padStart(2, '0')}`, appts: [] });
    }
    return cells;
  });
  protected readonly hasAnyApptThisMonth = computed(() => this.cells().some((c) => c.inMonth && c.appts.length > 0));

  /** Semana actual: lunes→domingo que contiene "hoy" (2026-06-01 = lunes → 1..7 jun). */
  protected readonly weekDays = computed<WeekDay[]>(() => {
    const byDay = this.apptsByDay();
    const monday = startOfWeek(parseIsoDate(this.today));
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(monday, i);
      const iso = isoOfDate(date);
      return { iso, weekday: dias[i], day: date.getDate(), isToday: iso === this.today, appts: byDay.get(iso) ?? [] };
    });
  });
  protected readonly hasAnyApptThisWeek = computed(() => this.weekDays().some((d) => d.appts.length > 0));

  /** Vista agenda/lista: desde hoy en adelante, agrupada por día (default mobile). */
  protected readonly dayGroups = computed<DayGroup[]>(() => {
    const groups: DayGroup[] = [];
    const byDay = this.apptsByDay();
    const fechas = [...byDay.keys()].filter((iso) => iso >= this.today).sort();
    for (const iso of fechas) {
      const appts = byDay.get(iso) ?? [];
      if (appts.length) groups.push({ iso, titulo: tituloDia(iso, this.today), appts });
    }
    return groups;
  });

  protected setView(v: 'mes' | 'semana' | 'dia') {
    if (v === 'dia') { this.router.navigate(['/agenda/dia']); return; }
    this.router.navigate([], { relativeTo: this.route, queryParams: { vista: v }, queryParamsHandling: 'merge' });
  }
  protected onProf(e: Event) { this.prof.set((e.target as HTMLSelectElement).value); }
  protected onEstado(e: Event) { this.fEstado.set((e.target as HTMLSelectElement).value as '' | AppointmentStatus); }
  protected onTipo(e: Event) { this.fTipo.set((e.target as HTMLSelectElement).value); }
  protected clearFilters() { this.fEstado.set(''); this.fTipo.set(''); }
}

// ----------------------------------------------------------- helpers de fecha --
function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const dow = (date.getDay() + 6) % 7; // lunes = 0
  date.setDate(date.getDate() - dow);
  return date;
}
function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
function isoOfDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
/** "Hoy", "Mañana" o la fecha larga, para encabezar cada grupo de la lista. */
function tituloDia(iso: string, today: string): string {
  if (iso === today) return 'Hoy';
  const t = parseIsoDate(today);
  const tomorrow = isoOfDate(addDays(t, 1));
  if (iso === tomorrow) return 'Mañana';
  return formatLongDate(iso);
}
