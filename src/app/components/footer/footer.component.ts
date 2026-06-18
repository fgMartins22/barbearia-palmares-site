import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SITE_CONFIG, whatsappLink } from '../../data/site-config';
import { BrandIconComponent } from '../shared/brand-icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, BrandIconComponent],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  nome = SITE_CONFIG.nome;
  slogan = SITE_CONFIG.slogan;
  whatsapp = whatsappLink();
  instagram = SITE_CONFIG.instagram;
  endereco = SITE_CONFIG.endereco;
  telefone = SITE_CONFIG.telefoneExibicao;
  anoAtual = new Date().getFullYear();

  // Links rápidos do rodapé
  links = [
    { label: 'Início', href: '#inicio' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Fundador', href: '#fundador' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Galeria', href: '#galeria' },
    { label: 'Localização', href: '#localizacao' },
    { label: 'Contato', href: '#contato' },
  ];
}
