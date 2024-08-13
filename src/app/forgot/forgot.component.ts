import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.scss'
})
export class ForgotComponent {

  constructor(private authService: AuthService, private router: Router) { }
  email: string = '';
  errorMessage: string = '';
  buttonText: string = 'Absenden';
  sent: boolean = false;


/**
 * starts logic for sending user email to backend
 * deals with errors that might occur
 */
  async sendMail() {
    try {
      let resp: any = await this.authService.forgot(this.email);
      this.renderInfo();
    } catch (error: any) {
      if (error.status === 400 && error.error.error === 'Account not activated') {
        this.errorMessage = 'Your account is not yet activated. Please check your emails and click on the activation link we have sent you.';
      } else {
        this.errorMessage = 'Error in sending. Please check your input.';
      }
    }
  }

  /**
  * renders info of success in case the backend responded well
  */
  renderInfo() {
    let div = document.getElementById('infoBox');
    if (div) {
      div.innerHTML = 'Die Email wurde versendet.';
    }
    this.sent = true;
    this.buttonText = 'Gesendet';
  }

}