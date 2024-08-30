import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { FormsModule } from '@angular/forms';
import { InfoService } from '../services/info.service';
import { QuillModule } from 'ngx-quill';
import { ScrollService } from '../services/scroll.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommentService } from '../services/comment.service';


@Component({
  selector: 'app-infos',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollToTopButtonComponent, FormsModule, QuillModule],
  templateUrl: './infos.component.html',
  styleUrl: './infos.component.scss'
})
export class InfosComponent implements OnInit {
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
  imageFiles: File[] = [];
  filteredInfos: any[] = [];
  entry: any = null;
  entryToDelete: any = null;
  comment: any = null;
  commentToDelete: any = null;
  sanitizedContent: SafeHtml | null = null;
  showImageUrl: string | null = null;
  deletedImages: string[] = [];
  clearedFields: string[] = [];
  comments: { [key: number]: any[] } = {};
  newComment: { [key: number]: string } = {};
  commentToUpdate: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public infoService: InfoService,
    private commentService: CommentService,
    private scrollService: ScrollService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadAllInfo();
    this.userId = sessionStorage.getItem('userId');
    this.userEmail = sessionStorage.getItem('userEmail');
  }

  loadAllInfo() {
    this.infoService.getAllInfos().subscribe(infos => {
      this.infos = infos;
      this.filteredInfos = this.infos;
      this.loadCommentsForInfos();
    });
  }

  loadInfo(infoId: string): void {
    this.infoService.getInfoById(infoId).subscribe(
      info => {
        this.selectedInfo = info;
        this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(info.content);
      }
    );
  }

  filterEntries(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (!searchTerm) {
      this.filteredInfos = this.infos;
    } else {
      this.filteredInfos = this.infos.filter((info: { author_email: string; title: string; content: string; }) =>
        info.author_email.toLowerCase().includes(searchTerm) ||
        (info.title && info.title.toLowerCase().includes(searchTerm)) ||
        info.content.toLowerCase().includes(searchTerm)
      );
    }
  }

  getImageArray(info: any): string[] {
    const images: string[] = [];

    if (info.image_1_url) images.push(info.image_1_url);
    if (info.image_2_url) images.push(info.image_2_url);
    if (info.image_3_url) images.push(info.image_3_url);
    if (info.image_4_url) images.push(info.image_4_url);

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
    } else if (mode === 'editInfo') {
      this.entry = { ...data };
    } else if (mode === 'image') {
      this.showImageUrl = data;
    } else if (mode === 'deleteInfo') {
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

  hidePopUp() {
    this.entry = null;
    this.entryToDelete = null;
    this.showImageUrl = null;
    this.comment = null;
    this.commentToDelete = null;
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


updateEntry(formData: FormData): void {
  this.infoService.updateInfo(this.entry.id, formData).subscribe((response: any) => {
    const index = this.infos.findIndex((e: any) => e.id === this.entry.id);
    if (index !== -1) {
      this.infos[index] = response;
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

    this.infoService.addInfo(formData).subscribe((response: any) => {
      this.infos.push(response);
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
    this.infoService.deleteInfo(this.entryToDelete.id).subscribe(() => {
      this.infos = this.infos.filter((e: any) => e.id !== this.entryToDelete.id);
      this.loadAllInfo();
      this.hidePopUp();
    });
  }

  deleteComment() {
    this.commentService.deleteComment(this.commentToDelete.id).subscribe(() => {
      this.loadAllInfo();
      this.hidePopUp();
    });
  }

saveComment() {
      this.commentService.updateComment(this.commentToUpdate.id, { content: this.commentToUpdate.content }).subscribe((response: any) => {
        const infoId = this.findInfoIdByCommentId(this.commentToUpdate.id);
        const index = this.comments[infoId].findIndex(c => c.id === this.commentToUpdate.id);
        if (index !== -1) {
          this.comments[infoId][index] = response;
        this.commentToUpdate = null;
      this.resetEntryForm();
      this.hidePopUp();
    }})}
  

  findInfoIdByCommentId(commentId: number): number {
    // Finde die Info-ID anhand der Kommentar-ID (diese Methode musst du implementieren)
    for (const infoId in this.comments) {
      if (this.comments[infoId].some(c => c.id === commentId)) {
        return +infoId;
      }
    }
    return 0;
  }

  goToInfo(infoId: number): void {
    const element = document.getElementById(infoId.toString());
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }


  loadCommentsForInfos() {
    this.infos.forEach(info => {
      this.commentService.getComments(info.id).subscribe(comments => {
        this.comments[info.id] = comments;
      });
    });
  }

  addComment(infoId: number, commentContent: string) {
    const comment = {
      content: commentContent,
      info: infoId
    };
    this.commentService.addComment(comment).subscribe(newComment => {
      if (this.comments[infoId]) {
        this.comments[infoId].push(newComment);
      } else {
        this.comments[infoId] = [newComment];
      }
    });
  }
}

