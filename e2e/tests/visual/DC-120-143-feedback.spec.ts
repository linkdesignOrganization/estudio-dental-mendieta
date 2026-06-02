import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed } from '../_helpers/seed';

/**
 * Visual Checker — Cierre de cobertura: PATRONES DE FEEDBACK VISUAL (DC-120..143)
 * + los BVC subjetivos que SÍ son objetivamente verificables (BVC-010/014/016/023/028).
 *
 * Lo que este archivo asserta de forma honesta contra el sitio desplegado:
 *   · DC-120 / DC-065 / BVC-016 — "NUNCA spinners": cero `.spinner*` en un recorrido de rutas.
 *   · DC-130 — toast de ÉXITO: `.toast[data-kind="success"]` `role="status"`, fondo blanco
 *     con borde IZQUIERDO semántico verde (#2d6a4f), ícono Phosphor, copy de producción,
 *     auto-dismiss (~3s) → desaparece solo.
 *   · DC-133 — panel de notificaciones (campana): `role="dialog"`, diferenciación leído/no-leído
 *     por item (`.np__dot` azul profundo #246991), tabs de filtro Todas/Sin leer, cada item navega
 *     a ruta real, y el contador del header == nº de no-leídas.
 *   · DC-141 — submit en `loading` SIN spinner (el resultado lo da el toast).
 *   · DC-142 — confirm-dialog (<50%, copy de producción) en una acción de descarte reversible.
 *   · BVC-010 — una sola acción primaria por pantalla.
 *   · BVC-014 — iconografía Phosphor con stroke EFECTIVO 1.5px (normalizado al viewBox 256).
 *   · BVC-016 — skeletons-no-spinners + toasts tras acción exitosa (combina las dos anteriores).
 *   · BVC-023 — NO hay drawers laterales como contenido PRINCIPAL.
 *   · BVC-028 — el aire comunica orden: padding de card 24-32px en una pantalla con poco contenido.
 *
 * Honestidad (documentado en visual-coverage-cierre.md): DC-131 (toast de ERROR `role="alert"`)
 * no es alcanzable por UI — la app es offline-first (estado en localStorage), no hay ruta que
 * dispare un error de runtime; queda como verificación visual/source. DC-143 (hover/motion) se
 * cubre por tokens en DC-001-029 + juicio visual. DC-101/107/122 (skeleton de carga) son
 * transitorios y no-deterministas (ver DC-100-119-ui-states.spec.ts).
 */

const PID = 'pac-001';

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// ───────────────────────────── DC-120 / DC-065 / BVC-016 — NUNCA spinners ─────────────────────────────

// test: DC-120/065 — recorrido de rutas con datos y diferidas: en ningún momento aparece un spinner
// (.spinner-border / .spinner-grow / [class*=spinner]). El loading se hace con skeletons/@defer.
test('DC-120/065 / BVC-016: cero spinners en el recorrido (loading vía skeleton/@defer, no spinner)', async ({ page }) => {
  const routes = [
    '/reportes',
    '/pacientes',
    '/agenda',
    '/tratamientos',
    '/facturacion/facturas',
    `/pacientes/${PID}/informacion`,
    `/pacientes/${PID}/odontograma`, // contenido diferido (@defer) — el peor caso para un spinner
  ];
  for (const route of routes) {
    await gotoApp(page, route);
    const spinners = await page.evaluate(() =>
      [...document.querySelectorAll('[class*="spinner" i], .spinner-border, .spinner-grow')]
        .filter((e) => (e as HTMLElement).offsetParent !== null)
        .map((e) => (typeof e.className === 'string' ? e.className : 'spinner')),
    );
    expect(spinners, `spinners visibles en ${route}`).toEqual([]);
  }
});

// ───────────────────────────── DC-130 — toast de éxito ─────────────────────────────

