import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}
