import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {Person, Info} from '../../models/data.model';
import {CookieService } from 'ngx-cookie-service';
const uri = 'http://localhost:5000/api/upload';
 @Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  form: NgForm;
  // personal: Personal = new Personal();
 patients: Person[] = new Array<Person>();
 patient:Person = new Person();
  file: File = null;
  info: Info = new Info();
  url = '';
  view = 'info';
  regMode =  'all';
  dpurl = 'http://localhost:5000/uploads/aa.jpg';

  uploader: FileUploader = new FileUploader({url: uri});
  constructor(
    private dataService: DataService,
    private cookie: CookieService,
    private socket: SocketService
    ) { }

  ngOnInit() {
    this.getPatients();
  //   this.uploader.onBuildItemForm = (fileItem: any, form: any) => { form.append('patient', this.patient);

  // };
     this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any ) => {
     console.log(response);
     this.patient.info.personal.dpUrl = response;
      this.dataService.addPatient(this.patient).subscribe((newpatient:Person) => {
        this.patients.push(newpatient);
        this.socket.io.emit('newPerson', newpatient);
     });
    };
    // this.socket.io.emit('hello', {});
  }
  getPatients() {
    this.dataService.getPatients().subscribe((patients: Person[]) => {
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
  addPatient(patient:Person) {
      this.dataService.addPatient(patient).subscribe((newpatient: Person) => {
        this.patients.push(patient);
        this.socket.io.emit('newPerson', newpatient);
     });
  }
  submitRecord() {
    this.patient.info = this.info;
    // let form = new FormData();
    // form.append('patient', this.patient);
    // form.append('file', this.file);
    // console.log(form);

    // this.uploader.queue[0].formData.append('patient', this.patient);

    this.uploader.uploadAll();

    // this.dataService.addPatient(this.patient).subscribe((patient:Person) => {
    //   this.patients.push(patient);
    //   this.socket.io.emit('newPerson', newpatient);
  }
  switchViews() {
    if (this.view === 'details') {
       this.view = '';
    } else {
      this.view = 'details';
    }
  }
}





