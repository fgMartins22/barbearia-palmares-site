import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { DEPOIMENTOS } from '../../data/mock-data';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css'],
})
export class TestimonialsComponent {
  depoimentos = DEPOIMENTOS;

  // Retorna um array de 5 posições indicando quais estrelas ficam preenchidas
  estrelas(nota: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < nota);
  }
}
