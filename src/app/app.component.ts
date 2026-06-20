import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Shell da aplicação: apenas o outlet do roteador. */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}
