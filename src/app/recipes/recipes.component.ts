import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { RecipeService } from '../services/recipe.service';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ScrollService } from '../services/scroll.service';
import { CommentService } from '../services/comment.service';
import { AllpagesService } from '../services/allpages.service';
import { ChangeDetectorRef } from '@angular/core';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, ScrollToTopButtonComponent, FormsModule, QuillModule],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss'
})
export class RecipesComponent implements OnInit {
  userId: string | null = null;
  userEmail: string | null = null;
  recipes: any[] = [];
  selectedRecipe: any = null;
  recipe = {
    title: '',
    content: '',
    image_1: null,
    image_2: null,
    image_3: null,
    image_4: null
  };
  public imageCache: { [id: string]: { original: string; thumbnail: string }[] } = {};
  public imageFiles: File[] = [];
  filteredRecipes: any[] = [];
  entry: any = null;
  entryToDelete: any = null;
  sanitizedContent: SafeHtml | null = null;
  showImageUrl: string | null = null;
  deletedImages: Set<string> = new Set();
  clearedFields: string[] = [];
  comments: { [key: number]: any[] } = {};
  comment: any = null;
  newComment: { [key: number]: string } = {};
  commentToUpdate: any;
  commentToDelete: any = null;

  constructor(
    public recipeService: RecipeService,
    private commentService: CommentService,
    private scrollService: ScrollService,
    public sanitizer: DomSanitizer,
    public allpagesService: AllpagesService,
    private cdr: ChangeDetectorRef, 
    private loadingService: LoadingService
  ) { }

  /**
   * Initializes the component by loading all information and retrieving user data from session storage.
   */
  ngOnInit(): void {
    this.loadAllRecipes();
    this.userId = localStorage.getItem('userId');
    this.userEmail = localStorage.getItem('userEmail');
  }

  /**
   * Loads all information from the recipe service and sorts them by the updated date.
   */
  loadAllRecipes(): void {
    this.loadingService.show();
  
    this.recipeService.getAllRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.recipes.sort((a, b) => {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
        this.recipes = recipes.map((recipe: any) => ({ ...recipe, isHidden: false }));
        this.filteredRecipes = this.recipes;
        this.loadComments();
      },
      error: (error) => {
        console.error('Fehler beim Laden der Rezepte:', error);
  
        if (error.status === 404) {
          alert('Keine Rezepte gefunden.');
        } else if (error.status === 500) {
          alert('Serverfehler. Bitte versuche es später erneut.');
        } else {
          alert('Fehler beim Laden der Rezepte.');
        }
      },
      complete: () => {
        this.loadingService.hide();
      }
    });
  }
  
