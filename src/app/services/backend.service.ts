import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  private apiUrl = 'http://localhost:8000/api';  // Passe die URL nach Bedarf an

  constructor(private http: HttpClient) { }

  // Beispielmethode für einen GET-Request
  getPersons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/persons`);
  }

  getRelations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/relations`);
  }

  // Beispielmethode für einen POST-Request
  createDiscussion(discussion: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/discussions`, discussion);
  }
}
