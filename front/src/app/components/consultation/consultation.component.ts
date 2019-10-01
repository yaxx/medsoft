import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import * as cloneDeep from 'lodash/cloneDeep';
import {CookieService} from 'ngx-cookie-service';
import {ActivatedRoute, Router} from '@angular/router';
import {Person, Info} from '../../models/person.model';
import {states, lgas } from '../../data/states';
import {Tests, Scannings, Surgeries} from '../../data/request';
import {Client, Department} from '../../models/client.model';
import {Conditions} from '../../data/conditions';
import { Item, StockInfo, Product, Card, Invoice} from '../../models/inventory.model';
import {Subject} from 'rxjs';
import {Observable} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import { Record, Medication, Condition, Note, Visit, Session, Test, Surgery, Scan, Complain, Meta} from '../../models/record.model';
const uri = 'http://localhost:5000/api/upload';
// const uri = 'http://192.168.1.100:5000/api/upload';
@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.css']
})
export class ConsultationComponent implements OnInit {
  states = states;
  lgas = lgas;
  tests = Tests;
  scannings = Scannings;
  surgeries = Surgeries;
  conditions = Conditions;
  patient: Person = new Person();
  patients: Person[] = [];
  products: Product[] = [];
  clonedPatient: Person = new Person();
  clonedPatients: Person[] = [];
  record: Record = new Record();
  card: Card = new Card();
  cardTypes = [];
  client: Client = new Client();
  department: Department = new Department();
  session: Session = new Session();
  curIndex = 0;
  searchTerm = '';
  medicView = false;
  selectedProducts: Product[] = [];
  input = '';
  in = 'discharge';
  loading  = false;
  processing  = false;
  feedback = null;
  reg = true;
  sortBy = 'added';
  sortMenu = false;
  message = null;
  showPhotoMenu = false;
  nowSorting = 'Date added';
  myDepartment = null;
  errLine = null;
  showWebcam = false;
  errors: WebcamInitError[] = [];
  webcamImage: WebcamImage = null;
  count = -1;
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();
  url = null;
  file: File = null;
  uploader: FileUploader = new FileUploader({url: uri});
  constructor(
     private dataService: DataService,
     private route: ActivatedRoute,
     private router: Router,
     private cookies: CookieService,
     private socket: SocketService ) {}


