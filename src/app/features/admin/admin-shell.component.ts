import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';

import { BarberDashboardPageComponent } from './barber-dashboard-page.component';
import { AvailabilityPageComponent } from './availability-page.component';
import { AuthService, AuthSubscription } from '../../core/services/auth.service';

type AdminView = 'agenda' | 'disponibilidade';

/**
 * Casca do painel administrativo: menu lateral + área de conteúdo.
 * Protegido por Supabase Auth (adminAuthGuard na rota).
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
export class AdminShellComponent implements OnInit, OnDestroy {
  view: AdminView = 'agenda';
  loggingOut = false;

  private authSub?: AuthSubscription;
  private manualLogout = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Se a sessão expirar (refresh falhou) o Supabase emite SIGNED_OUT.
    // Nesse caso, mandamos para o login com aviso de sessão expirada.
    this.authSub = this.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && !this.manualLogout) {
        this.router.navigate(['/login-admin'], {
          queryParams: { expired: 1 },
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  setView(v: AdminView): void {
    this.view = v;
  }

  async logout(): Promise<void> {
    this.loggingOut = true;
    this.manualLogout = true;
    try {
      await this.auth.signOut();
    } finally {
      await this.router.navigate(['/login-admin']);
    }
  }
}
