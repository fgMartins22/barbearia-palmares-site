import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
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
  LucideCalendar,
  LucideUser,
  LucideArrowLeft,
  LucideCircleCheck,
  LucideCheck,
  LucideX,
  LucideSearch,
  LucidePlus,
  LucideTrash2,
  LucideCheckCheck,
  LucideRotateCcw,
  LucideBan,
  LucideCalendarOff,
  LucideLogOut,
} from '@lucide/angular';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

/**
 * Ícones Lucide registrados globalmente.
 * Para adicionar um novo ícone: importe-o de '@lucide/angular' e inclua na
 * lista abaixo. Depois use no HTML com <svg lucideIcon="nome-do-icone">.
 * (os nomes ficam em kebab-case: Scissors -> "scissors", MapPin -> "map-pin")
 */
bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(
      routes,
      // Rola para o topo ao trocar de rota e respeita âncoras (#secao)
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      })
    ),
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
      LucideChevronRight,
      LucideCalendar,
      LucideUser,
      LucideArrowLeft,
      LucideCircleCheck,
      LucideCheck,
      LucideX,
      LucideSearch,
      LucidePlus,
      LucideTrash2,
      LucideCheckCheck,
      LucideRotateCcw,
      LucideBan,
      LucideCalendarOff,
      LucideLogOut
    ),
  ],
}).catch((err) => console.error(err));
