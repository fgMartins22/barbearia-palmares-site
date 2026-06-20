import { Injectable } from '@angular/core';
import { AdminBookingService } from '../../../core/services/admin-booking.service';
import { BookingFlowData } from '../booking-flow.types';

/**
 * Finaliza o agendamento INTERNO (painel dos barbeiros): grava no Supabase já
 * como 'confirmed' e com origem 'internal'. Reaproveita o mesmo fluxo de
 * etapas usado pelo cliente.
 */
@Injectable({ providedIn: 'root' })
export class InternalBookingHandler {
  constructor(private admin: AdminBookingService) {}

  async handle(data: BookingFlowData): Promise<void> {
    if (!data.barber || !data.service || !data.time) {
      throw new Error('Dados incompletos para o agendamento.');
    }

    await this.admin.createInternalAppointment({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      barberId: data.barber.id,
      serviceId: data.service.id,
      date: data.date,
      startTime: data.time,
      notes: data.notes,
    });
  }
}
