import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfoService {
  private apiUrl = `${environment.baseUrl}/api/infos/`;
  
  constructor(private http: HttpClient) {}

  getAllInfos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getInfoById(infoId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${infoId}/`);
  }

  addInfo(infoData: any) {
    const token = sessionStorage.getItem('accessToken');  // JWT Token aus dem Session Storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}create/`, infoData, { headers });
  }

}
