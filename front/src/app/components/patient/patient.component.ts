import { Component, OnInit } from '@angular/core';
import {Patient,  Contact, Insurance, Visit, Record} from '../../models/data.model';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {
  patients: Patient[] = new Array<Patient>();
  patient: Patient = new Patient();
  constructor(
    private dataService: DataService,
     private router: Router,
     private socket: SocketService
     ) { }

  ngOnInit() {
  }
  addPatient(patient: Patient) {

    this.dataService.addPatient(patient).subscribe((newpatient: Patient) => {
      this.patient = new Patient();
      this.socket.io.emit('new patient', newpatient);
      this.router.navigate(['/information']);

   });
}
submitRecord() {
  // this.patient.folder.visits = new Visit();
  this.addPatient(this.patient);
  // this.patient = new Patient(new Personal(), new Contact(), new Insurance());

}
}
