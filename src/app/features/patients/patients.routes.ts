import { Routes } from '@angular/router';

/**
 * Rutas de Pacientes (DEMO-008/009/010/011 / DC-040..045).
 * Ficha = ruta padre con tabs como rutas hijas (tab activo reflejado en URL,
 * contenido del tab inactivo NO en el DOM — BVC-013).
 */
export const PATIENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./patient-list.component').then((m) => m.PatientListComponent), title: 'Pacientes' },
  { path: 'nuevo/datos', loadComponent: () => import('./patient-create.component').then((m) => m.PatientCreateComponent), title: 'Nuevo paciente', data: { step: 1 } },
  { path: 'nuevo/clinico', loadComponent: () => import('./patient-create.component').then((m) => m.PatientCreateComponent), title: 'Nuevo paciente', data: { step: 2 } },
  {
    path: ':id',
    loadComponent: () => import('./patient-detail.component').then((m) => m.PatientDetailComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'informacion' },
      { path: 'informacion', loadComponent: () => import('./tabs/tab-info.component').then((m) => m.TabInfoComponent), title: 'Información del paciente' },
      { path: 'odontograma', loadComponent: () => import('./tabs/tab-odontogram.component').then((m) => m.TabOdontogramComponent), title: 'Odontograma' },
      { path: 'historial', loadComponent: () => import('./tabs/tab-history.component').then((m) => m.TabHistoryComponent), title: 'Historial clínico' },
      { path: 'tratamientos', loadComponent: () => import('./tabs/tab-treatments.component').then((m) => m.TabTreatmentsComponent), title: 'Tratamientos del paciente' },
      { path: 'documentos', loadComponent: () => import('./tabs/tab-documents.component').then((m) => m.TabDocumentsComponent), title: 'Documentos' },
      { path: 'pagos', loadComponent: () => import('./tabs/tab-payments.component').then((m) => m.TabPaymentsComponent), title: 'Pagos' },
    ],
  },
  { path: ':id/editar', loadComponent: () => import('./patient-create.component').then((m) => m.PatientCreateComponent), title: 'Editar paciente', data: { edit: true } },
  { path: ':id/pieza/:fdi', loadComponent: () => import('./tooth-detail.component').then((m) => m.ToothDetailComponent), title: 'Detalle de pieza' },
  { path: ':id/evento/:eventId', loadComponent: () => import('./event-detail.component').then((m) => m.EventDetailComponent), title: 'Detalle de evento' },
  { path: ':id/plan/:planId', loadComponent: () => import('./plan-detail.component').then((m) => m.PlanDetailComponent), title: 'Detalle de plan' },
  { path: ':id/pagos/nuevo', loadComponent: () => import('./register-payment.component').then((m) => m.RegisterPaymentComponent), title: 'Registrar pago' },
];
