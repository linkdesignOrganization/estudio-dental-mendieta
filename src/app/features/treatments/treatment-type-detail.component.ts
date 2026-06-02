import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { AvatarStackComponent } from '../../shared/components/avatar-stack.component';
import { ArsPipe } from '../../shared/pipes/ars.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { StoreService } from '../../core/persistence/store.service';

/**
 * Tratamientos — Detalle de tipo (DEMO-012 / DC-046). Cards aireadas: Pasos · Materiales
 * · Costo ARS · Duración · Profesionales. NO tabla densa.
 */
@Component({
  selector: 'app-treatment-type-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, AvatarStackComponent, ArsPipe, EmptyStateComponent],
  template: `
    <a class="back-link t-small" routerLink="/tratamientos"><app-icon name="arrow-left" [size]="16" /> Tratamientos</a>

    @if (type(); as t) {
      <article class="ttd">
        <header class="surface-card is-lg ttd__hero">
          <span class="ttd__glyph"><app-icon [name]="t.icono" [size]="28" /></span>
          <div class="ttd__hero-body">
            <h2 class="t-display">{{ t.nombre }}</h2>
            <p class="t-body t-secondary">{{ t.descripcion }}</p>
          </div>
        </header>

        <div class="ttd__grid">
          <section class="surface-card ttd__card">
            <header class="ttd__card-head"><app-icon name="list-bullets" [size]="18" /><h3 class="t-title">Pasos del procedimiento</h3></header>
            <ol class="ttd__steps">
              @for (s of steps(); track s) { <li class="t-body">{{ s }}</li> }
            </ol>
          </section>

          <section class="surface-card ttd__card">
            <header class="ttd__card-head"><app-icon name="first-aid-kit" [size]="18" /><h3 class="t-title">Materiales</h3></header>
            <ul class="ttd__materials">
              @for (m of materials(); track m) { <li class="t-body"><app-icon name="check" [size]="16" /> {{ m }}</li> }
            </ul>
          </section>

          <section class="surface-card ttd__card ttd__card--meta">
            <div class="icon-chip"><span class="icon-chip__glyph"><app-icon name="currency-circle-dollar" [size]="16" /></span><div class="icon-chip__body"><span class="icon-chip__label">Costo de referencia</span><span class="icon-chip__value">{{ t.costoRef | ars }}</span></div></div>
            <div class="icon-chip"><span class="icon-chip__glyph"><app-icon name="clock" [size]="16" /></span><div class="icon-chip__body"><span class="icon-chip__label">Duración estimada</span><span class="icon-chip__value">{{ t.duracionEst }}</span></div></div>
            <div class="ttd__profs">
              <span class="t-small t-secondary">Profesionales habilitados</span>
              <div class="ttd__profs-row">
                <app-avatar-stack [items]="profFotos()" [max]="6" />
                <ul class="ttd__profs-names">
                  @for (p of profesionales(); track p.id) {
                    <li class="t-small"><span class="ttd__profs-name">{{ p.nombre }}</span><span class="t-secondary"> · {{ p.especialidad }}</span></li>
                  }
                </ul>
              </div>
            </div>
          </section>
        </div>
      </article>
    } @else {
      <app-empty-state icon="tooth" title="No encontramos este tipo de tratamiento"
        description="El tipo de tratamiento que buscás no existe." [hasAction]="true">
        <a class="btn-edm btn-edm--primary" routerLink="/tratamientos">Volver a tratamientos</a>
      </app-empty-state>
    }
  `,
  styles: [`
    :host { display: block; }
    .back-link { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-accent-deep); margin-bottom: var(--space-5); }
    .back-link:hover { text-decoration: underline; }
    .ttd { display: flex; flex-direction: column; gap: var(--space-5); }
    .ttd__hero { display: flex; align-items: center; gap: var(--space-4); }
    .ttd__glyph { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; flex: 0 0 auto; border-radius: var(--radius-md); background: var(--color-accent-tint); color: var(--color-accent-deep); }
    .ttd__hero-body h2 { color: var(--color-text); }
    .ttd__grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-5); align-items: start; }
    .ttd__card { display: flex; flex-direction: column; gap: var(--space-4); }
    .ttd__card--meta { grid-column: 1 / -1; flex-direction: row; flex-wrap: wrap; gap: var(--space-8); }
    .ttd__card-head { display: flex; align-items: center; gap: var(--space-2); color: var(--color-accent-deep); }
    .ttd__card-head h3 { color: var(--color-text); }
    .ttd__steps { margin: 0; padding-left: var(--space-5); display: flex; flex-direction: column; gap: var(--space-2); color: var(--color-text); }
    .ttd__materials { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-2); color: var(--color-text); }
    .ttd__materials li { display: flex; align-items: center; gap: var(--space-2); }
    .ttd__profs { display: flex; flex-direction: column; gap: var(--space-2); }
    .ttd__profs-row { display: flex; align-items: flex-start; gap: var(--space-4); flex-wrap: wrap; }
    .ttd__profs-names { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-1); }
    .ttd__profs-name { color: var(--color-text); font-weight: var(--weight-medium); }
    @media (max-width: 767px) { .ttd__grid { grid-template-columns: 1fr; } .ttd__card--meta { flex-direction: column; gap: var(--space-4); } }
  `],
})
export class TreatmentTypeDetailComponent {
  readonly id = input<string>('');
  private readonly store = inject(StoreService);
  protected readonly type = computed(() => this.store.treatmentTypeById(this.id()));
  protected readonly steps = computed(() => this.store.treatmentTypeDetail(this.id()).pasos);
  protected readonly materials = computed(() => this.store.treatmentTypeDetail(this.id()).materiales);
  protected readonly profesionales = computed(() => this.store.treatmentTypeProfessionals(this.id()));
  protected readonly profFotos = computed(() => this.profesionales().map((p) => p.fotoPath));
}
