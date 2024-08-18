import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { DiscussionService } from '../services/discussion.service';


@Component({
  selector: 'app-discussions',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollToTopButtonComponent],
  templateUrl: './discussions.component.html',
  styleUrl: './discussions.component.scss'
})
export class DiscussionsComponent implements OnInit {

  discussions: any[] = [];
  selectedDiscussion: any = null;
  personId: string | null = null;

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
    //get person
    //get discussion
  }

  clearSelection(): void {
    this.selectedDiscussion = null;
    this.router.navigate(['/discussions']);
  }

}
