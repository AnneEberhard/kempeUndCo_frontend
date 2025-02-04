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
  passwordVisible: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

 /**
  * toggles between passwort visible and not
  */
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }


  /**
  * starts login, sets storage token in case of success and renders errors in case of failure
  */
  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.authService.setTokens(response.access, response.refresh, response.user.id, response.user.email, 
          response.user.authorname, response.user.family_1, response.user.family_2,
          response.user.alert_faminfo, response.user.alert_info, response.user.alert_recipe, response.user.alert_discussion);
        this.router.navigate(['/welcome']);
      },
      error: (error) => {
        if (error.status === 400 && error.error.non_field_errors[0] === 'Inactive account') {
          this.errorMessage = 'Dein Account ist leider noch nicht aktiviert.';
        } else {
          this.errorMessage = 'Fehler beim Einloggen. Bitte überprüfe Login-Informationen.';
        }
      }
    });
  }
}
