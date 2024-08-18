import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { FamilyService } from '../services/family.service';
import { Person } from "../interfaces/person";
import { Relations } from "../interfaces/relations";
import { Family } from '../interfaces/family';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ancestors',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollToTopButtonComponent, FormsModule],
  templateUrl: './ancestors.component.html',
  styleUrl: './ancestors.component.scss'
})
export class AncestorsComponent implements OnInit {


  person: Person | undefined;
  relation: Relations | undefined;
  allPersonsList: Person[] = [];
  family: Family | undefined;
  personId: number;
  searchTerm: string = '';
  searchResults: Person[] = [];

  constructor(private familyService: FamilyService, private router: Router) {
    this.personId = 3571;
  }


  ngOnInit() {
    this.familyService.getAllPersons().subscribe(data => {
      this.allPersonsList = data;
    });

    this.familyService.getFamily(this.personId).subscribe(family => {
      this.family = family;
    });
  }


  search(): void {
    const term = this.searchTerm.toLowerCase();
    this.searchResults = this.allPersonsList.filter(person =>
      person.name.toLowerCase().includes(term)
    );
  }

  selectPerson(person: Person): void {
    this.personId = person.id;
    this.familyService.getFamily(this.personId).subscribe(family => {
      this.family = family;
      this.searchResults = []; // Clear search results after selection
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchResults = [];
  }

  getNewData(id: number) {
    if (id != 0) {
      this.personId = id;
      this.familyService.getFamily(this.personId).subscribe(family => {
        this.family = family;
      });
    }
  }

  /**
* shows overlay with hints
*/
  showHint() {
    const div = document.getElementById('popUpHintContainer');
    if (div) {
      div.classList.remove('dNone');
    }
  }

  /**
  * hides overlay with hints
  */
  hideHint() {
    const div = document.getElementById('popUpHintContainer');
    if (div) {
      div.classList.add('dNone');
    }
  }

  showInfos() {
    console.log('infos');
    const div = document.getElementById('popUpInfoContainer');
    if (div) {
      div.classList.remove('dNone');
    }
  }

  hideInfos() {
    const div = document.getElementById('popUpInfoContainer');
    if (div) {
      div.classList.add('dNone');
    }
  }
}
