# Project Tracker
> **PM = Orquestador puro. NUNCA tocar código, builds, tests ni reportes técnicos.**
> **NUNCA diferir criterios. Ciclo de bugs = automático hasta 0 fallos.**
> **ANTES de cada ronda QA 2+: ejecutar regresión — BLOQUEANTE.**
> Código → Developer | Testing → QA | Deploy → DevOps | Requirements → BA | Arquitectura → Architect | Diseño → DO

## Estado actual
- Modo: NEW (NORMAL) · FASE 5 en PROSA (worktree no disponible + run-regression sed bug macOS)
- Fase: FASE 5 — Iteración 5 · anti-deferral — fix F01 ✓ (afterNextRender), DevOps deploy → re-QA REQ-216
- Próximo: re-QA REQ-216 → 5e-verify → 5j commit → FASE 6
- Bugs abiertos: 1 (F01 en re-test). Visual 0 bugs. Regresión 709 verde
- UX-003 flaky reforzado (redirect facturación doble salto, no bug). FASE 6 re-correrá regresión completa contra prod
- It5 5a ✓: presupuestos detalle+F02, OS liquidaciones, pago editable+fecha (REQ-260), 4 reportes con gráficos SVG/CSS (cero deps), seed byte-idéntico, bundle 103KB. Cierra 272 REQ
- It1/2/3/4 ✓
- It4 5a ✓: crear paciente 2 rutas + género (estaba hardcodeado mujer) + foto, editar dirty-check (F01), odontograma editable @defer immediate, tratamientos col próxima fecha. Seed byte-idéntico
- It1/2/3 ✓
- UX-003 era flaky (click tragado nav encadenada, no agenda); seed byte-idéntico
- It3 5a ✓: vista semanal real (corrigió bug grid mensual), mobile día/lista (feedback demo), notas internas, reagendar notif WhatsApp real. Seed byte-idéntico
- It1/It2 ✓. Lección: PRNG separado para datos nuevos del seed
- It2 5a ✓: sub-detalles pieza/evento/plan + 3 gaps (detalle pieza historial real, contacto emergencia, filtros lista). SEED byte-idéntico (PRNG separado, sin drift)
- It1 ✓ (commit ac766db). Demos/feedback consolidados al final de FASE 5
- UX-022 era flaky (carrera wizard, no bug); seed restaurado. Iteración 1 = auditoría, criterios mayormente cubiertos por regresión
- Bugs abiertos: 0 · sitio VIVO: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- It1 5a ✓: Developer auditó base demo, corrigió REQ-057 (6 profesionales nombres exactos) + REQ-058 (44 docs thumbnails), build 102KB
- FASE 3.5-INFRA: N/A (frontend-only, sin backend/DB)

## Scope para FASE 5 (feedback de la demo)
- [Iteración 3 Agenda] Cliente pidió: en MOBILE la agenda arranca por defecto en vista DÍA/LISTA (turnos como filas ≥44px), no en semanal con chips chicos. Resuelve el touch de los chips de 22px.
- F01 (Iteración 4 editar paciente): exponer "Cancelar con confirmación de descarte"
- F02 (Iteración 5 crear presupuesto): "Atrás" debe repoblar el paciente del Paso 1
- Observación demo: chips agenda semanal mobile 22px (no forzado — path táctil = vista día/lista; decisión del cliente)
- Bugs abiertos: 9 fallos en re-QA — naturaleza: UX-045 test obsoleto (E03 ya fixeado), 6 mobile timeouts (tests no adaptados a mobile/posible bug), DC-076 odontograma (¿@defer?)
- NOTA regresión: usar --no-chunks desde e2e/ con REGRESSION_TESTS_DIR=tests (chunked rompe por BSD sed)
- 4a ✓ + 4b ✓ + 4c ✓ + 4d ✓ + 4e DEPLOY VIVO ✓ (sitio carga, manifest+fotos OK)
- 4e-regress: N/A (primera construcción, sin tests previos)
- Modo Visual: PROSA (fallback) — el workflow estándar hardcodea CRM tracking (PROHIBIDO aquí) + variante visual no validada e2e + sesión con errores de infra
- Infra: Azure sub=CEFSA-prod (4bdfcf40-…) SKU=Standard · repo=público linkdesignOrganization/estudio-dental-mendieta · node v26 · Angular 21
- Diseño: design-criteria.md = 120 DC-xxx + 29 BVC-xxx · ux-criteria.md = 71 UX-xxx
- Cliente APROBÓ el plan (con ajuste: Angular 17→21)
- Arquitectura: Angular 17+ standalone, Bootstrap 5 selectivo, localStorage, 5 iteraciones, 21 DEMO-xxx

