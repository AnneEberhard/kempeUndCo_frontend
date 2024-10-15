import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { FormsModule } from '@angular/forms';
import { FaminfoService } from '../services/faminfo.service';
import { QuillModule } from 'ngx-quill';
import { ScrollService } from '../services/scroll.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommentService } from '../services/comment.service';
import { CapitalizePipe } from "../pipes/capitalize.pipe";
import { AllpagesService } from '../services/allpages.service';

@Component({
  selector: 'app-fam-infos',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollToTopButtonComponent, FormsModule, QuillModule, CapitalizePipe],
  templateUrl: './fam-infos.component.html',
  styleUrl: './fam-infos.component.scss'
})
export class FamInfosComponent implements OnInit{
  public imageCache: { [id: string]: { original: string; thumbnail: string }[] } = {};
  public imageFiles: File[] = [];
  deletedImages: Set<string> = new Set();
  userId: string | null = null;
  userEmail: string | null = null;
  infos: any[] = [];
  selectedInfo: any = null;
  info = {
    title: '',
    content: '',
    image_1: null,
    image_2: null,
    image_3: null,
    image_4: null
  };
  filteredInfos: any[] = [];
  entry: any = null;
  entryToDelete: any = null;
  sanitizedContent: SafeHtml | null = null;
  showImageUrl: string | null = null;
  clearedFields: string[] = [];
  comments: { [key: number]: any[] } = {};
  comment: any = null;
  newComment: { [key: number]: string } = {};
  commentToUpdate: any;
  commentToDelete: any = null;
  thumbnailPath = 'infos/thumbnails/';
  family_1: string | null;
  family_2: string | null;
  families: string[] = [];


  constructor(
    public faminfoService: FaminfoService,
    private commentService: CommentService,
    private scrollService: ScrollService,
    public sanitizer: DomSanitizer,
    public allpagesService: AllpagesService
  ) {
    this.family_1 = localStorage.getItem('family_1');
    this.family_2 = localStorage.getItem('family_2');
  }

  /**
   * Initializes the component by loading all information and retrieving user data from session storage.
   */
  ngOnInit(): void {
    this.loadAllInfo();
    this.userId = localStorage.getItem('userId');
    this.userEmail = localStorage.getItem('userEmail');
  }

