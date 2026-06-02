import { Injectable, computed, inject, signal } from '@angular/core';
import {
  StoreState, PatientEntity, AppointmentEntity, TreatmentPlanEntity, AccountMovementEntity,
  NotificationEntity, AppointmentStatus, ToothState, PaymentStatus,
  // presentation shapes (contrato con los componentes de la cáscara)
  Patient, Appointment, TreatmentPlan, TreatmentType, ObraSocial, Tooth, ClinicalEvent,
  AccountMovement, DocumentItem, Invoice, Budget, Kpi, AppNotification, ToothProcedure,
} from '../models/models';
import { StorageService } from './storage.service';
import { ManifestLoader } from '../seed/manifest.loader';
import { generateSeed } from '../seed/seed.generator';
import { TREATMENT_TYPES as AR_TREATMENT_TYPES } from '../seed/ar-data';
import { Prng, SEED_ROOT } from '../seed/prng';
import { toothName } from '../seed/tooth-names';
import { parseIsoDate, formatShortDate, formatDmyDate } from '../../shared/date-format';

const TODAY = new Date(2026, 5, 1); // ancla coherente con el seed

/**
 * Store reactivo (ADR-3). Única fuente de verdad del runtime: mantiene el StoreState
 * completo en un signal en memoria, hidratado desde localStorage o desde el seed
 * determinista. Las pantallas leen SELECTORES que producen exactamente los shapes de
 * presentación que la cáscara visual ya espera (Patient/Appointment/...), de modo que
 * no haya que tocar templates. Las mutaciones pasan por métodos que actualizan el signal
 * y persisten (debounced; inmediato en confirmaciones — ADR-4). El estado de cuenta y
 * los KPIs son DERIVADOS (computed) → coherencia garantizada (UX-085, UX-066).
 */
