import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon.component';
import { currentPatient } from '../patient-context';

/**
 * Ficha — Tab 1 Información (DEMO-011 / DC-042 / DC-106). Cards aireadas (Datos
 * personales · Contacto · Obra social · Datos clínicos), NO tablas densas, mucho aire.
 * Campo sin dato → placeholder claro ("Sin alergias registradas"), nunca en blanco.
 */
@Component({
  selector: 'app-tab-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (p; as patient) {
      <div class="info-grid">
        <section class="surface-card info-card">
          <header class="info-card__head"><app-icon name="user" [size]="18" /><h3 class="t-title">Datos personales</h3></header>
          <dl class="info-list">
            <div class="info-row"><dt>Nombre completo</dt><dd>{{ patient.nombre }} {{ patient.apellido }}</dd></div>
            <div class="info-row"><dt>Documento</dt><dd>{{ patient.dni }}</dd></div>
            <div class="info-row"><dt>Fecha de nacimiento</dt><dd>{{ patient.fechaNacimiento }} ({{ patient.edad }} años)</dd></div>
            <div class="info-row"><dt>Género</dt><dd>{{ patient.genero === 'mujer' ? 'Femenino' : 'Masculino' }}</dd></div>
          </dl>
        </section>

        <section class="surface-card info-card">
          <header class="info-card__head"><app-icon name="phone" [size]="18" /><h3 class="t-title">Contacto</h3></header>
          <dl class="info-list">
            <div class="info-row"><dt>Teléfono</dt><dd>{{ patient.telefono }}</dd></div>
            <div class="info-row"><dt>Correo</dt><dd>{{ patient.email }}</dd></div>
            <div class="info-row"><dt>Dirección</dt><dd>{{ patient.direccion }}</dd></div>
            <div class="info-row">
              <dt>Contacto de emergencia</dt>
              @if (patient.contactoEmergencia; as ce) {
                <dd>{{ ce.nombre }} ({{ ce.relacion }}) · {{ ce.telefono }}</dd>
              } @else {
                <dd class="is-muted">Sin contacto registrado</dd>
              }
            </div>
          </dl>
        </section>

        <section class="surface-card info-card">
          <header class="info-card__head"><app-icon name="shield-check" [size]="18" /><h3 class="t-title">Obra social</h3></header>
          <dl class="info-list">
            <div class="info-row"><dt>Cobertura</dt><dd>{{ patient.obraSocial }}</dd></div>
            <div class="info-row">
              <dt>Número de afiliado</dt>
              <dd [class.is-muted]="patient.numeroAfiliado === '—'">{{ patient.numeroAfiliado }}</dd>
            </div>
            <div class="info-row"><dt>Profesional de cabecera</dt><dd>{{ patient.profesional }}</dd></div>
          </dl>
        </section>

        <section class="surface-card info-card">
          <header class="info-card__head"><app-icon name="first-aid-kit" [size]="18" /><h3 class="t-title">Datos clínicos</h3></header>
          <dl class="info-list">
            <div class="info-row">
              <dt>Alergias</dt>
              <dd [class.is-muted]="!patient.alergias.length">{{ patient.alergias.length ? patient.alergias.join(', ') : 'Sin alergias registradas' }}</dd>
            </div>
            <div class="info-row">
              <dt>Medicación</dt>
              <dd [class.is-muted]="!patient.medicacion.length">{{ patient.medicacion.length ? patient.medicacion.join(', ') : 'Sin medicación registrada' }}</dd>
            </div>
            <div class="info-row">
              <dt>Observaciones</dt>
              <dd [class.is-muted]="!patient.observaciones">{{ patient.observaciones || 'Sin observaciones' }}</dd>
            </div>
          </dl>
        </section>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-5); }
    .info-card { display: flex; flex-direction: column; gap: var(--space-4); }
    .info-card__head { display: flex; align-items: center; gap: var(--space-2); color: var(--color-accent-deep); }
    .info-card__head h3 { color: var(--color-text); }
    .info-list { margin: 0; display: flex; flex-direction: column; gap: var(--space-3); }
    .info-row { display: flex; flex-direction: column; gap: 2px; }
    .info-row dt { font-size: var(--text-small); color: var(--color-text-secondary); }
    .info-row dd { margin: 0; font-size: var(--text-body); color: var(--color-text); }
    .info-row dd.is-muted { color: var(--color-text-secondary); font-style: italic; }
    @media (max-width: 767px) { .info-grid { grid-template-columns: 1fr; } }
  `],
})
export class TabInfoComponent {
  protected readonly p = currentPatient();
}
