import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Responsável por inicializar e expor o client do Supabase.
 * As credenciais vêm do environment (nunca hardcoded nos componentes).
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly _client: SupabaseClient;

  constructor() {
    this._client = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  /** Client do Supabase pronto para uso. */
  get client(): SupabaseClient {
    return this._client;
  }
}
