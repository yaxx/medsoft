
import {DataService} from './services/data.service';
import { Component } from '@angular/core';
import {NgForm} from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  form: NgForm;
  title = 'spinr';
  sample: string;
}
