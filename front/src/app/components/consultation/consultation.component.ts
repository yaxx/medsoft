import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import * as cloneDeep from 'lodash/cloneDeep';
import {CookieService } from 'ngx-cookie-service';
import {ActivatedRoute, Router} from '@angular/router';
import {Person, Info} from '../../models/person.model';
import {states, lgas} from '../../models/data.model';
import {Client, Department} from '../../models/client.model';
import { Item, StockInfo, Product} from '../../models/inventory.model';
import { Record, Session, Complain, Appointment,
         Priscription, Medication, Visit, Note} from '../../models/record.model';
const uri = 'http://localhost:5000/api/upload';

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.css']
})

export class ConsultationComponent implements OnInit {
  states = states;
  lgas = lgas;
  patient: Person = new Person();
  patients: Person[] = [];
  clonedPatient: Person = new Person();
  clonedPatients: Person[] = [];
  record: Record = new Record();
  client: Client = new Client();
  department: Department = new Department();
  complain: Complain = new Complain();
  complains: Complain[] = [];
  session: Session = new Session();
  curIndex = 0;
  searchTerm = '';
  medicView = false;
  priscription: Priscription = new Priscription();
  medication: Medication =  new Medication();
  medications: any[] = [];
  tempMedications: Medication[] = [];
  item: Item = new Item();
  items: Item[] = [];
  temItems: Item[] = [];
  newItems: Item[] = [];
  product: Product = new Product(new Item(), new StockInfo());
  products: Product[] = [];
  selectedProducts: Product[] = [];
  appointment: Appointment = new Appointment();
  note = new Note();
  input = '';
  in = 'discharge';
  loading  = false;
  processing  = false;
  feedback = null;
  reg = true;
  sortBy = 'added';
  sortMenu = false;
  message = null;
  nowSorting = 'Date added';
  myDepartment = null;
  url = null;
  file: File = null;
  uploader: FileUploader = new FileUploader({url: uri});

  constructor(
     private dataService: DataService,
     private route: ActivatedRoute,
     private router: Router,
     private cookies: CookieService,
     private socket: SocketService ) {
   }

