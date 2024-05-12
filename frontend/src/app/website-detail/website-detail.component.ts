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
    this.websiteService.getWebsite(id).subscribe((website) => {
        this.website = website;
        if (this.website != undefined) {
            this.pages = this.website.pages;
            this.pages.forEach(element => {
              console.log(element.commonErrors);
            });
        }
    });
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
    if (this.selectedPages != null && this.website != null) {
        let error = false;

        this.website.monitoringStatus = "Em avaliação";
        this.websiteService.updateWebsite(this.website).subscribe({
            next: () => {
                let completedCount = 0;

                for (const page of this.selectedPages) {
                  page.monitoringStatus = "Em avaliação";
                  this.updatePage(page);
                  this.websiteService.evaluatePage(page.url).subscribe({
                    next: (earlReport) => {
                        let error = false;
                        let completedCount = 0;
                        console.log(earlReport)
                        if ((!earlReport || Object.keys(earlReport).length === 0 || earlReport.message == "erro") && this.website != null) {
                            error = true;
                            this.website.monitoringStatus = "Erro na avaliação";
                            this.website.lastEvaluationDate = new Date();
                            page.monitoringStatus = "Erro na avaliação";
                            this.updatePage(page);
                            this.updateWebsiteIfNeeded(error);
                        } else {  
                            const accessibilityErrors = this.getAccessibilityErrors(earlReport, page);
                            page.errorTypes = [accessibilityErrors.A != 0, accessibilityErrors.AA != 0, accessibilityErrors.AAA != 0]
                            if (accessibilityErrors.A == 0 && accessibilityErrors.AA == 0) {
                                page.monitoringStatus = "Conforme";
                                this.updatePage(page);
                            } else {
                                page.monitoringStatus = "Não conforme";
                                this.updatePage(page);
                            }
                
                            this.earlList.push(earlReport);
                        }
                
                        completedCount++;
                        if (completedCount === this.selectedPages.length && !error && this.website != null) {
                            this.website.monitoringStatus = "Avaliado";
                            this.website.lastEvaluationDate = new Date();
                            this.updateWebsiteIfNeeded(error);
                        }
                
                        try {
                            var commonErrors: string[] = [];
                            for (let assertion of Object.keys(earlReport[page.url]['modules']['act-rules']['assertions'])) {
                              if (earlReport[page.url]['modules']['act-rules']['assertions'][assertion]['metadata']['failed'] > 0) {
                                commonErrors.push(assertion + ": " + earlReport[page.url]['modules']['act-rules']['assertions'][assertion]['description']);
                              }
                            }
                
                            for (let assertion of Object.keys(earlReport[page.url]['modules']['wcag-techniques']['assertions'])) {
                              if ((earlReport[page.url]['modules']['wcag-techniques']['assertions'][assertion]['metadata']['failed']) > 0) {
                                commonErrors.push(assertion + ": " + earlReport[page.url]['modules']['act-rules']['assertions'][assertion]['description']);
                              }
                            }
                
                            page.commonErrors = commonErrors;
                            this.updatePage(page);
                        } catch (error) {
                            console.error("Error:", error);
                        }
                    },
                    error: (err) => {
                        console.error("Error evaluating page:", err);
                    }
                });
                }
            },
            error: (error) => {
                console.error("Falha ao atualizar status de monitoramento:", error);
            }
        });
    }
  } 
  
  private updatePage(page: WebsitePage) {
    if (page != null) {
      page.lastEvaluationDate = new Date();
      this.websiteService.updatePage(page).subscribe({
          error: (updateError) => {
              console.error("Falha ao atualizar status de monitoramento:", updateError);
          }
      });
    }
  }

  private updateWebsiteIfNeeded(error: boolean): void {
    if (this.website != null) {
        this.websiteService.updateWebsite(this.website).subscribe({
            error: (updateError) => {
                console.error("Falha ao atualizar status de monitoramento:", updateError);
            }
        });
    }
  }

  getAccessibilityErrors(reports: any, page: WebsitePage) {
    let accessibilityErrors = {
      A: 0,
      AA: 0,
      AAA: 0,
    };

    let actRulesAssertions = reports[page.url].modules["act-rules"].assertions;

    for (const rule in actRulesAssertions) {
      const assertion = actRulesAssertions[rule];
      if (assertion.metadata["outcome"] === "failed") {
        for (const criterion of assertion.metadata["success-criteria"]) {
          if (criterion.level === "A") {
            accessibilityErrors.A += assertion.metadata["failed"];
          } else if (criterion.level === "AA") {
            accessibilityErrors.AA += assertion.metadata["failed"];
          } else if (criterion.level === "AAA") {
            accessibilityErrors.AAA += assertion.metadata["failed"];
          }
        }
      }
    }
    return accessibilityErrors;
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
                      this.pages.push(webPage);
                      this.pages = this.pages;
                      this.getWebsite();
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
    this.websiteService.deletePage(page.id).subscribe(() => {
      if (this.website) {
        const index = this.website.pages.findIndex(findPage => findPage.id === page.id);
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

