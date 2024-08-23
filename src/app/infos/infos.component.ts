import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { FormsModule } from '@angular/forms';
import { InfoService } from '../services/info.service';
import { QuillModule } from 'ngx-quill';
import { ScrollService } from '../services/scroll.service';


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
  entry = {
    title: '',
    content: ''
  };
  imageFiles: File[] = [];
  filteredEntries: any[] = [];
  entryData: any = null;
  deleteEntryData: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private infoService: InfoService,
    private scrollService: ScrollService,
  ) { }

  ngOnInit(): void {
    this.loadAllinfo();
    this.userId = sessionStorage.getItem('userId');
    this.userEmail = sessionStorage.getItem('userEmail');
  }

  loadAllinfo() {
     this.infoService.getAllInfos().subscribe(infos => {
       this.infos = infos;
     });
  }

  loadinfo(infoId: string): void {
    this.infoService.getinfoById(infoId).subscribe(info => {

      this.selectedInfo = info;
      this.filteredEntries = info.entries;

    });
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
    formData.append('title', this.entry.title);
    formData.append('content', this.entry.content);
    this.imageFiles.forEach((file, index) => {
      formData.append('images[]', file, file.name);
    });
    console.log(formData);
    this.infoService.addInfo(formData).subscribe((response: any) => {
      this.selectedInfo.entries.push(response);
      this.entry.title = '';
      this.entry.content = '';
    });
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
      this.entryData = { ...entry };
    } else if (mode === 'delete') {
      this.deleteEntryData = { ...entry }
    }
    const popUp = document.getElementById('popUp');
    const popUpContainer = document.getElementById('popUpContainer');
    if (popUpContainer) {
      popUpContainer.classList.remove('dNone');
    }
    if (popUp) {
      this.scrollService.setActiveScrollContainer(popUp);
    }
  }


  hidePopUp() {
    this.entryData = null;
    this.deleteEntryData = null;
    const mainContainer = document.getElementById('mainContainer');
    const popUpContainer = document.getElementById('popUpContainer');
    this.scrollService.setActiveScrollContainer(mainContainer);
    if (popUpContainer) {
      popUpContainer.classList.add('dNone');
    }
  }

  saveEntry() {
    //  if (this.entryData && this.entryData.content) {
    //    this.infoService.updateEntry(this.entryData.id, {
    //      title: this.entryData.title,
    //      content: this.entryData.content,
    //    }).subscribe(updatedEntry => {
    //      const index = this.selectedInfo.entries.findIndex((e: any) => e.id === this.entryData.id);
    //      this.selectedInfo.entries[index] = updatedEntry;
    //      this.hidePopUp();
    //    });
    //  } else {
    //    alert('Inhalt darf nicht leer sein.');
    //  }
  }

}
