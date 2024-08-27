import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive, ScrollToTopButtonComponent],
  templateUrl: './legal.component.html',
  styleUrl: './legal.component.scss'
})
export class LegalComponent {

}
