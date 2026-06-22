import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import {
  adminAuthGuard,
  loginRedirectGuard,
} from './core/guards/admin-auth.guard';

export const routes: Routes = [
  // Página inicial (landing)
  { path: '', component: LandingComponent },

  // Fluxo de agendamento (carregado sob demanda)
  {
    path: 'agendar',
    loadComponent: () =>
      import('./features/booking/booking-page.component').then(
        (m) => m.BookingPageComponent
      ),
  },

  // Login do painel administrativo (Supabase Auth).
  // Se já estiver logado, o guard redireciona para o painel.
  {
    path: 'login-admin',
    canActivate: [loginRedirectGuard],
    loadComponent: () =>
      import('./features/admin/login-admin.component').then(
        (m) => m.LoginAdminComponent
      ),
  },

  // ⚠️ PAINEL ADMINISTRATIVO — protegido por Supabase Auth (adminAuthGuard).
  // Sem sessão válida, redireciona para /login-admin.
  // Não divulgar/expor este link em áreas públicas (header/footer/menu).
  {
    path: 'painel-palmares-agenda-2026',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/admin/admin-shell.component').then(
        (m) => m.AdminShellComponent
      ),
  },

  // Qualquer outra rota volta para a landing
  { path: '**', redirectTo: '' },
];
