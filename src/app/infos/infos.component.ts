import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { FormsModule } from '@angular/forms';
import { InfoService } from '../services/info.service';
import { QuillModule } from 'ngx-quill';
import { ScrollService } from '../services/scroll.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


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
  sanitizedContent: SafeHtml | null = null;
  showImageUrl: string | null = null;
  deletedImages: string[] = [];
  clearedFields: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public infoService: InfoService,
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
    });
  }

  loadInfo(infoId: string): void {
    this.infoService.getInfoById(infoId).subscribe(
      info => {
        this.selectedInfo = info;
        this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(info.content);
      },
      error => {
        console.error('Fehler beim Laden des Infos:', error);
        // Zeige eine Benachrichtigung an oder leite den Benutzer weiter
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

    if (info.image_1) images.push(info.image_1);
    if (info.image_2) images.push(info.image_2);
    if (info.image_3) images.push(info.image_3);
    if (info.image_4) images.push(info.image_4);

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



  showPopUp(mode: string, info: any) {
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
      this.entry = { ...info };
    } else if (mode === 'image') {
      this.showImageUrl = info;
    } else if (mode === 'delete') {
      this.entryToDelete = { ...info };
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
    if (this.entry.image_1 === imageUrl) {
      this.entry.image_1 = null;
    } else if (this.entry.image_2 === imageUrl) {
      this.entry.image_2 = null;
    } else if (this.entry.image_3 === imageUrl) {
      this.entry.image_3 = null;
    } else if (this.entry.image_4 === imageUrl) {
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
    const mainContainer = document.getElementById('mainContainer');
    const popUpContainer = document.getElementById('popUpContainer');
    this.scrollService.setActiveScrollContainer(mainContainer);
    if (popUpContainer) {
      popUpContainer.classList.add('dNone');
    }
  }

  saveEntry(): void {
    const formData = new FormData();
    formData.append('title', this.entry.title);
    formData.append('content', this.entry.content);

    // Neue Bilder hinzufügen
    this.imageFiles.forEach((file) => {
      const imageField = this.getNextAvailableImageField();
      if (imageField) {
        formData.append(imageField, file, file.name);
      }
    });

    // Alle `null` Felder hinzufügen (Bilder, die gelöscht wurden)
    for (let i = 1; i <= 4; i++) {
      const imageField = `image_${i}`;
      if (!this.entry[imageField]) {
        formData.append(imageField, '');  // Leere Felder als `null` senden
      }
    }

    // Gelöschte Bilder hinzufügen
    formData.append('deletedImages', JSON.stringify(this.deletedImages));

    if (this.entry.id) {
      this.infoService.updateInfo(this.entry.id, formData).subscribe((response: any) => {
        const index = this.infos.findIndex((e: any) => e.id === this.entry.id);
        if (index !== -1) {
          this.infos[index] = response;
        }
        this.resetEntryForm();
        this.hidePopUp();
      });
    } else {
      this.addEntry();
    }
  }


  getNextAvailableImageField(): string | null {
    for (let i = 1; i <= 4; i++) {
      const imageField = `image_${i}`;
      if (!this.entry[imageField]) {
        console.log(imageField);
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

  goToInfo(infoId: number): void {
    const element = document.getElementById(infoId.toString());
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
