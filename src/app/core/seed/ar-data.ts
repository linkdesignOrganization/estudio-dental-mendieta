/**
 * Pools de datos argentinos plausibles para el seed dinámico (UX-061/063).
 * Nombres coherentes por generación (edad) y género; apellidos rioplatenses;
 * obras sociales con distribución típica; catálogo de tratamientos; staff fijo.
 * Sin "Lorem ipsum" — todo realista AR.
 */

/** Apellidos rioplatenses comunes (italianos/españoles). */
export const APELLIDOS = [
  'Gómez', 'Fernández', 'Rodríguez', 'González', 'López', 'Martínez', 'García', 'Pérez',
  'Sánchez', 'Romero', 'Sosa', 'Torres', 'Álvarez', 'Ruiz', 'Ramírez', 'Flores', 'Acosta',
  'Benítez', 'Medina', 'Suárez', 'Herrera', 'Aguirre', 'Pereyra', 'Gutiérrez', 'Giménez',
  'Molina', 'Silva', 'Castro', 'Rojas', 'Ortiz', 'Núñez', 'Luna', 'Cabrera', 'Ríos',
  'Morales', 'Domínguez', 'Vega', 'Paz', 'Quiroga', 'Ledesma', 'Ibáñez', 'Méndez', 'Navarro',
  'Figueroa', 'Vera', 'Coronel', 'Maldonado', 'Bianchi', 'Ferrari', 'Russo',
] as const;

/**
 * Nombres femeninos por franja generacional. La franja se elige según la edad para que
 * el nombre sea verosímil (una bebé de 2 no se llama "Mirta"; una señora de 80 no "Mía").
 */
export const NOMBRES_F = {
  // 0-12 (nacidas ~2014+): nombres de moda reciente
  ninez: ['Emma', 'Mía', 'Catalina', 'Olivia', 'Renata', 'Alma', 'Pilar', 'Isabella', 'Delfina', 'Abril', 'Juana', 'Emilia'],
  // 13-30 (nacidas ~1996-2013)
  joven: ['Valentina', 'Martina', 'Sofía', 'Lucía', 'Camila', 'Julieta', 'Victoria', 'Catalina', 'Florencia', 'Agustina', 'Brisa', 'Morena'],
  // 31-55
  adulta: ['Mariana', 'Carolina', 'Verónica', 'Gabriela', 'Romina', 'Natalia', 'Soledad', 'Vanesa', 'Cecilia', 'Paula', 'Andrea', 'Florencia'],
  // 56+
  mayor: ['Susana', 'Mirta', 'Graciela', 'Beatriz', 'Norma', 'Cristina', 'Marta', 'Elena', 'Liliana', 'Nélida', 'Teresa', 'Alicia'],
} as const;

/** Nombres masculinos por franja generacional. */
export const NOMBRES_M = {
  ninez: ['Benjamín', 'Bautista', 'Thiago', 'Lautaro', 'Santiago', 'Ignacio', 'Joaquín', 'Felipe', 'León', 'Mateo', 'Dante', 'Bruno'],
  joven: ['Tomás', 'Joaquín', 'Lucas', 'Matías', 'Nicolás', 'Franco', 'Agustín', 'Julián', 'Ramiro', 'Facundo', 'Gonzalo', 'Iván'],
  adulta: ['Martín', 'Diego', 'Federico', 'Sebastián', 'Pablo', 'Hernán', 'Gustavo', 'Andrés', 'Marcelo', 'Leandro', 'Ezequiel', 'Damián'],
  mayor: ['Jorge', 'Roberto', 'Héctor', 'Raúl', 'Carlos', 'Oscar', 'Alberto', 'Ricardo', 'Rubén', 'Osvaldo', 'Eduardo', 'Norberto'],
} as const;

export type FranjaEdad = 'ninez' | 'joven' | 'adulta' | 'mayor';

export function franjaPorEdad(edad: number): FranjaEdad {
  if (edad <= 12) return 'ninez';
  if (edad <= 30) return 'joven';
  if (edad <= 55) return 'adulta';
  return 'mayor';
}

/**
 * Obras sociales con peso de distribución típica argentina. PAMI domina en adultos
 * mayores; OSDE/Swiss/Galeno en activos; IOMA en provincia de Bs As; Particular sin OS.
 */
