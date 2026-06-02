# Project Tracker
> **PM = Orquestador puro. NUNCA tocar código, builds, tests ni reportes técnicos.**
> **NUNCA diferir criterios. Ciclo de bugs = automático hasta 0 fallos.**
> **ANTES de cada ronda QA 2+: ejecutar regresión — BLOQUEANTE.**
> Código → Developer | Testing → QA | Deploy → DevOps | Requirements → BA | Arquitectura → Architect | Diseño → DO

## Estado actual
- Modo: NEW (NORMAL — no Pixel-Perfect, CON design-brief de Task Dasher)
- Fase: FASE 4 — Construcción Visual · Paso 4f-sub (3 sub-testers SECUENCIAL, sin worktree)
- Próximo: 4f-consolidate → anti-deferral → 4g demo
- 4f-plan ✓: 233 criterios (Visual 158, Flow 47, Edge 28), ronda 1
- NOTA worktree no disponible (git init post-arranque) → sub-testers secuenciales por browser MCP compartido
- Flow Tester ✓: 45 PASA, 90/90 desktop+4/4 mobile, 1 bug baja (BUG-F01 ruta catálogo)
- Edge Tester ✓: 28 criterios, 100/100 PASS, 6 bugs (E01-E06)
- Visual Checker ✓: 138/158 PASA, BUG-V01 CRÍTICO (hoja estilos no aplica: media=print+onload bloqueado por CSP — raíz de E02/E05/V06/20 fallas visuales) + V04 a11y. BVC-027 y GAP-A04 PASAN
- Fase: 4f anti-deferral RONDA 3 — V05 fix ✓ (touch ≥44px mobile), DevOps deploy → activar fixme touch → regresión
- Bugs abiertos: 1 (V05 en re-deploy/re-test)
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