  ngOnInit() {
   this.getPatients('queued');
   this.getClient();
   this.myDepartment = this.route.snapshot.params['dept'];
    this.socket.io.on('enroled', (patient: Person) => {
      if (patient.record.visits[0][0].dept.toLowerCase() === this.myDepartment || this.route.snapshot.params['admin']) {
        patient.card = {view: 'front', menu: false};
        this.patients.unshift(patient);
      }
  });
  this.socket.io.on('store update', (data) => {
    if (data.action === 'new') {
      this.products.concat(data.changes);
    } else if (data.action === 'update') {
        for (const product of data.changes) {
            this.products[this.products.findIndex(prod => prod._id === product._id)] = product;
          }
    } else {
        for (const product of data.changes) {
          this.products.splice(this.products.findIndex(prod => prod._id === product._id) , 1);
        }
    }
  });
  this.socket.io.on('consulted', (patient: Person) => {
    const i = this.patients.findIndex(p => p._id === patient._id);
      if (this.myDepartment) {
         if (i < 0) {
           this.patients.unshift(patient);
         } else {
           this.patients.splice(i, 1);
         }
      } else if (patient.record.visits[0][0].status === 'queued') {
        this.patients[i] = patient;
      } else {
        this.patients.splice(i, 1);
      }
  });
  this.socket.io.on('Discharge', (patient: Person) => {
    const i = this.patients.findIndex(p => p._id === patient._id);
      if (patient.record.visits[0][0].dept.toLowerCase() === this.myDepartment ) {
         if (i < 0) {
         } else {
           this.patients.splice(i, 1);
         }
      } else {
         this.patients.splice(i, 1);
      }
  });
  // this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any ) => {
  //   this.patient.info.personal.avatar = response;
  //  };
  this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any ) => {
        this.patient.info.personal.avatar = response;
        this.update();
        //  this.data.updateInfo(this.person.info, this.person._id).subscribe((info: Info) => {
        //    this.person.info = info;
        // });
       };

  }
  isConsult() {
    return this.router.url.includes('consultation') && !(this.router.url.includes('information') || this.router.url.includes('admin'));
  }
 isInfo() {
    return this.router.url.includes('information');
  }
  // tslint:disable-next-line:one-line
  showDetails(i: number){
    this.patient = cloneDeep(this.patients[i]);
    this.reg = false;
    this.curIndex = i;
  }
  refresh() {
   this.message = null;
   this.getPatients('queued');
   this.getClient();
  }
  getLgas() {
    return this.lgas[this.states.indexOf(this.patient.info.contact.me.state)];
  }

  routeHas(path) {
    return this.router.url.includes(path);
  }
  // triggerSnapshot(): void {
  //   this.trigger.next();
  // }

  toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }
   public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }
  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }
  togglePhotoMenu() {
    this.showPhotoMenu = !this.showPhotoMenu;
  }
  public handleImage(webcamImage: WebcamImage): void {
     this.webcamImage = webcamImage;
  }
   public triggerSnapshot(): void {
    this.trigger.next();
    this.toggleWebcam();
  }
  addInitials() {
     this.patient.record.cards.unshift({
      ...this.card,
      meta: new Meta(this.cookies.get('i'))
    });
    this.patient.record.invoices.unshift({
      ...new Invoice(),
      name: 'Card',
      desc: this.card.category,
      meta: new Meta(this.cookies.get('i'))
    });
    this.patient.record.visits.unshift([new Visit()]);
  }
  addRecord() {
    this.addInitials();
    this.dataService.addPerson(this.patient).subscribe((newpatient: Person) => {
      newpatient.card = {menu: false, view: 'front'};
      this.patients.unshift(newpatient);
      this.socket.io.emit('consulted', newpatient);
      this.patient = new Person();
      this.card = new Card();
      this.url = null;
      this.processing = false;
      this.feedback = 'Patient added successfully';
      setTimeout(() => {
        this.feedback = null;
      }, 4000);
 }, (e) => {
   this.feedback = 'Unbale to add patient';
   this.processing = false;
 });
}
update() {
  this.dataService.updateInfo(this.patient.info, this.patient._id).subscribe((info: Info) => {
    this.processing = false;
    this.patients[this.curIndex].info = info;
    this.feedback = 'Update successfull';
    this.patient = new Person();
    this.url = null;
    setTimeout(() => {
      this.feedback = null;
    }, 4000);
  }, (e) => {
    this.feedback = 'Unbale to update info';
    this.processing = false;
  });
}
updateInfo() {
  if (!this.url) {
     this.update();
  } else {
      this.uploader.uploadAll();
      // this.update();
    }
}
submitInfo() {
  this.processing = true;
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
 getClient() {
    this.dataService.getClient().subscribe((res: any) => {
      this.client = res.client;
      this.products = res.client.inventory;
      this.cardTypes = res.client.inventory.filter(p => p.type === 'Cards');
      this.session.items = res.items;
  });
  }
  fileSelected(event) {
    if (event.target.files && event.target.files[0]) {
      this.file = <File>event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (e) => {
        const evnt = <any>e;
        this.url = evnt.target.result;
      };
    }

  }
editInfo(i: number) {
  this.patient = cloneDeep(this.patients[i]);
  this.reg = false;
  this.curIndex = i;
  // this.url = this.patient.info.personal.avatar
}
clearPatient() {
  this.reg = true;
  this.patient = new Person();
}


getDp(avatar: String) {
  return 'http://localhost:5000/api/dp/' + avatar || '../assets/img/avatar.jpg';
    // return 'http://192.168.1.100:5000/api/dp/' + avatar;
  }

  getDescriptions() {
    switch (this.session.reqItem.category) {
      case 'Surgery':
      this.session.desc = this.surgeries;
      break;
    case 'Scanning':
      this.session.desc  = this.scannings;
      break;
    case 'Test':
      this.session.desc  = this.tests;
      break;
      default:
      break;
    }
}
next(){
  this.count = this.count+1;
}
prev(){
  this.count = this.count-1;
}
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  fetchDept() {
      return this.client.departments
      .filter(dept => (dept.hasWard) && (dept.name !== this.patient.record.visits[0][0].dept));
  }
  setAppointment() {
    this.patients[this.curIndex].record.appointments.unshift(this.session.appointment);
    this.patients[this.curIndex].record.visits[0][0].status = 'Appointment';
    this.processing = true;
    this.dataService.updateRecord(this.patients[this.curIndex], this.session.newItems).subscribe(patient => {
      this.processing = false;
      this.feedback = 'Appointment updated';
      setTimeout(() => {
        this.feedback = null;
        this.patients.splice(this.curIndex , 1);
      }, 3000);
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
  switchToNewMedic() {
    this.medicView = !this.medicView;
  }
  switchToAp(i: number) {
    this.patients[i].card.view = 'ap';
    this.curIndex = i;
  }
  switchToFront(i: number) {
    this.patients[i].card.view = 'front';
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
        this.patients.sort((m, n) => new Date(m.info.personal.dob).getFullYear() -
        new Date(n.info.personal.dob).getFullYear());
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
  saveMedication(i) {
    this.composeMedications();
    this.composeComplains();
    // this.patients[i].record.medications = this.medications;
    // this.processing = true;
    // this.dataService.updateRecord(this.patients[i], this.newItems).subscribe((p: Person) => {
    //   p.card = {menu: false, view: 'front'};
    //   this.patients[i] = p;
    //   this.medications = [];
    //   this.tempMedications = [];
    //   this.processing = false;
    //   this.feedback = 'Medication added successfully';
    //   setTimeout(() => {
    //     this.feedback = null;
    //   }, 4000);
    // },(e) => {
    //   this.feedback = 'Unable to add medication ';
    //   this.processing = false;
    // });
  }
  searchPatient(name: string) {
    if (name !== '') {
     this.patients = this.patients.filter((patient) => {
       const patern =  new RegExp('\^' + name
       , 'i');
       return patern.test(patient.info.personal.firstName);
       });
    } else {
      this.patients = this.clonedPatients;
    }
   }
   toggleSortMenu() {
    this.sortMenu = !this.sortMenu;
  }
  addInvoice(name: string, itemType: string) {
    const p = this.products.find(prod => prod.item.name === name);
    if (p) {
      if (itemType === 'Medication') {
        this.session.medInvoices.unshift({
          ...new Invoice(),
          name: name,
          price: p.stockInfo.price,
          desc: `Medication | ${this.session.medication.priscription.intake}-${this.session.medication.priscription.freq}-${this.session.medication.priscription.piriod}`,
          processed: false,
          meta: new Meta(this.cookies.get('i'))
        });
      } else {
        this.session.invoices.unshift({
          ...new Invoice(),
          name: name,
          price: p.stockInfo.price,
          desc: itemType,
          meta: new Meta(this.cookies.get('i'))
        });
      }
    } else {
      if (itemType === 'Medication') {
        this.session.medInvoices.unshift({
          ...new Invoice(),
          name: name,
          desc: `Medication | ${this.session.medication.priscription.intake}-${this.session.medication.priscription.freq}-${this.session.medication.priscription.piriod}`,
          processed: false,
          meta: new Meta(this.cookies.get('i'))
        });
      } else {
        this.session.invoices.unshift({
          ...new Invoice(),
          name: name,
          desc: itemType,
          meta: new Meta(this.cookies.get('i'))
        });
      }
    }
    console.log(this.session.invoices);
  }
  addMedication() {
    if (this.session.items.some(i => i.name === this.session.medication.name)) {
    } else {
      this.session.newItems.unshift(new Item('drug', this.session.medication.name));
      this.session.items.unshift(new Item('drug', this.session.medication.name));
    }
    if (this.session.medications.some(medic => medic.name === this.session.medication.name)) {
      this.feedback = 'Medication already added';
    } else {
    this.session.medications.unshift({
      ...this.session.medication,
      meta: new Meta(this.cookies.get('i'))
    });
  }
  this.addInvoice(this.session.medication.name, 'Medication');
  this.session.medication = new Medication();
  }
  addTest() {
    this.session.tests.unshift(new Test(
      this.session.reqItem.name,
      new Meta(this.cookies.get('i'))
      ));
      this.addInvoice(this.session.reqItem.name, 'Test');
  }
  addSurgery() {
    this.session.surgeries.unshift({
      ...new Surgery(),
      name: this.session.reqItem.name,
      meta: new Meta(this.cookies.get('i'))
    });
    this.addInvoice(this.session.reqItem.name, 'Surgery');
   }
  addScanning() {
    this.session.scans.unshift({
      ...new Scan(),
      name: this.session.reqItem.name,
      meta: new Meta(this.cookies.get('i'))
    });
    this.addInvoice(this.session.reqItem.name, 'Scan');
  }
  addComplain() {
     this.session.complains.unshift({
       ...this.session.complain,
       meta: new Meta(this.cookies.get('i'))
     });
     this.session.complain = new Complain();
   }
   addCondition() {
     this.session.conditions.unshift(new Condition(
       this.session.condition.condition,
       new Meta(this.cookies.get('i'))
       ));
     this.session.condition = new Condition();
   }

   getPriscription(med) {
     return med.desc.split('|')[1];
   }
  addRequest() {
    switch (this.session.reqItem.category) {
      case 'Surgery':
      this.addSurgery();
      this.session.reqItem = new Item();
      this.session.desc = [];
      break;
    case 'Scanning':
      this.addScanning();
      this.session.reqItem = new Item();
      this.session.desc = [];
      break;
    case 'Test':
      this.addTest();
      this.session.reqItem = new Item();
      this.session.desc = [];
      default:
      break;
    }

  }

  removeRequest(i: number) {
    this.session.reqItems.splice(i, 1);
    this.session.invoices.splice(i, 1);
  }
  removeCondition(i: number) {
    this.session.conditions.splice(i, 1);
  }
  getProducts() {
    this.dataService.getProducts().subscribe((res: any) => {
      this.products = res.inventory;
      this.session.items = res.items;
   });
  }
  checkItems(type: string) {
    // return this.temItems.some(item => item.type === type);
  }
  selectItem(i: Item) {
  }
  searchItems(i: string, type: string) {
    // if (i === '') {
    //   this.temItems = [];
    // } else {
    //     this.temItems = this.items.filter(it => it.type === type).filter((item) => {
    //     const patern =  new RegExp('\^' + i , 'i');
    //     return patern.test(item.name);
    //   });
    // }
  }
  saveNote() {
    this.processing = true;
    this.patients[this.curIndex].record.notes.unshift({
      ...this.session.note, meta: new Meta(this.cookies.get('i'))
    });
      this.dataService.updateRecord(this.patients[this.curIndex], this.session.newItems).subscribe((p: Person) => {
        p.card = {menu: false, view: 'front'};
        this.processing = false;
        this.session.note = new Note();
        this.feedback = 'Note added successfully';
        setTimeout(() => {
          this.feedback = null;
        }, 4000);
     }, (e) => {
       this.feedback = 'Unbale to add note';
       this.processing = false;
     });
  }

switchBtn(option: string) {
   this.in = option;
}
removeMedication(i: number) {
  this.session.medications.splice(i, 1);
  this.session.invoices.splice(i, 1);
}
getPatients(type) {
  this.loading = true;
  this.dataService.getPatients(type).subscribe((patients: Person[]) => {
     if (patients.length) {
      patients.forEach(p => {
      p.card = {menu: false, view: 'front'};
    });
    this.clonedPatients = patients;
    this.patients = patients;
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
  selectDrug(item: Item) {
    // this.product.item = item;
    // this.temItems = [];
   }
  selectCondition(item: Item) {
    // this.session.conditions.name = item.name;
    // this.temItems = [];
   }
   getBMI() {
     return  (this.session.vital.weight.value / Math.pow(this.session.vital.height.value, 2)).toFixed(2);
   }
  selectPatient(i: number) {
    this.curIndex = i;
    this.reg = false;
    this.session = new Session();
    this.clonedPatient = cloneDeep(this.patients[i]);
    this.patient = this.patients[i];
     this.url = this.getDp(this.patient.info.personal.avatar);
   }



   removeComplain(i: number) {
     this.session.complains.splice(i, 1);
     this.session.newItems.splice(i, 1);
   }
   removeDp() {
     this.url = null;
   }
  removePriscription(i: number) {
   this.session.medications.splice(i, 1);
   this.session.invoices.splice(i, 1);
  }
  removeTest(i) {
    this.tests.splice(i, 1);
    this.session.invoices.splice(i, 1);
  }
  clearFeedback() {
    this.feedback = null;
  }
  getPriceTotal() {
    // let total = 0;
    //  this.session.medications.forEach((medic) => {
    //    total = total +  medic.stockInfo.price;
    //  });
    //  return total;
  }


  composeInvoices() {
    let invoices = cloneDeep([...this.session.invoices, ...this.session.medInvoices]);
    if (invoices.length) {
    if (this.patient.record.invoices.length) {
      if (new Date(this.patient.record.invoices[0][0].meta.dateAdded)
      .toLocaleDateString() === new Date()
      .toLocaleDateString()) {
        for (const i of invoices) {
          this.patient.record.invoices[0].unshift(i);
        }
       } else {
          this.patient.record.invoices.unshift(invoices);
       }
      } else {
        this.patient.record.invoices = [invoices];
      }
    }
  }
  composeMedications() {
    if (this.session.medications.length) {
    if (this.patient.record.medications.length) {
      if (new Date(this.patient.record.medications[0][0].meta.dateAdded)
      .toLocaleDateString() === new Date()
      .toLocaleDateString()) {
        for (const m of this.session.medications) {
          this.patient.record.medications[0].unshift(m);
        }
       } else {
          this.patient.record.medications.unshift(this.session.medications);
       }
      } else {
        this.patient.record.medications = [this.session.medications];
      }
    }
  }
  composeTests() {
    if (this.session.tests.length) {
      if (this.patient.record.tests.length) {
      if (new Date(this.patient.record.tests[0][0].meta.dateAdded)
      .toLocaleDateString() === new Date().toLocaleDateString()) {
        for (const t of this.tests) {
          this.patient.record.tests[0].unshift(t);
        }
       } else {
          this.patient.record.tests.unshift(this.session.tests);
       }
      } else {
         this.patient.record.tests = [this.session.tests];
      }
    }
  }
  composeScans() {
    if (this.session.scans.length) {
      if (this.patient.record.scans.length) {
      if (new Date(this.patient.record.scans[0][0].meta.dateAdded)
      .toLocaleDateString() === new Date().toLocaleDateString()) {
        for (const t of this.session.scans) {
          this.patient.record.scans[0].unshift(t);
        }
       } else {
          this.patient.record.scans.unshift(this.session.scans);
       }
      } else {
        this.patient.record.scans = [this.session.scans];
      }
    }
  }
  composeComplains() {
    if (this.session.complains.length) {
    if (this.patient.record.complains.length) {
      if (new Date(this.patient.record.complains[0][0].meta.dateAdded)
      .toLocaleDateString() === new Date().toLocaleDateString()) {
        for (const c of this.session.complains) {
          this.patient.record.complains[0].unshift(c);
        }
       } else {
          this.patient.record.complains.unshift(this.session.complains);
       }
      } else {
         this.patient.record.complains = [this.session.complains];
      }
    }
  }
  composeConditions() {
    if (this.session.conditions.length) {
    if (this.patient.record.conditions.length) {
      if (new Date(this.patient.record.conditions[0][0].meta.dateAdded)
      .toLocaleDateString() === new Date().toLocaleDateString()) {
        for (const c of this.session.conditions) {
          this.patient.record.conditions[0].unshift(c);
        }
       } else {
        this.patient.record.conditions.unshift(this.session.conditions);
       }
      } else {
        this.patient.record.conditions = [this.session.conditions];
      }
    }
  }
  checkScalars() {
    if (this.session.famHist.condition) {
      this.patient.record.famHist.unshift({
        ...this.session.famHist,
        meta: new Meta(this.cookies.get('i'))
    });
    } else {}
     if (this.session.note.note) {
      this.patient.record.notes.unshift({
        ...this.session.note,
        meta: new Meta(this.cookies.get('i'))
      });
    } else {}
     if (this.session.allegies.allegy) {
      this.patient.record.allegies.unshift({...this.session.allegies,
        meta: new Meta(this.cookies.get('i'))
      });
    } else {}
     if (this.session.famHist.condition) {
      this.patient.record.famHist.unshift({...this.session.famHist,
        meta: new Meta(this.cookies.get('i'))
      });
    } else {}
  }

sendRecord() {
  this.processing = true;
  this.dataService.updateRecord(this.patient).subscribe((patient: Person) => {
    this.socket.io.emit('consulted', patient);
    this.session = new Session();
    this.feedback = 'Record successfully updated';
    this.processing = false;
    setTimeout(() => {
      this.feedback = null;
    }, 4000);
  }, (e) => {
    this.errLine = 'Unable to update record';
    this.processing = false;
  });
}

submitRecord() {
    this.processing = true;
    this.composeTests();
    this.composeScans();
    this.composeComplains();
    this.composeConditions();
    this.composeMedications();
    this.composeInvoices();
    this.checkScalars() ;
    // console.log(this.patient.record)
    this.sendRecord();

  }
}
