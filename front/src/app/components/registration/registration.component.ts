import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {ActivatedRoute,Router} from '@angular/router';
import {Person, Info} from '../../models/person.model';
import {Visit} from '../../models/record.model';
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
  loading = false;
  nowSorting = 'Date added';
  view = 'info';
  searchTerm = '';
  regMode =  'all';
  dpurl = 'http://localhost:5000/api/dp/';


  uploader: FileUploader = new FileUploader({url: ''});
  constructor(
    private dataService: DataService,
    private cookie: CookieService,
    private socket: SocketService,
    private route: ActivatedRoute,
    private router: Router
    ) { }

  ngOnInit() {
    this.getPatients();
  //   this.uploader.onBuildItemForm = (fileItem: any, form: any) => { form.append('patient', this.patient);

  // };
     this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any ) => {
     this.patient.info.personal.dpUrl = response;
     this.patient.record.visits.unshift(new Visit());
      this.dataService.addPerson(this.patient).subscribe((newpatient: Person) => {
        newpatient.card = {menu: false, view: 'front'};
        this.patients.unshift(newpatient);
      
        this.socket.io.emit('new patient', newpatient);
        this.loading = false;
     });
    };

  }
  getDp(p: Person) {
    return 'http://localhost:5000/api/dp/' + p.info.personal.dpUrl;
  }
  showSortMenu() {
    this.sortMenu = true;
  }
  getPatients() {
    let discharged;
    this.dataService.getPatients().subscribe((patients: Person[]) => {
      discharged = patients.filter(patient=>patient.record.visits[0].status === 'discharged');
      discharged.forEach(p => {
        p.card = {menu: false, view: 'front'};
      });
      this.patients = discharged;
      this.dataService.setCachedPatients(discharged);
    });
  }
  fileSelected(event) {
    if (event.target.files && event.target.files[0]) {
      this.file = <File>event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (e) => { 
        let evnt = <any>e;
        this.url = evnt.target.result;
      };
    }

  }
  switchToBack(i: number) {
    this.patients[i].card.view = 'back';
  }
  switchToFront(i: number){
    this.patients[i].card.view = 'front';
  }
  selectPatient(i: number) {
    this.info = this.patients[i].info;
  }
  // addPatient(patient: Person) {
  //     this.dataService.addPerson(patient).subscribe((newpatient: Person) => {
  //       this.patients.unshift(patient);
  //       this.socket.io.emit('newPerson', newpatient);
  //    });
  // }
  goTo(location,e){
    e.preventDefault()
    this.router.navigate([location],{relativeTo: this.route});

  }
  submitRecord() {
    this.loading = true;
    this.patient.info = this.info;
      this.uploader.uploadAll();
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
        // this.patients.sort((m, n) => m.record.visits[m.record.visits.length-1].status.localeCompare(m.record.visits[n.record.visits.length-1].status.localeCompare));
        // this.nowSorting = 'Status';
        // break;
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





