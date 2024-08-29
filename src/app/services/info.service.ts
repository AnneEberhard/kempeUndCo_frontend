import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfoService {
  private apiUrl = `${environment.baseUrl}/api/infos`;
  
  constructor(private http: HttpClient) {}

  getAllInfos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching infos:', error);
        return of([]); // Leeres Array zurückgeben, wenn ein Fehler auftritt
      }));
  }

  getInfoById(infoId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${infoId}/`);
  }

  addInfo(infoData: any) {
    const token = sessionStorage.getItem('accessToken');  // JWT Token aus dem Session Storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/create/`, infoData, { headers });
  }

  
  updateInfo(id: string, formData: FormData): Observable<any> {
    const token = sessionStorage.getItem('accessToken');  // JWT Token aus dem Session Storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`${this.apiUrl}/${id}/`, formData, { headers });
  }

  deleteInfo(id: string): Observable<any> {
    const token = sessionStorage.getItem('accessToken');  // JWT Token aus dem Session Storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/${id}/`, { headers });
  }
}
