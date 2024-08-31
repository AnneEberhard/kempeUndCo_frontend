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

  logout(): void {
    this.authService.logout();
    location.reload();
  }

  showNav() {
    const header = document.querySelector('header');
    const logo = document.getElementById('mobileLogo');
    if (header) {
      header.style.display = 'flex';
      header.style.opacity = '1';
      header.style.transform = 'translateX(0)';
    }
    if(logo) {
      logo.classList.add('dNone');
    }
  }

  hideNav() {
    const header = document.querySelector('header');
    const logo = document.getElementById('mobileLogo');
    if (header) {
      header.style.opacity = '0';
      header.style.transform = 'translateX(-200px)';
      setTimeout(() => {
        header.style.display = 'none';
      }, 300);
    }
    if(logo) {
      logo.classList.remove('dNone');
    }
  }
  
  }
