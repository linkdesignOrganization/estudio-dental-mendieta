## Verificación: Post-Implementación 5a-verify — Iteración 1 (Fundación) · Modo NORMAL

**Verificador**: plan-verifier
**Fecha**: 2026-06-02
**Scope**: Iteración 1 según architecture.md (líneas 286-302). Verificación a nivel de PRODUCCIÓN (no demo/placeholder).
**Método**: Lectura de código (`src/`) + ejecución empírica del generador de seed contra el manifest real (`public/seed/manifest.json`) vía esbuild, con doble corrida para confirmar determinismo.

---

### Confirmación de los 2 gaps que el Developer reportó haber corregido

**REQ-057 — 6 profesionales con nombres/especialidades/años EXACTOS del brief → CORREGIDO ✓**
Fuente: `src/app/core/seed/ar-data.ts` (PROFESSIONALS) + ejecución del generador. Los 6 coinciden exactamente con el brief (orden distinto, no requerido por el criterio):
- Dra. Carolina Etcheverry | Ortodoncia | 12 ✓
- Dr. Martín Aguilera | Endodoncia | 18 ✓
- Dra. Soledad Russo | Odontología general | 8 ✓
- Dr. Juan Pablo Acuña | Implantología | 15 ✓
- Dra. Laura Béccar Varela | Estética dental | 7 ✓
- Dr. Federico Salinas | Odontopediatría | 10 ✓

**REQ-058 — 40-60 documentos con thumbnails reales (no vacíos) → CORREGIDO ✓**
Fuente: `seed.generator.ts buildDocuments()` + manifest + ejecución empírica.
- 44 documentos generados (rango 40-60 ✓).
- **docsWithThumb=44 / docsEmptyThumb=0** → todos los thumbnails apuntan a un asset real.
- El pool del manifest tiene 15 imágenes reales (5 `foto-0X.svg` + 10 `radiografia-XX.svg`), todas presentes en `public/imagenes/documentos/`.
- `thumbFor()` separa el pool por tipo (radiografía/foto) y siempre devuelve un path del pool no vacío → thumbnail coherente con el tipo del documento.

**Reset determinista (PRNG semilla fija) tras los cambios → CONFIRMADO ✓**
- `prng.ts`: mulberry32 con `SEED_ROOT = 0x45444d31` (constante fija). 0 usos de `Math.random()` en todo `src/` (verificado por grep).
- `seed.generator.ts`: `TODAY` anclado a `2026-06-01` fijo; un único `new Prng(SEED_ROOT)` por corrida.
- `store.service.ts reseed()` → `generateSeed(manifest)` con la misma semilla y mismo manifest.
- **Prueba empírica**: dos corridas independientes de `generateSeed()` producen JSON byte-idéntico (146257 == 146257 chars, `DETERMINISM_IDENTICAL=true`). "Restablecer datos" restaura siempre el estado original exacto.
- Nota: las mutaciones de usuario en runtime (registrarPago/crearTurno/…) usan `Date.now()` solo para IDs nuevos — NO afectan al seed; el reset las descarta volviendo al estado determinista.

---

### Criterios Cubiertos ✓ (por feature de Iteración 1)

**Login y entrada — REQ-001 a REQ-007** → `features/auth/login.component.ts`
- Botón "Ingresar como administradora" centrado (REQ-001) + link "Saltar login" (REQ-003); ambos `routerLink="/reportes"`. Sin validación de credenciales reales (REQ-004). Idempotente (es solo navegación, REQ-007). Focus ring + responsive mobile (REQ-005/006). Carga de seed la cubre `seedReadyGuard`/APP_INITIALIZER (REQ-002).

**Header persistente — REQ-008 a REQ-016** → `layout/header.component.ts`
- Logo/wordmark "Estudio Dental Mendieta" (REQ-008), título de módulo sincronizado con la ruta (REQ-009), avatar "AD" vía Ana Domínguez (REQ-010), campana con badge contador (REQ-012). SIN búsqueda global / command palette / atajos (REQ-013/014). SIN badge "demo" (REQ-011). Fijo + responsive con burger (REQ-015/016).

**Sidebar — REQ-017 a REQ-024** → `layout/sidebar.component.ts`
- Exactamente 5 items principales (Agenda, Pacientes, Tratamientos, Facturación, Reportes) en orden (REQ-017) + Configuración/Ayuda en zona inferior (REQ-020). Icono Phosphor 20 + label SIEMPRE visible (REQ-018). Item activo destacado, `aria-current="page"` (REQ-019). Navega y actualiza URL (REQ-022). ≥44px, hover, focus ring (REQ-023/024).

**Footer — REQ-025 a REQ-028** → `layout/footer.component.ts`
- "Estudio Dental Mendieta · v1.0 · 2026" como versión de producto (REQ-025). Sin atribución a portfolio/Link Design ni lenguaje de demo (REQ-026). SIN link "Resetear demo" (REQ-027). Discreto (REQ-028).

**Routing multi-pantalla — REQ-029 a REQ-031 / NFR-006..009** → `app.routes.ts`, `seed-ready.guard.ts`
- Cada pantalla con ruta dedicada; lazy `loadChildren` por módulo (REQ-029, NFR-003/006). `seedReadyGuard` hidrata desde localStorage antes de renderizar cualquier ruta interna → deep-link funciona (REQ-031, NFR-008). `**` → not-found controlado. SPA con router real, no modales ocultos (NFR-009).

