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
// const uri = 'http://192.168.1.101:5000/api/upload';
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
  successMsg = null;
  errorMsg = null;
  errLine = null;
  cardTypes = [];
  processing = false;
  sortBy = 'added';
  cardCount = null;
  sortMenu = false;
  loading = false;
  count = 0;
  creating = false;
  nowSorting = 'Date added';
  view = 'info';
  searchTerm = '';
  // dpurl = 'http://localhost:5000/api/dp/';
  dpurl = 'http://192.168.1.101:5000/api/dp/';
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
    this.socket.io.on('new patient', (patient: Person) => {
      console.log(patient);
      this.patients.unshift(patient);
    });
    this.socket.io.on('card payment', (patient: Person) => {
      console.log(patient);
      this.patients.splice(this.patients.findIndex(p => p._id === patient._id) , 1);
    });
    this.socket.io.on('discharge', (patient: Person) => {
      patient.card = {menu: false, view: 'front'};
      this.patients.unshift(patient);
    });
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
  toggleAddOption(option: number) {
    this.psn.addOption = option;
  }
  routeHas(path) {
    return this.router.url.includes(path);
  }
  switchCardView(i , view) {
    this.curIndex = i;
    this.cardCount = view;
    this.patients[i].card.view = view;
    this.patient = cloneDeep(this.patients[i]);
    this.card = this.patient.record.cards[0] || new Card();
  }
  getStyle() {
    // const  style1 = {
    //   color: 'doggerblue',
    //   borderBottom: '1px solid doggerblue'
    // };
    // const  style2 = {
    //   color: 'lightgrey',
    //   borderBottom: '1px solid lightgrey',
    //   cursor: 'pointer'
    // };
    // return (this.addOption) ? style1 : style2;
  }
  getDp(avatar: String) {
    // return 'http://192.168.1.101:5000/api/dp/' + avatar;
    return 'http://localhost:5000/api/dp/' + avatar;
  }
  toggleSortMenu() {
    this.sortMenu = !this.sortMenu;
  }
  getRefDept() {
    return this.client.departments.filter(dept => dept.hasWard);
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
      if (patients.length) {
        patients.forEach(p => {
          p.card = {menu: false, view: 'front'};
        });
        this.patients   = patients.sort((m, n) => new Date(n.createdAt).getTime() - new Date(m.createdAt).getTime());
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
  showMenu(i: number) {
    this.hideMenu();
    this.patients[i].card.menu = true;
  }
  hideMenu() {
    this.patients.forEach(p => {
      p.card.menu =  false;
    });
  }

  enrolePatient(i: number)  {
    this.processing = true;
    this.patients[this.curIndex].record.visits.unshift({...this.visit, status: 'queued'});
    this.dataService.updateRecord(this.patients[this.curIndex]).subscribe((patient) => {
    this.successMsg = 'Patient Enroled';
    this.processing = false;
    this.socket.io.emit('enroled', patient);
    setTimeout(() => {
      this.successMsg = null;
    }, 3000);
    setTimeout(() => {
      this.switchCardView(i, 'front');
    }, 6000);
    setTimeout(() => {
     this.patients.splice(i , 1);
    }, 9000);
   }, (e) => {
    this.errLine = 'Unable to Enroled';
   });
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
  addRecord() {
    this.psn.creating = true;
    (this.psn.addOption === 1) ? this.psn.addInitials() : this.psn.addDefaults();
    this.dataService.addPerson(this.psn.person).subscribe((newPerson: Person) => {
        newPerson.card = {menu: false, view: 'front'};
        this.socket.io.emit('new patient', newPerson);
        this.patients.unshift(newPerson);
        this.psn.card = new Card();
        this.psn.creating = false;
        this.psn.successMsg = 'Patient added successfully';
        this.psn.person = new Person();
        setTimeout(() => {
        this.psn.successMsg = null;
        }, 4000);
    }, (e) => {
        this.psn.errorMsg = 'Unbale to add patient';
        this.creating = false;
    });
    // console.log(this.person);
}
  switchToBack(i: number) {
    this.patients[i].card.view = 'back';
  }
  switchToFront(i: number) {
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
  searchPatient(name: string) {
   if (name !== '') {
    this.patients = this.patients.filter((patient) => {
      const patern =  new RegExp('\^' + name  , 'i');
      return patern.test(patient.info.personal.firstName);
      });
   } else {
     this.patients = this.clonedPatients;
   }

  }
  countVisits(i) {
    const count = [];
    this.patients[i].record.visits.map(vs => vs.map(v => {
    if (v.status === 'out') {
      count.push(v);
    }
  }));
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
    this.psn.card = cloneDeep(this.patients[i].record.cards[0] || new Card());
    this.psn.person = cloneDeep(this.patients[i]);
  }
  clearPatient() {
    this.count = 0;
    this.psn.reg = true;
    this.psn.card = new Card();
    this.psn.person = new Person();
}
checkCard() {
  if (this.patient.record.cards.length) {
      if (this.patient.record.cards[0].pin) {
          this.patient.record.cards.unshift(this.card);
          this.patient.record.visits.unshift([new Visit()]);
          this.patient.record.invoices.unshift([{
              ...new Invoice(),
              name: 'Card',
              desc: this.card.category,
              processed: true,
              meta: new Meta(this.cookies.get('i'))
          }]);
      } else {
          this.patient.record.cards[0] = this.card;
          this.patient.record.visits[0] = [new Visit()];
          this.patient.record.invoices[0] = [{
              ...new Invoice(),
              name: 'Card',
              desc: this.card.category,
              processed: true,
              meta: new Meta(this.cookies.get('i'))
          }];
      }
  } else {
      this.patient.record.cards.push(this.card);
      this.patient.record.visits[0] = [new Visit()];
      this.patient.record.invoices.push([{
          ...new Invoice(),
          name: 'Card',
          desc: this.card.category,
          processed: true,
          meta: new Meta(this.cookies.get('i'))
      }]);
  }
}
addCard() {
  this.checkCard();
  this.processing = true;
  this.dataService.updateRecord(this.patient).subscribe((patient) => {
    this.successMsg = 'Card added successfully';
    this.processing = false;
    this.socket.io.emit('enroled', patient);
    setTimeout(() => {
      this.successMsg = null;
    }, 3000);
    setTimeout(() => {
      this.switchCardView(this.curIndex, 'front');
    }, 6000);

   }, (e) => {
    this.errorMsg = 'Unable to add card';
   });
}

//   addRecord() {
//  this.psn.addRecord();
//    console.log(this.psn.person);
   

//     if(this.psn.person._id) {
     
//       this.patients.unshift(this.psn.person);
//       this.psn.person = new Person();
//     }
// }

updateInfo() {
 const info = this.psn.updateInfo();
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





