import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Tela de login do painel administrativo (Supabase Auth).
 * Usuários (Thiago/Matheus) são criados manualmente no Supabase Dashboard.
 */
@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.css'],
})
export class LoginAdminComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    route: ActivatedRoute
  ) {
    // Mensagem quando a sessão expira e o usuário é redirecionado para cá.
    if (route.snapshot.queryParamMap.get('expired')) {
      this.errorMessage = 'Sua sessão expirou. Faça login novamente.';
    }
  }

  get canSubmit(): boolean {
    return this.email.trim().length > 0 && this.password.length > 0;
  }

  async submit(): Promise<void> {
    if (!this.canSubmit || this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    try {
      await this.auth.signIn(this.email.trim(), this.password);
      await this.router.navigate(['/painel-palmares-agenda-2026']);
    } catch (e) {
      console.error('Falha no login:', e);
      this.errorMessage = 'Email ou senha inválidos. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }
}
