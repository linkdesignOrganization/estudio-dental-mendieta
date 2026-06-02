import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { AvatarComponent } from '../../shared/components/avatar.component';
import { StepperComponent } from '../../shared/components/stepper.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ToastService } from '../../shared/components/toast.service';
import { StoreService } from '../../core/persistence/store.service';
import { AppointmentFlowService } from './appointment-flow.service';
import { formatShortDate } from '../../shared/date-format';

const SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
const STEP_ROUTES = ['', '/agenda/nuevo/paciente', '/agenda/nuevo/profesional', '/agenda/nuevo/confirmar'];

/**
 * Agenda — Crear turno (3 pasos, DEMO-015 / UX-020). El estado del wizard vive en
 * AppointmentFlowService (preservado al ir Atrás, pre-relleno desde la ficha). Validación
 * inline: paso 1 exige paciente; paso 2 exige profesional+fecha+hora con disponibilidad
 * real (slot ocupado NO seleccionable, UX-087). "Confirmar" persiste vía store y navega
 * a `/agenda/turno/:idNuevo` con toast. Cancelar con datos pide confirmación (UX-088).
 */
@Component({
  selector: 'app-appointment-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, AvatarComponent, StepperComponent, EmptyStateComponent, ConfirmDialogComponent],
  template: `
    <button type="button" class="back-link t-small" (click)="cancel()"><app-icon name="arrow-left" [size]="16" /> Agenda</button>

    <div class="wiz">
      <header class="wiz__head"><h2 class="t-display">Nuevo turno</h2></header>
      <app-stepper [steps]="['Paciente', 'Profesional y fecha', 'Confirmación']" [current]="step()" />

      <section class="surface-card is-lg wiz__card">
        @switch (step()) {
          @case (1) {
            <h3 class="t-title wiz__step-title">Seleccioná el paciente</h3>
            <div class="field">
              <label class="field__label" for="w-search">Buscar paciente</label>
              <div class="search-pill">
                <app-icon name="magnifying-glass" [size]="16" />
                <input id="w-search" class="search-pill__input" type="search" placeholder="Nombre o DNI…"
                       aria-label="Buscar paciente" [value]="query()" (input)="onQuery($event)" />
              </div>
            </div>
            @if (filteredPatients().length) {
              <ul class="wiz__patients">
                @for (p of filteredPatients(); track p.id) {
                  <li>
                    <button type="button" class="wiz__patient" [class.is-selected]="flow.pacienteId() === p.id" (click)="flow.setPaciente(p.id)">
                      <app-avatar [src]="p.fotoPath" [name]="p.nombre + ' ' + p.apellido" size="sm" />
                      <span class="wiz__patient-body">
                        <span class="t-body-medium">{{ p.nombre }} {{ p.apellido }}</span>
                        <span class="t-small t-secondary">{{ p.edad }} años · {{ p.obraSocial }}</span>
                      </span>
                      @if (flow.pacienteId() === p.id) { <app-icon name="check-circle" [size]="20" /> }
                    </button>
                  </li>
                }
              </ul>
            } @else {
              <app-empty-state icon="magnifying-glass" title="Sin resultados"
                description="No encontramos pacientes con ese criterio. Probá con otro nombre." />
            }
            @if (showStep1Error()) {
              <span class="field__error"><app-icon name="warning" [size]="16" /> Elegí un paciente para continuar.</span>
            }
          }
          @case (2) {
            <h3 class="t-title wiz__step-title">Profesional, fecha y hora</h3>
            <div class="form-grid">
              <div class="field">
                <label class="field__label" for="w-prof">Profesional</label>
                <select id="w-prof" class="select-edm" [value]="flow.profesionalId()" (change)="onProf($event)">
                  <option value="">Elegí un profesional</option>
                  @for (p of professionals(); track p.id) { <option [value]="p.id">{{ p.nombre }} · {{ p.especialidad }}</option> }
                </select>
              </div>
              <div class="field">
                <label class="field__label" for="w-date">Fecha</label>
                <input id="w-date" class="input-edm" type="date" [value]="flow.fecha()" [min]="minDate" (change)="onDate($event)" />
              </div>
            </div>
            <div class="field">
              <span class="field__label">Horarios disponibles</span>
              @if (flow.profesionalId() && flow.fecha()) {
                <div class="wiz__slots">
                  @for (s of SLOTS; track s) {
                    <button type="button" class="wiz__slot" [class.is-selected]="flow.hora() === s"
                            [disabled]="isOccupied(s)" [attr.title]="isOccupied(s) ? 'Horario ocupado' : null"
                            (click)="flow.hora.set(s)">{{ s }}</button>
                  }
                </div>
                <span class="t-small t-secondary wiz__hint">Los horarios ocupados de este profesional no están disponibles.</span>
              } @else {
                <span class="t-small t-secondary">Elegí profesional y fecha para ver los horarios disponibles.</span>
              }
            </div>
            @if (showStep2Error()) {
              <span class="field__error"><app-icon name="warning" [size]="16" /> Completá profesional, fecha y horario para continuar.</span>
            }
          }
          @case (3) {
            <h3 class="t-title wiz__step-title">Tratamiento y confirmación</h3>
            <div class="field">
              <label class="field__label" for="w-treat">Tipo de tratamiento</label>
              <select id="w-treat" class="select-edm" [value]="flow.tipoTratamientoId()" (change)="onTipo($event)">
                @for (t of types(); track t.id) { <option [value]="t.id">{{ t.nombre }}</option> }
              </select>
            </div>
            <div class="field">
              <label class="field__label" for="w-notas">Notas (opcional)</label>
              <input id="w-notas" class="input-edm" type="text" placeholder="Indicaciones o motivo" [value]="flow.notas()" (input)="onNotas($event)" />
            </div>
            <div class="wiz__summary surface-bordered">
              <div class="icon-chip"><span class="icon-chip__glyph"><app-icon name="user" [size]="16" /></span><div class="icon-chip__body"><span class="icon-chip__label">Paciente</span><span class="icon-chip__value">{{ patientName() }}</span></div></div>
              <div class="icon-chip"><span class="icon-chip__glyph"><app-icon name="user-circle" [size]="16" /></span><div class="icon-chip__body"><span class="icon-chip__label">Profesional</span><span class="icon-chip__value">{{ profName() }}</span></div></div>
              <div class="icon-chip"><span class="icon-chip__glyph"><app-icon name="calendar-blank" [size]="16" /></span><div class="icon-chip__body"><span class="icon-chip__label">Fecha y hora</span><span class="icon-chip__value">{{ fechaLabel() }} · {{ flow.hora() || '—' }}</span></div></div>
            </div>
          }
        }

        <div class="wiz__actions">
          @if (step() > 1) { <button type="button" class="btn-edm btn-edm--secondary" (click)="back()"><app-icon name="arrow-left" [size]="18" /> Atrás</button> }
          <div class="wiz__spacer"></div>
          @if (step() < 3) {
            <button type="button" class="btn-edm btn-edm--primary" (click)="next()">Siguiente <app-icon name="arrow-right" [size]="18" /></button>
          } @else {
            <button type="button" class="btn-edm btn-edm--primary" (click)="confirm()"><app-icon name="check" [size]="18" /> Confirmar turno</button>
          }
        </div>
      </section>
    </div>

    @if (confirmCancel()) {
      <app-confirm-dialog
        title="Descartar el turno" message="Tenés datos cargados en este turno. ¿Querés descartarlo?"
        confirmLabel="Sí, descartar" cancelLabel="Seguir editando" [destructive]="true"
        (confirm)="doCancel()" (cancel)="confirmCancel.set(false)" />
    }
  `,
  styles: [`
    :host { display: block; }
    .back-link { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-accent-deep); margin-bottom: var(--space-5); background: none; border: none; cursor: pointer; font-family: var(--font-body); font-size: var(--text-small); padding: 0; }
    .back-link:hover { text-decoration: underline; }
    .wiz { display: flex; flex-direction: column; gap: var(--space-6); max-width: 720px; margin: 0 auto; }
    .wiz__head h2 { color: var(--color-text); }
    .wiz__card { display: flex; flex-direction: column; gap: var(--space-5); }
    .wiz__step-title { color: var(--color-text); }
    .search-pill { display: inline-flex; align-items: center; gap: var(--space-2); height: var(--control-height); padding: 0 var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-elevated); color: var(--color-text-secondary); }
    .search-pill:focus-within { border-color: var(--color-accent-deep); box-shadow: var(--focus-ring); }
    .search-pill__input { border: none; outline: none; background: transparent; font-family: var(--font-body); font-size: var(--text-body); color: var(--color-text); width: 100%; }
    .wiz__patients { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-2); max-height: 320px; overflow-y: auto; }
    .wiz__patient { display: flex; align-items: center; gap: var(--space-3); width: 100%; min-height: 56px; padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-elevated); cursor: pointer; text-align: left; color: var(--color-accent-deep); transition: background-color var(--motion-fast) var(--motion-ease), border-color var(--motion-fast) var(--motion-ease); }
    .wiz__patient:hover { background: var(--color-accent-tint); }
    .wiz__patient.is-selected { background: var(--color-accent-tint); border-color: var(--color-accent); }
    .wiz__patient:focus-visible { box-shadow: var(--focus-ring); outline: none; }
    .wiz__patient-body { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .wiz__slots { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .wiz__slot { min-height: 40px; min-width: 64px; padding: 0 var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-elevated); color: var(--color-text); cursor: pointer; font-family: var(--font-body); font-size: var(--text-body); transition: background-color var(--motion-fast) var(--motion-ease), border-color var(--motion-fast) var(--motion-ease); }
    .wiz__slot:hover:not(:disabled) { background: var(--color-accent-tint); }
    .wiz__slot.is-selected { background: var(--color-accent-sky); border-color: var(--color-accent); }
    .wiz__slot:disabled { opacity: 0.4; cursor: not-allowed; text-decoration: line-through; }
    .wiz__slot:focus-visible { box-shadow: var(--focus-ring); outline: none; }
    .wiz__hint { display: block; margin-top: var(--space-2); }
    .wiz__summary { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
    .wiz__actions { display: flex; align-items: center; gap: var(--space-3); }
    .wiz__spacer { flex: 1; }
    .field__error { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-error-text); font-size: var(--text-small); }
    @media (max-width: 767px) { .form-grid { grid-template-columns: 1fr; } .wiz__actions .btn-edm { flex: 1; } .wiz__slot { min-height: var(--touch-target-min); } }
  `],
})
export class AppointmentCreateComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly store = inject(StoreService);
  protected readonly flow = inject(AppointmentFlowService);

  protected readonly SLOTS = SLOTS;
  protected readonly minDate = '2026-06-01';
  protected readonly professionals = this.store.professionals;
  protected readonly types = this.store.treatmentTypes;

  protected readonly step = signal<number>(this.route.snapshot.data['step'] ?? 1);
  protected readonly query = signal('');
  protected readonly step1Touched = signal(false);
  protected readonly step2Touched = signal(false);
  protected readonly confirmCancel = signal(false);

  constructor() {
    // Si se entra al paso 1 directamente (no por pre-relleno), arrancamos limpio.
    if ((this.route.snapshot.data['step'] ?? 1) === 1 && !this.flow.tienePaciente()) {
      this.flow.reset();
    }
    // default de tipo de tratamiento si está vacío
    if (!this.flow.tipoTratamientoId() && this.types().length) {
      this.flow.tipoTratamientoId.set(this.types()[0].id);
    }
  }

  protected readonly filteredPatients = computed(() => {
    const all = this.store.patients();
    const q = this.query().trim().toLowerCase();
    const list = q
      ? all.filter((p) => `${p.nombre} ${p.apellido}`.toLowerCase().includes(q) || p.dni.replace(/\./g, '').includes(q.replace(/\./g, '')))
      : all;
    return list.slice(0, 30);
  });

  protected readonly showStep1Error = computed(() => this.step1Touched() && !this.flow.tienePaciente());
  protected readonly showStep2Error = computed(() => this.step2Touched() && !(this.flow.profesionalId() && this.flow.fecha() && this.flow.hora()));

  protected isOccupied(slot: string): boolean {
    const prof = this.flow.profesionalId();
    const fecha = this.flow.fecha();
    if (!prof || !fecha) return false;
    return this.store.occupiedSlots(prof, fecha).has(slot);
  }

  protected patientName(): string {
    const p = this.store.patientById(this.flow.pacienteId());
    return p ? `${p.nombre} ${p.apellido}` : '—';
  }
  protected profName(): string {
    return this.professionals().find((p) => p.id === this.flow.profesionalId())?.nombre ?? '—';
  }
  protected fechaLabel(): string {
    const iso = this.flow.fecha();
    return iso ? formatShortDate(iso) : '—';
  }

  protected onQuery(e: Event) { this.query.set((e.target as HTMLInputElement).value); }
  protected onProf(e: Event) { this.flow.profesionalId.set((e.target as HTMLSelectElement).value); this.flow.hora.set(''); }
  protected onDate(e: Event) { this.flow.fecha.set((e.target as HTMLInputElement).value); this.flow.hora.set(''); }
  protected onTipo(e: Event) { this.flow.tipoTratamientoId.set((e.target as HTMLSelectElement).value); }
  protected onNotas(e: Event) { this.flow.notas.set((e.target as HTMLInputElement).value); }

  protected next() {
    if (this.step() === 1) {
      this.step1Touched.set(true);
      if (!this.flow.tienePaciente()) return;
    }
    if (this.step() === 2) {
      this.step2Touched.set(true);
      if (!(this.flow.profesionalId() && this.flow.fecha() && this.flow.hora())) return;
    }
    const target = Math.min(3, this.step() + 1);
    this.router.navigateByUrl(STEP_ROUTES[target]);
    this.step.set(target);
  }
  protected back() {
    const target = Math.max(1, this.step() - 1);
    this.router.navigateByUrl(STEP_ROUTES[target]);
    this.step.set(target);
  }

  protected confirm() {
    const tipo = this.flow.tipoTratamientoId() || this.types()[0]?.id;
    const id = this.store.crearTurno({
      pacienteId: this.flow.pacienteId(),
      profesionalId: this.flow.profesionalId(),
      fecha: this.flow.fecha(),
      hora: this.flow.hora(),
      duracionMin: this.flow.duracionMin(),
      tipoTratamientoId: tipo,
      notas: this.flow.notas(),
    });
    this.flow.reset();
    this.toast.success('Turno agendado.');
    this.router.navigate(['/agenda', id]);
  }

  protected cancel() {
    if (this.flow.tienePaciente() || this.flow.fecha() || this.flow.hora()) this.confirmCancel.set(true);
    else this.doCancel();
  }
  protected doCancel() {
    this.confirmCancel.set(false);
    this.flow.reset();
    this.router.navigate(['/agenda']);
  }
}
