---
name: clinica-dental-prng-seed-drift
description: El seed de ClinicaDental se genera con un PRNG global de semilla fija — alterar su consumo rompe tests downstream; usar PRNG separado para datos nuevos
metadata: 
  node_type: memory
  type: project
  originSessionId: a4848c2a-08a3-4513-aac1-735bf9a414cc
---

El seed de Estudio Dental Mendieta (29 pacientes + turnos/presupuestos/facturas/movimientos) se genera en `src/app/core/seed/seed.generator.ts` con un PRNG de semilla fija (`new Prng(SEED_ROOT)`), determinista para que "Restablecer datos" reproduzca el estado exacto. Los tests Playwright asertan valores concretos del seed (saldos, montos de presupuesto, estados de turno).

**Trampa recurrente (rompió la regresión en It1 y reapareció como riesgo en It2/It4/It5):** cualquier cambio que altere el ORDEN o la CANTIDAD de draws del PRNG global DESPLAZA toda la secuencia downstream y cambia esos valores → los tests fallan masivamente (no es bug de código, es drift de datos). Ejemplo real (It1): al poblar el pool de documentos de `[]` a 15 SVGs, se activó un `rng.pick(pool)` antes protegido por `pool.length ? … : ''`, agregando 1 draw × 44 documentos → presupuestos `pre-008`/`pre-020` cambiaron de estado y `pac-001` cambió de saldo.

**Why:** el determinismo del reset y la estabilidad de los tests dependen de que la secuencia global del PRNG no se mueva.
**How to apply:** para generar datos NUEVOS derivados, usar SIEMPRE un PRNG SEPARADO sembrado por clave de entidad: `new Prng(SEED_ROOT ^ hash(entidadId))` (así se hizo para thumbnails de documentos, historial por pieza, nº de afiliado). Las escrituras del usuario (crear paciente/turno/presupuesto, registrar pago) usan ids por timestamp (`Date.now()`), no el PRNG. Datos de reportes = derivación pura del estado, no generación. Verificar el seed byte-idéntico (fingerprint `f4a6fea6…`) tras cualquier cambio al generador. Ver [[dev-team-prose-mode-and-regression]] para cómo correr la regresión que detecta esto.
