import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Barber, WorkPeriod } from '../models/barber.model';
import { Service } from '../models/service.model';
import {
  Appointment,
  AppointmentStatus,
  CreateAppointmentPayload,
} from '../models/appointment.model';
import { BARBERS } from '../constants/barbers.constants';
import { SERVICES } from '../constants/services.constants';
import {
  WORK_PERIODS,
  SLOT_INTERVAL_MINUTES,
  WORKING_DAYS,
  PeriodRange,
} from '../constants/business-hours.constants';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly table = 'appointments';

  constructor(private supabase: SupabaseService) {}

  // ============================================================
  //  HELPERS DE TEMPO ("HH:mm" <-> minutos)
  // ============================================================

  /** Converte "HH:mm" (ou "HH:mm:ss") em minutos desde a meia-noite. */
  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  /** Converte minutos desde a meia-noite em "HH:mm". */
  private minutesToTime(total: number): string {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  /** Soma minutos a um horário "HH:mm" e retorna "HH:mm". */
  addMinutes(time: string, minutes: number): string {
    return this.minutesToTime(this.timeToMinutes(time) + minutes);
  }

  // ============================================================
  //  REGRAS DE NEGÓCIO
  // ============================================================

  /** Verifica se a data (YYYY-MM-DD) é um dia de funcionamento (ter–sáb). */
  isWorkingDay(date: string): boolean {
    const [y, m, d] = date.split('-').map(Number);
    const weekday = new Date(y, m - 1, d).getDay();
    return WORKING_DAYS.includes(weekday);
  }

  /**
   * Conflito de sobreposição:
   * novoStart < existenteEnd  E  novoEnd > existenteStart
   * (todos os parâmetros em "HH:mm").
   */
  hasOverlap(
    newStart: string,
    newEnd: string,
    existingStart: string,
    existingEnd: string
  ): boolean {
    const ns = this.timeToMinutes(newStart);
    const ne = this.timeToMinutes(newEnd);
    const es = this.timeToMinutes(existingStart);
    const ee = this.timeToMinutes(existingEnd);
    return ns < ee && ne > es;
  }

  /** O slot (início+fim) cabe inteiramente dentro do período de trabalho? */
  isSlotInsideWorkPeriod(
    slotStart: string,
    slotEnd: string,
    workPeriod: PeriodRange
  ): boolean {
    const s = this.timeToMinutes(slotStart);
    const e = this.timeToMinutes(slotEnd);
    return (
      s >= this.timeToMinutes(workPeriod.start) &&
      e <= this.timeToMinutes(workPeriod.end)
    );
  }

  /**
   * Gera todos os slots candidatos (início) para um barbeiro, considerando
   * a duração do serviço. Um slot só é válido se o serviço terminar dentro
   * do período. Slots em intervalos de SLOT_INTERVAL_MINUTES.
   */
  generateSlotsForBarber(barber: Barber, serviceDuration: number): string[] {
    const slots = new Set<string>();

    for (const periodKey of barber.workPeriods) {
      const period = WORK_PERIODS[periodKey as WorkPeriod];
      const periodStart = this.timeToMinutes(period.start);
      const periodEnd = this.timeToMinutes(period.end);

      for (
        let start = periodStart;
        start + serviceDuration <= periodEnd;
        start += SLOT_INTERVAL_MINUTES
      ) {
        slots.add(this.minutesToTime(start));
      }
    }

    // ordena cronologicamente
    return Array.from(slots).sort(
      (a, b) => this.timeToMinutes(a) - this.timeToMinutes(b)
    );
  }

  // ============================================================
  //  ACESSO AO SUPABASE
  // ============================================================

  /**
   * Busca os intervalos OCUPADOS de um barbeiro numa data, via função RPC
   * `get_busy_intervals` (que retorna apenas start_time e end_time dos
   * agendamentos pending/confirmed). Assim o frontend nunca lê a tabela
   * appointments diretamente, sem expor dados pessoais dos clientes.
   */
  async getBusyIntervals(
    barberId: string,
    date: string
  ): Promise<{ start_time: string; end_time: string }[]> {
    const { data, error } = await this.supabase.client.rpc(
      'get_busy_intervals',
      { p_barber_id: barberId, p_date: date }
    );

    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as { start_time: string; end_time: string }[];
  }

  /**
   * Versão "à prova de falhas" para o fluxo de agendamento. Tenta calcular os
   * horários considerando o banco (conflitos). Se o Supabase não estiver
   * acessível/configurado, faz fallback para os slots gerados (sem conflito),
   * para que o fluxo (especialmente o do WhatsApp) continue funcionando.
   */
  async getAvailableSlotsSafe(
    barberId: string,
    serviceId: string,
    date: string
  ): Promise<string[]> {
    try {
      return await this.getAvailableSlots(barberId, serviceId, date);
    } catch {
      return this.generateSlotsWithoutDb(barberId, serviceId, date);
    }
  }

  /** Slots válidos por período/duração e horário futuro, ignorando o banco. */
  generateSlotsWithoutDb(
    barberId: string,
    serviceId: string,
    date: string
  ): string[] {
    const barber = BARBERS.find((b) => b.id === barberId);
    const service = SERVICES.find((s) => s.id === serviceId);
    if (!barber || !service || !date) return [];
    if (!this.isWorkingDay(date) || this.isPastDate(date)) return [];

    const candidates = this.generateSlotsForBarber(
      barber,
      service.durationMinutes
    );
    const nowLimit = this.minNowLimitForDate(date);
    return candidates.filter(
      (slot) => nowLimit === null || this.timeToMinutes(slot) > nowLimit
    );
  }

  /**
   * Calcula os horários disponíveis para (barbeiro, serviço, data).
   * Considera período de trabalho, duração do serviço, sobreposição com
   * agendamentos existentes e horários no passado (se a data for hoje).
   */
  async getAvailableSlots(
    barberId: string,
    serviceId: string,
    date: string
  ): Promise<string[]> {
    const barber = BARBERS.find((b) => b.id === barberId);
    const service = SERVICES.find((s) => s.id === serviceId);

    if (!barber || !service || !date) {
      return [];
    }

    // Não funciona domingo/segunda nem datas passadas.
    if (!this.isWorkingDay(date) || this.isPastDate(date)) {
      return [];
    }

    const candidates = this.generateSlotsForBarber(
      barber,
      service.durationMinutes
    );

    const busy = await this.getBusyIntervals(barberId, date);

    const nowLimit = this.minNowLimitForDate(date);

    return candidates.filter((slotStart) => {
      const slotEnd = this.addMinutes(slotStart, service.durationMinutes);

      // Se for hoje, não oferecer horários que já passaram.
      if (nowLimit !== null && this.timeToMinutes(slotStart) <= nowLimit) {
        return false;
      }

      // Sem sobreposição com nenhum intervalo ocupado.
      const conflict = busy.some((ap) =>
        this.hasOverlap(
          slotStart,
          slotEnd,
          ap.start_time.slice(0, 5),
          ap.end_time.slice(0, 5)
        )
      );
      return !conflict;
    });
  }

  /**
   * Cria um agendamento. Por padrão entra como 'pending' e origem 'site'.
   * O painel administrativo pode criar agendamentos internos já 'confirmed'
   * passando `options` (status/source) — reaproveitando toda a validação.
   * Faz uma checagem final de sobreposição para reduzir condições de corrida.
   */
  async createAppointment(
    payload: CreateAppointmentPayload,
    options?: { status?: AppointmentStatus; source?: string }
  ): Promise<Appointment> {
    const barber = BARBERS.find((b) => b.id === payload.barberId);
    const service = SERVICES.find((s) => s.id === payload.serviceId);

    if (!barber || !service) {
      throw new Error('Barbeiro ou serviço inválido.');
    }
    if (!this.isWorkingDay(payload.date) || this.isPastDate(payload.date)) {
      throw new Error('Data inválida para agendamento.');
    }

    const startTime = payload.startTime;
    const endTime = this.addMinutes(startTime, service.durationMinutes);

    // Revalida o slot dentro de algum período do barbeiro.
    const fitsPeriod = barber.workPeriods.some((p) =>
      this.isSlotInsideWorkPeriod(startTime, endTime, WORK_PERIODS[p])
    );
    if (!fitsPeriod) {
      throw new Error('Horário fora do expediente do barbeiro.');
    }

    // Checagem final de conflito (via RPC). Tolerante a falha de sistema:
    // se a verificação não puder rodar, não bloqueia o envio — o insert é a
    // fonte de verdade.
    let busy: { start_time: string; end_time: string }[] = [];
    try {
      busy = await this.getBusyIntervals(payload.barberId, payload.date);
    } catch (e) {
      console.error(
        'Falha ao verificar horários ocupados (seguindo para o insert):',
        e
      );
    }
    const conflict = busy.some((ap) =>
      this.hasOverlap(
        startTime,
        endTime,
        ap.start_time.slice(0, 5),
        ap.end_time.slice(0, 5)
      )
    );
    if (conflict) {
      throw new Error(
        'Esse horário acabou de ser ocupado. Escolha outro, por favor.'
      );
    }

    const row: Appointment = {
      customer_name: payload.customerName.trim(),
      customer_phone: payload.customerPhone.trim(),
      barber_id: barber.id,
      barber_name: barber.name,
      service_id: service.id,
      service_name: service.name,
      service_price: service.price,
      service_duration_minutes: service.durationMinutes,
      appointment_date: payload.date,
      start_time: `${startTime}:00`,
      end_time: `${endTime}:00`,
      status: options?.status ?? 'pending', // site = pending; interno = confirmed
      source: options?.source ?? 'site',
      notes: payload.notes?.trim() || null,
    };

    // Insert na tabela 'appointments' usando a anon/publishable key do
    // environment (via SupabaseService). NÃO usamos .select() depois do
    // insert: assim não exigimos policy de SELECT para o papel anônimo
    // (privacidade) e evitamos o 401 ao tentar ler a linha de volta.
    const { error } = await this.supabase.client.from(this.table).insert(row);

    if (error) {
      // Erro técnico só no console; mensagem amigável para o usuário.
      console.error('Erro ao criar agendamento no Supabase:', error);
      throw new Error(
        'Não foi possível enviar seu agendamento. Verifique a configuração do sistema.'
      );
    }

    return row;
  }

  // ============================================================
  //  HELPERS DE DATA "HOJE"
  // ============================================================

  /** A data (YYYY-MM-DD) é anterior a hoje? */
  private isPastDate(date: string): boolean {
    const [y, m, d] = date.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return target.getTime() < today.getTime();
  }

  /**
   * Se a data for hoje, retorna o "agora" em minutos (para esconder horários
   * que já passaram). Caso contrário, retorna null (sem limite).
   */
  private minNowLimitForDate(date: string): number | null {
    const [y, m, d] = date.split('-').map(Number);
    const today = new Date();
    const isToday =
      today.getFullYear() === y &&
      today.getMonth() === m - 1 &&
      today.getDate() === d;
    if (!isToday) {
      return null;
    }
    return today.getHours() * 60 + today.getMinutes();
  }
}
