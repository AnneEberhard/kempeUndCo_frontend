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
  showErrorChooseGuarantor: boolean = false;
  showErrorGuarantorEmailAlert: boolean = false;
  buttonText: string = 'Absenden';
  sent: boolean = false;

  formData = {
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
    guarantorEmail: '',
    guarantor: false,
    noGuarantor: false,
    family: 'kempe'
  };

  constructor(private authService: AuthService, private router: Router) { }

  /**
   * handles look and info of the guarantor checkboxes
   * @param {string} type to differentiate between the two checkboxes 
   */
  onCheckboxChange(type: string) {
    if (type === 'guarantor') {
      this.formData.noGuarantor = false;
      this.formData.guarantor = !this.formData.guarantor;
    } else {
      this.formData.guarantor = false;
      this.formData.noGuarantor = !this.formData.noGuarantor;
    }
    if (this.showErrorChooseGuarantor && (this.formData.guarantor || this.formData.noGuarantor)) {
      this.showErrorChooseGuarantor = false;
    }
  }

  /**
  * starts validation, and if true, initiates sending registration to backend
  * @param {NgForm} form - entered data
  * @returns boolean
  */
  onSubmit(form: NgForm) {
    if (this.checkForm(form)) {
      const userData = this.assembleData(form);
      console.log(userData);
      this.registerUser(userData)
    }
  }

  /**
   * calls upon authService to send info to backend
   * handles logic depending on backend answer
   * @param userData 
   */
  public registerUser(userData: any) {
    this.authService.registerUser(userData).pipe(take(1))
      .subscribe({
        next: (response) => {
          console.log(JSON.stringify(response));
          this.renderInfo();
          setTimeout(this.clearForm, 3000);
        },
        error: (err) => {
          if (err instanceof HttpErrorResponse) {
            console.log(JSON.stringify(err.error));
          } else {
            console.error('An error occurred:', err);
            alert('Ein Fehler ist vorgefallen!');
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
      if (!this.formData.guarantor && !this.formData.noGuarantor) {
        this.renderAlert("chooseGuarantor");
        return false;
      }
      if (this.formData.guarantor && !this.formData.guarantorEmail) {
        this.renderAlert("guarantorEmail");
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
    // check length
    if (password.length < 12) {
      this.showErrorPasswordAlert = true;
      return false;
    }
    // check for upper case letters
    if (!/[A-Z]/.test(password)) {
      this.showErrorPasswordAlert = true;
      return false;
    }
    // Check for lower case letters
    if (!/[a-z]/.test(password)) {
      this.showErrorPasswordAlert = true;
      return false;
    }
    // Check for numbers
    if (!/[0-9]/.test(password)) {
      this.showErrorPasswordAlert = true;
      return false;
    }
    // Check for permitted special characters
    if (!/[!@#$%^&*()_+-=?€]+/.test(password)) {
      this.showErrorPasswordAlert = true;
      return false;
    }
    // Check for forbidden special characters
    if (/[\'\"<>&,.]/.test(password)) {
      this.showErrorPasswordAlert = true;
      return false;
    }
    // if all is checked
    this.showErrorPasswordAlert = false;
    return true;
  }

  /**
 * renders alert for the different issues and boxes
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
    } else if (alertType === 'chooseGuarantor') {
      this.showErrorChooseGuarantor = true;
    } else if (alertType === 'guarantorEmail') {
      this.showErrorGuarantorEmailAlert = true;
    }
  }

  /**
   * assembles the data for the registration from the form
   * @param form registration form
   * @returns userData as a json for sending
   */
  assembleData(form: NgForm) {
    const userData = {
      email: this.formData.email,
      password: this.formData.password,
      first_name: this.formData.first_name,
      last_name: this.formData.last_name,
      guarantor: this.formData.guarantor,
      guarantor_email: this.formData.guarantorEmail,
      family: this.formData.family
    };
    return userData;
  }

  /**
  * renders info of success in case the backend responded well
  */
  renderInfo() {
    let div = document.getElementById('infoBox');
    if (div) {
      if (this.formData.guarantor) {
        div.innerHTML = 'Die Registrierung wurde versendet. Bitte informiere deinen Bürgen, damit er dich bestätigt.';
      } else {
        div.innerHTML = 'Die Registrierung wurde versendet. Du erhältst eine Email mit weiteren Informationen von uns.';
      }
    }
    this.sent = true;
    this.buttonText = 'Gesendet';
  }

  /**
   * reloads the page to refresh content
   */
  clearForm() {
    window.location.reload();
  }

}
