import { Component, ChangeDetectionStrategy, input, signal, computed, inject, effect } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { ToothStateSelectorComponent } from '../../shared/components/tooth-state-selector.component';
import { ToothState } from '../../core/models/models';
import { STATE_META } from '../../shared/components/odontogram.component';
import { ToastService } from '../../shared/components/toast.service';
import { StoreService } from '../../core/persistence/store.service';

/**
 * Detalle de pieza dental (DC-045 / REQ-186..188). Número + nombre FDI de la pieza,
 * estado actual, control para cambiar el estado e historial REAL de procedimientos
 * sobre la pieza (derivado del store, coherente con el estado). Ruta dedicada (no
 * modal). :id y :fdi vía input binding. Volver al odontograma.
 */
@Component({
  selector: 'app-tooth-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, ToothStateSelectorComponent],
  template: `
    <a class="back-link t-small" [routerLink]="['/pacientes', id(), 'odontograma']">
      <app-icon name="arrow-left" [size]="16" /> Volver al odontograma
    </a>

    <div class="tooth-detail">
      <section class="surface-card is-lg td-main">
        <header class="td-main__head">
          <span class="td-main__num">{{ fdi() }}</span>
          <div>
            <h2 class="t-title">Pieza {{ fdi() }} · {{ nombre() }}</h2>
            <p class="t-small t-secondary">Numeración FDI · Universal {{ universal() }}</p>
          </div>
        </header>

        <div class="td-main__status">
          <span class="field__label">Estado actual</span>
          <span class="td-main__chip" [attr.data-state]="state()">{{ estadoLabel() }}</span>
        </div>

        <div class="field">
          <span class="field__label">Cambiar estado de la pieza</span>
          <app-tooth-state-selector [value]="state()" (change)="state.set($event)" />
        </div>

        <div class="td-main__actions">
          <button type="button" class="btn-edm btn-edm--primary" (click)="save()">
            <app-icon name="check" [size]="18" /> Guardar estado
          </button>
        </div>
      </section>

      <aside class="surface-card td-side">
        <h3 class="t-title td-side__title">Historial de la pieza</h3>
        @if (history().length) {
          <ul class="td-history">
            @for (h of history(); track $index) {
              <li class="td-history__item">
                <span class="td-history__date t-small t-secondary">{{ h.fecha }} · {{ h.profesional }}</span>
                <span class="t-body">{{ h.descripcion }}</span>
              </li>
            }
          </ul>
        } @else {
          <div class="td-empty">
            <span class="td-empty__glyph"><app-icon name="clock-counter-clockwise" [size]="22" /></span>
            <p class="t-body t-secondary">Sin procedimientos registrados en esta pieza.</p>
          </div>
        }
      </aside>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .back-link { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-accent-deep); margin-bottom: var(--space-5); }
    .back-link:hover { text-decoration: underline; }
    .tooth-detail { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-5); align-items: start; }
    .td-main { display: flex; flex-direction: column; gap: var(--space-6); }
    .td-main__head { display: flex; align-items: center; gap: var(--space-4); }
    .td-main__num {
      display: inline-flex; align-items: center; justify-content: center;
      width: 56px; height: 56px; border-radius: var(--radius-md);
      background: var(--color-accent-tint); color: var(--color-accent-deep);
      font-family: var(--font-display); font-weight: var(--weight-medium); font-size: var(--text-title);
    }
    .td-main__head h2 { color: var(--color-text); }
    .td-main__status { display: flex; flex-direction: column; gap: var(--space-2); }
    .td-main__chip {
      align-self: flex-start; display: inline-flex; align-items: center;
      padding: var(--space-1) var(--space-3); border-radius: var(--radius-pill);
      border: 1px solid var(--color-border); background: var(--color-bg-elevated);
      font-size: var(--text-small); color: var(--color-text);
    }
    .td-main__chip[data-state="caries"] { background: var(--color-warning-bg); color: var(--color-warning-text); border-color: color-mix(in srgb, var(--color-warning-text) 30%, transparent); }
    .td-main__chip[data-state="obturacion"] { background: var(--color-info-bg); color: var(--color-info-text); border-color: color-mix(in srgb, var(--color-info-text) 30%, transparent); }
    .td-main__chip[data-state="en-tratamiento"] { background: var(--color-accent-tint); color: var(--color-accent-deep); border-color: var(--color-accent); }
    .td-main__chip[data-state="protesis"] { background: var(--color-neutral-bg); color: var(--color-neutral-text); border-color: color-mix(in srgb, var(--color-neutral-text) 30%, transparent); }
    .td-main__chip[data-state="ausente"] { background: var(--color-neutral-bg); color: var(--color-neutral-text); }
    .td-main__actions { display: flex; }
    .td-side { display: flex; flex-direction: column; gap: var(--space-4); }
    .td-side__title { color: var(--color-text); }
    .td-history { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-3); }
    .td-history__item { display: flex; flex-direction: column; gap: 2px; padding-bottom: var(--space-3); border-bottom: 1px solid var(--color-border); }
    .td-history__item:last-child { border-bottom: none; padding-bottom: 0; }
    .td-empty { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); text-align: center; padding: var(--space-5) var(--space-2); }
    .td-empty__glyph { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: var(--color-accent-tint); color: var(--color-accent-deep); }
    .td-empty p { margin: 0; }
    @media (max-width: 991px) { .tooth-detail { grid-template-columns: 1fr; } }
  `],
})
export class ToothDetailComponent {
  readonly id = input<string>('');
  readonly fdi = input<string>('');

  private readonly toast = inject(ToastService);
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);

  protected readonly state = signal<ToothState>('sana');
  private readonly fdiNum = computed(() => parseInt(this.fdi(), 10));
  private readonly tooth = computed(() => this.store.toothOf(this.id(), this.fdiNum()));
  protected readonly universal = computed(() => this.tooth()?.universal ?? '—');
  protected readonly nombre = computed(() => this.store.toothName(this.fdiNum()));
  protected readonly estadoLabel = computed(() => STATE_META[this.state()].label);
  // Historial REAL de procedimientos sobre la pieza (coherente con su estado actual).
  protected readonly history = computed(() => this.store.toothHistory(this.id(), this.fdiNum()));

  constructor() {
    // sincroniza el selector con el estado real de la pieza al cargar/cambiar de pieza
    effect(() => {
      const t = this.tooth();
      if (t) this.state.set(t.estado);
    });
  }

  protected save() {
    const fdi = parseInt(this.fdi(), 10);
    if (isNaN(fdi)) return;
    this.store.setToothState(this.id(), fdi, this.state());
    this.toast.success('Estado de la pieza actualizado.');
    this.router.navigate(['/pacientes', this.id(), 'odontograma']);
  }
}
