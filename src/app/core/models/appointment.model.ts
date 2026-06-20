/** Status possíveis de um agendamento. */
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'completed'
  | 'cancelled';

/**
 * Linha da tabela `appointments` no Supabase.
 * Os nomes seguem exatamente as colunas do banco (snake_case).
 */
export interface Appointment {
  id?: string;
  customer_name: string;
  customer_phone: string;
  barber_id: string;
  barber_name: string;
  service_id: string;
  service_name: string;
  service_price: number;
  service_duration_minutes: number;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  status: AppointmentStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string | null;
  // Origem do agendamento: 'site' (cliente) ou 'internal' (criado no painel).
  source?: string | null;
}

/** Dados enviados pelo formulário para criar um agendamento. */
export interface CreateAppointmentPayload {
  customerName: string;
  customerPhone: string;
  barberId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  notes?: string;
}
