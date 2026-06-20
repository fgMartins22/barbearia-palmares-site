import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';

import { BarberDashboardPageComponent } from './barber-dashboard-page.component';
import { AvailabilityPageComponent } from './availability-page.component';

type AdminView = 'agenda' | 'disponibilidade';

/**
 * Casca do painel administrativo (Fase 2.3): menu lateral + área de conteúdo.
 *
 * ⚠️ Rota temporária e NÃO segura só por ter um nome difícil. Em produção,
 *    proteger com Supabase Auth. Não divulgar o link em áreas públicas.
 */
@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    CommonModule,
    LucideDynamicIcon,
    BarberDashboardPageComponent,
    AvailabilityPageComponent,
  ],
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.css'],
})
export class AdminShellComponent {
  view: AdminView = 'agenda';

  setView(v: AdminView): void {
    this.view = v;
  }
}
