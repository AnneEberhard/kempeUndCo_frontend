import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { DiscussionsComponent } from './discussions/discussions.component';
import { AncestorsComponent } from './ancestors/ancestors.component';
import { InfosComponent } from './infos/infos.component';
import { RecipesComponent } from './recipes/recipes.component';
import { LegalComponent } from './legal/legal.component';
import { ForgotComponent } from './forgot/forgot.component';

export const routes: Routes = [
    { path: '', component: WelcomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'registration', component: RegistrationComponent },
    { path: 'ancestors', component: AncestorsComponent },
    { path: 'discussions', component: DiscussionsComponent },
    { path: 'infos', component: InfosComponent },
    { path: 'recipes', component: RecipesComponent },
    { path: 'legal', component: LegalComponent },
    { path: 'forgot', component: ForgotComponent },
];
