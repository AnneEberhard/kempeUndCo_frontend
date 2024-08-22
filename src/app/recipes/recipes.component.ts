import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeService } from '../services/recipe.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, ScrollToTopButtonComponent, RouterModule, FormsModule],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss'
})
export class RecipesComponent implements OnInit {
  userId: string | null = null;
  userEmail: string | null = null;
  recipes: any[] = [];
  selectedrecipe: any = null;
  newEntry = {
    title: '',
    content: ''
  };
  filteredEntries: any[] = [];
  editEntryData: any = null;
  deleteEntryData: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService
  ) { }

  ngOnInit(): void {
    this.loadAllRecipes();
    this.userId = sessionStorage.getItem('userId');
    this.userEmail = sessionStorage.getItem('userEmail');
  }

  loadAllRecipes() {
  // this.recipeService.getAllrecipes().subscribe(recipes => {
  //   this.recipes = recipes;
  // });
  }

  loadrecipe(recipeId: string): void {
  // this.recipeService.getrecipeById(recipeId).subscribe(recipe => {

  //   this.selectedrecipe = recipe;
  //   this.filteredEntries = recipe.entries;

  // });
  }

  clearSelection(): void {
    this.selectedrecipe = null;
    this.router.navigate(['/recipes']);
  }

  filterEntries(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (!searchTerm) {
      this.filteredEntries = this.selectedrecipe.entries;
    } else {
      this.filteredEntries = this.selectedrecipe.entries.filter((entry: { author: string; title: string; content: string; }) =>
        entry.author.toLowerCase().includes(searchTerm) ||
        (entry.title && entry.title.toLowerCase().includes(searchTerm)) ||
        entry.content.toLowerCase().includes(searchTerm)
      );
    }
  }


  addEntry() {
    const entry = {
      title: this.newEntry.title,
      content: this.newEntry.content,
      author: this.userId,
      recipe: this.selectedrecipe.id,
    };

  //  this.recipeService.addEntry(entry).subscribe((response) => {
  //    this.selectedrecipe.entries.push(response);
  //    this.newEntry.title = '';
  //    this.newEntry.content = '';
  //  });
  }


  deleteEntry() {
  // this.recipeService.deleteEntry(this.deleteEntryData.id).subscribe(() => {
  //   this.selectedrecipe.entries = this.selectedrecipe.entries.filter((e: any) => e.id !== this.deleteEntryData.id);
  //   this.loadrecipe(this.selectedrecipe.person.id);
  //   this.hidePopUp();
  // });
  }


  showPopUp(mode: string, entry: any) {
    if (mode === 'edit') {
      this.editEntryData = { ...entry };
    } else if (mode === 'delete') {
      this.deleteEntryData = { ...entry }
    }
    const popUpContainer = document.getElementById('popUpContainer');
    if (popUpContainer) {
      popUpContainer.classList.remove('dNone');
    }
  }


  hidePopUp() {
    this.editEntryData = null;
    this.deleteEntryData = null;
    const popUpContainer = document.getElementById('popUpContainer');
    if (popUpContainer) {
      popUpContainer.classList.add('dNone');
    }
  }

  saveEntry() {
  //  if (this.editEntryData && this.editEntryData.content) {
  //    this.recipeService.updateEntry(this.editEntryData.id, {
  //      title: this.editEntryData.title,
  //      content: this.editEntryData.content,
  //    }).subscribe(updatedEntry => {
  //      const index = this.selectedrecipe.entries.findIndex((e: any) => e.id === this.editEntryData.id);
  //      this.selectedrecipe.entries[index] = updatedEntry;
  //      this.hidePopUp();
  //    });
  //  } else {
  //    alert('Inhalt darf nicht leer sein.');
  //  }
  }

}

