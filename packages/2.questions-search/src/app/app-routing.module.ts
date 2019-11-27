//IMPORTS NECESARIOS
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//IMPORTS COMPONENTES 
import { NotFoundComponent } from './views/questions/not-found/not-found.component';
import { QuestionDetailComponent } from './views/questions/question-detail/question-detail.component';
import { QuestionListComponent } from './views/questions/question-list/question-list.component';

const routes: Routes = [

  { path: 'questions', component: QuestionListComponent },
  { path: 'questions/:id', component: QuestionDetailComponent },
  { path: '', redirectTo: '/questions', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent } //Cuando se carga una ruta que NO existe.. Es importante que vaya AL FINAL!
];


//se podria exportar tambien mediante el "ModuleWithProviders"
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
