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
  
  private websitesUrl = 'http://appserver.alunos.di.fc.ul.pt:3090/api/websites'; 
  private pagesUrl = 'http://appserver.alunos.di.fc.ul.pt:3090/api/pages'; 
  private websiteUrl = 'http://appserver.alunos.di.fc.ul.pt:3090/api/website'; 
  private pageUrl = 'http://appserver.alunos.di.fc.ul.pt:3090/api/page'
  
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor(
    private http: HttpClient) { }

  // POST Request Websites
  addWebsite(website: Website): Observable<string> {
    return this.http.post<string>(this.websiteUrl, website)
      .pipe(
        map(() => 'Website adicionado com sucesso'),
        catchError(error => {
          console.error(error);
          return of('Falha ao adicionar site');
        })
      );
  }

  addPage(page: WebsitePage): Observable<WebsitePage>  {
    return this.http.post<WebsitePage>(this.pageUrl, page, this.httpOptions).pipe(
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
      map(() => 'Página adicionada com sucesso'),
      catchError(() => of('Falha ao adicionar página'))
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