export interface ObraSocialSeed { id: string; nombre: string; peso: number; }
export const OBRAS_SOCIALES: ObraSocialSeed[] = [
  { id: 'os-osde', nombre: 'OSDE', peso: 26 },
  { id: 'os-galeno', nombre: 'Galeno', peso: 16 },
  { id: 'os-swiss', nombre: 'Swiss Medical', peso: 16 },
  { id: 'os-pami', nombre: 'PAMI', peso: 14 },
  { id: 'os-ioma', nombre: 'IOMA', peso: 14 },
  { id: 'os-particular', nombre: 'Particular', peso: 14 },
];

/** 6 profesionales fijos del staff (UX-063), especialidades distintas. */
export interface ProfessionalSeed {
  id: string;
  nombre: string;
  especialidad: string;
  aniosExperiencia: number;
}
// Staff fijo EXACTO según REQ-057 (nombres, especialidades y años de experiencia
// son requisito verificable). El orden mantiene prof-03 = Odontopediatría porque el
// generador asigna los menores a 'prof-03' (niños → odontopediatra).
export const PROFESSIONALS: ProfessionalSeed[] = [
  { id: 'prof-01', nombre: 'Dra. Soledad Russo', especialidad: 'Odontología general', aniosExperiencia: 8 },
  { id: 'prof-02', nombre: 'Dra. Carolina Etcheverry', especialidad: 'Ortodoncia', aniosExperiencia: 12 },
  { id: 'prof-03', nombre: 'Dr. Federico Salinas', especialidad: 'Odontopediatría', aniosExperiencia: 10 },
  { id: 'prof-04', nombre: 'Dr. Martín Aguilera', especialidad: 'Endodoncia', aniosExperiencia: 18 },
  { id: 'prof-05', nombre: 'Dr. Juan Pablo Acuña', especialidad: 'Implantología', aniosExperiencia: 15 },
  { id: 'prof-06', nombre: 'Dra. Laura Béccar Varela', especialidad: 'Estética dental', aniosExperiencia: 7 },
];

