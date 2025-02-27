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
import { ActivationSuccessComponent } from './activation-success/activation-success.component';
import { ActivationFailureComponent } from './activation-failure/activation-failure.component';
import { ResetComponent } from './reset/reset.component';
import { AccountComponent } from './account/account.component';
import { FamInfosComponent } from './fam-infos/fam-infos.component';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            { path: '', component: LoginComponent },
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegistrationComponent },
            { path: 'legal', component: LegalComponent },
            { path: 'forgot', component: ForgotComponent },
            { path: 'reset-password/:uidb64/:token', component: ResetComponent },
            { path: 'activation-success', component: ActivationSuccessComponent },
            { path: 'activation-failure', component: ActivationFailureComponent },
        ] 
    },
    {
        path: '',
        component: PrivateLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'welcome', component: WelcomeComponent },
            { path: 'ancestors', component: AncestorsComponent },
            { path: 'ancestors/:id', component: AncestorsComponent },
            { path: 'discussions', component: DiscussionsComponent },
            { path: 'discussions/:id', component: DiscussionsComponent },
            { path: 'infos', component: InfosComponent },
            { path: 'faminfos', component: FamInfosComponent },
            { path: 'recipes', component: RecipesComponent },
            { path: 'account', component: AccountComponent }
        ]
    }
];
