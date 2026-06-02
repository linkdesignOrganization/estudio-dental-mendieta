import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { StepperComponent } from '../../shared/components/stepper.component';
import { ArsPipe } from '../../shared/pipes/ars.pipe';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ToastService } from '../../shared/components/toast.service';
import { StoreService } from '../../core/persistence/store.service';
import { BudgetFlowService } from './budget-flow.service';

const STEP_ROUTES = ['', '/facturacion/presupuestos/nuevo/paciente', '/facturacion/presupuestos/nuevo/items', '/facturacion/presupuestos/nuevo/confirmar'];

/**
 * Facturación — Crear presupuesto (3 pasos, UX-029). Estado en BudgetFlowService
 * (preservado al ir Atrás). Paso 1 paciente → Paso 2 tratamientos con costo TOTAL
 * calculado automáticamente (UX-087) → Paso 3 revisión. Validación inline (no avanza
 * sin paciente / sin al menos un tratamiento — UX-050). "Confirmar" persiste vía store.
 */
@Component({
  selector: 'app-budget-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, StepperComponent, ArsPipe, ConfirmDialogComponent],
  template: `
    <button type="button" class="back-link t-small" (click)="cancel()"><app-icon name="arrow-left" [size]="16" /> Presupuestos</button>

    <div class="wiz">
      <header class="wiz__head"><h2 class="t-display">Nuevo presupuesto</h2></header>
      <app-stepper [steps]="['Paciente', 'Tratamientos', 'Confirmación']" [current]="step()" />

      <section class="surface-card is-lg wiz__card">
        @switch (step()) {
          @case (1) {
            <h3 class="t-title wiz__step-title">Seleccioná el paciente</h3>
            <div class="field">
              <label class="field__label" for="b-pac">Paciente</label>
              <select id="b-pac" class="select-edm" [value]="flow.pacienteId()" (change)="onPaciente($event)">
                <option value="">Elegí un paciente</option>
                @for (p of patients(); track p.id) { <option [value]="p.id">{{ p.nombre }} {{ p.apellido }}</option> }
              </select>
            </div>
            @if (showStep1Error()) {
              <span class="field__error"><app-icon name="warning" [size]="16" /> Elegí un paciente para continuar.</span>
            }
          }
          @case (2) {
            <h3 class="t-title wiz__step-title">Tratamientos a presupuestar</h3>
            <ul class="wiz__items">
              @for (t of types(); track t.id) {
                <li class="wiz__item">
                  <label class="wiz__check">
                    <input type="checkbox" [checked]="flow.tipoIds().includes(t.id)" (change)="flow.toggleTipo(t.id)" />
                    <span class="t-body">{{ t.nombre }}</span>
                  </label>
                  <span class="t-body-medium">{{ t.costoRef | ars }}</span>
                </li>
              }
            </ul>
            <div class="wiz__running">
              <span class="t-body t-secondary">Total seleccionado</span>
              <span class="t-title wiz__running-total">{{ total() | ars }}</span>
            </div>
            @if (showStep2Error()) {
              <span class="field__error"><app-icon name="warning" [size]="16" /> Agregá al menos un tratamiento.</span>
            }
          }
          @case (3) {
            <h3 class="t-title wiz__step-title">Revisá y confirmá</h3>
            <div class="wiz__summary surface-bordered">
              @for (it of selectedItems(); track it.id) {
                <div class="wiz__sum-row"><span class="t-body t-secondary">{{ it.nombre }}</span><span class="t-body-medium">{{ it.costoRef | ars }}</span></div>
              }
              <hr class="divider" />
              <div class="wiz__sum-row"><span class="t-title">Total</span><span class="t-title wiz__total">{{ total() | ars }}</span></div>
            </div>
            <p class="t-small t-secondary">Para: {{ pacienteNombre() }}</p>
          }
        }

        <div class="wiz__actions">
          @if (step() > 1) { <button type="button" class="btn-edm btn-edm--secondary" (click)="back()"><app-icon name="arrow-left" [size]="18" /> Atrás</button> }
          <div class="wiz__spacer"></div>
          @if (step() < 3) {
            <button type="button" class="btn-edm btn-edm--primary" (click)="next()">Siguiente <app-icon name="arrow-right" [size]="18" /></button>
          } @else {
            <button type="button" class="btn-edm btn-edm--primary" (click)="confirm()"><app-icon name="check" [size]="18" /> Crear presupuesto</button>
          }
        </div>
      </section>
    </div>

    @if (confirmCancel()) {
      <app-confirm-dialog
        title="Descartar el presupuesto" message="Tenés datos cargados. ¿Querés descartarlo?"
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
    .wiz__items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-2); }
    .wiz__item { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); min-height: 44px; }
    .wiz__check { display: flex; align-items: center; gap: var(--space-3); cursor: pointer; }
    .wiz__check input { width: 18px; height: 18px; accent-color: var(--color-accent-deep); }
    .wiz__running { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-3) var(--space-4); background: var(--color-accent-tint); border-radius: var(--radius-md); }
    .wiz__running-total { color: var(--color-accent-deep); }
    .wiz__summary { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
    .wiz__sum-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
    .wiz__total { color: var(--color-accent-deep); }
    .field__error { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-error-text); font-size: var(--text-small); }
    .wiz__actions { display: flex; align-items: center; gap: var(--space-3); }
    .wiz__spacer { flex: 1; }
    @media (max-width: 767px) {
      .wiz__actions .btn-edm { flex: 1; }
      /* Row (.wiz__item) ya es ≥44px; checkbox visual crece a 24px en mobile (DC-088). */
      .wiz__check { min-height: var(--touch-target-min); }
      .wiz__check input { width: 24px; height: 24px; }
    }
  `],
})
export class BudgetCreateComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly store = inject(StoreService);
  protected readonly flow = inject(BudgetFlowService);

  protected readonly patients = this.store.patients;
  protected readonly types = this.store.treatmentTypes;
  protected readonly step = signal<number>(this.route.snapshot.data['step'] ?? 1);
  protected readonly step1Touched = signal(false);
  protected readonly step2Touched = signal(false);
  protected readonly confirmCancel = signal(false);

  constructor() {
    if ((this.route.snapshot.data['step'] ?? 1) === 1 && !this.flow.tienePaciente()) {
      this.flow.reset();
    }
  }

  protected readonly selectedItems = computed(() =>
    this.types().filter((t) => this.flow.tipoIds().includes(t.id)),
  );
  protected readonly total = computed(() => this.selectedItems().reduce((s, t) => s + t.costoRef, 0));
  protected readonly showStep1Error = computed(() => this.step1Touched() && !this.flow.tienePaciente());
  protected readonly showStep2Error = computed(() => this.step2Touched() && !this.flow.tieneItems());

  protected pacienteNombre(): string {
    const p = this.store.patientById(this.flow.pacienteId());
    return p ? `${p.nombre} ${p.apellido}` : '—';
  }

  protected onPaciente(e: Event) { this.flow.pacienteId.set((e.target as HTMLSelectElement).value); }

  protected next() {
    if (this.step() === 1) { this.step1Touched.set(true); if (!this.flow.tienePaciente()) return; }
    if (this.step() === 2) { this.step2Touched.set(true); if (!this.flow.tieneItems()) return; }
    const t = Math.min(3, this.step() + 1);
    this.router.navigateByUrl(STEP_ROUTES[t]); this.step.set(t);
  }
  protected back() {
    const t = Math.max(1, this.step() - 1);
    this.router.navigateByUrl(STEP_ROUTES[t]); this.step.set(t);
  }
  protected confirm() {
    const id = this.store.crearPresupuesto(this.flow.pacienteId(), this.flow.tipoIds());
    this.flow.reset();
    this.toast.success('Presupuesto creado.');
    this.router.navigate(['/facturacion/presupuestos', id]);
  }

  protected cancel() {
    if (this.flow.tienePaciente() || this.flow.tieneItems()) this.confirmCancel.set(true);
    else this.doCancel();
  }
  protected doCancel() {
    this.confirmCancel.set(false);
    this.flow.reset();
    this.router.navigate(['/facturacion/presupuestos']);
  }
}