/** Catálogo de ≥12 tipos de tratamiento (UX-063). costoRef en ARS. */
export interface TreatmentTypeSeed {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  costoRef: number;
  duracionEst: string;
  etapasTipicas: number;
  pasos: string[];
  materiales: string[];
  // edades a las que aplica con más frecuencia (para coherencia del odontograma/planes)
  edadMin: number;
  edadMax: number;
}
export const TREATMENT_TYPES: TreatmentTypeSeed[] = [
  {
    id: 'tt-01', nombre: 'Consulta y diagnóstico', descripcion: 'Evaluación clínica integral, anamnesis y plan de tratamiento personalizado.',
    icono: 'stethoscope', costoRef: 18000, duracionEst: '30 min', etapasTipicas: 1, edadMin: 0, edadMax: 100,
    pasos: ['Anamnesis y antecedentes', 'Examen clínico intraoral', 'Diagnóstico y plan de tratamiento'],
    materiales: ['Instrumental de diagnóstico', 'Espejo y explorador', 'Equipo de protección personal'],
  },
  {
    id: 'tt-02', nombre: 'Limpieza y profilaxis', descripcion: 'Remoción de placa y sarro, pulido y aplicación de flúor.',
    icono: 'sparkle', costoRef: 28000, duracionEst: '45 min', etapasTipicas: 1, edadMin: 4, edadMax: 100,
    pasos: ['Detartraje ultrasónico', 'Pulido coronario', 'Aplicación tópica de flúor'],
    materiales: ['Pasta profiláctica', 'Flúor tópico', 'Puntas de ultrasonido'],
  },
  {
    id: 'tt-03', nombre: 'Obturación (caries)', descripcion: 'Restauración con resina compuesta del color del diente.',
    icono: 'tooth', costoRef: 42000, duracionEst: '45 min', etapasTipicas: 1, edadMin: 5, edadMax: 100,
    pasos: ['Anestesia local', 'Remoción de tejido cariado', 'Restauración con resina', 'Pulido y control oclusal'],
    materiales: ['Anestesia infiltrativa', 'Resina compuesta', 'Ácido grabador y adhesivo'],
  },
  {
    id: 'tt-04', nombre: 'Tratamiento de conducto', descripcion: 'Endodoncia: remoción de pulpa y sellado del conducto radicular.',
    icono: 'first-aid-kit', costoRef: 145000, duracionEst: '90 min', etapasTipicas: 3, edadMin: 16, edadMax: 90,
    pasos: ['Apertura cameral', 'Instrumentación de conductos', 'Obturación y sellado', 'Control radiográfico'],
    materiales: ['Limas de endodoncia', 'Hipoclorito de sodio', 'Gutapercha y cemento sellador'],
  },
  {
    id: 'tt-05', nombre: 'Extracción simple', descripcion: 'Exodoncia de piezas con técnica atraumática.',
    icono: 'tooth', costoRef: 55000, duracionEst: '40 min', etapasTipicas: 1, edadMin: 6, edadMax: 100,
    pasos: ['Anestesia local', 'Sindesmotomía', 'Avulsión de la pieza', 'Indicaciones post-extracción'],
    materiales: ['Fórceps y elevadores', 'Gasa estéril', 'Sutura (si corresponde)'],
  },
  {
    id: 'tt-06', nombre: 'Implante dental', descripcion: 'Colocación de implante de titanio y corona sobre el mismo.',
    icono: 'tooth', costoRef: 520000, duracionEst: '120 min', etapasTipicas: 5, edadMin: 25, edadMax: 85,
    pasos: ['Estudio y planificación 3D', 'Colocación del implante', 'Período de osteointegración', 'Colocación del pilar', 'Corona definitiva'],
    materiales: ['Implante de titanio', 'Pilar protésico', 'Corona de porcelana'],
  },
  {
    id: 'tt-07', nombre: 'Corona de porcelana', descripcion: 'Funda completa para restaurar piezas muy dañadas.',
    icono: 'shield-check', costoRef: 210000, duracionEst: '60 min', etapasTipicas: 2, edadMin: 18, edadMax: 95,
    pasos: ['Tallado de la pieza', 'Toma de impresión', 'Colocación de corona provisoria', 'Cementado de corona definitiva'],
    materiales: ['Porcelana feldespática', 'Cemento de cementado', 'Material de impresión'],
  },
  {
    id: 'tt-08', nombre: 'Ortodoncia con brackets', descripcion: 'Alineación dentaria con aparatología fija metálica o estética.',
    icono: 'squares-four', costoRef: 480000, duracionEst: 'Plan extendido', etapasTipicas: 10, edadMin: 9, edadMax: 45,
    pasos: ['Estudio cefalométrico', 'Colocación de brackets', 'Activaciones periódicas', 'Retiro de aparatología', 'Colocación de retenedores'],
    materiales: ['Brackets metálicos/estéticos', 'Arcos de níquel-titanio', 'Ligaduras elásticas'],
  },
  {
    id: 'tt-09', nombre: 'Ortodoncia invisible', descripcion: 'Alineadores transparentes removibles a medida.',
    icono: 'squares-four', costoRef: 720000, duracionEst: 'Plan extendido', etapasTipicas: 12, edadMin: 16, edadMax: 50,
    pasos: ['Escaneo intraoral', 'Diseño digital del tratamiento', 'Entrega de alineadores', 'Controles de avance', 'Refinamiento final'],
    materiales: ['Alineadores termoplásticos', 'Attachments de composite', 'Escáner intraoral'],
  },
  {
    id: 'tt-10', nombre: 'Blanqueamiento dental', descripcion: 'Aclaramiento con gel de peróxido y luz LED en consultorio.',
    icono: 'sparkle', costoRef: 95000, duracionEst: '60 min', etapasTipicas: 1, edadMin: 18, edadMax: 70,
    pasos: ['Aislamiento gingival', 'Aplicación de gel de peróxido', 'Activación con luz LED', 'Indicaciones de mantenimiento'],
    materiales: ['Peróxido de hidrógeno', 'Barrera gingival', 'Lámpara LED'],
  },
  {
    id: 'tt-11', nombre: 'Carilla de porcelana', descripcion: 'Lámina estética adherida a la cara visible del diente.',
    icono: 'shield-check', costoRef: 185000, duracionEst: '90 min', etapasTipicas: 2, edadMin: 18, edadMax: 65,
    pasos: ['Diseño de sonrisa', 'Tallado mínimo', 'Toma de impresión', 'Cementado adhesivo'],
    materiales: ['Porcelana feldespática', 'Cemento adhesivo', 'Sistema de adhesión'],
  },
  {
    id: 'tt-12', nombre: 'Prótesis removible', descripcion: 'Prótesis parcial o completa para reemplazar piezas ausentes.',
    icono: 'tooth', costoRef: 380000, duracionEst: 'Plan extendido', etapasTipicas: 4, edadMin: 45, edadMax: 100,
    pasos: ['Impresiones preliminares', 'Prueba de rodetes', 'Prueba de dientes en cera', 'Instalación y ajustes'],
    materiales: ['Acrílico termocurable', 'Dientes de stock', 'Estructura metálica (parcial)'],
  },
  {
    id: 'tt-13', nombre: 'Prótesis fija (puente)', descripcion: 'Reemplazo de piezas ausentes con puente cementado.',
    icono: 'shield-check', costoRef: 420000, duracionEst: 'Plan extendido', etapasTipicas: 3, edadMin: 30, edadMax: 90,
    pasos: ['Tallado de pilares', 'Impresión definitiva', 'Prueba de estructura', 'Cementado del puente'],
    materiales: ['Metal-porcelana', 'Cemento de cementado', 'Material de impresión'],
  },
  {
    id: 'tt-14', nombre: 'Periodoncia', descripcion: 'Tratamiento de encías: raspaje, alisado radicular y control.',
    icono: 'first-aid-kit', costoRef: 120000, duracionEst: '60 min', etapasTipicas: 2, edadMin: 25, edadMax: 100,
    pasos: ['Diagnóstico periodontal', 'Raspaje y alisado radicular', 'Reevaluación', 'Mantenimiento periódico'],
    materiales: ['Curetas periodontales', 'Ultrasonido periodontal', 'Antisépticos'],
  },
  {
    id: 'tt-15', nombre: 'Odontopediatría', descripcion: 'Atención especializada para niños: sellantes, flúor y control.',
    icono: 'users', costoRef: 32000, duracionEst: '40 min', etapasTipicas: 1, edadMin: 0, edadMax: 14,
    pasos: ['Adaptación del niño', 'Profilaxis y enseñanza de higiene', 'Aplicación de sellantes/flúor', 'Indicaciones a los padres'],
    materiales: ['Sellantes de fosas y fisuras', 'Flúor tópico', 'Material de bajo impacto'],
  },
];

