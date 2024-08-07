import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { ScrollToTopButtonComponent } from '../scroll-to-top-button/scroll-to-top-button.component';
import { PublicHeaderComponent } from "../public-header/public-header.component";

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, PublicHeaderComponent, FooterComponent, ScrollToTopButtonComponent, PublicHeaderComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss'
})
export class PublicLayoutComponent {

}
