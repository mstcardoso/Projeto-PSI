import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebsitesComponent } from './websites/websites.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WebsitesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Plataforma de Monitorização';
}
