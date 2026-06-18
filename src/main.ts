import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideLucideIcons,
  LucideScissors,
  LucideScissorsLineDashed,
  LucideSparkles,
  LucideStar,
  LucideAward,
  LucideArmchair,
  LucideUserCheck,
  LucideMapPin,
  LucideClock,
  LucidePhone,
  LucideImage,
  LucideChevronLeft,
  LucideChevronRight,
} from '@lucide/angular';
import { AppComponent } from './app/app.component';

/**
 * Ícones Lucide registrados globalmente.
 * Para adicionar um novo ícone: importe-o de '@lucide/angular' e inclua na
 * lista abaixo. Depois use no HTML com <svg lucideIcon="nome-do-icone">.
 * (os nomes ficam em kebab-case: Scissors -> "scissors", MapPin -> "map-pin")
 */
bootstrapApplication(AppComponent, {
  providers: [
    provideLucideIcons(
      LucideScissors,
      LucideScissorsLineDashed,
      LucideSparkles,
      LucideStar,
      LucideAward,
      LucideArmchair,
      LucideUserCheck,
      LucideMapPin,
      LucideClock,
      LucidePhone,
      LucideImage,
      LucideChevronLeft,
      LucideChevronRight
    ),
  ],
}).catch((err) => console.error(err));
