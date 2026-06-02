import { Injectable, signal } from '@angular/core';

/** Versión de schema (architecture.md REQ-041). La clave incluye la versión. */
export const SCHEMA_VERSION = 'v1';
export const STORAGE_KEY = `edm:${SCHEMA_VERSION}:state`;

/**
 * Wrapper único sobre localStorage (Épica 2 / ADR-4). Namespace + versión de schema,
 * serialización JSON, y degradación elegante si localStorage no está disponible
 * (modo privado restrictivo / cuota llena → UX-091): cae a memoria con un flag, sin
 * crashear. Nunca bloquea la UI (las escrituras son debounced por el StoreService).
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /** true cuando localStorage no es utilizable y operamos solo en memoria. */
  readonly degraded = signal(false);

  private memoryFallback: string | null = null;
  private readonly available = this.probe();

  /** Lee y parsea el árbol de estado. null si no existe o no es parseable. */
  read<T>(): T | null {
    try {
      const raw = this.available ? localStorage.getItem(STORAGE_KEY) : this.memoryFallback;
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  /** Serializa y persiste el árbol. Si localStorage falla, degrada a memoria. */
  write<T>(value: T): void {
    const raw = JSON.stringify(value);
    if (!this.available) {
      this.memoryFallback = raw;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, raw);
    } catch {
      // Cuota llena u otra restricción en runtime → degrada sin perder la sesión.
      this.memoryFallback = raw;
      this.degraded.set(true);
    }
  }

  /** Borra el estado persistido (usado por "Restablecer datos"). */
  clear(): void {
    this.memoryFallback = null;
    if (this.available) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* no-op: si no se puede borrar, el reseed sobrescribirá igual */
      }
    }
  }

  /** Limpia claves de versiones de schema anteriores (REQ-041: migración = reset limpio). */
  purgeOldVersions(): void {
    if (!this.available) return;
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('edm:') && !key.startsWith(`edm:${SCHEMA_VERSION}:`)) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      /* no-op */
    }
  }

  /** Detecta si localStorage es utilizable (puede no estarlo en modo privado/SSR). */
  private probe(): boolean {
    try {
      const k = '__edm_probe__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch {
      this.degraded.set(true);
      return false;
    }
  }
}
