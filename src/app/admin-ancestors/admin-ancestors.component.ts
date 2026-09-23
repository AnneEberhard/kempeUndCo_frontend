import { Component } from '@angular/core';
import { AdminFamilyService } from '../services/admin-family.service';
import { AdminPerson } from '../interfaces/admin-person';
import { LoadingService } from '../services/loading.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-ancestors',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-ancestors.component.html',
  styleUrl: './admin-ancestors.component.scss',
})
export class AdminAncestorsComponent {
  person: AdminPerson | null = null;
  error = '';
  search = '';
  persons: AdminPerson[] = [];
  searchError = '';

  constructor(private adminFamilyService: AdminFamilyService, private route: ActivatedRoute) { }

  ngOnInit(): void {
  const refn = this.route.snapshot.paramMap.get('refn');

  if (refn) {
    this.loadPerson(refn);
  }
}

  loadPerson(refn: string): void {
    this.error = '';

    this.adminFamilyService.getPerson(refn).subscribe({
      next: person => {
        this.person = person;
        console.log('Admin Person:', person);
      },
      error: error => {
        console.error(error);
        this.person = null;
        this.error = `Person konnte nicht geladen werden. (${error.status})`;
      }
    });
  }

  searchPersons(): void {
    this.searchError = '';

    this.adminFamilyService.searchPersons(this.search).subscribe({
      next: persons => {
        this.persons = persons;
      },
      error: error => {
        console.error(error);
        this.persons = [];
        this.searchError = `Suche fehlgeschlagen. (${error.status})`;
      }
    });
  }
}
