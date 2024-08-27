import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  /**
  * starts login, sets storage token in case of success and renders errors in case of failure
  */
  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log(response);
        this.authService.setTokens(response.access, response.refresh, response.user.id, response.user.email, response.user.username);
        this.router.navigate(['/welcome']);
      },
      error: (error) => {
        if (error.status === 400 && error.error.error === 'Account not activated') {
          this.errorMessage = 'Dein Account ist leider noch nicht aktiviert.';
        } else {
          this.errorMessage = 'Fehler beim Einloggen. Bitte überprüfe Login-Informationen.';
        }
      }
    });
  }

}
