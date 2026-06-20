import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Service } from '../../../core/models/service.model';
import { SERVICES } from '../../../core/constants/services.constants';
import { formatPrice } from '../../../core/utils/booking-format.util';

/** ETAPA 2 — Seleção do serviço. */
@Component({
  selector: 'app-service-selector-step',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3 class="step-title"><span class="step-num">2</span> Tipo de serviço</h3>
    <div class="cards-grid four">
      <button
        type="button"
        class="select-card service-card"
        *ngFor="let s of services"
        [class.selected]="selectedId === s.id"
        (click)="select.emit(s)"
      >
        <strong>{{ s.name }}</strong>
        <span class="service-price">{{ price(s.price) }}</span>
        <span class="service-duration">{{ s.durationMinutes }} min</span>
      </button>
    </div>
  `,
})
export class ServiceSelectorStepComponent {
  @Input() selectedId: string | null = null;
  @Output() select = new EventEmitter<Service>();

  services = SERVICES;
  price = formatPrice;
}
