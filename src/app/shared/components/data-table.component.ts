import { Component, ChangeDetectionStrategy, input, output, signal, computed, contentChild, TemplateRef, Directive, effect } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from './icon.component';
import { SkeletonComponent } from './skeleton.component';
import { EmptyStateComponent } from './empty-state.component';

export interface TableColumn { key: string; label: string; align?: 'start' | 'end'; }

/** Directiva para proyectar la plantilla de fila de la tabla (desktop) y mini-card (mobile). */
@Directive({ selector: '[appRow]' })
export class TableRowDirective {}

/**
 * data-table (DEMO-008/012/013 / DC-063 / DC-081 / BVC-009). ≤5 columnas.
 * Header: labels gris uppercase con tracking, sin fondo pesado. Filas ~48px,
 * divider 1px. Footer: contador "1–N de M" + paginación offset (NUNCA infinite scroll).
 * Mobile: cada fila → mini-card vertical (DC-081). Estados: carga (skeleton stagger),
 * vacío (empty-state). El consumidor provee la plantilla de fila/celdas vía [appRow].
 */
@Component({
  selector: 'app-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, IconComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    @if (loading()) {
      <div class="dt surface-card is-lg" aria-busy="true" aria-label="Cargando datos">
        <div class="dt__skel">
          @for (i of skelRows(); track i) { <app-skeleton preset="card-row" [index]="i" /> }
        </div>
      </div>
    } @else if (total() === 0) {
      <div class="surface-card is-lg">
        <app-empty-state [icon]="emptyIcon()" [title]="emptyTitle()" [description]="emptyDescription()" [hasAction]="hasEmptyAction()">
          <ng-content select="[emptyAction]"></ng-content>
        </app-empty-state>
      </div>
    } @else {
      <div class="dt surface-card is-lg">
        <!-- desktop -->
        <table class="dt__table">
          <thead>
            <tr>
              @for (col of columns(); track col.key) {
                <th class="dt__th t-small" [class.is-end]="col.align === 'end'">{{ col.label }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of pageRows(); track rowKey(row)) {
              <tr class="dt__tr" (click)="rowClick.emit(row)" tabindex="0"
                  (keydown.enter)="rowClick.emit(row)" [attr.aria-label]="rowLabel()(row)">
                <ng-container [ngTemplateOutlet]="rowTpl() ?? null" [ngTemplateOutletContext]="{ $implicit: row, mobile: false }"></ng-container>
              </tr>
            }
          </tbody>
        </table>

        <!-- mobile: cada fila → mini-card -->
        <div class="dt__cards">
          @for (row of pageRows(); track rowKey(row)) {
            <div class="dt__card" (click)="rowClick.emit(row)" tabindex="0" (keydown.enter)="rowClick.emit(row)"
                 [attr.aria-label]="rowLabel()(row)">
              <ng-container [ngTemplateOutlet]="rowTpl() ?? null" [ngTemplateOutletContext]="{ $implicit: row, mobile: true }"></ng-container>
            </div>
          }
        </div>

        <div class="dt__foot">
          <span class="dt__count t-small t-secondary">{{ rangeStart() }}–{{ rangeEnd() }} de {{ total() }}</span>
          <div class="dt__pager">
            <button type="button" class="icon-btn" aria-label="Página anterior" [disabled]="page() === 0" (click)="prev()">
              <app-icon name="caret-left" [size]="18" />
            </button>
            <span class="dt__page t-small">{{ page() + 1 }} / {{ pageCount() }}</span>
            <button type="button" class="icon-btn" aria-label="Página siguiente" [disabled]="page() >= pageCount() - 1" (click)="next()">
              <app-icon name="caret-right" [size]="18" />
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .dt { padding: var(--space-2) var(--space-4) var(--space-2); }
    .dt__skel { padding: var(--space-2) 0; }
    .dt__table { width: 100%; border-collapse: collapse; }
    .dt__th {
      text-align: left; padding: var(--space-3) var(--space-3); color: var(--color-text-secondary);
      text-transform: uppercase; letter-spacing: 0.04em; font-weight: var(--weight-medium);
      border-bottom: 1px solid var(--color-border); white-space: nowrap;
    }
    .dt__th.is-end { text-align: right; }
    .dt__tr { cursor: pointer; transition: background-color var(--motion-fast) var(--motion-ease); }
    .dt__tr:hover { background: var(--color-accent-tint); }
    .dt__tr:focus-visible { outline: none; box-shadow: inset var(--focus-ring); }
    .dt__cards { display: none; }
    .dt__foot { display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-2); border-top: 1px solid var(--color-border); margin-top: var(--space-1); }
    .dt__pager { display: flex; align-items: center; gap: var(--space-2); }
    .dt__page { color: var(--color-text-secondary); }
    @media (max-width: 767px) {
      .dt__table { display: none; }
      .dt__cards { display: flex; flex-direction: column; gap: var(--card-gap); padding: var(--space-3) 0; }
      .dt__card {
        border: 1px solid var(--color-border); border-radius: var(--radius-md);
        padding: var(--space-4); cursor: pointer; transition: border-color var(--motion-fast) var(--motion-ease), background-color var(--motion-fast) var(--motion-ease);
      }
      .dt__card:hover { border-color: var(--color-accent-sky); background: var(--color-accent-tint); }
      .dt__card:focus-visible { outline: none; box-shadow: var(--focus-ring); }
    }
  `],
})
export class DataTableComponent<T = unknown> {
  readonly columns = input.required<TableColumn[]>();
  readonly rows = input.required<T[]>();
  readonly loading = input<boolean>(false);
  readonly pageSize = input<number>(12);
  readonly trackKey = input<(row: T) => string>((r) => JSON.stringify(r));
  readonly rowLabel = input<(row: T) => string>(() => 'Ver detalle');
  readonly emptyIcon = input<string>('magnifying-glass');
  readonly emptyTitle = input<string>('No hay resultados');
  readonly emptyDescription = input<string>('');
  readonly hasEmptyAction = input<boolean>(false);

  readonly rowClick = output<T>();

  private readonly rowTplQuery = contentChild(TableRowDirective, { read: TemplateRef });
  protected readonly rowTpl = computed(() => this.rowTplQuery());

  protected readonly page = signal(0);
  protected readonly total = computed(() => this.rows().length);
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly pageRows = computed(() => {
    const start = this.page() * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });
  protected readonly rangeStart = computed(() => this.total() === 0 ? 0 : this.page() * this.pageSize() + 1);
  protected readonly rangeEnd = computed(() => Math.min(this.total(), (this.page() + 1) * this.pageSize()));
  protected readonly skelRows = computed(() => Array.from({ length: Math.min(this.pageSize(), 6) }, (_, i) => i));

  constructor() {
    // Si el set de filas se achica (p. ej. tras filtrar) y la página actual queda fuera
    // de rango, reencuadra a la última página válida para no mostrar una página vacía.
    effect(() => {
      const max = this.pageCount() - 1;
      if (this.page() > max) this.page.set(Math.max(0, max));
    });
  }

  protected rowKey(row: T): string { return this.trackKey()(row); }
  protected prev() { this.page.update((p) => Math.max(0, p - 1)); }
  protected next() { this.page.update((p) => Math.min(this.pageCount() - 1, p + 1)); }
}
