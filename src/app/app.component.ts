import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicLayoutComponent } from './templates/public-layout/public-layout.component';
import { PrivateLayoutComponent } from './templates/private-layout/private-layout.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    PublicLayoutComponent,
    PrivateLayoutComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'kempeUndCo_frontend';
}
