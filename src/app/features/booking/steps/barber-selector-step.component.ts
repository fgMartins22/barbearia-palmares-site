import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { Barber } from '../../../core/models/barber.model';
import { BARBERS } from '../../../core/constants/barbers.constants';
import { describeBarberSchedule } from '../../../core/utils/booking-format.util';

/** ETAPA 1 — Seleção de barbeiro. */
@Component({
  selector: 'app-barber-selector-step',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  template: `
    <h3 class="step-title"><span class="step-num">1</span> Escolha o barbeiro</h3>
    <div class="cards-grid two">
      <button
        type="button"
        class="select-card"
        *ngFor="let b of barbers"
        [class.selected]="selectedId === b.id"
        (click)="select.emit(b)"
      >
        <svg lucideIcon="user" class="icon icon-lg"></svg>
        <strong>{{ b.name }}</strong>
        <small>{{ schedule(b) }}</small>
      </button>
    </div>
  `,
})
export class BarberSelectorStepComponent {
  @Input() selectedId: string | null = null;
  @Output() select = new EventEmitter<Barber>();

  barbers = BARBERS;
  schedule = describeBarberSchedule;
}
