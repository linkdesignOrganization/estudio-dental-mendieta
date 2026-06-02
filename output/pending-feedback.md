# Pending Feedback (para el Feedback Curator)

> Los agentes appendan su feedback de aprendizaje aquí (header `### Feedback de: {agente}`); el PM agrega feedback del cliente.
> El Feedback Curator lo procesa y distribuye en el paso 4j (Fase 4), 5i (cada iteración de Fase 5) y FASE R5 (Onboard).
> Procesado y truncado por última vez: Fase 4 (Construcción Visual) — clínica dental.

### Feedback de: devops
- Al hacer commit de cierre de fase (solo tests + docs, sin código de app), el CI/CD de Azure Static Web Apps se dispara igual pero termina verde en ~2min; conviene esperar a `gh run list` completed antes de retornar para confirmar que el deploy no rompe.
- En zsh, `status` es variable read-only del shell: nunca usarla como nombre de variable en scripts de polling de `gh run list` (rompe el loop con "read-only variable"). Usar nombres como `st`/`run_status`.
