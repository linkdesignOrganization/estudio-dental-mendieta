## Verificación: Post-UI-Developer (paso 4a-REVERIFY) — Cierre de GAP-1 (íconos sin definir)

**Modo**: NORMAL
**Fecha**: 2026-06-01
**Alcance**: re-verificación dirigida del único gap de `verification-4a.md` (2 íconos referenciados pero no definidos → glifo fallback "?") + cross-check global del set de íconos + spot-check de no-regresión de la cáscara visual.
**Build**: `ng build --configuration production` → **exit 0** (solo warnings de deprecación Sass `@import`, no bloqueantes).

---

### 1. Cierre del gap reportado ✓

`src/app/shared/components/icon.component.ts` ahora define ambos glifos en el set `RAW` con **path-data real de Phosphor** (no reasignados al fallback):

- **`currency-circle-dollar`** (línea 99): `<circle cx="128" cy="128" r="96"/><line x1="128" y1="72" x2="128" y2="184"/><path d="M104,160h36a20,20,0,0,0,0-40H116a20,20,0,0,1,0-40h36"/>` — círculo + barra vertical + símbolo "$", glifo Phosphor "currency-circle-dollar" regular. ✓
- **`sparkle`** (línea 100): `<path d="M128,24,150.85,84.65a8,8,0,0,0,4.5,4.5L216,112l-60.65,22.85a8,8,0,0,0-4.5,4.5L128,200l-22.85-60.65a8,8,0,0,0-4.5-4.5L40,112l60.65-22.85a8,8,0,0,0,4.5-4.5Z"/>` — estrella de 4 puntas, glifo Phosphor "sparkle" regular. ✓

Confirmado en las 3 ubicaciones que disparaban el "?":
- `tab-payments.component.ts:45` → `m.signo === 'pago' ? 'currency-circle-dollar' : 'receipt'` (ambos definidos). ✓
- `placeholder.data.ts` → `icono: 'sparkle'` en `tt-02` (Limpieza), `tt-09` (Blanqueamiento), `ev-003` (Profilaxis), que alimentan `treatment-type-card` (DC-062) e `event-block` del Historial (DC-075). ✓
- (`plan-detail` / `treatment-type-detail` consumen `currency-circle-dollar`/`icono` desde la misma data, ya cubiertos). ✓

Verificación en bundle compilado: ambas claves (`currency-circle-dollar`, `sparkle`) aparecen en el JS emitido (`chunk-CKZKMCIZ.js` y `chunk-V5R36J6N.js`), confirmando que resuelven a su propio path-data y **no** al `PHOSPHOR_PATHS['question']`. ✓

---

### 2. Cross-check global del set de íconos ✓ (sin huérfanos)

Barrido exhaustivo de TODAS las formas de referenciar un ícono y diff contra el set definido:

**Definidos en el set `RAW`**: 63 glifos.

**Referencias detectadas** (consolidadas, 46 claves distintas):
- `<app-icon name="...">` literal en templates (37 claves).
- `[name]="..."` dinámico alimentado por data: campos `icono:` de `placeholder.data.ts` (cake, calendar-blank, calendar-check, chart-line, check-circle, first-aid-kit, image, receipt, shield-check, **sparkle**, squares-four, stethoscope, tooth, user-plus, users, wallet), campos `icon:` de nav de `dashboard.component.ts`/`help.component.ts` (users, tooth, chart-line, chart-bar, calendar-blank, receipt), y ternarios inline (`currency-circle-dollar`/`receipt`/`image`).
- `toast-host.component.ts` `glyph()` → mapea kind a `{ check-circle | warning | info }` — todos definidos.

**Resultado del diff `referenciados − definidos` = ∅ (vacío).** Ningún `<app-icon>` ni icon-key en data queda sin definir → **cero render de fallback "?" en toda la cáscara**. ✓

> Nota: el grep amplio arrojó falsos positivos esperables que NO son icon-keys (selectores `app-footer`/`app-header`, estados de dominio `al-dia`/`con-deuda`/`en-curso`, clases CSS `is-active`/`icon-btn`, operandos de comparación `pago`/`radiografia` en `m.signo`/`d.tipo`) — descartados; ninguno se pasa como `name`.

---

### 3. Spot-check de no-regresión de la cáscara visual ✓

- **Build de producción**: exit 0; sin errores TS/template; bundle generado (Initial total 408.37 kB / ~95.30 kB transfer; lazy chunks intactos). Mismo perfil que `verification-4a.md`. ✓
- **`icon.component.ts`**: el cambio fue **puramente aditivo** (2 entradas nuevas al objeto `RAW`); la lógica del componente (stroke 1.5 escalado, viewBox 256, currentColor, aria-hidden, fallback a `question`) y el resto de los 61 glifos previos permanecen sin tocar → DC-027 intacto, ningún otro DC-xxx afectado. ✓
- Sin cambios colaterales en tokens, layouts, componentes, responsive ni BVC negativos: el set de íconos es la única superficie modificada y todos los demás DC-xxx ya estaban PASA en `verification-4a.md`. ✓

---

### Criterios Cubiertos ✓
- **DC-027 / BVC-014**: set único Phosphor regular, stroke 1.5, currentColor, todos los glifos referenciados ahora con path-data intencionado (0 fallback). → `icon.component.ts` + cross-check global.
- **DC-044 / DC-061 / DC-062 / DC-075**: chips de costo/pago y cards/eventos de tratamiento renderizan el glifo correcto (`currency-circle-dollar` / `sparkle`). → resuelto vía cierre del gap.
- Resto del checklist DC-xxx (tokens, layouts, componentes, responsive, estados, feedback, BVC negativos): ya PASA en `verification-4a.md`, sin regresión.

### Criterios SIN Cobertura ✗
- Ninguno.

### Scope Creep (sin DC-xxx asociado)
- Sin cambios respecto a `verification-4a.md`: persisten glifos definidos-no-usados-aún (`briefcase`, `eye`, `tag`, `percent`, `pill`, `map-pin`, `minus`, `dots-three-vertical`, `clipboard-text`, `file-text`, `circle`, `chat-circle-dots`, `megaphone`, `money`) como librería previsora para el paso 4b. **No bloqueante**, solo reportado.

---

### Resultado: PASA

GAP-1 cerrado: `currency-circle-dollar` y `sparkle` definidos con path-data oficial de Phosphor; cross-check global confirma 0 íconos referenciados sin definir; build de producción verde sin regresión de la cáscara visual. La cáscara visual queda íntegramente conforme al checklist DC-xxx. Listo para avanzar al paso 4b (verificación de lógica funcional/mock data por el Developer).