@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly storage = inject(StorageService);
  private readonly manifestLoader = inject(ManifestLoader);

  /** Estado crudo. Empieza null hasta hidratar (SeedReadyGuard espera ready()). */
  private readonly _state = signal<StoreState | null>(null);
  readonly ready = computed(() => this._state() !== null);
  readonly degraded = this.storage.degraded;

  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  // ------------------------------------------------------------------ boot --
  /**
   * Hidrata el store: lee localStorage; si no hay estado válido, genera el seed desde
   * el manifest y persiste. Idempotente. Lo invoca el APP_INITIALIZER antes del 1er
   * render (cubre deep-linking: cualquier URL interna ya encuentra el store hidratado).
   */
  async hydrate(): Promise<void> {
    if (this._state()) return;
    this.storage.purgeOldVersions();
    const persisted = this.storage.read<StoreState>();
    if (persisted && this.isValid(persisted)) {
      this._state.set(persisted);
      return;
    }
    await this.reseed();
  }

  /** Regenera el seed determinista y lo persiste (Restablecer datos — UX-090). */
  async reseed(): Promise<void> {
    const manifest = await this.manifestLoader.load();
    const fresh = generateSeed(manifest);
    this._state.set(fresh);
    this.persistNow();
  }

  private isValid(s: StoreState): boolean {
    return Array.isArray(s.patients) && s.patients.length > 0 && Array.isArray(s.appointments);
  }

  // ---------------------------------------------------------- persistencia --
  private persistDebounced(): void {
    if (this.persistTimer) clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => this.persistNow(), 200);
  }
  private persistNow(): void {
    const s = this._state();
    if (s) this.storage.write(s);
  }
  private update(mutator: (s: StoreState) => StoreState, immediate = false): void {
    const cur = this._state();
    if (!cur) return;
    this._state.set(mutator(cur));
    immediate ? this.persistNow() : this.persistDebounced();
  }

  // --------------------------------------------------------- mapas de apoyo --
  readonly clinic = computed(() => this._state()?.clinic ?? null);
  readonly professionals = computed(() => this._state()?.professionals ?? []);
  readonly treatmentTypes = computed<TreatmentType[]>(() => this._state()?.treatmentTypes ?? []);
  readonly obrasSocialesRaw = computed(() => this._state()?.obrasSociales ?? []);

  private readonly profName = computed(() => {
    const map = new Map<string, string>();
    for (const p of this.professionals()) map.set(p.id, p.nombre);
    return map;
  });
  private readonly osName = computed(() => {
    const map = new Map<string, string>();
    for (const o of this.obrasSocialesRaw()) map.set(o.id, o.nombre);
    return map;
  });
  private readonly patientEntityById = computed(() => {
    const map = new Map<string, PatientEntity>();
    for (const p of this._state()?.patients ?? []) map.set(p.id, p);
    return map;
  });

  // ------------------------------------------------ saldo / estado de cuenta --
  /** Saldo del paciente = cargos − pagos. >0 ⇒ debe; ≤0 ⇒ al día / saldo a favor. */
  saldo(pacienteId: string): number {
    const movs = this._state()?.movements ?? [];
    let saldo = 0;
    for (const m of movs) {
      if (m.pacienteId !== pacienteId) continue;
      saldo += m.signo === 'cargo' ? m.monto : -m.monto;
    }
    return saldo;
  }
  /** Estado de cuenta DERIVADO del saldo + antigüedad de la deuda (UX-085). */
  estadoCuenta(pacienteId: string): PaymentStatus {
    const saldo = this.saldo(pacienteId);
    if (saldo <= 0) return 'al-dia';
    // vencido si hay un cargo impago de hace >45 días
    const movs = (this._state()?.movements ?? []).filter((m) => m.pacienteId === pacienteId);
    const cargoViejo = movs.some(
      (m) => m.signo === 'cargo' && this.daysAgo(m.fecha) > 45,
    );
    return cargoViejo ? 'vencido' : 'con-deuda';
  }

  // ---------------------------------------------- selectores de presentación --
  /** Próximo turno del paciente (futuro, confirmado/en-espera/atendiendo), formateado. */
  private proximoTurno(pacienteId: string): string | undefined {
    const futuros = (this._state()?.appointments ?? [])
      .filter((a) => a.pacienteId === pacienteId && a.fecha >= isoOf(TODAY) && a.estado !== 'cancelado' && a.estado !== 'terminado')
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    const t = futuros[0];
    return t ? `${formatShortDate(t.fecha)} · ${t.hora}` : undefined;
  }

  private toPatient = (p: PatientEntity): Patient => ({
    id: p.id,
    nombre: p.nombre,
    apellido: p.apellido,
    genero: p.genero,
    edad: p.edad,
    dni: p.dni,
    fotoPath: p.fotoPath,
    obraSocial: this.osName().get(p.obraSocialId) ?? '—',
    numeroAfiliado: afiliadoNumber(p),
    profesional: this.profName().get(p.profesionalId) ?? '—',
    telefono: p.telefono,
    email: p.email,
    direccion: p.direccion,
    fechaNacimiento: p.fechaNacimiento,
    contactoEmergencia: p.contactoEmergencia,
    proximoTurno: this.proximoTurno(p.id),
    estadoCuenta: this.estadoCuenta(p.id),
    alergias: p.alergias,
    medicacion: p.medicacion,
    observaciones: p.observaciones,
  });

  readonly patients = computed<Patient[]>(() =>
    (this._state()?.patients ?? []).map((p) => this.toPatient(p)),
  );

  patientById(id: string): Patient | undefined {
    const e = this.patientEntityById().get(id);
    return e ? this.toPatient(e) : undefined;
  }
  patientEntity(id: string): PatientEntity | undefined {
    return this.patientEntityById().get(id);
  }

  private toAppointment = (a: AppointmentEntity): Appointment => {
    const p = this.patientEntityById().get(a.pacienteId);
    return {
      id: a.id,
      pacienteId: a.pacienteId,
      pacienteNombre: p ? `${p.nombre} ${p.apellido}` : '—',
      pacienteFoto: p?.fotoPath ?? '',
      profesional: this.profName().get(a.profesionalId) ?? '—',
      profesionalId: a.profesionalId,
      fecha: a.fecha,
      hora: a.hora,
      duracionMin: a.duracionMin,
      tratamiento: a.tratamiento,
      tipoTratamientoId: a.tipoTratamientoId,
      estado: a.estado,
      notas: a.notas ?? '',
    };
  };

  readonly appointments = computed<Appointment[]>(() =>
    (this._state()?.appointments ?? []).map((a) => this.toAppointment(a)),
  );
  appointmentById(id: string): Appointment | undefined {
    const a = (this._state()?.appointments ?? []).find((x) => x.id === id);
    return a ? this.toAppointment(a) : undefined;
  }
  appointmentEntityById(id: string): AppointmentEntity | undefined {
    return (this._state()?.appointments ?? []).find((x) => x.id === id);
  }
  appointmentsOn(fechaIso: string): Appointment[] {
    return this.appointments()
      .filter((a) => a.fecha === fechaIso)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }
  /** Slots ocupados (HH:mm) de un profesional en una fecha (disponibilidad real UX-087). */
  occupiedSlots(profesionalId: string, fechaIso: string): Set<string> {
    const set = new Set<string>();
    for (const a of this._state()?.appointments ?? []) {
      if (a.profesionalId === profesionalId && a.fecha === fechaIso && a.estado !== 'cancelado') {
        set.add(a.hora);
      }
    }
    return set;
  }

  private toPlan = (t: TreatmentPlanEntity): TreatmentPlan => ({
    id: t.id,
    pacienteId: t.pacienteId,
    nombre: t.nombre,
    profesional: this.profName().get(t.profesionalId) ?? '—',
    etapasCompletadas: t.etapasCompletadas,
    etapasTotales: t.etapasTotales,
    progreso: t.etapasTotales ? Math.round((t.etapasCompletadas / t.etapasTotales) * 100) : 0,
    estado: t.estado,
    proximaFecha: t.proximaFecha ? formatShortDate(t.proximaFecha) : undefined,
    costo: t.costo,
    profesionalesFotos: [this.professionals().find((pr) => pr.id === t.profesionalId)?.fotoPath ?? ''].filter(Boolean),
  });

  readonly treatmentPlans = computed<TreatmentPlan[]>(() =>
    (this._state()?.treatmentPlans ?? []).map((t) => this.toPlan(t)),
  );
  plansOf(pacienteId: string): TreatmentPlan[] {
    return (this._state()?.treatmentPlans ?? [])
      .filter((t) => t.pacienteId === pacienteId)
      .map((t) => this.toPlan(t));
  }
  planById(planId: string): TreatmentPlan | undefined {
    const t = (this._state()?.treatmentPlans ?? []).find((x) => x.id === planId);
    return t ? this.toPlan(t) : undefined;
  }

  treatmentTypeById(id: string): TreatmentType | undefined {
    return this.treatmentTypes().find((t) => t.id === id);
  }
  /** Pasos y materiales detallados del tipo (desde el catálogo del seed). */
  treatmentTypeDetail(id: string): { pasos: string[]; materiales: string[] } {
    const seed = AR_TREATMENT_TYPES.find((t) => t.id === id);
    return { pasos: seed?.pasos ?? [], materiales: seed?.materiales ?? [] };
  }

  // odontograma
  teethOf(pacienteId: string): { top: Tooth[]; bottom: Tooth[] } {
    const odo = (this._state()?.odontograms ?? []).find((o) => o.pacienteId === pacienteId);
    const piezas = odo?.piezas ?? [];
    // top = universal 1..16 (cuadrantes 1 y 2); bottom = 17..32 (cuadrantes 4 y 3)
    const top = piezas.filter((t) => t.universal <= 16);
    const bottom = piezas.filter((t) => t.universal > 16);
    return { top, bottom };
  }
  toothOf(pacienteId: string, fdi: number): Tooth | undefined {
    const odo = (this._state()?.odontograms ?? []).find((o) => o.pacienteId === pacienteId);
    return odo?.piezas.find((t) => t.fdi === fdi);
  }
  /** Nombre clínico de la pieza por FDI (REQ-186). Fijo, no aleatorio. */
  toothName(fdi: number): string {
    return toothName(fdi);
  }
  /**
   * Historial de procedimientos SOBRE una pieza concreta (REQ-186/187).
   *
   * Derivado al VUELO del estado actual de la pieza (coherencia: una pieza "sana" o
   * "ausente" sin intervención → historial vacío; una obturación/prótesis/caries →
   * procedimientos plausibles que llevaron a ese estado). NO existe como entidad en el
   * StoreState ni se genera en `generateSeed`, por lo que NO consume el PRNG global de
   * negocio → cero impacto en volúmenes/saldos/turnos que QA asierta (lección It1).
   * El detalle/fecha se hacen DETERMINISTAS con un PRNG SEPARADO sembrado por
   * paciente+pieza (`SEED_ROOT ^ hash`), de modo que "Restablecer datos" devuelve el
   * mismo historial y la misma pieza siempre muestra lo mismo.
   */
  toothHistory(pacienteId: string, fdi: number): ToothProcedure[] {
    const tooth = this.toothOf(pacienteId, fdi);
    if (!tooth) return [];
    const plan = procedurePlan(tooth.estado);
    if (!plan.length) return []; // sana / ausente sin intervención → estado vacío (REQ-187)

    const profesional = this.headPatientProfessional(pacienteId);
    const rng = new Prng(SEED_ROOT ^ hashToothKey(pacienteId, fdi));
    // Procedimientos espaciados hacia atrás desde "hoy" (más reciente primero).
    let dias = rng.int(20, 120);
    return plan.map((descripcion) => {
      const fecha = addDaysTo(TODAY, -dias);
      dias += rng.int(60, 360); // cada paso anterior, más atrás en el tiempo
      return { fecha: formatDmyDate(isoOf(fecha)), descripcion, profesional };
    });
  }
  /** Profesional de cabecera del paciente (para atribuir procedimientos de la pieza). */
  private headPatientProfessional(pacienteId: string): string {
    const p = this.patientEntityById().get(pacienteId);
    return (p && this.profName().get(p.profesionalId)) || '—';
  }

  // historial
  eventsOf(pacienteId: string): ClinicalEvent[] {
    return (this._state()?.clinicalEvents ?? [])
      .filter((e) => e.pacienteId === pacienteId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .map((e) => ({
        id: e.id,
        fecha: e.fecha,
        fechaRelativa: relativeTime(e.fecha),
        tipo: e.tipo,
        icono: e.icono,
        titulo: e.titulo,
        profesional: this.profName().get(e.profesionalId) ?? '—',
        descripcion: e.descripcion,
      }));
  }
  eventById(pacienteId: string, eventId: string): ClinicalEvent | undefined {
    return this.eventsOf(pacienteId).find((e) => e.id === eventId);
  }

  // documentos
  documentsOf(pacienteId: string): DocumentItem[] {
    return (this._state()?.documents ?? [])
      .filter((d) => d.pacienteId === pacienteId)
      .map((d) => ({ id: d.id, nombre: d.nombre, tipo: d.tipo, thumbnailPath: d.thumbnailPath }));
  }

  // pagos / cuenta corriente
  movementsOf(pacienteId: string): AccountMovement[] {
    return (this._state()?.movements ?? [])
      .filter((m) => m.pacienteId === pacienteId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .map((m) => ({
        id: m.id,
        fecha: formatDmyDate(m.fecha),
        concepto: m.concepto,
        monto: m.monto,
        signo: m.signo,
        medioPago: m.medioPago,
      }));
  }
  /** Resumen de cuenta del paciente: facturado (cargos), cobrado (pagos), saldo. */
  accountSummary(pacienteId: string): { facturado: number; cobrado: number; saldo: number } {
    let facturado = 0;
    let cobrado = 0;
    for (const m of this._state()?.movements ?? []) {
      if (m.pacienteId !== pacienteId) continue;
      if (m.signo === 'cargo') facturado += m.monto;
      else cobrado += m.monto;
    }
    return { facturado, cobrado, saldo: facturado - cobrado };
  }

  // facturación
  readonly invoices = computed<Invoice[]>(() =>
    (this._state()?.invoices ?? [])
      .slice()
      .sort((a, b) => b.fechaEmision.localeCompare(a.fechaEmision))
      .map((i) => {
        const p = this.patientEntityById().get(i.pacienteId);
        return {
          id: i.id,
          numero: i.numero,
          pacienteNombre: p ? `${p.nombre} ${p.apellido}` : '—',
          fecha: formatDmyDate(i.fechaEmision),
          total: i.total,
          estado: i.estado,
        };
      }),
  );
  invoiceById(id: string): Invoice | undefined {
    return this.invoices().find((i) => i.id === id);
  }
  invoiceItems(id: string): { concepto: string; monto: number }[] {
    const inv = (this._state()?.invoices ?? []).find((x) => x.id === id);
    return inv ? inv.items.map((it) => ({ concepto: it.concepto, monto: it.monto })) : [];
  }

  readonly budgets = computed<Budget[]>(() =>
    (this._state()?.budgets ?? [])
      .slice()
      .sort((a, b) => b.fechaEmision.localeCompare(a.fechaEmision))
      .map((b) => {
        const p = this.patientEntityById().get(b.pacienteId);
        return {
          id: b.id,
          numero: b.numero,
          pacienteNombre: p ? `${p.nombre} ${p.apellido}` : '—',
          fecha: formatDmyDate(b.fechaEmision),
          total: b.total,
          estado: b.estado,
        };
      }),
  );
  budgetById(id: string): Budget | undefined {
    return this.budgets().find((b) => b.id === id);
  }
  /** Ítems desglosados del presupuesto (para el detalle). */
  budgetItems(id: string): { concepto: string; monto: number }[] {
    const b = (this._state()?.budgets ?? []).find((x) => x.id === id);
    return b ? b.items.map((it) => ({ concepto: it.concepto, monto: it.monto })) : [];
  }

  // obras sociales (cards) — pacientes activos, deuda agregada, último pago
  readonly obrasSociales = computed<ObraSocial[]>(() => {
    const s = this._state();
    if (!s) return [];
    return s.obrasSociales.map((os) => {
      const pacientes = s.patients.filter((p) => p.obraSocialId === os.id);
      const fotos = pacientes.slice(0, 5).map((p) => p.fotoPath);
      let deuda = 0;
      let ultimoPagoIso = '';
      for (const p of pacientes) {
        const saldo = this.saldo(p.id);
        if (saldo > 0) deuda += saldo;
      }
      for (const m of s.movements) {
        const pac = s.patients.find((p) => p.id === m.pacienteId);
        if (pac?.obraSocialId === os.id && m.signo === 'pago' && m.fecha > ultimoPagoIso) {
          ultimoPagoIso = m.fecha;
        }
      }
      return {
        id: os.id,
        nombre: os.nombre,
        pacientesActivos: pacientes.length,
        deuda,
        ultimoPago: ultimoPagoIso ? relativeTime(ultimoPagoIso) : '—',
        pacientesFotos: fotos,
      };
    });
  });
  obraSocialById(id: string): ObraSocial | undefined {
    return this.obrasSociales().find((o) => o.id === id);
  }
  patientsOfObraSocial(id: string): Patient[] {
    return (this._state()?.patients ?? [])
      .filter((p) => p.obraSocialId === id)
      .map((p) => this.toPatient(p));
  }

  // notificaciones
  readonly notifications = computed<AppNotification[]>(() =>
    (this._state()?.notifications ?? []).map((n) => ({
      id: n.id,
      tipo: n.tipo,
      icono: n.icono,
      titulo: n.titulo,
      subtitulo: n.subtitulo,
      fechaRelativa: relativeTime(n.fecha),
      leida: n.leida,
      pacienteFoto: n.pacienteId ? this.patientEntityById().get(n.pacienteId)?.fotoPath : undefined,
      ruta: n.ruta,
    })),
  );
  readonly unreadCount = computed(() => this.notifications().filter((n) => !n.leida).length);

  // ------------------------------------------------------------- KPIs (UX-066)
  readonly kpis = computed<Kpi[]>(() => {
    const s = this._state();
    if (!s) return [];
    const hoyIso = isoOf(TODAY);
    const desde30 = isoOf(addDaysTo(TODAY, -30));

    const nuevos = s.patients.filter((p) => p.altaFecha >= desde30).length;
    const turnosAtendidos = s.appointments.filter((a) => a.estado === 'terminado' && a.fecha >= desde30).length;
    const turnosTotalesMes = s.appointments.filter((a) => a.fecha >= desde30 && a.fecha <= hoyIso).length;
    const asistencia = turnosTotalesMes ? Math.round((turnosAtendidos / turnosTotalesMes) * 100) : 0;
    const tratamientosCompletados = s.treatmentPlans.filter((t) => t.estado === 'completado').length;
    const tratamientosActivos = s.treatmentPlans.length;
    const pctCompletados = tratamientosActivos ? Math.round((tratamientosCompletados / tratamientosActivos) * 100) : 0;

    let facturado = 0;
    let cobrado = 0;
    let deuda = 0;
    for (const inv of s.invoices) {
      if (inv.fechaEmision >= desde30 && inv.estado !== 'anulada') facturado += inv.total;
    }
    for (const m of s.movements) {
      if (m.signo === 'pago' && m.fecha >= desde30) cobrado += m.monto;
    }
    for (const p of s.patients) {
      const saldo = this.saldo(p.id);
      if (saldo > 0) deuda += saldo;
    }
    const pctCobrado = facturado ? Math.min(100, Math.round((cobrado / facturado) * 100)) : 0;

    return [
      { id: 'kpi-01', label: 'Pacientes nuevos', valor: String(nuevos), icono: 'user-plus', detalle: 'En los últimos 30 días' },
      { id: 'kpi-02', label: 'Turnos atendidos', valor: String(turnosAtendidos), icono: 'calendar-check', porcentaje: asistencia, detalle: `${asistencia}% de asistencia` },
      { id: 'kpi-03', label: 'Tratamientos completados', valor: String(tratamientosCompletados), icono: 'check-circle', porcentaje: pctCompletados, detalle: `${pctCompletados}% del total` },
      { id: 'kpi-04', label: 'Ingresos facturados', valor: compactArs(facturado), icono: 'chart-line', detalle: 'Últimos 30 días' },
      { id: 'kpi-05', label: 'Cobrado', valor: compactArs(cobrado), icono: 'wallet', porcentaje: pctCobrado, detalle: `${pctCobrado}% de lo facturado` },
      { id: 'kpi-06', label: 'Deuda', valor: compactArs(deuda), icono: 'receipt', detalle: 'Saldo pendiente total' },
    ];
  });

  /** Datos crudos para reportes detallados (gráficos calculados del estado, UX-066). */
  reportData() {
    const s = this._state();
    if (!s) return null;
    return {
      patients: s.patients,
      appointments: s.appointments,
      treatmentPlans: s.treatmentPlans,
      invoices: s.invoices,
      movements: s.movements,
      professionals: s.professionals,
      obrasSociales: s.obrasSociales,
      treatmentTypes: s.treatmentTypes,
    };
  }

  // =====================================================================
  // MUTACIONES (persisten — UX-084). Inmediatas en confirmaciones.
  // =====================================================================

  /** Registra un pago en la cuenta corriente (DEMO-016 / UX-026/085). Recalcula saldo. */
  registrarPago(pacienteId: string, monto: number, concepto: string, medioPago: string): void {
    const id = `mv-${Date.now().toString(36)}`;
    const mov: AccountMovementEntity = {
      id,
      pacienteId,
      fecha: isoOf(TODAY),
      concepto: concepto?.trim() ? concepto.trim() : `Pago — ${medioPago}`,
      monto,
      signo: 'pago',
      medioPago,
    };
    this.update((s) => ({ ...s, movements: [mov, ...s.movements] }), true);
  }

  /** Crea un turno (DEMO-015 / UX-020). Persiste y devuelve el id nuevo. */
  crearTurno(input: {
    pacienteId: string;
    profesionalId: string;
    fecha: string;
    hora: string;
    duracionMin: number;
    tipoTratamientoId: string;
    notas?: string;
  }): string {
    const id = `tur-${Date.now().toString(36)}`;
    const tipo = this.treatmentTypeById(input.tipoTratamientoId);
    const appt: AppointmentEntity = {
      id,
      pacienteId: input.pacienteId,
      profesionalId: input.profesionalId,
      fecha: input.fecha,
      hora: input.hora,
      duracionMin: input.duracionMin,
      tipoTratamientoId: input.tipoTratamientoId,
      tratamiento: tipo?.nombre ?? 'Consulta',
      estado: 'confirmado',
      notas: input.notas ?? '',
    };
    this.update((s) => ({ ...s, appointments: [...s.appointments, appt] }), true);
    return id;
  }

  /** Avanza el estado del turno al siguiente paso lógico (UX-022). Persiste. */
  avanzarTurno(id: string): AppointmentStatus | null {
    const next: Partial<Record<AppointmentStatus, AppointmentStatus>> = {
      'en-espera': 'confirmado',
      'confirmado': 'atendiendo',
      'atendiendo': 'terminado',
    };
    let nuevo: AppointmentStatus | null = null;
    this.update((s) => ({
      ...s,
      appointments: s.appointments.map((a) => {
        if (a.id !== id) return a;
        const n = next[a.estado];
        if (!n) return a;
        nuevo = n;
        return { ...a, estado: n };
      }),
    }), true);
    return nuevo;
  }

  /** Cancela un turno (UX-023). Persiste. */
  cancelarTurno(id: string): void {
    this.update((s) => ({
      ...s,
      appointments: s.appointments.map((a) => (a.id === id ? { ...a, estado: 'cancelado' as AppointmentStatus } : a)),
    }), true);
  }

  /**
   * Reagenda un turno a nueva fecha/hora (UX-023b) y genera el aviso de WhatsApp al
   * paciente (REQ-089). Persiste fecha/hora + una notificación real que aparece en la
   * campana (sin lenguaje de simulación). El id usa timestamp → no toca el PRNG del seed.
   */
  reagendarTurno(id: string, fecha: string, hora: string): void {
    this.update((s) => {
      const turno = s.appointments.find((a) => a.id === id);
      const paciente = turno ? s.patients.find((p) => p.id === turno.pacienteId) : undefined;
      const appointments = s.appointments.map((a) => (a.id === id ? { ...a, fecha, hora } : a));
      if (!turno) return { ...s, appointments };
      const nombre = paciente ? `${paciente.nombre} ${paciente.apellido}` : 'el paciente';
      const aviso: NotificationEntity = {
        id: `not-${Date.now().toString(36)}`,
        tipo: 'turno',
        icono: 'chat-circle-dots',
        titulo: 'Aviso de WhatsApp enviado',
        subtitulo: `${nombre} fue notificado del nuevo horario: ${formatShortDate(fecha)} · ${hora}`,
        fecha: `${isoOf(TODAY)}T${hora}`,
        leida: false,
        pacienteId: turno.pacienteId,
        ruta: `/agenda/${id}`,
      };
      return { ...s, appointments, notifications: [aviso, ...s.notifications] };
    }, true);
  }

  /** Cambia el estado de una pieza del odontograma (UX-028/086). Persiste. */
  setToothState(pacienteId: string, fdi: number, estado: ToothState): void {
    this.update((s) => ({
      ...s,
      odontograms: s.odontograms.map((o) =>
        o.pacienteId !== pacienteId
          ? o
          : { ...o, piezas: o.piezas.map((t) => (t.fdi === fdi ? { ...t, estado } : t)) },
      ),
    }), true);
  }

  /** Crea un presupuesto (UX-029). Persiste y devuelve el id nuevo. */
  crearPresupuesto(pacienteId: string, tipoIds: string[]): string {
    const id = `pre-${Date.now().toString(36)}`;
    const items = tipoIds.map((tid) => {
      const t = this.treatmentTypeById(tid);
      return { tipoId: tid, concepto: t?.nombre ?? 'Tratamiento', monto: t?.costoRef ?? 0 };
    });
    const total = items.reduce((s, it) => s + it.monto, 0);
    const num = `P-${String(Date.now() % 100000).padStart(5, '0')}`;
    const emision = isoOf(TODAY);
    const venc = isoOf(addDaysTo(TODAY, 30));
    const budget = {
      id, numero: num, pacienteId,
      fechaEmision: emision, vencimiento: venc,
      items, total, estado: 'pendiente' as const,
    };
    this.update((s) => ({ ...s, budgets: [budget, ...s.budgets] }), true);
    return id;
  }

  /** Aprueba / rechaza un presupuesto (UX-030). Persiste. */
  setBudgetEstado(id: string, estado: Budget['estado']): void {
    this.update((s) => ({
      ...s,
      budgets: s.budgets.map((b) => (b.id === id ? { ...b, estado } : b)),
    }), true);
  }

  /** Crea un paciente (UX-024). Persiste y devuelve el id nuevo. */
  crearPaciente(input: Partial<PatientEntity> & { nombre: string; apellido: string }): string {
    const id = `pac-${Date.now().toString(36)}`;
    const nuevo: PatientEntity = {
      id,
      nombre: input.nombre,
      apellido: input.apellido,
      genero: input.genero ?? 'mujer',
      edad: input.edad ?? 0,
      fechaNacimiento: input.fechaNacimiento ?? '',
      dni: input.dni ?? '',
      fotoPath: input.fotoPath ?? '',
      obraSocialId: input.obraSocialId ?? 'os-particular',
      profesionalId: input.profesionalId ?? 'prof-01',
      telefono: input.telefono ?? '',
      email: input.email ?? '',
      direccion: input.direccion ?? '',
      contactoEmergencia: input.contactoEmergencia,
      alergias: input.alergias ?? [],
      medicacion: input.medicacion ?? [],
      observaciones: input.observaciones ?? '',
      altaFecha: isoOf(TODAY),
    };
    // odontograma nuevo → todas sana (UX-047)
    const piezas: Tooth[] = freshOdontogram();
    this.update((s) => ({
      ...s,
      patients: [...s.patients, nuevo],
      odontograms: [...s.odontograms, { pacienteId: id, piezas }],
    }), true);
    return id;
  }

  /** Edita campos de un paciente (UX-025). Persiste. */
  editarPaciente(id: string, cambios: Partial<PatientEntity>): void {
    this.update((s) => ({
      ...s,
      patients: s.patients.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
    }), true);
  }

  /** Elimina un paciente (UX-033). Persiste. */
  eliminarPaciente(id: string): void {
    this.update((s) => ({
      ...s,
      patients: s.patients.filter((p) => p.id !== id),
      odontograms: s.odontograms.filter((o) => o.pacienteId !== id),
    }), true);
  }

  /** Marca una notificación como leída. */
  marcarNotificacionLeida(id: string): void {
    this.update((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, leida: true } : n)),
    }));
  }

  // ----------------------------------------------------------- utilidades --
  private daysAgo(iso: string): number {
    const d = parseIsoDate(iso);
    return Math.floor((TODAY.getTime() - d.getTime()) / 86_400_000);
  }
}

