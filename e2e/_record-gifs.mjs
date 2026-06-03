/**
 * Flow Tester — GIF de EVIDENCIA del sistema FINAL en producción (Fase 6, 6b).
 *
 * Graba GIFs reproducibles del recorrido end-to-end del sistema entregado, corriendo
 * contra la Azure Static Web App de PRODUCCIÓN (nunca localhost). No verifica criterios
 * nuevos (la funcionalidad ya está validada en Fase 5 + regresión del PM); produce la
 * evidencia visual para el cierre/entrega al cliente.
 *
 * Estrategia de grabación (determinista, anti-flaky):
 *  - Frames capturados con page.screenshot() a cadencia fija (timer) + marcas explícitas
 *    en los beats clave (mark()). Sin video→gif (evita conversión frágil).
 *  - Selectores web-first idénticos a los .spec.ts ya verdes (role/label, no scraping de
 *    a[href] en data-tables; domcontentloaded + waitForSelector, NUNCA networkidle).
 *  - Módulos que MUTAN estado (odontograma, turno, pago) se corren sobre seed fresco y se
 *    revierte el estado al terminar, dejando producción intacta.
 *  - ffmpeg ensambla los frames PNG en un GIF con paleta (calidad alta, peso acotado).
 *
 * Salida: output/iterations/production/gifs/*.gif
 */
import { chromium } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const BASE = 'https://happy-coast-044ea7e0f.7.azurestaticapps.net';
const STATE_KEY = 'edm:v1:state';
const OUT_DIR = resolve(process.cwd(), '..', 'output', 'iterations', 'production', 'gifs');
mkdirSync(OUT_DIR, { recursive: true });

const FPS = 8;          // gif playback fps
const INTERVAL = 350;   // ms between background frames

const consoleErrors = [];

/** A frame recorder bound to a page: ticks on a timer and on explicit marks. */
class Recorder {
  constructor(page, label) {
    this.page = page;
    this.label = label;
    this.dir = mkdtempSync(join(tmpdir(), `gif-${label}-`));
    this.n = 0;
    this.timer = null;
    this.busy = false;
  }
  async _shot() {
    if (this.busy) return;
    this.busy = true;
    try {
      const file = join(this.dir, `f${String(this.n).padStart(4, '0')}.png`);
      await this.page.screenshot({ path: file, animations: 'disabled', caret: 'hide' });
      this.n++;
    } catch { /* page mid-navigation — skip this tick */ }
    this.busy = false;
  }
  start() { this.timer = setInterval(() => this._shot(), INTERVAL); }
  /** Capture `count` extra frames spaced `gap`ms apart to hold on a beat. */
  async mark(count = 3, gap = 180) {
    for (let i = 0; i < count; i++) { await this._shot(); await this.page.waitForTimeout(gap); }
  }
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; }
  /** Assemble captured PNGs into a GIF via ffmpeg (palettegen/paletteuse). */
  build(outName) {
    this.stop();
    const frames = readdirSync(this.dir).filter((f) => f.endsWith('.png'));
    if (frames.length === 0) throw new Error(`no frames for ${this.label}`);
    const out = join(OUT_DIR, outName);
    const palette = join(this.dir, 'palette.png');
    const pat = join(this.dir, 'f%04d.png');
    const r1 = spawnSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', pat,
      '-vf', 'scale=1024:-1:flags=lanczos,palettegen=stats_mode=diff', palette], { encoding: 'utf8' });
    if (r1.status !== 0) throw new Error('palettegen failed: ' + (r1.stderr || '').slice(-400));
    const r2 = spawnSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', pat, '-i', palette,
      '-lavfi', 'scale=1024:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3',
      out], { encoding: 'utf8' });
    if (r2.status !== 0) throw new Error('paletteuse failed: ' + (r2.stderr || '').slice(-400));
    rmSync(this.dir, { recursive: true, force: true });
    return out;
  }
}

