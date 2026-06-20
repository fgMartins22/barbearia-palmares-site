import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BookingService } from './booking.service';
import {
  Appointment,
  AppointmentStatus,
  CreateAppointmentPayload,
} from '../models/appointment.model';

/** Filtros do painel administrativo. */
export interface AdminFilters {
  barberId?: string; // 'thiago' | 'matheus' | undefined (todos)
  status?: AppointmentStatus; // undefined = todos
  search?: string; // busca por nome do cliente
}

/** Status que entram no histórico de decisões (nunca 'pending'). */
const HISTORY_STATUSES: AppointmentStatus[] = [
  'confirmed',
  'rejected',
  'cancelled',
  'completed',
];

/**
 * Acesso administrativo aos agendamentos (painel dos barbeiros).
 *
 * ⚠️ Esta camada usa a anon key temporariamente, pois ainda não há login.
 *    Em produção, migrar para Supabase Auth (role authenticated) e ajustar
 *    as policies. O frontend só atualiza o campo `status` (nunca dados
 *    pessoais do cliente) — a coluna é restrita também via grant no banco.
 *    NÃO usamos DELETE físico: exclusão é lógica (status = 'cancelled').
 */
@Injectable({ providedIn: 'root' })
export class AdminBookingService {
  private readonly table = 'appointments';

  constructor(
    private supabase: SupabaseService,
    private booking: BookingService
  ) {}

  /** Busca todos os agendamentos de um mês (month: 0-11, padrão JS). */
  async getAppointmentsByMonth(
    year: number,
    month: number
  ): Promise<Appointment[]> {
    const start = this.firstDayOfMonth(year, month);
    const end = this.lastDayOfMonth(year, month);

    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .gte('appointment_date', start)
      .lte('appointment_date', end)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as Appointment[];
  }

  /** Busca com filtros opcionais (barbeiro, status, nome do cliente). */
  async getAppointmentsByFilters(
    filters: AdminFilters
  ): Promise<Appointment[]> {
    let query = this.supabase.client.from(this.table).select('*');

    if (filters.barberId) {
      query = query.eq('barber_id', filters.barberId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.search && filters.search.trim()) {
      query = query.ilike('customer_name', `%${filters.search.trim()}%`);
    }

    const { data, error } = await query
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as Appointment[];
  }

  /** Busca agendamentos por status (em qualquer data). */
  async getAppointmentsByStatus(
    status: AppointmentStatus
  ): Promise<Appointment[]> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .eq('status', status)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as Appointment[];
  }

  /**
   * Histórico de decisões de um mês: agendamentos que já saíram de 'pending'
   * (confirmed/rejected/cancelled/completed). Filtra pela data do atendimento.
   */
  async getAuditHistory(year: number, month: number): Promise<Appointment[]> {
    const start = this.firstDayOfMonth(year, month);
    const end = this.lastDayOfMonth(year, month);

    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .gte('appointment_date', start)
      .lte('appointment_date', end)
      .in('status', HISTORY_STATUSES)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as Appointment[];
  }

  /**
   * Faturamento previsto do mês: soma de service_price dos agendamentos
   * confirmados e concluídos.
   */
  async getMonthlyRevenue(year: number, month: number): Promise<number> {
    const start = this.firstDayOfMonth(year, month);
    const end = this.lastDayOfMonth(year, month);

    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('service_price, status, appointment_date')
      .gte('appointment_date', start)
      .lte('appointment_date', end)
      .in('status', ['confirmed', 'completed']);

    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []).reduce(
      (sum, r) => sum + Number((r as Appointment).service_price || 0),
      0
    );
  }

  /**
   * Cria um agendamento INTERNO (pelo painel): já entra como 'confirmed' e
   * origem 'internal'. Reaproveita toda a validação do BookingService.
   */
  async createInternalAppointment(
    payload: CreateAppointmentPayload
  ): Promise<Appointment> {
    return this.booking.createAppointment(payload, {
      status: 'confirmed',
      source: 'internal',
    });
  }

  /**
   * Atualiza SOMENTE o status do agendamento (e updated_at, caso o trigger
   * do banco não esteja ativo). Nunca toca em dados pessoais.
   */
  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus
  ): Promise<void> {
    const { error } = await this.supabase.client
      .from(this.table)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status no Supabase:', error);
      throw new Error(
        'Não foi possível atualizar o agendamento. Tente novamente.'
      );
    }
  }

  /**
   * Exclusão LÓGICA: marca o agendamento como 'cancelled' (mantém histórico
   * e auditoria). NÃO faz DELETE físico no banco.
   */
  async cancelAppointment(id: string): Promise<void> {
    return this.updateAppointmentStatus(id, 'cancelled');
  }

  // ---------------- helpers de data ----------------
  private firstDayOfMonth(year: number, month: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-01`;
  }

  private lastDayOfMonth(year: number, month: number): string {
    const last = new Date(year, month + 1, 0).getDate();
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(
      last
    ).padStart(2, '0')}`;
  }
}
