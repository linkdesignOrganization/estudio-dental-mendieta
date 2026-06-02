import { Routes } from '@angular/router';

/**
 * Rutas de Configuración (DEMO-018 / DC-049). Incluye "Restablecer datos" (REQ-264,
 * copy de producción, sin lenguaje de demo).
 */
export const SETTINGS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./settings.component').then((m) => m.SettingsComponent), title: 'Configuración' },
];
