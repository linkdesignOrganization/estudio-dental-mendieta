import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { OdontogramComponent } from '../../../shared/components/odontogram.component';
import { SkeletonComponent } from '../../../shared/components/skeleton.component';
import { StoreService } from '../../../core/persistence/store.service';
import { Tooth } from '../../../core/models/models';
import { currentPatientId } from '../patient-context';

/**
 * Ficha — Tab 2 Odontograma (DEMO-010 / DC-043 / DC-107). Diagrama de 32 piezas +
 * leyenda. Cada pieza clickeable → ruta de detalle. Carga con @defer (skeleton del
 * diagrama mientras carga). Paciente nuevo → todas "sana".
 */
@Component({
  selector: 'app-tab-odontogram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OdontogramComponent, SkeletonComponent],
  template: `
    <section class="surface-card is-lg odo-card">
      <header class="odo-card__head">
        <div>
          <h3 class="t-title">Odontograma</h3>
          <p class="t-small t-secondary">Tocá una pieza para ver su detalle e historial.</p>
        </div>
      </header>

      @defer (on viewport) {
        <app-odontogram [top]="top()" [bottom]="bottom()" (select)="openTooth($event)" />
      } @placeholder {
        <div class="odo-skel" aria-hidden="true">
          <app-skeleton preset="block" height="120px" />
          <app-skeleton preset="block" height="120px" [index]="1" />
        </div>
      } @loading (minimum 300ms) {
        <div class="odo-skel" aria-busy="true" aria-label="Cargando odontograma">
          <app-skeleton preset="block" height="120px" />
          <app-skeleton preset="block" height="120px" [index]="1" />
        </div>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .odo-card { display: flex; flex-direction: column; gap: var(--space-5); }
    .odo-card__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); }
    .odo-card__head h3 { color: var(--color-text); }
    .odo-skel { display: flex; flex-direction: column; gap: var(--space-4); }
  `],
})
export class TabOdontogramComponent {
  private readonly store = inject(StoreService);
  private readonly id = currentPatientId();
  private readonly teeth = computed(() => this.store.teethOf(this.id));
  protected readonly top = computed(() => this.teeth().top);
  protected readonly bottom = computed(() => this.teeth().bottom);

  constructor(private router: Router) {}

  protected openTooth(t: Tooth) {
    this.router.navigate(['/pacientes', this.id, 'pieza', t.fdi]);
  }
}