// test: DC-130 — registrar un pago dispara el toast de éxito: role="status", fondo blanco con borde
// semántico VERDE a la izquierda (#2d6a4f), ícono Phosphor y copy "Pago registrado.". El toast es
// transitorio (auto-dismiss ~3s): capturamos sus computed styles en el instante en que aparece y
// luego verificamos que se auto-cierra.
test('DC-130: toast de éxito — role=status, fondo blanco + borde semántico verde, copy de producción', async ({ page }) => {
  await gotoApp(page, `/pacientes/pac-003/pagos/nuevo`);
  await page.getByRole('spinbutton', { name: 'Monto (ARS)' }).fill('15000');
  await page.getByRole('button', { name: 'Confirmar pago' }).click();

  // El toast aparece (auto-retry de Playwright; el primer poll cae dentro de la ventana de ~3s).
  const toast = page.locator('.toast[data-kind="success"]');
  await expect(toast).toBeVisible();
  await expect(toast).toHaveAttribute('role', 'status');
  await expect(toast).toContainText('Pago registrado');

  // Computed styles del toast: fondo blanco + borde IZQUIERDO con el verde semántico #2d6a4f.
  const style = await toast.evaluate((el) => {
    const cs = getComputedStyle(el as HTMLElement);
    const rgb = (s: string) => (s.match(/\d+/g) || []).slice(0, 3).map(Number);
    return {
      bg: rgb(cs.backgroundColor),
      color: rgb(cs.color),
      borderLeft: rgb(cs.borderLeftColor),
      hasGlyph: !!(el as HTMLElement).querySelector('app-icon svg, .toast__glyph svg'),
    };
  });
  // Fondo blanco (DC-066: "fondo blanco con borde semántico").
  expect(style.bg[0] > 245 && style.bg[1] > 245 && style.bg[2] > 245, 'fondo del toast blanco').toBe(true);
  // Texto oscuro #2a2a35 (NO blanco sobre pastel).
  expect(style.color[0] < 80 && style.color[1] < 80 && style.color[2] < 80, 'texto oscuro').toBe(true);
  // Borde izquierdo = verde de éxito #2d6a4f = rgb(45,106,79).
  expect(
    Math.abs(style.borderLeft[0] - 45) < 14 && Math.abs(style.borderLeft[1] - 106) < 14 && Math.abs(style.borderLeft[2] - 79) < 14,
    `borde semántico verde (got ${style.borderLeft})`,
  ).toBe(true);
  expect(style.hasGlyph, 'toast con ícono Phosphor de estado').toBe(true);

  // Auto-dismiss: el toast de éxito desaparece solo (~3s).
  await expect(toast).toBeHidden({ timeout: 6000 });
});

// ───────────────────────────── DC-133 — panel de notificaciones ─────────────────────────────

// test: DC-133 — la campana abre un panel `role="dialog"` con tabs de filtro (Todas/Sin leer) y
// diferenciación leído/no-leído por item (dot azul profundo #246991). El contador del header iguala
// el nº de no-leídas, y cada notificación navega a una ruta real.
test('DC-133: panel de notificaciones — dialog, filtro Todas/Sin leer, dot no-leído #246991, contador coherente', async ({ page }) => {
  await gotoApp(page, '/reportes');

  // Contador en la campana del header.
  const bell = page.getByRole('button', { name: 'Notificaciones' });
  const headerCount = parseInt((await bell.innerText()).match(/\d+/)?.[0] || '0', 10);
  expect(headerCount).toBeGreaterThan(0);

  await bell.click();
  const dialog = page.getByRole('dialog', { name: 'Notificaciones' });
  await expect(dialog).toBeVisible();

  // Tabs de filtro pill (Todas / Sin leer), una seleccionada.
  await expect(dialog.getByRole('tab', { name: 'Todas' })).toBeVisible();
  await expect(dialog.getByRole('tab', { name: 'Sin leer' })).toBeVisible();

  // Diferenciación leído/no-leído por item: los items no-leídos llevan `.np__dot` azul profundo.
  // (No acoplamos a un nº de seed fijo: el estado leído/no-leído puede mutar entre corridas; asertamos
  //  INVARIANTES estructurales que siempre se cumplen.)
  const meta = await dialog.evaluate((d) => {
    const items = [...d.querySelectorAll('.np__item')];
    const unread = items.filter((i) => i.classList.contains('is-unread'));
    const dots = [...d.querySelectorAll('.np__dot')];
    const rgb = (s: string) => (s.match(/\d+/g) || []).slice(0, 3).map(Number);
    const dotColor = dots[0] ? rgb(getComputedStyle(dots[0] as HTMLElement).backgroundColor) : null;
    return { items: items.length, unread: unread.length, dots: dots.length, dotColor };
  });
  expect(meta.items).toBeGreaterThan(0);
  expect(meta.unread, 'hay items no-leídos diferenciados').toBeGreaterThan(0);
  // INVARIANTE 1: hay exactamente un dot por item no-leído (diferenciación visual leído/no-leído).
  expect(meta.dots, 'un dot por item no-leído').toBe(meta.unread);
  // INVARIANTE 2: el contador del header iguala el nº de no-leídas mostradas.
  expect(meta.unread, 'contador del header == no-leídas').toBe(headerCount);
  // El dot usa azul profundo #246991 = rgb(36,105,145).
  expect(meta.dotColor).not.toBeNull();
  expect(
    Math.abs(meta.dotColor![0] - 36) < 14 && Math.abs(meta.dotColor![1] - 105) < 14 && Math.abs(meta.dotColor![2] - 145) < 14,
    `dot azul profundo (got ${meta.dotColor})`,
  ).toBe(true);

  // El tab "Sin leer" filtra: tras el re-render, TODOS los items mostrados son no-leídos y el total
  // no aumenta. Usamos expect.poll para esperar a que el filtro se aplique (re-render asíncrono).
  await dialog.getByRole('tab', { name: 'Sin leer' }).click();
  await expect
    .poll(async () =>
      dialog.evaluate((d) => {
        const items = [...d.querySelectorAll('.np__item')];
        return { total: items.length, allUnread: items.every((i) => i.classList.contains('is-unread')) };
      }),
    )
    .toEqual({ total: meta.unread, allUnread: true });
});

