import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ScrollToTopButtonComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent {
  showErrorPasswordAlert: boolean = false;
  showErrorPasswordMatchAlert: boolean = false;
  errorMessage: string = '';
  buttonText: string = 'Absenden';
  sent: boolean = false;
  newPasswordVisible: boolean = false;
  oldPasswordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  userEmail: string | null;
  authorName: string | null;
  newAuthorName: string = '';

  formData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  constructor(private authService: AuthService, private router: Router) {
    this.userEmail = localStorage.getItem('userEmail');
    this.authorName = localStorage.getItem('authorName')
  }


  /**
  * toggles between passwort visible and not
  */
  togglePasswordVisibility(mode: string) {
    if (mode == 'oldPassword') {
      this.oldPasswordVisible = !this.oldPasswordVisible;
    } else if ((mode == 'confirm')) {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    } else {
      this.newPasswordVisible = !this.newPasswordVisible;
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
      this.changePasswort(userData)
    }
  }

  /**
 * starts varies functions to validate the form
 * @param {NgForm} form - entered data
 * @returns boolean
 */
  checkForm(form: NgForm) {
    if (form.valid) {
      if (!this.validatePassword(this.formData.newPassword)) {
        this.renderAlert("password");
        return false;
      }
      if (this.formData.newPassword !== this.formData.confirmPassword) {
        this.renderAlert("passwordMatch");
        return false;
      }
      return true;
    } else {
      return false
    }
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
    if (alertType === 'password') {
      this.showErrorPasswordAlert = true;
    } else if (alertType === 'passwordMatch') {
      this.showErrorPasswordMatchAlert = true;
    }
  }

  /**
  * assembles the data for the registration from the form
  * @param form registration form
  * @returns userData as a json for sending
  */
  assembleData(form: NgForm) {
    const userData = {
      email: this.userEmail,
      old_password: this.formData.oldPassword,
      new_password: this.formData.newPassword,
    };
    return userData;
  }

  /**
   * calls upon authService to send info to backend
   * handles frontend logic depending on backend answer
   * @param userData 
   */
  changePasswort(userData: any) {
    this.authService.changePasswort(userData).pipe(take(1))
      .subscribe({
        next: (response) => {
          this.renderInfo('password');
          setTimeout(this.clearForm, 4000);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Ein Fehler ist aufgetreten:', error);
          if (error.status === 400 && error.error) {
            if (error.error.old_password) {
              this.errorMessage = error.error.old_password[0];
            } else {
              this.errorMessage = 'Ein unbekannter Fehler ist aufgetreten.';
            }
          } else {
            this.errorMessage = 'Es ist ein Netzwerkfehler aufgetreten.';
          }
        }
      });
  }


  /**
    * renders info of success in case the backend responded well
    */
  renderInfo(mode: string | undefined) {
    document.getElementById('popUpContainer')?.classList.remove('dNone');
    let div = document.getElementById('infoBox');
    if (div) {
      if (mode == 'password') {
        div.innerHTML = 'Das Passwort wurde geändert.';
      }
      if (mode == 'name') {
        div.innerHTML = 'Der Name wurde geändert.';
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

  /**
 * starts changing the authorname and handles logic of the frontend
  */
  changeName() {
    const userData = {
      email: this.userEmail,
      author_name: this.newAuthorName,
    };
    this.authService.changeName(userData).pipe(take(1))
      .subscribe({
        next: (response) => {
          this.renderInfo('name');
          localStorage.setItem('authorName', this.newAuthorName);
          setTimeout(this.clearForm, 4000);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Ein Fehler ist aufgetreten:', error);
          if (error.status === 400 && error.error) {
            this.errorMessage = 'Ein unbekannter Fehler ist aufgetreten.';
          } else {
            this.errorMessage = 'Es ist ein Netzwerkfehler aufgetreten.';
          }
        }
      });
  }
}
