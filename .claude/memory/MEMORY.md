# Memoria — ClinicaDental (Estudio Dental Mendieta)

Viewcase de clínica dental (frontend-only, Angular 21, SWA) construido con el plugin dev-team. **Proyecto COMPLETADO y entregado** (2026-06-03), 272 REQ, 770 tests verde, 0 bugs. Producción: https://happy-coast-044ea7e0f.7.azurestaticapps.net · Repo: linkdesignOrganization/estudio-dental-mendieta.

## Memorias
- [dev-team modo PROSA + regresión](dev-team-prose-mode-and-regression.md) — correr el plugin acá: modo PROSA (no workflow), run-regression `--no-chunks` desde e2e/, sub-testers secuenciales sin worktree
- [PRNG seed drift](clinica-dental-prng-seed-drift.md) — el seed usa PRNG global de semilla fija; usar PRNG separado para datos nuevos o se rompen los tests downstream
