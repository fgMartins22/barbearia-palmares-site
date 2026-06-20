import { Injectable } from '@angular/core';
import { BookingService } from '../../../core/services/booking.service';
import { BookingFlowData } from '../booking-flow.types';

/**
 * Finaliza o agendamento pelo SITE: grava no Supabase com status 'pending'
 * através do BookingService.
 */
@Injectable({ providedIn: 'root' })
export class SiteBookingHandler {
  constructor(private booking: BookingService) {}

  async handle(data: BookingFlowData): Promise<void> {
    if (!data.barber || !data.service || !data.time) {
      throw new Error('Dados incompletos para o agendamento.');
    }

    await this.booking.createAppointment({
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
