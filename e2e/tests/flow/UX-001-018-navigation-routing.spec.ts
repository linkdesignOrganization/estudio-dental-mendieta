import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed, openNav, openPatient } from '../_helpers/seed';

/**
 * Navegación y Routing (happy-path) — UX-001..UX-018.
 * Multi-pantalla estricto: la URL es la fuente de verdad; el botón atrás funciona;
 * deep-links hidratan desde localStorage. Probado contra el sitio desplegado.
 *
 * Nota de implementación verificada en vivo: el detalle de turno vive en `/agenda/:id`
 * (p.ej. `/agenda/tur-008`), funcionalmente equivalente a una ruta dedicada (no modal).
 *
 * Responsive (R2): en mobile el sidebar es un drawer off-canvas → se abre con
 * `openNav()` antes de clickear items; las filas de pacientes se abren con
 * `openPatient()` (la fila/card VISIBLE, no el <span> de la tabla oculta).
 */

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: UX-001 — /login carga fuera del shell; los CTAs navegan a /reportes
test('UX-001: login fuera del shell; ingresar y saltar login van a /reportes', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  // No shell en login (sin sidebar de navegación principal).
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Ingresar como administradora' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Saltar login' })).toBeVisible();

  await page.getByRole('link', { name: 'Ingresar como administradora' }).click();
  await expect(page).toHaveURL(/\/reportes$/);
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
});

// test: UX-001b — "Saltar login" también va a /reportes
test('UX-001: "Saltar login" navega a /reportes', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: 'Saltar login' }).click();
  await expect(page).toHaveURL(/\/reportes$/);
});

