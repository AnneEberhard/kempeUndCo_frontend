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

  constructor(private authService: AuthService, private router: Router) {}

/**
* starts login, sets storage token in case of success and renders errors in case of failure
*/
  async login() {
      try {
        let resp:any = await this.authService.login(this.email, this.password);
        sessionStorage.setItem('token', resp['token']);
        this.router.navigate(['/main'])
      } catch (error:any) {
          if (error.status === 400 && error.error.error === 'Account not activated') {
              this.errorMessage = 'Your account is not yet activated. Please check your emails and click on the activation link we have sent you.';
            } else {
              this.errorMessage = 'Error logging in. Please check your login information.';
            }
      }
    }
}
