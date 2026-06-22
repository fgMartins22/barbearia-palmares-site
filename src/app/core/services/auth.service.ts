import { Injectable } from '@angular/core';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

/** Assinatura mínima do unsubscribe retornado pelo onAuthStateChange. */
export interface AuthSubscription {
  unsubscribe: () => void;
}

/**
 * Autenticação do painel administrativo via Supabase Auth.
 * Usa apenas a anon/publishable key — nunca a service_role no frontend.
 * A segurança real vem do Supabase Auth + JWT + RLS (policies para o papel
 * `authenticated`).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private supabase: SupabaseService) {}

  /** Login por email e senha. */
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  /** Encerra a sessão. */
  async signOut(): Promise<void> {
    await this.supabase.client.auth.signOut();
  }

  /** Retorna a sessão atual (ou null). */
  async getSession(): Promise<Session | null> {
    const { data } = await this.supabase.client.auth.getSession();
    return data.session ?? null;
  }

  /** Retorna o usuário atual (ou null). */
  async getUser(): Promise<User | null> {
    const { data } = await this.supabase.client.auth.getUser();
    return data.user ?? null;
  }

  /** Há sessão válida? */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }

  /** Observa mudanças de autenticação (login/logout/expiração). */
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): AuthSubscription {
    const { data } = this.supabase.client.auth.onAuthStateChange(
      (event, session) => callback(event, session)
    );
    return data.subscription;
  }
}