// ============================ helpers de fecha/formato ============================
function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function addDaysTo(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
/** Fecha relativa simple anclada a TODAY (es-AR). */
function relativeTime(iso: string): string {
  const d = parseIsoDate(iso.split('T')[0]);
  const diff = Math.floor((TODAY.getTime() - d.getTime()) / 86_400_000);
  if (diff <= 0) return 'hoy';
  if (diff === 1) return 'ayer';
  if (diff < 7) return `hace ${diff} días`;
  if (diff < 14) return 'hace 1 semana';
  if (diff < 30) return `hace ${Math.floor(diff / 7)} semanas`;
  if (diff < 60) return 'hace 1 mes';
  if (diff < 365) return `hace ${Math.floor(diff / 30)} meses`;
  return `hace ${Math.floor(diff / 365)} año${Math.floor(diff / 365) > 1 ? 's' : ''}`;
}
/** Monto ARS compacto para KPIs: 4.820.000 → "$ 4.82 M"; 880.000 → "$ 880 K". */
function compactArs(value: number): string {
  if (value >= 1_000_000) return `$ ${(value / 1_000_000).toFixed(2)} M`;
  if (value >= 1_000) return `$ ${Math.round(value / 1_000)} K`;
  return `$ ${value}`;
}
/**
 * Nº de afiliado de la obra social (REQ-128), DETERMINISTA y derivado del DNI del
 * paciente — NO se almacena y NO consume el PRNG global de negocio. Particular no tiene
 * afiliado. El formato (12 dígitos en bloques) imita una credencial de obra social.
 */
function afiliadoNumber(p: PatientEntity): string {
  if (p.obraSocialId === 'os-particular') return '—';
  const digits = p.dni.replace(/\D/g, '').padStart(8, '0');
  const rng = new Prng(SEED_ROOT ^ hashString(p.id + p.obraSocialId));
  const sufijo = String(rng.int(0, 9999)).padStart(4, '0');
  const full = (digits.slice(-8) + sufijo).padStart(12, '0');
  return `${full.slice(0, 4)} ${full.slice(4, 8)} ${full.slice(8, 12)}`;
}

/** Hash estable de un string a entero 32-bit sin signo (semilla derivada de PRNG). */
function hashString(s: string): number {
  let h = 0x811c_9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x0100_0193);
  }
  return h >>> 0;
}
/** Semilla derivada por paciente+pieza para el historial determinista de la pieza. */
function hashToothKey(pacienteId: string, fdi: number): number {
  return hashString(`${pacienteId}#${fdi}`);
}
/**
 * Procedimientos plausibles (más reciente primero) que llevan al estado actual de la
 * pieza. Coherencia clínica: una obturación tuvo diagnóstico + restauración; una
 * prótesis, una extracción + colocación; etc. "sana"/"ausente" sin intervención → [].
 */
