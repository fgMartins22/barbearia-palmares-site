import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { SERVICOS } from '../../data/mock-data';
import { BookingDialogService } from '../../features/booking/dialog/booking-dialog.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css'],
})
export class ServicesComponent {
  servicos = SERVICOS;

  constructor(private bookingDialog: BookingDialogService) {}

  /** Abre direto o agendamento pelo site, com o serviço já selecionado. */
  agendar(bookingId: string): void {
    this.bookingDialog.openSite(bookingId);
  }
}
