import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WebsiteDetailComponent } from './website-detail/website-detail.component';


const routes: Routes = [
  { path: '', redirectTo: '/websites', pathMatch: 'full' },
  { path: 'websites', component: DashboardComponent },
  { path: 'website/:_id', component: WebsiteDetailComponent },
];
@NgModule({
 imports: [RouterModule.forRoot(routes)],
 exports: [RouterModule]
})

export class AppRoutingModule { }
