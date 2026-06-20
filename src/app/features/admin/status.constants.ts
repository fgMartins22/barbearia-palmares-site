import { AppointmentStatus } from '../../core/models/appointment.model';

/** Rótulos legíveis de cada status. */
export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  rejected: 'Recusado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

/**
 * Classe CSS por status (cores definidas no CSS do dashboard):
 * pending -> dourado, confirmed -> verde, rejected -> vermelho,
 * completed -> azul/cinza, cancelled -> cinza.
 */
export const STATUS_CLASS: Record<AppointmentStatus, string> = {
  pending: 'st-pending',
  confirmed: 'st-confirmed',
  rejected: 'st-rejected',
  completed: 'st-completed',
  cancelled: 'st-cancelled',
};
