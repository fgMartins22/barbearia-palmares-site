import { Injectable } from '@angular/core';
import { SITE_CONFIG } from '../../../data/site-config';
import { BookingFlowData } from '../booking-flow.types';
import { formatDateBR } from '../../../core/utils/booking-format.util';

/**
 * Finaliza o agendamento pelo WhatsApp: monta a mensagem formatada e
 * redireciona para o wa.me da barbearia. Não grava no banco.
 */
@Injectable({ providedIn: 'root' })
export class WhatsappBookingHandler {
  handle(data: BookingFlowData): void {
    const number = SITE_CONFIG.whatsapp.replace(/\D/g, ''); // só dígitos
    const message = this.buildMessage(data);
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  }

  private buildMessage(data: BookingFlowData): string {
    const linhas = [
      'Olá!',
      `Gostaria de solicitar um agendamento para ${data.service?.name}, com o barbeiro ${data.barber?.name}.`,
      `Data: ${formatDateBR(data.date)} as ${data.time}`,
      `Nome: ${data.customerName.trim()}`,
      `Telefone: ${data.customerPhone.trim()}`,
    ];

    if (data.notes.trim().length > 0) {
      linhas.push(`Observação: ${data.notes.trim()}`);
    }

    linhas.push('Obrigado!');
    return linhas.join('\n');
  }
}
