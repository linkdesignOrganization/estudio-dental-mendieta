import { Component, ChangeDetectionStrategy, input, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { AvatarComponent } from '../../shared/components/avatar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { StoreService } from '../../core/persistence/store.service';
import { appointmentBadge } from '../../shared/status-map';
import { ToastService } from '../../shared/components/toast.service';
import { formatLongDate } from '../../shared/date-format';

/**
 * Agenda — Detalle de turno (DC-037 / DC-104). Card de detalle (fecha/hora/duración/
 * estado + foto/link al paciente). 1 acción primaria "Avanzar estado"; secundarias
 * (Reagendar/Cancelar) en menú. Estado terminal → acción primaria deshabilitada.
 */
@Component({
  selector: 'app-appointment-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, AvatarComponent, StatusBadgeComponent, EmptyStateComponent, ConfirmDialogComponent],
  template: `
    <a class="back-link t-small" routerLink="/agenda"><app-icon name="arrow-left" [size]="16" /> Agenda</a>

    @if (appt(); as a) {
      <div class="appt">
        <section class="surface-card is-lg appt__main">
          <header class="appt__head">
            <div class="appt__patient">
              <app-avatar [src]="a.pacienteFoto" [name]="a.pacienteNombre" size="md" />
              <div>
                <a class="appt__name t-title" [routerLink]="['/pacientes', a.pacienteId]">{{ a.pacienteNombre }}</a>
                <p class="t-small t-secondary">{{ a.tratamiento }}</p>
              </div>
            </div>
            <app-status-badge [label]="badge().label" [tone]="badge().tone" />
          </header>

          <hr class="divider" />

          <dl class="appt__meta">
            <div class="appt__row"><dt><app-icon name="calendar-blank" [size]="16" /> Fecha</dt><dd>{{ fechaLarga() }}</dd></div>
            <div class="appt__row"><dt><app-icon name="clock" [size]="16" /> Hora</dt><dd>{{ a.hora }} · {{ a.duracionMin }} minutos</dd></div>
            <div class="appt__row"><dt><app-icon name="user" [size]="16" /> Profesional</dt><dd>{{ a.profesional }}</dd></div>
            <div class="appt__row"><dt><app-icon name="tooth" [size]="16" /> Motivo</dt><dd>{{ a.tratamiento }}</dd></div>
          </dl>
        </section>

        <aside class="appt__side">
          <button type="button" class="btn-edm btn-edm--primary btn-edm--block" [disabled]="isTerminal()" (click)="advance()">
            <app-icon name="arrow-right" [size]="18" /> Avanzar estado
          </button>
          <a class="btn-edm btn-edm--secondary btn-edm--block" [routerLink]="['/agenda', a.id, 'reagendar']">
            <app-icon name="calendar-check" [size]="18" /> Reagendar
          </a>
          <button type="button" class="btn-edm btn-edm--destructive btn-edm--block" [disabled]="isTerminal()" (click)="askCancel()">
            <app-icon name="x" [size]="18" /> Cancelar turno
          </button>
        </aside>
      </div>

      @if (confirmCancel()) {
        <app-confirm-dialog
          title="Cancelar este turno" message="El paciente quedará sin la cita agendada. ¿Querés cancelarlo?"
          confirmLabel="Sí, cancelar" cancelLabel="Volver" [destructive]="true"
          (confirm)="doCancel(a.id)" (cancel)="confirmCancel.set(false)" />
      }
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
    .appt { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-5); align-items: start; }
    .appt__main { display: flex; flex-direction: column; gap: var(--space-4); }
    .appt__head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }
    .appt__patient { display: flex; align-items: center; gap: var(--space-3); }
    .appt__name { color: var(--color-text); }
    .appt__name:hover { color: var(--color-accent-deep); }
    .appt__meta { margin: 0; display: flex; flex-direction: column; gap: var(--space-4); }
    .appt__row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }
    .appt__row dt { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--color-text-secondary); font-size: var(--text-small); }
    .appt__row dd { margin: 0; color: var(--color-text); text-align: right; }
    .appt__side { display: flex; flex-direction: column; gap: var(--space-3); }
    @media (max-width: 991px) { .appt { grid-template-columns: 1fr; } }
  `],
})
export class AppointmentDetailComponent {
  readonly id = input<string>('');
  private readonly toast = inject(ToastService);
  private readonly store = inject(StoreService);

  protected readonly confirmCancel = signal(false);
  protected readonly appt = computed(() => this.store.appointmentById(this.id()));
  protected readonly badge = computed(() => {
    const a = this.appt();
    return a ? appointmentBadge(a.estado) : { label: '', tone: 'neutral' as const };
  });
  protected readonly isTerminal = computed(() => {
    const a = this.appt();
    return !!a && ['terminado', 'cancelado'].includes(a.estado);
  });

  protected fechaLarga(): string {
    const a = this.appt();
    return a ? formatLongDate(a.fecha) : '—';
  }

  protected advance() {
    const nuevo = this.store.avanzarTurno(this.id());
    if (nuevo) this.toast.success('Turno actualizado.');
  }
  protected askCancel() { this.confirmCancel.set(true); }
  protected doCancel(id: string) {
    this.confirmCancel.set(false);
    this.store.cancelarTurno(id);
    this.toast.success('Turno cancelado.');
  }
}
