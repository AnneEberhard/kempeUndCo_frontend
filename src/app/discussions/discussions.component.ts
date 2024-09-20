import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { DiscussionService } from '../services/discussion.service';
import { FormsModule } from '@angular/forms';
import { FamilyService } from '../services/family.service';
import { QuillModule } from 'ngx-quill';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-discussions',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollToTopButtonComponent, FormsModule, QuillModule],
  templateUrl: './discussions.component.html',
  styleUrl: './discussions.component.scss'
})
export class DiscussionsComponent implements OnInit {

  discussions: any[] = [];
  selectedDiscussion: any = null;
  filteredDiscussions: any[] = [];
  personId: string | null = null;
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
  imageFiles: File[] = [];
  sanitizedContent: SafeHtml | null = null;
  showImageUrl: string | null = null;
  deletedImages: string[] = [];
  thumbnailPath = 'discussions/thumbnails/';

  constructor(
    private discussionService: DiscussionService,
    private familyService: FamilyService,
    private route: ActivatedRoute,
    private router: Router,
    public sanitizer: DomSanitizer
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
   * Loads and sorts all discussions, and sets the filtered discussions.
   */
  loadAllDiscussions(): void {
    this.discussionService.getAllDiscussions().subscribe(discussions => {
      this.discussions = discussions;
      this.discussions.sort((a, b) => {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      this.filteredDiscussions = this.discussions;
    });
    this.filteredDiscussions.sort((a, b) => {
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    });
  }

  /**
   * Loads a specific discussion based on person ID and sorts the discussion entries.
   *
   * @param {string} personId - The ID of the person whose discussion is to be loaded.
   */
  loadDiscussion(personId: string): void {
    this.discussionService.getDiscussionByPersonId(personId).subscribe(discussion => {
      this.selectedDiscussion = discussion;
      const selectedDiscussionEntries = discussion.entries;
      selectedDiscussionEntries.sort((a: { updated_at: string | number | Date; }, b: { updated_at: string | number | Date; }) => {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      this.filteredEntries = selectedDiscussionEntries;
    });
  }

  /**
   * Loads a person's details based on the person ID.
   *
   * @param {number} personId - The ID of the person to load.
   */
  loadPerson(personId: number): void {
    this.familyService.getPerson(personId).subscribe(person => {
      this.personName = person.name;
      if (person.birt_date) {
        this.personGebDate = person.birt_date;
      }
    });
  }

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
  deleteEntry() {
    this.discussionService.deleteEntry(this.entryToDelete.id).subscribe(() => {
      this.selectedDiscussion.entries = this.selectedDiscussion.entries.filter((e: any) => e.id !== this.entryToDelete.id);
      this.loadDiscussion(this.selectedDiscussion.person.id);
      this.hidePopUp();
    });
  }

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
  addEntry(formData: FormData) {
    formData.append('discussion', this.selectedDiscussion.id);
    this.discussionService.addEntry(formData).subscribe((response) => {
      this.selectedDiscussion.entries.push(response);
      this.loadDiscussion(this.selectedDiscussion.person.id);
      this.hidePopUp();
      this.resetEntryForm();
    });
  }

  /**
  * Updates an existing entry in the selected discussion.
  *
  * @param {FormData} formData - The form data to be sent with the request.
  */
  updateEntry(formData: FormData): void {
    this.discussionService.updateEntry(this.entry.id, formData).subscribe((response: any) => {
      const index = this.selectedDiscussion.entries.findIndex((e: any) => e.id === this.entry.id);
      if (index !== -1) {
        this.selectedDiscussion.entries[index] = response;
      }
      this.entry = null;
      this.loadDiscussion(this.selectedDiscussion.person.id);
      this.resetEntryForm();
      this.hidePopUp();
    });
  }

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
  getImageArray(info: any): string[] {
    const images: string[] = [];

    if (info.image_1_url) images.push(info.image_1_url);
    if (info.image_2_url) images.push(info.image_2_url);
    if (info.image_3_url) images.push(info.image_3_url);
    if (info.image_4_url) images.push(info.image_4_url);

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
      this.imageFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'image/jpeg' || file.type === 'image/png') {
          this.imageFiles.push(file);
        } else {
          alert('Nur JPG und PNG Dateien sind erlaubt.');
        }
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
    this.deletedImages.push(imageUrl);
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

    this.addNewImages(formData);
    this.addNullFields(formData);

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
      if (!this.entry[imageField]) {
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
