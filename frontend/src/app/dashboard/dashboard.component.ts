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

  constructor( private websiteService: WebsiteService) {this.filteredWebsites = this.websites;}
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
    this.websiteService.getWebsites().subscribe((websites) => {
        this.websites = websites.map(website => {
          if (website.monitoringStatus !== 'Erro na avaliação') {
            let pagesToEvaluate = website.pages.filter(page => page.monitoringStatus === 'Por avaliar');
        
            if (pagesToEvaluate.length === website.pages.length) {
                website.monitoringStatus = 'Por avaliar';
            } else {
                let pagesInEvaluation = website.pages.filter(page => page.monitoringStatus === 'Em avaliação');
        
                if (pagesInEvaluation.length > 0 || pagesToEvaluate.length > 0) {
                    website.monitoringStatus = 'Em avaliação';
                }
            }
          }
          return website;
        });
        this.filterWebsites();
    });
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
    if(websiteUrl.charAt(websiteUrl.length-1) == '/'){
      websiteUrl = websiteUrl.substring(0,websiteUrl.length-1);
    }
    if (!websiteUrl) {  
      this.resultMessage = "Por favor insira o URL do site"
    } else {
      if(this.isValidWebsite(websiteUrl)) {
        this.websiteService.getWebsites().subscribe((websites) => {
          console.log("websites: " + websites)
          for(var web of websites) {
            if(web.url.includes(websiteUrl) || websiteUrl.includes(web.url)){ 
              this.resultMessage = "Website já na BD";
              return; 
            }
          }
      
          this.websiteService.addWebsite(websiteUrl)
            .subscribe((website) => {
              this.websites.push(website);
          this.getWebsites();
          this.filterWebsites();
          });
          this.resultMessage = 'Website adicionado com sucesso';
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

  delete(website: Website): void {
    if (website.pages && website.pages.length > 0) {
      const confirmDelete = confirm(`Are you sure you want to delete this website with ${website.pages.length} pages?`);
      if (confirmDelete) {
        this.deletePages(website);
        this.deleteWebsite(website);
      }
    } else {
      this.deleteWebsite(website);
    }
  }
  
  private deleteWebsite(website: Website): void {
    this.websites = this.websites.filter((h) => h !== website);
    this.websiteService.deleteWebsite(website.id).subscribe(() => {
      this.getWebsites();
      this.filterWebsites();
    });
  }

  private deletePages(website: Website): void {
    let i: number = 0;
    for (i = 0; i < website.pages.length; i++) {
      console.log("ciclo for " + JSON.stringify(website.pages[i]))
      this.websiteService.deletePage(website.pages[i].id).subscribe();
    }
  }
}