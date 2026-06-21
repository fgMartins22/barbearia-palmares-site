import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { LucideDynamicIcon } from '@lucide/angular';

import { BookingDialogService } from './booking-dialog.service';
import { BookingChoiceModalComponent } from './booking-choice-modal.component';
import { BookingStepperComponent } from '../booking-stepper.component';

/**
 * Host do modal de agendamento. Renderiza o overlay e alterna entre a tela de
 * escolha (WhatsApp/Site) e o passo a passo. Deve ser incluído uma única vez
 * (na landing). Qualquer botão abre via BookingDialogService.
 */
@Component({
  selector: 'app-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    LucideDynamicIcon,
    BookingChoiceModalComponent,
    BookingStepperComponent,
  ],
  templateUrl: './booking-dialog.component.html',
  styleUrls: ['./booking-dialog.component.css'],
  animations: [
    trigger('overlay', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('160ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('140ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('panel', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translate3d(0, 8px, 0) scale(0.98)' }),
        animate(
          '180ms ease-out',
          style({ opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' })
        ),
      ]),
    ]),
  ],
})
export class BookingDialogComponent {
  constructor(public dialog: BookingDialogService) {}

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.dialog.isOpen()) {
      this.dialog.close();
    }
  }
}
