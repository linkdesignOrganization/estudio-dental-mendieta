import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { AvatarComponent } from '../../shared/components/avatar.component';
import { ArsPipe } from '../../shared/pipes/ars.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { StoreService } from '../../core/persistence/store.service';

/**
 * Facturación — Detalle de obra social (DC-047 / DC-117). Mini-stats + lista de
 * pacientes asociados. Sin pacientes → "Esta obra social no tiene pacientes asociados."
 */
@Component({
  selector: 'app-obra-social-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, AvatarComponent, ArsPipe, EmptyStateComponent],
  template: `
    <a class="back-link t-small" routerLink="/facturacion/obras-sociales"><app-icon name="arrow-left" [size]="16" /> Obras sociales</a>

    @if (os(); as o) {
      <div class="osd">
        <header class="surface-card is-lg osd__hero">
          <span class="osd__logo">{{ initials(o.nombre) }}</span>
          <div class="osd__hero-body">
            <h2 class="t-display">{{ o.nombre }}</h2>
            <p class="t-body t-secondary">{{ o.pacientesActivos }} pacientes activos</p>
          </div>
          <div class="osd__stats">
            <div class="osd__stat"><span class="t-small t-secondary">Deuda</span><span class="t-title osd__stat-val">{{ o.deuda | ars }}</span></div>
            <div class="osd__stat"><span class="t-small t-secondary">Último pago</span><span class="t-title osd__stat-val">{{ o.ultimoPago }}</span></div>
          </div>
        </header>

        <section class="surface-card is-lg osd__patients">
          <h3 class="t-title osd__patients-title">Pacientes asociados</h3>
          @if (patients().length) {
            <ul class="osd__list">
              @for (p of patients(); track p.id) {
                <li>
                  <a class="osd__patient" [routerLink]="['/pacientes', p.id]">
                    <app-avatar [src]="p.fotoPath" [name]="p.nombre + ' ' + p.apellido" size="sm" />
                    <span class="osd__patient-body">
                      <span class="t-body-medium">{{ p.nombre }} {{ p.apellido }}</span>
                      <span class="t-small t-secondary">{{ p.edad }} años</span>
                    </span>
                    <app-icon name="caret-right" [size]="18" />
                  </a>
                </li>
              }
            </ul>
          } @else {
            <app-empty-state icon="users" title="Sin pacientes asociados" description="Esta obra social no tiene pacientes asociados." />
          }
        </section>
      </div>
    } @else {
      <app-empty-state icon="shield-check" title="No encontramos esta obra social"
        description="La obra social que buscás no existe." [hasAction]="true">
        <a class="btn-edm btn-edm--primary" routerLink="/facturacion/obras-sociales">Volver a obras sociales</a>
      </app-empty-state>
    }
  `,
  styles: [`
    :host { display: block; }
    .back-link { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-accent-deep); margin-bottom: var(--space-5); }
    .back-link:hover { text-decoration: underline; }
    .osd { display: flex; flex-direction: column; gap: var(--space-5); }
    .osd__hero { display: flex; align-items: center; gap: var(--space-5); flex-wrap: wrap; }
    .osd__logo { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; flex: 0 0 auto; border-radius: 50%; border: 1px solid var(--color-border); color: var(--color-accent-deep); font-family: var(--font-display); font-weight: var(--weight-medium); font-size: var(--text-title); }
    .osd__hero-body { flex: 1; min-width: 160px; }
    .osd__hero-body h2 { color: var(--color-text); }
    .osd__stats { display: flex; gap: var(--space-8); }
    .osd__stat { display: flex; flex-direction: column; gap: 2px; }
    .osd__stat-val { color: var(--color-text); }
    .osd__patients-title { color: var(--color-text); margin-bottom: var(--space-4); }
    .osd__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-2); }
    .osd__patient { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); border-radius: var(--radius-md); color: var(--color-text); transition: background-color var(--motion-fast) var(--motion-ease); }
    .osd__patient:hover { background: var(--color-accent-tint); }
    .osd__patient:focus-visible { box-shadow: var(--focus-ring); outline: none; }
    .osd__patient-body { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    @media (max-width: 767px) { .osd__stats { width: 100%; justify-content: space-between; gap: var(--space-4); } }
  `],
})
export class ObraSocialDetailComponent {
  readonly id = input<string>('');
  private readonly store = inject(StoreService);
  protected readonly os = computed(() => this.store.obraSocialById(this.id()));
  protected readonly patients = computed(() => this.store.patientsOfObraSocial(this.id()));
  protected initials(n: string): string {
    const parts = n.trim().split(/\s+/);
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : n.slice(0, 2).toUpperCase();
  }
}
