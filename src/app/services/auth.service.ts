import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';

import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoading: boolean = false;
  private token: string | null = null;

  constructor(private http: HttpClient, private router: Router) {  }

  public   isLoggedIn(): boolean {
    return this.getAccessToken() !== null;
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
    return this.http.post<any>(url, body)
  }

  /**
   * Sets the access token, refresh token, and login status flag in sessionStorage.
   * @param {string} accessToken - The access token to set.
   * @param {string} refreshToken - The refresh token to set.
   */
  setTokens(accessToken: string, refreshToken: string, userId: string, username: string): void {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('kempeLogin', 'True');
  }


  /**
   * Retrieves the access token from sessionStorage.
   * if ensures that no error shows up in vscode
   * @returns {string | null} The access token if available, or null if not found.
   */
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('accessToken');
    }
    return null;
  }

  /**
   * Retrieves the refresh token from sessionStorage.
   * @returns {string | null} The refresh token if available, or null if not found.
   */
  getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken');
  }

  /**
   * Retrieves the login status flag from sessionStorage.
   * @returns {string | null} The login status flag ('True' or null) if available, or null if not found.
   */
  getKempelogin(): string | null {
    return sessionStorage.getItem('kempelogin');
  }


  /**
   * handles user logout in front and backend
   */
  logout(): void {
    const refreshToken = this.getRefreshToken();
    const url = environment.baseUrl + '/token/blacklist/';
    this.http.post(url, { refresh: refreshToken }).subscribe({
      next: () => {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('kempeLogin');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed', err);
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('kempeLogin');
        this.router.navigate(['/login']);
      }
    });
  }

  
  /**
   * handles user register in backend
   * @param {any} userData - user info needed for regstration in backend
   */
  registerUser(userData: any): Observable<any> {
    const url = environment.baseUrl + '/register/';
    return this.http.post<any>(url, userData);
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
