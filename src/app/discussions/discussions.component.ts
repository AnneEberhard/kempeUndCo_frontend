import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { DiscussionService } from '../services/discussion.service';
import { FormsModule } from '@angular/forms';


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
  newEntry = {
    content: ''
  };


  constructor(
    private discussionService: DiscussionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.personId = params.get('id');
      if (this.personId) {
        this.loadDiscussion(this.personId);
      } else {
        this.loadAllDiscussions();
      }
    });
  }

  loadAllDiscussions(): void {
    this.discussionService.getAllDiscussions().subscribe(discussions => {
      this.discussions = discussions;
    });
  }

  loadDiscussion(personId: string): void {
    this.discussionService.getDiscussionByPersonId(personId).subscribe(discussion => {
      this.selectedDiscussion = discussion;
    });
  }

  goToDiscussion(personId: string): void {
    this.router.navigate(['/discussions/', personId]);
  }

  clearSelection(): void {
    this.selectedDiscussion = null;
    this.router.navigate(['/discussions']);
  }


  addEntry() {
    const userId = sessionStorage.getItem('userId'); // ID des aktuellen Benutzers aus dem Session Storage
    if (!userId) {
      console.error('User ID not found in session storage.');
      return;
    }

    const entry = {
      content: this.newEntry.content,
      author: userId,
      discussion: this.selectedDiscussion.id,
    };
    this.discussionService.addEntry(entry).subscribe((response) => {
      this.selectedDiscussion.entries.push(response);
        this.newEntry.content = '';
    });
  }
  
}
