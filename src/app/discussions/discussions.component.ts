import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { DiscussionService } from '../services/discussion.service';
import { FormsModule } from '@angular/forms';
import { FamilyService } from '../services/family.service';


@Component({
  selector: 'app-discussions',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollToTopButtonComponent, FormsModule],
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
    content: ''
  };
  filteredEntries: any[] = [];
  editEntryData: any = null;
  deleteEntryData: any = null;

  constructor(
    private discussionService: DiscussionService,
    private familyService: FamilyService, 
    private route: ActivatedRoute,
    private router: Router,
    private cdRef: ChangeDetectorRef
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
      this.filteredDiscussions = this.discussions;
    });
  }

  loadDiscussion(personId: string): void {
    this.discussionService.getDiscussionByPersonId(personId).subscribe(discussion => {
      this.selectedDiscussion = discussion;
      this.filteredEntries = discussion.entries;
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


  addEntry() {
    const entry = {
      title: this.newEntry.title,
      content: this.newEntry.content,
      author: this.userId,
      discussion: this.selectedDiscussion.id,
    };

    this.discussionService.addEntry(entry).subscribe((response) => {
      this.selectedDiscussion.entries.push(response);
      this.newEntry.title = '';
        this.newEntry.content = '';
    });
  }
  

  deleteEntry() {
    this.discussionService.deleteEntry(this.deleteEntryData.id).subscribe(() => {
        this.selectedDiscussion.entries = this.selectedDiscussion.entries.filter((e: any) => e.id !== this.deleteEntryData.id);
        this.loadDiscussion(this.selectedDiscussion.person.id);
        this.hidePopUp();
    });
}


  showPopUp(mode: string, entry: any) {
    if(mode === 'edit') {
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
    if (this.editEntryData && this.editEntryData.content) {
      this.discussionService.updateEntry(this.editEntryData.id, {
        title: this.editEntryData.title,
        content: this.editEntryData.content,
      }).subscribe(updatedEntry => {
        const index = this.selectedDiscussion.entries.findIndex((e: any) => e.id === this.editEntryData.id);
        this.selectedDiscussion.entries[index] = updatedEntry;
        this.hidePopUp();
      });
    } else {
      alert('Inhalt darf nicht leer sein.');
    }
  }



  showPopUp2(entry: any) {
    this.editEntryData = { ...entry };  
    const popUpContainer = document.getElementById('popUpContainer');
    if (popUpContainer) {
      popUpContainer.classList.remove('dNone');
    }
  }

  deleteEntry2(entry: any) {
    if (confirm('Möchtest du diesen Beitrag löschen?')) {
      this.discussionService.deleteEntry(entry.id).subscribe(() => {
        this.selectedDiscussion.entries = this.selectedDiscussion.entries.filter((e: any) => e.id !== entry.id);
      });
    }
  }

}