**Persistencia localStorage — REQ-032 a REQ-041** → `persistence/store.service.ts`, `storage.service.ts`
- Estado completo persistido (REQ-032); mutaciones (paciente/turno/pago/tratamiento/presupuesto/factura/edición) pasan por `update(..., immediate)` y persisten (REQ-033..039). Degradación elegante a memoria si localStorage no está disponible/lleno con flag `degraded` y aviso `role=status` en el shell (REQ-040). Versionado: `STORAGE_KEY = edm:v1:state` + `purgeOldVersions()` (REQ-041).

**Seed dinámico desde fotos — REQ-042 a REQ-055** → `seed.generator.ts`, `manifest.loader.ts`, `scripts/generate-manifest.mjs`
- Manifest build-time desde `input/mockpeople/{hombres,mujeres}` ignorando `.DS_Store` (REQ-042). 29 pacientes = 12 H + 17 M (verificado empírico: `patients=29`) (REQ-043). Edad del nombre de archivo (REQ-044), género de la carpeta (REQ-045), foto referenciada (0 pacientes sin foto) (REQ-046). Sufijos `23-1/23-2` soportados por `AGE_RE` (REQ-047). Nombre AR por franja generacional + apellido (REQ-048), DNI formato AR `\d+.\d{3}.\d{3}` por edad (REQ-049), obra social ponderada con PAMI en mayores (REQ-050), profesional de cabecera asignado (REQ-051). Historial variable por edad (REQ-052). Odontograma coherente por edad: <6 posteriores ausentes, ≥70 ausencias/prótesis, jóvenes/adultos mezcla (REQ-053). Tratamientos filtrados por `edadMin/edadMax` (REQ-054). Mezcla cuenta al-día/deuda (verificado: 14 al-día / 15 con-deuda) (REQ-055).

**Datos seed mínimos + reset — REQ-056, REQ-057, REQ-058** → (volúmenes verificados empíricamente)
- Clinic fijo (Estudio Dental Mendieta, CUIT 30-71234567-8, dirección CABA) (REQ-056). REQ-057 ver arriba ✓. REQ-058 volúmenes: 6 obras sociales, 56 turnos (≥50, los 5 estados: confirmado16/atendiendo6/en-espera6/terminado22/cancelado6), 49 planes (≥40, 4 estados), 22 presupuestos (≥20, 4 estados), 28 facturas en últimos 60 días (≥25, 4 estados), 15 tipos de tratamiento (≥12), 44 documentos con thumbnails reales, histórico 709 días (≥60) ✓.

**Restablecer datos (Configuración) — REQ-264, REQ-265, REQ-266** → `features/settings/settings.component.ts`
- Card "Datos del sistema" con botón "Restablecer datos", copy de producción sin "demo/mock/simulación" (REQ-264). Confirmación destructiva vía `confirm-dialog` advirtiendo pérdida de cambios; solo tras confirmar llama `reseed()` + toast de producción "Datos restablecidos correctamente." (REQ-265). Única vía de reset (no en footer), usable en mobile (grid 1col + touch ≥44px) (REQ-266).

**Feedback transversal — REQ-247, REQ-248, REQ-250, REQ-251** → `shared/components/`
- `confirm-dialog` usado en 8 componentes (incl. settings, eliminar paciente, cancelar turno/flujos) (REQ-247). `toast.service` con 13 `success()` tras acciones (REQ-248). `empty-state` usado en 10+ vistas (REQ-250). `skeleton` en listas/dashboard (REQ-251).

**Anti-patrones y "cero demo" — REQ-257, REQ-258, REQ-272** → barrido de todo `src/`/`public/`
- REQ-272: 0 ocurrencias de demo/mock/simulación/simulado/de prueba/ficticio/viewcase/Link Design en strings visibles (solo en comentarios de código, no en UI). REQ-258: 0 SDK de analytics/tracking (el único match "tracking" es CSS letter-spacing en data-table). ARCA/AFIP solo en comentarios documentando su ausencia. Sin auth real ni roles. REQ-257: sidebar con label (no icono solo), sin búsqueda global/command palette; paginación offset (no infinite scroll) — coherente con la base entregada en Fase 4.

**NFR-005..009** → persistencia no bloqueante (escrituras debounced 200ms; `signal` en memoria) (NFR-005); routing/atrás/deep-link/no-SPA-modal cubiertos por `app.routes.ts` + guard (NFR-006..009).

---

### Criterios SIN Cobertura ✗
Ninguno. Los 58+ criterios asignados a la Iteración 1 tienen implementación a nivel de producción.

### Scope Creep (sin requirement asociado) — no bloqueante
- `settings.component.ts` incluye una sección "Preferencias" con 3 switches decorativos (recordatorios/cumpleaños/montos) que no mapean a un REQ específico de Iteración 1. Es coherente con la estética de producción (la pantalla Configuración existe por REQ-020/264) y no introduce demo/tracking. Se reporta como informativo; NO bloquea.

### Notas para QA (5e-verify)
- Existe test de seed `e2e/tests/flow/UX-060-067-seed.spec.ts` que asserta volúmenes (29 pacientes 12H/17M, 6 prof, 6 OS, ≥12 tipos, ≥50 turnos los 5 estados, ≥40 planes, 40-60 docs, ≥20 presupuestos, ≥25 facturas) y edge cases. Tests de persistencia/degradación/deep-link/confirmaciones también presentes.
- Recomendación: agregar (si no existe ya) una aserción explícita de **determinismo del reset** (registrar un cambio → Restablecer datos → estado idéntico al inicial) y de **REQ-057 nombres exactos** dentro de la suite, para blindar estos 2 gaps en regresión. No bloqueante para 5a.

---

### Resultado: PASA (0 criterios sin cobertura)
