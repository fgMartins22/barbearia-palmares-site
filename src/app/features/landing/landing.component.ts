import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { AboutComponent } from '../../components/about/about.component';
import { FounderComponent } from '../../components/founder/founder.component';
import { ServicesComponent } from '../../components/services/services.component';
import { GalleryComponent } from '../../components/gallery/gallery.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { LocationComponent } from '../../components/location/location.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BookingDialogComponent } from '../booking/dialog/booking-dialog.component';

/** Página inicial (landing) com todas as seções. */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    AboutComponent,
    FounderComponent,
    ServicesComponent,
    GalleryComponent,
    TestimonialsComponent,
    LocationComponent,
    ContactComponent,
    FooterComponent,
    BookingDialogComponent,
  ],
  template: `
    <app-header></app-header>
    <main>
      <app-hero></app-hero>
      <app-about></app-about>
      <app-founder></app-founder>
      <app-services></app-services>
      <app-gallery></app-gallery>
      <app-testimonials></app-testimonials>
      <app-location></app-location>
      <app-contact></app-contact>
    </main>
    <app-footer></app-footer>

    <!-- Modal de agendamento (único na aplicação) -->
    <app-booking-dialog></app-booking-dialog>
  `,
})
export class LandingComponent {}
