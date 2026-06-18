import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { SERVICOS } from '../../data/mock-data';
import { whatsappLink } from '../../data/site-config';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css'],
})
export class ServicesComponent {
  servicos = SERVICOS;
  whatsapp = whatsappLink();
}