// test: DC-133 — cada notificación navega a una ruta real (un turno).
test('DC-133: una notificación de turno navega a su ruta real', async ({ page }) => {
  await gotoApp(page, '/reportes');
  await page.getByRole('button', { name: 'Notificaciones' }).click();
  const dialog = page.getByRole('dialog', { name: 'Notificaciones' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /Turno por confirmar/ }).first().click();
  await expect(page).toHaveURL(/\/agenda\/tur-[\w-]+$/);
});

// ───────────────────────────── DC-141 — submit en loading SIN spinner ─────────────────────────────

// test: DC-141 — el botón de confirmación NO usa spinner; el feedback de submit es el toast.
// (Verificamos que, al disparar el submit, no aparece ningún spinner en el botón ni en la página.)
test('DC-141: el submit de "Confirmar pago" no muestra spinner (el feedback es el toast)', async ({ page }) => {
  await gotoApp(page, `/pacientes/pac-005/pagos/nuevo`);
  await page.getByRole('spinbutton', { name: 'Monto (ARS)' }).fill('8000');
  const confirmar = page.getByRole('button', { name: 'Confirmar pago' });
  await confirmar.click();
  // Justo tras el click, no debe existir un spinner en la UI (ni dentro del botón).
  const spinners = await page.evaluate(() =>
    [...document.querySelectorAll('[class*="spinner" i], .spinner-border, .spinner-grow')].filter(
      (e) => (e as HTMLElement).offsetParent !== null,
    ).length,
  );
  expect(spinners).toBe(0);
  // Y el resultado llega por toast (confirmación del patrón sin spinner).
  await expect(page.locator('.toast[data-kind="success"]')).toBeVisible();
});

// ───────────────────────────── DC-142 — confirm-dialog (acción de descarte) ─────────────────────────────

// test: DC-142 — descartar un pago con datos cargados abre un confirm-dialog (<50%, copy de
// producción, 2 botones). "Seguir editando" cierra sin navegar. El modal no supera el 50% del viewport.
test('DC-142: confirm-dialog de descarte — copy de producción, <50% del viewport, 2 acciones', async ({ page }) => {
  await gotoApp(page, `/pacientes/${PID}/pagos/nuevo`);
  await page.getByRole('spinbutton', { name: 'Monto (ARS)' }).fill('2500');
  await page.getByRole('button', { name: 'Cancelar' }).click();

  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Descartar el pago')).toBeVisible();
  await expect(dialog.getByText(/Tenés un monto ingresado/)).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Seguir editando' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Sí, descartar' })).toBeVisible();

  // BVC-012/DC-067: el modal es compacto. La regla "<50% del viewport / máx ~440px" es el
  // contrato de DESKTOP; en mobile un confirm-dialog usa un ancho cómodo (no <50% de 393px, que
  // sería inusable) pero NUNCA supera el viewport ni los 440px del tope. Asertamos viewport-aware.
  const box = await dialog.boundingBox();
  const vw = page.viewportSize()!.width;
  if (vw >= 1200) {
    // Desktop: <50% del viewport y dentro del tope de ~440px.
    expect(box!.width, 'desktop: confirm-dialog <50% del viewport').toBeLessThanOrEqual(vw * 0.5 + 8);
    expect(box!.width, 'desktop: confirm-dialog ≤ ~440px').toBeLessThanOrEqual(448);
  } else {
    // Mobile: ancho cómodo pero acotado al tope de DC-067 (~440px) y sin desbordar el viewport.
    expect(box!.width, 'mobile: confirm-dialog ≤ ~440px (tope DC-067)').toBeLessThanOrEqual(448);
    expect(box!.width, 'mobile: confirm-dialog no desborda el viewport').toBeLessThanOrEqual(vw);
  }

  // Copy de producción (sin lenguaje de demo).
  await expect(dialog).not.toContainText(/resetear demo|demo|mock/i);

  // "Seguir editando" cierra sin navegar ni perder el formulario.
  await dialog.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-001\/pagos\/nuevo$/);
  await expect(page.getByRole('spinbutton', { name: 'Monto (ARS)' })).toHaveValue('2500');
});

