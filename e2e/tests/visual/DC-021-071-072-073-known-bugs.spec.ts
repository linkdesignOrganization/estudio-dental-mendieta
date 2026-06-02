import { test, expect } from '@playwright/test';
import { warmSeed, gotoApp } from '../_helpers/seed';

/**
 * Visual Checker — Gates de regresión para los bugs detectados en Ronda 1.
 *
 * CIERRE DE COBERTURA:
 * BUG-V01 (CRÍTICO, raíz) — CORREGIDO y verificado en producción: la hoja `styles-*.css` ya se
 *   sirve sin `media="print"` y aplica en pantalla. Esto restaura el estilado de `.btn-edm`
 *   (DC-071: relleno #6da8d4, texto oscuro, alto 40px, radius 12) y la regla disabled
 *   (DC-021/BUG-E02: opacity .4 + cursor not-allowed). Esos dos gates quedan ACTIVOS y PASAN.
 * BUG-V04 (a11y) — CORREGIDO: cada role="tab" de la ficha expone aria-selected. Gate ACTIVO, PASA.
 *
 * BUG-V05 (a11y, PARCIALMENTE corregido — derivado de V01): el fix de V05 subió a ≥44px
 *   burger/bell/avatar (44×44), "Editar paciente", view-toggles, tabs (52px) y piezas del
 *   odontograma (53px). El gate DC-072/088 fue REACTIVADO (ya no es `fixme`), pero HOY sigue
 *   ROJO por DOS controles residuales en /pacientes mobile: `input.search-pill__input` 23px (el
 *   wrapper .search-pill sí mide 44px, el input interno no se estira) y `a.skip-link` 42px.
 *   Reportado a Developer en output/iterations/visual-build/visual-v05-cierre.md. El gate pasará a
 *   verde automáticamente cuando ambos residuales lleguen a ≥44px.
 */

const PID = 'pac-001';

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// DC-071 / GAP-A04 — botón primario con relleno azul medio #6da8d4 + texto oscuro, alto 40px, radius 10-14.
// Verificado en producción tras fix V01: bg rgb(109,168,212), color rgb(42,42,53), radius 12, height 40.
test('DC-071 (BUG-V01): botón primario con relleno #6da8d4 + texto oscuro, alto 40px, radius 10-14', async ({ page }) => {
  await gotoApp(page, `/pacientes/${PID}/informacion`);
  await page.getByRole('button', { name: 'Agendar turno' }).waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  const btn = await page.evaluate(() => {
    const b = document.querySelector('button.btn-edm--primary') as HTMLElement;
    const cs = getComputedStyle(b);
    const rgb = (s: string) => (s.match(/\d+/g) || []).slice(0, 3).map(Number);
    return { bg: rgb(cs.backgroundColor), color: rgb(cs.color), radius: parseInt(cs.borderRadius, 10), height: parseInt(cs.height, 10) };
  });
  // relleno azul medio #6da8d4 = rgb(109,168,212)
  expect(Math.abs(btn.bg[0] - 109) < 10 && Math.abs(btn.bg[1] - 168) < 10 && Math.abs(btn.bg[2] - 212) < 10).toBe(true);
  // texto oscuro #2a2a35 (NO blanco — GAP-A04)
  expect(btn.color[0] < 80 && btn.color[1] < 80 && btn.color[2] < 80).toBe(true);
  expect(btn.radius).toBeGreaterThanOrEqual(10);
  expect(btn.radius).toBeLessThanOrEqual(14);
  expect(btn.height).toBe(40);
});

