import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Protege o painel administrativo: exige sessão válida do Supabase Auth.
 * Sem sessão, redireciona para /login-admin.
 */
export const adminAuthGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (await auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login-admin']);
};

/**
 * Impede o acesso à tela de login quando já há sessão válida:
 * redireciona direto para o painel.
 */
export const loginRedirectGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (await auth.isAuthenticated()) {
    return router.createUrlTree(['/painel-palmares-agenda-2026']);
  }
  return true;
};
