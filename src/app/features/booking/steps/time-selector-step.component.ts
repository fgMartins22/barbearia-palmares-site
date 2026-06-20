import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/** ETAPA 4 — Seleção do horário. */
@Component({
  selector: 'app-time-selector-step',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3 class="step-title"><span class="step-num">4</span> Escolha o horário</h3>

    <p *ngIf="loading" class="field-msg muted">
      Carregando horários disponíveis...
    </p>

    <p
      *ngIf="!loading && slots.length === 0"
      class="field-msg warn"
    >
      Nenhum horário disponível para este barbeiro nesta data.
    </p>

    <div *ngIf="!loading && slots.length > 0" class="slots-grid">
      <button
        type="button"
        class="slot"
        *ngFor="let slot of slots"
        [class.selected]="selected === slot"
        (click)="select.emit(slot)"
      >
        {{ slot }}
      </button>
    </div>
  `,
})
export class TimeSelectorStepComponent {
  @Input() slots: string[] = [];
  @Input() loading = false;
  @Input() selected: string | null = null;
  @Output() select = new EventEmitter<string>();
}
