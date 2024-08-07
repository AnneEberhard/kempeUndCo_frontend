import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ancestors',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ancestors.component.html',
  styleUrl: './ancestors.component.scss'
})
export class AncestorsComponent {

}
