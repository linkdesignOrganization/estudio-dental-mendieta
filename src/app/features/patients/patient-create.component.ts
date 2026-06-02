import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { StepperComponent } from '../../shared/components/stepper.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { AvatarComponent } from '../../shared/components/avatar.component';
import { ToastService } from '../../shared/components/toast.service';
import { StoreService } from '../../core/persistence/store.service';
import { PatientFlowService } from './patient-flow.service';

/**
 * Crear paciente (2 pasos, UX-024) / Editar (form precargado, UX-025). Validación inline
 * de requeridos + formato DNI (no avanza sin requeridos — UX-050). Sin foto → fallback a
 * iniciales (UX-024). Persiste vía store. "Atrás" preserva datos del paso 1. "Cancelar"
 * con cambios pide confirmación (UX-088).
 */
@Component({
  selector: 'app-patient-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, StepperComponent, ConfirmDialogComponent, AvatarComponent],
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
            <div class="field">
              <label class="field__label" for="c-genero">Género</label>
              <select id="c-genero" class="select-edm" [value]="genero()" (change)="set('genero', $event)">
                <option value="mujer">Femenino</option>
                <option value="hombre">Masculino</option>
              </select>
            </div>
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
            <div class="field field--full">
              <span class="field__label">Foto del paciente <span class="field__hint">(opcional)</span></span>
              <div class="photo-field">
                <app-avatar [src]="foto() || null" [name]="(nombre() + ' ' + apellido()).trim()" size="lg" />
                <div class="photo-field__controls">
                  <input id="c-foto" class="photo-field__input" type="file" accept="image/*" (change)="onPhoto($event)" />
                  <label class="btn-edm btn-edm--secondary photo-field__btn" for="c-foto">
                    <app-icon name="image" [size]="18" /> {{ foto() ? 'Cambiar foto' : 'Subir foto' }}
                  </label>
                  @if (foto()) {
                    <button type="button" class="photo-field__remove t-small" (click)="quitarFoto()">Quitar</button>
                  }
                  <p class="field__hint photo-field__note">Si no cargás una foto, se usan las iniciales del paciente.</p>
                </div>
              </div>
            </div>
          </div>
        }

        <div class="create__actions">
          @if (step() === 2 && !isEdit()) {
            <button type="button" class="btn-edm btn-edm--secondary" (click)="goStep1()">
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
    .field__hint { color: var(--color-text-secondary); font-size: var(--text-small); font-weight: var(--weight-regular); }
    .field--full { grid-column: 1 / -1; }
    .photo-field { display: flex; align-items: center; gap: var(--space-4); }
    .photo-field__controls { display: flex; flex-direction: column; gap: var(--space-2); align-items: flex-start; }
    .photo-field__btn { display: inline-flex; align-items: center; gap: var(--space-2); cursor: pointer; min-height: var(--touch-target-min); }
    .photo-field__input { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
    .photo-field__input:focus-visible + .photo-field__btn,
    .photo-field__btn:focus-within { box-shadow: var(--focus-ring); outline: none; }
    .photo-field__remove { background: none; border: none; padding: 0; color: var(--color-accent-deep); cursor: pointer; font-family: var(--font-body); }
    .photo-field__remove:hover { text-decoration: underline; }
    .photo-field__note { margin: 0; }
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
  private readonly flow = inject(PatientFlowService);

  protected readonly professionals = this.store.professionals;
  protected readonly obrasSociales = this.store.obrasSocialesRaw;

  protected readonly isEdit = signal<boolean>(this.route.snapshot.data['edit'] === true);
  protected readonly editId = signal<string>(this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly step = signal<number>(this.route.snapshot.data['step'] === 2 ? 2 : 1);
  protected readonly touched = signal(false);
  protected readonly confirmCancel = signal(false);

  // Los campos del formulario viven en el flow service singleton para sobrevivir la
  // navegación entre las dos rutas del wizard (Paso 1 ↔ Paso 2, REQ-177). En edición se
  // hidratan una vez desde el paciente. El componente los expone tal cual para el template.
  protected readonly nombre = this.flow.nombre;
  protected readonly apellido = this.flow.apellido;
  protected readonly dni = this.flow.dni;
  protected readonly nacimiento = this.flow.nacimiento;
  protected readonly genero = this.flow.genero;
  protected readonly telefono = this.flow.telefono;
  protected readonly email = this.flow.email;
  protected readonly direccion = this.flow.direccion;
  protected readonly obraSocialId = this.flow.obraSocialId;
  protected readonly profesionalId = this.flow.profesionalId;
  protected readonly alergias = this.flow.alergias;
  protected readonly medicacion = this.flow.medicacion;
  protected readonly observaciones = this.flow.observaciones;
  /** Foto opcional (REQ-175): data URL cargada por el usuario, o '' → fallback a iniciales (REQ-179). */
  protected readonly foto = this.flow.foto;

  /** Snapshot de los valores precargados para detectar cambios reales (REQ-184 / F01). */
  private baseline = '';

  constructor() {
    const defaultOs = this.obrasSociales().length ? this.obrasSociales()[0].id : 'os-particular';
    if (this.isEdit()) {
      // Edición: hidratar el formulario desde el paciente (una vez, en el alta del componente).
      this.hydrateFromPatient(defaultOs);
    } else if (this.step() === 1) {
      // Paso 1 fresco: reiniciar el wizard. Si el usuario vuelve a Paso 1 desde Paso 2,
      // los datos ya cargados se conservan (no se resetea si ya hay datos del Paso 1).
      if (!this.flow.tieneDatosPaso1()) this.flow.reset(defaultOs);
    } else if (this.step() === 2 && !this.flow.tieneDatosPaso1()) {
      // Deep-link directo al Paso 2 sin datos del Paso 1 → volver al Paso 1.
      this.router.navigate(['/pacientes', 'nuevo', 'datos']);
    }
    // Congela el estado inicial del formulario; cualquier divergencia = "hay cambios".
    this.baseline = this.snapshot();
  }

  private hydrateFromPatient(defaultOs: string): void {
    const p = this.store.patientEntity(this.editId());
    if (!p) { this.flow.reset(defaultOs); return; }
    this.nombre.set(p.nombre);
    this.apellido.set(p.apellido);
    this.dni.set(p.dni);
    this.telefono.set(p.telefono);
    this.email.set(p.email);
    this.direccion.set(p.direccion);
    this.genero.set(p.genero);
    this.obraSocialId.set(p.obraSocialId);
    this.profesionalId.set(p.profesionalId);
    this.alergias.set(p.alergias.join(', '));
    this.medicacion.set(p.medicacion.join(', '));
    this.observaciones.set(p.observaciones);
    this.nacimiento.set(toIsoDate(p.fechaNacimiento));
    this.foto.set(p.fotoPath ?? '');
  }

  /** Serializa el estado actual del formulario para comparación de cambios. */
  private snapshot(): string {
    return JSON.stringify([
      this.nombre(), this.apellido(), this.dni(), this.nacimiento(), this.genero(),
      this.telefono(), this.email(), this.direccion(), this.obraSocialId(), this.profesionalId(),
      this.alergias(), this.medicacion(), this.observaciones(), this.foto(),
    ]);
  }
  /** True si el formulario difiere del estado inicial precargado. */
  private estaSucio(): boolean {
    return this.snapshot() !== this.baseline;
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
      genero: this.genero, telefono: this.telefono, email: this.email, direccion: this.direccion, obraSocialId: this.obraSocialId,
      profesionalId: this.profesionalId, alergias: this.alergias, medicacion: this.medicacion, observaciones: this.observaciones,
    } as Record<string, { set: (v: string) => void }>)[field]?.set(v);
  }

  /**
   * Carga una foto opcional (REQ-175). Se lee como data URL para persistir sin backend.
   * Endurecido por seguridad: solo formatos de imagen rasterizada de una allowlist
   * (se excluye image/svg+xml a propósito — un SVG puede contener <script> y sería un
   * vector XSS al persistirse como data URL) y con tope de tamaño (la data URL se guarda
   * en localStorage; un archivo gigante reventaría la cuota y degradaría la persistencia).
   * El input siempre se limpia para poder reintentar el mismo archivo tras un rechazo.
   */
  protected onPhoto(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      this.toast.error('Formato no admitido. Subí una imagen JPG, PNG, WEBP o GIF.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      this.toast.error('La imagen supera los 2 MB. Probá con una más liviana.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.foto.set(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => this.toast.error('No se pudo leer la imagen. Probá de nuevo.');
    reader.readAsDataURL(file);
  }
  protected quitarFoto() {
    this.foto.set('');
  }

  /** Paso 1 → Paso 2: valida los requeridos y navega a la ruta dedicada del Paso 2 (REQ-173/029). */
  protected goStep2() {
    this.touched.set(true);
    if (!this.step1Valido()) return;
    this.router.navigate(['/pacientes', 'nuevo', 'clinico']);
  }
  /** Paso 2 → Paso 1: vuelve a la ruta del Paso 1 conservando los datos (REQ-177). */
  protected goStep1() {
    this.router.navigate(['/pacientes', 'nuevo', 'datos']);
  }

  protected save() {
    this.touched.set(true);
    if (!this.step1Valido()) { this.goStep1(); return; }
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
      genero: this.genero(),
      fotoPath: this.foto(),
      alergias: splitList(this.alergias()),
      medicacion: splitList(this.medicacion()),
      observaciones: this.observaciones().trim(),
    };
    if (this.isEdit()) {
      this.store.editarPaciente(this.editId(), payload);
      this.baseline = this.snapshot(); // evita el prompt de descarte tras guardar
      this.toast.success('Cambios guardados.');
      this.router.navigate(['/pacientes', this.editId()]);
    } else {
      const id = this.store.crearPaciente(payload);
      this.flow.reset(this.obrasSociales().length ? this.obrasSociales()[0].id : 'os-particular');
      this.toast.success('Paciente creado.');
      this.router.navigate(['/pacientes', id]);
    }
  }

  /**
   * Decide si "Cancelar" necesita confirmación (REQ-177 / REQ-184 / F01):
   * - Editar: solo si el formulario difiere de los datos precargados (cambios reales).
   * - Crear: si el wizard tiene cualquier dato cargado (en Paso 1 o Paso 2), para no
   *   descartar en blanco silenciosamente. Considera datos de ambos pasos, no solo del actual.
   */
  private requiereConfirmacion(): boolean {
    if (this.isEdit()) return this.estaSucio();
    return this.wizardTieneDatos();
  }
  /** True si el alta de paciente tiene algún dato cargado en cualquiera de los dos pasos. */
  private wizardTieneDatos(): boolean {
    return !!(this.nombre().trim() || this.apellido().trim() || this.dni().trim()
      || this.telefono().trim() || this.email().trim() || this.direccion().trim()
      || this.nacimiento() || this.alergias().trim() || this.medicacion().trim()
      || this.observaciones().trim() || this.foto());
  }
  protected cancel() {
    if (this.requiereConfirmacion()) this.confirmCancel.set(true);
    else this.doCancel();
  }
  protected doCancel() {
    this.confirmCancel.set(false);
    if (this.isEdit()) {
      this.router.navigate(['/pacientes', this.editId()]);
    } else {
      // Descarta el alta: limpia el wizard para que el próximo "Nuevo paciente" arranque en blanco.
      this.flow.reset(this.obrasSociales().length ? this.obrasSociales()[0].id : 'os-particular');
      this.router.navigate(['/pacientes']);
    }
  }
}

// ---- seguridad de la foto opcional (REQ-175) ----
/** Formatos rasterizados admitidos. SVG queda excluido a propósito (vector XSS). */
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
/** Tope de la foto: 2 MB. La data URL vive en localStorage; un archivo mayor reventaría la cuota. */
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

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
