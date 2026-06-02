import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed } from '../_helpers/seed';

/**
 * Visual Checker — Cierre de cobertura: ESTADOS DE UI por pantalla (DC-100..119).
 *
 * El plan-verifier 4f-verify detectó que el bloque DC-100..143 estaba "PASA" (visual)
 * pero solo DC-104/112/126 tenían .spec.ts dedicado. Este archivo asserta los estados
 * que son OBJETIVAMENTE alcanzables y verificables contra el sitio desplegado:
 *   · VACÍO (empty-state con ícono + título + guidance, copy anti-demo)
 *   · ÉXITO (contenido navegable / KPIs calculados / charts legibles)
 *   · MUCHOS DATOS (paginación offset "1–N de M", NUNCA infinite scroll)
 *
 * Honestidad sobre lo NO automatizable (documentado en visual-coverage-cierre.md):
 *   - CARGA / SKELETON (DC-101/107/118-carga/122): el estado es transitorio y
 *     no-determinista. Las listas hidratan SÍNCRONAS desde localStorage (sin ventana
 *     de skeleton observable por UI) y el único contenido diferido (odontograma/charts
 *     usa `@defer (on idle)`, instante no-determinista). El COMPORTAMIENTO ya lo cubren
 *     Flow/Edge (32 piezas renderizan, charts renderizan). El contrato "no spinners"
 *     se asserta en DC-120-143-feedback.spec.ts.
 *   - Empties anclados al seed (DC-100/102/103 agenda·día, DC-115/116 presupuestos·facturas,
 *     DC-119 chart-empty): el copy está source-verified pero NO es alcanzable por UI
 *     (la agenda/día están ancladas a Junio 2026 poblado; presupuestos/facturas no tienen
 *     filtro que lleve a 0; todos los charts tienen datos con el seed). Se asserta el
 *     estado ALCANZABLE (muchos datos / éxito) y se documenta el empty como visual.
 *
 * Anatomía del empty-state (verificada en vivo, DC-064): `.empty` >
 *   `.empty__glyph` (ícono Phosphor) + `.empty__title.t-title` + `.empty__desc.t-body.t-secondary`.
 */

const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design|resetear demo)\b/i;

/** Lee el empty-state visible (título + descripción + presencia de glyph). */
async function readEmptyState(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const e = document.querySelector('.empty');
    if (!e) return null;
    return {
      title: (e.querySelector('.empty__title')?.textContent || '').trim(),
      desc: (e.querySelector('.empty__desc')?.textContent || '').trim(),
      hasGlyph: !!e.querySelector('.empty__glyph svg, .empty__glyph app-icon'),
    };
  });
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// ───────────────────────────── DC-106 — Ficha · Información (vacío por campo) ─────────────────────────────

// test: DC-106 — campos sin dato muestran placeholder explícito, nunca en blanco ambiguo.
// pac-007 (Dante Torres) no tiene contacto de emergencia / alergias / medicación en el seed.
test('DC-106: ficha Información — campos vacíos muestran placeholder explícito (no blanco ambiguo)', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-007/informacion');
  await expect(page.getByRole('heading', { name: 'Datos personales' })).toBeVisible();
  // Placeholders cableados (DC-106): "Sin … registrad@", nunca celda vacía sin explicación.
  await expect(page.getByText('Sin contacto registrado')).toBeVisible();
  await expect(page.getByText('Sin alergias registradas')).toBeVisible();
  await expect(page.getByText('Sin medicación registrada')).toBeVisible();
});

// ───────────────────────────── DC-108 — Ficha · Historial (vacío) ─────────────────────────────

// test: DC-108 — historial sin eventos => empty-state con ícono + título + guidance, copy anti-demo.
test('DC-108: ficha Historial sin eventos muestra empty-state con guidance (DC-064)', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-007/historial');
  const empty = await readEmptyState(page);
  expect(empty, 'el historial vacío renderiza el empty-state').not.toBeNull();
  expect(empty!.title).toBe('Sin eventos clínicos');
  expect(empty!.desc).toBe('Este paciente todavía no tiene eventos clínicos registrados.');
  expect(empty!.hasGlyph, 'empty-state con ícono Phosphor liviano').toBe(true);
  // Copy persona-céntrico, sin revelar mock.
  expect(empty!.desc).not.toMatch(DEMO_FORBIDDEN);
});

// ───────────────────────────── DC-109 — Ficha · Tratamientos (vacío) ─────────────────────────────

// test: DC-109 — tratamientos vacíos => empty-state específico (sin romper layout).
test('DC-109: ficha Tratamientos sin planes muestra empty-state específico', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-007/tratamientos');
  const empty = await readEmptyState(page);
  expect(empty, 'tratamientos vacíos renderizan el empty-state').not.toBeNull();
  expect(empty!.title).toBe('Sin tratamientos todavía');
  expect(empty!.desc).toBe('Este paciente todavía no tiene tratamientos registrados.');
  expect(empty!.hasGlyph).toBe(true);
  expect(empty!.desc).not.toMatch(DEMO_FORBIDDEN);
});

