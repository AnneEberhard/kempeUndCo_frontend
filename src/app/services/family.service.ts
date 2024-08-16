import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Person } from "../interfaces/person";
import { Relations } from "../interfaces/relations";
import { Family } from "../interfaces/family";


@Injectable({
  providedIn: 'root'
})
export class FamilyService {

  private apiUrl = 'http://localhost:8000/api'; 

  constructor(private http: HttpClient) { }

  getAllPersons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ancestors/persons/`);
  }


  getPerson(id:number): Observable<Person> {
    return this.http.get<Person>(`${this.apiUrl}/ancestors/persons/${id}/`);
  }

  getRelations(id:number): Observable<Relations> {
    return this.http.get<Relations>(`${this.apiUrl}/ancestors/relations/${id}/`);
  }

  getFamily(id: number): Observable<Family> {
    return this.getRelations(id).pipe(
      switchMap(relations => {
        const person$ = this.getPerson(relations.person);
        const father$ = relations.fath_refn ? this.getPerson(relations.fath_refn) : of(null);
        const mother$ = relations.moth_refn ? this.getPerson(relations.moth_refn) : of(null);
  
        const marriages$ = [1, 2, 3, 4].map(i => {
          const spouseRefn = relations[`marr_spou_refn_${i}` as keyof Relations];
          const childrenIds = relations[`children_${i}` as keyof Relations] as number[];
  
          if (typeof spouseRefn === 'number') {
            const spouse$ = this.getPerson(spouseRefn);
            const children$ = childrenIds.length > 0 ? forkJoin(childrenIds.map(childId => this.getPerson(childId))) : of([]);
  
            return forkJoin([spouse$, children$]).pipe(
              map(([spouse, children]) => ({
                spouse,
                children
              }))
            );
          } else {
            return of(null);
          }
        });
  
        return forkJoin([person$, father$, mother$, ...marriages$]).pipe(
          map(([person, father, mother, ...marriages]) => {
            return {
              person,
              grandparents: [],
              parents: [father, mother] as (Person | null)[],
              marriages: marriages.filter(marriage => marriage !== null) as { spouse: Person, children: Person[] }[]
            };
          })
        );
      })
    );
  }
  

}
