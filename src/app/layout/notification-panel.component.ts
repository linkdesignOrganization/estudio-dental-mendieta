import { Component, ChangeDetectionStrategy, output, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../shared/components/icon.component';
import { AvatarComponent } from '../shared/components/avatar.component';
import { EmptyStateComponent } from '../shared/components/empty-state.component';
import { StoreService } from '../core/persistence/store.service';
import { AppNotification } from '../core/models/models';

/**
 * Panel de notificaciones (DC-133). Panel contextual <50% (hoja inferior en mobile).
 * Fila: leading circular (ícono temático con fondo / avatar) + título peso 500 +
 * subtítulo gris + relative-time a la derecha. Diferenciación leído/no-leído por item
 * (dot azul leading + fondo tint tenue). Tabs filtro pill (Todas/Sin leer).
 */
@Component({
  selector: 'app-notification-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, AvatarComponent, EmptyStateComponent],
  template: `
    <div class="np-backdrop" (click)="closed.emit()"></div>
    <section class="np" role="dialog" aria-label="Notificaciones">
      <header class="np__head">
        <h2 class="np__title t-body-medium">Notificaciones</h2>
        <button type="button" class="icon-btn" aria-label="Cerrar" (click)="closed.emit()"><app-icon name="x" [size]="18" /></button>
      </header>

      <div class="np__filters" role="tablist" aria-label="Filtrar notificaciones">
        <button type="button" class="np__pill" [class.is-active]="filter() === 'todas'" role="tab"
                [attr.aria-selected]="filter() === 'todas'" (click)="filter.set('todas')">Todas</button>
        <button type="button" class="np__pill" [class.is-active]="filter() === 'sin-leer'" role="tab"
                [attr.aria-selected]="filter() === 'sin-leer'" (click)="filter.set('sin-leer')">Sin leer</button>
      </div>

      @if (list().length) {
        <ul class="np__list">
          @for (n of list(); track n.id) {
            <li>
              <button type="button" class="np__item" [class.is-unread]="!n.leida" (click)="open(n)">
                <span class="np__lead" [attr.data-tone]="tone(n)">
                  @if (n.pacienteFoto && n.tipo === 'cumpleanos') { <app-avatar [src]="n.pacienteFoto" size="sm" /> }
                  @else { <app-icon [name]="n.icono" [size]="18" /> }
                </span>
                <span class="np__body">
                  <span class="np__item-title t-body-medium">{{ n.titulo }}</span>
                  <span class="np__item-sub t-small t-secondary">{{ n.subtitulo }}</span>
                </span>
                <span class="np__time t-small t-secondary">{{ n.fechaRelativa }}</span>
                @if (!n.leida) { <span class="np__dot" aria-label="Sin leer"></span> }
              </button>
            </li>
          }
        </ul>
      } @else {
        <div class="np__empty">
          <app-empty-state icon="bell" title="Sin notificaciones"
            description="Cuando haya turnos, pagos o recordatorios, los vas a ver acá." />
        </div>
      }
    </section>
  `,
  styles: [`
    .np-backdrop { position: fixed; inset: 0; background: transparent; z-index: 1099; }
    .np {
      position: absolute; top: calc(100% + 8px); right: 0; width: 360px; max-width: calc(100vw - 32px);
      background: var(--color-bg-elevated); border-radius: var(--radius-lg); box-shadow: var(--shadow-overlay);
      z-index: 1100; overflow: hidden; animation: np-in 200ms var(--motion-ease);
    }
    .np__head { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4) var(--space-4) var(--space-3); }
    .np__title { margin: 0; }
    .np__filters { display: flex; gap: var(--space-2); padding: 0 var(--space-4) var(--space-3); }
    .np__pill {
      border: 1px solid var(--color-border); background: var(--color-bg-elevated); cursor: pointer;
      padding: 4px 12px; border-radius: var(--radius-pill); font-size: var(--text-small);
      font-family: var(--font-body); color: var(--color-text-secondary);
      transition: background-color var(--motion-fast) var(--motion-ease), color var(--motion-fast) var(--motion-ease);
    }
    .np__pill:hover { background: var(--color-accent-tint); }
    .np__pill.is-active { background: var(--color-accent-sky); border-color: var(--color-accent-sky); color: var(--color-text); }
    .np__pill:focus-visible { box-shadow: var(--focus-ring); }
    .np__list { list-style: none; margin: 0; padding: 0 var(--space-2) var(--space-2); max-height: 420px; overflow-y: auto; }
    .np__item {
      position: relative; display: flex; align-items: flex-start; gap: var(--space-3);
      padding: var(--space-3); border-radius: var(--radius-md); width: 100%; text-align: left;
      border: none; background: transparent; cursor: pointer; font-family: var(--font-body);
      transition: background-color var(--motion-fast) var(--motion-ease);
    }
    .np__empty { padding: var(--space-4); }
    .np__item:hover { background: var(--color-accent-tint); }
    .np__item.is-unread { background: color-mix(in srgb, var(--color-accent-tint) 70%, transparent); }
    .np__item:focus-visible { box-shadow: var(--focus-ring); }
    .np__lead {
      display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto;
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--color-accent-tint); color: var(--color-accent-deep);
    }
    .np__lead[data-tone="error"] { background: var(--color-error-bg); color: var(--color-error-text); }
    .np__lead[data-tone="warning"] { background: var(--color-warning-bg); color: var(--color-warning-text); }
    .np__lead[data-tone="success"] { background: var(--color-success-bg); color: var(--color-success-text); }
    .np__body { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    .np__item-title { color: var(--color-text); }
    .np__item-sub { line-height: 1.4; }
    .np__time { flex: 0 0 auto; white-space: nowrap; }
    .np__dot { position: absolute; left: 4px; top: 50%; width: 6px; height: 6px; border-radius: 50%; background: var(--color-accent-deep); transform: translateY(-50%); }
    @keyframes np-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
    @media (prefers-reduced-motion: reduce) { .np { animation: none; } }
    @media (max-width: 767px) {
      .np { position: fixed; left: 0; right: 0; bottom: 0; top: auto; width: 100%; max-width: none; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
      .np-backdrop { background: rgba(42,42,53,0.35); }
    }
  `],
})
export class NotificationPanelComponent {
  readonly closed = output<void>();
  private readonly store = inject(StoreService);
  private readonly router = inject(Router);
  protected readonly filter = signal<'todas' | 'sin-leer'>('todas');

  protected readonly list = computed(() => {
    const all = this.store.notifications();
    return this.filter() === 'sin-leer' ? all.filter((n) => !n.leida) : all;
  });

  protected open(n: AppNotification) {
    this.store.marcarNotificacionLeida(n.id);
    this.closed.emit();
    if (n.ruta) this.router.navigateByUrl(n.ruta);
  }

  protected tone(n: AppNotification): string {
    return { turno: 'info', pago: 'error', cumpleanos: 'success', tratamiento: 'warning' }[n.tipo] ?? 'info';
  }
}
