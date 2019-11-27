import { Component, OnInit, ViewChild } from '@angular/core';
import { Question } from 'src/app/services/question';
import { QuestionsService } from 'src/app/services/questions.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatInput, MatDialog, MatTable } from '@angular/material';
import {MatFormField} from '@angular/material/form-field';
import { DialogBoxComponent } from 'src/app/components/dialog-box/dialog-box.component';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss']
})
export class QuestionListComponent implements OnInit {

  displayedColumns: string[] = [ 'name', 'phone', 'email', 'id', 'action']; 
  dataSource: MatTableDataSource<Question>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;

  questions: Array<Question>;
  constructor(questionsSvc: QuestionsService, public dialog: MatDialog, private router : Router) {
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
      width: '500px',
      data:obj
    });
 
    dialogRef.afterClosed().subscribe(result => {
      if(result.event == 'Añadir'){
        this.addRowData(result.data);
      }else if(result.event == 'Actualizar'){
        this.updateRowData(result.data);
      }else if(result.event == 'Borrar'){
        this.deleteRowData(result.data);
      }
    });
  }
 

  //Reemplazar estos metodos por servicios brindados en questions.service.ts 

    addRowData(row_obj){
      
      const data = this.dataSource.data;

      
      data.push({
        id:data.length + 1,  //momentaneo, obtener el max id del array
        name:row_obj.name,
        phone:row_obj.phone,
        email:row_obj.email,
        message: row_obj.message
      });
      this.dataSource.data = data;
    
      this.table.renderRows();
      
    }
    
    updateRowData(row_obj){
      this.dataSource.data = this.dataSource.data.filter((value,key)=>{
        if(value.id == row_obj.id){
          value.name = row_obj.name;
          value.phone = row_obj.phone;
          value.email = row_obj.email;
          value.message = row_obj.message;

        }
        return true;
      });
    }
    deleteRowData(row_obj){
      this.dataSource.data = this.dataSource.data.filter((value,key)=>{
        return value.id != row_obj.id;
      });
    }


}



