import { Component, ChangeDetectionStrategy, input, computed, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { AvatarComponent } from '../../shared/components/avatar.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ToastService } from '../../shared/components/toast.service';
import { StoreService } from '../../core/persistence/store.service';
import { formatShortDate } from '../../shared/date-format';

/**
 * Agenda — Reagendar turno (DC-039). Card de turno actual arriba + selector de slot
 * abajo, 1 acción. Al confirmar → notificación al paciente presentada como real (sin
 * delatar simulación, ADR-7/GAP-A05).
 */
@Component({
  selector: 'app-reschedule',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, AvatarComponent, EmptyStateComponent],
  template: `
    <a class="back-link t-small" [routerLink]="['/agenda', id()]"><app-icon name="arrow-left" [size]="16" /> Volver al turno</a>

    @if (appt(); as a) {
      <div class="resch">
        <section class="surface-card resch__current">
          <span class="t-small t-secondary">Turno actual</span>
          <div class="resch__current-body">
            <app-avatar [src]="a.pacienteFoto" [name]="a.pacienteNombre" size="sm" />
            <div>
              <span class="t-body-medium">{{ a.pacienteNombre }}</span>
              <p class="t-small t-secondary">{{ fechaActual() }} · {{ a.hora }} · {{ a.profesional }}</p>
            </div>
          </div>
        </section>

        <section class="surface-card is-lg resch__pick">
          <h3 class="t-title resch__title">Elegí un nuevo horario</h3>
          <div class="form-grid">
            <div class="field"><label class="field__label" for="r-date">Nueva fecha</label><input id="r-date" class="input-edm" type="date" [value]="fecha()" min="2026-06-01" (change)="onDate($event)" /></div>
          </div>
          <div class="field">
            <span class="field__label">Horarios disponibles</span>
            <div class="resch__slots">
              @for (s of slots; track s) {
                <button type="button" class="resch__slot" [class.is-selected]="slot() === s"
                        [disabled]="isOccupied(s)" [attr.title]="isOccupied(s) ? 'Horario ocupado' : null" (click)="slot.set(s)">{{ s }}</button>
              }
            </div>
            <span class="t-small t-secondary resch__hint">Los horarios ocupados de este profesional no están disponibles.</span>
          </div>
          <div class="resch__actions">
            <a class="btn-edm btn-edm--secondary" [routerLink]="['/agenda', id()]">Cancelar</a>
            <button type="button" class="btn-edm btn-edm--primary" [disabled]="!slot()" (click)="confirm(a.id)"><app-icon name="check" [size]="18" /> Confirmar nuevo horario</button>
          </div>
        </section>
      </div>
    } @else {
      <app-empty-state icon="calendar-blank" title="No encontramos este turno"
        description="El turno que buscás no existe o fue eliminado." [hasAction]="true">
        <a class="btn-edm btn-edm--primary" routerLink="/agenda">Volver a Agenda</a>
      </app-empty-state>
    }
  `,
  styles: [`
    :host { display: block; }
    .back-link { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-accent-deep); margin-bottom: var(--space-5); }
    .back-link:hover { text-decoration: underline; }
    .resch { display: flex; flex-direction: column; gap: var(--space-5); max-width: 680px; }
    .resch__current { display: flex; flex-direction: column; gap: var(--space-3); }
    .resch__current-body { display: flex; align-items: center; gap: var(--space-3); }
    .resch__pick { display: flex; flex-direction: column; gap: var(--space-5); }
    .resch__title { color: var(--color-text); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .resch__slots { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .resch__slot { min-height: 40px; padding: 0 var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-elevated); color: var(--color-text); cursor: pointer; font-family: var(--font-body); font-size: var(--text-body); transition: background-color var(--motion-fast) var(--motion-ease), border-color var(--motion-fast) var(--motion-ease); }
    .resch__slot:hover:not(:disabled) { background: var(--color-accent-tint); }
    .resch__slot.is-selected { background: var(--color-accent-sky); border-color: var(--color-accent); }
    .resch__slot:disabled { opacity: 0.4; cursor: not-allowed; text-decoration: line-through; }
    .resch__slot:focus-visible { box-shadow: var(--focus-ring); outline: none; }
    .resch__hint { display: block; margin-top: var(--space-2); }
    .resch__actions { display: flex; justify-content: flex-end; gap: var(--space-3); }
    @media (max-width: 767px) { .form-grid { grid-template-columns: 1fr; } .resch__actions { flex-direction: column-reverse; } .resch__actions .btn-edm { width: 100%; } .resch__slot { min-height: var(--touch-target-min); } }
  `],
})
export class RescheduleComponent {
  readonly id = input<string>('');
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly store = inject(StoreService);

  protected readonly appt = computed(() => this.store.appointmentById(this.id()));
  protected readonly slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
  protected readonly slot = signal('');
  protected readonly fecha = signal('2026-06-09');

  protected fechaActual(): string {
    const a = this.appt();
    return a ? formatShortDate(a.fecha) : '—';
  }

  protected isOccupied(s: string): boolean {
    const a = this.appt();
    if (!a) return false;
    const ent = this.store.appointmentEntityById(a.id);
    if (!ent) return false;
    const ocupados = this.store.occupiedSlots(ent.profesionalId, this.fecha());
    // permitir el horario actual del propio turno si la fecha coincide (no es un choque real)
    if (a.fecha === this.fecha()) ocupados.delete(a.hora);
    return ocupados.has(s);
  }

  protected onDate(e: Event) { this.fecha.set((e.target as HTMLInputElement).value); this.slot.set(''); }

  protected confirm(id: string) {
    if (!this.slot()) return;
    this.store.reagendarTurno(id, this.fecha(), this.slot());
    this.toast.success('Turno reagendado. Se notificó al paciente por WhatsApp.');
    this.router.navigate(['/agenda', id]);
  }
}
