import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import * as Sentry from "@sentry/angular";
import { LoadingService } from '../services/loading.service';


@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ScrollToTopButtonComponent],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class RegistrationComponent {
  showErrorEmailAlert: boolean = false;
  showErrorPasswordAlert: boolean = false;
  showErrorPasswordMatchAlert: boolean = false;
  showErrorChooseGuarantor: boolean = false;
  showErrorGuarantorEmailAlert: boolean = false;
  errorMessage: string = '';
  buttonText: string = 'Absenden';
  sent: boolean = false;
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  formData = {
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
    guarantorEmail: '',
    guarantor: false,
    noGuarantor: false,
    selectedFamilies: [] as string[]
  };

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private loadingService: LoadingService) { }

 /**
  * toggles between passwort visible and not
  */
 togglePasswordVisibility(mode: string) {
  if (mode =='passwort') {
    this.passwordVisible = !this.passwordVisible;
  } else {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}


  /**
   * handles look and info on selected family checkboxes
   * handles look and info of the guarantor checkboxes
   * @param {string} type to differentiate between the checkboxes 
   */
  onCheckboxChange(type: string) {
    if (type === 'kempe' || type === 'huenten') {
      const index = this.formData.selectedFamilies.indexOf(type);
      if (index === -1) {
        this.formData.selectedFamilies.push(type);
      } else {
        this.formData.selectedFamilies.splice(index, 1);
      }
    } else if (type === 'guarantor') {
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
    this.errorMessage = '';
    if (this.checkForm(form)) {
      const userData = this.assembleData(form);
      this.registerUser(userData)
    }
  }

  /**
   * calls upon authService to send info to backend
   * handles logic depending on backend answer
   * @param userData 
   */
  registerUser(userData: any) {
    this.loadingService.show(); 
    this.authService.registerUser(userData).pipe(take(1))
      .subscribe({
        next: (response) => {
          this.renderInfo();
          setTimeout(this.clearForm, 4000);
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            const errorMessage = typeof error.error === 'string' ? error.error : '';
        
            if (error.status === 400 && error.error && error.error.email && error.error.email[0] === "user with this email already exists.") {
              this.errorMessage = 'Ein Nutzer mit dieser Email ist bereits bei uns registriert.';
              this.renderPasswordForgotLink();
            } else if (errorMessage.includes('Der angegebene Bürge existiert nicht.')) {
              this.errorMessage = 'Der angegebene Bürge existiert nicht in unserer Datenbank.';
            } else if (errorMessage.includes('Der Bürge ist für die ausgewählten Familien nicht berechtigt.')) {
              this.errorMessage = 'Der Bürge ist für die ausgewählte Familien nicht berechtigt. Bitte nur Familien auswählen, für die der Bürge autorisiert ist.';
            } else {
              console.error('An error occurred:', error);
              this.errorMessage = 'Ein Fehler ist vorgefallen!';
              Sentry.captureException(error);  // Fehler explizit an Sentry senden
            }
          } else {
            console.error('An error occurred:', error);
            alert('Ein Fehler ist vorgefallen! Bitte überprüfe deine Eingaben.');
            Sentry.captureException(error);  // Fehler explizit an Sentry senden
          }
        },
        complete: () => {
          this.loadingService.hide();
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
   * checks if password follows password rules
   * @param {string} password - value of password field
   * @returns boolean
   */
  validatePassword(password: string): boolean {
    // check length
    if (password.length < 8) {
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
      selected_families: this.formData.selectedFamilies
    };
    return userData;
  }

  /**
  * renders info of success in case the backend responded well
  */
  renderInfo() {
    document.getElementById('popUpContainer')?.classList.remove('dNone');
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

  /**
  * renders link to forgot passwort component in case user already exists
  */
  renderPasswordForgotLink() {
    const div = document.getElementById('forgotLink');
    if (div) {
      const link = document.createElement('a');
      link.textContent = 'Passwort vergessen?';
      link.href = 'javascript:void(0)';
      link.onclick = () => this.router.navigate(['/forgot']);
      link.className = 'forgotLink';
      div.appendChild(link);
    }
  }

  /**
  * shows overlay with password rules
  */
  showRules() {
    const div = document.getElementById('popUpInfoContainer');
    if (div) {
      div.classList.remove('dNone');
    }
  }

  /**
  * hides overlay with password rules
  */
  hideRules() {
    const div = document.getElementById('popUpInfoContainer');
    if (div) {
      div.classList.add('dNone');
    }
  }
}
