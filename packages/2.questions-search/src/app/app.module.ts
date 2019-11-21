import { NgModule } from '@angular/core';
import { MatToolbarModule  } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { QuestionCardComponent } from './components/questions/question-card/question-card.component';
import { QuestionsService } from './services/questions.service';
import { NotFoundComponent } from './views/questions/not-found/not-found.component';
import { QuestionDetailComponent } from './views/questions/question-detail/question-detail.component';
import { QuestionListComponent } from './views/questions/question-list/question-list.component';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    QuestionListComponent,
    QuestionDetailComponent,
    QuestionCardComponent,
    NavbarComponent,
    FooterComponent,
    NotFoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [QuestionsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
