# Progreso de Capturas — FASE 3.0

> Fuente de verdad del PM para saber qué capturas están hechas y cuáles faltan.
> Si el contexto fue compactado, LEE ESTE ARCHIVO PRIMERO para retomar.
> Referencia única: Task Dasher (https://task-dasher.webflow.io/). No hay sitio de cliente real ni competidores (viewcase ficticio).
> Ejecución SECUENCIAL — un site-capturer a la vez, verificar antes de lanzar el siguiente.

## Checklist de URLs

| # | Tipo | URL | Prefijo | Directorio | Estado | PNGs | Notas (qué observar) |
|---|---|---|---|---|---|---|---|
| 1 | Ref principal | https://task-dasher.webflow.io/profile | td-profile | references/task-dasher/ | COMPLETADO | 6 | LA MÁS IMPORTANTE → ficha del paciente: foto grande izq, nombre grande arriba, datos al lado, badges de alerta, una acción primaria, sistema de tabs debajo |
| 2 | Ref principal | https://task-dasher.webflow.io/contacts | td-contacts | references/task-dasher/ | COMPLETADO | 6 | → lista de pacientes: lista con foto, nombre, datos clave, status, acciones rápidas inline |
| 3 | Ref principal | https://task-dasher.webflow.io/ | td-home | references/task-dasher/ | COMPLETADO | 6 | → dashboard/cards: cards de proyectos con % grande + "Progress" + barra, lista de tasks con avatares, sidebar limpio (logo + items icono+label), header (search contextual + notif + avatar) |
| 4 | Ref principal | https://task-dasher.webflow.io/companies | td-companies | references/task-dasher/ | COMPLETADO | 4 | → obras sociales: cards con logo, ubicación/métricas, status, prioridad, progreso milestones (5 de 8), avatares overlapping del equipo |
| 5 | Ref principal | https://task-dasher.webflow.io/utilities/style-guide | td-styleguide | references/task-dasher/ | COMPLETADO | 14 | → design tokens: jerarquía tipográfica, colores, componentes, badges de estado/prioridad/progreso |
| 6 | Ref principal | https://task-dasher.webflow.io/sign-in | td-signin | references/task-dasher/ | COMPLETADO | 7 | → login mock: formulario centrado, estética simple |
| 7 | Ref principal | https://task-dasher.webflow.io/notifications | td-notifications | references/task-dasher/ | COMPLETADO | 3 | → notificaciones internas: patrón de lista de notificaciones |
| 8 | Ref principal | https://task-dasher.webflow.io/messages | td-messages | references/task-dasher/ | COMPLETADO | 3 | → patrones de lista, badges, avatares, "last updated" relativo |

## Asignación a site-capturers (secuencial)
- Capturer 1 → URLs #1 (profile) + #2 (contacts)
- Capturer 2 → URLs #3 (home) + #4 (companies)
- Capturer 3 → URLs #5 (style-guide) + #6 (sign-in)
- Capturer 4 → URLs #7 (notifications) + #8 (messages)

Cada captura: mínimo 1 desktop (1440px) + 1 mobile (390px). Páginas largas → captura full-page.

## Resumen
- Total URLs: 8
- Completadas: 8
- Fallidas: 0
- Pendientes: 0
