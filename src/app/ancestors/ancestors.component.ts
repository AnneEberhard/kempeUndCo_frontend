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
      { name: 'Großmutter 1' },
      { name: 'Großvater 2' },
      { name: 'Großmutter 2' }
    ],
    parents: [
      { name: 'Vater' },
      { name: 'Mutter' }
    ],
    person: { name: 'Person X' },
    marriages: [
      {
        spouse: { name: 'Drost von Hülshoff dolude whatever' },
        children: [
          { name: 'Kind 1' },
          { name: 'Kind 2' }
        ]
      },
      {
        spouse: { name: 'Ehepartner' },
        children: [
          { name: 'Kind 1' },
          { name: 'Kind 2' }
        ]
      },
      {
        spouse: { name: 'Ehepartner' },
        children: [
        ]
      }
    ]
  };



    /**
  * shows overlay with hints
  */
    showHint() {
      const div = document.getElementById('popUpHintContainer');
      if (div) {
        div.classList.remove('dNone');
      }
      }
    
      /**
      * hides overlay with hints
      */
      hideHint() {
        const div = document.getElementById('popUpHintContainer');
        if (div) {
          div.classList.add('dNone');
        }
      }

      showInfos() {
        console.log('infos');
        const div = document.getElementById('popUpInfoContainer');
        if (div) {
          div.classList.remove('dNone');
        }
      }

      hideInfos() {
        const div = document.getElementById('popUpInfoContainer');
        if (div) {
          div.classList.add('dNone');
        }
      }
}
