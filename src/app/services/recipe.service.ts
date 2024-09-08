import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  private apiUrl = `${environment.baseUrl}/api/recipes`;

  constructor(private http: HttpClient) { }

  /**
   * Fetches all recipe records.
   * 
   * This method retrieves a list of all recipe records from the server. If an error occurs during the request,
   * an empty array is returned.
   *
   * @returns {Observable<any[]>} An observable containing an array of recipe records.
   */
  getAllRecipes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching recipes:', error);
        return of([]); // Leeres Array zurückgeben, wenn ein Fehler auftritt
      }));
  }

  /**
   * Fetches a recipe by its unique identifier.
   * 
   * This method retrieves a specific recipe record based on the provided ID. If the recipe is not found or
   * an error occurs, the method will propagate the error.
   *
   * @param {string} recipeId - The unique identifier of the recipe record to retrieve.
   * @returns {Observable<any>} An observable containing the requested recipe record.
   */
  getRecipeById(recipeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${recipeId}/`);
  }

  /**
   * Adds a new recipe record.
   * 
   * This method sends a request to create a new recipe record with the provided data. The request is authenticated
   * using a JWT token from the session storage.
   *
   * @param {any} recipeData - The data of the recipe record to add.
   * @returns {Observable<any>} An observable containing the response from the server.
   */
  addRecipe(recipeData: any) {
    const token = sessionStorage.getItem('accessToken');  // JWT Token aus dem Session Storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/create/`, recipeData, { headers });
  }

  /**
  * Updates an existing recipe record.
  * 
  * This method sends a request to update a recipe record identified by the given ID with the provided form data.
  * The request is authenticated using a JWT token from the session storage.
  *
  * @param {string} id - The unique identifier of the recipe record to update.
  * @param {FormData} formData - The form data containing the updated recipe information.
  * @returns {Observable<any>} An observable containing the response from the server.
  */
  updateRecipe(id: string, formData: FormData): Observable<any> {
    const token = sessionStorage.getItem('accessToken');  // JWT Token aus dem Session Storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`${this.apiUrl}/${id}/`, formData, { headers });
  }


  /**
   * Deletes a recipe record.
   * 
   * This method sends a request to delete the recipe record identified by the given ID. The request is authenticated
   * using a JWT token from the session storage.
   *
   * @param {string} id - The unique identifier of the recipe record to delete.
   * @returns {Observable<any>} An observable containing the response from the server.
   */
  deleteRecipe(id: string): Observable<any> {
    const token = sessionStorage.getItem('accessToken');  // JWT Token aus dem Session Storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/${id}/`, { headers });
  }
}
