import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** ETAPA 3 — Seleção da data. */
@Component({
  selector: 'app-date-selector-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h3 class="step-title"><span class="step-num">3</span> Escolha a data</h3>
    <input
      type="date"
      class="date-input"
      [min]="minDate"
      [ngModel]="value"
      (ngModelChange)="dateChange.emit($event)"
      name="bookingDate"
    />
    <p *ngIf="invalidMessage" class="field-msg warn">{{ invalidMessage }}</p>
    <p class="field-msg muted small">Atendemos de terça a sábado.</p>
  `,
})
export class DateSelectorStepComponent {
  @Input() value = '';
  @Input() minDate = '';
  @Input() invalidMessage = '';
  @Output() dateChange = new EventEmitter<string>();
}
