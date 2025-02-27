import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './reset.component.html',
  styleUrl: './reset.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ResetComponent implements OnInit {
  errorMessage: string = '';
  showErrorPasswordAlert: boolean = false;
  showErrorPasswordMatchAlert: boolean = false;
  buttonText: string = 'Absenden';
  sent: boolean = false;
  uidb64: string | null = '';
  token: string | null = '';
  successMessage: string = '';

  formData = {
    password: '',
    confirmPassword: '',
  };

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

/**
 * Initializes the component by extracting URL parameters `uidb64` and `token`.
 * This method is called once the component is initialized.
 */
  ngOnInit(): void {
    this.uidb64 = this.route.snapshot.paramMap.get('uidb64');
    this.token = this.route.snapshot.paramMap.get('token');
  }

/**
 * Handles form submission for resetting the password.
 * It checks if the form is valid, then constructs the API endpoint key
 * and calls the reset method to perform the password reset.
 *
 * @param {NgForm} form - The form containing the new password.
 */
  onSubmit(form: NgForm) {
    if (this.checkForm(form)) {
      const password = this.formData.password;
      const key = `/password-reset-confirm/${this.uidb64}/${this.token}/`;
      console.log(key);
      this.reset(key, password);
    }
  }

/**
 * Resets the user's password by calling the AuthService's reset method with
 * the provided key and new password. Handles success and error cases.
 * @param {string} key - The API endpoint key for password reset.
 * @param {string} password - The new password to be set.
 */
 async reset(key: string, password: string) {
    try {
      await this.authService.reset(key, password);
      this.renderInfo();
    } catch (error: any) {
      this.errorMessage = 'Der Link ist ungültig oder abgelaufen.';
      this.successMessage = '';
    }
  }

/**
* starts varies functions to validate the form
* @param {NgForm} form - entered data
* @returns boolean
*/
  checkForm(form: NgForm) {
    if (form.valid) {
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
  * renders info of success in case the backend responded well
  */
  renderInfo() {
    let div = document.getElementById('infoBox');
    if (div) {
        div.innerHTML = 'Dein Passwort wurde erfolgreich zurückgesetzt. Zurück zum ';
    }
    this.sent = true;
    this.buttonText = 'Gesendet';
    this.renderLoginLink();
}

  /**
  * renders link to login
  */
  renderLoginLink() {
    const div = document.getElementById('infoBox');
    if (div) {
      const link = document.createElement('a');
      link.textContent = 'Login';
      link.href = 'javascript:void(0)';
      link.onclick = () => this.router.navigate(['/login']);
      link.className = 'loginLink';
      div.appendChild(link);
    }
  }
}
