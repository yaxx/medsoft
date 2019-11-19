import { Component, OnInit } from '@angular/core';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {CookieService } from 'ngx-cookie-service';
import {ActivatedRoute, Router} from '@angular/router';
import {Item, StockInfo, Product} from '../../models/inventory.model';
import * as cloneDeep from 'lodash/cloneDeep';
import { Person} from '../../models/person.model';
import {PersonUtil} from '../../util/person.util';


const uri = 'http://localhost:5000/api/upload';
// const uri = 'http://192.168.1.101:5000/api/upload';
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
  input = '';
  reg = true;
  view = 'bed';
  id = null;
  medicView = false;
  cardTypes = [];
  sortBy = 'added';
  sortMenu = false;
  nowSorting = 'Date added';
  message = null;
  feedback = null;
  searchTerm = '';
  selected = null;
  bedNum = null;
  processing = false;
  loading = false;
  curIndex = 0;
  count = 0;
  url = '';
  attachments: any = [];
  myDepartment = null;

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
    if(info) {
      this.patients[this.curIndex].info = info;
    }
 }

  getItems() {
    // this.dataService.getItems().subscribe((items: Item[]) => {
    //   this.items = items;
    // });
  }
  getDp(avatar: String) {
    //  return 'http://192.168.1.101:5000/api/dp/' + avatar;
    return 'http://localhost:5000/api/dp/' + avatar;
  }
  linked() {
    return !this.router.url.includes('information');
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
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
  filterPatients(patients: Person[]) : Person[] {
    const completes: Person[] = [];
    const pendings: Person[] = [];
    patients.forEach(pat => {
      pat.record.invoices.every(invoices => invoices.every(i => i.paid)) ? completes.push(pat) : pendings.push(pat);
    });
    return (this.router.url.includes('completed')) ? completes : pendings;
  }
   getPatients(type) {
    this.loading = true;
    this.dataService.getPatients(type).subscribe((patients: Person[]) => {
      if (patients.length) {
        patients.forEach(p => {
        p.card = {menu: false, view: 'front'};
      });
      this.patients   = this.filterPatients(patients).sort((m, n) => new Date(n.createdAt).getTime() - new Date(m.createdAt).getTime());
      this.clonedPatients  = patients;
      this.loading = false;
      this.message = null;
      } else {
        this.message = 'No Records So Far';
        this.loading = false;
      }
    },(e) => {
      this.message = 'Something went wrong';
      this.loading = false;
    });
  }
  isAdmin() {
    return this.router.url.includes('admin');
  }
 isInfo() {
    return this.router.url.includes('information');
  }
  isConsult() {
    return !this.router.url.includes('information') && !this.router.url.includes('pharmacy') && !this.router.url.includes('billing') && !this.router.url.includes('ward') && !this.router.url.includes('admin');
  }



  toggleSortMenu() {
    // this.sortMenu = !this.sortMenu;
  }

  swichtToBack(i) {
    // this.tempMedications = new Array<Medication>();
    // this.medications = this.patients[i].record.medications ;
    // this.patients[i].card.view = 'back';
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

  


  

 





}
