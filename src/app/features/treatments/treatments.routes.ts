import { Routes } from '@angular/router';

/**
 * Rutas de Tratamientos (DEMO-012 / DC-046). Activos + catálogo de tipos + detalle.
 */
export const TREATMENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./treatments-home.component').then((m) => m.TreatmentsHomeComponent), title: 'Tratamientos' },
  { path: 'activos/:id', loadComponent: () => import('./treatment-plan-redirect.component').then((m) => m.TreatmentPlanRedirectComponent), title: 'Tratamiento' },
  { path: 'tipos/:id', loadComponent: () => import('./treatment-type-detail.component').then((m) => m.TreatmentTypeDetailComponent), title: 'Tipo de tratamiento' },
];