//  loadAllRecipes() {
//    this.recipeService.getAllRecipes().subscribe(recipes => {
//      this.recipes = recipes;
//      this.recipes.sort((a, b) => {
//        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
//      });
//      this.recipes = recipes.map((recipe: any) => ({ ...recipe, isHidden: false }));
//      this.filteredRecipes = this.recipes;
//      this.loadComments();
//    });
//  }

  /**
   * Loads a specific recipe item by its ID and sanitizes its content for safe display.
   *
   * @param {string} recipeId - The ID of the recipe item to be loaded.
   */
  loadRecipe(recipeId: string): void {
    this.loadingService.show();
    this.recipeService.getRecipeById(recipeId).subscribe({
      next: (recipe) => {
        this.selectedRecipe = recipe;
        this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(recipe.content);
      },
      error: (error) => {
        console.error('Fehler beim Laden:', error);

        if (error.status === 404) {
          alert('Kein Rezept gefunden.');
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
//  loadRecipe(recipeId: string): void {
//    this.recipeService.getRecipeById(recipeId).subscribe(
//      recipe => {
//        this.selectedRecipe = recipe;
//        this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(recipe.content);
//      }
//    );
//  }

  /**
   * Filters the list of information items based on the search term from the event input.
   *
   * @param {Event} event - The input event containing the search term.
   */
  filterEntries(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (!searchTerm) {
      this.filteredRecipes = this.recipes;
    } else {
      this.filteredRecipes = this.recipes.filter((recipe: { author_name: string; title: string; content: string; }) =>
        recipe.author_name.toLowerCase().includes(searchTerm) ||
        (recipe.title && recipe.title.toLowerCase().includes(searchTerm)) ||
        recipe.content.toLowerCase().includes(searchTerm)
      );
    }
  }

  /**
  * Scrolls the page to the element with the specified recipe ID.
  *
  * @param {number} recipeId - The ID of the recipe item to scroll to.
  */
  goToRecipe(recipeId: number): void {
    const element = document.getElementById(recipeId.toString());
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
    this.recipes[index].isHidden = !this.recipes[index].isHidden;
  }

  /**
  * Retrieves an array of image URLs from the given recipe object.
  *
  * @param {any} recipe - The recipe object containing image URLs.
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
    const baseUrl = imageUrl.replace('/media/recipes/', '/media/recipes/thumbnails/');
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
   * Displays a pop-up based on the specified mode and data.
   * The mode determines what type of pop-up to show (e.g., add, edit, delete).
   *
   * @param {string} mode - The mode for the pop-up (e.g., 'add', 'edit', 'image', 'delete', 'editComment', 'deleteComment').
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
        image_4: null
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
    this.updateImageCache(this.entry);
    this.cdr.detectChanges();
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
   * Assembles the form data for the entry, including title, content, and images.
   * differs from info with family information
   * @returns {FormData} The assembled form data.
   */
  assembleFormData(): FormData {
    const formData = new FormData();
    formData.append('title', this.entry.title);
    formData.append('content', this.entry.content);

    this.addNewImages(formData);
    this.addNullFields(formData);

    formData.append('deletedImages', JSON.stringify(this.deletedImages));

    return formData;
  }

  /**
   * Adds new images to the form data.
   *
   * @param {FormData} formData - The form data to which images will be added.
   */
  addNewImages(formData: FormData): void {
    this.imageFiles.forEach((file) => {
      const imageField = this.getNextAvailableImageField(formData);
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
   * differs from recipe due to family info
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
   * Updates an existing entry with the given form data.
   * differs from info due to service
   * @param {FormData} formData - The form data containing updated information for the entry.
   */
  updateEntry(formData: FormData): void {
    this.loadingService.show();
    this.recipeService.updateRecipe(this.entry.id, formData).subscribe({
      next: (response: any) => {
        this.loadAllRecipes();
        window.location.reload();
      },
      error: (error) => {
        console.error('Fehler beim Aktualisieren:', error);

        if (error.status === 400) {
          alert ('Fehlerhafte Eingabe. Bitte überprüfe deine Daten.');
        } else if (error.status === 403) {
          alert('Du hast keine Berechtigung für diese Aktion.');
        } else if (error.status === 500) {
          alert('Serverfehler. Bitte versuche es später erneut.');
        } else {
          alert('Unbekannter Fehler. Bitte kontaktiere den Support.');
        }
      },
      complete: () => {
        this.loadingService.hide();
        this.entry = null;
        this.hidePopUp();
      }
    });
  }
//  updateEntry(formData: FormData): void {
//    this.recipeService.updateRecipe(this.entry.id, formData).subscribe((response: any) => {
//      this.loadAllRecipes();
//      window.location.reload();
//    });
//    this.entry = null;
//    this.hidePopUp();
//  }

  /**
   * Gets the next available image field for a new image.
   *
   * @returns {string | null} The name of the next available image field (e.g., 'image_1'), or `null` if all fields are occupied.
   */
  getNextAvailableImageField(formData: FormData): string | null {
    for (let i = 1; i <= 4; i++) {
      const imageField = `image_${i}`;
      if (!this.entry[imageField] && !formData.has(imageField)) {
        return imageField;
      }
    }
    return null;
  }

  /**
   * Adds a new entry using the provided form data.
   * differs from info due to param
   */
  addEntry(formData: FormData) {
    this.loadingService.show();
    this.recipeService.addRecipe(formData).subscribe({
      next: (response: any) => {
        this.loadAllRecipes();
        this.entry.title = '';
        this.entry.content = '';
        window.location.reload();
      },
      error: (error) => {
        console.error('Fehler beim Aktualisieren:', error);
        if (error.status === 400) {
          alert ('Fehlerhafte Eingabe. Bitte überprüfe deine Daten.');
        } else if (error.status === 403) {
          alert('Du hast keine Berechtigung für diese Aktion.');
        } else if (error.status === 500) {
          alert('Serverfehler. Bitte versuche es später erneut.');
        } else {
          alert('Unbekannter Fehler. Bitte kontaktiere den Support.');
        }
      },
      complete: () => {
        this.loadingService.hide();
        this.entry = null;
        this.hidePopUp();
      }
    });
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
  * differs from info due to service
  */
  deleteEntry(): void {
    this.loadingService.show();
  
    this.recipeService.deleteRecipe(this.entryToDelete.id).subscribe({
      next: () => {
        this.recipes = this.recipes.filter((e: any) => e.id !== this.entryToDelete.id);
        this.loadAllRecipes();
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
//    this.recipeService.deleteRecipe(this.entryToDelete.id).subscribe(() => {
//      this.recipes = this.recipes.filter((e: any) => e.id !== this.entryToDelete.id);
//      this.loadAllRecipes();
//      this.hidePopUp();
//    });
//  }

  /**
   * Loads comments for each recipe entry and stores them in the `comments` object.
   * differs from Info with regard to function in commentservice
   */
  loadComments() {
    this.recipes.forEach(recipe => {
      this.commentService.getCommentsForRecipe(recipe.id).subscribe(comments => {
        this.comments[recipe.id] = comments;
      });
    });
  }

  /**
   * Adds a new comment to the specified info entry.
   * differs from info due to key
   * @param {number} recipeId - The ID of the info entry to which the comment will be added.
   * @param {string} commentContent - The content of the comment.
   */
  addComment(recipeId: number, commentContent: string) {
    const comment = {
      content: commentContent,
      recipe: recipeId
    };
    this.commentService.addComment(comment).subscribe(newComment => {
      if (this.comments[recipeId]) {
        this.comments[recipeId].push(newComment);
      } else {
        this.comments[recipeId] = [newComment];
      }
      this.newComment[recipeId] = '';
    });
  }

  /**
   * Deletes a comment based on the comment to delete.
   */
  deleteComment() {
    this.commentService.deleteComment(this.commentToDelete.id).subscribe(() => {
      this.loadAllRecipes();
      this.hidePopUp();
    });
  }

  /**
   * Saves updates to a comment.
   */
  saveComment() {
    this.commentService.updateComment(this.commentToUpdate.id, { content: this.commentToUpdate.content }).subscribe((response: any) => {
      const recipeId = this.findRecipeIdByCommentId(this.commentToUpdate.id);
      const index = this.comments[recipeId].findIndex(c => c.id === this.commentToUpdate.id);
      if (index !== -1) {
        this.comments[recipeId][index] = response;
        this.commentToUpdate = null;
        this.resetEntryForm();
        this.hidePopUp();
      }
    })
  }

  /**
   * Finds the ID of the recipe entry associated with a specific comment.
   *
   * @param {number} commentId - The ID of the comment.
   * @returns {number} The ID of the associated info entry, or `0` if not found.
   */
  findRecipeIdByCommentId(commentId: number): number {
    for (const recipeId in this.comments) {
      if (this.comments[recipeId].some(c => c.id === commentId)) {
        return +recipeId;
      }
    }
    return 0;
  }
}
