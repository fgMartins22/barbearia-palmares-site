import { Barber } from '../models/barber.model';

/**
 * Barbeiros da Barbearia Palmares.
 * [EDITAR] Ajuste nomes/períodos conforme a escala real.
 * - Matheus trabalha de manhã e à noite.
 * - Thiago trabalha à tarde e à noite.
 */
export const BARBERS: Barber[] = [
  {
    id: 'thiago',
    name: 'Thiago',
    workPeriods: ['afternoon', 'night'],
  },
  {
    id: 'matheus',
    name: 'Matheus',
    workPeriods: ['morning', 'night'],
  },
];
