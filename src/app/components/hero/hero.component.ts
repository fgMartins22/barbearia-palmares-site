import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SITE_CONFIG, whatsappLink } from '../../data/site-config';
import { BrandIconComponent } from '../shared/brand-icon.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, BrandIconComponent],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
})
export class HeroComponent {
  whatsapp = whatsappLink();
  instagram = SITE_CONFIG.instagram;
  slogan = SITE_CONFIG.slogan;
}
