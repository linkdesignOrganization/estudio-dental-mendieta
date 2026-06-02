import { Routes } from '@angular/router';

/**
 * Rutas de Agenda (DEMO-007/015 / DC-036..039). Calendario + detalle + crear (3 pasos)
 * + reagendar + lista del día. Vista del calendario (mes/semana/día) en query param.
 */
export const AGENDA_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./calendar.component').then((m) => m.CalendarComponent), title: 'Agenda' },
  { path: 'dia', loadComponent: () => import('./day-list.component').then((m) => m.DayListComponent), title: 'Turnos del día' },
  { path: 'nuevo/paciente', loadComponent: () => import('./appointment-create.component').then((m) => m.AppointmentCreateComponent), title: 'Nuevo turno', data: { step: 1 } },
  { path: 'nuevo/profesional', loadComponent: () => import('./appointment-create.component').then((m) => m.AppointmentCreateComponent), title: 'Nuevo turno', data: { step: 2 } },
  { path: 'nuevo/confirmar', loadComponent: () => import('./appointment-create.component').then((m) => m.AppointmentCreateComponent), title: 'Nuevo turno', data: { step: 3 } },
  { path: ':id', loadComponent: () => import('./appointment-detail.component').then((m) => m.AppointmentDetailComponent), title: 'Detalle de turno' },
  { path: ':id/reagendar', loadComponent: () => import('./reschedule.component').then((m) => m.RescheduleComponent), title: 'Reagendar turno' },
];
