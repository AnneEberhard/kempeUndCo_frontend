import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { RecipeService } from '../services/recipe.service';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ScrollService } from '../services/scroll.service';
import { CommentService } from '../services/comment.service';

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
  imageFiles: File[] = [];
  filteredRecipes: any[] = [];
  entry: any = null;
  entryToDelete: any = null;
  sanitizedContent: SafeHtml | null = null;
  showImageUrl: string | null = null;
  deletedImages: string[] = [];
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
    public sanitizer: DomSanitizer
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
  loadAllRecipes() {
    this.recipeService.getAllRecipes().subscribe(recipes => {
      this.recipes = recipes;
      this.recipes.sort((a, b) => {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      this.recipes = recipes.map((recipe: any) => ({ ...recipe, isHidden: false }));
      this.filteredRecipes = this.recipes;
      this.loadComments();
    });
  }

  /**
   * Loads a specific recipe item by its ID and sanitizes its content for safe display.
   *
   * @param {string} recipeId - The ID of the recipe item to be loaded.
   */
  loadRecipe(recipeId: string): void {
    this.recipeService.getRecipeById(recipeId).subscribe(
      recipe => {
        this.selectedRecipe = recipe;
        this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(recipe.content);
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
      this.filteredRecipes = this.recipes;
    } else {
      this.filteredRecipes = this.recipes.filter((recipe: { author_email: string; title: string; content: string; }) =>
        recipe.author_email.toLowerCase().includes(searchTerm) ||
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
  getImageArray(recipe: any): string[] {
    const images: string[] = [];

    if (recipe.image_1) images.push(recipe.image_1);
    if (recipe.image_2) images.push(recipe.image_2);
    if (recipe.image_3) images.push(recipe.image_3);
    if (recipe.image_4) images.push(recipe.image_4);

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
    for (let i = 1; i <= 4; i++) {
      const imageUrlField = `image_${i}_url` as keyof typeof this.entry;
      const imageField = `image_${i}` as keyof typeof this.entry;

      if (this.entry[imageUrlField] === imageUrl) {
        this.entry[imageUrlField] = null;
        this.entry[imageField] = null;
        this.deletedImages.push(imageUrl);
        break;
      }
    }
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
      if (!this.entry[imageField]) {
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
      this.addEntry();
    }
  }

  /**
   * Updates an existing entry with the given form data.
   * differs from info due to service
   * @param {FormData} formData - The form data containing updated information for the entry.
   */
  updateEntry(formData: FormData): void {
    this.recipeService.updateRecipe(this.entry.id, formData).subscribe((response: any) => {
      const index = this.recipes.findIndex((e: any) => e.id === this.entry.id);
      if (index !== -1) {
        this.recipes[index] = response;
      }
      this.entry = null;
      this.resetEntryForm();
      this.hidePopUp();
    });
  }

  /**
   * Gets the next available image field for a new image.
   *
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
   * differs from info due to param
   */
  addEntry() {
    const formData = new FormData();
    formData.append('title', this.entry.title);
    formData.append('content', this.entry.content);

    this.imageFiles.forEach((file, index) => {
      formData.append(`image_${index + 1}`, file, file.name);
    });

    this.recipeService.addRecipe(formData).subscribe((response: any) => {
      this.recipes.push(response);
      this.entry.title = '';
      this.entry.content = '';
    });
    this.hidePopUp();
    this.resetEntryForm();
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
  deleteEntry() {
    this.recipeService.deleteRecipe(this.entryToDelete.id).subscribe(() => {
      this.recipes = this.recipes.filter((e: any) => e.id !== this.entryToDelete.id);
      this.loadAllRecipes();
      this.hidePopUp();
    });
  }

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
