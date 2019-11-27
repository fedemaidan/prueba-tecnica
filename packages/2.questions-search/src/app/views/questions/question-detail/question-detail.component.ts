import { Component, OnInit, Input } from '@angular/core';
import { Question } from 'src/app/services/question';
import { ActivatedRoute, Params } from '@angular/router';
import { QuestionsService } from '../../../services/questions.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-question-detail',
  templateUrl: './question-detail.component.html',
  styleUrls: ['./question-detail.component.scss']
})
export class QuestionDetailComponent implements OnInit {
   id_question: number;
   question: Question; 
  
  constructor(private rutaActiva: ActivatedRoute, private questionsSvc: QuestionsService) { 
      
  }

  ngOnInit() {
    this.id_question = this.rutaActiva.snapshot.params.id;
    debugger;
    this.questionsSvc.getById(this.id_question).subscribe(x => {
        this.question = x;
        debugger;
        console.log(this.question);
      });
    
   
  }

}