  ngOnInit() {
   this.getPatients('queued');
   this.getClient();
   this.myDepartment = this.route.snapshot.params['dept'];
    this.socket.io.on('enroled', (patient: Person) => {
      if(patient.record.visits[0][0].dept.toLowerCase() === this.myDepartment || this.route.snapshot.params['admin']) {
        patient.card = {view: 'front', menu: false};
        this.patients.unshift(patient);
      }
  });
  this.socket.io.on('store update', (data) => {
    if(data.action === 'new') {
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
      if(this.myDepartment) {
         if(i < 0) {
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
    const i = this.patients.findIndex(p => p._id === patient._id)
      if(patient.record.visits[0][0].dept.toLowerCase() === this.myDepartment ) {
         if(i < 0) {
         } else {
           this.patients.splice(i, 1);
         }
      } else {
         this.patients.splice(i, 1);
      }
  });
  this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any ) => {
    this.patient.info.personal.avatar = response;
   };

  }
  isConsult(){
    return this.router.url.includes('consultation') && !(this.router.url.includes('information')||this.router.url.includes('admin'));
  }
  refresh() {
   this.message = null;
   this.getPatients('queued');
   this.getClient();
  }
  getLgas() {
    return this.lgas[this.states.indexOf(this.patient.info.contact.me.state)];
  }
addRecord() {
  this.patient.record.visits.unshift([new Visit()]);
  this.dataService.addPerson(this.patient).subscribe((newpatient: Person) => {
    newpatient.card = {menu: false, view: 'front'};
    this.patients.unshift(newpatient);
    this.socket.io.emit('consulted', newpatient);
    this.patient = new Person();
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
  },(e) => {
    this.feedback = 'Unbale to update info';
    this.processing = false;
  })
}
updateInfo() {
  if(this.url) {
    if(this.patient.info.personal.avatar === this.url ) {
      this.update();
    } else {
      this.uploader.uploadAll();
      this.update();
    }
  } else {
      this.patient.info.personal.avatar = 'avatar.jpg' ;
      this.update();
    }
}

addPatient() {
    this.processing = true;
    if(this.reg) {
      if(this.url) {
        this.uploader.uploadAll();
        this.addRecord();
    }
    this.addRecord();
  }
  this.updateInfo();
  }
 getClient() {
    this.dataService.getClient().subscribe((res: any) => {
      this.client = res.client;
      this.products = res.client.inventory;
      this.items = res.items;
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


  getDp(avatar: String) {
    return 'http://localhost:5000/api/dp/' + avatar;
  }

  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  fetchDept() {
      return this.client.departments
      .filter(dept => (dept.hasWard) && (dept.name !== this.patient.record.visits[0][0].dept));
  }
  setAppointment() {
    this.patients[this.curIndex].record.appointments.unshift(this.appointment);
    this.patients[this.curIndex].record.visits[0][0].status = 'Appointment';
    this.processing = true;
    this.dataService.updateRecord(this.patients[this.curIndex], this.newItems).subscribe(patient => {
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
  switchToNewMedic(){
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
      // case 'status':
      //   this.patients.sort((m, n) => m.record.visits[m.record.visits.length-1].status.localeCompare(m.record.visits[n.record.visits.length-1].status.localeCompare));
      //   this.nowSorting = 'Status';
      //   break;
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
  saveMedication(i) {
    this.composeMedication();
    this.patients[i].record.medications = this.medications;
    this.processing = true;
    this.dataService.updateRecord(this.patients[i], this.newItems).subscribe((p: Person) => {
      p.card = {menu: false, view: 'front'};
      this.patients[i] = p;
      this.medications = [];
      this.tempMedications = [];
      this.processing = false;
      this.feedback = 'Medication added successfully';
      setTimeout(() => {
        this.feedback = null;
      }, 4000);
    },(e) => {
      this.feedback = 'Unable to add medication ';
      this.processing = false;
    });
  }
  searchPatient(name: string) {
    if(name !== '') {
     this.patients = this.patients.filter((patient) => {
       const patern =  new RegExp('\^' + name
       , 'i');
       return patern.test(patient.info.personal.firstName);
       });
    } else {
      this.patients = this.clonedPatients;
    }
   }
  showSortMenu() {
    this.sortMenu = true;
  }
  getProducts() {
    this.dataService.getProducts().subscribe((res: any) => {
      this.products = res.inventory;
      this.items = res.items;
   });
  }
  checkItems(type:string){
    return this.temItems.some(item => item.type === type)
  }
  selectItem(i: Item) {
  }
  searchItems(i: string, type: string) {
    if (i === '') {
      this.temItems = [];
    } else {
        this.temItems = this.items.filter(it => it.type === type).filter((item) => {
        const patern =  new RegExp('\^' + i , 'i');
        return patern.test(item.name);
      });
  }
  }
  saveNote() {
    this.processing = true;
    this.patients[this.curIndex].record.notes.unshift({...this.note, by: this.cookies.get('i')});
      this.dataService.updateRecord(this.patients[this.curIndex], this.newItems).subscribe((p: Person) => {
        p.card = {menu: false, view: 'front'};
        this.processing = false;
        this.note = new Note();
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

getPatients(type) {
  this.loading = true;
  this.dataService.getPatients(type).subscribe((patients: Person[]) => {
     if(patients.length) {
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
  addSelection(item: Item) {
    this.item = item;
      this.temItems = [];
   }
   getBMI() {
     return  (this.session.vital.weight.value / Math.pow(this.session.vital.height.value, 2)).toFixed(2);
   }
  selectPatient(i: number) {
    this.curIndex = i;
    this.reg = false;
    this.clonedPatient = cloneDeep(this.patients[i]);
    this.patient = this.patients[i];
    this.medications = this.patient.record.medications;
    this.url = this.getDp(this.patient.info.personal.avatar);
   }
   pullMedications(i: number) {
    this.curIndex = i;
    this.medications = this.patients[i].record.medications;
   }
   addMore() {
    let tempro = null;
    this.product.item = this.item;
    if(this.items.some(item => item.name === this.item.name)) {
    } else {
      this.item.type = 'drug';
      this.newItems.unshift(this.item);
      this.items.unshift(this.item);
    }
    if(this.tempMedications.some(medic => medic.product.item.name === this.item.name)) {
      this.feedback ='Medication already added';
    } else {
      this.client.inventory.forEach(prod => {
        if(prod.item.name === this.product.item.name) {
          tempro = prod;
        }
      })
      if (tempro) {
        this.tempMedications.unshift(new Medication(tempro, this.priscription));
      } else {
         this.tempMedications.unshift(new Medication(this.product, this.priscription));
      }
      this.product = new Product();
      this.priscription = new Priscription();
      this.item = new Item();
    }

   }
   addMoreComplain() {
    if(this.items.some(item => item.name === this.complain.complain)) {
    } else {
      this.newItems.unshift({...this.item,name:this.complain.complain, type: 'complain'});
      this.items.unshift({...this.item, name: this.complain.complain, type: 'complain'});
    }
     this.complains.push({...this.complain, by: this.cookies.get('i')});
     this.complain = new Complain();
   }
   removeComplain(i: number) {
     this.complains.splice(i, 1);
     this.newItems.splice(i, 1);
   }
   removeDp() {
     this.url = null;
   }
  removePriscription(i: number) {
   this.tempMedications.splice(i, 1);
  }
  getPriceTotal() {
    let total = 0;
     this.tempMedications.forEach((medic) => {
       total = total +  medic.product.stockInfo.price;
     });
     return total;
  }

  composeMedication() {
    if (this.medications.length) {
      if (new Date(this.medications[0][0].dateCreated)
      .toLocaleDateString() === new Date()
      .toLocaleDateString()) {
        for(let m of this.tempMedications) {
          this.medications[0].unshift(m);
        }
       } else {
        this.medications.unshift(this.tempMedications);
       }

  } else {

    this.medications = [this.tempMedications];

  }
  }
  clearFeedback() {
    this.feedback = null;
  }
  submitRecord() {
    this.processing = true;
    this.composeMedication();
      this.patient.record.medications = this.medications;
    if (this.session.vital.bp.value) {
      this.patient.record.vitals.bp.unshift(this.session.vital.bp);
    } else {}
    if (this.session.vital.pulse.value) {
      this.patient.record.vitals.pulse.unshift(this.session.vital.pulse);
    } else {}
     if (this.session.vital.resp.value) {
      this.patient.record.vitals.resp.unshift(this.session.vital.resp);
    } else {}
     if (this.session.vital.height.value) {
      this.patient.record.vitals.height.unshift(this.session.vital.height);
    } else {}
     if (this.session.vital.weight.value) {
      this.patient.record.vitals.weight.unshift(this.session.vital.weight);
    } else {}
     if (this.session.vital.tempreture.value) {
      this.patient.record.vitals.tempreture.unshift(this.session.vital.tempreture);
    } else {}
     if (this.session.vital.bloodGl.value) {
      this.patient.record.vitals.bloodGl.unshift(this.session.vital.bloodGl);
    } else {}
     if (this.session.conditions.condition) {
      if(this.items.some(item => item.name === this.session.conditions.condition)) {
        this.patient.record.conditions.unshift({...this.session.conditions, by: this.cookies.get('i')});
      } else {
        this.newItems.unshift({...this.item, name: this.session.conditions.condition, type:'condition'});
        this.items.unshift({...this.item, name:this.session.conditions.condition, type:'condition'});
        this.patient.record.conditions.unshift({...this.session.conditions, by: this.cookies.get('i')});
      }
      
    } else {}
     if (this.session.visits.status === 'Foward') {
      this.patient.record.visits[0].unshift({...this.session.visits, status: 'queued'}) ;
      // this.patient.record.visits[0][0].status  = this.session.visits.status;
    } else {
      this.patient.record.visits[0][0] = this.session.visits;
    }
     if (this.complain.complain) {
      this.complains.unshift({...this.complain, by: this.cookies.get('i')});
    } else if (this.complains.length) {
      this.patient.record.complains.unshift(this.complains);
    } else {}
     if (this.session.famHist.condition) {
      this.patient.record.famHist.unshift(this.session.famHist);
    } else {}
     if (this.session.notes.note) {
      this.patient.record.notes.unshift({...this.session.notes, by: this.cookies.get('i')});
    } else {}
     if (this.session.allegies.allegy) {
      this.patient.record.allegies.unshift(this.session.allegies);
    } else {}

    this.dataService.updateRecord(this.patient, this.newItems).subscribe((patient: Person) => {
      this.socket.io.emit('consulted', patient);
      this.patients.splice(this.curIndex, 1);
      this.session = new Session();
      this.tempMedications = [];
      this.feedback = 'Record successfully updated';
      this.processing = false;
      this.complains = [];
      setTimeout(() => {
        this.feedback = null;
      }, 4000);

    }, (e) => {
      this.feedback = 'Unable to update record';
      this.processing = false;
    });
  }
}
