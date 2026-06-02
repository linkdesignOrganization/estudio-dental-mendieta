# Diagnóstico REQ-187 — Edge Case Tester (Iteración 4)

**Test:** `e2e/tests/edge-case/REQ-187-pieza-vacia.spec.ts` › "REQ-187: una pieza sana muestra el estado vacío 'Sin procedimientos…' (flujo de usuario, no crashea)"
**Sitio:** https://happy-coast-044ea7e0f.7.azurestaticapps.net (deploy It4)
**Fallo de regresión It4:** ÚNICO fallo (568 passed / 1 failed) — solo `mobile-chromium`, desktop pasaba. Timeout ~30s.

## Veredicto: (a) NO es bug — la app es CORRECTA. Era el TEST (timing del @defer). → ADAPTADO. REQ-187 queda PASA ESTABLE en ambos projects.

---

## 1. Verificación en MOBILE contra el deploy (Pixel 5 / 393px)

Navegué al odontograma de pac-029 en mobile y confirmé el render de las 32 piezas, 3 veces, por las dos rutas:

| Corrida | Ruta | Piezas renderizadas | Pieza 11 (Sana) | Pieza 16 (Ausente) |
|---------|------|---------------------|-----------------|--------------------|
| 1 | deep-link `/pacientes/pac-029/odontograma` | **32** ✓ | presente (ref e226) | — |
| 2 | deep-link (reload limpio) | **32** ✓ | presente | presente |
| 3 | flujo de usuario (ficha → tab Odontograma) | **32** ✓ | presente | — |

Evidencia: `e2e/evidence/edge-case/iteration-4/REQ-187-odontograma-mobile-32piezas.png` (full-page mobile, 32 piezas + leyenda).

**Conclusión del comportamiento:** con `@defer (on immediate)` el odontograma renderea las 32 piezas en mobile de forma fiable (deep-link y flujo de usuario). El cambio del Developer (It4: `on idle` → `on immediate`) MEJORA el determinismo, en línea con lo verificado por DevOps. Comportamiento CORRECTO.

## 2. Causa raíz del fallo del test (no de la app)

Mensaje real del fallo (error-context.md de la regresión):
```
TimeoutError: locator.scrollIntoViewIfNeeded: Timeout 15000ms exceeded.
  waiting for getByRole('button', { name: 'Pieza 11 (universal 8), Sana' })
```

El fallo era en la **línea 69** (`scrollIntoViewIfNeeded`), NO en el `toHaveCount(32)` de la 70.

El test (escrito en It2 con `@defer on idle`) hacía un `scrollIntoViewIfNeeded()` **imperativo PRIMERO**, antes de la aserción web-first de las 32 piezas:
```ts
await piezaSana.scrollIntoViewIfNeeded();                       // ← acción imperativa, actionTimeout 15s
await expect(...).toHaveCount(32);                              // web-first venía DESPUÉS
```
El chunk del bloque `@defer (on immediate)` se carga por red y, bajo la emulación mobile (más lenta), las 32 piezas aparecen unos instantes después de entrar al tab. Una **acción** imperativa como `scrollIntoViewIfNeeded()` NO reintenta el conteo del diagrama: solo auto-espera a SU target con el `actionTimeout` (15s) y compite con el render del `@defer`, agotándolo en mobile. Era una asunción de timing heredada de `on idle`, no un bug del producto.

## 3. Fix aplicado (SOLO el test — no se tocó código de app)

Reordené a un patrón **web-first** puro: primero la aserción polling de las 32 piezas (que reintenta con `expect.timeout` = 15s y absorbe la latencia del `@defer`), luego la visibilidad de la pieza objetivo, y el `.click()` (que ya auto-scrollea su target a viewport). Se eliminó el `scrollIntoViewIfNeeded()` imperativo previo que corría antes de la hidratación.

```ts
const piezaSana = page.getByRole('button', { name: 'Pieza 11 (universal 8), Sana' });
await expect(page.getByRole('button', { name: /^Pieza \d+ \(universal \d+\)/ })).toHaveCount(32);
await expect(piezaSana).toBeVisible();
await piezaSana.click();   // .click() auto-scrollea; la pieza ya está adjunta y visible
```
También se actualizó la nota de hidratación del docstring (`on idle` → `on immediate`).

## 4. Confirmación de estabilidad (3+ corridas verdes)

| Corrida | Project | Test | Resultado |
|---------|---------|------|-----------|
| 1 | mobile-chromium | flujo de usuario (:55) | PASS 8.8s |
| 2 | mobile-chromium | flujo de usuario (:55) | PASS 9.4s |
| 3 | mobile-chromium | flujo de usuario (:55) | PASS 9.3s |
| 4 | mobile-chromium | flujo de usuario (:55, full-file) | PASS 8.4s |
| 5 | desktop-chromium | flujo de usuario (:55, full-file) | PASS 8.8s |

Spec completo en ambos projects (5 tests × 2 = 10): **10 passed, 0 failed, 0 flaky (50.5s)**. Los 4 tests deep-link (que no dependían del diagrama) siguen verdes en ambos viewports.

## Resultados por Criterio

| Criterio | Estado | Input/Condición | Evidencia |
|----------|--------|-----------------|-----------|
| REQ-187 | **PASA (estable)** | Pieza sana en mobile vía flujo de usuario; @defer on immediate renderea 32 piezas | `e2e/evidence/edge-case/iteration-4/REQ-187-odontograma-mobile-32piezas.png`; 10/10 verdes |

## Bugs Encontrados

Ninguno. No es un bug de la app: el odontograma renderea correctamente las 32 piezas en mobile con `@defer (on immediate)`. El fallo era una asunción de timing en el test, ya corregida.

## Tests Generados / Modificados

- `e2e/tests/edge-case/REQ-187-pieza-vacia.spec.ts` (MODIFICADO — wait web-first adaptado a `@defer on immediate`; solo el test)