/** Pool de nombres de documentos clínicos (radiografías + fotos). */
export const DOCUMENT_NAMES = {
  radiografia: [
    'Radiografía panorámica', 'Radiografía periapical', 'Radiografía bite-wing',
    'Telerradiografía de perfil', 'Radiografía oclusal', 'Serie radiográfica periapical',
    'Radiografía de aleta de mordida', 'Tomografía Cone Beam',
  ],
  foto: [
    'Foto intraoral frontal', 'Foto sonrisa inicial', 'Foto lateral derecha',
    'Foto lateral izquierda', 'Foto oclusal superior', 'Foto oclusal inferior',
    'Registro fotográfico de avance', 'Foto de resultado final',
  ],
} as const;

/** Medios de pago AR. */
export const MEDIOS_PAGO = ['Efectivo', 'Tarjeta de débito', 'Tarjeta de crédito', 'Transferencia', 'Mercado Pago'] as const;

/** Calles típicas de CABA para direcciones plausibles. */
export const CALLES = [
  'Av. Santa Fe', 'Av. Corrientes', 'Av. Cabildo', 'Av. Rivadavia', 'Gurruchaga', 'Thames',
  'Honduras', 'Costa Rica', 'Av. Las Heras', 'Juncal', 'Charcas', 'Av. Scalabrini Ortiz',
  'Bulnes', 'Av. Pueyrredón', 'Malabia', 'Soler', 'Nicaragua', 'Armenia', 'Av. Córdoba',
  'Paraguay', 'Av. Callao', 'Güemes', 'Salguero', 'Av. del Libertador', 'Av. Belgrano',
] as const;

/** Tipos de evento clínico para el historial. */
export const EVENT_TYPES = [
  { tipo: 'Consulta', icono: 'stethoscope' },
  { tipo: 'Control', icono: 'calendar-check' },
  { tipo: 'Limpieza', icono: 'sparkle' },
  { tipo: 'Tratamiento', icono: 'tooth' },
  { tipo: 'Radiografía', icono: 'image' },
  { tipo: 'Urgencia', icono: 'first-aid-kit' },
] as const;
