import { Component, OnInit, Optional, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Question } from 'src/app/services/question';
import { QuestionsService } from 'src/app/services/questions.service';
import {FormControl, Validators} from '@angular/forms';


export interface Broker {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.scss']
})
export class DialogBoxComponent implements OnInit {

  action:string;
  local_data:any;
  email = new FormControl('', [Validators.required, Validators.email]);
  

  constructor(
    public dialogRef: MatDialogRef<DialogBoxComponent>,
    //@Optional() Se usa para prevenir errores, en caso de que NO se pase datos del form
    //MAT_DIALOG_DATA se usa para obtener los datos pasados desde el metodo "open" en openDialog en question-list.component.ts
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Question) {
    console.log(data);
    this.local_data = {...data}; 
    this.action = this.local_data.action;    
  }
  
  //Esto hacerlo momentaneamente, ver si despues puedo obtener el array "brokers" de questions.ts
  //*************
  brokerss: Broker[] = [
    {value: '1', viewValue: 'Pepe Argento'},
    {value: '2', viewValue: 'Maria Elena'},
    {value: '3', viewValue: 'Paola Guerrero'},
    {value: '40', viewValue: 'Dardo Rocha'},
    {value: '6', viewValue: 'Coquito'}
  ];
 //********************

 //Procedo a guardar/eliminar/actualizar datos
  doAction(){
    this.dialogRef.close({event:this.action,data:this.local_data});
  }

//cierro Dialog
  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }

  ngOnInit() {
  }

  getErrorMessage() {
    return this.email.hasError('required') ? 'Debes ingresar un Email válido' :
        //this.email.hasError('email') ? 'El Email ingresado no es válido!' :
            '';
  }
}