function procedurePlan(estado: ToothState): string[] {
  switch (estado) {
    case 'caries':
      return ['Diagnóstico de caries en control', 'Radiografía periapical de la pieza'];
    case 'obturacion':
      return ['Obturación con resina compuesta', 'Remoción de tejido cariado y aislamiento', 'Diagnóstico de caries en radiografía'];
    case 'en-tratamiento':
      return ['Sesión de tratamiento de conducto', 'Apertura cameral y diagnóstico endodóntico', 'Radiografía periapical de la pieza'];
    case 'protesis':
      return ['Colocación de prótesis / corona', 'Toma de impresión y preparación', 'Extracción de la pieza'];
    case 'ausente':
      return []; // ausencia por evolución natural (no erupcionada / pérdida no documentada)
    default:
      return []; // sana
  }
}

/** Odontograma nuevo: 32 piezas FDI, todas "sana" (paciente nuevo — UX-047). */
function freshOdontogram(): Tooth[] {
  const piezas: Tooth[] = [];
  const orden = [
    { cuad: 1, nums: [8, 7, 6, 5, 4, 3, 2, 1] },
    { cuad: 2, nums: [1, 2, 3, 4, 5, 6, 7, 8] },
    { cuad: 4, nums: [8, 7, 6, 5, 4, 3, 2, 1] },
    { cuad: 3, nums: [1, 2, 3, 4, 5, 6, 7, 8] },
  ];
  let universal = 1;
  for (const { cuad, nums } of orden) {
    for (const p of nums) piezas.push({ fdi: cuad * 10 + p, universal: universal++, estado: 'sana' });
  }
  return piezas;
}
