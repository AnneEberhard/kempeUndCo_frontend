import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  
  constructor(private authService: AuthService) {}

/**
 * Logs the user out by calling the authentication service and refreshing the page.
 * 
 * @returns {void}
 */
logout(): void {
  this.authService.logout();
  location.reload();
}

/**
 * Displays the navigation header by setting its display, opacity, and transform styles.
 * Hides the mobile logo by adding a CSS class to it.
 * 
 * @returns {void}
 */
showNav(): void {
  const header = document.querySelector('header');
  const logo = document.getElementById('mobileLogo');
  if (header) {
    header.style.display = 'flex';
    header.style.opacity = '1';
    header.style.transform = 'translateX(0)';
  }
  if (logo) {
    logo.classList.add('dNone');
  }
}

/**
 * Handles the logic when a navigation link is clicked.
 * If the window width is below 1000px, the navigation header will be hidden.
 * 
 * @returns {void}
 */
onLinkClick(): void {
  if (window.innerWidth < 1000) {
    this.hideNav();
  }
}

/**
 * Hides the navigation header by animating its opacity and transform.
 * The header is set to `display: none` after a delay.
 * Shows the mobile logo by removing a CSS class from it.
 * 
 * @returns {void}
 */
hideNav(): void {
  const header = document.querySelector('header');
  const logo = document.getElementById('mobileLogo');
  if (header) {
    header.style.opacity = '0';
    header.style.transform = 'translateX(-200px)';
    setTimeout(() => {
      header.style.display = 'none';
    }, 300);
  }
  if (logo) {
    logo.classList.remove('dNone');
  }
}

  }
