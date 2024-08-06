import { provideHttpClient, withFetch } from '@angular/common/http';
import { Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from './login/login.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { DiscussionsComponent } from './discussions/discussions.component';
import { InfosComponent } from './infos/infos.component';
import { AncestorsComponent } from './ancestors/ancestors.component';
import { RecipesComponent } from './recipes/recipes.component';
import { LegalComponent } from './legal/legal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    BrowserModule,
    RegistrationComponent,
    LoginComponent,
    WelcomeComponent,
    DiscussionsComponent,
    InfosComponent,
    AncestorsComponent,
    RecipesComponent,
    LegalComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'kempeUndCo_frontend';
}