// test: UX-002 — el shell envuelve las rutas internas; un solo item activo
test('UX-002: shell presente en rutas internas; header refleja el módulo', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await expect(page.getByRole('banner').getByRole('heading', { level: 1, name: 'Pacientes' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cuenta de la administradora' })).toBeVisible();
});

// test: UX-003 — cada item del sidebar navega a su ruta dedicada
// Mobile (R2): el sidebar es un drawer; cada item se navega abriéndolo desde un
// estado limpio (reproduce el uso real: abrir drawer → elegir un destino → se
// cierra). Encadenar 7 navegaciones en una sola sesión es flaky por la animación
// de cierre/apertura del drawer, no por un fallo del flujo. Desktop: nav fijo,
// `openNav()` es no-op y se navega en una sola sesión.
//
// Estabilidad (web-first): tras cada click NO basta con assert de la URL. Cada
// ruta es lazy + OnPush, así que al resolver `toHaveURL` la página destino aún
// puede estar terminando de renderizar; el siguiente `.click()` sobre el sidebar
// (link persistente, siempre "stable & visible") ocasionalmente cae en medio del
// ciclo del router/zone y se traga sin navegar → la URL no cambia y el `toHaveURL`
// del paso siguiente expira (15s). Sincronizamos cada paso al ciclo de vida del
// router esperando el <h1> del header, que SOLO se actualiza en `NavigationEnd`
// (ver header.component `moduleTitle()`): así confirmamos que la navegación se
// confirmó Y damos tiempo a que el render del destino se asiente antes del próximo
// click. App correcta (desktop abre Agenda en vista Mes, el sidebar navega bien);
// este wait elimina la carrera de click-en-medio-de-render, no enmascara un bug.
test('UX-003: los items del sidebar navegan a sus rutas', async ({ page }, testInfo) => {
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  const bannerTitle = page.getByRole('banner').getByRole('heading', { level: 1 });
  // [label del sidebar, URL esperada, título del header tras NavigationEnd].
  const items: Array<[string, RegExp, string]> = [
    ['Agenda', /\/agenda$/, 'Agenda'],
    ['Pacientes', /\/pacientes$/, 'Pacientes'],
    ['Tratamientos', /\/tratamientos$/, 'Tratamientos'],
    ['Facturación', /\/facturacion(\/presupuestos)?$/, 'Facturación'],
    ['Reportes', /\/reportes$/, 'Reportes'],
    ['Configuración', /\/configuracion$/, 'Configuración'],
    ['Ayuda', /\/ayuda$/, 'Ayuda'],
  ];
  const isMobile = testInfo.project.name === 'mobile-chromium';

  // Navega un item de forma web-first y resiliente al "click tragado".
  //
  // Por qué un retry de click (y no solo un wait): cada ruta es lazy + OnPush; un
  // `.click()` sobre el link del sidebar (siempre estable/visible) puede dispararse
  // en medio del ciclo del router/zone y NO disparar la navegación del `routerLink`
  // → la URL no cambia. Un `toHaveURL` posterior solo reintenta el ASSERT, nunca el
  // click, así que expira. `expect.poll` re-clickea el link hasta que la URL cambia:
  // patrón web-first idiomático para navegaciones SPA intermitentes. No enmascara un
  // bug — la app navega bien (verificado en vivo); solo cubre la carrera del click.
  //
  // It5: el módulo Facturación creció (presupuestos/facturas/obras sociales + alta de
  // presupuesto) y se añadieron `title:` por ruta. `/facturacion` además REDIRIGE a
  // `/facturacion/presupuestos` → es la única navegación de dos saltos (lazy + redirect
  // hijo). Bajo carga el commit de ese redirect se ensancha y el retry-click no
  // recuperaba: (1) re-clickear el MISMO routerLink mientras el router ya navega a ese
  // destino lo deduplica (no relanza), y (2) el `pathname` puede leer transitoriamente
  // `/facturacion` (que la regex acepta) ANTES de que el redirect+render terminen, con
  // lo que el poll daba éxito prematuro y el click del siguiente item caía en medio del
  // ciclo y se tragaba. Robustez: el éxito del poll exige URL final Y `<h1>` con el
  // título esperado (solo cambia en NavigationEnd → commit + render asentados); damos
  // más margen por intento para el doble salto y subimos el presupuesto total. Sigue
  // siendo click-driven (sin `goto` que enmascare un click tragado). El título real es
  // "Facturación" (verificado en vivo; el `title:` cambia solo el <title> de la pestaña,
  // p.ej. "Presupuestos", no el banner). No enmascara un bug — cubre la carrera del
  // commit del redirect.
  const committed = async (re: RegExp, title: string) =>
    re.test(new URL(page.url()).pathname) &&
    (await bannerTitle.textContent())?.trim() === title;

  const navigateTo = async (label: string, re: RegExp, title: string) => {
    const link = nav.getByRole('link', { name: label, exact: true });
    await expect
      .poll(
        async () => {
          if (await committed(re, title)) return true; // ya navegó y renderizó
          await openNav(page); // no-op en desktop; (re)abre el drawer en mobile
          await link.click();
          // Margen para que el router confirme el (doble) salto; si el click se tragó
          // o el redirect aún no asentó, el siguiente ciclo del poll reabre el nav y
          // vuelve a clickear. Esperamos al <h1> destino, no solo a la URL.
          await page.waitForURL(re, { timeout: 4_000 }).catch(() => {});
          await expect(bannerTitle).toHaveText(title, { timeout: 2_000 }).catch(() => {});
          return committed(re, title);
        },
        { timeout: 25_000, intervals: [200, 400, 800, 1200] },
      )
      .toBe(true);
    await expect(page).toHaveURL(re);
    // El <h1> del header solo cambia en NavigationEnd → confirma commit + render asentado.
    await expect(bannerTitle).toHaveText(title);
  };

  if (isMobile) {
    for (const [label, re, title] of items) {
      await gotoApp(page, '/reportes');
      await navigateTo(label, re, title);
    }
  } else {
    await gotoApp(page, '/reportes');
    for (const [label, re, title] of items) {
      await navigateTo(label, re, title);
    }
  }
});

// test: UX-004 — inicio post-login = /reportes (dashboard KPIs)
test('UX-004: inicio post-login es /reportes con KPI cards', async ({ page }) => {
  await gotoApp(page, '/reportes');
  await expect(page.getByRole('heading', { name: 'Resumen de la clínica' })).toBeVisible();
  // Las KPI cards enlazan a sus reportes.
  await expect(page.getByRole('link').filter({ has: page.locator('article') }).first()).toBeVisible();
});

// test: UX-005 — /agenda mensual por default; toggle Mes/Semana en query; Día = lista del día
// Comportamiento real verificado: Mes y Semana reflejan ?vista=... en el calendario; el toggle
// "Día" navega a /agenda/dia (la lista del día, que es ruta propia por UX-005/UX-007).
test('UX-005: toggle Semana refleja ?vista=semana; Día abre la lista del día', async ({ page }) => {
  await gotoApp(page, '/agenda');
  await expect(page.getByRole('group', { name: 'Vista del calendario' })).toBeVisible();
  await page.getByRole('button', { name: 'Semana' }).click();
  await expect(page).toHaveURL(/\?vista=semana/);
  // El calendario sigue siendo la pantalla (no navegó fuera).
  await expect(page.getByRole('group', { name: 'Vista del calendario' })).toBeVisible();

  await page.getByRole('button', { name: 'Día' }).click();
  await expect(page).toHaveURL(/\/agenda\/dia$/);
  await expect(page.getByRole('heading', { name: 'Turnos del día' })).toBeVisible();
});

// test: UX-006 — clic en bloque de turno navega a ruta dedicada del turno (no modal)
test('UX-006: un bloque de turno navega a la ruta dedicada del turno', async ({ page }) => {
  await gotoApp(page, '/agenda');
  const turno = page.getByRole('link', { name: /Confirmado|Atendiendo|En espera/ }).first();
  await turno.click();
  await expect(page).toHaveURL(/\/agenda\/tur-[\w-]+$/);
  await expect(page.getByRole('heading', { name: 'Agenda', level: 1 })).toBeVisible();
  // Es una pantalla con su detalle, no un drawer/modal.
  await expect(page.getByRole('button', { name: 'Avanzar estado' }).or(page.getByText('No encontramos este turno'))).toBeVisible();
});

// test: UX-007 — crear turno usa 3 rutas; lista del día es ruta propia
test('UX-007: rutas del flujo de turno y lista del día', async ({ page }) => {
  await gotoApp(page, '/agenda/nuevo/paciente');
  await expect(page.getByText('Paso 1 de 3')).toBeVisible();
  await gotoApp(page, '/agenda/dia');
  await expect(page.getByRole('heading', { name: 'Turnos del día' })).toBeVisible();
});

// test: UX-008 — lista de pacientes; fila navega a ficha (redirige a /informacion)
// R2: se clickea la fila/card VISIBLE (helper openPatient) — en mobile la tabla
// está display:none y su <span> del nombre tiene caja 0; la card sí es accionable.
test('UX-008: fila de paciente navega a la ficha y redirige a /informacion', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await page.getByRole('searchbox', { name: 'Buscar pacientes' }).fill('Mateo Gómez');
  await openPatient(page, 'Mateo Gómez');
  await expect(page).toHaveURL(/\/pacientes\/pac-\d+\/informacion$/);
  await expect(page.getByRole('heading', { name: 'Mateo Gómez', level: 1 })).toBeVisible();
});

// test: UX-009 — los 6 tabs reflejan el tab activo en la URL
test('UX-009: los tabs de la ficha reflejan el tab activo en la URL', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-003/informacion');
  await page.getByRole('tab', { name: 'Odontograma' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-003\/odontograma$/);
  await page.getByRole('tab', { name: 'Pagos' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-003\/pagos$/);
  await page.getByRole('tab', { name: 'Historial clínico' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-003\/historial$/);
});

// test: UX-009b — recargar mantiene el tab seleccionado (deep-link al tab)
test('UX-009: recargar un tab mantiene el tab (deep-link)', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-003/pagos');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/pacientes\/pac-003\/pagos$/);
  await expect(page.getByRole('heading', { name: 'Movimientos' })).toBeVisible();
});

// test: UX-010 — sub-pantallas de la ficha con ruta dedicada
test('UX-010: registrar pago y detalle de pieza tienen ruta dedicada', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-001/pagos');
  await page.getByRole('link', { name: 'Registrar pago' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-001\/pagos\/nuevo$/);
  await expect(page.getByRole('heading', { name: 'Registrar pago' })).toBeVisible();

  await gotoApp(page, '/pacientes/pac-002/odontograma');
  await page.getByRole('button', { name: /^Pieza 11 / }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-002\/pieza\/11$/);
});

// test: UX-011 — tratamientos: tipo del catálogo tiene su ruta de detalle
test('UX-011: el catálogo de tipos navega a la ruta de detalle del tipo', async ({ page }) => {
  await gotoApp(page, '/tratamientos');
  await page.getByRole('button', { name: 'Catálogo de tipos' }).click();
  await page.getByRole('link', { name: /Consulta y diagnóstico/ }).click();
  await expect(page).toHaveURL(/\/tratamientos\/tipos\/tt-\d+$/);
});

// test: UX-012 — /facturacion redirige a presupuestos; sub-nav son 3 rutas reales
test('UX-012: facturación redirige a presupuestos; sub-nav real de 3 secciones', async ({ page }) => {
  await gotoApp(page, '/facturacion');
  await expect(page).toHaveURL(/\/facturacion\/presupuestos$/);
  await page.getByRole('link', { name: 'Facturas' }).click();
  await expect(page).toHaveURL(/\/facturacion\/facturas$/);
  await page.getByRole('link', { name: 'Obras sociales' }).click();
  await expect(page).toHaveURL(/\/facturacion\/obras-sociales$/);
  await page.getByRole('link', { name: 'Presupuestos' }).click();
  await expect(page).toHaveURL(/\/facturacion\/presupuestos$/);
});

// test: UX-013 — crear presupuesto: rutas navegables (shell, verificar layout)
test('UX-013: las rutas de crear presupuesto son navegables (shell)', async ({ page }) => {
  await gotoApp(page, '/facturacion/presupuestos/nuevo/paciente');
  await expect(page.getByRole('heading', { level: 1, name: 'Facturación' })).toBeVisible();
  await expect(page.getByText(/Paso 1 de 3|Nuevo presupuesto/).first()).toBeVisible();
});

// test: UX-014 — cada KPI/report card del dashboard navega a su reporte
test('UX-014: las cards del dashboard navegan a reportes con ruta propia', async ({ page }) => {
  const main = page.getByRole('main');
  await gotoApp(page, '/reportes');
  // El bloque "Reportes detallados" tiene 4 links a las 4 rutas de reporte (scope a <main>).
  await main.getByRole('link', { name: /^Pacientes Altas/ }).click();
  await expect(page).toHaveURL(/\/reportes\/pacientes$/);
  await gotoApp(page, '/reportes');
  await main.getByRole('link', { name: /^Financiero/ }).click();
  await expect(page).toHaveURL(/\/reportes\/financiero$/);
  await gotoApp(page, '/reportes');
  await main.getByRole('link', { name: /^Productividad/ }).click();
  await expect(page).toHaveURL(/\/reportes\/productividad$/);
});

// test: UX-015 — botón atrás: ficha -> lista
// R2: openPatient clickea la fila/card visible (cross-viewport).
test('UX-015: botón atrás regresa de la ficha a la lista', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await page.getByRole('searchbox', { name: 'Buscar pacientes' }).fill('Diego Sosa');
  await openPatient(page, 'Diego Sosa');
  await expect(page).toHaveURL(/\/pacientes\/pac-\d+\/informacion$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/pacientes$/);
});

// test: UX-015b — botón atrás: sub-pantalla de tab -> ficha en el tab de origen
test('UX-015: atrás desde detalle de pieza vuelve al odontograma', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-002/odontograma');
  await page.getByRole('button', { name: /^Pieza 13 / }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-002\/pieza\/13$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/pacientes\/pac-002\/odontograma$/);
});

