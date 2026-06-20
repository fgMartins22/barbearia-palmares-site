import { Barber } from '../models/barber.model';
import {
  WORK_PERIODS,
  PERIOD_LABELS,
} from '../constants/business-hours.constants';

/** Formata um valor numérico como "R$ 40,00". */
export function formatPrice(value: number): string {
  return 'R$ ' + value.toFixed(2).replace('.', ',');
}

/** "09:00" -> "9h", "19:30" -> "19h30". */
function shortHour(time: string): string {
  const [h, m] = time.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

/**
 * Descreve os horários de atendimento de um barbeiro de forma legível.
 * Ex.: "Tarde (13h–18h) e Noite (18h–19h30)".
 */
export function describeBarberSchedule(barber: Barber): string {
  return barber.workPeriods
    .map((p) => {
      const range = WORK_PERIODS[p];
      return `${PERIOD_LABELS[p]} (${shortHour(range.start)}–${shortHour(
        range.end
      )})`;
    })
    .join(' e ');
}

/** Converte "YYYY-MM-DD" em "DD/MM/YYYY". */
export function formatDateBR(isoDate: string): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Aplica a máscara brasileira de telefone enquanto o usuário digita.
 * Ex.: "51999998888" -> "(51) 99999-8888".
 * Limita a 11 dígitos (DDD + 9 dígitos).
 */
export function maskPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
