import { Component } from '@angular/core';
import { Website } from '../Website';
import { WebsiteService } from '../website.service';
import isUrl from 'is-url';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  constructor( private websiteService: WebsiteService,) {this.filteredWebsites = this.websites;}
  resultMessage: string = '';

  selectedStatus: string = 'Todos';
  filteredWebsites: Website[] = []; 
  websites: Website[] = [];
  registrationDateAsc: boolean = false;
  lastEvaluationDateAsc: boolean = false; 
  pageSize: number = 10;
  currentPage: number = 1;
  itemsPerPage: number = 10;

  ngOnInit(): void {
    this.getWebsites();
  }

  getWebsites(): void {
    this.websiteService.getWebsites().subscribe((websites) =>{ (this.websites = websites); this.filterWebsites();});
  }

  filterSelection(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue) {
      this.selectedStatus = selectedValue;
    }
    this.filterWebsites();
  }
  
  
  filterWebsites() {
    if (this.selectedStatus === 'Todos') {
      this.filteredWebsites = this.websites;
    } else {
      this.filteredWebsites = this.websites.filter(website => website.monitoringStatus === this.selectedStatus);
    }
  }

  sortByRegistrationDate() {
    this.filteredWebsites.sort((a, b) => {
      const orderFactor = this.registrationDateAsc ? 1 : -1;
      return orderFactor * (new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime());
    });
    this.registrationDateAsc = !this.registrationDateAsc; 
  }

  sortByLastEvaluationDate() {
    this.filteredWebsites.sort((a, b) => {
      const orderFactor = this.lastEvaluationDateAsc ? 1 : -1;
      if (!a.lastEvaluationDate) return 1;
      if (!b.lastEvaluationDate) return -1;
      return orderFactor * (new Date(a.lastEvaluationDate).getTime() - new Date(b.lastEvaluationDate).getTime());
    });
    this.lastEvaluationDateAsc = !this.lastEvaluationDateAsc; 
  }

  isValidWebsite(url: string): boolean {
    return isUrl(url);
  }

  add(websiteUrl: string) {
    if (!websiteUrl) {  
      this.resultMessage = "Por favor insira o URL do site"
    } else {
      if(this.isValidWebsite(websiteUrl)) {
        var websites: Website[] = [];
        this.websiteService.getWebsites().subscribe((websites) => {
          console.log("websites: " + websites)
          for(var web of websites) {
            if(web.url == websiteUrl){ 
              this.resultMessage = "Website já na BD";
              return; 
            }
          }
          const newWebsite: Website = {
            url: websiteUrl,
            monitoringStatus: 'Por avaliar',
            registrationDate: new Date(),
            pages: [],
          };
      
          this.websiteService.addWebsite(newWebsite )
            .subscribe((response: string) => {
              this.resultMessage = response;
          this.getWebsites();
          this.filterWebsites();
          });
        });
      } else {
          this.resultMessage = "URL inválido – formato de exemplo: https://www.example.com";
        }
      }
    }

  get totalPages() {
    return Math.ceil(this.websites.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  calculateIndex() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredWebsites.length);
    return { startIndex, endIndex };
  }
}