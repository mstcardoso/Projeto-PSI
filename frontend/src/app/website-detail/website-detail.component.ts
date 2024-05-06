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
  pages: WebsitePage[] = [];
  selectedPages: WebsitePage[] = [];
  earlList: any[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private websiteService: WebsiteService,
    private location: Location
  ) {
    
  }

  ngOnInit(): void {
    this.getWebsite();
  }

  getWebsite(): void {
    const id = String(this.route.snapshot.paramMap.get('_id'));
    this.websiteService.getWebsite(id).subscribe((website) => (this.website = website));
    if (this.website != undefined) {
      this.pages = this.website.pages;
    }
  }

  changeCheckedBoxes(page: WebsitePage){
    if(this.selectedPages.includes(page)) {
      this.selectedPages = this.selectedPages.filter(cPage => cPage !== page);
    }
    else {
      this.selectedPages.push(page);
    }
  }

  evaluatePage(): void {
    let page: WebsitePage;
    for(page of this.selectedPages){
      this.websiteService.evaluatePage(page.url).subscribe((earlReport) => (this.earlList.push(earlReport)));
    }
  }

  deletePage(): void {
    let page: WebsitePage;
    for(page of this.selectedPages){
      this.delete(page);
    }
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
    if(pageUrl.charAt(pageUrl.length-1) == '/'){
      pageUrl = pageUrl.substring(0,pageUrl.length-1);
    }
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
                  var webPage: WebsitePage;
                  this.websiteService.addPage(pageUrl)
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
                      window.location.reload();
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

  delete(page: WebsitePage): void {
    this.pages = this.pages.filter((h) => h !== page);
    this.websiteService.deletePage(page._id).subscribe(() => {
      if (this.website) {
        const index = this.website.pages.findIndex(findPage => findPage._id === page._id);
        this.website.pages.splice(index, 1);
        this.websiteService.updateWebsite(this.website)
          .subscribe((response: string) => {
            this.resultMessage = response;
          });
      }
      //window.location.reload();
    });
  }
}

