import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { GALERIA } from '../../data/mock-data';

/**
 * Galeria em formato de carrossel responsivo.
 * - Setas de navegação, indicadores e autoplay suave.
 * - Usa placeholders quando a foto ainda não existe (url = null).
 *   Para usar fotos reais, edite o array GALERIA em src/app/data/mock-data.ts.
 */
@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
})
export class GalleryComponent implements OnInit, OnDestroy {
  galeria = GALERIA;
  currentIndex = 0;

  // Autoplay: tempo entre os slides (em ms). Ajuste ou defina 0 para desligar.
  autoplayMs = 4500;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.galeria.length;
  }

  prev(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.galeria.length) % this.galeria.length;
  }

  goTo(index: number): void {
    this.currentIndex = index;
    // Reinicia o autoplay para dar tempo de ver o slide escolhido
    this.restartAutoplay();
  }

  startAutoplay(): void {
    if (!this.autoplayMs || this.galeria.length <= 1) {
      return;
    }
    this.timer = setInterval(() => {
      this.next();
      this.cdr.markForCheck();
    }, this.autoplayMs);
  }

  stopAutoplay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  restartAutoplay(): void {
    this.stopAutoplay();
    this.startAutoplay();
  }
}
