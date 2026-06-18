import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SITE_CONFIG, whatsappLink } from '../../data/site-config';
import { BrandIconComponent } from '../shared/brand-icon.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, BrandIconComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  whatsapp = whatsappLink();
  instagram = SITE_CONFIG.instagram;
  telefone = SITE_CONFIG.telefoneExibicao;
  // Apenas dígitos, para o link tel: (ex.: 5551984217009)
  telefoneDigits = '55' + SITE_CONFIG.telefoneExibicao.replace(/\D/g, '');
}
