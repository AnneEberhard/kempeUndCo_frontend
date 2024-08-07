import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from './login/login.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { DiscussionsComponent } from './discussions/discussions.component';
import { InfosComponent } from './infos/infos.component';
import { AncestorsComponent } from './ancestors/ancestors.component';
import { RecipesComponent } from './recipes/recipes.component';
import { LegalComponent } from './legal/legal.component';
import { HeaderComponent } from './templates/header/header.component';
import { FooterComponent } from './templates/footer/footer.component';
import { ScrollToTopButtonComponent } from './templates/scroll-to-top-button/scroll-to-top-button.component';
import { PublicLayoutComponent } from './templates/public-layout/public-layout.component';
import { PrivateLayoutComponent } from './templates/private-layout/private-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    PublicLayoutComponent,
    PrivateLayoutComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'kempeUndCo_frontend';
}