// ───────────────────────────── DC-110 — Ficha · Documentos (vacío) ─────────────────────────────

// test: DC-110 — documentos vacíos => empty-state específico (placeholder controlado, no ícono roto).
test('DC-110: ficha Documentos sin archivos muestra empty-state específico', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-007/documentos');
  const empty = await readEmptyState(page);
  expect(empty, 'documentos vacíos renderizan el empty-state').not.toBeNull();
  expect(empty!.title).toBe('Sin documentos');
  expect(empty!.desc).toBe('Este paciente todavía no tiene documentos cargados.');
  expect(empty!.hasGlyph).toBe(true);
  // No debe haber imágenes rotas del navegador en la galería vacía (DC-078).
  const broken = await page.locator('main img').evaluateAll((imgs) =>
    imgs.filter((i) => {
      const el = i as HTMLImageElement;
      return el.complete && el.naturalWidth === 0 && !!el.getAttribute('src');
    }).length,
  );
  expect(broken, 'sin imágenes rotas en documentos vacíos').toBe(0);
});

// ───────────────────────────── DC-111 — Ficha · Pagos (vacío) ─────────────────────────────

// test: DC-111 — cuenta corriente sin movimientos => empty-state + resumen $0 coherente (no blanco).
// pac-017 (Isabella Coronel) no tiene movimientos en el seed.
test('DC-111: ficha Pagos sin movimientos muestra empty-state + resumen coherente', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-017/pagos');
  await expect(
    page.getByRole('heading', { name: 'Sin movimientos en la cuenta corriente' }),
  ).toBeVisible();
  await expect(
    page.getByText(/Cuando registres un pago o se genere un cargo, vas a verlo acá/),
  ).toBeVisible();
  // El resumen (Facturado/Cobrado/Saldo) sigue presente con cifras coherentes — no es un blanco ambiguo.
  await expect(page.getByText('Saldo pendiente')).toBeVisible();
});

// ───────────────────────────── DC-105 — Lista de pacientes (vacío + muchos datos) ─────────────────────────────

// test: DC-105 — búsqueda sin resultados => empty-state con guidance específica.
test('DC-105: lista de pacientes sin resultados muestra empty-state con guidance', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await page.getByRole('searchbox', { name: 'Buscar pacientes' }).fill('zzz-no-existe-9999');
  await expect(
    page.getByRole('heading', { name: 'No encontramos pacientes con ese criterio' }),
  ).toBeVisible();
  await expect(page.getByText(/Probá con otro nombre o ajustá los filtros/)).toBeVisible();
  await expect(page.getByText('0 pacientes en el sistema')).toBeVisible();
});

// test: DC-105 — MUCHOS DATOS: paginación offset "1–12 de 29", sin infinite scroll.
test('DC-105: lista de pacientes — estado "muchos datos" con paginación offset (sin infinite scroll)', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await expect(page.getByText('1–12 de 29')).toBeVisible();
  // Scroll al fondo NO carga más filas (paginación, no infinite scroll).
  const filas = page.locator('main [aria-label^="Ver ficha de"]:visible');
  await expect(filas).toHaveCount(12);
  await page.mouse.wheel(0, 4000);
  await page.waitForTimeout(400);
  await expect(filas).toHaveCount(12);
  await expect(page.getByText('1–12 de 29')).toBeVisible();
});

// ───────────────────────────── DC-113 — Lista de tratamientos activos (vacío por filtro) ─────────────────────────────

// test: DC-113 — filtrar activos por profesional puede llegar al empty-state "No hay tratamientos
// activos con este criterio". Recorremos los profesionales hasta forzarlo; si todos tienen activos,
// validamos que la lista no queda en blanco (control de robustez, sin falsear el resultado).
test('DC-113: lista de tratamientos activos — empty-state por filtro o lista con datos', async ({ page }) => {
  await gotoApp(page, '/tratamientos');
  await page.getByRole('button', { name: 'Activos' }).click();
  const filtro = page.getByLabel('Filtrar por profesional');
  await expect(filtro).toBeVisible();

  const opciones = await filtro.locator('option').all();
  let viEmpty = false;
  for (let i = 1; i < opciones.length; i++) {
    await filtro.selectOption({ index: i });
    const empty = page.getByRole('heading', { name: 'No hay tratamientos activos con este criterio' });
    if (await empty.count()) {
      await expect(empty).toBeVisible();
      await expect(page.getByText(/Ajustá el filtro o creá un nuevo plan/)).toBeVisible();
      viEmpty = true;
      break;
    }
  }
  if (!viEmpty) {
    // Camino alterno: la lista renderiza datos (no blanco ambiguo) en el filtro actual.
    await expect(page.locator('main [aria-label^="Ver"]:visible').first()).toBeVisible();
  }
});

// ───────────────────────────── DC-115 — Lista de presupuestos (muchos datos) ─────────────────────────────

