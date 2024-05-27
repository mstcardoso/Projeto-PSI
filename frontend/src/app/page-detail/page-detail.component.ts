import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebsitePage } from '../WebsitePage';
import { WebsiteService } from '../website.service';
import { Location } from '@angular/common'
import { Report } from '../Report';
import { ActRules } from '../ActRules';
import { Wcag } from '../Wcag';

interface TestResult {
  code: string;
  description: string;
  type: 'ACT' | 'WCAG';
  result: string;
  level: 'A' | 'AA' | 'AAA';
}

@Component({
  selector: 'app-page-detail',
  templateUrl: './page-detail.component.html',
  styleUrls: ['./page-detail.component.css']
})
export class PageDetailComponent {
  page: WebsitePage | undefined;
  report: Report | undefined;
  passedTests: 0 | undefined;
  warningTests: 0 | undefined;
  failedTests: 0 | undefined;
  notApplicableTests: 0 | undefined;
  totalTests: 0 | undefined;
  testResults: TestResult[] = [];

  constructor(
    private route: ActivatedRoute,
    private websiteService: WebsiteService,
    private location: Location
  ) {
    
  }

  ngOnInit(): void {
    this.getPage().then(() => {
      console.log(this.report);
      this.totalTests = 0;
      this.passedTests = (this.report?.act.data.metadata.passed || 0) + (this.report?.wcag.data.metadata.passed || 0);
      this.warningTests = (this.report?.act.data.metadata.warning || 0) + (this.report?.wcag.data.metadata.warning || 0);
      this.failedTests = (this.report?.act.data.metadata.failed || 0) + (this.report?.wcag.data.metadata.failed || 0);
      this.notApplicableTests = (this.report?.act.data.metadata.inapplicable || 0) + (this.report?.wcag.data.metadata.inapplicable || 0);
      
      console.log("Ola");
      if (this.passedTests !== undefined) {
        this.totalTests += this.passedTests;
      }
      
      if (this.warningTests !== undefined) {
        this.totalTests += this.warningTests;
      }
      
      if (this.failedTests !== undefined) {
        this.totalTests += this.failedTests;
      }
      
      if (this.notApplicableTests !== undefined) {
        this.totalTests += this.notApplicableTests;
      }

      if (this.report) {
        // Iterar sobre as asserções do relatório 'act'
        console.log(this.report.act?.data.assertions)
        
        let assertions = this.report.act?.data.assertions || {};
        for (let [key,assertion] of Object.entries(assertions)) {
         /*  let test: TestResult = {
            code: assertion.code || '',
            description: assertion.description || '',
            type: 'ACT',
            result: assertion.metadata.outcome || '',
            level: assertion.metadata['success-criteria'] || ''
          };
          this.testResults.push(test); */
        }
    
        // Iterar sobre as asserções do relatório 'wcag'
        assertions = this.report.wcag?.data.assertions || {};
        for (let [key,assertion] of Object.entries(assertions)) {
         /*  let test: TestResult = {
            code: assertion.code || '',
            description: assertion.description || '',
            type: 'ACT',
            result: assertion.metadata.outcome || '',
            level: assertion.metadata['success-criteria'] || ''
          };
          this.testResults.push(test); */
        }
      }

    });
  }
  
  getPage(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const id = String(this.route.snapshot.paramMap.get('_id'));
      this.websiteService.getPage(id).subscribe(
        (page) => {
          this.page = page;
          this.report = page.report;
          resolve();
        },
        (error) => {
          reject(error); 
        }
      );
    });
  }
  


  filterType: 'ACT' | 'WCAG' | '' = '';
  filterResult: 'Passed' | 'Warning' | 'Failed' | 'Not Applicable' | '' = '';
  filterLevel: 'A' | 'AA' | 'AAA' | '' = '';

  get filteredResults(): TestResult[] {
    return this.testResults.filter(test => 
      (this.filterType === '' || test.type === this.filterType) &&
      (this.filterResult === '' || test.result === this.filterResult) &&
      (this.filterLevel === '' || test.level === this.filterLevel)
    );
  }

  get percentagePassed(): number {
    if (this.totalTests !== undefined && this.passedTests !== undefined) {
      return (this.totalTests !== 0 ? (this.passedTests / this.totalTests) * 100 : 0);
    } else {
      return 0;
    }
  }
  
  get percentageWarning(): number {
    if (this.totalTests !== undefined && this.warningTests !== undefined) {
      return (this.totalTests !== 0 ? (this.warningTests / this.totalTests) * 100 : 0);
    } else {
      return 0;
    }
  }
  
  get percentageFailed(): number {
    if (this.totalTests !== undefined && this.failedTests !== undefined) {
      return (this.totalTests !== 0 ? (this.failedTests / this.totalTests) * 100 : 0);
    } else {
      return 0;
    }
  }
  
  get percentageNotApplicable(): number {
    if (this.totalTests !== undefined && this.notApplicableTests !== undefined) {
      return (this.totalTests !== 0 ? (this.notApplicableTests / this.totalTests) * 100 : 0);
    } else {
      return 0;
    }
  }
  
  
  goBack(): void{
    this.location.back();
  } 
}
