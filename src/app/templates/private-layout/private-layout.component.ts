import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { ScrollToTopButtonComponent } from '../scroll-to-top-button/scroll-to-top-button.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive,HeaderComponent, FooterComponent, ScrollToTopButtonComponent],
  templateUrl: './private-layout.component.html',
  styleUrl: './private-layout.component.scss'
})
export class PrivateLayoutComponent {
  constructor(private authService: AuthService) {}

  //token needs to be included here
  logout(): void {
    this.authService.logout('token');
    location.reload();  // Reload the page to switch the layout
  }

}
