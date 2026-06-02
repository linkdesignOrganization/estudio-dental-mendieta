import {
  ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection,
  provideAppInitializer, inject,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { StoreService } from './core/persistence/store.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // Hidrata el store (localStorage → seed determinista) ANTES del 1er render.
    // Garantiza que el deep-linking y el SeedReadyGuard encuentren el estado listo.
    provideAppInitializer(() => inject(StoreService).hydrate()),
    provideRouter(
      routes,
      // scroll arriba al navegar; preserva posición al volver con botón atrás
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      // permite enlazar parámetros de ruta directamente a inputs de componentes
      withComponentInputBinding(),
    ),
  ],
};
