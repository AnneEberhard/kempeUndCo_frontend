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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RegistrationComponent,
    LoginComponent,
    WelcomeComponent,
    DiscussionsComponent,
    InfosComponent,
    AncestorsComponent,
    RecipesComponent,
    LegalComponent,
    HeaderComponent,
    FooterComponent,
    ScrollToTopButtonComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'kempeUndCo_frontend';
}
