import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { SITE_CONFIG } from '../../data/site-config';

type MapStatus = 'loading' | 'loaded' | 'failed';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css'],
})
export class LocationComponent implements OnInit, OnDestroy {
  endereco = SITE_CONFIG.endereco;
  horarios = SITE_CONFIG.horarios;
  googleMaps = SITE_CONFIG.googleMaps;
  telefone = SITE_CONFIG.telefoneExibicao;

  // Estado do mapa: usado para exibir o fallback caso o iframe não carregue.
  mapStatus: MapStatus = 'loading';
  private failTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    // Se o iframe não disparar 'load' em alguns segundos (bloqueio de rede,
    // extensão, etc.), mostramos o fallback clicável.
    this.failTimer = setTimeout(() => {
      if (this.mapStatus === 'loading') {
        this.mapStatus = 'failed';
      }
    }, 7000);
  }

  ngOnDestroy(): void {
    if (this.failTimer) {
      clearTimeout(this.failTimer);
    }
  }

  onMapLoad(): void {
    this.mapStatus = 'loaded';
    if (this.failTimer) {
      clearTimeout(this.failTimer);
      this.failTimer = null;
    }
  }

  onMapError(): void {
    this.mapStatus = 'failed';
  }
}
