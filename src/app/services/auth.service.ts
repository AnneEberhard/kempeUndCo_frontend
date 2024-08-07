import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, take } from 'rxjs';

import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment.prod';


/**
 * This service handles interaction with backend for auhentication and users
 * @remarks
 * an observable named isLoggedIn$ can ab subscribed to by other services to verify whether user is logged in
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoading: boolean = false;
  private isLoggedInSubject = new BehaviorSubject<boolean>(false); //defining an Observale for subscription
  isLoggedIn$ = this.isLoggedInSubject.asObservable(); //observable derived from isLoggedInSubject, cannot be altered from outside

  constructor(private http: HttpClient, private router: Router) {
    const token = sessionStorage.getItem('token');
    if (token) {
      this.setLoggedIn(true); //if token is available aka logged in in backend, setLoggedIn(true)
    } else {
      this.setLoggedIn(false);
    }
  }

  /**
   * changes isLoggedInSubject to the value false or true depending on token existence in session storage
   * @param {boolean} value : refers to the fact whether a token is in the session storage as defined in the constructur
   */
  setLoggedIn(value: boolean) {
    this.isLoggedInSubject.next(value);
  }

  /**
   * @returns the value of isLoggedInSubject
   */
  get isLoggedIn() {
    return this.isLoggedInSubject.value;
  }

  /**
   * logic around handling registration of user in the backend
   * @param {any} userData - user info needed for regstration in backend
   * refers to the confirmation page next
   * containg the info whether regstration worked or not (s. confirmation component)
   */
  public registerUser(userData: any) {
    this.registerUserinBackend(userData).pipe(take(1))
      .subscribe({
        next: (response) => {
          this.router.navigateByUrl(`/confirmation?data=${JSON.stringify(response)}`);
        },
        error: (err) => {
          if (err instanceof HttpErrorResponse) {
            this.router.navigateByUrl(`/confirmation?data=${JSON.stringify(err.error)}`);
          } else {
            console.error('An error occurred:', err);
            alert('An error occurred!');
          }
        }
      });
  }

  /**
   * handles user register in backend
   * @param {any} userData - user info needed for regstration in backend
   */
  registerUserinBackend(userData: any): Observable<any> {
    const url = environment.baseUrl + '/register/';
    return this.http.post<any>(url, userData);
  }

  /**
   * handles user login in backend
   * @param {string} email - user email
   * @param {string} password - user password
   */
  public login(email: string, password: string) {
    const url = environment.baseUrl + '/login/';
    const body = {
      "email": email,
      "password": password
    };
    return lastValueFrom(this.http.post(url, body));
  }


  /**
   * handles user logout in backend
   * @param {string} authToken - token from sessionStorage
   */
  async logout(authToken: string) {
    const url = environment.baseUrl + `/logout/`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Token ${authToken}`,
      },
    }).catch(error => {
      console.error("Fehler beim Logout:", error);
    });
  }

  /**
   * sends email-info to backend in case of forgotten password
   * @param {string} email - user email address
   */
  public forgot(email: string) {
    const url = environment.baseUrl + '/forgot/';
    const body = {
      "email": email
    };
    return lastValueFrom(this.http.post(url, body));
  }

  /**
   * sends new password to backend in case of forgotten password
   * @param {string} key - url for backend including query params uid and token
   * @param {string} password - new set password
   */
  public reset(key: string, password: string) {
    const url = environment.baseUrl + key;
    console.log(url);
    const body = {
      "password": password
    };
    return lastValueFrom(this.http.post(url, body));
  }
}
