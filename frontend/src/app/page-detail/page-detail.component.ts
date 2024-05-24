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
  
  constructor(
    private route: ActivatedRoute,
    private websiteService: WebsiteService,
    private location: Location
  ) {
    
  }

  ngOnInit(): void {
    this.getPage();
    this.passedTests = this.report?.act.data['metadata']['passed'] + this.report?.wcag.data['metadata']['passed'];
    this.warningTests = this.report?.act.data['metadata']['warning'] + this.report?.wcag.data['metadata']['warning'];;
    this.failedTests = this.report?.act.data['metadata']['failed'] + this.report?.wcag.data['metadata']['failed'];;
    this.notApplicableTests = this.report?.act.data['metadata']['inapplicable'] + this.report?.wcag.data['metadata']['inapplicable'];;
    this.totalTests = this.passedTests + this.warningTests + this.failedTests + this.notApplicableTests;

    for(let assertion of this.report?.act.data['assertions']){
      let test: TestResult= {
        code: assertion['code'], 
        description: assertion['description'], 
        type: 'ACT', result: assertion['metadata']['outcome'], 
        level: assertion['metadata']['success-criteria']
      }
      this.testResults.push(test);
    }

    for(let assertion of this.report?.wcag.data['assertions']){
      let test: TestResult= {
        code: assertion['code'], 
        description: assertion['description'], 
        type: 'ACT', result: assertion['metadata']['outcome'], 
        level: assertion['metadata']['success-criteria']
      }
      this.testResults.push(test);
    }
  }

  getPage(): void {
    const id = String(this.route.snapshot.paramMap.get('_id'));
    this.websiteService.getPage(id).subscribe((page) => {
      this.page = page;
      this.report = page.report;
  });
  }

  // sacar report da pagina
  totalTests = 100;
  passedTests = 70;
  warningTests = 10;
  failedTests = 15;
  notApplicableTests = 5;

  testResults: TestResult[] = [
    { code: "1", description: 'Test 1', type: 'ACT', result: 'passed', level: 'A'},
    { code: "2", description: 'Test 2', type: 'WCAG', result: 'warning', level: 'AA'},
    { code: "3", description: 'Test 3', type: 'ACT', result: 'failed', level: 'AAA' },
    // Add more test results here
  ];

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
    return (this.passedTests / this.totalTests) * 100;
  }

  get percentageWarning(): number {
    return (this.warningTests / this.totalTests) * 100;
  }

  get percentageFailed(): number {
    return (this.failedTests / this.totalTests) * 100;
  }

  get percentageNotApplicable(): number {
    return (this.notApplicableTests / this.totalTests) * 100;
  }

  goBack(): void{
    this.location.back();
  } 
}
