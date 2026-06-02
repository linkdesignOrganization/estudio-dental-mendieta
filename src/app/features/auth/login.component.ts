import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';

/**
 * Login (DEMO-005 / DC-034). Card centrada sobre canvas con split interno: panel
 * azul sobrio izq (NUNCA aurora) / formulario der. Sin sidebar ni header. Inputs
 * sutiles 40px. Botón "Ingresar como administradora" + link "Saltar login".
 * (Sin credenciales reales: ambos llevan a /reportes — la lógica la cablea 4b.)
 */
@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="login">
      <div class="login__card surface-card is-lg">
        <aside class="login__aside" aria-hidden="true">
          <div class="login__aside-inner">
            <span class="login__mark"><app-icon name="tooth" [size]="28" /></span>
            <p class="login__quote t-title">Una agenda serena, pacientes en el centro.</p>
            <p class="login__quote-sub t-body">El sistema de gestión de tu clínica, ordenado y a mano.</p>
          </div>
          <div class="login__deco login__deco--1"></div>
          <div class="login__deco login__deco--2"></div>
        </aside>

        <div class="login__form">
          <div class="login__brand">
            <span class="login__brand-name t-display">Estudio Dental Mendieta</span>
            <span class="login__brand-sub t-body t-secondary">Ingresá para gestionar tu clínica</span>
          </div>

          <form class="login__fields" (submit)="$event.preventDefault()">
            <div class="field">
              <label class="field__label" for="login-email">Correo</label>
              <input id="login-email" class="input-edm" type="email" autocomplete="username"
                     value="ana.dominguez@estudiomendieta.com" />
            </div>
            <div class="field">
              <label class="field__label" for="login-pass">Contraseña</label>
              <input id="login-pass" class="input-edm" type="password" autocomplete="current-password" value="········" />
            </div>

            <label class="login__remember">
              <input type="checkbox" class="login__check" checked />
              <span class="t-body">Recordarme en este equipo</span>
            </label>

            <a class="btn-edm btn-edm--deep btn-edm--block" routerLink="/reportes">
              <app-icon name="sign-out" [size]="18" /> Ingresar como administradora
            </a>
            <a class="login__skip t-body" routerLink="/reportes">Saltar login</a>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .login { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-bg); padding: var(--space-6); }
    .login__card {
      display: grid; grid-template-columns: 1fr 1fr; width: 100%; max-width: 880px;
      padding: 0; overflow: hidden;
    }
    .login__aside {
      position: relative; overflow: hidden; padding: var(--space-12) var(--space-8);
      background: linear-gradient(150deg, var(--color-accent-sky) 0%, #dcebf6 55%, #f3f9fd 100%);
      display: flex; flex-direction: column; justify-content: flex-end;
    }
    .login__aside-inner { position: relative; z-index: 2; display: flex; flex-direction: column; gap: var(--space-3); }
    .login__mark { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: var(--radius-md); background: var(--color-accent-deep); color: #fff; margin-bottom: var(--space-4); }
    .login__quote { color: var(--color-text); max-width: 22ch; }
    .login__quote-sub { color: var(--color-text); opacity: 0.75; max-width: 28ch; }
    .login__deco { position: absolute; border-radius: 50%; }
    .login__deco--1 { width: 200px; height: 200px; background: rgba(255,255,255,0.4); top: -60px; right: -40px; }
    .login__deco--2 { width: 120px; height: 120px; background: rgba(36,105,145,0.08); bottom: 40px; right: 30px; }
    .login__form { padding: var(--space-12) var(--space-8); display: flex; flex-direction: column; gap: var(--space-8); justify-content: center; }
    .login__brand { display: flex; flex-direction: column; gap: var(--space-2); }
    .login__brand-name { color: var(--color-text); }
    .login__fields { display: flex; flex-direction: column; gap: var(--space-4); }
    .login__remember { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; }
    .login__check { width: 18px; height: 18px; accent-color: var(--color-accent-deep); }
    .login__skip { text-align: center; color: var(--color-accent-deep); padding: var(--space-2); }
    .login__skip:hover { text-decoration: underline; }
    @media (max-width: 767px) {
      .login__card { grid-template-columns: 1fr; max-width: 420px; }
      .login__aside { display: none; }
      .login__form { padding: var(--space-8) var(--space-6); }
      /* Touch target ≥44px (DC-088): la label (objetivo clickeable del checkbox)
         alcanza 44px de alto; el checkbox visual crece a 24px. */
      .login__remember { min-height: var(--touch-target-min); }
      .login__check { width: 24px; height: 24px; }
      .login__skip { display: inline-flex; align-items: center; justify-content: center; min-height: var(--touch-target-min); }
    }
  `],
})
export class LoginComponent {}
