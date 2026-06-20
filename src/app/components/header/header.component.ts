import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SITE_CONFIG } from '../../data/site-config';
import { BookingDialogService } from '../../features/booking/dialog/booking-dialog.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  nome = SITE_CONFIG.nome;

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

  constructor(private bookingDialog: BookingDialogService) {}

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

  /** Abre o modal de agendamento (tela de escolha WhatsApp/Site). */
  agendar(): void {
    this.closeMenu();
    this.bookingDialog.openChoice();
  }
}
