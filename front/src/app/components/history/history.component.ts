import { Component, OnInit } from '@angular/core';
import { Person} from '../../models/data.model';
import {DataService} from '../../services/data.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  patient: Person = new Person();
  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.patient = this.dataService.getCachedPatient(this.route.snapshot.params['id']);


  }
  getDp(p: Person){
    return 'http://localhost:5000/api/dp/' + p.info.personal.dpUrl;
  }
  showDetails(e) {
  e.preventDefault();
  this.patient.record.notes[0].full = true;
}

// getPatient(): Patient {
//    return this.dataService.getCachedPatients(this.route.snapshot.params['id'])
// }
}

