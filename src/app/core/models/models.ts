/**
 * Modelos de presentación (cáscara visual). Tipos ligeros para tipar el
 * contenido placeholder ESTÁTICO de la cáscara. La lógica de dominio, el store
 * con signals y la persistencia los implementa el Developer (paso 4b).
 */

export type AppointmentStatus = 'confirmado' | 'en-espera' | 'atendiendo' | 'terminado' | 'cancelado';
export type TreatmentStatus = 'en-curso' | 'atrasado' | 'en-pausa' | 'completado';
export type PaymentStatus = 'al-dia' | 'con-deuda' | 'vencido';
export type ToothState = 'sana' | 'caries' | 'obturacion' | 'ausente' | 'en-tratamiento' | 'protesis';
export type Genero = 'hombre' | 'mujer';

export interface Patient {
  id: string;
  nombre: string;
  apellido: string;
  genero: Genero;
  edad: number;
  dni: string;
  fotoPath: string;
  obraSocial: string;
  numeroAfiliado: string; // nº de afiliado de la obra social (REQ-128)
  profesional: string;
  telefono: string;
  email: string;
  direccion: string;
  fechaNacimiento: string;
  contactoEmergencia?: ContactoEmergencia; // REQ-128
  proximoTurno?: string;
  estadoCuenta: PaymentStatus;
  alergias: string[];
  medicacion: string[];
  observaciones: string;
}

/** Procedimiento histórico sobre una pieza concreta (detalle de pieza — REQ-186). */
export interface ToothProcedure {
  fecha: string; // dd/mm/yyyy ya formateada
  descripcion: string;
  profesional: string;
}

export interface Appointment {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteFoto: string;
  profesional: string;
  fecha: string;
  hora: string;
  duracionMin: number;
  tratamiento: string;
  estado: AppointmentStatus;
}

export interface TreatmentPlan {
  id: string;
  pacienteId: string;
  nombre: string;
  profesional: string;
  etapasCompletadas: number;
  etapasTotales: number;
  progreso: number;
  estado: TreatmentStatus;
  proximaFecha?: string;
  costo: number;
  profesionalesFotos: string[];
}

export interface TreatmentType {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  costoRef: number;
  duracionEst: string;
}

export interface ObraSocial {
  id: string;
  nombre: string;
  pacientesActivos: number;
  deuda: number;
  ultimoPago: string;
  pacientesFotos: string[];
}

export interface Tooth {
  fdi: number;
  universal: number;
  estado: ToothState;
}

export interface ClinicalEvent {
  id: string;
  fecha: string;
  fechaRelativa: string;
  tipo: string;
  icono: string;
  titulo: string;
  profesional: string;
  descripcion: string;
}

export interface AccountMovement {
  id: string;
  fecha: string;
  concepto: string;
  monto: number;
  signo: 'cargo' | 'pago';
  medioPago?: string;
}

export interface DocumentItem {
  id: string;
  nombre: string;
  tipo: 'radiografia' | 'foto';
  thumbnailPath: string;
}

export interface Invoice {
  id: string;
  numero: string;
  pacienteNombre: string;
  fecha: string;
  total: number;
  estado: 'emitida' | 'pagada' | 'vencida' | 'anulada';
}

export interface Budget {
  id: string;
  numero: string;
  pacienteNombre: string;
  fecha: string;
  total: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'vencido';
}

export interface Kpi {
  id: string;
  label: string;
  valor: string;
  icono: string;
  porcentaje?: number;
  detalle: string;
}

export interface AppNotification {
  id: string;
  tipo: 'turno' | 'pago' | 'cumpleanos' | 'tratamiento';
  icono: string;
  titulo: string;
  subtitulo: string;
  fechaRelativa: string;
  leida: boolean;
  pacienteFoto?: string;
  ruta?: string; // ruta real a la que navega (UX-092)
}

// ============================================================================
// MODELO DE DOMINIO (estado normalizado en localStorage — `edm:v1:state`).
// Estas entidades son la FUENTE DE VERDAD del runtime. El store deriva de aquí
// los shapes de presentación de arriba (Patient/Appointment/...) vía selectores.
// 14 entidades (architecture.md "Modelo de Datos"). Montos en ARS, fechas ISO.
// ============================================================================

export interface Clinic {
  nombre: string;
  cuit: string;
  direccion: string;
  version: string;
}

