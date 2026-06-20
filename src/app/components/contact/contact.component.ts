import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { SITE_CONFIG } from '../../data/site-config';
import { BrandIconComponent } from '../shared/brand-icon.component';
import { BookingDialogService } from '../../features/booking/dialog/booking-dialog.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon, BrandIconComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  instagram = SITE_CONFIG.instagram;
  telefone = SITE_CONFIG.telefoneExibicao;
  // Apenas dígitos, para o link tel: (ex.: 5551984217009)
  telefoneDigits = '55' + SITE_CONFIG.telefoneExibicao.replace(/\D/g, '');

  constructor(private bookingDialog: BookingDialogService) {}

  agendar(): void {
    this.bookingDialog.openChoice();
  }
}
