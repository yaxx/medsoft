import { Component, OnInit } from '@angular/core';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {CookieService } from 'ngx-cookie-service';
import {ActivatedRoute, Router} from '@angular/router';
import {Client, Department} from '../../models/client.model';
import {Item, StockInfo, Product} from '../../models/inventory.model';
import { Record,  Session} from '../../models/record.model';
import * as cloneDeep from 'lodash/cloneDeep';
import { Person} from '../../models/person.model';
import {PersonUtil} from '../../util/person.util';


//const uri = 'http://localhost:5000/api/upload';
const uri = 'http://192.168.1.101:5000/api/upload';
@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {
  patients: Person[] = [];
  clonedPatients: Person[] = [];
  patient: Person = new Person();
  uploader: FileUploader = new FileUploader({url: uri});
  temPatients: Person[] = new Array<Person>();
  file: File = null;
  client: Client = new Client();
  session: Session = new Session();
  input = '';
  reg = true;
  logout = false;
  view = 'bed';
  id = null;
  medicView = false;
  cardTypes = [];
  sortBy = 'added';
  successMsg = null;
  errorMsg = null;
  sortMenu = false;
  nowSorting = 'Date added';
  message = null;
  feedback = null;
  searchTerm = '';
  selections = [];
  selected = null;
  bedNum = null;
  processing = false;
  loading = false;
  curIndex = 0;
  count = 0;
  url = '';
  dept = null;
  cardCount = null;
  attachments: any = [];
  myDepartment = null;
  cardView = {
    orders: true,
    editing: false,
    reversing: false
  };

  constructor(private dataService: DataService,
     private socket: SocketService,
     private route: ActivatedRoute,
     private router: Router,
     public psn: PersonUtil,
     private cookies: CookieService
  ) { }
  ngOnInit() {
    this.getClient();
    this.myDepartment = this.route.snapshot.params['dept'];
    this.getPatients('Admit');
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('id', this.patients[this.curIndex]._id);
     };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any ) => {
      this.attachments.push(JSON.parse(response));
    };
  }
  
  getClient() {
    this.dataService.getClient().subscribe((res: any) => {
      this.client = res.client;
      this.cardTypes = res.client.inventory.filter(p => p.type === 'Cards');
  });
  }
  viewDetails(i) {
    this.reg = false;
    this.curIndex = i;
    this.count = 0;
    this.psn.person = cloneDeep(this.patients[i]);
  }
  updateInfo() {
    const info = this.psn.updateInfo();
    if (info) {
      this.patients[this.curIndex].info = info;
    }
 }
 selectPatient(i: number) {
  this.curIndex = i;
  this.patient = cloneDeep(this.patients[i]);
 }
 switchToEdit() {
  this.patient.record.medications.forEach(inner => {
    inner.forEach(medic => {
      if (medic.meta.selected) {
         this.selections.push(medic);
      }
    });
  });
  this.switchViews('editing');
}
medSelected() {
  return this.patient.record.medications.some(med => med.some(m => m.meta.selected));
 }
