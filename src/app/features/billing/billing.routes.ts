import { Routes } from '@angular/router';

/**
 * Rutas de Facturación (DEMO-013 / DC-047). Sub-navegación de SECCIÓN (Presupuestos ·
 * Facturas · Obras sociales), cada una ruta REAL (GAP-UX03), NO tabs del mismo objeto.
 * Mock interno SIN ARCA/AFIP.
 */
export const BILLING_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'presupuestos' },
  { path: 'presupuestos', loadComponent: () => import('./budgets-list.component').then((m) => m.BudgetsListComponent), title: 'Presupuestos' },
  { path: 'presupuestos/nuevo/paciente', loadComponent: () => import('./budget-create.component').then((m) => m.BudgetCreateComponent), title: 'Nuevo presupuesto', data: { step: 1 } },
  { path: 'presupuestos/nuevo/items', loadComponent: () => import('./budget-create.component').then((m) => m.BudgetCreateComponent), title: 'Nuevo presupuesto', data: { step: 2 } },
  { path: 'presupuestos/nuevo/confirmar', loadComponent: () => import('./budget-create.component').then((m) => m.BudgetCreateComponent), title: 'Nuevo presupuesto', data: { step: 3 } },
  { path: 'presupuestos/:id', loadComponent: () => import('./budget-detail.component').then((m) => m.BudgetDetailComponent), title: 'Detalle de presupuesto' },
  { path: 'facturas', loadComponent: () => import('./invoices-list.component').then((m) => m.InvoicesListComponent), title: 'Facturas' },
  { path: 'facturas/:id', loadComponent: () => import('./invoice-detail.component').then((m) => m.InvoiceDetailComponent), title: 'Detalle de factura' },
  { path: 'obras-sociales', loadComponent: () => import('./obras-sociales-list.component').then((m) => m.ObrasSocialesListComponent), title: 'Obras sociales' },
  { path: 'obras-sociales/:id', loadComponent: () => import('./obra-social-detail.component').then((m) => m.ObraSocialDetailComponent), title: 'Detalle de obra social' },
];
