import { Barber } from '../../core/models/barber.model';
import { Service } from '../../core/models/service.model';

/** Dados acumulados ao longo do passo a passo de agendamento. */
export interface BookingFlowData {
  barber: Barber | null;
  service: Service | null;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:mm
  customerName: string;
  customerPhone: string;
  notes: string;
}

/** Dados do cliente (etapa 5). */
export interface CustomerData {
  name: string;
  phone: string;
  notes: string;
}

/** Estado inicial vazio do fluxo. */
export function emptyBookingFlow(): BookingFlowData {
  return {
    barber: null,
    service: null,
    date: '',
    time: null,
    customerName: '',
    customerPhone: '',
    notes: '',
  };
}