switchViews(view) {
  switch (view) {
    case 'orders':
    this.cardView.orders = true;
    this.cardView.editing = false;
    this.selections = [];
    break;
    case 'editing':
    this.cardView.orders = false;
    this.cardView.editing = true;
    break;
    default:
    break;
  }
}
resetOrders() {
  this.processing = false;
  setTimeout(() => {
    this.successMsg = null;
  }, 3000);
  setTimeout(() => {
    this.switchViews('orders');
  }, 6000);
}
getStyle(medication) {
  return {
    textDecoration: medication.paused ? 'line-through' : 'none',
    color: medication.paused ? 'light-grey' : 'black'
  };
}
selectMedication(i: number, j: number) {
  this.patient.record.medications[i][j].meta.selected =
  this.patient.record.medications[i][j].meta.selected ? false : true;
 }
 changeMedStatus(i: number) {
 this.processing = true;
  this.patient.record.medications.forEach(group => {
    group.forEach(medic => {
      if (medic.meta.selected) {
        medic.paused = (medic.paused) ? false : true;
        medic.pausedOn = new Date();
        medic.meta.selected = false;
      }
    });
  });
  this.dataService.updateRecord(this.patient).subscribe((p: Person) => {
    this.successMsg = 'Status Updated';
    this.patients[this.curIndex].record = p.record;
    this.resetOrders();
  }, () => {
    this.errorMsg = 'Unable to Update Medications';
  });
}
  getItems() {
    // this.dataService.getItems().subscribe((items: Item[]) => {
    //   this.items = items;
    // });
  }
  getDp(avatar: String) {
    return 'http://192.168.1.101:5000/api/dp/' + avatar;
   // return 'http://localhost:5000/api/dp/' + avatar;
  }
  linked() {
    return !this.router.url.includes('information');
  }
  logOut() {
    this.dataService.logOut();
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  getRefDept() {
    return this.client.departments.filter(dept => dept.hasWard && dept.name !== this.dept);
  }
  refresh() {
    this.message = null;
    this.getPatients('Admit');

  }
  next() {
    this.count = this.count + 1;
  }
  prev() {
    this.count = this.count - 1;
  }
 
   getPatients(type) {
    this.loading = true;
    this.dataService.getPatients(type).subscribe((patients: Person[]) => {
      if (patients.length) {
        patients.forEach(p => {
        p.card = {menu: false, view: 'front', btn: 'discharge'};
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
      this.message = 'Network Error';
      this.loading = false;
    });
  }
  dispose(i: number, disposition: string, label) {
    this.patients[i].record.visits[0][0].status = disposition;
    this.patients[i].card.btn = label;
  }
  isAdmin() {
    return this.router.url.includes('admin');
  }
 isInfo() {
    return this.router.url.includes('information');
  }
  isConsult() {
    return !this.router.url.includes('information') &&
    !this.router.url.includes('pharmacy') &&
    !this.router.url.includes('billing') &&
    !this.router.url.includes('ward') &&
    !this.router.url.includes('admin');
  }

  switchCards(i: number, face: string) {
    this.curIndex = i;
    this.patients[i].record.visits[0][0].status = 'out';
    this.patients[i].card.view = face;
     switch (face) {
       case 'ap': this.cardCount = 'dispose';
         break;
       case 'appointment': this.cardCount = 'ap';
         break;
       case 'dispose': this.cardCount = 'dispose';
       this.patients[i].card.btn = 'discharge';
       this.dept = this.patients[i].record.visits[0][0].dept; 
         break;
       default: this.cardCount = null;
       this.patients[i].record.visits[0][0].status = 'queued';
       this.patients[i].record.visits[0][0].dept = this.dept;
       this.patients[i].card.btn = 'discharge';
         break;
     }
   }
   comfirmDesposition(i: number) {
    this.processing = true;
    this.patients[i].record.visits[0][0].dept = (
      this.patients[i].record.visits[0][0].status !== 'queued') ? this.dept : this.patients[i].record.visits[0][0].dept;
      this.patients[i].record.visits[0][0].dischargedOn = new Date();
      this.dataService.updateRecord(this.patients[i], this.session.newItems).subscribe((p: Person) => {
      this.processing = false;
      this.socket.io.emit(this.patients[i].card.btn.toLowerCase(), this.patients[i]);
      this.successMsg = 'Success';
      setTimeout(() => {
        this.successMsg = null;
      }, 5000);
      setTimeout(() => {
        this.switchCards(i, 'front');
      }, 8000);
      setTimeout(() => {
        this.patients.splice(i, 1);
      }, 10000);
   }, (e) => {
     this.errorMsg = 'Something went wrong';
     this.processing = false;
   });
  }

  toggleSortMenu() {
    // this.sortMenu = !this.sortMenu;
  }

 
  switchToFront(i) {
    // this.patients[i].card = {menu: false, view: 'front'};
  }

  searchPatient(name:string) {
  //  if (name !== '') {
  //   this.patients = this.patients.filter((patient) => {
  //     const patern =  new RegExp('\^' + name
  //     , 'i');
  //     return patern.test(patient.info.personal.firstName);
  //     });
  //  } else {
  //    this.patients = this.clonedPatients;
  //  }


  }
  sortPatients(sortOption: string) {
    // this.sortMenu = false;
    // switch (sortOption) {
    //   case 'name':
    //     this.patients.sort((m: Person, n: Person) => m.info.personal.firstName.localeCompare(n.info.personal.firstName));
    //     this.nowSorting = 'A-Z';
    //     break;
    //   case 'sex':
    //     this.patients.sort((m: Person, n: Person) => n.info.personal.gender.localeCompare(m.info.personal.gender));
    //     this.nowSorting = 'Gender';
    //     break;
      // case 'status':
      //   this.patients.sort((m, n) => m.record.visits[m.record.visits.length-1].status.localeCompare(m.record.visits[n.record.visits.length-1].status.localeCompare));
      //   this.nowSorting = 'Status';
      //   break;
    //     case 'age':
    //     this.patients.sort((m, n) => new Date(m.info.personal.dob).getFullYear() - new Date(n.info.personal.dob).getFullYear());

    //     this.nowSorting = 'Age';
    //     break;
    //   case 'date':
    //     this.patients.sort((m, n) => new Date(n.createdAt).getTime() - new Date(m.createdAt).getTime());
    //     this.nowSorting = 'Date added';
    //     break;

    //     default:
    //     break;
    // }
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
  showLogOut() {
    this.logout = true;
  }
  hideLogOut() {
    this.logout = false;
  }


}
