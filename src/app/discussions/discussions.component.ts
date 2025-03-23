import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { DiscussionService } from '../services/discussion.service';
import { FormsModule } from '@angular/forms';
import { FamilyService } from '../services/family.service';
import { QuillModule } from 'ngx-quill';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AllpagesService } from '../services/allpages.service';
import { LoadingService } from '../services/loading.service';


@Component({
  selector: 'app-discussions',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollToTopButtonComponent, FormsModule, QuillModule],
  templateUrl: './discussions.component.html',
  styleUrl: './discussions.component.scss'
})
export class DiscussionsComponent implements OnInit {
  public imageCache: { [id: string]: { original: string; thumbnail: string }[] } = {};
  public imageFiles: File[] = [];
  discussions: any[] = [];
  selectedDiscussion: any = null;
  filteredDiscussions: any[] = [];
  personId: string | null = null;
  personRefn: string = '@I1@';
  personName: string | null = null;
  personGebDate: string = 'unbekannt';
  userId: string | null = null;
  userEmail: string | null = null;
  newEntry = {
    title: '',
    content: '',
    image_1: null,
    image_2: null,
    image_3: null,
    image_4: null
  };
  filteredEntries: any[] = [];
  entry: any = null;
  editEntryData: any = null;
  entryToDelete: any = null;
  sanitizedContent: SafeHtml | null = null;
  showImageUrl: string | null = null;
  deletedImages: Set<string> = new Set();
  thumbnailPath = 'discussions/thumbnails/';

  constructor(
    private discussionService: DiscussionService,
    private familyService: FamilyService,
    private route: ActivatedRoute,
    private router: Router,
    public sanitizer: DomSanitizer,
    public allpagesService: AllpagesService, 
    private loadingService: LoadingService
  ) { }

