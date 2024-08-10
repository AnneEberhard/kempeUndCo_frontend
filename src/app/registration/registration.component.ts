import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent {
  showErrorEmailAlert: boolean = false;
  showErrorPasswordAlert: boolean = false;
  showErrorPasswordMatchAlert: boolean = false;

  formData = {
    email: '',
    givenName: '',
    surname: '',
    password: '',
    confirmPassword: '',
    guarantorEmail: '',
  };

  constructor(private authService: AuthService, private router: Router) { }

/**
* starts validation, and if true, sends registration to backend
* @param {NgForm} form - entered data
* @returns boolean
*/
  onSubmit(form: NgForm) {
    if (this.checkForm(form)) {
      const userData = {
        email: this.formData.email,
        username: this.formData.givenName + this.formData.surname,
        password: this.formData.password
      };
      this.registerUser(userData)
    }
  }


  //add Popu up with confirmation info here
  public registerUser(userData: any) {
    this.authService.registerUser(userData).pipe(take(1))
      .subscribe({
        next: (response) => {
          console.log(JSON.stringify(response));
        },
        error: (err) => {
          if (err instanceof HttpErrorResponse) {
            console.log(JSON.stringify(err.error));
          } else {
            console.error('An error occurred:', err);
            alert('An error occurred!');
          }
        }
      });
  }


  /**
 * starts varies functions to validate the form
 * @param {NgForm} form - entered data
 * @returns boolean
 */
  checkForm(form: NgForm) {
    if (form.valid) {
      if (!this.validateEmail(this.formData.email)) {
        this.renderAlert("email");
        return false;
      }
      if (!this.validatePassword(this.formData.password)) {
        this.renderAlert("password");
        return false;
      }
      if (this.formData.password !== this.formData.confirmPassword) {
        this.renderAlert("passwordMatch");
        return false;
      }
      return true;
    } else {
      return false
    }
  }

  /**
 * checks if email is correct
 * @param {string} email - value of email field
 * @returns boolean
 */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let checkEmail = emailRegex.test(email)
    if (checkEmail) {
      this.showErrorEmailAlert = false;
    } else {
      this.showErrorEmailAlert = true;
    }
    return checkEmail;
  }

  /**
   * checks if password follows rules of at least 8 characters and not entirely numeric
   * @param {string} password - value of password field
   * @returns boolean
   */
  validatePassword(password: string): boolean {
    if (password.length < 8) {
      this.showErrorPasswordAlert = true;
      return false;
    }
    if (!/[a-zA-Z]/.test(password)) {
      this.showErrorPasswordAlert = true;
      return false;
    }
    this.showErrorPasswordAlert = false;
    return true;
  }

  /**
 * renders alert
 * @param {string} alertType - identifier of alert (email, password, passwordMatch=
 * @returns boolean
 */
  renderAlert(alertType: string) {
    if (alertType === 'email') {
      this.showErrorEmailAlert = true;

    } else if (alertType === 'password') {
      this.showErrorPasswordAlert = true;
    } else if (alertType === 'passwordMatch') {
      this.showErrorPasswordMatchAlert = true;
    }

  }
}
