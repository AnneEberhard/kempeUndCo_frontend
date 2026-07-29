import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { BackgroundComponent } from '../background/background.component';

@Component({
    selector: 'app-private-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, BackgroundComponent],
    templateUrl: './private-layout.component.html',
    styleUrl: './private-layout.component.scss'
})
export class PrivateLayoutComponent {
  constructor(private authService: AuthService) {}

}
