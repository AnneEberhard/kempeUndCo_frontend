import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AdminPerson } from '../interfaces/admin-person';
import { AdminRelations } from '../interfaces/admin-relations';
import { EditFamily } from '../interfaces/edit-family';
import { FamilyService } from './family.service';
import { AdminPersonCreateResponse } from '../interfaces/admin-person-create-response';


@Injectable({
  providedIn: 'root'
})
export class AdminFamilyService {

  private apiUrl = `${environment.baseUrl}/api/ancestors/admin`;
  personsByRefn = new Map<string, AdminPerson>();

  constructor(private http: HttpClient, private familyService: FamilyService,) { }

  getAdminPerson(refn: string): Observable<AdminPerson> {
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

  /**
   * Retrieves relations for a person by their ID.
   *
   * @param {refn} id - The ID of the person whose relations are to be retrieved.
   * @returns {Observable<Relations>} An observable containing the relations for the specified person.
   */
  getAdminRelations(refn: string): Observable<AdminRelations> {
    return this.http.get<AdminRelations>(
      `${this.apiUrl}/relations/${encodeURIComponent(refn)}/`
    );
  }

  getEditFamily(refn: string): Observable<EditFamily> {
    this.personsByRefn.clear();
    return this.getAdminRelations(refn).pipe(
      switchMap(relations => {

        const father$ = relations.fath_refn
          ? this.getAdminPerson(relations.fath_refn).pipe(
            tap(person => {
              if (person) {
                this.personsByRefn.set(person.refn, person);
              }
            }),
            catchError(() => of(null))
          )
          : of(null);

        const mother$ = relations.moth_refn
          ? this.getAdminPerson(relations.moth_refn).pipe(
            tap(person => {
              if (person) {
                this.personsByRefn.set(person.refn, person);
              }
            }),
            catchError(() => of(null))
          )
          : of(null);

        const marriages$ = [1, 2, 3, 4].map(i => {

          const spouseRefn =
            relations[`marr_spou_refn_${i}` as keyof AdminRelations] as string | null;

          const marr_date =
            relations[`marr_date_${i}` as keyof AdminRelations] as string | null;

          const marr_plac =
            relations[`marr_plac_${i}` as keyof AdminRelations] as string | null;

          const fam_stat =
            relations[`fam_stat_${i}` as keyof AdminRelations] as string | null;

          const childrenIds =
            relations[`children_${i}` as keyof AdminRelations] as string[] | null;

          const spouse$ =
            typeof spouseRefn === 'string'
              ? this.getAdminPerson(spouseRefn).pipe(
                tap(person => {
                  if (person) {
                    this.personsByRefn.set(person.refn, person);
                  }
                }),
                catchError(() => of(null))
              )
              : of(null);

          const children$ =
            childrenIds?.length
              ? forkJoin(
                childrenIds.map(childId =>
                  this.getAdminPerson(childId).pipe(
                    tap(person => {
                      if (person) {
                        this.personsByRefn.set(person.refn, person);
                      }
                    }),
                    catchError(() => of(null))
                  )
                )
              )
              : of([]);

          return forkJoin({
            spouse: spouse$,
            marr_date: of(marr_date),
            marr_plac: of(marr_plac),
            fam_stat: of(fam_stat),
            children: children$
          });
        });

        return forkJoin({
          father: father$,
          mother: mother$,
          marriages: forkJoin(marriages$),
          originalRelation: of(relations)
        });
      }),
      map(({ father, mother, marriages, originalRelation }) => ({
        parents: [father, mother],
        marriages,
        originalRelation
      }))
    );
  }

  searchRelatedPersons(search: string): Observable<AdminPerson[]> {
    return this.http.get<AdminPerson[]>(
      `${this.apiUrl}/persons/?search=${encodeURIComponent(search)}`
    );
  }

  updateRelation(
    refn: string,
    data: Partial<AdminRelations>
  ): Observable<AdminRelations> {
    return this.http.patch<AdminRelations>(
      `${this.apiUrl}/relations/${encodeURIComponent(refn)}/`,
      data
    );
  }

  createPerson(data: FormData): Observable<AdminPersonCreateResponse> {
  return this.http.post<AdminPersonCreateResponse>(
    `${this.apiUrl}/persons/new/`,
    data
  );
}

validateBirthDeathDates(
  birthValue: string | null | undefined,
  deathValue: string | null | undefined
): string | null {
  const birth = this.parseDateValue(birthValue);
  const death = this.parseDateValue(deathValue);

  if (!birth || !death) {
    return null;
  }

  // Beide Angaben enthalten ein vollständiges Datum.
  if (birth.type === 'full' && death.type === 'full') {
    if (death.date < birth.date) {
      return 'Das Sterbedatum darf nicht vor dem Geburtsdatum liegen.';
    }

    return null;
  }

  // Mindestens eine Angabe enthält nur eine Jahreszahl.
  if (death.year < birth.year) {
    return 'Das Sterbedatum darf nicht vor dem Geburtsdatum liegen.';
  }

  // Gleiches Jahr: nur bei zwei vollständigen Daten ist
  // der Vergleich auf Tagesebene eindeutig.
  if (
    birth.year === death.year &&
    birth.type === 'full' &&
    death.type === 'full' &&
    death.date < birth.date
  ) {
    return 'Das Sterbedatum darf nicht vor dem Geburtsdatum liegen.';
  }

  return null;
}

private parseDateValue(
  value: string | null | undefined
): { year: number; type: 'year' | 'full'; date: Date } | null {
  const input = value?.trim();

  if (!input) {
    return null;
  }

  // Reine Jahreszahl, z. B. 1847
  const yearMatch = input.match(/^(\d{4})$/);

  if (yearMatch) {
    const year = Number(yearMatch[1]);

    return {
      year,
      type: 'year',
      date: new Date(year, 0, 1)
    };
  }

  // Vollständiges Datum, z. B. 9.1.2001 oder 09.01.2001
  const dateMatch = input.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);

  if (!dateMatch) {
    return null;
  }

  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { year, type: 'full', date };
}
}