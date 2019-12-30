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
import {host} from '../../util/url';
const uri = `${host}/api/upload`;
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
  updating  = false;
  creating = false;
  person: Person = new Person();
  info: Info = new Info();
  visit: Visit = new Visit();
  card: Card = new Card();
  reg = true;
  url = '';
  logout = false;
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

  nowSorting = 'Date added';
  view = 'info';
  pin = null;
  searchTerm = '';
  dpurl = `${host}/api/dp/`;
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
    this.socket.io.on('record update', (update) => {
      const i = this.patients.findIndex(p => p._id === update.patient._id);
      switch (update.action) {
        case 'payment':
          if (i !== -1 ) {
            this.patients.splice(i, 1);
            this.message = ( this.patients.length) ? null : 'No Record So Far';
          }
          break;
        case 'enroled':
          if (i !== -1 ) {
            this.patients.splice(i, 1);
            this.message = ( this.patients.length) ? null : 'No Record So Far';
          }
          break;
        case 'disposition':
          if (update.patient.record.visits[0][0].status === 'out' ) {
            this.patients.unshift({ ...update.patient, card: { menu: false, view: 'front', indicate: true } });
          }
          break;
        default:
          break;
      }
    });
  }
 
  routeHas(path) {
    return this.router.url.includes(path);
  }
  switchCardView(i , view) {
    this.patients[this.curIndex].card.view = 'front';
    this.curIndex = i;
    this.cardCount = view;
    this.patients[i].card.view = view;
    this.patient = cloneDeep(this.patients[i]);
    this.card = this.patient.record.cards[0] || new Card();
  }
  getDp(avatar: String) {
    return `${host}/api/dp/${avatar}`;
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
  logOut() {
    this.dataService.logOut();
  }
  showLogOut() {
    this.logout = true;
  }
  hideLogOut() {
    this.logout = false;
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
      this.cardTypes = res.client.inventory.filter(p => p.type === 'Cards'
      );
      const distincts = [];
      ['Standard', 'Premium', 'Exclusive', 'Family']
      .forEach((name) => {
        if (this.cardTypes.some(cd => cd.item.name === name)) {
          distincts.push(name);
        }
      });
      this.cardTypes = distincts;
      this.session.items = res.items;
    });
  }
  withoutCard() {
    return (this.person.info.personal.firstName) &&
    (this.person.info.personal.lastName) &&
    (this.person.info.personal.dob);
}
  isValidInfo() {
    return this.withoutCard();
  }
  isValidContact() {
      return (this.person.info.contact.emergency.mobile);
  }
  addDefaults() {
    this.person.record.visits = [[new Visit()]];
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
  isInvalidForm() {
    return !(this.isValidInfo());
  }
  enrolePatient(i: number)  {
    if (this.patient.record.cards.some(card => card.pin === this.pin)) {
      this.processing = true;
      const product = this.products.find(p => p.item.name === 'Consultation');
      if (product) {
        this.patient.record.invoices.unshift([{
          ...new Invoice(),
          name: 'Consultation',
          price: product.stockInfo.price,
          desc: 'Consultation fee',
          processed: true,
          meta: new Meta(this.cookies.get('i'))
      }]);
      this.patient.record.visits.unshift([
        this.visit
      ]);
      } else {
        this.patient.record.visits.unshift([{
          ...this.visit, status: 'queued'
        }]);
      }
      this.dataService.updateRecord(this.patient).subscribe((patient) => {
      this.successMsg = 'Patient Successfully Enroled';
      this.processing = false;
      this.socket.io.emit('record update', {action: 'enroled', patient: patient});
      setTimeout(() => {
        this.successMsg = null;
      }, 3000);
      setTimeout(() => {
        this.switchCardView(i, 'front');
      }, 6000);
    }, (e) => {
     this.processing = false;
     this.errorMsg = 'Unable to Enroled Patient';
   });
  } else {
    this.errorMsg = 'Invalid Card Number';
  }
  }
  clearError() {
    this.errorMsg = null;
  }
  addRecord() {
    if (!this.errorMsg) {
        this.addDefaults();
    }
    this.errorMsg = null;
    this.creating = true;
    this.dataService.addPerson(this.person).subscribe((newPerson: Person) => {
        newPerson.card = {menu: false, view: 'front'};
        this.patients.unshift(newPerson);
        this.card = new Card();
        this.creating = false;
        this.successMsg = 'Patient added successfully';
        this.person = new Person();
        setTimeout(() => {
        this.successMsg = null;
        }, 3000);
    }, (e) => {
        this.errorMsg = 'Unbale to add patient';
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
  getLgas() {
    return this.lgas[this.states.indexOf(this.person.info.contact.me.state)];
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
isWard() {
  return this.router.url.includes('ward');
}
isAdmin() {
  return this.router.url.includes('admin');
}
isConsult() {
  return !this.router.url.includes('information') &&
  !this.router.url.includes('pharmacy') &&
  !this.router.url.includes('billing') &&
  !this.router.url.includes('ward') &&
  !this.router.url.includes('admin');
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
chargeForConsultation() {
  const product = this.products.find(p => p.item.name === 'Consultation');
      if (product) {
        this.patient.record.invoices.unshift([{
          ...new Invoice(),
          name: 'Consultation',
          price: product.stockInfo.price,
          desc: 'Consultation fee',
          processed: true,
          meta: new Meta(this.cookies.get('i'))
      }]);
      this.patient.record.visits.unshift([
        this.visit
      ]);
      } else {
        this.patient.record.visits.unshift([{
          ...this.visit, status: 'queued'
        }]);
      }
}
chargeForCard() {
    this.patient.record.invoices.unshift([{
      ...new Invoice(),
      name: 'Card',
      desc: this.card.category,
      processed: true,
      meta: new Meta(this.cookies.get('i'))
  }]);
}
analyseCard() {
  if (this.card.pin) {
    const card = this.products.find(p => p.item.description === this.card.pin);
    if (card && card.item.name === this.card.category && card.item.description === this.card.pin && !card.stockInfo.status) {
      this.patient.record.cards.unshift(this.card);
      this.chargeForConsultation();
    } else {
      this.errorMsg = 'Invalid Card Number';
    }
  } else {
    // this.patient.record.visits.unshift([
    //   this.visit
    // ]);
    this.chargeForCard();
    this.patient.record.cards.unshift(this.card);
  }
}
addCard() {
  this.analyseCard();
  if (!this.errorMsg) {
    this.processing = true;
    this.dataService.updateRecord(this.patient).subscribe((patient) => {
    this.successMsg = 'Card added successfully';
    this.processing = false;
    this.socket.io.emit('record update', {action: 'enroled', patient: patient});
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

}
clearPin() {
  this.card.pin = null;
}

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