## Decisiones del cliente (Fase 2)
- Color: Azul cielo/medio (#c5d8e8 / #6da8d4) · Tipografía: Red Hat · Logo: isotipo+wordmark
- Badge/textos: SIN ninguna referencia a demo/mock — UI 100% como producción real
- Dominio: sin dominio propio → URL default de Azure Static Web Apps
- Mobile: TODOS los flujos usables en mobile (responsive completo) — sube alcance
- Interacción: Pagos Y Odontograma editables — sube alcance
- Bugs abiertos: 0
- URL deploy: https://happy-coast-044ea7e0f.7.azurestaticapps.net (VIVO — visual-build desplegada)
- Effort sesión: max ✓

## Notas de arranque
- Proyecto: Estudio Dental Mendieta (viewcase clínica dental, frontend-only + localStorage)
- Input: requirements.md (866 líneas) + mockpeople/ (29 fotos: 12H + 17M) + design-briefs/ (creado por PM)
- Referencia visual OBLIGATORIA §10: https://task-dasher.webflow.io/ → cliente eligió CAPTURARLA
- FASE 3.0 (investigación visual): SÍ se ejecutará (design-brief creado apuntando a Task Dasher)
- Decisiones pendientes (§15) que el BA preguntará en Fase 2: familia de color, tipografía, dominio, logo, cronograma
- Contradicción a resolver: §12 dice "30 pacientes" pero §8/§11 dicen leer dinámico → 29 fotos reales
- Memorias de equipo: aisladas (backup de "Tornos del Sur" hecho, carpeta global limpia)

## Historial
- ✓ PASO 0: seed memory verificado (10 memorias individuales OK) + aislamiento de equipo (backup Tornos del Sur) (2026-06-01)
- ✓ PASO 1: proyecto nuevo NORMAL detectado, estructura output/ creada (2026-06-01)
- ✓ FASE 1: BA descubrimiento — 258 criterios + 18 NFR, 17 gaps, 29 pacientes confirmados (2026-06-01)
- ✓ FASE 2: 7 decisiones cliente + 10 técnicas incorporadas, requirements v2.0 (272 criterios), 0 gaps (2026-06-01)
- ✓ FASE 3.0 (capturas): 8 páginas Task Dasher capturadas (49 PNGs desktop+mobile), 29 BVC del Brief Analyst (2026-06-01)
- ✓ FASE 3.0 (síntesis): visual-analysis.md (360 líneas, 30 BVC, tokens prescriptivos azul+Red Hat) — Design Researcher cayó 1 vez por socket, OK en intento 2 (2026-06-01)
- ✓ FASE 3: planificación completa, 5 iteraciones, 21 DEMO-xxx, 120 DC-xxx, 71 UX-xxx, plan-verifier PASA sin gaps (2026-06-01)
- ✓ FASE 3.5: infra demo — repo público + CI/CD GitHub Actions + SWA Standard en CEFSA-prod (happy-coast-044ea7e0f), cliente autorizó ~$9/mes (2 bloqueos resueltos: cuota Free, permisos Sponsorship) (2026-06-01)
- ✓ FASE 4: Construcción Visual completa — demo APROBADA, sitio vivo, 233 criterios, 0 bugs, 24 .spec.ts/234 tests, ~13 bugs corregidos (V01 CSP crítico). PROSA. commit dda276f (2026-06-02)
- ✓ FASE 3.5-INFRA: N/A (frontend-only, sin backend/DB) (2026-06-02)
- ✓ FASE 5 It1 (Fundación): auditoría base demo, corrigió REQ-057/058 + regresión seed (PRNG separado), UX-022 flaky estabilizado, 0 bugs, suite 490 tests (2026-06-02)
- ✓ FASE 5 It2 (Pacientes): ficha a fondo + sub-detalles (pieza/evento/plan), 3 gaps hardcodeados corregidos, seed byte-idéntico (sin drift), regresión 486 verde, 0 bugs (2026-06-02)
- ✓ FASE 5 It3 (Agenda): vista semanal real (bug grid mensual corregido), mobile día/lista (feedback demo, chips 22px→44px), reagendar notif WhatsApp, notas internas, UX-003 flaky estabilizado, regresión 536 verde, 0 bugs (2026-06-02)
- ✓ FASE 5 It4 (escritura+tratamientos): crear paciente (género hardcodeado mujer→real) 2 rutas+foto, editar dirty-check (F01), odontograma editable persistente, tratamientos, FIX seguridad foto (SVG/XSS+2MB), REQ-187 test adaptado @defer, regresión 568 verde, 0 bugs (2026-06-02)
