import { Component, OnInit, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Question } from 'src/app/services/question';

@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.scss']
})
export class DialogBoxComponent implements OnInit {

  action:string;
  local_data:any;

  constructor(
    public dialogRef: MatDialogRef<DialogBoxComponent>,
    //@Optional() Se usa para prevenir errores, en caso de que NO se pase datos del form
    //MAT_DIALOG_DATA se usa para obtener los datos pasados desde el metodo "open" en openDialog en question-list.component.ts
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Question) {
    console.log(data);
    this.local_data = {...data}; 
    this.action = this.local_data.action;
  }

  doAction(){
    this.dialogRef.close({event:this.action,data:this.local_data});
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }

  ngOnInit() {
  }

}
