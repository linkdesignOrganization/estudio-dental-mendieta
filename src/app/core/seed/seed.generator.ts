import {
  StoreState, SeedManifest, PatientEntity, Tooth, OdontogramEntity,
  AppointmentEntity, AppointmentStatus, TreatmentPlanEntity, TreatmentStatus,
  ClinicalEventEntity, DocumentEntity, BudgetEntity, InvoiceEntity,
  AccountMovementEntity, NotificationEntity, Professional, ObraSocialEntity,
  TreatmentType,
} from '../models/models';
import { Prng, SEED_ROOT } from './prng';
import {
  APELLIDOS, NOMBRES_F, NOMBRES_M, franjaPorEdad, OBRAS_SOCIALES, PROFESSIONALS,
  TREATMENT_TYPES, DOCUMENT_NAMES, MEDIOS_PAGO, CALLES, EVENT_TYPES, ProfessionalSeed,
} from './ar-data';

/**
 * Generador determinista del seed completo (architecture.md "Carga del Seed Dinámico",
 * UX-060..067). Toda la aleatoriedad pasa por un PRNG de semilla fija → mismo manifest
 * siempre produce el mismo estado (ADR-8), por lo que "Restablecer datos" devuelve
 * exactamente el estado original. Coherencia por edad en odontograma, historial,
 * tratamientos y facturación. Histórico ≥60 días, montos en ARS.
 *
 * "Hoy" se ancla a una fecha fija para que los estados temporales (turnos pasados/
 * futuros, vencimientos) sean reproducibles y coherentes con la demo.
 */
const TODAY = new Date(2026, 5, 1); // 2026-06-01 (mes 0-indexado)

// ---------- helpers de fecha (ISO yyyy-mm-dd) ----------
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
/** Quita acentos/diacríticos para construir emails ASCII (José → jose). */
function stripDiacritics(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// ---------- catálogos fijos ----------
function buildProfessionals(manifestPhotos: string[]): Professional[] {
  return PROFESSIONALS.map((p: ProfessionalSeed) => ({
    id: p.id,
    nombre: p.nombre,
    especialidad: p.especialidad,
    aniosExperiencia: p.aniosExperiencia,
    fotoPath: manifestPhotos[p.fotoIdx % manifestPhotos.length] ?? '',
  }));
}
function buildObrasSociales(): ObraSocialEntity[] {
  return OBRAS_SOCIALES.map((o) => ({ id: o.id, nombre: o.nombre }));
}
function buildTreatmentTypes(): TreatmentType[] {
  return TREATMENT_TYPES.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    descripcion: t.descripcion,
    icono: t.icono,
    costoRef: t.costoRef,
    duracionEst: t.duracionEst,
  }));
}

// ---------- pacientes ----------
function pickObraSocial(rng: Prng, edad: number): string {
  // Mayores → mucho PAMI; el resto distribución típica ponderada.
  if (edad >= 66 && rng.chance(0.7)) return 'os-pami';
  const total = OBRAS_SOCIALES.reduce((s, o) => s + o.peso, 0);
  let r = rng.next() * total;
  for (const o of OBRAS_SOCIALES) {
    r -= o.peso;
    if (r <= 0) return o.id;
  }
  return OBRAS_SOCIALES[0].id;
}

function genDni(rng: Prng, edad: number): string {
  // DNI argentino: cuanto más viejo, menor número. Rango plausible por edad.
  let base: number;
  if (edad <= 5) base = rng.int(54_000_000, 57_000_000);
  else if (edad <= 12) base = rng.int(50_000_000, 54_000_000);
  else if (edad <= 25) base = rng.int(40_000_000, 48_000_000);
  else if (edad <= 40) base = rng.int(27_000_000, 38_000_000);
  else if (edad <= 60) base = rng.int(14_000_000, 26_000_000);
  else base = rng.int(5_000_000, 13_000_000);
  const s = String(base);
  return `${s.slice(0, s.length - 6)}.${s.slice(-6, -3)}.${s.slice(-3)}`;
}

