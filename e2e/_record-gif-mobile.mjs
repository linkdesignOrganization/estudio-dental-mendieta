/**
 * Flow Tester — GIF 4 (mobile ~390px): recorrido responsive condensado en producción.
 * Separado de _record-gifs.mjs para re-grabar SOLO el mobile sin rehacer los 3 desktop ya OK.
 *
 * Fix vs intento previo: en mobile la lista de pacientes renderiza DOS árboles sincronizados
 * (tabla <tr> oculta + <div .dt__card> visible) que comparten aria-label "Ver ficha de …".
 * El bare `.first()` caía en el <tr> OCULTO → timeout. Filtramos por { visible: true }
 * (mismo contrato que patientRow() en tests/_helpers/seed.ts).
 */
import { chromium } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const BASE = 'https://happy-coast-044ea7e0f.7.azurestaticapps.net';
const STATE_KEY = 'edm:v1:state';
const OUT_DIR = resolve(process.cwd(), '..', 'output', 'iterations', 'production', 'gifs');
mkdirSync(OUT_DIR, { recursive: true });

const FPS = 8, INTERVAL = 350;
const consoleErrors = [];

class Recorder {
  constructor(page, label) {
    this.page = page; this.label = label;
    this.dir = mkdtempSync(join(tmpdir(), `gif-${label}-`));
    this.n = 0; this.timer = null; this.busy = false;
  }
  async _shot() {
    if (this.busy) return; this.busy = true;
    try {
      await this.page.screenshot({ path: join(this.dir, `f${String(this.n).padStart(4, '0')}.png`), animations: 'disabled', caret: 'hide' });
      this.n++;
    } catch { /* mid-nav */ }
    this.busy = false;
  }
  start() { this.timer = setInterval(() => this._shot(), INTERVAL); }
  async mark(count = 3, gap = 180) { for (let i = 0; i < count; i++) { await this._shot(); await this.page.waitForTimeout(gap); } }
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; }
  build(outName) {
    this.stop();
    if (readdirSync(this.dir).filter((f) => f.endsWith('.png')).length === 0) throw new Error('no frames');
    const out = join(OUT_DIR, outName);
    const palette = join(this.dir, 'palette.png');
    const pat = join(this.dir, 'f%04d.png');
    const r1 = spawnSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', pat, '-vf', 'scale=480:-1:flags=lanczos,palettegen=stats_mode=diff', palette], { encoding: 'utf8' });
    if (r1.status !== 0) throw new Error('palettegen: ' + (r1.stderr || '').slice(-400));
    const r2 = spawnSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', pat, '-i', palette, '-lavfi', 'scale=480:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3', out], { encoding: 'utf8' });
    if (r2.status !== 0) throw new Error('paletteuse: ' + (r2.stderr || '').slice(-400));
    rmSync(this.dir, { recursive: true, force: true });
    return out;
  }
}

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

async function run() {
  const browser = await chromium.launch();
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

  // Pacientes (cards + avatar) — deep-link
  await gotoApp(page, '/pacientes');
  const cardVisible = page.locator('[aria-label="Ver ficha de Bautista Álvarez"]').filter({ visible: true });
  await cardVisible.waitFor({ state: 'visible', timeout: 20_000 });
  await page.waitForFunction(() => {
    const imgs = [...document.querySelectorAll('main img')];
    return imgs.length > 0 && imgs.some((i) => i.complete && i.naturalWidth > 0);
  }, null, { timeout: 15_000 }).catch(() => {});
  await rec.mark(4, 260);

  // Ficha (foto header + tabs en mobile)
  await cardVisible.getByText('Bautista Álvarez', { exact: true }).click();
  await page.waitForURL(/\/pacientes\/pac-001\/informacion$/, { timeout: 20_000 });
  await page.getByRole('tab', { name: 'Información general' }).waitFor({ state: 'visible' });
  await rec.mark(4, 260);

  // Reporte con gráficos (mobile)
  await gotoApp(page, '/reportes/financiero');
  await page.getByText('Reporte financiero').first().waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelectorAll('main figure').length >= 3, null, { timeout: 20_000 });
  await rec.mark(5, 260);

  const out = rec.build('04-mobile-recorrido-responsive.gif');

  // dejar producción limpia
  await resetSeed(page, '/agenda');
  await ctx.close();
  await browser.close();

  console.log('GIF_GENERATED', out);
  console.log('CONSOLE_ERRORS_TOTAL', consoleErrors.length);
  if (consoleErrors.length) console.log(JSON.stringify(consoleErrors.slice(0, 10), null, 2));
}

run().catch((e) => { console.error('RECORDER_FAILED:', e && e.stack ? e.stack : e); process.exit(1); });
