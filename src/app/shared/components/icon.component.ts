import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Icono Phosphor inline (DC-027 / BVC-014).
 * Set ÚNICO Phosphor "regular" (no fill), stroke 1.5, SVG inline, hereda currentColor.
 * Tamaños fijos: 16 (inline) · 20 (botones/filas) · 24 (acciones primarias).
 * viewBox 0 0 256 256 (estándar Phosphor). aria-hidden por defecto (decorativo);
 * cuando comunica significado, el contenedor expone aria-label.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="icon-host" [style.width.px]="size()" [style.height.px]="size()" [innerHTML]="svg()"></span>`,
  styles: [`
    :host { display: inline-flex; line-height: 0; }
    .icon-host { display: inline-flex; }
    :host ::ng-deep svg { display: block; }
  `],
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** nombre del glifo (clave de PHOSPHOR_PATHS) */
  readonly name = input.required<string>();
  /** 16 | 20 | 24 — por defecto 20 (filas/botones) */
  readonly size = input<number>(20);

  // Tamaño saneado: como bypassamos el sanitizer para inyectar el SVG inline (necesario
  // porque Angular descarta los sub-elementos SVG), `size` es el ÚNICO valor que se
  // interpola en el markup y NO proviene del allowlist de paths. Los tipos de TS se borran
  // en runtime, así que lo coercemos a un entero acotado para que jamás pueda inyectar
  // markup arbitrario, aunque un caller pase un valor manipulado.
  private readonly safeSize = computed(() => {
    const n = Math.round(Number(this.size()));
    return Number.isFinite(n) ? Math.min(Math.max(n, 8), 256) : 20;
  });

  // stroke 1.5 a viewBox 256: escalar proporcional al tamaño visual para mantener grosor óptico ~1.5px
  private readonly strokeWidth = computed(() => {
    const s = this.safeSize();
    return Math.round((1.5 * 256 / s) * 10) / 10;
  });

  readonly svg = computed<SafeHtml>(() => {
    // El path data SOLO sale del allowlist interno PHOSPHOR_PATHS; un `name` desconocido
    // cae a 'question'. El `name` crudo nunca se interpola en el markup → sin vector XSS.
    const paths = PHOSPHOR_PATHS[this.name()] ?? PHOSPHOR_PATHS['question'];
    const s = this.safeSize();
    const markup =
      `<svg width="${s}" height="${s}" viewBox="0 0 256 256" fill="none" ` +
      `stroke="currentColor" stroke-width="${this.strokeWidth()}" ` +
      `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(markup);
  });
}

/**
 * Subset de Phosphor (regular) usado por la app. Path data del set oficial Phosphor.
 * El componente fija stroke/fill/linecap.
 */
