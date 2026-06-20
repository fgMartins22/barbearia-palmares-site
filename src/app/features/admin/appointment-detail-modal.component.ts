import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { Appointment } from '../../core/models/appointment.model';
import { formatDateBR, formatPrice } from '../../core/utils/booking-format.util';
import { STATUS_LABELS } from './status.constants';

/**
 * Modal de detalhes de um agendamento, com ações que dependem do status:
 * - pending:   Confirmar, Recusar, Excluir
 * - confirmed: Concluir, Excluir
 * - rejected:  Reativar (-> pending), Excluir
 * - completed: apenas visualizar
 * - cancelled: apenas visualizar
 */
@Component({
  selector: 'app-appointment-detail-modal',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './appointment-detail-modal.component.html',
  styleUrls: ['./appointment-detail-modal.component.css'],
})
export class AppointmentDetailModalComponent {
  @Input({ required: true }) appointment!: Appointment;
  @Input() submitting = false;

  @Output() confirm = new EventEmitter<Appointment>();
  @Output() reject = new EventEmitter<Appointment>();
  @Output() complete = new EventEmitter<Appointment>();
  @Output() reactivate = new EventEmitter<Appointment>();
  @Output() remove = new EventEmitter<Appointment>();
  @Output() close = new EventEmitter<void>();

  statusLabels = STATUS_LABELS;
  dateBR = formatDateBR;
  price = formatPrice;

  get isInternal(): boolean {
    return this.appointment.source === 'internal';
  }

  hhmm(time: string | undefined | null): string {
    return time ? time.slice(0, 5) : '';
  }

  fmtDateTime(iso: string | undefined | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('pt-BR');
  }
}
