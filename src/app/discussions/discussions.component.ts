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
  ) {}

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
    this.userId = sessionStorage.getItem('userId');
    this.userEmail = sessionStorage.getItem('userEmail');
  }

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

  loadPerson(personId: number): void {
    this.familyService.getPerson(personId).subscribe(person => {
      this.personName = person.name; 
      if(person.birt_date )
        {
          this.personGebDate = person.birt_date;
        }
    });
  }

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

  goToDiscussion(personId: string): void {
    this.router.navigate(['/discussions/', personId]);
  }

  clearSelection(): void {
    this.selectedDiscussion = null;
    this.router.navigate(['/discussions']);
  }

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


  
  deleteEntry() {
    this.discussionService.deleteEntry(this.entryToDelete.id).subscribe(() => {
        this.selectedDiscussion.entries = this.selectedDiscussion.entries.filter((e: any) => e.id !== this.entryToDelete.id);
        this.loadDiscussion(this.selectedDiscussion.person.id);
        this.hidePopUp();
    });
}

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
        this.entryToDelete = { ...data };
      } 
    const popUpContainer = document.getElementById('popUpContainer');
    if (popUpContainer) {
      popUpContainer.classList.remove('dNone');
    }
  }


  hidePopUp() {
    this.entry = null;
    this.entryToDelete= null;
    const popUpContainer = document.getElementById('popUpContainer');
    if (popUpContainer) {
      popUpContainer.classList.add('dNone');
    }
  }

  saveEntry(): void {
    const formData = this.assembleFormData();
    if (this.entry.id) {
      this.updateEntry(formData);
    } else {
      this.addEntry(formData);
    }
  }

  
  addEntry(formData: FormData) {
    formData.append('discussion', this.selectedDiscussion.id);
    this.discussionService.addEntry(formData).subscribe((response) => {
      this.selectedDiscussion.entries.push(response);
      this.hidePopUp();
    this.resetEntryForm();
    });
  }

  updateEntry(formData: FormData): void {
    this.discussionService.updateEntry(this.entry.id, formData).subscribe((response: any) => {
      const index = this.selectedDiscussion.entries.findIndex((e: any) => e.id === this.editEntryData.id);
        this.selectedDiscussion.entries[index] = this.entry;
      this.entry = null;
      this.resetEntryForm();
      this.hidePopUp();
    });
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



  getImageArray(info: any): string[] {
    const images: string[] = [];

    if (info.image_1_url) images.push(info.image_1_url);
    if (info.image_2_url) images.push(info.image_2_url);
    if (info.image_3_url) images.push(info.image_3_url);
    if (info.image_4_url) images.push(info.image_4_url);

    return images;
  }


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

  isImageSlotAvailable(index: number): boolean {
    return !this.entry[`image_${index}`];
  }

  assembleFormData(): FormData {
    const formData = new FormData();
    formData.append('title', this.entry.title);
    formData.append('content', this.entry.content);

    this.addNewImages(formData);
    this.addNullFields(formData);

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
