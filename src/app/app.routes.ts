import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component';
import { seedReadyGuard } from './core/guards/seed-ready.guard';

/**
 * Rutas top-level (DEMO-004 / ADR-5). Multi-pantalla estricto: cada acción tiene
 * ruta dedicada. Login fuera del shell; el resto dentro de app-shell. Todos los
 * features lazy (loadChildren) — bundle inicial = shell + login (ADR-6).
 * Inicio post-login = /reportes (GAP-UX06). seedReadyGuard hidrata el store antes de
 * renderizar cualquier ruta interna (cubre deep-linking UX-016).
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
    title: 'Ingresar — Estudio Dental Mendieta',
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [seedReadyGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'reportes' },
      { path: 'agenda', loadChildren: () => import('./features/agenda/agenda.routes').then((m) => m.AGENDA_ROUTES) },
      { path: 'pacientes', loadChildren: () => import('./features/patients/patients.routes').then((m) => m.PATIENTS_ROUTES) },
      { path: 'tratamientos', loadChildren: () => import('./features/treatments/treatments.routes').then((m) => m.TREATMENTS_ROUTES) },
      { path: 'facturacion', loadChildren: () => import('./features/billing/billing.routes').then((m) => m.BILLING_ROUTES) },
      { path: 'reportes', loadChildren: () => import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES) },
      { path: 'configuracion', loadChildren: () => import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES) },
      { path: 'ayuda', loadComponent: () => import('./features/settings/help.component').then((m) => m.HelpComponent), title: 'Ayuda' },
      { path: 'no-encontrado', loadComponent: () => import('./features/not-found.component').then((m) => m.NotFoundComponent), title: 'Página no encontrada' },
      { path: '**', loadComponent: () => import('./features/not-found.component').then((m) => m.NotFoundComponent), title: 'Página no encontrada' },
    ],
  },
];