const ALERGIAS_POOL = ['Penicilina', 'Látex', 'Ibuprofeno', 'Aspirina', 'Codeína', 'Anestésicos locales', 'Yodo'];
const MEDICACION_POOL = [
  'Enalapril 10mg', 'Losartán 50mg', 'Metformina 850mg', 'Atorvastatina 20mg', 'Levotiroxina 75mcg',
  'Amlodipina 5mg', 'Aspirineta 100mg', 'Omeprazol 20mg', 'Bisoprolol 5mg', 'Candesartán 8mg', 'Furosemida 40mg',
];
const OBSERVACIONES_POOL = [
  'Paciente con buena higiene bucal. Control semestral.', 'Antecedente de bruxismo. Usa placa de descanso.',
  'En seguimiento de tratamiento activo.', 'Primera consulta reciente. Buena predisposición.',
  'Control periódico sin novedades.', 'Sensibilidad dentaria reportada en zona posterior.',
  '', '', '',
];

function genBirthDate(rng: Prng, edad: number): { fechaNacimiento: string } {
  const year = TODAY.getFullYear() - edad;
  const month = rng.int(1, 12);
  const day = rng.int(1, 28);
  return { fechaNacimiento: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}` };
}

function buildPatients(rng: Prng, manifest: SeedManifest): PatientEntity[] {
  const apellidosBaraja = rng.shuffle(APELLIDOS);
  return manifest.pacientes.map((m, i): PatientEntity => {
    const franja = franjaPorEdad(m.edad);
    const pool = m.genero === 'mujer' ? NOMBRES_F[franja] : NOMBRES_M[franja];
    const nombre = pool[(i * 7 + m.edad) % pool.length];
    const apellido = apellidosBaraja[i % apellidosBaraja.length];
    const { fechaNacimiento } = genBirthDate(rng, m.edad);

    const esMenor = m.edad < 12;
    const alergias = !esMenor && rng.chance(0.22) ? [rng.pick(ALERGIAS_POOL)] : [];
    const medicacion = m.edad >= 45 && rng.chance(0.55)
      ? rng.sample(MEDICACION_POOL, rng.int(1, 2))
      : [];

    const calle = rng.pick(CALLES);
    const altura = rng.int(100, 4800);
    const tel = `+54 11 ${rng.int(4000, 6999)}-${String(rng.int(0, 9999)).padStart(4, '0')}`;
    const emailBase = esMenor ? `familia.${apellido}` : `${nombre}.${apellido}`;
    const email = stripDiacritics(emailBase).replace(/\s+/g, '') + '@correo.com';

    // Alta: nuevos (≤30 días) para alimentar el KPI "pacientes nuevos del mes", el resto repartido en 2 años.
    const altaDias = rng.chance(0.22) ? rng.int(1, 30) : rng.int(40, 720);

    return {
      id: `pac-${String(i + 1).padStart(3, '0')}`,
      nombre,
      apellido,
      genero: m.genero,
      edad: m.edad,
      fechaNacimiento,
      dni: genDni(rng, m.edad),
      fotoPath: m.path,
      obraSocialId: pickObraSocial(rng, m.edad),
      profesionalId: esMenor ? 'prof-03' : rng.pick(PROFESSIONALS).id, // niños → odontopediatra
      telefono: tel,
      email,
      direccion: `${calle} ${altura}, CABA`,
      contactoEmergencia: rng.chance(0.5)
        ? { nombre: `${rng.pick(NOMBRES_F.adulta)} ${apellido}`, relacion: rng.pick(['Cónyuge', 'Hijo/a', 'Madre', 'Padre', 'Hermano/a']), telefono: `+54 11 ${rng.int(4000, 6999)}-${String(rng.int(0, 9999)).padStart(4, '0')}` }
        : undefined,
      alergias,
      medicacion,
      observaciones: rng.pick(OBSERVACIONES_POOL),
      altaFecha: isoDate(addDays(TODAY, -altaDias)),
    };
  });
}

// ---------- odontograma coherente con edad ----------
function buildOdontogram(rng: Prng, pac: PatientEntity): OdontogramEntity {
  const piezas: Tooth[] = [];
  // FDI: cuadrante 1 (11-18), 2 (21-28), 4 (41-48), 3 (31-38). Universal 1-32.
  const orden: Array<{ cuad: number; piezasNum: number[] }> = [
    { cuad: 1, piezasNum: [8, 7, 6, 5, 4, 3, 2, 1] },
    { cuad: 2, piezasNum: [1, 2, 3, 4, 5, 6, 7, 8] },
    { cuad: 4, piezasNum: [8, 7, 6, 5, 4, 3, 2, 1] },
    { cuad: 3, piezasNum: [1, 2, 3, 4, 5, 6, 7, 8] },
  ];
  let universal = 1;
  for (const { cuad, piezasNum } of orden) {
    for (const p of piezasNum) {
      const fdi = cuad * 10 + p;
      piezas.push({ fdi, universal: universal++, estado: 'sana' });
    }
  }

  // Coherencia por edad:
  if (pac.edad < 6) {
    // muy pequeños: piezas posteriores aún sin erupcionar → las marcamos ausentes (sin dentición completa)
    for (const t of piezas) {
      const p = t.fdi % 10;
      if (p >= 4) t.estado = 'ausente'; // premolares/molares no presentes
    }
    return { pacienteId: pac.id, piezas };
  }

  if (pac.edad >= 70) {
    // adultos mayores: ausencias y prótesis frecuentes
    const ausentesCount = rng.int(4, 10);
    const candidatos = rng.sample(piezas.filter((t) => t.fdi % 10 >= 5), ausentesCount);
    for (const t of candidatos) t.estado = rng.chance(0.5) ? 'ausente' : 'protesis';
    // algunas restauraciones
    for (const t of rng.sample(piezas.filter((t) => t.estado === 'sana'), rng.int(2, 5))) {
      t.estado = 'obturacion';
    }
    return { pacienteId: pac.id, piezas };
  }

  // adultos/jóvenes: mezcla sano/tratado/activo proporcional a la edad
  const tratadas = Math.min(12, Math.max(0, Math.round((pac.edad - 8) / 6)));
  const candidatos = rng.sample(piezas, tratadas);
  for (const t of candidatos) {
    const r = rng.next();
    if (r < 0.4) t.estado = 'obturacion';
    else if (r < 0.62) t.estado = 'caries';
    else if (r < 0.78) t.estado = 'en-tratamiento';
    else if (r < 0.9 && pac.edad >= 30) t.estado = 'protesis';
    else if (pac.edad >= 25) t.estado = 'ausente';
    else t.estado = 'caries';
  }
  return { pacienteId: pac.id, piezas };
}

// ---------- tratamientos (planes) ----------
function planNombre(tipo: TreatmentType, rng: Prng): string {
  // a veces referencia una pieza concreta para realismo
  const conPieza = ['tt-03', 'tt-04', 'tt-05', 'tt-06', 'tt-07', 'tt-11'];
  if (conPieza.includes(tipo.id) && rng.chance(0.6)) {
    const fdi = rng.pick([16, 26, 36, 46, 14, 24, 34, 44, 11, 21]);
    return `${tipo.nombre} — pieza ${fdi}`;
  }
  return tipo.nombre;
}

function buildTreatmentPlans(rng: Prng, patients: PatientEntity[]): TreatmentPlanEntity[] {
  const plans: TreatmentPlanEntity[] = [];
  let seq = 1;
  for (const pac of patients) {
    // niños chicos: pocos o ningún plan; adultos: 1-3
    let count: number;
    if (pac.edad < 6) count = rng.chance(0.3) ? 1 : 0;
    else if (pac.edad < 14) count = rng.int(0, 1);
    else count = rng.int(1, 3);

    const tiposValidos = TREATMENT_TYPES.filter((t) => pac.edad >= t.edadMin && pac.edad <= t.edadMax);
    const elegidos = rng.sample(tiposValidos, count);
    for (const tipo of elegidos) {
      const total = tipo.etapasTipicas;
      // estado coherente
      const r = rng.next();
      let estado: TreatmentStatus;
      let completadas: number;
      if (r < 0.3) { estado = 'completado'; completadas = total; }
      else if (r < 0.65) { estado = 'en-curso'; completadas = total > 1 ? rng.int(1, total - 1) : 0; }
      else if (r < 0.85) { estado = 'atrasado'; completadas = total > 1 ? rng.int(1, total - 1) : 0; }
      else { estado = 'en-pausa'; completadas = total > 2 ? rng.int(1, Math.floor(total / 2)) : 1; }

      const inicioDias = rng.int(15, 400);
      const proximaDias = estado === 'completado' ? undefined : rng.int(1, 30);
      plans.push({
        id: `tra-${String(seq++).padStart(3, '0')}`,
        pacienteId: pac.id,
        tipoId: tipo.id,
        profesionalId: pac.profesionalId,
        nombre: planNombre(tipo, rng),
        etapasCompletadas: completadas,
        etapasTotales: total,
        costo: tipo.costoRef,
        estado,
        proximaFecha: proximaDias != null ? isoDate(addDays(TODAY, proximaDias)) : undefined,
        inicioFecha: isoDate(addDays(TODAY, -inicioDias)),
      });
    }
  }
  // garantía de volumen ≥40: si faltan, agrega planes a adultos al azar
  while (plans.length < 44) {
    const pac = rng.pick(patients.filter((p) => p.edad >= 18));
    const tipo = rng.pick(TREATMENT_TYPES.filter((t) => pac.edad >= t.edadMin && pac.edad <= t.edadMax));
    plans.push({
      id: `tra-${String(seq++).padStart(3, '0')}`,
      pacienteId: pac.id, tipoId: tipo.id, profesionalId: pac.profesionalId,
      nombre: planNombre(tipo, rng),
      etapasCompletadas: tipo.etapasTipicas, etapasTotales: tipo.etapasTipicas,
      costo: tipo.costoRef, estado: 'completado',
      inicioFecha: isoDate(addDays(TODAY, -rng.int(30, 500))),
    });
  }
  return plans;
}

// ---------- historial clínico ----------
function buildClinicalEvents(rng: Prng, patients: PatientEntity[]): ClinicalEventEntity[] {
  const events: ClinicalEventEntity[] = [];
  let seq = 1;
  for (const pac of patients) {
    // variable por edad: niños/nuevos pocos eventos; antiguos muchos
    let count: number;
    if (pac.edad < 5) count = rng.int(0, 2);
    else if (pac.edad < 18) count = rng.int(1, 4);
    else count = rng.int(2, 8);

    const usados = new Set<number>();
    for (let k = 0; k < count; k++) {
      const ev = rng.pick(EVENT_TYPES);
      // espaciados hacia atrás; histórico hasta ~2 años, asegura ≥60 días de cobertura global
      let dias = rng.int(3, 720);
      while (usados.has(dias)) dias = rng.int(3, 720);
      usados.add(dias);
      const fecha = addDays(TODAY, -dias);
      events.push({
        id: `ev-${String(seq++).padStart(3, '0')}`,
        pacienteId: pac.id,
        fecha: isoDate(fecha),
        tipo: ev.tipo,
        icono: ev.icono,
        titulo: eventTitle(ev.tipo, rng),
        profesionalId: pac.profesionalId,
        descripcion: eventDesc(ev.tipo, rng),
      });
    }
  }
  return events;
}
function eventTitle(tipo: string, rng: Prng): string {
  const map: Record<string, string[]> = {
    Consulta: ['Consulta de evaluación', 'Primera consulta', 'Consulta de urgencia menor'],
    Control: ['Control semestral', 'Control de tratamiento', 'Control post-operatorio'],
    Limpieza: ['Profilaxis y flúor', 'Limpieza y detartraje', 'Higiene profesional'],
    Tratamiento: ['Obturación con resina', 'Sesión de tratamiento', 'Procedimiento clínico'],
    Radiografía: ['Radiografía panorámica', 'Radiografía periapical', 'Estudio radiográfico'],
    Urgencia: ['Atención de urgencia', 'Dolor agudo — atención', 'Urgencia odontológica'],
  };
  return rng.pick(map[tipo] ?? ['Atención odontológica']);
}
function eventDesc(tipo: string, rng: Prng): string {
  const map: Record<string, string[]> = {
    Consulta: ['Examen clínico completo. Se elabora plan de tratamiento.', 'Anamnesis y revisión intraoral sin hallazgos de urgencia.'],
    Control: ['Evolución favorable. Se programa próxima visita.', 'Control de rutina. Higiene adecuada.'],
    Limpieza: ['Remoción de placa y sarro. Aplicación tópica de flúor.', 'Detartraje completo y pulido coronario.'],
    Tratamiento: ['Restauración con resina compuesta. Anestesia local sin complicaciones.', 'Sesión completada según plan. Buena tolerancia.'],
    Radiografía: ['Estudio radiográfico para diagnóstico y seguimiento.', 'Imagen de control. Sin hallazgos significativos.'],
    Urgencia: ['Manejo del cuadro agudo. Indicaciones y medicación.', 'Atención de urgencia resuelta. Se cita para control.'],
  };
  return rng.pick(map[tipo] ?? ['Atención odontológica registrada.']);
}

// ---------- documentos ----------
function buildDocuments(rng: Prng, patients: PatientEntity[], manifest: SeedManifest): DocumentEntity[] {
  const docs: DocumentEntity[] = [];
  let seq = 1;
  const pool = manifest.documentos; // puede estar vacío → thumbnail '' → placeholder controlado (UX-048)
  for (const pac of patients) {
    // distribuir 40-60 documentos en total; algunos pacientes sin documentos (edge case)
    let count: number;
    if (pac.edad < 5) count = rng.chance(0.5) ? 0 : 1;
    else count = rng.int(0, 3);
    for (let k = 0; k < count; k++) {
      const esRadio = rng.chance(0.65);
      const tipo: 'radiografia' | 'foto' = esRadio ? 'radiografia' : 'foto';
      const nombres = DOCUMENT_NAMES[tipo];
      docs.push({
        id: `doc-${String(seq++).padStart(3, '0')}`,
        pacienteId: pac.id,
        nombre: rng.pick(nombres),
        tipo,
        thumbnailPath: pool.length ? rng.pick(pool) : '',
        fecha: isoDate(addDays(TODAY, -rng.int(5, 600))),
      });
    }
  }
  // garantía 40-60
  while (docs.length < 44) {
    const pac = rng.pick(patients.filter((p) => p.edad >= 6));
    const esRadio = rng.chance(0.65);
    const tipo: 'radiografia' | 'foto' = esRadio ? 'radiografia' : 'foto';
    docs.push({
      id: `doc-${String(seq++).padStart(3, '0')}`, pacienteId: pac.id,
      nombre: rng.pick(DOCUMENT_NAMES[tipo]), tipo,
      thumbnailPath: pool.length ? rng.pick(pool) : '',
      fecha: isoDate(addDays(TODAY, -rng.int(5, 600))),
    });
  }
  return docs;
}

// ---------- facturación: presupuestos, facturas, movimientos ----------
function buildBudgets(rng: Prng, patients: PatientEntity[]): BudgetEntity[] {
  const budgets: BudgetEntity[] = [];
  let seq = 118; // numeración tipo P-00118
  const adultos = patients.filter((p) => p.edad >= 14);
  const count = Math.max(22, Math.floor(adultos.length * 0.8));
  for (let i = 0; i < count; i++) {
    const pac = rng.pick(adultos);
    const tiposValidos = TREATMENT_TYPES.filter((t) => pac.edad >= t.edadMin && pac.edad <= t.edadMax);
    const items = rng.sample(tiposValidos, rng.int(1, 3)).map((t) => ({
      tipoId: t.id, concepto: t.nombre, monto: t.costoRef,
    }));
    const total = items.reduce((s, it) => s + it.monto, 0);
    const emisionDias = rng.int(2, 75);
    const emision = addDays(TODAY, -emisionDias);
    const vencimiento = addDays(emision, 30);
    // estado coherente con vencimiento
    let estado: BudgetEntity['estado'];
    const venció = vencimiento < TODAY;
    const r = rng.next();
    if (venció && r < 0.5) estado = 'vencido';
    else if (r < 0.45) estado = 'aprobado';
    else if (r < 0.75) estado = 'pendiente';
    else if (r < 0.9) estado = 'rechazado';
    else estado = venció ? 'vencido' : 'pendiente';

    budgets.push({
      id: `pre-${String(i + 1).padStart(3, '0')}`,
      numero: `P-${String(seq++).padStart(5, '0')}`,
      pacienteId: pac.id,
      fechaEmision: isoDate(emision),
      vencimiento: isoDate(vencimiento),
      items, total, estado,
    });
  }
  return budgets;
}

function buildInvoices(rng: Prng, patients: PatientEntity[]): InvoiceEntity[] {
  const invoices: InvoiceEntity[] = [];
  let seq = 231;
  const count = 28; // ≥25, últimos 60 días
  for (let i = 0; i < count; i++) {
    const pac = rng.pick(patients.filter((p) => p.edad >= 6));
    const tiposValidos = TREATMENT_TYPES.filter((t) => pac.edad >= t.edadMin && pac.edad <= t.edadMax);
    const items = rng.sample(tiposValidos, rng.int(1, 2)).map((t) => ({ concepto: t.nombre, monto: t.costoRef }));
    const total = items.reduce((s, it) => s + it.monto, 0);
    const emision = addDays(TODAY, -rng.int(1, 60)); // últimos 60 días (UX-065)
    const r = rng.next();
    let estado: InvoiceEntity['estado'];
    if (r < 0.5) estado = 'pagada';
    else if (r < 0.78) estado = 'emitida';
    else if (r < 0.92) estado = 'vencida';
    else estado = 'anulada';
    invoices.push({
      id: `inv-${String(i + 1).padStart(3, '0')}`,
      numero: `F-0001-${String(seq++).padStart(5, '0')}`,
      pacienteId: pac.id,
      obraSocialId: pac.obraSocialId,
      fechaEmision: isoDate(emision),
      items, total, estado,
    });
  }
  return invoices;
}

/**
 * Movimientos de cuenta corriente por paciente con mezcla representativa al-día/deuda
 * (UX-065/085). El saldo (cargos - pagos) determina el estado de cuenta DERIVADO; por
 * eso no se almacena el estado, se calcula. Se siembran cargos por atenciones y pagos
 * parciales/totales para que existan pacientes al día, con deuda y con saldo vencido.
 */
function buildMovements(rng: Prng, patients: PatientEntity[]): AccountMovementEntity[] {
  const moves: AccountMovementEntity[] = [];
  let seq = 1;
  for (const pac of patients) {
    if (pac.edad < 5 && rng.chance(0.5)) continue; // algunos sin movimientos (edge: cuenta vacía)
    const nCargos = rng.int(1, 4);
    // perfil de pago del paciente: al-día (paga todo), deudor (paga parcial), moroso (no paga)
    const perfil = rng.next();
    for (let k = 0; k < nCargos; k++) {
      const tipo = rng.pick(TREATMENT_TYPES);
      const fecha = addDays(TODAY, -rng.int(2, 180));
      const monto = tipo.costoRef;
      moves.push({
        id: `mv-${String(seq++).padStart(3, '0')}`,
        pacienteId: pac.id, fecha: isoDate(fecha),
        concepto: tipo.nombre, monto, signo: 'cargo',
      });
      // pago asociado según perfil
      let pagar = 0;
      if (perfil < 0.55) pagar = monto; // al día
      else if (perfil < 0.85) pagar = Math.round(monto * (rng.int(30, 70) / 100)); // deuda parcial
      else pagar = 0; // moroso → genera deuda/vencido
      if (pagar > 0) {
        moves.push({
          id: `mv-${String(seq++).padStart(3, '0')}`,
          pacienteId: pac.id,
          fecha: isoDate(addDays(fecha, rng.int(0, 5))),
          concepto: `Pago — ${rng.pick(MEDIOS_PAGO)}`,
          monto: pagar, signo: 'pago', medioPago: rng.pick(MEDIOS_PAGO),
        });
      }
    }
  }
  return moves;
}

// ---------- turnos ----------
const HORAS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

function buildAppointments(rng: Prng, patients: PatientEntity[]): AppointmentEntity[] {
  const appts: AppointmentEntity[] = [];
  let seq = 1;
  const target = 56; // ≥50
  // Distribución: ~30% confirmados/en-espera futuros, ~50% terminados pasados, ~10% atendiendo/hoy, ~10% cancelados
  // Para evitar choque de slots por profesional/fecha/hora, llevamos un set de ocupación.
  const ocupados = new Set<string>();
  const tomarSlot = (profId: string, fecha: string, hora: string): boolean => {
    const key = `${profId}|${fecha}|${hora}`;
    if (ocupados.has(key)) return false;
    ocupados.add(key);
    return true;
  };

  const makeAppt = (estado: AppointmentStatus, fecha: string): AppointmentEntity | null => {
    const pac = rng.pick(patients);
    const profId = pac.profesionalId;
    // intentar conseguir un slot libre
    let hora = '';
    for (let tries = 0; tries < 8; tries++) {
      const h = rng.pick(HORAS);
      if (tomarSlot(profId, fecha, h)) { hora = h; break; }
    }
    if (!hora) return null;
    const tipo = rng.pick(TREATMENT_TYPES.filter((t) => pac.edad >= t.edadMin && pac.edad <= t.edadMax));
    return {
      id: `tur-${String(seq++).padStart(3, '0')}`,
      pacienteId: pac.id,
      profesionalId: profId,
      fecha, hora,
      duracionMin: rng.pick([30, 30, 45, 45, 60]),
      tipoTratamientoId: tipo.id,
      tratamiento: tipo.nombre,
      estado,
      notas: '',
    };
  };

  const push = (estado: AppointmentStatus, fecha: string) => {
    const a = makeAppt(estado, fecha);
    if (a) appts.push(a);
  };

  const todayIso = isoDate(TODAY);
  // ~10% hoy atendiendo + algunos confirmados de hoy
  for (let i = 0; i < 6; i++) push('atendiendo', todayIso);
  for (let i = 0; i < 4; i++) push('confirmado', todayIso);
  // ~30% futuros (confirmado / en-espera)
  for (let i = 0; i < 12; i++) push('confirmado', isoDate(addDays(TODAY, rng.int(1, 20))));
  for (let i = 0; i < 6; i++) push('en-espera', isoDate(addDays(TODAY, rng.int(1, 25))));
  // ~50% pasados terminados
  for (let i = 0; i < 22; i++) push('terminado', isoDate(addDays(TODAY, -rng.int(1, 90))));
  // ~10% cancelados (mezcla pasado/futuro)
  for (let i = 0; i < 6; i++) push('cancelado', isoDate(addDays(TODAY, rng.int(-30, 15))));

  // completa hasta target si por colisiones quedó corto
  while (appts.length < target) {
    push('terminado', isoDate(addDays(TODAY, -rng.int(1, 120))));
  }
  return appts;
}

// ---------- notificaciones derivadas ----------
function buildNotifications(
  rng: Prng,
  patients: PatientEntity[],
  appts: AppointmentEntity[],
): NotificationEntity[] {
  const notifs: NotificationEntity[] = [];
  let seq = 1;
  const byId = (id: string) => patients.find((p) => p.id === id);

  // turnos por confirmar (en-espera, futuros)
  const porConfirmar = appts.filter((a) => a.estado === 'en-espera').slice(0, 3);
  for (const a of porConfirmar) {
    const p = byId(a.pacienteId);
    if (!p) continue;
    notifs.push({
      id: `not-${String(seq++).padStart(3, '0')}`, tipo: 'turno', icono: 'calendar-blank',
      titulo: 'Turno por confirmar', subtitulo: `${p.nombre} ${p.apellido} — ${a.hora}`,
      fecha: isoDate(addDays(TODAY, 0)) + 'T09:00', leida: false,
      pacienteId: p.id, ruta: `/agenda/${a.id}`,
    });
  }
  // pagos vencidos (los calcularemos a partir del saldo en el store; acá tomamos algunos deudores plausibles)
  const deudores = rng.sample(patients.filter((p) => p.edad >= 30), 2);
  for (const p of deudores) {
    notifs.push({
      id: `not-${String(seq++).padStart(3, '0')}`, tipo: 'pago', icono: 'receipt',
      titulo: 'Pago pendiente', subtitulo: `${p.nombre} ${p.apellido} — saldo en cuenta corriente`,
      fecha: isoDate(addDays(TODAY, 0)) + 'T08:00', leida: false,
      pacienteId: p.id, ruta: `/pacientes/${p.id}/pagos`,
    });
  }
  // cumpleaños (un paciente al azar "cumple hoy")
  const cumple = rng.pick(patients);
  notifs.push({
    id: `not-${String(seq++).padStart(3, '0')}`, tipo: 'cumpleanos', icono: 'cake',
    titulo: 'Cumpleaños', subtitulo: `${cumple.nombre} ${cumple.apellido} cumple años hoy`,
    fecha: isoDate(addDays(TODAY, 0)) + 'T07:00', leida: true,
    pacienteId: cumple.id, ruta: `/pacientes/${cumple.id}/informacion`,
  });
  // tratamiento por vencer (atrasado)
  notifs.push({
    id: `not-${String(seq++).padStart(3, '0')}`, tipo: 'tratamiento', icono: 'tooth',
    titulo: 'Tratamiento por vencer', subtitulo: 'Hay etapas de tratamiento atrasadas',
    fecha: isoDate(addDays(TODAY, -1)) + 'T18:00', leida: true,
    ruta: '/tratamientos',
  });
  return notifs;
}

/**
 * Punto de entrada: genera el StoreState completo de forma determinista a partir del
 * manifest. Mismo manifest → mismo estado (reset fiel, QA estable).
 */
export function generateSeed(manifest: SeedManifest): StoreState {
  const rng = new Prng(SEED_ROOT);

  const photoPool = manifest.pacientes.map((p) => p.path);
  const professionals = buildProfessionals(photoPool);
  const obrasSociales = buildObrasSociales();
  const treatmentTypes = buildTreatmentTypes();

  const patients = buildPatients(rng, manifest);
  const odontograms = patients.map((p) => buildOdontogram(rng, p));
  const treatmentPlans = buildTreatmentPlans(rng, patients);
  const clinicalEvents = buildClinicalEvents(rng, patients);
  const documents = buildDocuments(rng, patients, manifest);
  const budgets = buildBudgets(rng, patients);
  const invoices = buildInvoices(rng, patients);
  const movements = buildMovements(rng, patients);
  const appointments = buildAppointments(rng, patients);
  const notifications = buildNotifications(rng, patients, appointments);

  return {
    clinic: { nombre: 'Estudio Dental Mendieta', cuit: '30-71234567-8', direccion: 'Av. Santa Fe 1820, CABA', version: '1.0' },
    professionals,
    obrasSociales,
    treatmentTypes,
    patients,
    odontograms,
    appointments,
    treatmentPlans,
    clinicalEvents,
    documents,
    budgets,
    invoices,
    movements,
    notifications,
  };
}
