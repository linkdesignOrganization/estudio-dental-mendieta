import { Routes } from '@angular/router';

/**
 * Rutas de Reportes (DEMO-014/018, DC-048/049). Dashboard KPI + reportes detallados.
 */
export const REPORTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./dashboard.component').then((m) => m.DashboardComponent), title: 'Reportes' },
  { path: 'pacientes', loadComponent: () => import('./report-detail.component').then((m) => m.ReportDetailComponent), title: 'Reporte de pacientes', data: { tema: 'pacientes' } },
  { path: 'tratamientos', loadComponent: () => import('./report-detail.component').then((m) => m.ReportDetailComponent), title: 'Reporte de tratamientos', data: { tema: 'tratamientos' } },
  { path: 'financiero', loadComponent: () => import('./report-detail.component').then((m) => m.ReportDetailComponent), title: 'Reporte financiero', data: { tema: 'financiero' } },
  { path: 'productividad', loadComponent: () => import('./report-detail.component').then((m) => m.ReportDetailComponent), title: 'Reporte de productividad', data: { tema: 'productividad' } },
];
