import { AppointmentStatus, TreatmentStatus, PaymentStatus } from '../core/models/models';

type Tone = 'success' | 'error' | 'warning' | 'info' | 'neutral';
export interface BadgeSpec { label: string; tone: Tone; }

/** Mapeo de estados de dominio → label + tono semántico (DC-053). */
export const appointmentBadge = (s: AppointmentStatus): BadgeSpec => ({
  'confirmado': { label: 'Confirmado', tone: 'success' as Tone },
  'en-espera': { label: 'En espera', tone: 'warning' as Tone },
  'atendiendo': { label: 'Atendiendo', tone: 'info' as Tone },
  'terminado': { label: 'Terminado', tone: 'neutral' as Tone },
  'cancelado': { label: 'Cancelado', tone: 'error' as Tone },
}[s]);

export const treatmentBadge = (s: TreatmentStatus): BadgeSpec => ({
  'en-curso': { label: 'En curso', tone: 'info' as Tone },
  'atrasado': { label: 'Atrasado', tone: 'warning' as Tone },
  'en-pausa': { label: 'En pausa', tone: 'neutral' as Tone },
  'completado': { label: 'Completado', tone: 'success' as Tone },
}[s]);

export const paymentBadge = (s: PaymentStatus): BadgeSpec => ({
  'al-dia': { label: 'Al día', tone: 'success' as Tone },
  'con-deuda': { label: 'Con deuda', tone: 'warning' as Tone },
  'vencido': { label: 'Vencido', tone: 'error' as Tone },
}[s]);

export const invoiceBadge = (s: 'emitida' | 'pagada' | 'vencida' | 'anulada'): BadgeSpec => ({
  'pagada': { label: 'Pagada', tone: 'success' as Tone },
  'emitida': { label: 'Emitida', tone: 'info' as Tone },
  'vencida': { label: 'Vencida', tone: 'error' as Tone },
  'anulada': { label: 'Anulada', tone: 'neutral' as Tone },
}[s]);

export const budgetBadge = (s: 'pendiente' | 'aprobado' | 'rechazado' | 'vencido'): BadgeSpec => ({
  'aprobado': { label: 'Aprobado', tone: 'success' as Tone },
  'pendiente': { label: 'Pendiente', tone: 'warning' as Tone },
  'rechazado': { label: 'Rechazado', tone: 'error' as Tone },
  'vencido': { label: 'Vencido', tone: 'neutral' as Tone },
}[s]);
