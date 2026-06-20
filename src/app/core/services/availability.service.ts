import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BookingService } from './booking.service';
import { BARBERS } from '../constants/barbers.constants';
import { SLOT_INTERVAL_MINUTES } from '../constants/business-hours.constants';
import { BarberAvailability } from '../models/availability.model';

/**
 * Gerencia a disponibilidade manual dos barbeiros (Fase 2.3).
 *
 * ⚠️ Usa a anon key temporariamente (painel sem login). Substituir por
 *    Supabase Auth em produção.
 */
@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly table = 'barber_availability';

  constructor(
    private supabase: SupabaseService,
    private booking: BookingService
  ) {}

  /** Grade completa de horários (HH:mm) do barbeiro num dia (15 em 15 min). */
  getDayGrid(barberId: string): string[] {
    const barber = BARBERS.find((b) => b.id === barberId);
    if (!barber) return [];
    return this.booking.generateSlotsForBarber(barber, SLOT_INTERVAL_MINUTES);
  }

  /** Retorna todas as linhas de disponibilidade de um barbeiro numa data. */
  async getAvailability(
    barberId: string,
    date: string
  ): Promise<BarberAvailability[]> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .eq('barber_id', barberId)
      .eq('availability_date', date)
      .order('time_slot', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as BarberAvailability[];
  }

  /** Apenas os horários bloqueados (HH:mm) de um barbeiro numa data. */
  async getBlockedSlots(barberId: string, date: string): Promise<string[]> {
    const rows = await this.getAvailability(barberId, date);
    return rows
      .filter((r) => r.is_available === false)
      .map((r) => r.time_slot.slice(0, 5));
  }

  /** Alterna um horário: define is_available (true = liberar, false = bloquear). */
  async toggleTimeSlot(
    barberId: string,
    barberName: string,
    date: string,
    timeSlot: string,
    isAvailable: boolean,
    reason?: string
  ): Promise<void> {
    await this.upsertSlots(barberId, barberName, date, [timeSlot], isAvailable, reason);
  }

  /** Bloqueia todos os horários entre startTime e endTime (exclusive end). */
  async blockTimeRange(
    barberId: string,
    barberName: string,
    date: string,
    startTime: string,
    endTime: string,
    reason?: string
  ): Promise<void> {
    const slots = this.rangeSlots(startTime, endTime);
    if (slots.length === 0) return;
    await this.upsertSlots(barberId, barberName, date, slots, false, reason);
  }

  /** Bloqueia o dia inteiro (toda a grade de trabalho do barbeiro). */
  async blockFullDay(
    barberId: string,
    barberName: string,
    date: string,
    reason?: string
  ): Promise<void> {
    const slots = this.getDayGrid(barberId);
    if (slots.length === 0) return;
    await this.upsertSlots(barberId, barberName, date, slots, false, reason);
  }

  /** Linhas bloqueadas de um barbeiro num intervalo de datas (indicadores). */
  async getBlockedBetween(
    barberId: string,
    startDate: string,
    endDate: string
  ): Promise<BarberAvailability[]> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .eq('barber_id', barberId)
      .eq('is_available', false)
      .gte('availability_date', startDate)
      .lte('availability_date', endDate)
      .order('availability_date', { ascending: true })
      .order('time_slot', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as BarberAvailability[];
  }

  /** Próximo dia (>= hoje) com algum horário bloqueado. Null se não houver. */
  async getNextBlockedDay(
    barberId: string,
    fromDate: string
  ): Promise<string | null> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('availability_date')
      .eq('barber_id', barberId)
      .eq('is_available', false)
      .gte('availability_date', fromDate)
      .order('availability_date', { ascending: true })
      .limit(1);

    if (error) throw new Error(error.message);
    const row = (data ?? [])[0] as { availability_date: string } | undefined;
    return row?.availability_date ?? null;
  }

  // ---------------- internos ----------------
  private async upsertSlots(
    barberId: string,
    barberName: string,
    date: string,
    slots: string[],
    isAvailable: boolean,
    reason?: string
  ): Promise<void> {
    const rows: BarberAvailability[] = slots.map((s) => ({
      barber_id: barberId,
      barber_name: barberName,
      availability_date: date,
      time_slot: `${s}:00`,
      is_available: isAvailable,
      reason: isAvailable ? null : reason?.trim() || null,
    }));

    const { error } = await this.supabase.client
      .from(this.table)
      .upsert(rows, { onConflict: 'barber_id,availability_date,time_slot' });

    if (error) {
      console.error('Erro ao salvar disponibilidade no Supabase:', error);
      throw new Error('Não foi possível salvar a disponibilidade.');
    }
  }

  /** Gera horários "HH:mm" de start (incl.) até end (excl.), de 15 em 15 min. */
  private rangeSlots(startTime: string, endTime: string): string[] {
    const start = this.toMinutes(startTime);
    const end = this.toMinutes(endTime);
    const out: string[] = [];
    for (let m = start; m < end; m += SLOT_INTERVAL_MINUTES) {
      out.push(this.toTime(m));
    }
    return out;
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private toTime(total: number): string {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}
