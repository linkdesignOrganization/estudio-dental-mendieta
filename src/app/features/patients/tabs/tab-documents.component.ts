import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { StoreService } from '../../../core/persistence/store.service';
import { currentPatientId } from '../patient-context';

/**
 * Ficha — Tab 5 Documentos (DEMO-011 / DC-044 / DC-110). Galería en grilla, thumbnail
 * + nombre, fallback a placeholder controlado (ícono image + fondo neutro), NO ícono
 * de error del navegador.
 */
@Component({
  selector: 'app-tab-documents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, EmptyStateComponent],
  template: `
    <section class="surface-card is-lg">
      <header class="docs__head"><h3 class="t-title">Documentos</h3></header>
      @if (documents().length) {
        <div class="docs__grid">
          @for (d of documents(); track d.id) {
            <figure class="doc">
              <div class="doc__thumb">
                @if (d.thumbnailPath) {
                  <img class="doc__img" [src]="d.thumbnailPath" [alt]="d.nombre" loading="lazy" />
                } @else {
                  <span class="doc__placeholder"><app-icon name="image" [size]="24" /></span>
                }
              </div>
              <figcaption class="doc__cap">
                <span class="doc__name t-body">{{ d.nombre }}</span>
                <span class="doc__type t-small t-secondary">{{ d.tipo === 'radiografia' ? 'Radiografía' : 'Foto clínica' }}</span>
              </figcaption>
            </figure>
          }
        </div>
      } @else {
        <app-empty-state icon="image" title="Sin documentos"
          description="Este paciente todavía no tiene documentos cargados." />
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .docs__head { margin-bottom: var(--space-5); }
    .docs__head h3 { color: var(--color-text); }
    .docs__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
    .doc { margin: 0; display: flex; flex-direction: column; gap: var(--space-2); cursor: pointer; }
    .doc__thumb {
      aspect-ratio: 4 / 3; border-radius: var(--radius-md); border: 1px solid var(--color-border);
      background: var(--color-neutral-bg); display: flex; align-items: center; justify-content: center;
      transition: border-color var(--motion-fast) var(--motion-ease);
    }
    .doc:hover .doc__thumb { border-color: var(--color-accent-sky); }
    .doc__thumb { overflow: hidden; }
    .doc__img { width: 100%; height: 100%; object-fit: cover; }
    .doc__placeholder { color: var(--color-text-secondary); }
    .doc__cap { display: flex; flex-direction: column; gap: 2px; }
    .doc__name { color: var(--color-text); }
    @media (max-width: 767px) { .docs__grid { grid-template-columns: repeat(2, 1fr); } }
  `],
})
export class TabDocumentsComponent {
  private readonly store = inject(StoreService);
  private readonly id = currentPatientId();
  protected readonly documents = computed(() => this.store.documentsOf(this.id));
}
