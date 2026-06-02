import { Component, ChangeDetectionStrategy, input, signal, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ToastService } from '../../shared/components/toast.service';
import { StoreService } from '../../core/persistence/store.service';

/**
 * Registrar pago (DEMO-016 / DC-045 / DC-112). Ruta dedicada (NO modal). Monto ARS
 * validado positivo. Estados: vacío → confirmar deshabilitado; error monto ≤0 inline;
 * éxito → vuelve a Pagos + toast "Pago registrado." (la persistencia la cablea 4b).
 */
@Component({
  selector: 'app-register-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, ConfirmDialogComponent],
  template: `
    <a class="back-link t-small" [routerLink]="['/pacientes', id(), 'pagos']">
      <app-icon name="arrow-left" [size]="16" /> Volver a pagos
    </a>

    <section class="surface-card is-lg pay-form">
      <header class="pay-form__head">
        <h2 class="t-display">Registrar pago</h2>
        <p class="t-body t-secondary">Ingresá el monto y el medio de pago para registrar el movimiento.</p>
      </header>

      <form class="pay-form__fields" (submit)="submit($event)">
        <div class="field">
          <label class="field__label" for="pay-amount">Monto (ARS)</label>
          <input id="pay-amount" class="input-edm" [class.is-invalid]="showError()" type="number" inputmode="numeric"
                 min="1" placeholder="0" [value]="amount()" (input)="onAmount($event)" (blur)="touched.set(true)"
                 [attr.aria-invalid]="showError()" aria-describedby="pay-amount-err" />
          @if (showError()) {
            <span class="field__error" id="pay-amount-err">
              <app-icon name="warning" [size]="16" /> Ingresá un monto mayor a cero.
            </span>
          }
        </div>

        <div class="field">
          <label class="field__label" for="pay-method">Medio de pago</label>
          <select id="pay-method" class="select-edm" [value]="medio()" (change)="onMedio($event)">
            <option>Efectivo</option>
            <option>Tarjeta de débito</option>
            <option>Tarjeta de crédito</option>
            <option>Transferencia</option>
            <option>Mercado Pago</option>
          </select>
        </div>

        <div class="field">
          <label class="field__label" for="pay-note">Concepto (opcional)</label>
          <input id="pay-note" class="input-edm" type="text" placeholder="Pago a cuenta"
                 [value]="concepto()" (input)="onConcepto($event)" />
        </div>

        <div class="pay-form__actions">
          <button type="button" class="btn-edm btn-edm--secondary" (click)="cancel()">Cancelar</button>
          <button type="submit" class="btn-edm btn-edm--primary" [disabled]="!isValid()">
            <app-icon name="check" [size]="18" /> Confirmar pago
          </button>
        </div>
      </form>
    </section>

    @if (confirmCancel()) {
      <app-confirm-dialog
        title="Descartar el pago" message="Tenés un monto ingresado. ¿Querés descartar este pago?"
        confirmLabel="Sí, descartar" cancelLabel="Seguir editando" [destructive]="true"
        (confirm)="goBack()" (cancel)="confirmCancel.set(false)" />
    }
  `,
  styles: [`
    :host { display: block; }
    .back-link { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-accent-deep); margin-bottom: var(--space-5); }
    .back-link:hover { text-decoration: underline; }
    .pay-form { max-width: 560px; display: flex; flex-direction: column; gap: var(--space-6); }
    .pay-form__head { display: flex; flex-direction: column; gap: var(--space-2); }
    .pay-form__head h2 { color: var(--color-text); }
    .pay-form__fields { display: flex; flex-direction: column; gap: var(--space-4); }
    .pay-form__actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-2); }
    @media (max-width: 767px) {
      .pay-form__actions { flex-direction: column-reverse; }
      .pay-form__actions .btn-edm { width: 100%; }
    }
  `],
})
export class RegisterPaymentComponent {
  readonly id = input<string>('');
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly store = inject(StoreService);

  protected readonly amount = signal<string>('');
  protected readonly medio = signal<string>('Efectivo');
  protected readonly concepto = signal<string>('');
  protected readonly touched = signal(false);
  protected readonly confirmCancel = signal(false);

  protected readonly numericAmount = computed(() => parseFloat(this.amount()));
  protected readonly isValid = computed(() => !isNaN(this.numericAmount()) && this.numericAmount() > 0);
  // El campo vacío queda neutro (placeholder + botón deshabilitado guían). El error inline
  // aparece en cuanto hay un monto cargado inválido (ej. 0/-500/letras) o tras blur/submit,
  // de modo que el mensaje sea siempre alcanzable por la UI (no solo en un submit bloqueado).
  protected readonly showError = computed(() => {
    const hasInput = this.amount().trim().length > 0;
    return !this.isValid() && (hasInput || this.touched());
  });

  protected onAmount(e: Event) { this.amount.set((e.target as HTMLInputElement).value); }
  protected onMedio(e: Event) { this.medio.set((e.target as HTMLSelectElement).value); }
  protected onConcepto(e: Event) { this.concepto.set((e.target as HTMLInputElement).value); }

  protected submit(e: Event) {
    e.preventDefault();
    this.touched.set(true);
    if (!this.isValid()) return;
    // Persiste el pago: agrega el movimiento, recalcula el saldo (DEMO-016 / UX-026/085).
    this.store.registrarPago(this.id(), this.numericAmount(), this.concepto(), this.medio());
    this.toast.success('Pago registrado.');
    this.router.navigate(['/pacientes', this.id(), 'pagos']);
  }

  protected cancel() {
    if (this.amount().trim()) this.confirmCancel.set(true);
    else this.goBack();
  }
  protected goBack() {
    this.confirmCancel.set(false);
    this.router.navigate(['/pacientes', this.id(), 'pagos']);
  }
}
