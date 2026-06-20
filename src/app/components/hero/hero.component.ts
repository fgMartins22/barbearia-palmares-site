import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { SITE_CONFIG } from '../../data/site-config';
import { BrandIconComponent } from '../shared/brand-icon.component';
import { BookingDialogService } from '../../features/booking/dialog/booking-dialog.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon, BrandIconComponent],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
})
export class HeroComponent {
  instagram = SITE_CONFIG.instagram;
  slogan = SITE_CONFIG.slogan;

  constructor(private bookingDialog: BookingDialogService) {}

  agendar(): void {
    this.bookingDialog.openChoice();
  }
}
