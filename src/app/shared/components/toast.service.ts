import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';
export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  persistent: boolean;
}

/**
 * Servicio de toasts (DC-066/130/131/132 / BVC-016).
 * Éxito → auto-dismiss ~3s. Error → persistente. Info → polite.
 * (Infra de feedback visual de la cáscara; copy de producción anti-demo.)
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string) { this.push('success', message, false, 3000); }
  info(message: string) { this.push('info', message, false, 4000); }
  error(message: string) { this.push('error', message, true, 0); }

  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(kind: ToastKind, message: string, persistent: boolean, ttl: number) {
    const id = ++this.seq;
    this.toasts.update((list) => [...list, { id, kind, message, persistent }]);
    if (!persistent && ttl > 0) {
      setTimeout(() => this.dismiss(id), ttl);
    }
  }
}