  /**
  * Initializes the component by loading data based on route parameters and session storage.
  */
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.personId = params.get('id');
      if (this.personId) {
        this.loadPerson(+this.personId);
        this.loadDiscussion(this.personId);
      } else {
        this.loadAllDiscussions();
      }
    });
    this.userId = localStorage.getItem('userId');
    this.userEmail = localStorage.getItem('userEmail');
  }

  /**
  * encodes the refn so that the @ does cause problems.
  */
  getEncodedRefn(): string {
    return encodeURIComponent(this.personRefn);
  }

  /**
   * routes back to the person in the ancestors page.
   */
  navigateToAncestors(): void {
    if (this.personId) {
      this.router.navigate(['/ancestors', this.personId]);
    } else {
      this.router.navigate(['/ancestors']);
    }
  }

  /**
   * Loads and sorts all discussions, and sets the filtered discussions.
   */
  loadAllDiscussions(): void {
    this.loadingService.show();
  
    this.discussionService.getAllDiscussions().subscribe({
      next: (discussions) => {
        this.discussions = discussions;
        this.discussions.sort((a, b) => {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
        this.filteredDiscussions = [...this.discussions];
        this.filteredDiscussions.sort((a, b) => {
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        });
      },
      error: (error) => {
        console.error('Fehler beim Laden der Diskussionen:', error);
  
        if (error.status === 404) {
          alert('Keine Diskussionen gefunden.');
        } else if (error.status === 500) {
          alert('Serverfehler. Bitte versuche es später erneut.');
        } else {
          alert('Fehler beim Laden der Diskussionen.');
        }
      },
      complete: () => {
        this.loadingService.hide();
      }
    });
  }
  
//  loadAllDiscussions(): void {
//    this.discussionService.getAllDiscussions().subscribe(discussions => {
//      this.discussions = discussions;
//      this.discussions.sort((a, b) => {
//        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
//      });
//      this.filteredDiscussions = this.discussions;
//    });
//    this.filteredDiscussions.sort((a, b) => {
//      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
//    });
//  }

  /**
   * Loads a specific discussion based on person ID and sorts the discussion entries.
   *
   * @param {string} personId - The ID of the person whose discussion is to be loaded.
   */
  loadDiscussion(personId: string): void {
    this.loadingService.show();
  
    this.discussionService.getDiscussionByPersonId(personId).subscribe({
      next: (discussion) => {
        this.selectedDiscussion = discussion;
        const selectedDiscussionEntries = discussion.entries;
  
        selectedDiscussionEntries.sort((a: { updated_at: string | number | Date; }, b: { updated_at: string | number | Date; }) => {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
  
        this.filteredEntries = selectedDiscussionEntries;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Diskussion:', error);
  
        if (error.status === 404) {
          alert('Keine Diskussion zu dieser Person gefunden.');
        } else if (error.status === 500) {
          alert('Serverfehler. Bitte versuche es später erneut.');
        } else {
          alert('Fehler beim Laden der Diskussion.');
        }
      },
      complete: () => {
        this.loadingService.hide();
      }
    });
  }
  
//  loadDiscussion(personId: string): void {
//    this.discussionService.getDiscussionByPersonId(personId).subscribe(discussion => {
//      this.selectedDiscussion = discussion;
//      const selectedDiscussionEntries = discussion.entries;
//      selectedDiscussionEntries.sort((a: { updated_at: string | number | Date; }, b: { updated_at: string | number | Date; }) => {
//        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
//      });
//      this.filteredEntries = selectedDiscussionEntries;
//    });
//  }

  /**
   * Loads a person's details based on the person ID.
   *
   * @param {number} personId - The ID of the person to load.
   */
  loadPerson(personId: number): void {
    this.loadingService.show(); // Lade-Overlay aktivieren
  
    this.familyService.getPerson(personId).subscribe({
      next: (person) => {
        this.personName = person.name;
        this.personRefn = person.refn;
        if (person.birt_date) {
          this.personGebDate = person.birt_date;
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Personendaten:', error);
  
        if (error.status === 404) {
          alert('Person nicht gefunden.');
        } else if (error.status === 500) {
          alert('Serverfehler. Bitte versuche es später erneut.');
        } else {
          alert('Fehler beim Laden der Personendaten.');
        }
      },
      complete: () => {
        this.loadingService.hide(); // Lade-Overlay ausblenden
      }
    });
  }
  
//  loadPerson(personId: number): void {
//    this.familyService.getPerson(personId).subscribe(person => {
//      this.personName = person.name;
//      this.personRefn = person.refn;
//      if (person.birt_date) {
//        this.personGebDate = person.birt_date;
//      }
//    });
//  }

  /**
   * Filters the discussions list based on the search term.
   *
   * @param {Event} event - The event triggered by the input change.
   */
  filterList(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (!searchTerm) {
      this.filteredDiscussions = this.discussions;
    } else {
      this.filteredDiscussions = this.discussions.filter((discussion) =>
        discussion.person.name.toLowerCase().includes(searchTerm)
      );
    }
  }

  /**
   * Navigates to the discussion page for the specified person ID.
   *
   * @param {string} personId - The ID of the person to navigate to.
   */
  goToDiscussion(personId: string): void {
    this.router.navigate(['/discussions/', personId]);
  }

  /**
   * Clears the current discussion selection and navigates back to the discussions list.
   */
  clearSelection(): void {
    this.selectedDiscussion = null;
    this.router.navigate(['/discussions']);
  }

  /**
   * Filters the entries of the selected discussion based on the search term.
   *
   * @param {Event} event - The event triggered by the input change.
   */
  filterEntries(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (!searchTerm) {
      this.filteredEntries = this.selectedDiscussion.entries;
    } else {
      this.filteredEntries = this.selectedDiscussion.entries.filter((entry: { author: string; title: string; content: string; }) =>
        entry.author.toLowerCase().includes(searchTerm) ||
        (entry.title && entry.title.toLowerCase().includes(searchTerm)) ||
        entry.content.toLowerCase().includes(searchTerm)
      );
    }
  }

  /**
   * Deletes the currently selected entry and updates the discussion.
   */
  deleteEntry(): void {
    this.loadingService.show();
  
    this.discussionService.deleteEntry(this.entryToDelete.id).subscribe({
      next: () => {
        this.selectedDiscussion.entries = this.selectedDiscussion.entries.filter(
          (e: any) => e.id !== this.entryToDelete.id
        );
        this.loadDiscussion(this.selectedDiscussion.person.id);
        this.hidePopUp();
      },
      error: (error) => {
        console.error('Fehler beim Löschen des Eintrags:', error);
  
        if (error.status === 404) {
          alert('Eintrag nicht gefunden.');
        } else if (error.status === 500) {
          alert('Serverfehler. Bitte versuche es später erneut.');
        } else {
          alert('Fehler beim Löschen des Eintrags.');
        }
      },
      complete: () => {
        this.loadingService.hide();
      }
    });
  }
  
//  deleteEntry() {
//    this.discussionService.deleteEntry(this.entryToDelete.id).subscribe(() => {
//      this.selectedDiscussion.entries = this.selectedDiscussion.entries.filter((e: any) => e.id !== this.entryToDelete.id);
//      this.loadDiscussion(this.selectedDiscussion.person.id);
//      this.hidePopUp();
//    });
//  }

  /**
   * Shows a popup for different modes (add, edit, image, delete) with the specified data.
   *
   * @param {string} mode - The mode to determine the popup type ('add', 'edit', 'image', 'delete').
   * @param {any} data - The data to be used in the popup.
   */
  showPopUp(mode: string, data: any) {
    if (mode === 'add') {
      this.entry = {
        title: '',
        content: '',
        image_1: null,
        image_2: null,
        image_3: null,
        image_4: null
      };
    } else if (mode === 'edit') {
      this.entry = { ...data };
    } else if (mode === 'image') {
      this.showImageUrl = data;
    } else if (mode === 'delete') {
      this.entry = null;
      this.entryToDelete = { ...data };
    }
    const popUpContainer = document.getElementById('popUpContainer');
    if (popUpContainer) {
      popUpContainer.classList.remove('dNone');
    }
  }

  /**
   * Hides the popup and resets the entry and deletion data.
   */
  hidePopUp() {
    this.entry = null;
    this.entryToDelete = null;
    const popUpContainer = document.getElementById('popUpContainer');
    if (popUpContainer) {
      popUpContainer.classList.add('dNone');
    }
    this.resetEntryForm();
  }

  /**
  * Saves the entry by either adding a new one or updating an existing one.
  */
  saveEntry(): void {
    const formData = this.assembleFormData();
    if (this.entry.id) {
      this.updateEntry(formData);
    } else {
      this.addEntry(formData);
    }
  }

  /**
   * Adds a new entry to the selected discussion.
   *
   * @param {FormData} formData - The form data to be sent with the request.
   */
  addEntry(formData: FormData): void {
    this.loadingService.show();
    formData.append('discussion', this.selectedDiscussion.id);
  
    this.discussionService.addEntry(formData).subscribe({
      next: (response) => {
        this.entry.title = '';
        this.entry.content = '';
        this.loadDiscussion(this.selectedDiscussion.person.id);
      },
      error: (error) => {
        console.error('Fehler beim Hinzufügen des Eintrags:', error);
  
        if (error.status === 400) {
          alert('Ungültige Eingabe. Bitte überprüfe deine Daten.');
        } else if (error.status === 500) {
          alert('Serverfehler. Bitte versuche es später erneut.');
        } else {
          alert('Fehler beim Hinzufügen des Eintrags.');
        }
      },
      complete: () => {
        this.entry = null;
        this.hidePopUp();
        this.loadingService.hide();
      }
    });
  }
  
//  addEntry(formData: FormData) {
//    formData.append('discussion', this.selectedDiscussion.id);
//    this.discussionService.addEntry(formData).subscribe((response) => {
//      this.entry.title = '';
//      this.entry.content = '';
//      this.loadDiscussion(this.selectedDiscussion.person.id);
//    });
//    this.entry = null;
//    this.hidePopUp();
//  }

  /**
  * Updates an existing entry in the selected discussion.
  *
  * @param {FormData} formData - The form data to be sent with the request.
  */
  updateEntry(formData: FormData): void {
    this.loadingService.show();
    this.discussionService.updateEntry(this.entry.id, formData).subscribe({
      next: (response: any) => {
        this.loadDiscussion(this.selectedDiscussion.person.id);
        window.location.reload();
      },
      error: (error) => {
        console.error('Fehler beim Aktualisieren des Eintrags:', error);
  
        if (error.status === 400) {
          alert('Ungültige Eingabe. Bitte überprüfe deine Daten.');
        } else if (error.status === 404) {
          alert('Eintrag nicht gefunden.');
        } else if (error.status === 500) {
          alert('Serverfehler. Bitte versuche es später erneut.');
        } else {
          alert('Fehler beim Aktualisieren des Eintrags.');
        }
      },
      complete: () => {
        this.entry = null;
        this.hidePopUp();
        this.loadingService.hide();
      }
    });
  }
  
//  updateEntry(formData: FormData): void {
//    this.discussionService.updateEntry(this.entry.id, formData).subscribe((response: any) => {
//      this.loadDiscussion(this.selectedDiscussion.person.id);
//      window.location.reload();
//    });
//    this.entry = null;
//    this.hidePopUp();
//  }

  /**
   * Resets the entry form and clears any uploaded images.
   */
  resetEntryForm(): void {
    this.entry = {
      title: '',
      content: '',
      image_1: null,
      image_2: null,
      image_3: null,
      image_4: null,
    };
    this.imageFiles = [];
  }

  /**
   * Gets an array of image URLs from the given information object.
   *
   * @param {any} info - The information object containing image URLs.
   * @returns {string[]} An array of image URLs.
   */
  getImageArray(info: any): { original: string; thumbnail: string }[] {
    if (this.imageCache[info.id]) {
      return this.imageCache[info.id];
    }

    const images: { original: string; thumbnail: string }[] = [];

    for (let i = 1; i <= 4; i++) {
      const originalUrl = info[`image_${i}_url`];
      const thumbnailUrl = info[`image_${i}_thumbnail_url`];

      if (originalUrl) {
        images.push({ original: originalUrl, thumbnail: thumbnailUrl });
      }
    }
    this.imageCache[info.id] = images;
    return images;
  }

  /**
   * Generates the thumbnail URL for a given image URL.
   *
   * @param {string} imageUrl - The URL of the image.
   * @returns {string} The URL of the thumbnail image.
   */
  getThumbnailUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    const baseUrl = imageUrl.replace('/media/discussions/', '/media/discussions/thumbnails/');
    const extensions = ['.jpg', '.jpeg', '.png'];
    for (let ext of extensions) {
      const lowerBaseUrl = baseUrl.toLowerCase();
      const lowerExt = ext.toLowerCase();

      if (lowerBaseUrl.endsWith(lowerExt)) {
        return baseUrl.slice(0, -lowerExt.length) + `_thumbnail.jpg`;
      }
    }
    return baseUrl;
  }

  /**
   * Handles file input changes and updates the image files array.
   *
   * @param {any} event - The change event from the file input.
   * @param {number} index - The index of the image slot being updated.
   */
  onFileChange(event: any, index: number) {
    const files = event.target.files;

    if (files.length > 0) {
      const file = files[0];

      if (file.type === 'image/jpeg' || file.type === 'image/png') {

        if (this.imageFiles[index - 1]) {
          this.imageFiles.splice(index - 1, 1, file);
        } else {
          this.imageFiles.push(file);
        }

      } else {
        alert('Nur JPG und PNG Dateien sind erlaubt.');
      }
    }
  }

  /**
   * Removes an image by its URL from the entry and adds it to the deleted images list.
   *
   * @param {string} imageUrl - The URL of the image to be removed.
   */
  removeImageByUrl(imageUrl: string): void {
    if (this.entry.image_1_url === imageUrl) {
      this.entry.image_1_url = null;
      this.entry.image_1 = null;
    } else if (this.entry.image_2_url === imageUrl) {
      this.entry.image_2_url = null;
      this.entry.image_2 = null;
    } else if (this.entry.image_3_url === imageUrl) {
      this.entry.image_3_url = null;
      this.entry.image_3 = null;
    } else if (this.entry.image_4_url === imageUrl) {
      this.entry.image_4_url = null;
      this.entry.image_4 = null;
    }
    this.deletedImages.add(imageUrl);
    this.updateImageCache(this.entry);
  }

  updateImageCache(info: any): void {
    this.imageCache[info.id] = this.getImageArray(info);
  }

  isImageDeleted(imageUrl: string, entry: any): boolean {
    return this.deletedImages.has(imageUrl);
  }

  /**
   * Checks if an image slot is available for a new image.
   *
   * @param {number} index - The index of the image slot to check.
   * @returns {boolean} `true` if the image slot is available, `false` otherwise.
   */
  isImageSlotAvailable(index: number): boolean {
    return !this.entry[`image_${index}`];
  }

  /**
   * Assembles the form data including images and null fields.
   *
   * @returns {FormData} The assembled form data.
   */
  assembleFormData(): FormData {
    const formData = new FormData();
    formData.append('title', this.entry.title);
    formData.append('content', this.entry.content);

    this.allpagesService.addNewImages(this.entry, this.imageFiles, formData);
    this.allpagesService.addNullFields(this.entry, formData);

    return formData;
  }

  /**
   * Adds new images to the form data.
   *
   * @param {FormData} formData - The form data to which images will be added.
   */
  addNewImages(formData: FormData): void {
    this.imageFiles.forEach((file) => {
      const imageField = this.getNextAvailableImageField();
      if (imageField) {
        formData.append(imageField, file, file.name);
      }
    });
  }

  /**
   * Adds null fields for any deleted images to the form data.
   *
   * @param {FormData} formData - The form data to which null fields will be added.
   */
  addNullFields(formData: FormData): void {
    for (let i = 1; i <= 4; i++) {
      const imageField = `image_${i}`;
      if (!this.entry[imageField] && !formData.has(imageField)) {
        formData.append(imageField, '');
      }
    }
  }

  /**
   * Gets the next available image field in the entry.
   *
   * @returns {string | null} The name of the next available image field, or `null` if none are available.
   */
  getNextAvailableImageField(): string | null {
    for (let i = 1; i <= 4; i++) {
      const imageField = `image_${i}`;
      if (!this.entry[imageField]) {
        return imageField;
      }
    }
    return null;
  }

}
