import { Component, OnInit, ViewChild } from '@angular/core';
import { Question } from 'src/app/services/question';
import { QuestionsService } from 'src/app/services/questions.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatInput} from '@angular/material';
import {MatFormField} from '@angular/material/form-field';


@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss']
})
export class QuestionListComponent implements OnInit {

  displayedColumns: string[] = [ 'name', 'phone', 'email', 'id']; 
  dataSource: MatTableDataSource<Question>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  

  questions: Array<Question>;
  constructor(questionsSvc: QuestionsService) {
    questionsSvc.questions$.subscribe(q => {
      this.questions = q;
      console.log(this.questions);
      
    });

    this.dataSource = new MatTableDataSource(this.questions);

  }


  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  getQuestionId(index: number, item: Question): number {
    return item.id;
  }

}



