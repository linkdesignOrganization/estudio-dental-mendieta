import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed, readState } from '../_helpers/seed';

/**
 * Edge — Detalle de turno en estado TERMINAL (UX-049 / DC-104) y agenda vacía (UX-044).
 * Estado terminal (terminado/cancelado) => acción primaria de avance DESHABILITADA
 * (opacidad 0.4, cursor not-allowed por CSS .btn[disabled]). El turno terminal se
 * localiza dinámicamente desde el estado (seed determinista), no por id hardcodeado.
 *
 * Verificado en código (appointment-detail.component.ts): isTerminal() deshabilita
 * "Avanzar estado" y "Cancelar turno".
 */

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: UX-049 / DC-104 — un turno terminal deshabilita "Avanzar estado"
test('UX-049: turno terminal (terminado/cancelado) deshabilita "Avanzar estado"', async ({ page }) => {
  const state = await readState(page);
  const terminal = (state.appointments as Array<{ id: string; estado: string }>).find((a) =>
    ['terminado', 'cancelado'].includes(a.estado),
  );
  expect(terminal, 'el seed debe incluir al menos un turno terminal').toBeTruthy();

  await gotoApp(page, `/agenda/${terminal!.id}`);
  // La acción primaria de avance está deshabilitada.
  await expect(page.getByRole('button', { name: 'Avanzar estado' })).toBeDisabled();
  // La acción destructiva (Cancelar turno) también queda deshabilitada en estado terminal.
  await expect(page.getByRole('button', { name: 'Cancelar turno' })).toBeDisabled();
});

// test: UX-049 — el botón terminal NO es activable (guard de comportamiento).
// HALLAZGO (BUG-E02, verificado vía computed-style en vivo): el botón disabled
// renderiza con opacity:1 y cursor:default (apariencia nativa del UA, bg
// rgba(239,239,239,0.3)) en lugar del token --disabled-opacity:0.4 + not-allowed que
// define .btn-edm:disabled (theme.scss). Es un gap VISUAL (DC-019) — propiedad del
// Visual Checker. El guard funcional (disabled, no clickeable) SÍ se cumple, que es lo
// que valida esta capa edge. Disparamos el click y verificamos que el estado NO avanza.
test('UX-049: el botón terminal está deshabilitado y un click no avanza el estado', async ({ page }) => {
  const state = await readState(page);
  const terminal = (state.appointments as Array<{ id: string; estado: string }>).find((a) =>
    ['terminado', 'cancelado'].includes(a.estado),
  );
  test.skip(!terminal, 'no hay turno terminal en el seed');

  await gotoApp(page, `/agenda/${terminal!.id}`);
  const btn = page.getByRole('button', { name: 'Avanzar estado' });
  await expect(btn).toBeDisabled();

  // El badge del estado terminal está visible y no cambia al forzar el click.
  const labelTerminal = terminal!.estado === 'terminado' ? 'Terminado' : 'Cancelado';
  await expect(page.getByText(labelTerminal).first()).toBeVisible();
  await btn.click({ force: true }).catch(() => {}); // disabled => no-op
  await expect(page.getByText(labelTerminal).first()).toBeVisible();
});

// test: UX-049 — un turno NO terminal (confirmado) SÍ permite avanzar (control negativo)
test('UX-049: un turno confirmado tiene "Avanzar estado" habilitado (control negativo)', async ({ page }) => {
  const state = await readState(page);
  const activo = (state.appointments as Array<{ id: string; estado: string }>).find((a) =>
    ['confirmado', 'en-espera', 'atendiendo'].includes(a.estado),
  );
  test.skip(!activo, 'no hay turno activo en el seed');

  await gotoApp(page, `/agenda/${activo!.id}`);
  await expect(page.getByRole('button', { name: 'Avanzar estado' })).toBeEnabled();
});

// test: UX-044 — agenda/lista del día. La lista del día (/agenda/dia) y el calendario
// están ANCLADOS a "Junio 2026" (fecha fija del demo, sin date-picker ni month-nav), y
// el seed puebla ese período. Por eso el empty-state "No hay turnos para este día"
// (cableado en day-list.component.ts con guidance "Agendá uno con Nuevo turno…") es
// source-verified pero NO alcanzable por UI con el seed. Validamos el camino real: la
// lista del día renderiza con turnos, sin quedar en blanco, y ofrece "Nuevo turno".
test('UX-044: la lista del día renderiza turnos del seed con acción "Nuevo turno"', async ({ page }) => {
  await gotoApp(page, '/agenda/dia');
  await expect(page.getByRole('heading', { name: 'Turnos del día' })).toBeVisible();
  // Hay turnos del período poblado — no es un blanco ambiguo. Viewport-agnóstico:
  // desktop <tr>, mobile mini-cards, ambos con aria-label "Ver turno de …".
  await expect(page.locator('main [aria-label^="Ver turno de"]:visible').first()).toBeVisible();
  // La acción de creación está disponible como guidance hacia el flujo.
  await expect(page.getByRole('link', { name: 'Nuevo turno' })).toBeVisible();
});
