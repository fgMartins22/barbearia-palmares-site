import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { BookingFlowData } from '../booking-flow.types';
import { BookingMode } from '../dialog/booking-dialog.service';
import { formatDateBR, formatPrice } from '../../../core/utils/booking-format.util';

/** RESUMO FINAL — confirmação antes de enviar. */
@Component({
  selector: 'app-booking-summary-step',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  template: `
    <h3 class="step-title">
      <span class="step-num">6</span> Confirme seu agendamento
    </h3>

    <ul class="summary-list">
      <li><span>Barbeiro</span><strong>{{ data.barber?.name }}</strong></li>
      <li><span>Serviço</span><strong>{{ data.service?.name }}</strong></li>
      <li>
        <span>Valor</span><strong class="gold">{{ price(data.service?.price || 0) }}</strong>
      </li>
      <li>
        <span>Duração</span><strong>{{ data.service?.durationMinutes }} minutos</strong>
      </li>
      <li><span>Data</span><strong>{{ dateBR(data.date) }}</strong></li>
      <li><span>Horário</span><strong>{{ data.time }}</strong></li>
      <li><span>Cliente</span><strong>{{ data.customerName }}</strong></li>
      <li><span>Telefone</span><strong>{{ data.customerPhone }}</strong></li>
      <li *ngIf="data.notes.trim()">
        <span>Observação</span><strong>{{ data.notes }}</strong>
      </li>
    </ul>

    <p *ngIf="mode === 'site'" class="discount-note">
      Você ganha 10% de desconto agendando pelo site.
    </p>

    <p *ngIf="errorMessage" class="field-msg error">{{ errorMessage }}</p>

    <div class="summary-actions">
      <button type="button" class="btn btn-ghost" (click)="back.emit()" [disabled]="submitting">
        <svg lucideIcon="arrow-left" class="icon"></svg> Voltar
      </button>
      <button type="button" class="btn btn-primary" (click)="confirm.emit()" [disabled]="submitting">
        <svg lucideIcon="check" class="icon"></svg>
        {{ submitting ? 'Enviando...' : confirmLabel }}
      </button>
    </div>
  `,
})
export class BookingSummaryStepComponent {
  @Input() data!: BookingFlowData;
  @Input() mode: BookingMode = 'site';
  @Input() submitting = false;
  @Input() errorMessage = '';

  @Output() back = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  dateBR = formatDateBR;
  price = formatPrice;

  get confirmLabel(): string {
    if (this.mode === 'whatsapp') return 'Enviar pelo WhatsApp';
    if (this.mode === 'internal') return 'Criar agendamento';
    return 'Confirmar agendamento';
  }
}
