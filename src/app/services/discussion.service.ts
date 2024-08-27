import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {
  private apiUrl = `${environment.baseUrl}/api/discussions`;

  constructor(private http: HttpClient) { }

  getAllDiscussions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching discussions:', error);
        return of([]); // Leeres Array zurückgeben, wenn ein Fehler auftritt
      })
    );}


  getDiscussionByPersonId(personId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${personId}`);
  }


  addEntry(entry: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/entries/`, entry, { withCredentials: true });
  }


  updateEntry(entryId: number, entry: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/entries/${entryId}/`, entry, { withCredentials: true });
  }


  deleteEntry(entryId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/entries/${entryId}/`, { withCredentials: true });
  }
}
