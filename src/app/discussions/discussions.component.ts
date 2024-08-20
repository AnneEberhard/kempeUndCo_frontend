import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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

  constructor(
    private discussionService: DiscussionService,
    private familyService: FamilyService, 
    private route: ActivatedRoute,
    private router: Router
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
    });
  }

  loadDiscussion(personId: string): void {
    this.discussionService.getDiscussionByPersonId(personId).subscribe(discussion => {
     
      this.selectedDiscussion = discussion;
      this.filteredEntries = discussion.entries;
      console.log(discussion);
      console.log(this.filteredEntries);
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
  
  deleteEntry(entry: any) {
    if (confirm('Möchtest du diesen Beitrag löschen?')) {
      this.discussionService.deleteEntry(entry.id).subscribe(() => {
        this.selectedDiscussion.entries = this.selectedDiscussion.entries.filter((e: any) => e.id !== entry.id);
      });
    }
  }

 deleteEntryInPopUp() {
   if (confirm('Bist du sicher, dass du diesen Beitrag löschen möchtest?')) {
     this.discussionService.deleteEntry(this.editEntryData.id).subscribe(() => {
       this.selectedDiscussion.entries = this.selectedDiscussion.entries.filter((e: any) => e.id !== this.editEntryData.id);
       this.hidePopUp();
     });
   }
 }

  showPopUp(entry: any) {
    this.editEntryData = { ...entry };  
    const popUpContainer = document.getElementById('popUpContainer');
    if (popUpContainer) {
      popUpContainer.classList.remove('dNone');
    }
  }

  hidePopUp() {
    this.editEntryData = null;
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




}
