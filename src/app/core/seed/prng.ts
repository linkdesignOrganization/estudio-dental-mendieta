/**
 * PRNG con semilla fija (ADR-8). mulberry32 — rápido, determinista, suficiente para
 * un seed reproducible: misma semilla → misma secuencia, siempre. Esto garantiza que
 * "Restablecer datos" devuelva exactamente el estado original (UX-090) y que QA tenga
 * datos predecibles. NO se usa Math.random() en ningún generador.
 */
export class Prng {
  private state: number;

  constructor(seed: number) {
    // Normaliza a entero de 32 bits sin signo.
    this.state = seed >>> 0;
  }

  /** Siguiente flotante en [0, 1). */
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Entero en [min, max] inclusive. */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Elemento aleatorio de un array (no vacío). */
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  /** true con probabilidad p (0..1). */
  chance(p: number): boolean {
    return this.next() < p;
  }

  /** Baraja una copia del array (Fisher-Yates determinista). */
  shuffle<T>(arr: readonly T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /** Toma `count` elementos distintos al azar (sin repetir). */
  sample<T>(arr: readonly T[], count: number): T[] {
    return this.shuffle(arr).slice(0, Math.min(count, arr.length));
  }
}

/** Semilla raíz del seed del proyecto (fija → reproducible). */
export const SEED_ROOT = 0x4544_4d31; // "EDM1"
