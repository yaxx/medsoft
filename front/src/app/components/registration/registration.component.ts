import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {Patient, Personal, Contact, Insurance, Visit, Record} from '../../models/data.model';
import {CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  form: NgForm;
  personal: Personal = new Personal();
  patients: Patient[] = new Array<Patient>();
  patient: Patient = new Patient(new Personal(), new Contact(), new Insurance(), new Record());
  view = '';
  regMode =  'all';
  constructor(private dataService: DataService, private cookie: CookieService, private socket: SocketService) { }

  ngOnInit() {

    this.getPatients();
    // this.socket.io.emit('hello', {});
  }
  getPatients() {
    this.dataService.getPatients().subscribe((patients: Patient[]) => {
      this.patients = patients;
    });
  }

  addPatient(patient: Patient) {

      this.dataService.addPatient(patient).subscribe((newpatient: Patient) => {
        this.patients.push(newpatient);
        this.socket.io.emit('new patient', newpatient);
     });
  }
  submitRecord() {
    this.patient.record.visits = new Visit();
    this.addPatient(this.patient);
    // this.patient = new Patient(new Personal(), new Contact(), new Insurance());

  }
  switchViews() {
    if (this.view === 'details') {
       this.view = '';
    } else {
      this.view = 'details';
    }
  }
}





