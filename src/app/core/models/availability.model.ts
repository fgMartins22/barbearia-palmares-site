/**
 * Linha da tabela `barber_availability` no Supabase.
 * Só existe registro quando há alteração manual (bloqueio/reabertura) de um
 * horário; por padrão todos os horários são considerados disponíveis.
 */
export interface BarberAvailability {
  id?: string;
  barber_id: string;
  barber_name: string;
  availability_date: string; // YYYY-MM-DD
  time_slot: string; // HH:mm:ss
  is_available: boolean;
  reason?: string | null;
  created_at?: string;
  updated_at?: string | null;
}
