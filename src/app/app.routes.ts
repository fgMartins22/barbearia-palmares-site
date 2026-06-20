import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';

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

  // ⚠️ PAINEL ADMINISTRATIVO (Fase 2.2) — rota interna dos barbeiros.
  // Esta rota é TEMPORÁRIA e NÃO é segura só por ter um nome difícil.
  // Em produção, substituir por autenticação Supabase Auth.
  // Não divulgar/expor este link em áreas públicas (header/footer/menu).
  {
    path: 'painel-palmares-agenda-2026',
    loadComponent: () =>
      import('./features/admin/admin-shell.component').then(
        (m) => m.AdminShellComponent
      ),
  },

  // Qualquer outra rota volta para a landing
  { path: '**', redirectTo: '' },
];
