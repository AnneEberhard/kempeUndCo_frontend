import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { FamilyService } from '../services/family.service';
import { Person } from "../interfaces/person";
import { Relations } from "../interfaces/relations";
import { Family } from '../interfaces/family';
import { FormsModule } from '@angular/forms';
import { LoadingService } from '../services/loading.service';

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

  constructor(
    private familyService: FamilyService, 
    private router: Router, 
    private route: ActivatedRoute, 
    private loadingService: LoadingService) {
    this.personId = 3571;
  }

  /**
   * Initializes the component by fetching all persons and setting the ID for a specific person by name.
   * checks for query params and sets that person in case query param is valid
   */
  ngOnInit() {
    this.checkUser();

    this.route.queryParamMap.subscribe(params => {
      const encodedPersonRefnFromRoute = params.get('refn');
      const personRefnFromRoute = encodedPersonRefnFromRoute ? decodeURIComponent(encodedPersonRefnFromRoute) : null;
      this.loadingService.show();
      this.familyService.getAllPersons().subscribe({
        next: (data) => {
          this.allPersonsList = data;
          if (personRefnFromRoute) {
            this.setPersonIdByRefn(personRefnFromRoute);
          } else if (this.userKempe) {
            this.setPersonIdByRefn('@I5@');
          } else {
            this.setPersonIdByRefn('@I1151@');
          }
        },
        error: (error) => {
          console.error('Fehler beim Laden der Personenliste:', error);
          if (error.status === 404) {
            alert('Keine Personen gefunden.');
          } else if (error.status === 500) {
            alert('Serverfehler. Bitte versuche es später erneut.');
          } else {
            alert('Fehler beim Laden der Daten.');
          }
        },
        complete: () => {
          this.loadingService.hide(); 
        }
      });
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

  /**
   * checks if user belongs to family kempe or huenten based on local storage.
   */
  checkUser() {
    const family_1 = localStorage.getItem('family_1');
    const family_2 = localStorage.getItem('family_2');
    if (family_1 == 'kempe' || family_2 == 'kempe') {
      this.userKempe = true;
    }
  }

  /**
   * Loads family data for the currently selected person.
   */
  loadFamilyData() {
    this.loadingService.show();
  
    this.familyService.getFamily(this.personId).subscribe({
      next: (family) => {
        this.family = family;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Familiendaten:', error);
  
        if (error.status === 404) {
          alert('Familiendaten nicht gefunden.');
        } else if (error.status === 500) {
          alert('Serverfehler. Bitte versuche es später erneut.');
        } else {
          alert('Fehler beim Laden der Familiendaten.');
        }
      },
      complete: () => {
        this.loadingService.hide();
      }
    });
  }

// loadFamilyData() {
//   this.familyService.getFamily(this.personId).subscribe(family => {
//     this.family = family;
//   });
// }

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
    this.loadingService.show();
  
    this.familyService.getFamily(this.personId).subscribe({
      next: (family) => {
        this.family = family;
        this.clearSearch();
      },
      error: (error) => {
        console.error('Fehler beim Laden:', error);
  
        if (error.status === 404) {
          alert('Daten nicht gefunden.');
        } else if (error.status === 500) {
          alert('Serverfehler. Bitte versuche es noch einmal.');
        } else {
          alert('Fehler beim Laden.');
        }
      },
      complete: () => {
        this.loadingService.hide();
      }
    });
  }

//  selectPerson(person: Person): void {
//    this.personId = person.id;
//    this.familyService.getFamily(this.personId).subscribe(family => {
//      this.family = family;
//      this.clearSearch();
//    });
//  }

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

  /**
   * Updates the family data based on the provided person ID.
   *
   * @param {number} id - The ID of the person whose family data is to be fetched.
   */
  getNewData(id: number) {
    if (id !== 0) {
      this.personId = id;
      this.loadingService.show();
  
      this.familyService.getFamily(this.personId).subscribe({
        next: (family) => {
          this.family = family;
        },
        error: (error) => {
          console.error('Fehler beim Laden:', error);
  
          if (error.status === 404) {
            alert('Familiendaten nicht gefunden.');
          } else if (error.status === 500) {
            alert('Serverfehler. Bitte versuche es erneut.');
          } else {
            alert('Fehler beim Laden.');
          }
        },
        complete: () => {
          this.loadingService.hide();
        }
      });
    }
  }
  
//  getNewData(id: number) {
//    if (id != 0) {
//      this.personId = id;
//      this.familyService.getFamily(this.personId).subscribe(family => {
//        this.family = family;
//      });
//    }
//  }


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
   * Closes overview of family Kempe.
   */
  hideOverview() {
    document.getElementById('popUpOverviewContainer')?.classList.add('dNone');
  }
}
