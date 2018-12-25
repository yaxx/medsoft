import { Component, OnInit } from '@angular/core';
import { Patient} from '../../models/data.model';
import {DataService} from '../../services/data.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  patient: any = new Patient();
  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.patient = this.dataService.getCachedPatient(this.route.snapshot.params['id']);
    

  }
showDetails(e) {
  e.preventDefault();
  this.patient.record.notes[0].full = true;
}

// getPatient(): Patient {
//    return this.dataService.getCachedPatients(this.route.snapshot.params['id'])
// }
}

