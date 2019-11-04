import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {ActivatedRoute, Router} from '@angular/router';
import * as cloneDeep from 'lodash/cloneDeep';
import {Person, Info} from '../../models/person.model';
import {PersonUtil} from '../../util/person.util';
import {states, lgas } from '../../data/states';
import { Item, StockInfo, Product, Card, Invoice, Meta} from '../../models/inventory.model';
import {Visit, Session} from '../../models/record.model';
import {Client, Department} from '../../models/client.model';
import {CookieService } from 'ngx-cookie-service';
// const uri = 'http://192.168.1.100:5000/api/upload';
const uri = 'http://localhost:5000/api/upload';
// const uri = 'http://18.221.76.96:5000/api/upload';
 @Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  form: NgForm;
  patients: Person[] = [];
  clonedPatients: Person[] = [];
  clonedPatient: Person = new Person();
  patient: Person = new Person();
  products: Product[] = [];
  client: Client = new Client();
  file: File = null;
  states = states;
  lgas = lgas;
  info: Info = new Info();
  visit: Visit = new Visit();
  card: Card = new Card();
  reg = true;
  url = '';
  curIndex = 0;
  session: Session = new Session();
  message = null;
  feedback = null;
  cardTypes = [];
  processing = false;
  sortBy = 'added';
  sortMenu = false;
  loading = false;
  count = 0;
  creating = false;
  nowSorting = 'Date added';
  view = 'info';
  searchTerm = '';
  // dpurl = 'http://192.168.1.100:5000/api/dp/';
  dpurl = 'http://localhost:5000/api/dp/';
  // dpurl = 'http://192.168.1.100:5000/api/dp/';

  uploader: FileUploader = new FileUploader({url: uri});
  constructor(
    private dataService: DataService,
    private cookies: CookieService,
    private socket: SocketService,
    private route: ActivatedRoute,
    private router: Router,
    public psn: PersonUtil
    ) { }

  ngOnInit() {
    this.getPatients('out');
    this.getClient();
  //   this.socket.io.on('consulted', (patient: Person) => {
  //     const i = this.patients.findIndex(p => p._id === patient._id);
  //     if(patient.record.visits[0][0].status === 'out') {
  //       this.patients.unshift(patient);
  //       this.clonedPatients.unshift(patient);
  //     }
  // });
  //   this.socket.io.on('enroled', (patient: Person) => {
  //     this.patients.unshift(patient);
  //     this.clonedPatients.unshift(patient);
  // });
  
  }
  routeHas(path) {
    return this.router.url.includes(path);
  }
  getDp(avatar: String) {
    // return 'http://192.168.1.100:5000/api/dp/' + avatar;
    return 'http://localhost/api/dp/' + avatar;
    // return 'http://localhost:5000/api/dp/' + avatar;
  }
  toggleSortMenu() {
    this.sortMenu = !this.sortMenu;
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  getDept() {
    return this.client.departments.filter(d => d.hasWard);
  }
  refresh() {
    this.message = null;
    this.getPatients('out');
  }

  getClient() {
    this.dataService.getClient().subscribe((res: any) => {
      this.client = res.client;
      this.products = res.client.inventory;
      this.cardTypes = res.client.inventory.filter(p => p.type === 'Cards');
      this.session.items = res.items;
  });
  }

  getPatients(type) {
    this.loading = true;
    this.dataService.getPatients(type).subscribe((patients: Person[]) => {
      if(patients.length) {
        patients.forEach(p => {
          p.card = {menu: false, view: 'front'};
        });
        this.patients   = patients;
        this.clonedPatients  = patients;
        this.loading = false;
        this.message = null;
      } else {
          this.message = 'No Records So Far';
          this.loading = false;
      }
    }, (e) => {
      this.message = 'Something went wrong';
      this.loading = false;
    });
  }

  
  enrolePatient()  {
   
  }
  // fileSelected(event) {
  //   if (event.target.files && event.target.files[0]) {
  //     this.file = <File>event.target.files[0];
  //     const reader = new FileReader();
  //     reader.readAsDataURL(event.target.files[0]); // read file as data url
  //     reader.onload = (e) => {
  //       let evnt = <any>e;
  //       this.url = evnt.target.result;
  //     };
  //   }

  // }
  switchToBack(i: number) {
    this.patients[i].card.view = 'back';
  }
  switchToFront(i: number){
    this.patients[i].card.view = 'front';
  }
  selectPatient(i: number) {
    this.curIndex = i;
    this.clonedPatient = cloneDeep(this.patients[i]);
    this.patient = this.patients[i];
  }
  switchViews() {
    if (this.view === 'details') {
       this.view = '';
    } else {
      this.view = 'details';
    }
  }
  searchPatient(name:string) {
   if(name !== ''){
    this.patients = this.patients.filter((patient) => {
      const patern =  new RegExp('\^' + name
      , 'i');
      return patern.test(patient.info.personal.firstName);
      });
   } else {
     this.patients = this.clonedPatients;
   }

  }
  countVisits(i) {
    let count = [];
    this.patients[i].record.visits.map(vs => vs.map(v => {
    if (v.status === 'out') {
      count.push(v);
    }
  }))
  return count;
}
isInfo() {
  return this.router.url.includes('information');
}
  getMe() {
    return this.cookies.get('a');
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
    
        case 'age':
        this.patients.sort((m, n) => new Date(m.info.personal.dob).getFullYear() - new Date(n.info.personal.dob).getFullYear());
        this.nowSorting = 'Age';
        break;
      case 'date':
        this.patients.sort((m, n) => new Date(n.createdAt).getTime() - new Date(m.createdAt).getTime());
        this.nowSorting = 'Date added';
        break;
        default:
        break;
    }
  }


  next() {
    this.count = this.count + 1;
  }
  prev() {
    this.count = this.count - 1;
  }
   // validWithoutCard() {
  //   return (this.patient.info.personal.firstName) &&
  //    (this.patient.info.personal.lastName) && 
  //    (this.patient.info.personal.dob)
  // }
  // validWithCard() {
  //   return (this.patient.info.personal.firstName) &&
  //    (this.patient.info.personal.lastName) && 
  //    (this.patient.info.personal.dob) && 
  //    (this.card.cardNum);
  // }
  viewDetails(i) {
    this.psn.reg = false;
    this.curIndex = i;
    this.count = 0;
    this.psn.card = cloneDeep(this.patients[i].record.cards[0]);
    this.psn.person = cloneDeep(this.patients[i]);
    console.log(this.psn.person);
    
  }
  
  clearPatient() {
  this.count = 0;
  this.psn.reg = true;
  this.psn.card = new Card();
  this.psn.person = new Person();
}

  addRecord() {
    this.creating = true;
    // this.addInitials();
    this.dataService.addPerson(this.patient).subscribe((newpatient: Person) => {
      newpatient.card = {menu: false, view: 'front'};
      this.patients.unshift(newpatient);
      this.socket.io.emit('consulted', newpatient);
      this.patient = new Person();
      this.card = new Card();
      this.creating = false;
      this.feedback = 'Patient added successfully';
      setTimeout(() => {
        this.feedback = null;
      }, 4000);
 }, (e) => {
   this.feedback = 'Unbale to add patient';
   this.creating = false;
 });
}

updateInfo() {
 let info = this.psn.updateInfo();
 if(info) {
   this.patients[this.curIndex].info = info;
 }
}
createRecord() {
    if (this.reg) {
      if (this.url) {
        this.uploader.uploadAll();
        this.addRecord();
    } else {
    this.addRecord();
    }
  } else {
    this.updateInfo();
  }

}





}





