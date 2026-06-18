import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { SITE_CONFIG } from '../../data/site-config';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css'],
})
export class LocationComponent {
  endereco = SITE_CONFIG.endereco;
  horarios = SITE_CONFIG.horarios;
  googleMaps = SITE_CONFIG.googleMaps;
  telefone = SITE_CONFIG.telefoneExibicao;
}
