import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { StepperComponent } from '../../shared/components/stepper.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ToastService } from '../../shared/components/toast.service';
import { StoreService } from '../../core/persistence/store.service';
import { Genero } from '../../core/models/models';

/**
 * Crear paciente (2 pasos, UX-024) / Editar (form precargado, UX-025). Validación inline
 * de requeridos + formato DNI (no avanza sin requeridos — UX-050). Sin foto → fallback a
 * iniciales (UX-024). Persiste vía store. "Atrás" preserva datos del paso 1. "Cancelar"
 * con cambios pide confirmación (UX-088).
 */
@Component({
  selector: 'app-patient-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, StepperComponent, ConfirmDialogComponent],
  template: `
    <button type="button" class="back-link t-small" (click)="cancel()"><app-icon name="arrow-left" [size]="16" /> Pacientes</button>

    <div class="create">
      <header class="create__head">
        <h2 class="t-display">{{ isEdit() ? 'Editar paciente' : 'Nuevo paciente' }}</h2>
      </header>

      @if (!isEdit()) {
        <app-stepper [steps]="['Datos personales', 'Datos clínicos']" [current]="step()" />
      }

      <section class="surface-card is-lg create__card">
        @if (step() === 1) {
          <h3 class="t-title create__step-title">Datos personales</h3>
          <div class="form-grid">
            <div class="field">
              <label class="field__label" for="c-nombre">Nombre</label>
              <input id="c-nombre" class="input-edm" [class.is-invalid]="err('nombre')" type="text" placeholder="Ej. Valentina" [value]="nombre()" (input)="set('nombre', $event)" />
              @if (err('nombre')) { <span class="field__error"><app-icon name="warning" [size]="16" /> Ingresá el nombre.</span> }
            </div>
            <div class="field">
              <label class="field__label" for="c-apellido">Apellido</label>
              <input id="c-apellido" class="input-edm" [class.is-invalid]="err('apellido')" type="text" placeholder="Ej. Gómez" [value]="apellido()" (input)="set('apellido', $event)" />
              @if (err('apellido')) { <span class="field__error"><app-icon name="warning" [size]="16" /> Ingresá el apellido.</span> }
            </div>
            <div class="field">
              <label class="field__label" for="c-dni">DNI</label>
              <input id="c-dni" class="input-edm" [class.is-invalid]="err('dni')" type="text" placeholder="00.000.000" [value]="dni()" (input)="set('dni', $event)" />
              @if (err('dni')) { <span class="field__error"><app-icon name="warning" [size]="16" /> Ingresá un DNI válido.</span> }
            </div>
            <div class="field"><label class="field__label" for="c-nac">Fecha de nacimiento</label><input id="c-nac" class="input-edm" type="date" [value]="nacimiento()" (input)="set('nacimiento', $event)" /></div>
            <div class="field"><label class="field__label" for="c-tel">Teléfono</label><input id="c-tel" class="input-edm" type="tel" placeholder="+54 11 0000-0000" [value]="telefono()" (input)="set('telefono', $event)" /></div>
            <div class="field"><label class="field__label" for="c-email">Correo</label><input id="c-email" class="input-edm" type="email" placeholder="correo@ejemplo.com" [value]="email()" (input)="set('email', $event)" /></div>
            <div class="field field--full"><label class="field__label" for="c-dir">Dirección</label><input id="c-dir" class="input-edm" type="text" placeholder="Calle, número, ciudad" [value]="direccion()" (input)="set('direccion', $event)" /></div>
          </div>
        } @else {
          <h3 class="t-title create__step-title">Datos clínicos y de cobertura</h3>
          <div class="form-grid">
            <div class="field">
              <label class="field__label" for="c-os">Obra social</label>
              <select id="c-os" class="select-edm" [value]="obraSocialId()" (change)="set('obraSocialId', $event)">
                @for (os of obrasSociales(); track os.id) { <option [value]="os.id">{{ os.nombre }}</option> }
              </select>
            </div>
            <div class="field">
              <label class="field__label" for="c-prof">Profesional de cabecera</label>
              <select id="c-prof" class="select-edm" [value]="profesionalId()" (change)="set('profesionalId', $event)">
                @for (prof of professionals(); track prof.id) { <option [value]="prof.id">{{ prof.nombre }}</option> }
              </select>
            </div>
            <div class="field field--full"><label class="field__label" for="c-alergias">Alergias</label><input id="c-alergias" class="input-edm" type="text" placeholder="Separadas por coma" [value]="alergias()" (input)="set('alergias', $event)" /></div>
            <div class="field field--full"><label class="field__label" for="c-medic">Medicación</label><input id="c-medic" class="input-edm" type="text" placeholder="Separada por coma" [value]="medicacion()" (input)="set('medicacion', $event)" /></div>
            <div class="field field--full"><label class="field__label" for="c-obs">Observaciones</label><textarea id="c-obs" class="textarea-edm" placeholder="Notas clínicas relevantes" (input)="set('observaciones', $event)">{{ observaciones() }}</textarea></div>
          </div>
        }

        <div class="create__actions">
          @if (step() === 2 && !isEdit()) {
            <button type="button" class="btn-edm btn-edm--secondary" (click)="step.set(1)">
              <app-icon name="arrow-left" [size]="18" /> Atrás
            </button>
          }
          <div class="create__spacer"></div>
          @if (step() === 1 && !isEdit()) {
            <button type="button" class="btn-edm btn-edm--primary" (click)="goStep2()">
              Siguiente <app-icon name="arrow-right" [size]="18" />
            </button>
          } @else {
            <button type="button" class="btn-edm btn-edm--primary" (click)="save()">
              <app-icon name="check" [size]="18" /> {{ isEdit() ? 'Guardar cambios' : 'Crear paciente' }}
            </button>
          }
        </div>
      </section>
    </div>

    @if (confirmCancel()) {
      <app-confirm-dialog
        [title]="isEdit() ? 'Descartar los cambios' : 'Descartar el paciente'"
        message="Tenés datos cargados. ¿Querés descartar y salir?"
        confirmLabel="Sí, descartar" cancelLabel="Seguir editando" [destructive]="true"
        (confirm)="doCancel()" (cancel)="confirmCancel.set(false)" />
    }
  `,
  styles: [`
    :host { display: block; }
    .back-link { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-accent-deep); margin-bottom: var(--space-5); background: none; border: none; cursor: pointer; font-family: var(--font-body); font-size: var(--text-small); padding: 0; }
    .back-link:hover { text-decoration: underline; }
    .create { display: flex; flex-direction: column; gap: var(--space-6); max-width: 760px; margin: 0 auto; }
    .create__head h2 { color: var(--color-text); }
    .create__card { display: flex; flex-direction: column; gap: var(--space-6); }
    .create__step-title { color: var(--color-text); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .field__error { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-error-text); font-size: var(--text-small); margin-top: var(--space-1); }
    .field--full { grid-column: 1 / -1; }
    .create__actions { display: flex; align-items: center; gap: var(--space-3); }
    .create__spacer { flex: 1; }
    @media (max-width: 767px) {
      .form-grid { grid-template-columns: 1fr; }
      .create__actions .btn-edm { flex: 1; }
    }
  `],
})
export class PatientCreateComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly store = inject(StoreService);

  protected readonly professionals = this.store.professionals;
  protected readonly obrasSociales = this.store.obrasSocialesRaw;

  protected readonly isEdit = signal<boolean>(this.route.snapshot.data['edit'] === true);
  protected readonly editId = signal<string>(this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly step = signal<number>(this.route.snapshot.data['step'] === 2 ? 2 : 1);
  protected readonly touched = signal(false);
  protected readonly confirmCancel = signal(false);

  // campos del formulario
  protected readonly nombre = signal('');
  protected readonly apellido = signal('');
  protected readonly dni = signal('');
  protected readonly nacimiento = signal('');
  protected readonly telefono = signal('');
  protected readonly email = signal('');
  protected readonly direccion = signal('');
  protected readonly obraSocialId = signal('os-particular');
  protected readonly profesionalId = signal('prof-01');
  protected readonly alergias = signal('');
  protected readonly medicacion = signal('');
  protected readonly observaciones = signal('');

  constructor() {
    // precarga en edición
    if (this.isEdit()) {
      const p = this.store.patientEntity(this.editId());
      if (p) {
        this.nombre.set(p.nombre);
        this.apellido.set(p.apellido);
        this.dni.set(p.dni);
        this.telefono.set(p.telefono);
        this.email.set(p.email);
        this.direccion.set(p.direccion);
        this.obraSocialId.set(p.obraSocialId);
        this.profesionalId.set(p.profesionalId);
        this.alergias.set(p.alergias.join(', '));
        this.medicacion.set(p.medicacion.join(', '));
        this.observaciones.set(p.observaciones);
        this.nacimiento.set(toIsoDate(p.fechaNacimiento));
      }
    } else if (this.obrasSociales().length) {
      this.obraSocialId.set(this.obrasSociales()[0].id);
    }
  }

  private readonly dniValido = computed(() => {
    const d = this.dni().replace(/\D/g, '');
    return d.length >= 7 && d.length <= 8;
  });
  protected err(field: 'nombre' | 'apellido' | 'dni'): boolean {
    if (!this.touched()) return false;
    if (field === 'nombre') return !this.nombre().trim();
    if (field === 'apellido') return !this.apellido().trim();
    return !this.dniValido();
  }
  private step1Valido(): boolean {
    return !!this.nombre().trim() && !!this.apellido().trim() && this.dniValido();
  }

  protected set(field: string, e: Event) {
    const v = (e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
    ({
      nombre: this.nombre, apellido: this.apellido, dni: this.dni, nacimiento: this.nacimiento,
      telefono: this.telefono, email: this.email, direccion: this.direccion, obraSocialId: this.obraSocialId,
      profesionalId: this.profesionalId, alergias: this.alergias, medicacion: this.medicacion, observaciones: this.observaciones,
    } as Record<string, ReturnType<typeof signal<string>>>)[field]?.set(v);
  }

  protected goStep2() {
    this.touched.set(true);
    if (!this.step1Valido()) return;
    this.step.set(2);
  }

  protected save() {
    this.touched.set(true);
    if (!this.step1Valido()) { this.step.set(1); return; }
    const payload = {
      nombre: this.nombre().trim(),
      apellido: this.apellido().trim(),
      dni: this.dni().trim(),
      fechaNacimiento: fromIsoDate(this.nacimiento()),
      edad: ageFromIso(this.nacimiento()),
      telefono: this.telefono().trim(),
      email: this.email().trim(),
      direccion: this.direccion().trim(),
      obraSocialId: this.obraSocialId(),
      profesionalId: this.profesionalId(),
      genero: 'mujer' as Genero,
      alergias: splitList(this.alergias()),
      medicacion: splitList(this.medicacion()),
      observaciones: this.observaciones().trim(),
    };
    if (this.isEdit()) {
      this.store.editarPaciente(this.editId(), payload);
      this.toast.success('Cambios guardados.');
      this.router.navigate(['/pacientes', this.editId()]);
    } else {
      const id = this.store.crearPaciente(payload);
      this.toast.success('Paciente creado.');
      this.router.navigate(['/pacientes', id]);
    }
  }

  private hasData(): boolean {
    return !!(this.nombre() || this.apellido() || this.dni() || this.telefono() || this.email());
  }
  protected cancel() {
    if (this.hasData()) this.confirmCancel.set(true);
    else this.doCancel();
  }
  protected doCancel() {
    this.confirmCancel.set(false);
    if (this.isEdit()) this.router.navigate(['/pacientes', this.editId()]);
    else this.router.navigate(['/pacientes']);
  }
}

// ---- helpers de fecha/listas ----
function splitList(s: string): string[] {
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}
/** "dd/mm/yyyy" → "yyyy-mm-dd" (para input date). */
function toIsoDate(dmy: string): string {
  const m = dmy.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
}
/** "yyyy-mm-dd" → "dd/mm/yyyy". */
function fromIsoDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}
function ageFromIso(iso: string): number {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return 0;
  const today = new Date(2026, 5, 1);
  const birth = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  let age = today.getFullYear() - birth.getFullYear();
  const md = today.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}
