import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.baseUrl}/api/comments/`;

  constructor(private http: HttpClient) { }

  /**
 * Retrieves comments for a specific info entry.
 *
 * @param {number} infoId - The ID of the info entry for which comments are to be retrieved.
 * @returns {Observable<any>} An observable containing the comments for the specified info entry.
 */
  getCommentsForInfo(infoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?info=${infoId}`);
  }

  /**
  * Retrieves comments for a specific recipe.
  *
  * @param {number} recipeId - The ID of the recipe for which comments are to be retrieved.
  * @returns {Observable<any>} An observable containing the comments for the specified recipe.
  */
  getCommentsForRecipe(recipeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?recipe=${recipeId}`);
  }

  /**
  * Retrieves a specific comment by its ID.
  *
  * @param {string} infoId - The ID of the comment to be retrieved.
  * @returns {Observable<any>} An observable containing the requested comment.
  */
  getCommentById(infoId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${infoId}/`);
  }

  /**
  * Adds a new comment.
  *
  * @param {any} comment - The comment object to be added.
  * @returns {Observable<any>} An observable containing the response from the server.
  */
  addComment(comment: any): Observable<any> {
    const token = sessionStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.apiUrl}create/`, comment, { headers });
  }

  /**
   * Updates an existing comment.
   *
   * @param {string} id - The ID of the comment to be updated.
   * @param {any} content - The new content for the comment.
   * @returns {Observable<any>} An observable containing the updated comment.
   */
  updateComment(id: string, content: any): Observable<any> {
    const token = sessionStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`${this.apiUrl}${id}/`, content, { headers });
  }


  /**
   * Deletes a comment.
   *
   * @param {string} id - The ID of the comment to be deleted.
   * @returns {Observable<any>} An observable containing the response from the server.
   */
  deleteComment(id: string): Observable<any> {
    const token = sessionStorage.getItem('accessToken');  // JWT Token aus dem Session Storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(`${this.apiUrl}${id}/`, { headers });
  }

}
