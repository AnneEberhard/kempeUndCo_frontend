import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

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
   * Sets the access token, refresh token, and login status flag in localStorage.
   * @param {string} accessToken - The access token to set.
   * @param {string} refreshToken - The refresh token to set.
   */
  setTokens(accessToken: string, refreshToken: string, userId: string, userEmail:string, family_1: string, family_2: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userEmail', userEmail);
    localStorage.setItem('family_1', family_1);
    localStorage.setItem('family_2', family_2);
  }

  /**
   * Retrieves the access token from localStorage.
   * if ensures that no error shows up in vscode
   * @returns {string | null} The access token if available, or null if not found.
   */
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  /**
   * Retrieves the refresh token from localStorage.
   * @returns {string | null} The refresh token if available, or null if not found.
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * handles user logout in front and backend
   */
  logout(): void {
    const refreshToken = this.getRefreshToken();
    const url = environment.baseUrl + '/token/blacklist/';
    this.http.post(url, { refresh: refreshToken }, { withCredentials: true }).subscribe({
      next: (response) => {
        console.error('Logout successful', response);
      },
      error: (err) => {
        console.error('Logout failed', err);
      }
    });
    this.router.navigate(['/login']);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('family_1');
    localStorage.removeItem('family_2');
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
    const url = environment.baseUrl + '/password-reset-request/';
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

/**
 * Stores the access token in `localStorage`.
 * @param {string} token - The access token to be stored.
 */
  setAccessToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

/**
 * Sends a request to refresh the access token using the stored refresh token.
 * @returns {Observable<any>} An Observable containing the response from the refresh token request.
 */
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post(`${environment.baseUrl}/login/refresh/`, { refresh: refreshToken });
  }
}
