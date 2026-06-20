import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerData } from '../booking-flow.types';
import { maskPhoneBR } from '../../../core/utils/booking-format.util';

/** ETAPA 5 — Dados do cliente (com máscara e limites de caracteres). */
@Component({
  selector: 'app-customer-data-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h3 class="step-title"><span class="step-num">5</span> Seus dados</h3>
    <div class="fields">
      <label class="field">
        <span>Nome completo *</span>
        <input
          type="text"
          [ngModel]="name"
          (ngModelChange)="onName($event)"
          name="customerName"
          maxlength="50"
          placeholder="Seu nome completo"
          autocomplete="name"
        />
        <small class="counter">{{ name.length }}/50</small>
      </label>

      <label class="field">
        <span>Telefone (WhatsApp) *</span>
        <input
          type="tel"
          [ngModel]="phone"
          (ngModelChange)="onPhone($event)"
          name="customerPhone"
          maxlength="16"
          inputmode="tel"
          placeholder="(51) 99999-9999"
          autocomplete="tel"
        />
      </label>

      <label class="field full">
        <span>Observação (opcional)</span>
        <textarea
          [ngModel]="notes"
          (ngModelChange)="onNotes($event)"
          name="notes"
          rows="2"
          maxlength="300"
          placeholder="Alguma informação adicional para o barbeiro?"
        ></textarea>
        <small class="counter">{{ notes.length }}/300</small>
      </label>
    </div>
  `,
})
export class CustomerDataStepComponent {
  @Input() name = '';
  @Input() phone = '';
  @Input() notes = '';

  @Output() valueChange = new EventEmitter<CustomerData>();

  onName(value: string): void {
    this.name = value.slice(0, 50);
    this.emit();
  }

  onPhone(value: string): void {
    this.phone = maskPhoneBR(value);
    this.emit();
  }

  onNotes(value: string): void {
    this.notes = value.slice(0, 300);
    this.emit();
  }

  private emit(): void {
    this.valueChange.emit({
      name: this.name,
      phone: this.phone,
      notes: this.notes,
    });
  }
}
