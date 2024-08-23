import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { FormsModule } from '@angular/forms';
import { InfoService } from '../sevices/info.service';
import { QuillModule } from 'ngx-quill';


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
  newEntry = {
    title: '',
    content: ''
  };
  imageFiles: File[] = [];
  filteredEntries: any[] = [];
  editEntryData: any = null;
  deleteEntryData: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private infoService: InfoService
  ) { }

  ngOnInit(): void {
    this.loadAllinfo();
    this.userId = sessionStorage.getItem('userId');
    this.userEmail = sessionStorage.getItem('userEmail');
  }

  loadAllinfo() {
  // this.infoService.getAllinfos().subscribe(infos => {
  //   this.infos = infos;
  // });
  }

  loadinfo(infoId: string): void {
  // this.infoService.getinfoById(infoId).subscribe(info => {

  //   this.selectedInfo = info;
  //   this.filteredEntries = info.entries;

  // });
  }

  clearSelection(): void {
    this.selectedInfo = null;
    this.router.navigate(['/infos']);
  }

  filterEntries(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value.toLowerCase();

    if (!searchTerm) {
      this.filteredEntries = this.selectedInfo.entries;
    } else {
      this.filteredEntries = this.selectedInfo.entries.filter((entry: { author: string; title: string; content: string; }) =>
        entry.author.toLowerCase().includes(searchTerm) ||
        (entry.title && entry.title.toLowerCase().includes(searchTerm)) ||
        entry.content.toLowerCase().includes(searchTerm)
      );
    }
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files.length + this.imageFiles.length > 4) {
      alert('Du kannst nur bis zu 4 Bilder hochladen.');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        this.imageFiles.push(file);
      } else {
        alert('Nur JPG und PNG Dateien sind erlaubt.');
      }
    }
  }

  addEntry() {
    const formData = new FormData();
      formData.append('title', this.newEntry.title);
      formData.append('content', this.newEntry.content);
    if(this.userId) {
      formData.append('author', this.userId);
    }
    this.imageFiles.forEach((file, index) => {
      formData.append('images[]', file, file.name);
    });

  //  this.infoService.addEntry(entry).subscribe((response) => {
  //    this.selectedInfo.entries.push(response);
  //    this.newEntry.title = '';
  //    this.newEntry.content = '';
  //  });
  }


  deleteEntry() {
  // this.infoService.deleteEntry(this.deleteEntryData.id).subscribe(() => {
  //   this.selectedInfo.entries = this.selectedInfo.entries.filter((e: any) => e.id !== this.deleteEntryData.id);
  //   this.loadinfo(this.selectedInfo.person.id);
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
  //    this.infoService.updateEntry(this.editEntryData.id, {
  //      title: this.editEntryData.title,
  //      content: this.editEntryData.content,
  //    }).subscribe(updatedEntry => {
  //      const index = this.selectedInfo.entries.findIndex((e: any) => e.id === this.editEntryData.id);
  //      this.selectedInfo.entries[index] = updatedEntry;
  //      this.hidePopUp();
  //    });
  //  } else {
  //    alert('Inhalt darf nicht leer sein.');
  //  }
  }

}
