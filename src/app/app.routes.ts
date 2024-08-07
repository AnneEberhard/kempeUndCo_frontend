import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { DiscussionsComponent } from './discussions/discussions.component';
import { AncestorsComponent } from './ancestors/ancestors.component';
import { InfosComponent } from './infos/infos.component';
import { RecipesComponent } from './recipes/recipes.component';
import { LegalComponent } from './legal/legal.component';
import { ForgotComponent } from './forgot/forgot.component';
import { PrivateLayoutComponent } from './templates/private-layout/private-layout.component';
import { PublicLayoutComponent } from './templates/public-layout/public-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegistrationComponent },
            { path: 'legal', component: LegalComponent },
            { path: 'forgot', component: ForgotComponent },
        ]
    },
    {
        path: '',
        component: PrivateLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', component: WelcomeComponent },
            { path: 'ancestors', component: AncestorsComponent },
            { path: 'discussions', component: DiscussionsComponent },
            { path: 'infos', component: InfosComponent },
            { path: 'recipes', component: RecipesComponent }
        ]
    }
];