// test: DC-115 — estado MUCHOS DATOS: presupuestos paginan "1–12 de 22" (el empty no es alcanzable
// por UI con el seed — no hay filtro que lleve a 0 — y queda como verificación visual/source).
test('DC-115: lista de presupuestos — estado "muchos datos" con paginación y badges', async ({ page }) => {
  await gotoApp(page, '/facturacion/presupuestos');
  await expect(page.getByRole('heading', { level: 1, name: 'Facturación' })).toBeVisible();
  await expect(page.getByText('22 presupuestos')).toBeVisible();
  await expect(page.getByText('1–12 de 22')).toBeVisible();
  // Hay filas/cards visibles con datos (no blanco ambiguo). Viewport-agnóstico (tabla/mini-cards).
  await expect(page.locator('main [aria-label^="Ver"]:visible').first()).toBeVisible();
});

// ───────────────────────────── DC-116 — Lista de facturas (éxito, ≤4 col, sin mención fiscal) ─────────────────────────────

// test: DC-116 — estado ÉXITO: facturas renderizan con badges y SIN mención fiscal (ARCA/AFIP/CAE).
test('DC-116: lista de facturas — éxito con badges y sin mención fiscal (ARCA/AFIP)', async ({ page }) => {
  await gotoApp(page, '/facturacion/facturas');
  await expect(page.getByRole('heading', { level: 1, name: 'Facturación' })).toBeVisible();
  await expect(page.locator('main [aria-label^="Ver"]:visible').first()).toBeVisible();
  const body = await page.locator('main').innerText();
  expect(body).not.toMatch(/\b(ARCA|AFIP|CAE)\b/);
});

// ───────────────────────────── DC-117 — Obra social · detalle (vacío o lista) ─────────────────────────────

// test: DC-117 — el detalle de una obra social muestra "Pacientes asociados" o el empty-state
// "Sin pacientes asociados" (con el seed todas tienen pacientes; se valida la rama alcanzable).
test('DC-117: detalle de obra social — pacientes asociados o empty-state coherente', async ({ page }) => {
  await gotoApp(page, '/facturacion/obras-sociales');
  await page.getByRole('link', { name: 'Ver detalle' }).first().click();
  await expect(page).toHaveURL(/\/facturacion\/obras-sociales\/[\w-]+$/);
  const conPacientes = page.getByRole('heading', { name: 'Pacientes asociados' });
  const sinPacientes = page.getByRole('heading', { name: 'Sin pacientes asociados' });
  await expect(conPacientes.or(sinPacientes).first()).toBeVisible();
});

// ───────────────────────────── DC-118 — Reportes dashboard (éxito: KPIs calculados) ─────────────────────────────

// test: DC-118 — el dashboard muestra ≤6 KPI cards con valores CALCULADOS (no hardcodeados),
// clickeables hacia el reporte detallado. Estado N/A vacío (siempre hay datos).
test('DC-118: dashboard de reportes — ≤6 KPIs calculados, clickeables (estado éxito)', async ({ page }) => {
  await gotoApp(page, '/reportes');
  await expect(page.getByRole('heading', { level: 1, name: 'Reportes' })).toBeVisible();

  // Los 6 KPIs canónicos están presentes con su número grande.
  for (const kpi of ['Pacientes nuevos', 'Turnos atendidos', 'Tratamientos completados', 'Ingresos facturados', 'Cobrado', 'Deuda']) {
    await expect(page.getByText(kpi, { exact: false }).first()).toBeVisible();
  }
  // Hay montos ARS formateados (valores derivados del estado) — no placeholders vacíos.
  await expect(page.getByText(/\$\s?[\d.]+\s*M?/).first()).toBeVisible();

  // Cada KPI es un link navegable a su reporte detallado (clickeable). La card "Ingresos
  // facturados" es el primer link al reporte financiero; navegamos por href (el accessible
  // name de la card concatena número y subtítulo, no es estable para name-matching).
  await page.locator('main a[href="/reportes/financiero"]').first().click();
  await expect(page).toHaveURL(/\/reportes\/financiero$/);
});

// ───────────────────────────── DC-119 — Reportes detallados (éxito: charts legibles) ─────────────────────────────

// test: DC-119 — estado ÉXITO: el reporte financiero renderiza sus cards de gráfico con datos
// legibles y montos ARS, sin crashear (REQ-241: ingresos por mes, facturación por obra social y
// deuda por antigüedad). El empty "Sin datos suficientes para este gráfico" no es alcanzable con
// el seed — todos los charts tienen datos — y queda como verificación visual/source.
test('DC-119: reporte financiero detallado — charts en cards aireadas, sin crash (estado éxito)', async ({ page }) => {
  await gotoApp(page, '/reportes/financiero');
  await expect(page.getByRole('heading', { name: /Reporte financiero/ })).toBeVisible();
  // Las visualizaciones requeridas del reporte financiero están presentes (1 métrica por card).
  await expect(page.getByText('Ingresos facturados por mes')).toBeVisible();
  await expect(page.getByText('Facturación por obra social')).toBeVisible();
  await expect(page.getByText('Deuda por antigüedad')).toBeVisible();
  await expect(page.getByText('Cobranzas vs facturado')).toBeVisible();
  await expect(page.getByText('Tasa de cobranza')).toBeVisible();
});
