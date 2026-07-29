import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { PublicHeaderComponent } from "../public-header/public-header.component";

@Component({
    selector: 'app-public-layout',
    standalone: true,
    imports: [RouterOutlet, PublicHeaderComponent, FooterComponent, PublicHeaderComponent],
    templateUrl: './public-layout.component.html',
    styleUrl: './public-layout.component.scss'
})
export class PublicLayoutComponent {

}