export interface Professional {
  id: string;
  nombre: string;
  especialidad: string;
  aniosExperiencia: number;
  fotoPath: string;
}

export interface ObraSocialEntity {
  id: string;
  nombre: string;
}

export interface ContactoEmergencia {
  nombre: string;
  relacion: string;
  telefono: string;
}

export interface PatientEntity {
  id: string;
  nombre: string;
  apellido: string;
  genero: Genero;
  edad: number;
  fechaNacimiento: string; // dd/mm/yyyy
  dni: string;
  fotoPath: string;
  obraSocialId: string;
  profesionalId: string;
  telefono: string;
  email: string;
  direccion: string;
  contactoEmergencia?: ContactoEmergencia;
  alergias: string[];
  medicacion: string[];
  observaciones: string;
  altaFecha: string; // ISO — fecha de alta del paciente (para KPI pacientes nuevos)
}

export interface OdontogramEntity {
  pacienteId: string;
  piezas: Tooth[]; // 32 piezas FDI
}

export interface AppointmentEntity {
  id: string;
  pacienteId: string;
  profesionalId: string;
  fecha: string; // ISO yyyy-mm-dd
  hora: string; // HH:mm
  duracionMin: number;
  tipoTratamientoId: string;
  tratamiento: string;
  estado: AppointmentStatus;
  notas: string;
}

export interface TreatmentPlanEntity {
  id: string;
  pacienteId: string;
  tipoId: string;
  profesionalId: string;
  nombre: string;
  etapasCompletadas: number;
  etapasTotales: number;
  costo: number;
  estado: TreatmentStatus;
  proximaFecha?: string; // ISO
  inicioFecha: string; // ISO
}

export interface ClinicalEventEntity {
  id: string;
  pacienteId: string;
  fecha: string; // ISO
  tipo: string;
  icono: string;
  titulo: string;
  profesionalId: string;
  descripcion: string;
}

export interface DocumentEntity {
  id: string;
  pacienteId: string;
  nombre: string;
  tipo: 'radiografia' | 'foto';
  thumbnailPath: string;
  fecha: string; // ISO
}

export interface BudgetEntity {
  id: string;
  numero: string;
  pacienteId: string;
  fechaEmision: string; // ISO
  vencimiento: string; // ISO
  items: { tipoId: string; concepto: string; monto: number }[];
  total: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'vencido';
}

export interface InvoiceEntity {
  id: string;
  numero: string;
  pacienteId: string;
  obraSocialId?: string;
  fechaEmision: string; // ISO
  items: { concepto: string; monto: number }[];
  total: number;
  estado: 'emitida' | 'pagada' | 'vencida' | 'anulada';
}

export interface AccountMovementEntity {
  id: string;
  pacienteId: string;
  fecha: string; // ISO
  concepto: string;
  monto: number;
  signo: 'cargo' | 'pago';
  medioPago?: string;
}

export interface NotificationEntity {
  id: string;
  tipo: 'turno' | 'pago' | 'cumpleanos' | 'tratamiento';
  icono: string;
  titulo: string;
  subtitulo: string;
  fecha: string; // ISO con hora
  leida: boolean;
  pacienteId?: string;
  ruta?: string;
}

/** Árbol de estado completo serializado bajo `edm:v1:state`. */
export interface StoreState {
  clinic: Clinic;
  professionals: Professional[];
  obrasSociales: ObraSocialEntity[];
  treatmentTypes: TreatmentType[];
  patients: PatientEntity[];
  odontograms: OdontogramEntity[];
  appointments: AppointmentEntity[];
  treatmentPlans: TreatmentPlanEntity[];
  clinicalEvents: ClinicalEventEntity[];
  documents: DocumentEntity[];
  budgets: BudgetEntity[];
  invoices: InvoiceEntity[];
  movements: AccountMovementEntity[];
  notifications: NotificationEntity[];
}

/** Entrada del manifest.json generado en build-time desde input/mockpeople. */
export interface ManifestEntry {
  path: string; // ruta runtime de la foto, ej. /imagenes/pacientes/mujeres/32.jpg
  genero: Genero;
  edad: number;
}
export interface SeedManifest {
  pacientes: ManifestEntry[];
  documentos: string[]; // pool de imágenes de documentos (puede estar vacío → placeholder controlado)
  generadoEn: string;
}
