import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Seção "Fundador" — apresenta o dono da barbearia.
 * Foto à esquerda e texto à direita no desktop; empilha no mobile.
 * [EDITAR] Nome, foto e texto podem ser alterados abaixo.
 */
@Component({
  selector: 'app-founder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './founder.component.html',
  styleUrls: ['./founder.component.css'],
})
export class FounderComponent {
  // [EDITAR] Nome do fundador (destacado em dourado)
  nome = 'THIAGO ROLLANTE';

  // [EDITAR] Caminho da foto do fundador
  foto = 'assets/images/thiago.jpeg';

  // [EDITAR] Parágrafos de apresentação
  paragrafos = [
    'Natural de Palmares do Sul, 39 anos.',
    'Barbeiro profissional desde 2015, mas muito antes disso já cortava cabelo de seus familiares em casa como hobby.',
    'Se tornou empreendedor em 2018, quando fundou a Barbearia Palmares, localizada na Travessa Américo Silveira, 231, Porto Alegre, RS.',
  ];
}