// ───────────────────────────── BVC-010 — una sola acción primaria por pantalla ─────────────────────────────

// test: BVC-010 — en pantallas representativas, hay exactamente UNA acción primaria visible en main.
test('BVC-010: una sola acción primaria por pantalla (ficha · registrar pago · crear turno)', async ({ page }) => {
  const countPrimaries = () =>
    page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return -1;
      return [...main.querySelectorAll('.btn-edm--primary')].filter((b) => (b as HTMLElement).offsetParent !== null).length;
    });

  await gotoApp(page, `/pacientes/${PID}/informacion`);
  await page.getByRole('button', { name: 'Agendar turno' }).waitFor();
  expect(await countPrimaries(), 'ficha: 1 acción primaria').toBe(1);

  await gotoApp(page, `/pacientes/${PID}/pagos/nuevo`);
  await page.getByRole('button', { name: 'Confirmar pago' }).waitFor();
  expect(await countPrimaries(), 'registrar pago: 1 acción primaria').toBe(1);

  await gotoApp(page, '/agenda/nuevo/paciente');
  await expect(page.getByText('Paso 1 de 3')).toBeVisible();
  // El stepper paso 1 ofrece una sola primaria ("Siguiente"); ≤1 visible.
  expect(await countPrimaries(), 'crear turno paso 1: ≤1 acción primaria').toBeLessThanOrEqual(1);
});

// ───────────────────────────── BVC-014 — iconografía Phosphor stroke efectivo 1.5px ─────────────────────────────

// test: BVC-014 — un solo set Phosphor con stroke EFECTIVO 1.5px. Los SVG usan viewBox 256, por lo que
// el stroke efectivo = stroke-width × (anchoRenderizado / 256). Verificamos que ese valor ≈ 1.5px en
// todos los íconos y que el token --icon-stroke es 1.5.
test('BVC-014: íconos Phosphor con stroke efectivo ≈1.5px (normalizado al viewBox 256)', async ({ page }) => {
  await gotoApp(page, `/pacientes/${PID}/informacion`);
  await page.waitForTimeout(400);
  const data = await page.evaluate(() => {
    const token = getComputedStyle(document.documentElement).getPropertyValue('--icon-stroke').trim();
    const svgs = [...document.querySelectorAll('app-icon svg, .icon-host svg')].filter((s) => (s as SVGElement).getBoundingClientRect().width > 0);
    const effective = svgs.slice(0, 40).map((svg) => {
      const sw = parseFloat(svg.getAttribute('stroke-width') || '0');
      const vb = (svg.getAttribute('viewBox') || '0 0 256 256').split(/\s+/).map(Number);
      const vbW = vb[2] || 256;
      const renderW = (svg as SVGElement).getBoundingClientRect().width;
      return renderW > 0 && sw > 0 ? +(sw * (renderW / vbW)).toFixed(2) : null;
    }).filter((v): v is number => v !== null);
    return { token, effective, count: effective.length };
  });
  expect(data.token).toBe('1.5');
  expect(data.count, 'hay íconos Phosphor en la pantalla').toBeGreaterThan(0);
  for (const eff of data.effective) {
    // Tolerancia ±0.25px por redondeo de getBoundingClientRect.
    expect(Math.abs(eff - 1.5), `stroke efectivo ${eff}px ≈ 1.5px`).toBeLessThanOrEqual(0.25);
  }
});

// ───────────────────────────── BVC-016 — skeletons-no-spinners + toasts tras acción ─────────────────────────────

