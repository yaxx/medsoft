import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {Patient, Info} from '../../models/data.model';
import {CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  form: NgForm;
  // personal: Personal = new Personal();
  patients: Patient[] = new Array<Patient>();
  patient: Patient = new Patient();
  file: File = null;
  info: Info = new Info();
  url = '';
  view = 'info';
  regMode =  'all';
  constructor(
    private dataService: DataService,
    private cookie: CookieService,
    private socket: SocketService
    ) { }

  ngOnInit() {
    this.getPatients();
    // this.socket.io.emit('hello', {});
  }
  getPatients() {
    this.dataService.getPatients().subscribe((patients: Patient[]) => {
      this.patients = patients;
    });
  }
  fileSelected(event) {
    if (event.target.files && event.target.files[0]) {
      this.file = <File>event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (e) => { // called once readAsDataURL is completed
        this.url = e.target.result;
      }
    }

  }
  addPatient(patient: Patient) {
      this.dataService.addPatient(patient).subscribe((newpatient: Patient) => {
        this.patients.push(newpatient);
        // this.socket.io.emit('new patient', newpatient);
     });
  }
  submitRecord() {
    this.patient.info = this.info;
      this.dataService.addPatient(this.patient).subscribe((newpatient: Patient) => {
      this.patients.push(newpatient);
      // this.socket.io.emit('new patient', newpatient);
   });
  }
  switchViews() {
    if (this.view === 'details') {
       this.view = '';
    } else {
      this.view = 'details';
    }
  }
}