// DC-021 / BUG-E02 — la regla .btn-edm:disabled aplica: opacidad 0.4 y cursor not-allowed.
//
// V01 era la causa raíz (la hoja no aplicaba → la regla :disabled tampoco). Antes esta prueba
// dependía de encontrar un botón disabled en una vista concreta (frágil y se auto-skipeaba). Ya
// con la hoja aplicando, verificamos la REGLA CSS de forma determinista: montamos un `.btn-edm`
// disabled real dentro del documento de la app (hereda la hoja ya aplicada) y leemos su computed
// style. Verificado en producción: opacity "0.4", cursor "not-allowed".
test('DC-021 (BUG-E02/BUG-V01): la regla .btn-edm:disabled aplica (opacity 0.4 + not-allowed)', async ({ page }) => {
  await gotoApp(page, '/agenda');
  const disabled = await page.evaluate(() => {
    const b = document.createElement('button');
    b.className = 'btn-edm btn-edm--primary';
    b.setAttribute('disabled', '');
    b.textContent = 'probe';
    b.style.position = 'fixed';
    b.style.left = '-9999px';
    b.style.top = '0';
    document.body.appendChild(b);
    const cs = getComputedStyle(b);
    const out = { opacity: cs.opacity, cursor: cs.cursor };
    b.remove();
    return out;
  });
  expect(parseFloat(disabled.opacity)).toBeCloseTo(0.4, 1);
  expect(disabled.cursor).toBe('not-allowed');
});

// DC-072 / DC-088 / BVC-017 — touch targets ≥44px en mobile (hamburguesa, campana, icon-buttons).
//
// REACTIVADO tras fix (parcial) de BUG-V05 (a11y). El Developer SÍ subió a ≥44px: burger/bell/avatar
// (.header__avatar-btn 44×44), "Editar paciente" (icon-btn 44×44), view-toggles, paginación, items
// del sidebar, botones primarios, tabs de la ficha (52px) y piezas .tooth del odontograma (53px).
// Gate ACTIVO porque debe quedar verde cuando V05 esté 100%. HOY sigue ROJO (live, /pacientes,
// Pixel 5 375px) por DOS controles residuales <44px → BUG-V05 RESIDUAL para Developer:
//   1) input.search-pill__input "Buscar pacientes" → 23px (el .search-pill wrapper sí mide 44px,
//      pero el <input> interno no se estira: height:23px, min-height:0, align-self:stretch sin que
//      el flex padre lo estire). El control de teclado/táctil real es 23px de alto.
//   2) a.skip-link "Saltar al contenido" → 42px (line-height 25.6 + padding 8/8; faltan ~2px).
// Reactivar verde cuando ambos lleguen a ≥44px. Ver output/iterations/visual-build/visual-v05-cierre.md.
test('DC-072/088 (BUG-V05): touch targets ≥44px en mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await gotoApp(page, '/pacientes');
  await page.getByRole('heading', { level: 1, name: 'Pacientes' }).waitFor();
  await page.waitForTimeout(500);
  const small = await page.evaluate(() => {
    const interactives = [...document.querySelectorAll('button, a[href], input')].filter((e) => (e as HTMLElement).offsetParent !== null);
    return interactives
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.height > 0 && r.width > 0 && r.height < 44;
      })
      .map((e) => ({ t: (e.textContent || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 24), h: Math.round(e.getBoundingClientRect().height) }));
  });
  expect(small, 'controles bajo 44px en mobile').toEqual([]);
});

// DC-073 (BUG-V04, a11y) — cada role="tab" expone aria-selected (true/false).
// Verificado en producción: 6 tabs, exactamente 1 con aria-selected="true", resto "false".
test('DC-073 (BUG-V04): los tabs de la ficha exponen aria-selected', async ({ page }) => {
  await gotoApp(page, `/pacientes/${PID}/informacion`);
  await page.waitForTimeout(500);
  const states = await page.evaluate(() =>
    [...document.querySelectorAll('[role="tab"]')].map((t) => t.getAttribute('aria-selected')),
  );
  // exactamente un tab seleccionado, y ninguno con aria-selected nulo
  expect(states.every((s) => s === 'true' || s === 'false')).toBe(true);
  expect(states.filter((s) => s === 'true').length).toBe(1);
});
