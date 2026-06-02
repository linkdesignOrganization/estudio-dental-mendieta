import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * footer (DEMO-003 / DC-033 / DC-052 / BVC-027). Banda discreta al pie, una línea
 * de texto secundario gris. Prohibido: atribución a portfolio, "Resetear demo",
 * lenguaje de demo. Copy de producción.
 */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <p class="footer__text t-small t-secondary">Estudio Dental Mendieta · v1.0 · 2026</p>
    </footer>
  `,
  styles: [`
    .footer { border-top: 1px solid var(--color-border); padding: var(--space-6); margin-top: var(--space-12); }
    .footer__text { margin: 0; text-align: center; }
  `],
})
export class FooterComponent {}
