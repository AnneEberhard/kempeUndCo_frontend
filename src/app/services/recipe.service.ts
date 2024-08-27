import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  private apiUrl = `${environment.baseUrl}/api/recipes`;
  
  constructor(private http: HttpClient) {}

  
  getAllRecipes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/`);
  }


  getRecipeById(recipeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${recipeId}/`);
  }


  addRecipe(recipeData: any) {
    const token = sessionStorage.getItem('accessToken');  // JWT Token aus dem Session Storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/create/`, recipeData, { headers });
  }

  
  updateRecipe(id: string, formData: FormData): Observable<any> {
    const token = sessionStorage.getItem('accessToken');  // JWT Token aus dem Session Storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<any>(`${this.apiUrl}/${id}/`, formData, { headers });
  }

  deleteRecipe(id: string): Observable<any> {
    const token = sessionStorage.getItem('accessToken');  // JWT Token aus dem Session Storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<any>(`${this.apiUrl}/${id}/`, { headers });
  }
}
