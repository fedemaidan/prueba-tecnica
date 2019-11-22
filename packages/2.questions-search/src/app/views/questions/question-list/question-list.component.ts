import { Component, OnInit, ViewChild } from '@angular/core';
import { Question } from 'src/app/services/question';
import { QuestionsService } from 'src/app/services/questions.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatInput, MatDialog, MatTable } from '@angular/material';
import {MatFormField} from '@angular/material/form-field';
import { DialogBoxComponent } from 'src/app/components/dialog-box/dialog-box.component';


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
  @ViewChild(MatTable) table: MatTable<any>;

  questions: Array<Question>;
  constructor(questionsSvc: QuestionsService, public dialog: MatDialog) {
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

  openDialog(action,obj) {
    obj.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '450px',
      data:obj
    });
 
    dialogRef.afterClosed().subscribe(result => {
      if(result.event == 'Add'){
        this.addRowData(result.data);
      }
    });
  }
 
  addRowData(row_obj){
    
    const data = this.dataSource.data;
    data.push({
      id:data.length + 1 , 
      name:row_obj.name,
      phone:row_obj.phone,
      email:row_obj.email,
      message: row_obj.message
    });
    this.dataSource.data = data;
   
    this.table.renderRows();
    
  }

}



