import { Component, Input, OnInit } from '@angular/core';
import { Question } from 'src/app/services/question';


@Component({
  selector: 'app-question-card', //etiqueta/directiva HTML asociada para usar en la vista
  templateUrl: './question-card.component.html', //que vista/template tiene este componente 
  styleUrls: ['./question-card.component.scss' ] //estilos css 
})
export class QuestionCardComponent implements OnInit {

  @Input() question: Question;

  constructor() { }

  //lo primero que se ejecuta desp del constructor es este metodo
  ngOnInit() {
  }
 
 // dataSource = this.question;

 
  


}
