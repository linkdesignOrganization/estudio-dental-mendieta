import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { IconComponent } from '../../shared/components/icon.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ToastService } from '../../shared/components/toast.service';
import { StoreService } from '../../core/persistence/store.service';

/**
 * Configuración (DEMO-018 / DC-049). Cards aireadas. Incluye "Restablecer datos"
 * (REQ-264) con copy de PRODUCCIÓN — sin "demo/mock/simulación" en label, descripción,
 * confirmación ni toast (BVC-027). Confirmación destructiva vía confirm-dialog.
 */
@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, ConfirmDialogComponent],
  template: `
    <div class="page-head">
      <div class="page-head__titles">
        <h2 class="t-display">Configuración</h2>
        <span class="page-head__subtitle">Preferencias del sistema y datos de la clínica</span>
      </div>
    </div>

    <div class="settings">
      <section class="surface-card set-card">
        <header class="set-card__head"><app-icon name="house" [size]="18" /><h3 class="t-title">Datos de la clínica</h3></header>
        <dl class="set-list">
          <div class="set-row"><dt>Nombre</dt><dd>{{ clinic()?.nombre }}</dd></div>
          <div class="set-row"><dt>CUIT</dt><dd>{{ clinic()?.cuit }}</dd></div>
          <div class="set-row"><dt>Dirección</dt><dd>{{ clinic()?.direccion }}</dd></div>
        </dl>
      </section>

      <section class="surface-card set-card">
        <header class="set-card__head"><app-icon name="gear" [size]="18" /><h3 class="t-title">Preferencias</h3></header>
        <div class="set-pref">
          <div class="set-pref__row">
            <span class="t-body">Recordatorios automáticos de turnos</span>
            <span class="set-switch is-on" role="switch" aria-checked="true" tabindex="0"><span class="set-switch__thumb"></span></span>
          </div>
          <div class="set-pref__row">
            <span class="t-body">Notificar cumpleaños de pacientes</span>
            <span class="set-switch is-on" role="switch" aria-checked="true" tabindex="0"><span class="set-switch__thumb"></span></span>
          </div>
          <div class="set-pref__row">
            <span class="t-body">Mostrar montos en el dashboard</span>
            <span class="set-switch" role="switch" aria-checked="false" tabindex="0"><span class="set-switch__thumb"></span></span>
          </div>
        </div>
      </section>

      <section class="surface-card set-card">
        <header class="set-card__head"><app-icon name="arrow-counter-clockwise" [size]="18" /><h3 class="t-title">Datos del sistema</h3></header>
        <p class="t-body t-secondary set-reset__desc">Restaurá la configuración inicial del sistema. Esta acción reemplaza los datos actuales por los originales y no se puede deshacer.</p>
        <button type="button" class="btn-edm btn-edm--secondary" (click)="dialogOpen.set(true)">
          <app-icon name="arrow-counter-clockwise" [size]="18" /> Restablecer datos
        </button>
      </section>
    </div>

    @if (dialogOpen()) {
      <app-confirm-dialog
        title="Restablecer los datos"
        message="Se perderán todos los cambios y el sistema volverá a su estado inicial. Esta acción no se puede deshacer."
        confirmLabel="Sí, restablecer" cancelLabel="Cancelar" [destructive]="true"
        (confirm)="doReset()" (cancel)="dialogOpen.set(false)" />
    }
  `,
  styles: [`
    :host { display: block; }
    .settings { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-5); align-items: start; }
    .set-card { display: flex; flex-direction: column; gap: var(--space-4); }
    .set-card__head { display: flex; align-items: center; gap: var(--space-2); color: var(--color-accent-deep); }
    .set-card__head h3 { color: var(--color-text); }
    .set-list { margin: 0; display: flex; flex-direction: column; gap: var(--space-3); }
    .set-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
    .set-row dt { color: var(--color-text-secondary); font-size: var(--text-small); }
    .set-row dd { margin: 0; color: var(--color-text); }
    .set-pref { display: flex; flex-direction: column; gap: var(--space-4); }
    .set-pref__row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
    .set-switch { position: relative; width: 44px; height: 24px; border-radius: var(--radius-pill); background: var(--color-border); cursor: pointer; transition: background-color var(--motion-fast) var(--motion-ease); flex: 0 0 auto; }
    .set-switch.is-on { background: var(--color-accent); }
    .set-switch:focus-visible { box-shadow: var(--focus-ring); outline: none; }
    .set-switch__thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform var(--motion-fast) var(--motion-ease); box-shadow: var(--shadow-card); }
    .set-switch.is-on .set-switch__thumb { transform: translateX(20px); }
    .set-reset__desc { line-height: var(--lh-body); }
    @media (max-width: 767px) { .settings { grid-template-columns: 1fr; } }
  `],
})
export class SettingsComponent {
  private readonly toast = inject(ToastService);
  private readonly store = inject(StoreService);
  protected readonly clinic = this.store.clinic;
  protected readonly dialogOpen = signal(false);

  protected async doReset() {
    this.dialogOpen.set(false);
    // Regenera el seed determinista y rehidrata el store (UX-090). Mismo PRNG → estado original.
    await this.store.reseed();
    this.toast.success('Datos restablecidos correctamente.');
  }
}
