import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';
import { DIFERENCIAIS } from '../../data/mock-data';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent {
  diferenciais = DIFERENCIAIS;
}
