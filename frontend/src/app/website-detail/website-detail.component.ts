import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Website } from '../Website';
import { WebsiteService } from '../website.service';
import { Location } from '@angular/common'
import { WebsitePage } from '../WebsitePage';
import isUrl from 'is-url';
import { tap } from 'rxjs';

@Component({
  selector: 'app-website-detail',
  templateUrl: './website-detail.component.html',
  styleUrls: ['./website-detail.component.css']
})

export class WebsiteDetailComponent implements OnInit {
  website: Website | undefined;
  resultMessage: string = '';
  pageSize: number = 10;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  constructor(
    private route: ActivatedRoute,
    private websiteService: WebsiteService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getWebsite();
  }

  getWebsite(): void {
    const id = String(this.route.snapshot.paramMap.get('_id'));
    this.websiteService.getWebsite(id).subscribe((website) => (this.website = website));
  }

  goBack(): void{
    this.location.back();
  } 

  isValidWebsite(url: string): boolean {
    return isUrl(url);
  }

  get totalPages() {
    if (this.website) {
      return Math.ceil(this.website.pages.length / this.pageSize);
    } else {
      return 0;
    }
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
    const endIndex = this.website && this.website.pages ? Math.min(startIndex + this.itemsPerPage, this.website.pages.length) : 0;
    return { startIndex, endIndex };
  }

  add(pageUrl: string) {
    pageUrl
    if (!pageUrl) { 
      this.resultMessage = "Por favor insira o URL do website"
    } else {
      if(this.isValidWebsite(pageUrl)){
        var website: Website | null = null; 
        this.websiteService.getWebsites().subscribe((websitesList) => {
          for(const web of websitesList) {
            if(pageUrl.includes(web.url)){
              website = web;
            }
          }
          if(website != null && this.website != null){
            if(website.url === this.website.url) {
              this.websiteService.getPages().subscribe((pagesList) => {
                var inBD: boolean = false;
                
                console.log(pagesList)
                for(const page of pagesList){
                      if(pageUrl == page.url) {
                        this.resultMessage = "Página já no banco de dados";
                        inBD = true;
                  }
                }
                if (!inBD) {
                  var webPage: WebsitePage = {
                    url: pageUrl,
                    monitoringStatus: 'Por avaliar',
                  }; 
                
                  this.websiteService.addPage(webPage)
                    .pipe(
                      tap((response: WebsitePage) => {
                        webPage = response;
                      })
                    )
                    .subscribe(() => {
                      if (website) {
                        website.pages.push(webPage);
                        this.websiteService.updateWebsite(website)
                          .subscribe((response: string) => {
                            this.resultMessage = response;
                          });
                        
                      }
                    });
                }
              });
            } else {
              this.resultMessage = "A página não faz parte do domínio do website"; 
            }
            
          } else {
            this.resultMessage = "O site correspondente não existe no BD"
          }
        });
      }else {
          this.resultMessage = "URL inválido – formato de exemplo: https://www.example.com";
      }
    }
  }
}
