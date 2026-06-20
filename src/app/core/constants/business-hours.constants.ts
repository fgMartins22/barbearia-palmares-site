import { WorkPeriod } from '../models/barber.model';

/** Intervalo de horário (formato "HH:mm"). */
export interface PeriodRange {
  start: string;
  end: string;
}

/**
 * Faixas de horário de cada período de trabalho.
 * [EDITAR] Ajuste os horários conforme o funcionamento real.
 */
export const WORK_PERIODS: Record<WorkPeriod, PeriodRange> = {
  morning: { start: '09:00', end: '12:00' },
  afternoon: { start: '13:00', end: '18:00' },
  night: { start: '18:00', end: '19:30' },
};

/** Intervalo entre os slots gerados (em minutos). */
export const SLOT_INTERVAL_MINUTES = 15;

/** Rótulos legíveis de cada período. */
export const PERIOD_LABELS: Record<WorkPeriod, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  night: 'Noite',
};

/**
 * Dias de funcionamento (terça a sábado).
 * Padrão JS de getDay(): 0=Domingo, 1=Segunda, ..., 6=Sábado.
 */
export const WORKING_DAYS = [2, 3, 4, 5, 6];