// ── helpers (mismos contratos que tests/_helpers/seed.ts) ──
async function gotoApp(page, path) {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  await page.locator('nav[aria-label="Navegación principal"]').first().waitFor({ state: 'visible', timeout: 25_000 });
}
async function resetSeed(page, path = '/agenda') {
  if (!page.url().startsWith('http')) await gotoApp(page, path);
  await page.evaluate((k) => localStorage.removeItem(k), STATE_KEY);
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction((k) => !!localStorage.getItem(k), STATE_KEY, { timeout: 20_000 });
  await page.locator('nav[aria-label="Navegación principal"]').first().waitFor({ state: 'visible' });
}

const made = [];

async function run() {
  const browser = await chromium.launch();

  // ════════════════════ GIF 1 (desktop): Login → Dashboard → Pacientes → Ficha → Odontograma ════════════════════
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`[g1] ${m.text()}`); });

    // seed fresco para que el odontograma arranque determinista
    await resetSeed(page, '/agenda');

    const rec = new Recorder(page, 'g1');
    rec.start();

    // 1) LOGIN (mock) — "Ingresar como administradora"
    await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('link', { name: 'Ingresar como administradora' }).waitFor({ state: 'visible' });
    await rec.mark(4, 220);
    await page.getByRole('link', { name: 'Ingresar como administradora' }).click();

    // 2) DASHBOARD de Reportes (KPI cards)
    await page.locator('nav[aria-label="Navegación principal"]').first().waitFor({ state: 'visible' });
    await page.getByRole('heading', { level: 1, name: 'Reportes' }).waitFor({ state: 'visible' });
    await page.getByText('Pacientes nuevos').first().waitFor({ state: 'visible' });
    await rec.mark(5, 260);

    // 3) PACIENTES — lista con fotos
    await page.getByRole('link', { name: 'Pacientes' }).first().click();
    await page.waitForURL(/\/pacientes$/, { timeout: 20_000 });
    await page.locator('[aria-label^="Ver ficha de"]').first().waitFor({ state: 'visible' });
    // espera que las fotos above-fold pinten
    await page.waitForFunction(() => {
      const imgs = [...document.querySelectorAll('main img')];
      return imgs.length > 0 && imgs.some((i) => i.complete && i.naturalWidth > 0);
    }, null, { timeout: 15_000 }).catch(() => {});
    await rec.mark(5, 260);

    // 4) FICHA de un paciente (foto grande + 6 tabs)
    await page.locator('[aria-label="Ver ficha de Bautista Álvarez"]').filter({ visible: true })
      .getByText('Bautista Álvarez', { exact: true }).click();
    await page.waitForURL(/\/pacientes\/pac-001\/informacion$/, { timeout: 20_000 });
    await page.getByRole('tab', { name: 'Información general' }).waitFor({ state: 'visible' });
    await rec.mark(5, 260);

    // 5) ODONTOGRAMA (32 piezas) + cambiar el estado de una pieza (editable, persiste)
    await page.getByRole('tab', { name: 'Odontograma' }).click();
    await page.waitForURL(/\/pacientes\/pac-001\/odontograma$/, { timeout: 20_000 });
    await page.waitForFunction(() =>
      document.querySelectorAll('button[aria-label^="Pieza "]').length === 32, null, { timeout: 20_000 });
    await rec.mark(4, 240);
    // abrir una pieza Sana y cambiarla a Obturación
    const sana = page.getByRole('button', { name: /,\s*Sana$/ }).first();
    await sana.click();
    await page.waitForURL(/\/pacientes\/pac-001\/pieza\/\d+$/, { timeout: 20_000 });
    await page.getByRole('radiogroup', { name: 'Estado de la pieza' }).waitFor({ state: 'visible' });
    await rec.mark(3, 220);
    await page.getByRole('radio', { name: 'Obturación' }).click();
    await rec.mark(3, 220);
    await page.getByRole('button', { name: 'Guardar estado' }).click();
    // vuelve al odontograma con la pieza reflejando el nuevo estado
    await page.waitForURL(/\/pacientes\/pac-001\/odontograma$/, { timeout: 20_000 });
    await page.getByRole('button', { name: /^Pieza \d+ .*Obturación/ }).first().waitFor({ state: 'visible' });
    await rec.mark(5, 260);

    made.push(rec.build('01-desktop-login-dashboard-paciente-odontograma.gif'));
    await ctx.close();
  }

  // ════════════════════ GIF 2 (desktop): Agenda → Crear turno (3 pasos) ════════════════════
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`[g2] ${m.text()}`); });
    await resetSeed(page, '/agenda');

    const rec = new Recorder(page, 'g2');
    rec.start();

    // Agenda — calendario (Mes/Semana/Día)
    await gotoApp(page, '/agenda');
    await page.getByRole('heading', { level: 1, name: 'Agenda' }).waitFor({ state: 'visible' });
    await rec.mark(4, 260);
    await page.getByRole('button', { name: 'Semana', exact: true }).click().catch(() => {});
    await rec.mark(3, 240);

    // Crear turno — Paso 1: paciente
    await gotoApp(page, '/agenda/nuevo/paciente');
    await page.getByRole('heading', { name: 'Nuevo turno' }).waitFor({ state: 'visible' });
    await rec.mark(3, 240);
    await page.getByRole('button', { name: /Agustín Benítez/ }).first().click();
    await rec.mark(2, 220);
    await page.getByRole('button', { name: 'Siguiente' }).click();

    // Paso 2: profesional + fecha + hora
    await page.waitForURL(/\/agenda\/nuevo\/profesional$/, { timeout: 20_000 });
    await page.getByLabel('Profesional').waitFor({ state: 'visible' });
    await rec.mark(3, 240);
    await page.getByLabel('Profesional').selectOption({ label: 'Dra. Soledad Russo · Odontología general' });
    await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-06-25');
    await rec.mark(3, 240);
    await page.getByRole('button', { name: '10:00' }).click();
    await rec.mark(3, 220);
    await page.getByRole('button', { name: 'Siguiente' }).click();

    // Paso 3: confirmar
    await page.waitForURL(/\/agenda\/nuevo\/confirmar$/, { timeout: 20_000 });
    await page.getByRole('button', { name: 'Confirmar turno' }).waitFor({ state: 'visible' });
    await rec.mark(4, 260);
    await page.getByRole('button', { name: 'Confirmar turno' }).click();
    // detalle del turno creado (Confirmado)
    await page.waitForURL(/\/agenda\/tur-[\w-]+$/, { timeout: 20_000 });
    await page.getByText('Confirmado').first().waitFor({ state: 'visible' });
    await rec.mark(5, 260);

    made.push(rec.build('02-desktop-agenda-crear-turno.gif'));
    await ctx.close();
  }

  // ════════════════════ GIF 3 (desktop): Facturación → Registrar pago (saldo actualizado) → Reporte con gráficos ════════════════════
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`[g3] ${m.text()}`); });
    await resetSeed(page, '/pacientes/pac-001/pagos');

    const rec = new Recorder(page, 'g3');
    rec.start();

    // Pagos del paciente — saldo pendiente inicial
    await gotoApp(page, '/pacientes/pac-001/pagos');
    const saldoStat = page.locator('.pay__stat').filter({ hasText: 'Saldo pendiente' }).locator('.pay__stat-value');
    await saldoStat.first().waitFor({ state: 'visible' });
    await rec.mark(4, 260);

    // Registrar pago — formulario con FECHA
    await gotoApp(page, '/pacientes/pac-001/pagos/nuevo');
    await page.getByRole('heading', { name: 'Registrar pago' }).waitFor({ state: 'visible' });
    await rec.mark(3, 240);
    await page.locator('#pay-amount').fill('50000');
    await page.locator('#pay-date').fill('2026-05-20');
    await page.locator('#pay-method').selectOption('Transferencia');
    await page.locator('#pay-note').fill('Pago a cuenta — control mensual');
    await rec.mark(4, 240);
    await page.getByRole('button', { name: 'Confirmar pago' }).click();
    // toast + retorno al tab Pagos con saldo recalculado
    await page.getByText('Pago registrado.').waitFor({ state: 'visible' }).catch(() => {});
    await page.waitForURL(/\/pacientes\/pac-001\/pagos$/, { timeout: 20_000 });
    await page.locator('.movement').filter({ hasText: 'Pago a cuenta — control mensual' }).first()
      .waitFor({ state: 'visible' }).catch(() => {});
    await rec.mark(5, 260);

    // Reporte detallado con gráficos (financiero — 5 figures)
    await gotoApp(page, '/reportes/financiero');
    await page.getByText('Reporte financiero').first().waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.querySelectorAll('main figure').length >= 5, null, { timeout: 20_000 });
    await rec.mark(4, 260);
    // un segundo reporte para mostrar variedad de gráficos (pacientes — donut/barras)
    await gotoApp(page, '/reportes/pacientes');
    await page.getByText('Reporte de pacientes').first().waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.querySelectorAll('main figure').length >= 5, null, { timeout: 20_000 });
    await rec.mark(5, 260);

    made.push(rec.build('03-desktop-facturacion-pago-reportes.gif'));
    await ctx.close();
  }

  // ════════════════════ GIF 4 (mobile ~390px): recorrido responsive condensado ════════════════════
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 820 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`[g4] ${m.text()}`); });

    const rec = new Recorder(page, 'g4');
    rec.start();

    // Login → Dashboard
    await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('link', { name: 'Ingresar como administradora' }).waitFor({ state: 'visible' });
    await rec.mark(3, 240);
    await page.getByRole('link', { name: 'Ingresar como administradora' }).click();
    await page.getByRole('heading', { level: 1, name: 'Reportes' }).waitFor({ state: 'visible' });
    await page.getByText('Pacientes nuevos').first().waitFor({ state: 'visible' });
    await rec.mark(4, 260);

    // Pacientes (cards + avatar) — deep-link (en mobile la nav es drawer)
    await gotoApp(page, '/pacientes');
    await page.locator('[aria-label^="Ver ficha de"]').first().waitFor({ state: 'visible' });
    await page.waitForFunction(() => {
      const imgs = [...document.querySelectorAll('main img')];
      return imgs.length > 0 && imgs.some((i) => i.complete && i.naturalWidth > 0);
    }, null, { timeout: 15_000 }).catch(() => {});
    await rec.mark(4, 260);

    // Ficha (foto header + tabs en mobile)
    await page.locator('[aria-label="Ver ficha de Bautista Álvarez"]').filter({ visible: true })
      .getByText('Bautista Álvarez', { exact: true }).click();
    await page.waitForURL(/\/pacientes\/pac-001\/informacion$/, { timeout: 20_000 });
    await page.getByRole('tab', { name: 'Información general' }).waitFor({ state: 'visible' });
    await rec.mark(4, 260);

    // Reporte con gráficos (mobile)
    await gotoApp(page, '/reportes/financiero');
    await page.getByText('Reporte financiero').first().waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.querySelectorAll('main figure').length >= 3, null, { timeout: 20_000 });
    await rec.mark(5, 260);

    made.push(rec.build('04-mobile-recorrido-responsive.gif'));
    await ctx.close();
  }

  // dejar producción limpia (revertir mutaciones del recorrido)
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    const page = await ctx.newPage();
    await resetSeed(page, '/agenda');
    await ctx.close();
  }

  await browser.close();
}

run().then(() => {
  console.log('GIFS_GENERATED');
  for (const m of made) console.log('  -', m);
  console.log('CONSOLE_ERRORS_TOTAL', consoleErrors.length);
  if (consoleErrors.length) console.log(JSON.stringify(consoleErrors.slice(0, 10), null, 2));
}).catch((e) => {
  console.error('RECORDER_FAILED:', e && e.stack ? e.stack : e);
  process.exit(1);
});