const RAW: Record<string, string> = {
  // navegación / shell
  'calendar-blank': `<rect x="40" y="40" width="176" height="176" rx="8"/><line x1="176" y1="24" x2="176" y2="56"/><line x1="80" y1="24" x2="80" y2="56"/><line x1="40" y1="88" x2="216" y2="88"/>`,
  'users': `<circle cx="88" cy="108" r="52"/><path d="M155.41,57.27a52,52,0,1,1,8.85,99.58"/><path d="M16,197.4a88,88,0,0,1,144,0"/><path d="M169.84,197.4a87.94,87.94,0,0,1,70.16-.05"/>`,
  'tooth': `<path d="M171.86,40C159,40,151.34,48,128,48S97,40,84.14,40C56,40,32,64.29,32,96c0,52,24,120,40,120s24-48,56-48,40,48,56,48,40-68,40-120C224,64.29,200.18,40,171.86,40Z"/>`,
  'receipt': `<path d="M40,200V40a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8V200l-26.67-16L160,200l-29.33-16L104,200,77.33,184Z"/><line x1="88" y1="96" x2="168" y2="96"/><line x1="88" y1="128" x2="168" y2="128"/>`,
  'chart-bar': `<line x1="216" y1="208" x2="40" y2="208"/><rect x="64" y="120" width="40" height="64"/><rect x="152" y="80" width="40" height="104"/><rect x="108" y="48" width="40" height="136" transform="translate(256 232) rotate(180)"/>`,
  'gear': `<circle cx="128" cy="128" r="40"/><path d="M41.43,178.09A99.14,99.14,0,0,1,31.36,153.8l16.78-21a81.59,81.59,0,0,1,0-9.64l-16.77-21a99.43,99.43,0,0,1,10.05-24.3l26.71-3a81,81,0,0,1,6.81-6.81l3-26.7A99.14,99.14,0,0,1,102.2,31.36l21,16.78a81.59,81.59,0,0,1,9.64,0l21-16.77a99.43,99.43,0,0,1,24.3,10.05l3,26.71a81,81,0,0,1,6.81,6.81l26.7,3a99.14,99.14,0,0,1,10.07,24.29l-16.78,21a81.59,81.59,0,0,1,0,9.64l16.77,21a99.43,99.43,0,0,1-10,24.3l-26.71,3a81,81,0,0,1-6.81,6.81l-3,26.7a99.14,99.14,0,0,1-24.29,10.07l-21-16.78a81.59,81.59,0,0,1-9.64,0l-21,16.77a99.43,99.43,0,0,1-24.3-10Z"/>`,
  'question': `<circle cx="128" cy="128" r="96"/><line x1="128" y1="172" x2="128" y2="172.01"/><path d="M128,144v-8a28,28,0,1,0-28-28"/>`,
  'list': `<line x1="40" y1="128" x2="216" y2="128"/><line x1="40" y1="64" x2="216" y2="64"/><line x1="40" y1="192" x2="216" y2="192"/>`,
  'bell': `<path d="M56.24,104a72,72,0,0,1,144,0c0,35.82,8.18,56.07,14.62,66.56A8,8,0,0,1,208,184H48.07a8,8,0,0,1-6.83-12.43C47.75,160.92,56.24,140.62,56.24,104Z"/><path d="M104,184a24,24,0,0,0,48,0"/>`,
  'magnifying-glass': `<circle cx="116" cy="116" r="84"/><line x1="175.39" y1="175.39" x2="224" y2="224"/>`,
  'caret-down': `<polyline points="208 96 128 176 48 96"/>`,
  'caret-right': `<polyline points="96 48 176 128 96 208"/>`,
  'caret-left': `<polyline points="160 208 80 128 160 48"/>`,
  'arrow-left': `<line x1="216" y1="128" x2="40" y2="128"/><polyline points="112 56 40 128 112 200"/>`,
  'arrow-right': `<line x1="40" y1="128" x2="216" y2="128"/><polyline points="144 56 216 128 144 200"/>`,
  'x': `<line x1="200" y1="56" x2="56" y2="200"/><line x1="200" y1="200" x2="56" y2="56"/>`,
  'check': `<polyline points="216 72.005 104 184 48 128.005"/>`,
  'check-circle': `<circle cx="128" cy="128" r="96"/><polyline points="172 104 113.33 160 84 132"/>`,
  'plus': `<line x1="40" y1="128" x2="216" y2="128"/><line x1="128" y1="40" x2="128" y2="216"/>`,
  'pencil-simple': `<path d="M92.69,216H48a8,8,0,0,1-8-8V163.31a8,8,0,0,1,2.34-5.65L165.66,34.34a8,8,0,0,1,11.31,0L221.66,79a8,8,0,0,1,0,11.31L98.34,213.66A8,8,0,0,1,92.69,216Z"/><line x1="136" y1="64" x2="192" y2="120"/>`,
  'trash': `<line x1="216" y1="60" x2="40" y2="60"/><line x1="104" y1="104" x2="104" y2="168"/><line x1="152" y1="104" x2="152" y2="168"/><path d="M200,60V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V60"/><path d="M168,60V36a16,16,0,0,0-16-16H104A16,16,0,0,0,88,36V60"/>`,
  'dots-three': `<circle cx="128" cy="128" r="12"/><circle cx="192" cy="128" r="12"/><circle cx="64" cy="128" r="12"/>`,
  'dots-three-vertical': `<circle cx="128" cy="128" r="12"/><circle cx="128" cy="64" r="12"/><circle cx="128" cy="192" r="12"/>`,
  'funnel': `<path d="M48,40H208a8,8,0,0,1,8,8V74.34a8,8,0,0,1-2.34,5.66L160,134.34V200l-64,32V134.34L42.34,80A8,8,0,0,1,40,74.34V48A8,8,0,0,1,48,40Z"/>`,
  // contacto / datos
  'phone': `<path d="M156.39,153.34a8,8,0,0,1,7.59-.69l45.95,20.48a8,8,0,0,1,4.7,8.86A48.21,48.21,0,0,1,168,224,136,136,0,0,1,32,88,48.21,48.21,0,0,1,73.85,40.69a8,8,0,0,1,8.86,4.7l20.48,46a8,8,0,0,1-.71,7.59l-19.7,23.45a4,4,0,0,0-.65,4.74,76.86,76.86,0,0,0,29.27,29c1.43.81,3.18.62,4.56-.39Z"/>`,
  'envelope-simple': `<rect x="32" y="48" width="192" height="160" rx="8"/><polyline points="224 56 128 144 32 56"/>`,
  'map-pin': `<circle cx="128" cy="104" r="32"/><path d="M208,104c0,72-80,128-80,128S48,176,48,104a80,80,0,0,1,160,0Z"/>`,
  'identification-card': `<rect x="32" y="48" width="192" height="160" rx="8"/><circle cx="92" cy="120" r="24"/><path d="M62,168a40,40,0,0,1,60,0"/><line x1="160" y1="104" x2="192" y2="104"/><line x1="160" y1="136" x2="192" y2="136"/>`,
  'cake': `<path d="M48,144a24,24,0,0,1,48,0,24,24,0,0,0,48,0,24,24,0,0,1,48,0,24,24,0,0,0,32,22.63V208a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V166.63A24,24,0,0,0,48,144Z"/><line x1="128" y1="80" x2="128" y2="96"/><line x1="88" y1="80" x2="88" y2="96"/><line x1="168" y1="80" x2="168" y2="96"/><path d="M32,144V112a16,16,0,0,1,16-16H208a16,16,0,0,1,16,16v32"/>`,
  'first-aid-kit': `<rect x="32" y="72" width="192" height="144" rx="8"/><path d="M88,72V56a16,16,0,0,1,16-16h48a16,16,0,0,1,16,16V72"/><line x1="128" y1="120" x2="128" y2="168"/><line x1="104" y1="144" x2="152" y2="144"/>`,
  'pill': `<rect x="20.69" y="85.79" width="214.63" height="84.42" rx="42.21" transform="translate(-53.02 128) rotate(-45)"/><line x1="148.69" y1="68.69" x2="187.31" y2="107.31"/><line x1="92" y1="92" x2="164" y2="164"/>`,
  'warning': `<path d="M114.17,40.65,26.92,191.55A16,16,0,0,0,40.75,216H215.25a16,16,0,0,0,13.83-24.45L141.83,40.65a16,16,0,0,0-27.66,0Z"/><line x1="128" y1="104" x2="128" y2="144"/><line x1="128" y1="180" x2="128" y2="180.01"/>`,
  'info': `<circle cx="128" cy="128" r="96"/><polyline points="120 120 128 120 128 176 136 176"/><line x1="124" y1="84" x2="124" y2="84.01"/>`,
  'clock': `<circle cx="128" cy="128" r="96"/><polyline points="128 72 128 128 184 128"/>`,
  'image': `<rect x="32" y="48" width="192" height="160" rx="8"/><circle cx="96" cy="100" r="16"/><path d="M32,168.69l50.34-50.35a8,8,0,0,1,11.32,0L153,177.66a8,8,0,0,0,11.32,0l18.34-18.35a8,8,0,0,1,11.32,0L224,200"/>`,
  'file-text': `<path d="M200,224H56a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96l56,56V216A8,8,0,0,1,200,224Z"/><polyline points="152 32 152 88 208 88"/><line x1="96" y1="136" x2="160" y2="136"/><line x1="96" y1="168" x2="160" y2="168"/>`,
  'briefcase': `<rect x="32" y="72" width="192" height="144" rx="8"/><path d="M168,72V56a16,16,0,0,0-16-16H104A16,16,0,0,0,88,56V72"/><path d="M224,116.66A191.12,191.12,0,0,1,128,144a191.16,191.16,0,0,1-96-27.36"/><line x1="116" y1="112" x2="140" y2="112"/>`,
  'house': `<path d="M152,208V160a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v48a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V115.54a8,8,0,0,1,2.62-5.92l88-80.74a8,8,0,0,1,10.77,0l88,80.74a8,8,0,0,1,2.62,5.92V208a8,8,0,0,1-8,8H160A8,8,0,0,1,152,208Z"/>`,
  'sign-out': `<line x1="112" y1="128" x2="216" y2="128"/><polyline points="180 92 216 128 180 164"/><path d="M160,216H48a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8H160"/>`,
  'user': `<circle cx="128" cy="96" r="64"/><path d="M30.989,215.99064a112.03731,112.03731,0,0,1,194.02211.002"/>`,
  'user-plus': `<circle cx="108" cy="100" r="60"/><path d="M22.21679,200.18012a112.02807,112.02807,0,0,1,171.56641,0"/><line x1="200" y1="136" x2="248" y2="136"/><line x1="224" y1="112" x2="224" y2="160"/>`,
  'calendar-plus': `<rect x="40" y="40" width="176" height="176" rx="8"/><line x1="176" y1="24" x2="176" y2="56"/><line x1="80" y1="24" x2="80" y2="56"/><line x1="40" y1="88" x2="216" y2="88"/><line x1="104" y1="152" x2="152" y2="152"/><line x1="128" y1="128" x2="128" y2="176"/>`,
  'stethoscope': `<path d="M64,32V104a64,64,0,0,0,128,0V32"/><line x1="48" y1="32" x2="80" y2="32"/><line x1="176" y1="32" x2="208" y2="32"/><path d="M128,168v8a56,56,0,0,0,112,0V160"/><circle cx="240" cy="144" r="16"/>`,
  'chart-line': `<polyline points="224 208 32 208 32 48"/><polyline points="208 72 152 128 112 88 56 144"/>`,
  'wallet': `<path d="M24,88V192a16,16,0,0,0,16,16H216a8,8,0,0,0,8-8V104a8,8,0,0,0-8-8H40A16,16,0,0,1,24,88H24A16,16,0,0,1,40,72H192"/><circle cx="180" cy="152" r="12"/>`,
  'money': `<rect x="24" y="64" width="208" height="128" rx="8"/><circle cx="128" cy="128" r="28"/><line x1="68" y1="104" x2="68" y2="152"/><line x1="188" y1="104" x2="188" y2="152"/>`,
  'currency-circle-dollar': `<circle cx="128" cy="128" r="96"/><line x1="128" y1="72" x2="128" y2="184"/><path d="M104,160h36a20,20,0,0,0,0-40H116a20,20,0,0,1,0-40h36"/>`,
  'sparkle': `<path d="M128,24,150.85,84.65a8,8,0,0,0,4.5,4.5L216,112l-60.65,22.85a8,8,0,0,0-4.5,4.5L128,200l-22.85-60.65a8,8,0,0,0-4.5-4.5L40,112l60.65-22.85a8,8,0,0,0,4.5-4.5Z"/>`,
  'shield-check': `<path d="M40,114.79V56a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8v58.77c0,84.18-71.31,112.07-85.54,116.8a7.54,7.54,0,0,1-4.92,0C111.31,226.86,40,199,40,114.79Z"/><polyline points="88 136 112 160 168 104"/>`,
  'circle': `<circle cx="128" cy="128" r="96"/>`,
  'list-bullets': `<line x1="88" y1="64" x2="216" y2="64"/><line x1="88" y1="128" x2="216" y2="128"/><line x1="88" y1="192" x2="216" y2="192"/><circle cx="44" cy="64" r="12"/><circle cx="44" cy="128" r="12"/><circle cx="44" cy="192" r="12"/>`,
  'squares-four': `<rect x="48" y="48" width="64" height="64" rx="8"/><rect x="144" y="48" width="64" height="64" rx="8"/><rect x="48" y="144" width="64" height="64" rx="8"/><rect x="144" y="144" width="64" height="64" rx="8"/>`,
  'rows': `<rect x="40" y="48" width="176" height="64" rx="8"/><rect x="40" y="144" width="176" height="64" rx="8"/>`,
  'eye': `<path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Z"/><circle cx="128" cy="128" r="40"/>`,
  'arrow-clockwise': `<polyline points="176.2 99.7 224.2 99.7 224.2 51.7"/><path d="M65.8,65.8a87.9,87.9,0,1,1,0,124.4"/>`,
  'arrow-counter-clockwise': `<polyline points="79.8 99.7 31.8 99.7 31.8 51.7"/><path d="M190.2,65.8a87.9,87.9,0,1,0,0,124.4"/>`,
  'minus': `<line x1="40" y1="128" x2="216" y2="128"/>`,
  'tag': `<path d="M122.34548,42.34315l88,88a8,8,0,0,1,0,11.3137l-72.6862,72.68629a8,8,0,0,1-11.3137,0l-88-88A8,8,0,0,1,36,120.6863V48a8,8,0,0,1,8-8h72.6863A8,8,0,0,1,122.34548,42.34315Z"/><circle cx="84" cy="84" r="12"/>`,
  'percent': `<line x1="64" y1="192" x2="192" y2="64"/><circle cx="76" cy="76" r="12"/><circle cx="180" cy="180" r="12"/>`,
  'calendar-check': `<rect x="40" y="40" width="176" height="176" rx="8"/><line x1="176" y1="24" x2="176" y2="56"/><line x1="80" y1="24" x2="80" y2="56"/><line x1="40" y1="88" x2="216" y2="88"/><polyline points="156 124 122 158 100 136"/>`,
  'clipboard-text': `<path d="M88,40a40,40,0,0,1,80,0"/><rect x="40" y="40" width="176" height="176" rx="8"/><line x1="88" y1="128" x2="168" y2="128"/><line x1="88" y1="160" x2="168" y2="160"/>`,
  'chat-circle-dots': `<path d="M79.93,211.11a96,96,0,1,0-35-35h0L32.42,213.46a8,8,0,0,0,10.12,10.12l37.39-12.47Z"/><circle cx="128" cy="128" r="10" fill="currentColor" stroke="none"/><circle cx="84" cy="128" r="10" fill="currentColor" stroke="none"/><circle cx="172" cy="128" r="10" fill="currentColor" stroke="none"/>`,
  'megaphone': `<path d="M240,120a32,32,0,0,1-32,32V88A32,32,0,0,1,240,120Z"/><path d="M208,88,84.85,109.27A24,24,0,0,0,64,133v14a24,24,0,0,0,20.85,23.78L208,192Z"/><path d="M104,166V200a16,16,0,0,1-32,0V161"/>`,
};

export const PHOSPHOR_PATHS: Record<string, string> = RAW;
