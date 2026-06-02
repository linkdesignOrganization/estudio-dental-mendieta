import { Component, ChangeDetectionStrategy, input, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { AvatarComponent } from '../../shared/components/avatar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { StoreService } from '../../core/persistence/store.service';
import { ToastService } from '../../shared/components/toast.service';
import { AppointmentFlowService } from '../agenda/appointment-flow.service';
import { Patient } from '../../core/models/models';
import { paymentBadge } from '../../shared/status-map';

interface TabLink { label: string; route: string; }

/**
 * Pacientes — Ficha: cabecera + 6 tabs (DEMO-009 / DC-041 / DC-074, PANTALLA-FIRMA).
 * Banner azul sobrio (NUNCA aurora). Header con asimetría: foto xl circular + nombre
 * grande izq; panel de datos con icon-chips der. 1 acción primaria "Agendar turno" +
 * menú ⋯. Barra de 6 tabs. Cabecera estable al cambiar de tab. Tab activo en URL;
 * contenido inactivo NO en DOM (router-outlet hijo). `:id` enlazado vía input binding.
 */
@Component({
  selector: 'app-patient-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, AvatarComponent, StatusBadgeComponent, EmptyStateComponent, ConfirmDialogComponent],
  template: `
    @if (patient(); as p) {
      <article class="ficha">
        <header class="ficha__header surface-card is-lg">
          <div class="ficha__banner" aria-hidden="true"></div>
          <div class="ficha__head-body">
            <div class="ficha__identity">
              <div class="ficha__photo"><app-avatar [src]="p.fotoPath" [name]="fullName()" size="xl" /></div>
              <div class="ficha__name-wrap">
                <h1 class="ficha__name t-display-lg">{{ fullName() }}</h1>
                <p class="ficha__sub t-body t-secondary">{{ p.edad }} años · {{ p.genero === 'mujer' ? 'Femenino' : 'Masculino' }} · {{ p.obraSocial }}</p>
                <div class="ficha__badges">
                  <app-status-badge [label]="badge().label" [tone]="badge().tone" />
                  @for (a of p.alergias; track a) {
                    <app-status-badge [label]="'Alergia: ' + a" tone="error" />
                  }
                </div>
              </div>
            </div>

            <aside class="ficha__panel">
              <div class="icon-chip">
                <span class="icon-chip__glyph"><app-icon name="identification-card" [size]="16" /></span>
                <div class="icon-chip__body"><span class="icon-chip__label">DNI</span><span class="icon-chip__value">{{ p.dni }}</span></div>
              </div>
              <div class="icon-chip">
                <span class="icon-chip__glyph"><app-icon name="phone" [size]="16" /></span>
                <div class="icon-chip__body"><span class="icon-chip__label">Teléfono</span><span class="icon-chip__value">{{ p.telefono }}</span></div>
              </div>
              <div class="icon-chip">
                <span class="icon-chip__glyph"><app-icon name="envelope-simple" [size]="16" /></span>
                <div class="icon-chip__body"><span class="icon-chip__label">Correo</span><span class="icon-chip__value">{{ p.email }}</span></div>
              </div>
              <div class="icon-chip">
                <span class="icon-chip__glyph"><app-icon name="user" [size]="16" /></span>
                <div class="icon-chip__body"><span class="icon-chip__label">Profesional de cabecera</span><span class="icon-chip__value">{{ p.profesional }}</span></div>
              </div>
            </aside>

            <div class="ficha__actions">
              <button type="button" class="btn-edm btn-edm--primary" (click)="agendarTurno(p.id)">
                <app-icon name="calendar-plus" [size]="18" /> Agendar turno
              </button>
              <div class="ficha__menu">
                <button type="button" class="icon-btn" aria-label="Más acciones del paciente"
                        [attr.aria-expanded]="menuOpen()" (click)="menuOpen.set(!menuOpen())">
                  <app-icon name="dots-three" [size]="20" />
                </button>
                @if (menuOpen()) {
                  <div class="ficha__menu-pop" role="menu">
                    <a class="ficha__menu-item" role="menuitem" [routerLink]="['/pacientes', p.id, 'editar']" (click)="menuOpen.set(false)">
                      <app-icon name="pencil-simple" [size]="16" /> Editar paciente
                    </a>
                    <button type="button" class="ficha__menu-item ficha__menu-item--danger" role="menuitem" (click)="askDelete()">
                      <app-icon name="trash" [size]="16" /> Eliminar paciente
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </header>

        <nav class="ficha__tabs" role="tablist" aria-label="Secciones de la ficha">
          @for (t of tabs; track t.route) {
            <a class="ficha__tab" [routerLink]="['/pacientes', p.id, t.route]" routerLinkActive="is-active"
               #rla="routerLinkActive" role="tab" [attr.aria-selected]="rla.isActive"
               [attr.tabindex]="rla.isActive ? 0 : -1" ariaCurrentWhenActive="page">{{ t.label }}</a>
          }
        </nav>

        <section class="ficha__panel-content" role="tabpanel">
          <router-outlet />
        </section>
      </article>

      @if (confirmDelete()) {
        <app-confirm-dialog
          [title]="'Eliminar la ficha de ' + fullName()"
          message="Esta acción no se puede deshacer. Se eliminará la ficha del paciente y toda su información."
          confirmLabel="Sí, eliminar" cancelLabel="Cancelar" [destructive]="true"
          (confirm)="doDelete(p.id)" (cancel)="confirmDelete.set(false)" />
      }
    } @else {
      <app-empty-state icon="users" title="No encontramos este paciente"
        description="El paciente que buscás no existe o fue dado de baja." [hasAction]="true">
        <a class="btn-edm btn-edm--primary" routerLink="/pacientes">Volver a la lista</a>
      </app-empty-state>
    }
  `,
  styles: [`
    :host { display: block; }
    .ficha { display: flex; flex-direction: column; gap: var(--space-6); }
    .ficha__header { position: relative; padding: 0; overflow: hidden; }
    .ficha__banner { height: 120px; background: linear-gradient(135deg, var(--color-accent-sky) 0%, #dcebf6 50%, #f4fafe 100%); }
    .ficha__head-body { display: grid; grid-template-columns: 1fr auto; gap: var(--space-6); padding: 0 var(--card-padding-lg) var(--card-padding-lg); }
    .ficha__identity { display: flex; align-items: flex-end; gap: var(--space-5); margin-top: -56px; }
    .ficha__photo { flex: 0 0 auto; }
    .ficha__name-wrap { display: flex; flex-direction: column; gap: var(--space-2); padding-bottom: var(--space-2); }
    .ficha__name { margin: 0; }
    .ficha__sub { margin: 0; }
    .ficha__badges { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-1); }
    .ficha__panel { display: grid; grid-template-columns: 1fr; gap: var(--space-3); padding-top: var(--space-6); min-width: 260px; align-content: start; }
    .ficha__actions { grid-column: 1 / -1; display: flex; align-items: center; gap: var(--space-2); }
    .ficha__menu { position: relative; }
    .ficha__menu-pop {
      position: absolute; right: 0; top: calc(100% + 6px); z-index: 60; min-width: 200px;
      background: var(--color-bg-elevated); border: 1px solid var(--color-border);
      border-radius: var(--radius-md); box-shadow: var(--shadow-overlay); padding: var(--space-1);
      display: flex; flex-direction: column;
    }
    .ficha__menu-item {
      display: flex; align-items: center; gap: var(--space-2); width: 100%; min-height: 40px;
      padding: 0 var(--space-3); border: none; background: transparent; cursor: pointer; text-align: left;
      color: var(--color-text); font-family: var(--font-body); font-size: var(--text-body);
      border-radius: var(--radius-sm); transition: background-color var(--motion-fast) var(--motion-ease);
    }
    .ficha__menu-item:hover { background: var(--color-accent-tint); }
    .ficha__menu-item:focus-visible { box-shadow: var(--focus-ring); outline: none; }
    .ficha__menu-item--danger { color: var(--color-error-text); }
    .ficha__menu-item--danger:hover { background: var(--color-error-bg); }
    .ficha__tabs { display: flex; gap: var(--space-1); border-bottom: 1px solid var(--color-border); overflow-x: auto; scrollbar-width: none; }
    .ficha__tabs::-webkit-scrollbar { display: none; }
    .ficha__tab {
      flex: 0 0 auto; padding: var(--space-3) var(--space-4); color: var(--color-text-secondary);
      font-size: var(--text-body); border-radius: var(--radius-sm) var(--radius-sm) 0 0; white-space: nowrap;
      border-bottom: 2px solid transparent; transition: background-color var(--motion-fast) var(--motion-ease), color var(--motion-fast) var(--motion-ease);
    }
    .ficha__tab:hover { background: var(--color-accent-tint); color: var(--color-text); }
    .ficha__tab.is-active { color: var(--color-text); font-weight: var(--weight-medium); background: var(--color-accent-tint); border-bottom-color: var(--color-accent); }
    .ficha__tab:focus-visible { box-shadow: var(--focus-ring); outline: none; }
    @media (max-width: 991px) {
      .ficha__head-body { grid-template-columns: 1fr; }
      .ficha__panel { grid-template-columns: 1fr 1fr; padding-top: var(--space-4); }
      .ficha__actions { grid-column: 1 / -1; }
    }
    @media (max-width: 767px) {
      .ficha__identity { flex-direction: column; align-items: center; text-align: center; margin-top: -64px; }
      .ficha__name-wrap { align-items: center; }
      .ficha__badges { justify-content: center; }
      .ficha__panel { grid-template-columns: 1fr; }
      .ficha__actions .btn-edm { flex: 1; }
    }
  `],
})
export class PatientDetailComponent {
  /** :id de la ruta (withComponentInputBinding). */
  readonly id = input<string>('');

  private readonly store = inject(StoreService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly flow = inject(AppointmentFlowService);

  protected readonly menuOpen = signal(false);
  protected readonly confirmDelete = signal(false);

  protected readonly patient = computed<Patient | undefined>(() => this.store.patientById(this.id()));
  protected readonly fullName = computed(() => {
    const p = this.patient();
    return p ? `${p.nombre} ${p.apellido}` : '';
  });
  protected readonly badge = computed(() => {
    const p = this.patient();
    return p ? paymentBadge(p.estadoCuenta) : { label: '', tone: 'neutral' as const };
  });

  protected readonly tabs: TabLink[] = [
    { label: 'Información general', route: 'informacion' },
    { label: 'Odontograma', route: 'odontograma' },
    { label: 'Historial clínico', route: 'historial' },
    { label: 'Tratamientos', route: 'tratamientos' },
    { label: 'Documentos', route: 'documentos' },
    { label: 'Pagos', route: 'pagos' },
  ];

  /** Inicia el flujo de crear turno con el paciente preseleccionado (UX-021). */
  protected agendarTurno(pacienteId: string) {
    this.flow.reset();
    this.flow.setPaciente(pacienteId);
    this.router.navigate(['/agenda/nuevo/profesional']);
  }

  protected askDelete() {
    this.menuOpen.set(false);
    this.confirmDelete.set(true);
  }
  protected doDelete(id: string) {
    this.confirmDelete.set(false);
    this.store.eliminarPaciente(id);
    this.toast.success('Paciente eliminado.');
    this.router.navigate(['/pacientes']);
  }
}
