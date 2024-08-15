import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';

@Component({
  selector: 'app-ancestors',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollToTopButtonComponent],
  templateUrl: './ancestors.component.html',
  styleUrl: './ancestors.component.scss'
})
export class AncestorsComponent {
  family = {
    grandparents: [
      { name: 'Großvater 1' },
      { name: 'Großmutter 1' }
    ],
    parents: [
      { name: 'Vater' },
      { name: 'Mutter' }
    ],
    person: { name: 'Person X' },
    spouse: { name: 'Ehepartner' },
    children: [
      { name: 'Kind 1' },
      { name: 'Kind 2' }
    ]
  };
}
