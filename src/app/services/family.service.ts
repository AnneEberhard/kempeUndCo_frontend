import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Person } from "../interfaces/person";
import { Relations } from "../interfaces/relations";
import { Family } from "../interfaces/family";
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FamilyService {

  private apiUrl = `${environment.baseUrl}/api/ancestors`;
  family: Family | null = null;

  constructor(private http: HttpClient) { }

  /**
   * Retrieves all persons.
   *
   * @returns {Observable<any[]>} An observable containing an array of all persons.
   */
  getAllPersons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/persons/`);
  }

  /**
   * Retrieves a person by their ID.
   *
   * @param {number} id - The ID of the person to be retrieved.
   * @returns {Observable<Person>} An observable containing the person with the specified ID.
   */
  getPerson(id: number): Observable<Person> {
    return this.http.get<Person>(`${this.apiUrl}/persons/${id}/`);
  }

  /**
   * Retrieves relations for a person by their ID.
   *
   * @param {number} id - The ID of the person whose relations are to be retrieved.
   * @returns {Observable<Relations>} An observable containing the relations for the specified person.
   */
  getRelations(id: number): Observable<Relations> {
    return this.http.get<Relations>(`${this.apiUrl}/relations/${id}/`);
  }

  /**
   * Retrieves the family information for a person, including their parents, grandparents, and marriages.
   *
   * @param {number} id - The ID of the person whose family information is to be retrieved.
   * @returns {Observable<Family>} An observable containing the family information, including the person, their parents, grandparents, and marriages.
   */
  getFamily(id: number): Observable<Family> {
    return this.getRelations(id).pipe(
      switchMap(relations => {
        const person$ = this.getPerson(relations.person).pipe(
          catchError(() => of(this.createUnknownPerson())) // Fängt Fehler für die Hauptperson ab
        );
        const father$ = relations.fath_refn ? this.getPerson(relations.fath_refn).pipe(
          catchError(() => of(this.createUnknownPerson())) // Fängt Fehler für den Vater ab
        ) : of(null);
        const mother$ = relations.moth_refn ? this.getPerson(relations.moth_refn).pipe(
          catchError(() => of(this.createUnknownPerson())) // Fängt Fehler für die Mutter ab
        ) : of(null);

        const marriages$ = [1, 2, 3, 4].map(i => {
          const spouseRefn = relations[`marr_spou_refn_${i}` as keyof Relations];
          const childrenIds = relations[`children_${i}` as keyof Relations] as number[];

          if (typeof spouseRefn === 'number') {
            const spouse$ = this.getPerson(spouseRefn).pipe(
              catchError(() => of(this.createUnknownPerson())) // Fängt Fehler für den Ehepartner ab
            );
            const children$ = childrenIds.length > 0 ? forkJoin(
              childrenIds.map(childId => this.getPerson(childId).pipe(
                catchError(() => of(this.createUnknownPerson())) // Fängt Fehler für Kinder ab
              ))
            ) : of([]);

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
          switchMap(([person, father, mother, ...marriages]) => {
            return this.getGrandparents(father, mother).pipe(
              map(grandparents => ({
                person,
                grandparents,
                parents: [father, mother],
                marriages: marriages.filter(marriage => marriage !== null) as { spouse: Person, children: Person[] }[]
              }))
            );
          })
        );
      }),
      catchError(() => of({ // Fängt Fehler für das gesamte Observable ab
        person: this.createUnknownPerson(),
        grandparents: [],
        parents: [null, null],
        marriages: []
      }))
    );
  }

  /**
   * Retrieves the grandparents of the given father and mother.
   * 
   * For each parent, this method fetches their respective relations to determine their parents (the grandparents).
   * If any parent or grandparent cannot be found, an "unknown person" placeholder is used.
   *
   * @param {Person | null} father - The father of the person whose grandparents are to be retrieved.
   * @param {Person | null} mother - The mother of the person whose grandparents are to be retrieved.
   * @returns {Observable<Person[]>} An observable containing an array of grandparents, which may include unknown persons if any are not found.
   */
  getGrandparents(father: Person | null, mother: Person | null): Observable<Person[]> {
    const unknownPerson = this.createUnknownPerson();

    const fatherParents$ = father ? this.getRelations(father.id).pipe(
      switchMap(relations => {
        const father$ = relations.fath_refn ? this.getPerson(relations.fath_refn).pipe(
          catchError(() => of(unknownPerson))  // Fängt Fehler ab, wenn die Person nicht gefunden wird
        ) : of(unknownPerson);

        const mother$ = relations.moth_refn ? this.getPerson(relations.moth_refn).pipe(
          catchError(() => of(unknownPerson))  // Fängt Fehler ab, wenn die Person nicht gefunden wird
        ) : of(unknownPerson);

        return forkJoin([father$, mother$]);
      }),
      catchError(() => of([unknownPerson, unknownPerson]))  // Fängt Fehler ab, wenn die Relation nicht gefunden wird
    ) : of([unknownPerson, unknownPerson]);

    const motherParents$ = mother ? this.getRelations(mother.id).pipe(
      switchMap(relations => {
        const father$ = relations.fath_refn ? this.getPerson(relations.fath_refn).pipe(
          catchError(() => of(unknownPerson))  // Fängt Fehler ab, wenn die Person nicht gefunden wird
        ) : of(unknownPerson);

        const mother$ = relations.moth_refn ? this.getPerson(relations.moth_refn).pipe(
          catchError(() => of(unknownPerson))  // Fängt Fehler ab, wenn die Person nicht gefunden wird
        ) : of(unknownPerson);

        return forkJoin([father$, mother$]);
      }),
      catchError(() => of([unknownPerson, unknownPerson]))  // Fängt Fehler ab, wenn die Relation nicht gefunden wird
    ) : of([unknownPerson, unknownPerson]);

    return forkJoin([fatherParents$, motherParents$]).pipe(
      map(grandparentsArray => grandparentsArray.flat())
    );
  }

  /**
   * Creates a placeholder "unknown person" object with default values.
   * 
   * This is used when a person cannot be found or when placeholder data is needed.
   *
   * @returns {Person} A "Person" object with default or placeholder values.
   */
  private createUnknownPerson(): Person {
    return {
      id: 0,
      refn: '',
      name: '...',
      surn: '',
      givn: '',
      sex: '',
      occu: '',
      chan_date: '',
      chan_date_time: '',
      birt_date: '',
      birth_date_formatted: '',
      birt_plac: '',
      deat_date: '',
      death_date_formatted: '',
      deat_plac: '',
      note: '',
      chr_date: '',
      chr_plac: '',
      buri_date: '',
      buri_plac: '',
      name_rufname: '',
      name_npfx: '',
      sour: '',
      name_nick: '',
      name_marnm: '',
      chr_addr: '',
      reli: '',
      obje_file_1: '',
      obje_file_2: '',
      obje_file_3: '',
      obje_file_4: '',
      obje_file_5: '',
      obje_file_6: '',
      confidential: 'false'
    };
  }


}
