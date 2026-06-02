import { Component, ChangeDetectionStrategy, input, signal, computed, inject, effect } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { ToothStateSelectorComponent } from '../../shared/components/tooth-state-selector.component';
import { ToothState } from '../../core/models/models';
import { ToastService } from '../../shared/components/toast.service';
import { StoreService } from '../../core/persistence/store.service';

/**
 * Detalle de pieza dental (DC-045). Estado editable + tooth-state-selector + historial.
 * Ruta dedicada (no modal). :id y :fdi vía input binding.
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
            <h2 class="t-title">Pieza {{ fdi() }}</h2>
            <p class="t-small t-secondary">Numeración FDI · Universal {{ universal() }}</p>
          </div>
        </header>

        <div class="field">
          <span class="field__label">Estado de la pieza</span>
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
        <ul class="td-history">
          <li class="td-history__item">
            <span class="td-history__date t-small t-secondary">28/05/2026</span>
            <span class="t-body">Obturación con resina compuesta</span>
          </li>
          <li class="td-history__item">
            <span class="td-history__date t-small t-secondary">12/03/2026</span>
            <span class="t-body">Diagnóstico de caries en radiografía</span>
          </li>
        </ul>
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
    .td-main__actions { display: flex; }
    .td-side { display: flex; flex-direction: column; gap: var(--space-4); }
    .td-side__title { color: var(--color-text); }
    .td-history { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-3); }
    .td-history__item { display: flex; flex-direction: column; gap: 2px; padding-bottom: var(--space-3); border-bottom: 1px solid var(--color-border); }
    .td-history__item:last-child { border-bottom: none; padding-bottom: 0; }
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
  private readonly tooth = computed(() => this.store.toothOf(this.id(), parseInt(this.fdi(), 10)));
  protected readonly universal = computed(() => this.tooth()?.universal ?? '—');

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
