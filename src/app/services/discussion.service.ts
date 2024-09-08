import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {
  private apiUrl = `${environment.baseUrl}/api/discussions`;

  constructor(private http: HttpClient) { }

  /**
   * Retrieves all discussions.
   *
   * @returns {Observable<any[]>} An observable containing an array of all discussions.
   */
  getAllDiscussions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching discussions:', error);
        return of([]); // Leeres Array zurückgeben, wenn ein Fehler auftritt
      })
    );
  }

  /**
   * Retrieves a discussion by a person's ID.
   *
   * @param {string} personId - The ID of the person whose discussion is to be retrieved.
   * @returns {Observable<any>} An observable containing the discussion for the specified person.
   */
  getDiscussionByPersonId(personId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${personId}`);
  }

  /**
   * Adds a new entry.
   *
   * @param {any} entry - The entry object to be added.
   * @returns {Observable<any>} An observable containing the response from the server.
   */
  addEntry(entry: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/entries/`, entry, { withCredentials: true });
  }

  /**
   * Updates an existing entry.
   *
   * @param {number} entryId - The ID of the entry to be updated.
   * @param {any} entry - The updated entry object.
   * @returns {Observable<any>} An observable containing the updated entry.
   */
  updateEntry(entryId: number, entry: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/entries/${entryId}/`, entry, { withCredentials: true });
  }

  /**
   * Deletes an entry.
   *
   * @param {number} entryId - The ID of the entry to be deleted.
   * @returns {Observable<any>} An observable containing the response from the server.
   */
  deleteEntry(entryId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/entries/${entryId}/`, { withCredentials: true });
  }
}