// test: BVC-016 — combinación de las dos garantías del cliente: (a) cero spinners al cargar, y
// (b) toast tras una acción exitosa. (El "skeleton vs spinner" se garantiza por la ausencia total
// de spinner; el contenido diferido usa @defer, ver DC-120.)
test('BVC-016: skeletons-no-spinners (cero spinner al cargar) + toast tras acción exitosa', async ({ page }) => {
  // (a) cero spinners en una pantalla con contenido diferido.
  await gotoApp(page, `/pacientes/${PID}/odontograma`);
  const spinners = await page.evaluate(() =>
    [...document.querySelectorAll('[class*="spinner" i], .spinner-border, .spinner-grow')].filter((e) => (e as HTMLElement).offsetParent !== null).length,
  );
  expect(spinners, 'cero spinners al cargar contenido diferido').toBe(0);

  // (b) toast tras acción exitosa (registrar pago).
  await gotoApp(page, `/pacientes/pac-006/pagos/nuevo`);
  await page.getByRole('spinbutton', { name: 'Monto (ARS)' }).fill('5000');
  await page.getByRole('button', { name: 'Confirmar pago' }).click();
  await expect(page.locator('.toast[data-kind="success"]')).toBeVisible();
});

// ───────────────────────────── BVC-023 — sin drawers laterales como contenido principal ─────────────────────────────

// test: BVC-023 — el contenido principal vive en <main> dentro del shell; no hay drawer/offcanvas
// lateral que actúe como contenedor de contenido principal. (La nav lateral es `nav`, permitida.)
test('BVC-023: NO hay drawers laterales como contenido principal (recorrido)', async ({ page }) => {
  for (const route of ['/pacientes', `/pacientes/${PID}/informacion`, '/facturacion/presupuestos', '/agenda']) {
    await gotoApp(page, route);
    const drawers = await page.evaluate(() => {
      // Drawers/offcanvas que contienen contenido principal (no la nav del shell, que es <nav>).
      return [...document.querySelectorAll('[class*="drawer" i], [class*="offcanvas" i]')]
        .filter((e) => {
          const el = e as HTMLElement;
          if (el.offsetParent === null) return false;
          // Excluir si es (o está dentro de) la navegación principal.
          if (el.closest('nav[aria-label="Navegación principal"]')) return false;
          if (el.tagName === 'NAV') return false;
          return true;
        })
        .map((e) => (e as HTMLElement).className);
    });
    expect(drawers, `drawers de contenido en ${route}`).toEqual([]);
  }
});

// ───────────────────────────── BVC-028 — el aire comunica orden ─────────────────────────────

// test: BVC-028 — en una pantalla con poco contenido (cards de paciente), las cards respiran:
// padding 24-32px (DC-020) y la superficie usa sombra O borde (no ambos). Pantalla sparse → espaciosa.
test('BVC-028: el aire comunica orden — padding de card 24-32px (DC-020) en pantalla sparse', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await page.getByRole('button', { name: 'Vista de tarjetas' }).click();
  await page.waitForTimeout(400);
  const card = await page.evaluate(() => {
    const c = document.querySelector('main article.pcard, main article.surface-card, main article') as HTMLElement | null;
    if (!c) return null;
    const cs = getComputedStyle(c);
    const px = (v: string) => parseFloat(v);
    const hasBorder = px(cs.borderTopWidth) > 0;
    const hasShadow = cs.boxShadow !== 'none' && cs.boxShadow.trim().length > 0;
    return {
      padTop: px(cs.paddingTop),
      padLeft: px(cs.paddingLeft),
      hasBorder,
      hasShadow,
      radius: px(cs.borderTopLeftRadius),
    };
  });
  expect(card, 'hay patient-cards').not.toBeNull();
  // Padding generoso 24-32px (el aire del contenido).
  expect(card!.padTop, 'padding-top de card ∈ [24,32]').toBeGreaterThanOrEqual(24);
  expect(card!.padTop).toBeLessThanOrEqual(32);
  expect(card!.padLeft).toBeGreaterThanOrEqual(24);
  // Borde O sombra, nunca ambos (BVC-005) — refuerza la sobriedad del aire.
  expect(card!.hasBorder && card!.hasShadow, 'card no usa borde Y sombra a la vez').toBe(false);
  // Radius dentro de 10-14 (BVC-004).
  expect(card!.radius).toBeGreaterThanOrEqual(10);
  expect(card!.radius).toBeLessThanOrEqual(14);
});