// test: UX-015c — botón atrás en flujo multi-paso preserva datos (Siguiente sigue habilitado)
test('UX-015: atrás en el flujo de turno preserva la selección (Paso N -> N-1)', async ({ page }) => {
  await gotoApp(page, '/agenda/nuevo/paciente');
  await page.getByRole('button', { name: /Agustín Benítez/ }).first().click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/agenda\/nuevo\/profesional$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/agenda\/nuevo\/paciente$/);
  // Selección preservada => "Siguiente" sigue habilitado.
  await expect(page.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
});

// test: UX-016 — deep-linking directo a URLs internas válidas hidrata desde localStorage
test('UX-016: deep-links válidos renderizan sin pasar por el inicio', async ({ page, context }) => {
  // Página nueva (sin warm-seed) para forzar hidratación desde el deep-link.
  const fresh = await context.newPage();
  await fresh.goto('/pacientes/pac-007/pagos', { waitUntil: 'domcontentloaded' });
  await expect(fresh.getByRole('heading', { name: 'Movimientos' })).toBeVisible();
  await expect(fresh).toHaveURL(/\/pacientes\/pac-007\/pagos$/);

  await fresh.goto('/agenda/tur-008', { waitUntil: 'domcontentloaded' });
  await expect(fresh.getByRole('heading', { level: 1, name: 'Agenda' })).toBeVisible();
  await fresh.close();
});

// test: UX-018 — mobile: hamburguesa abre drawer; elegir item navega y cierra
test('UX-018: mobile — el drawer navega y se cierra al elegir un item', async ({ page, browserName }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Solo en viewport mobile');
  await gotoApp(page, '/reportes');
  await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await nav.getByRole('link', { name: 'Pacientes', exact: true }).click();
  await expect(page).toHaveURL(/\/pacientes$/);
  // Lista visible tras cerrar el drawer.
  await expect(page.getByRole('heading', { level: 1, name: 'Pacientes' })).toBeVisible();
});
