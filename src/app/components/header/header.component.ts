import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SITE_CONFIG, whatsappLink } from '../../data/site-config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  nome = SITE_CONFIG.nome;
  whatsapp = whatsappLink();

  // Controla a sombra/fundo do header ao rolar a página
  scrolled = false;
  // Controla o menu mobile (hambúrguer)
  menuOpen = false;

  // Links de navegação (âncoras das seções)
  navLinks = [
    { label: 'Início', href: '#inicio' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Fundador', href: '#fundador' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Galeria', href: '#galeria' },
    { label: 'Localização', href: '#localizacao' },
    { label: 'Contato', href: '#contato' },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 20;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
