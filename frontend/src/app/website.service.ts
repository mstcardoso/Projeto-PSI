import { Injectable } from '@angular/core';
import { Observable, of} from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Website } from './Website';
import { WebsitePage } from './WebsitePage';

@Injectable({
  providedIn: 'root'
})
export class WebsiteService {
  
  private websitesUrl = 'http://localhost:3090/api/websites'; 
  private pagesUrl = 'http://localhost:3090/api/pages'; 
  private websiteUrl = 'http://localhost:3090/api/website'; 
  private pageUrl = 'http://localhost:3090/api/page';
  private reportUrl = 'http://localhost:3090/api/report';

  
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor(
    private http: HttpClient) { }


  evaluatePage(url: string): Observable<any> {
      return this.http.post<any>(this.pageUrl + "/evaluate", {url: url}).pipe(
        catchError(this.handleError<string>('evaluatePage')));
    }

  // POST Request Websites
  addWebsite(website: string): Observable<Website> {
    return this.http.post<Website>(this.websiteUrl, {url: website}, this.httpOptions).pipe(
        catchError(this.handleError<Website>('addWebsite'))
      );
  }

  addPage(page: string): Observable<WebsitePage>  {
    return this.http.post<WebsitePage>(this.pageUrl, {url: page}, this.httpOptions).pipe(
      catchError(this.handleError<WebsitePage>('addPage'))
    );
  }

  // GET Request
  getWebsite<Data>(id: string): Observable<Website> {
    const url = `${this.websiteUrl}/${id}`;
    return this.http.get<any>(url).pipe(
      map((website: any) => {
        if (website && website._id) {
          website.id = website._id.toString(); // Convert ObjectId to string
          delete website._id; // Remove _id field if needed
        }

        if (website.pages && Array.isArray(website.pages)) {
          website.pages.forEach((page: any) => {
            if (page && page._id) {
              page.id = page._id.toString(); // Convert ObjectId to string
              delete page._id; // Remove _id field if needed
            }
          });
        }
        return website as Website;
      }),
      tap((website: Website) => {
        const outcome = website ? 'fetched' : 'did not find';
      }),
      catchError(this.handleError<Website>(`getWebsite id=${id}`))
    );
  }

  // GET Request Websites
  getWebsites(): Observable<Website[]> {
    return this.http.get<Website[]>(this.websitesUrl).pipe(
      catchError(this.handleError<Website[]>('getWebsites', []))
    );
  }
  
  // GET Request Pages
  getPages(): Observable<WebsitePage[]> {
    return this.http.get<WebsitePage[]>(this.pagesUrl).pipe(
      catchError(this.handleError<WebsitePage[]>('getPages', []))
    );
  }

  // PUT Request
  updateWebsite(website: Website): Observable<string> {
    const url = `${this.websiteUrl}/${website.id}`;
    return this.http.put(url, website, this.httpOptions).pipe(
      map(() => 'Website actualizada com sucesso'),
      catchError(() => of('Falha ao actualizar website'))
    );
  }

  updatePage(page: WebsitePage): Observable<string> {
    const url = `${this.pageUrl}/${page.id}`;
    return this.http.put(url, page, this.httpOptions).pipe(
      map(() => 'Página actualizada com sucesso'),
      catchError(() => of('Falha ao actualizar página'))
    );
  }

  /** DELETE: delete the website from the server */
  deleteWebsite(id: string | undefined): Observable<Website | string> {
    const url = `${this.websiteUrl}/${id}`;
    return this.http.delete<Website>(url, this.httpOptions).pipe(
      map(() => 'Página adicionada com sucesso'),
      catchError(this.handleError<Website>('deleteWebsite'))
    );
  }

  /** DELETE: delete the page from the server */
  deletePage(id: string | undefined): Observable<WebsitePage | string> {
    const url = `${this.pageUrl}/${id}`;
    return this.http.delete<WebsitePage>(url, this.httpOptions).pipe(
      map(() => 'Página adicionada com sucesso'),
      catchError(this.handleError<WebsitePage>('deletePage'))
    );
  }

  addReport(report: any): Observable<any> {
    return this.http.post<Report>(this.reportUrl, {report: report}, this.httpOptions).pipe(
        catchError(this.handleError<Website>('addReport'))
      );
  }

  getReportById(id: string): Observable<any> {
    const url = `${this.reportUrl}/${id}`;
    return this.http.get<any>(url).pipe(
      catchError(this.handleError<any>('getReportById'))
    );
  }

  getWcagById(id: string): Observable<any> {
    const url = `${this.reportUrl}/wcag-techniques/${id}`;
    return this.http.get<any>(url).pipe(
      catchError(this.handleError<any>('getWcagById'))
    );
  }

  getActRulesById(id: string): Observable<any> {
    const url = `${this.reportUrl}/act-rules/${id}`;
    return this.http.get<any>(url).pipe(
      catchError(this.handleError<any>('getActRulesById'))
    );
  }
  deleteReport(id: string | undefined): Observable<string> {
    const url = `${this.reportUrl}/${id}`;
    return this.http.delete<any>(url).pipe(
      catchError(this.handleError<any>('deleteReport'))
    );
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  
}
