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
  searchResults: (Person[] | any) = [];
  showNoResultsMessage: boolean = false;
  selectedPerson: Person | null = null;
  currentImage: string | null = null;
  userKempe = false;

  constructor(private familyService: FamilyService, private router: Router) {
    this.personId = 3571;
  }

  /**
   * Initializes the component by fetching all persons and setting the ID for a specific person by name.
   */
  ngOnInit() {
    this.checkUser();
    this.familyService.getAllPersons().subscribe(data => {
      this.allPersonsList = data;
      if (this.userKempe) {
        this.setPersonIdByRefn('@I5@')
      } else {
        this.setPersonIdByRefn('@I1151@')
      }
    });
  }

  /**
   * Sets the person ID based on the provided name and loads the corresponding family data.
   * no longer in use
   * @param {string} name - The full name of the person to find.
   */
  setPersonIdByName(name: string) {
    const person = this.allPersonsList.find(p => `${p.givn} ${p.surn}` === name);
    if (person) {
      this.personId = person.id;
      this.loadFamilyData();
    } else {
      console.error('Person mit dem angegebenen Namen nicht gefunden');
    }
  }


  /**
 * Sets the person ID based on the provided name and loads the corresponding family data.
 *
 * @param {string} refn - The unique refn of the person to find, independent of database.
 */
  setPersonIdByRefn(refn: string) {
    const person = this.allPersonsList.find(p => p.refn === refn);
    if (person) {
      this.personId = person.id;
      this.loadFamilyData();
    } else {
      console.error('Person mit dem angegebenen Namen nicht gefunden');
    }
  }

  checkUser() {
    const family_1 = localStorage.getItem('family_1');
    const family_2 = localStorage.getItem('family_2');
    if (family_1 == 'kempe' || family_2 =='kempe') {
      this.userKempe = true;
    }
  }

  /**
   * Loads family data for the currently selected person.
   */
  loadFamilyData() {
    this.familyService.getFamily(this.personId).subscribe(family => {
      this.family = family;
    });
  }

  /**
   * Searches for persons based on the search term and updates the search results.
   */
  search(): void {
    const term = this.searchTerm.toLowerCase();
    this.searchResults = this.allPersonsList.filter(person =>
      person.name.toLowerCase().includes(term)
    );
    this.showNoResultsMessage = this.searchResults.length === 0;
  }

  /**
   * Selects a person and loads their family data.
   *
   * @param {Person} person - The person to be selected.
   */
  selectPerson(person: Person): void {
    this.personId = person.id;
    this.familyService.getFamily(this.personId).subscribe(family => {
      this.family = family;
      this.clearSearch();
    });
  }

  /**
   * Clears the search term and search results.
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.searchResults = [];
    this.showNoResultsMessage = false;
  }

  /*
  * sets the page back to initial setting
  */
  refreshPage() {
    if (this.userKempe) {
      this.setPersonIdByRefn('@I5@')
    } else {
      this.setPersonIdByRefn('@I1151@')
    }
  }

  showOverview2() {
    this.showImage('assets/images/Overview Stammbaum Kempe.jpg');
  }

  /**
   * Updates the family data based on the provided person ID.
   *
   * @param {number} id - The ID of the person whose family data is to be fetched.
   */
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

  /**
   * Displays information about the selected person in a popup container.
   *
   * @param {Person} person - The person whose information is to be displayed.
   */
  showInfos(person: Person) {
    this.selectedPerson = person;
    const div = document.getElementById('popUpInfoContainer');
    if (div) {
      div.classList.remove('dNone');
    }
  }

  /**
   * Hides the information popup and resets the selected person.
   */
  hideInfos() {
    this.selectedPerson = null;
    const div = document.getElementById('popUpInfoContainer');
    if (div) {
      div.classList.add('dNone');
    }
    this.hideImage();
  }


  /**
   * Navigates to the discussions page for the currently selected person.
   */
  goToDiscussions(): void {
    if (this.selectedPerson) {
      const url = `/discussions/${this.selectedPerson.id}`;
      this.router.navigate([url]);
    }
  }

  /**
   * Displays an image in a modal.
   *
   * @param {string} imageUrl - The URL of the image to display.
   */
  showImage(imageUrl: string): void {
    console.log(imageUrl);
    this.currentImage = imageUrl;
    document.getElementById('imageModal')?.classList.remove('dNone');
  }

  /**
   * Hides the image modal and resets the current image.
   */
  hideImage(): void {
    this.currentImage = null;
    document.getElementById('imageModal')?.classList.add('dNone');
  }

  /**
   * show family tree overview.
   */
  showOverview() {
    document.getElementById('popUpOverviewContainer')?.classList.remove('dNone');
  }

  /**
   * shows the clicked person from the overview and closes overview.
   * @param {string} refn - refn of the person to display.
   */
  showPerson(refn: string) {
    this.setPersonIdByRefn(refn);
    this.hideOverview();
  }

  /**
   * Hcloses overview of family Kempe.
   */
  hideOverview() {
    document.getElementById('popUpOverviewContainer')?.classList.add('dNone');
  }
}
