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
 temPatients: Person[] = new Array<Person>();
 patient: Person = new Person();
  file: File = null;
  info: Info = new Info();
  url = '';
  sortBy = 'added';
  sortMenu = false;
  nowSorting = 'Date added'
  view = 'info';
  searchTerm = '';
  regMode =  'all';
  dpurl = 'http://localhost:5000/api/dp/';


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
     this.patient.info.personal.dpUrl = response;
      this.dataService.addPatient(this.patient).subscribe((newpatient: Person) => {
        this.patients.push(newpatient);
        this.socket.io.emit('newPerson', newpatient);
     });
    };
    // this.socket.io.emit('hello', {});
  }
  getDp(p: Person) {
    return 'http://localhost:5000/api/dp/' + p.info.personal.dpUrl;
  }
  showSortMenu() {
    this.sortMenu = true;
  }
  getPatients() {
    this.dataService.getPatients().subscribe((patients: Person[]) => {
      patients.forEach(p => {
        p.card = {menu: false, view: 'front'};
      });
      this.patients = patients.reverse();
      this.temPatients = patients.reverse();
    });
  }
  fileSelected(event) {
    if (event.target.files && event.target.files[0]) {
      this.file = <File>event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (e) => { // called once readAsDataURL is completed
        this.url = e.target.result;
      };
    }

  }
  switchToBack(i) {
    this.patients[i].card.view = 'back';
  }
  switchToFront(i){
    this.patients[i].card.view = 'front';
  }
  selectPatient(i){
    this.info = this.patients[i].info;
  }
  addPatient(patient: Person) {
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
  searchPatient(name:string) {
   if(name!==''){
    this.patients = this.patients.filter((patient) => {
      const patern =  new RegExp('\^' + name
      , 'i');
      return patern.test(patient.info.personal.firstName);
      });
   } else {
     this.patients = this.temPatients;
   }


  }


  sortPatients(sortOption: string) {
    this.sortMenu = false;
    switch (sortOption) {
      case 'name':
        this.patients.sort((m: Person, n: Person) => m.info.personal.firstName.localeCompare(n.info.personal.firstName));
        this.nowSorting = 'A-Z';
        break;
      case 'sex':
        this.patients.sort((m: Person, n: Person) => n.info.personal.gender.localeCompare(m.info.personal.gender));
        this.nowSorting = 'Gender';
        break;
      case 'status':
        this.patients.sort((m, n) => m.record.visits[m.record.visits.length-1].status.localeCompare(m.record.visits[n.record.visits.length-1].status.localeCompare));
        this.nowSorting = 'Status';
        break;
        case 'age':
        this.patients.sort((m, n) => new Date(m.info.personal.dob).getFullYear() - new Date(n.info.personal.dob).getFullYear());

        this.nowSorting = 'Age';
        break;
      case 'date':
        this.patients.sort((m, n) => new Date(n.dateCreated).getTime() - new Date(m.dateCreated).getTime());
        this.nowSorting = 'Date added';
        break;

        default:
        break;
    }
  }
}





