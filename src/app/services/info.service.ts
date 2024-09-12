import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfoService {
  private apiUrl = `${environment.baseUrl}/api/infos`;

  constructor(private http: HttpClient) { }

  /**
   * Fetches all information records.
   * 
   * This method retrieves a list of all information records from the server. If an error occurs during the request,
   * an empty array is returned.
   *
   * @returns {Observable<any[]>} An observable containing an array of information records.
   */
  getAllInfos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching infos:', error);
        return of([]);
      }));
  }

  /**
   * Fetches information by its unique identifier.
   * 
   * This method retrieves a specific information record based on the provided ID. If the record is not found or
   * an error occurs, the method will propagate the error.
   *
   * @param {string} infoId - The unique identifier of the information record to retrieve.
   * @returns {Observable<any>} An observable containing the requested information record.
   */
  getInfoById(infoId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${infoId}/`);
  }

  /**
   * Adds a new information record.
   * 
   * This method sends a request to create a new information record with the provided data. The request is authenticated
   * using a JWT token from the session storage.
   *
   * @param {any} infoData - The data of the information record to add.
   * @returns {Observable<any>} An observable containing the response from the server.
   */
  addInfo(infoData: any) {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/create/`, infoData, { headers });
  }

  /**
   * Updates an existing information record.
   * 
   * This method sends a request to update an information record identified by the given ID with the provided form data.
   * The request is authenticated using a JWT token from the session storage.
   *
   * @param {string} id - The unique identifier of the information record to update.
   * @param {FormData} formData - The form data containing the updated information.
   * @returns {Observable<any>} An observable containing the response from the server.
   */
  updateInfo(id: string, formData: FormData): Observable<any> {
    const token = localStorage.getItem('accessToken');  // JWT Token aus dem Session Storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`${this.apiUrl}/${id}/`, formData, { headers });
  }

  /**
   * Deletes an information record.
   * 
   * This method sends a request to delete the information record identified by the given ID. The request is authenticated
   * using a JWT token from the session storage.
   *
   * @param {string} id - The unique identifier of the information record to delete.
   * @returns {Observable<any>} An observable containing the response from the server.
   */
  deleteInfo(id: string): Observable<any> {
    const token = localStorage.getItem('accessToken');  // JWT Token aus dem Session Storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/${id}/`, { headers });
  }
}
