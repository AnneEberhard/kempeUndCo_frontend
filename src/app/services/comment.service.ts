import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.baseUrl}/api/comments/`;

  constructor(private http: HttpClient) {}

  getCommentsForInfo(infoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?info=${infoId}`);
  }

  getCommentsForRecipe(infoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?recipe=${infoId}`);
  }

  getCommentById(infoId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${infoId}/`);
  }

  addComment(comment: any): Observable<any> {
    const token = sessionStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.apiUrl}create/`, comment, { headers });
  }

  updateComment(id: string, content:any): Observable<any> {
    const token = sessionStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`${this.apiUrl}${id}/`, content, { headers });
  }

  deleteComment(id: string): Observable<any> {
    const token = sessionStorage.getItem('accessToken');  // JWT Token aus dem Session Storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(`${this.apiUrl}${id}/`, { headers });
  }

}
