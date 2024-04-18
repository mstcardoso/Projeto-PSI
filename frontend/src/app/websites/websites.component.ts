import { Component } from '@angular/core';
import { Website } from '../website';
import { AppModule } from '../app.module';

@Component({
  selector: 'app-websites',
  standalone: true,
  imports: [],
  templateUrl: './websites.component.html',
  styleUrl: './websites.component.css'
})
export class WebsitesComponent {
  website: Website = {
    name: "Google",
    link: 'https://www.google.pt/'
  };
}
