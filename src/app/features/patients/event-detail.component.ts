import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { StoreService } from '../../core/persistence/store.service';

/**
 * Detalle de evento clínico (DC-045). Ruta dedicada. :id y :eventId vía input binding.
 */
@Component({
  selector: 'app-event-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, EmptyStateComponent],
  template: `
    <a class="back-link t-small" [routerLink]="['/pacientes', id(), 'historial']">
      <app-icon name="arrow-left" [size]="16" /> Volver al historial
    </a>

    @if (event(); as e) {
      <article class="surface-card is-lg event">
        <header class="event__head">
          <span class="event__glyph"><app-icon [name]="e.icono" [size]="24" /></span>
          <div>
            <h2 class="t-display">{{ e.titulo }}</h2>
            <p class="t-body t-secondary">{{ e.tipo }} · {{ e.profesional }}</p>
          </div>
        </header>
        <hr class="divider" />
        <dl class="event__meta">
          <div class="event__row"><dt>Fecha</dt><dd>{{ fechaFmt(e.fecha) }} ({{ e.fechaRelativa }})</dd></div>
          <div class="event__row"><dt>Profesional</dt><dd>{{ e.profesional }}</dd></div>
        </dl>
        <p class="event__desc t-body">{{ e.descripcion }}</p>
      </article>
    } @else {
      <app-empty-state icon="clock-counter-clockwise" title="No encontramos este evento"
        description="El evento que buscás no existe." [hasAction]="true">
        <a class="btn-edm btn-edm--primary" [routerLink]="['/pacientes', id(), 'historial']">Volver al historial</a>
      </app-empty-state>
    }
  `,
  styles: [`
    :host { display: block; }
    .back-link { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-accent-deep); margin-bottom: var(--space-5); }
    .back-link:hover { text-decoration: underline; }
    .event { display: flex; flex-direction: column; gap: var(--space-4); max-width: 720px; }
    .event__head { display: flex; align-items: center; gap: var(--space-4); }
    .event__glyph { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; flex: 0 0 auto; border-radius: var(--radius-md); background: var(--color-accent-tint); color: var(--color-accent-deep); }
    .event__head h2 { color: var(--color-text); }
    .event__meta { margin: 0; display: flex; flex-direction: column; gap: var(--space-3); }
    .event__row { display: flex; flex-direction: column; gap: 2px; }
    .event__row dt { font-size: var(--text-small); color: var(--color-text-secondary); }
    .event__row dd { margin: 0; color: var(--color-text); }
    .event__desc { line-height: var(--lh-body); margin-top: var(--space-2); }
  `],
})
export class EventDetailComponent {
  readonly id = input<string>('');
  readonly eventId = input<string>('');
  private readonly store = inject(StoreService);
  protected readonly event = computed(() => this.store.eventById(this.id(), this.eventId()));

  protected fechaFmt(iso: string): string {
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
  }
}
