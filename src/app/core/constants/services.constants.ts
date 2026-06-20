import { Service } from '../models/service.model';

/**
 * Serviços oferecidos. A duração influencia diretamente os
 * horários disponíveis (o serviço precisa caber no expediente).
 * [EDITAR] Ajuste preços e durações conforme necessário.
 */
export const SERVICES: Service[] = [
  { id: 'corte', name: 'Corte', price: 40, durationMinutes: 40 },
  { id: 'barba', name: 'Barba', price: 45, durationMinutes: 45 },
  { id: 'corte_barba', name: 'Corte + Barba', price: 70, durationMinutes: 70 },
  { id: 'acabamento', name: 'Acabamento', price: 15, durationMinutes: 15 },
];
