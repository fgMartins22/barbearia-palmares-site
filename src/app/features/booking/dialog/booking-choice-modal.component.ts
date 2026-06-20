import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { BrandIconComponent } from '../../../components/shared/brand-icon.component';
import { BookingMode } from './booking-dialog.service';

/** MODAL INICIAL — escolha entre agendar pelo WhatsApp ou pelo Site. */
@Component({
  selector: 'app-booking-choice-modal',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon, BrandIconComponent],
  template: `
    <div class="choice-head">
      <h2 class="choice-title">Como prefere <span class="gold">agendar</span>?</h2>
      <p class="choice-sub">Escolha a forma mais prática para você.</p>
    </div>

    <div class="choice-grid">
      <!-- WHATSAPP -->
      <button type="button" class="choice-card" (click)="choose.emit('whatsapp')">
        <span class="choice-icon whatsapp">
          <app-brand-icon name="whatsapp"></app-brand-icon>
        </span>
        <strong>Agendar pelo WhatsApp</strong>
        <p>Monte seu agendamento e envie tudo pronto para o nosso WhatsApp.</p>
      </button>

      <!-- SITE -->
      <button type="button" class="choice-card highlight" (click)="choose.emit('site')">
        <span class="badge-discount">10% OFF</span>
        <span class="choice-icon">
          <svg lucideIcon="calendar" class="icon icon-lg"></svg>
        </span>
        <strong>Agendar pelo Site</strong>
        <p>Reserve seu horário online em poucos passos.</p>
        <span class="discount-info">Ganhe 10% de desconto no valor do serviço</span>
      </button>
    </div>
  `,
  styleUrls: ['./booking-choice-modal.component.css'],
})
export class BookingChoiceModalComponent {
  @Output() choose = new EventEmitter<BookingMode>();
}
