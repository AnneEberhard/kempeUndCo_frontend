import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { RecipeService } from '../services/recipe.service';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ScrollService } from '../services/scroll.service';

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

  constructor(
    public recipeService: RecipeService,
    private scrollService: ScrollService,
    public sanitizer: DomSanitizer
  ) { }

  
  ngOnInit(): void {
    this.loadAllRecipe();
    this.userId = sessionStorage.getItem('userId');
    this.userEmail = sessionStorage.getItem('userEmail');
  }

  
  loadAllRecipe() {
    this.recipeService.getAllRecipes().subscribe(recipes => {
      this.recipes = recipes;
      this.filteredRecipes = this.recipes;
    });
  }

  
  loadRecipe(recipeId: string): void {
    this.recipeService.getRecipeById(recipeId).subscribe(
      recipe => {
        this.selectedRecipe = recipe;
        this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(recipe.content);
      }
    );
  }

  
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

  
  getImageArray(recipe: any): string[] {
    const images: string[] = [];

    if (recipe.image_1) images.push(recipe.image_1);
    if (recipe.image_2) images.push(recipe.image_2);
    if (recipe.image_3) images.push(recipe.image_3);
    if (recipe.image_4) images.push(recipe.image_4);

    return images;
  }


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


  showPopUp(mode: string, recipe: any) {
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
      this.entry = { ...recipe };
    } else if (mode === 'image') {
      this.showImageUrl = recipe;
    } else if (mode === 'delete') {
      this.entryToDelete = { ...recipe };
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
  


  isImageSlotAvailable(index: number): boolean {
    return !this.entry[`image_${index}`];
  }


  hidePopUp() {
    this.entry = null;
    this.entryToDelete = null;
    this.showImageUrl = null;
    const mainContainer = document.getElementById('mainContainer');
    const popUpContainer = document.getElementById('popUpContainer');
    this.scrollService.setActiveScrollContainer(mainContainer);
    if (popUpContainer) {
      popUpContainer.classList.add('dNone');
    }
  }


// FormData erstellen und Titel/Inhalt hinzufügen
assembleFormData(): FormData {
  const formData = new FormData();
  formData.append('title', this.entry.title);
  formData.append('content', this.entry.content);

  this.addNewImages(formData);
  this.addNullFields(formData);

  // Gelöschte Bilder hinzufügen
  formData.append('deletedImages', JSON.stringify(this.deletedImages));

  return formData;
}

// Neue Bilder hinzufügen
addNewImages(formData: FormData): void {
  this.imageFiles.forEach((file) => {
    const imageField = this.getNextAvailableImageField();
    if (imageField) {
      formData.append(imageField, file, file.name);
    }
  });
}

// Leere Felder für gelöschte Bilder hinzufügen
addNullFields(formData: FormData): void {
  for (let i = 1; i <= 4; i++) {
    const imageField = `image_${i}`;
    if (!this.entry[imageField]) {
      formData.append(imageField, '');  // Leere Felder als `null` senden
    }
  }
}

// Hauptfunktion
saveEntry(): void {
  const formData = this.assembleFormData();

  if (this.entry.id) {
    this.updateEntry(formData);
  } else {
    this.addEntry();
  }
}

// Funktion zum Aktualisieren eines vorhandenen Rezepts
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


  getNextAvailableImageField(): string | null {
    for (let i = 1; i <= 4; i++) {
      const imageField = `image_${i}`;
      if (!this.entry[imageField]) {
        return imageField;
      }
    }
    return null;
  }


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

  deleteEntry() {
    this.recipeService.deleteRecipe(this.entryToDelete.id).subscribe(() => {
      this.recipes = this.recipes.filter((e: any) => e.id !== this.entryToDelete.id);
      this.loadAllRecipe();
      this.hidePopUp();
    });
  }

  goToRecipe(recipeId: number): void {
    const element = document.getElementById(recipeId.toString());
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
