import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { IconComponent } from '../../shared/components/icon.component';

interface Faq { q: string; a: string; }
interface FaqGroup { tema: string; icon: string; items: Faq[]; }

/**
 * Ayuda (DEMO-018 / DC-049). FAQ por tema en cards aireadas. Cero demo en copy.
 */
@Component({
  selector: 'app-help',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="page-head">
      <div class="page-head__titles">
        <h2 class="t-display">Ayuda</h2>
        <span class="page-head__subtitle">Preguntas frecuentes sobre el uso del sistema</span>
      </div>
    </div>

    <div class="help">
      @for (g of groups; track g.tema) {
        <section class="surface-card help-card">
          <header class="help-card__head"><span class="help-card__glyph"><app-icon [name]="g.icon" [size]="20" /></span><h3 class="t-title">{{ g.tema }}</h3></header>
          <div class="help-faqs">
            @for (f of g.items; track f.q; let i = $index) {
              <details class="faq" [open]="i === 0">
                <summary class="faq__q t-body-medium">{{ f.q }}<app-icon name="caret-down" [size]="16" /></summary>
                <p class="faq__a t-body t-secondary">{{ f.a }}</p>
              </details>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .help { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-5); align-items: start; }
    .help-card { display: flex; flex-direction: column; gap: var(--space-4); }
    .help-card__head { display: flex; align-items: center; gap: var(--space-3); }
    .help-card__glyph { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; flex: 0 0 auto; border-radius: var(--radius-sm); background: var(--color-accent-tint); color: var(--color-accent-deep); }
    .help-card__head h3 { color: var(--color-text); }
    .help-faqs { display: flex; flex-direction: column; }
    .faq { border-bottom: 1px solid var(--color-border); padding: var(--space-3) 0; }
    .faq:last-child { border-bottom: none; }
    .faq__q { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); cursor: pointer; color: var(--color-text); list-style: none; }
    .faq__q::-webkit-details-marker { display: none; }
    .faq__q app-icon { transition: transform var(--motion-fast) var(--motion-ease); }
    .faq[open] .faq__q app-icon { transform: rotate(180deg); }
    .faq:focus-within .faq__q { color: var(--color-accent-deep); }
    .faq__a { margin: var(--space-2) 0 0; line-height: var(--lh-body); }
    @media (max-width: 767px) { .help { grid-template-columns: 1fr; } }
  `],
})
export class HelpComponent {
  protected readonly groups: FaqGroup[] = [
    { tema: 'Agenda y turnos', icon: 'calendar-blank', items: [
      { q: '¿Cómo agendo un turno nuevo?', a: 'Desde Agenda tocá "Nuevo turno" y seguí los tres pasos: elegí el paciente, el profesional y la fecha, y confirmá el tratamiento.' },
      { q: '¿Puedo reagendar un turno?', a: 'Sí. Abrí el detalle del turno y tocá "Reagendar". Elegí el nuevo horario y se notifica al paciente automáticamente.' },
    ]},
    { tema: 'Pacientes y fichas', icon: 'users', items: [
      { q: '¿Dónde veo el odontograma?', a: 'Dentro de la ficha del paciente, en la pestaña "Odontograma". Tocá cualquier pieza para ver y editar su estado.' },
      { q: '¿Cómo registro un pago?', a: 'En la pestaña "Pagos" de la ficha tocá "Registrar pago", ingresá el monto y el medio de pago.' },
    ]},
    { tema: 'Facturación', icon: 'receipt', items: [
      { q: '¿Cómo creo un presupuesto?', a: 'En Facturación → Presupuestos tocá "Nuevo presupuesto" y seguí los pasos para armar el desglose.' },
      { q: '¿Qué muestran las obras sociales?', a: 'Cada obra social muestra sus pacientes activos, la deuda acumulada y el último pago registrado.' },
    ]},
    { tema: 'Reportes', icon: 'chart-bar', items: [
      { q: '¿Qué indicadores hay en el dashboard?', a: 'Pacientes nuevos, turnos atendidos, tratamientos completados, ingresos facturados, cobrado y deuda. Cada uno abre su reporte detallado.' },
    ]},
  ];
}
