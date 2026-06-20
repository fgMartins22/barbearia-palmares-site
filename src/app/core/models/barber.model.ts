/** Períodos de trabalho possíveis ao longo do dia. */
export type WorkPeriod = 'morning' | 'afternoon' | 'night';

/** Barbeiro da barbearia. */
export interface Barber {
  id: string;
  name: string;
  workPeriods: WorkPeriod[];
}
