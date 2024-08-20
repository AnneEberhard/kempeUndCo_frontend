import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {
  private apiUrl = `${environment.baseUrl}/api/discussions`;

  constructor(private http: HttpClient) { }

  getAllDiscussions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getDiscussionByPersonId(personId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${personId}`);
  }

  addEntry(entry: any): Observable<any> {
    console.log(entry);
    const csrfToken = this.getCookie('csrftoken');
    const headers = new HttpHeaders().set('X-CSRFToken', csrfToken);
    return this.http.post<any>(`${this.apiUrl}/entries/`, entry, { headers, withCredentials: true });
  }

  private getCookie(name: string): string {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
      return match[2];
    } else {
      console.error('CSRF token not found.');
      return '';
    }
  }
}
