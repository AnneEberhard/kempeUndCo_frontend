import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [RouterModule, ScrollToTopButtonComponent],
  templateUrl: './legal.component.html',
  styleUrl: './legal.component.scss'
})
export class LegalComponent {

}