  /**
   * Loads all information from the info service and sorts them by the updated date.
   */
  loadAllInfo() {
    this.faminfoService.getAllInfos().subscribe(infos => {
      this.infos = infos;
      this.infos.sort((a, b) => {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      this.infos = infos.map((info: any) => ({ ...info, isHidden: false }));
      this.filteredInfos = this.infos;
      this.loadComments();
    });
  }

  /**
   * Loads a specific info item by its ID and sanitizes its content for safe display.
   *
   * @param {string} infoId - The ID of the info item to be loaded.
   */
  loadInfo(infoId: string): void {
    this.faminfoService.getInfoById(infoId).subscribe(
      info => {
        this.selectedInfo = info;
        this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(info.content);
      }
    );
  }

  /**
   * Filters the list of information items based on the search term from the event input.
   *
   * @param {Event} event - The input event containing the search term.
   */
  filterEntries(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (!searchTerm) {
      this.filteredInfos = this.infos;
    } else {
      this.filteredInfos = this.infos.filter((info: { author_name: string; title: string; content: string; family_1: string; family_2: string }) =>
        info.author_name.toLowerCase().includes(searchTerm) ||
        (info.title && info.title.toLowerCase().includes(searchTerm)) ||
        info.content.toLowerCase().includes(searchTerm) ||
        (info.family_1 && info.family_1.toLowerCase().includes(searchTerm)) ||
        (info.family_2 && info.family_2.toLowerCase().includes(searchTerm))
      );
    }
  }

  /**
   * Scrolls the page to the element with the specified info ID.
   *
   * @param {number} infoId - The ID of the info item to scroll to.
   */
  goToInfo(infoId: number): void {
    const element = document.getElementById(infoId.toString());
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * toggles visibility of each entry
   *
   * @param {number} index - number of the *ngFor.
   */
  toggleVisibility(index: number): void {
    this.infos[index].isHidden = !this.infos[index].isHidden;
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
   * Displays a pop-up based on the specified mode and data.
   * The mode determines what type of pop-up to show (e.g., add, edit, delete).
   *
   * @param {string} mode - The mode for the pop-up (e.g., 'add', 'editInfo', 'image', 'deleteInfo', 'editComment', 'deleteComment').
   * @param {any} data - The data to be used in the pop-up, which varies depending on the mode.
   */
  showPopUp(mode: string, data: any) {
    if (mode === 'add') {
      this.entry = {
        title: '',
        content: '',
        image_1: null,
        image_2: null,
        image_3: null,
        image_4: null,
        family_1: '',
        family_2: ''
      };
    } else if (mode === 'edit') {
      this.entry = { ...data };
    } else if (mode === 'image') {
      this.showImageUrl = data;
    } else if (mode === 'delete') {
      this.entry = null;
      this.entryToDelete = { ...data };
    } else if (mode === 'editComment') {
      this.commentToUpdate = { ...data };
    } else if (mode === 'deleteComment') {
      this.commentToDelete = { ...data };
    }

    const popUpContainer = document.getElementById('popUpContainer');
    if (popUpContainer) {
      popUpContainer.classList.remove('dNone');
    }

    const popUp = document.getElementById('popUp');
    if (popUp) {
      this.scrollService.setActiveScrollContainer(popUp);
    }
  }


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
   * Removes an image by its URL from the entry and marks it as deleted.
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
  }

  isImageDeleted(imageUrl: string, entry: any): boolean {
    return this.deletedImages.has(imageUrl); // Überprüfe, ob das Bild gelöscht ist
  }

  /**
   * Checks if an image slot is available for a new image.
   *
   * @param {number} index - The index of the image slot to check (1 to 4).
   * @returns {boolean} `true` if the image slot is available, otherwise `false`.
   */
  isImageSlotAvailable(index: number): boolean {
    return !this.entry[`image_${index}`];
  }

  /**
   * Hides the pop-up and resets the state of various properties related to entries and comments.
   */
  hidePopUp() {
    this.entry = null;
    this.entryToDelete = null;
    this.showImageUrl = null;
    this.comment = null;
    this.commentToDelete = null;
    this.commentToUpdate = null;
    const mainContainer = document.getElementById('mainContainer');
    const popUpContainer = document.getElementById('popUpContainer');
    this.scrollService.setActiveScrollContainer(mainContainer);
    if (popUpContainer) {
      popUpContainer.classList.add('dNone');
    }
    this.resetEntryForm();
  }

  /**
   * Assembles the form data for the entry, including title, content, family details, and images.
   * differs from recipe due to family information
   * @returns {FormData} The assembled form data.
   */
  assembleFormData(): FormData {
    const formData = new FormData();
    formData.append('title', this.entry.title);
    formData.append('content', this.entry.content);

    if (this.entry.family_1) {
      formData.append('family_1', this.entry.family_1);
    }

    if (this.entry.family_2) {
      formData.append('family_2', this.entry.family_2);
    }

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
   * Adds fields for any deleted images to the form data, marking them as empty.
   *
   * @param {FormData} formData - The form data to which empty fields will be added.
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
   * Saves the entry by either adding a new one or updating an existing one.
   * Displays an alert if no family is selected.
   * differs from recipe due to family info
   */
  saveEntry(): void {
    const formData = this.assembleFormData();
    if (!this.entry.family_1 && !this.entry.family_2) {
      alert('Bitte wähle mindestens eine Familie aus.');
      return;
    }

  //  formData.forEach((value, key) => {
  //    console.log(`${key}:`, value);
  //  });

    if (this.entry.id) {
      this.updateEntry(formData);
    } else {
      this.addEntry(formData);
    }
  }

  /**
   * Updates an existing entry with the given form data.
   * differs from recipe due to service
   * @param {FormData} formData - The form data containing updated information for the entry.
   */
  updateEntry(formData: FormData): void {
    this.faminfoService.updateInfo(this.entry.id, formData).subscribe((response: any) => {
      this.loadAllInfo();
      window.location.reload();
    });
    this.entry = null;
    this.hidePopUp();
  }

  /**
   * Gets the next available image field for a new image.
   * differs from recipe due to service
   * @returns {string | null} The name of the next available image field (e.g., 'image_1'), or `null` if all fields are occupied.
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

  /**
   * Adds a new entry using the provided form data.
   * differs from recipe due to param
   * @param {FormData} formData - The form data containing information for the new entry.
   */
  addEntry(formData: FormData) {
    this.faminfoService.addInfo(formData).subscribe((response: any) => {
      this.loadAllInfo();
      this.entry.title = '';
      this.entry.content = '';
    });
    this.entry = null;
    this.hidePopUp();
  }

  /**
   * Resets the entry form to its initial state.
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
  * Deletes an entry based on the entry to delete.
  * differs from recipe due to service
  */
  deleteEntry() {
    this.faminfoService.deleteInfo(this.entryToDelete.id).subscribe(() => {
      this.infos = this.infos.filter((e: any) => e.id !== this.entryToDelete.id);
      this.loadAllInfo();
      this.hidePopUp();
    });
  }

  /**
   * Loads comments for each info entry and stores them in the `comments` object.
   * differs from recipe with regard to function in commentservice
   */
  loadComments() {
    this.infos.forEach(info => {
      this.commentService.getCommentsForFamInfo(info.id).subscribe(comments => {
        this.comments[info.id] = comments;
      });
    });
  }

  /**
   * Adds a new comment to the specified info entry.
   * differs from recipe due to key
   * @param {number} infoId - The ID of the info entry to which the comment will be added.
   * @param {string} commentContent - The content of the comment.
   */
  addComment(infoId: number, commentContent: string) {
    const comment = {
      content: commentContent,
      famInfo: infoId
    };
    this.commentService.addComment(comment).subscribe(newComment => {
      if (this.comments[infoId]) {
        this.comments[infoId].push(newComment);
      } else {
        this.comments[infoId] = [newComment];
      }
      this.newComment[infoId] = '';
    });
  }

  /**
   * Deletes a comment based on the comment to delete.
   */
  deleteComment() {
    this.commentService.deleteComment(this.commentToDelete.id).subscribe(() => {
      this.loadAllInfo();
      this.hidePopUp();
    });
  }

  /**
   * Saves updates to a comment.
   */
  saveComment() {
    this.commentService.updateComment(this.commentToUpdate.id, { content: this.commentToUpdate.content }).subscribe((response: any) => {
      const infoId = this.findInfoIdByCommentId(this.commentToUpdate.id);
      const index = this.comments[infoId].findIndex(c => c.id === this.commentToUpdate.id);
      if (index !== -1) {
        this.comments[infoId][index] = response;
        this.commentToUpdate = null;
        this.hidePopUp();
      }
    })
  }

  /**
   * Finds the ID of the info entry associated with a specific comment.
   *
   * @param {number} commentId - The ID of the comment.
   * @returns {number} The ID of the associated info entry, or `0` if not found.
   */
  findInfoIdByCommentId(commentId: number): number {
    for (const infoId in this.comments) {
      if (this.comments[infoId].some(c => c.id === commentId)) {
        return +infoId;
      }
    }
    return 0;
  }


  /**
   * Handles changes in family selection and updates the entry's family fields accordingly.
   *
   * @param {Event} event - The event triggered by the family selection change.
   * @param {'family_1' | 'family_2'} familyKey - The key for the family field being updated.
   */
  onFamilySelectionChange(event: Event, familyKey: 'family_1' | 'family_2') {
    const checkbox = event.target as HTMLInputElement;
    const familyValue = familyKey === 'family_1' ? this.family_1 : this.family_2;

    if (checkbox.checked) {
      if (this.entry.family_1 === '' || this.entry.family_1 === familyValue) {
        this.entry.family_1 = familyValue;
      } else {
        this.entry.family_2 = familyValue;
      }
    } else {
      if (this.entry.family_1 === familyValue) {
        this.entry.family_1 = '';
      } else if (this.entry.family_2 === familyValue) {
        this.entry.family_2 = '';
      }
    }
  }

}
