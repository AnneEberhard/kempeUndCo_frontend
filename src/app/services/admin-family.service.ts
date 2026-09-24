import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminPerson } from '../interfaces/admin-person';

@Injectable({
  providedIn: 'root'
})
export class AdminFamilyService {

  private apiUrl = `${environment.baseUrl}/api/ancestors/admin`;

  constructor(private http: HttpClient) { }

  getPerson(refn: string): Observable<AdminPerson> {
    return this.http.get<AdminPerson>(
      `${this.apiUrl}/persons/${encodeURIComponent(refn)}/`
    );
  }

  searchPersons(search: string): Observable<AdminPerson[]> {
    return this.http.get<AdminPerson[]>(
      `${this.apiUrl}/persons/`,
      {
        params: {
          search
        }
      }
    );
  }

  updatePerson(refn: string, data: FormData): Observable<AdminPerson> {
  return this.http.patch<AdminPerson>(
    `${this.apiUrl}/persons/${encodeURIComponent(refn)}/`,
    data
  );
}
}