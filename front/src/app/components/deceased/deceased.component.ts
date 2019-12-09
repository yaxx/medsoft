import { Component, OnInit } from '@angular/core';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {ActivatedRoute,Router} from '@angular/router';
import * as cloneDeep from 'lodash/cloneDeep';
import {Person, Info} from '../../models/person.model';
import {Visit} from '../../models/record.model';
import {Client, Department} from '../../models/client.model';
import {CookieService } from 'ngx-cookie-service';
const uri = 'http://localhost:5000/api/upload';
// const uri = 'http://192.168.1.101:5000/api/upload';
@Component({
  selector: 'app-deceased',
  templateUrl: './deceased.component.html',
  styleUrls: ['./deceased.component.css']
})
export class DeceasedComponent implements OnInit {
  patients: Person[] = [];
  clonedPatients: Person[] = [];
  clonedPatient: Person = new Person();
  patient: Person = new Person();
  client: Client = new Client();
  file: File = null;
  info: Info = new Info();
  visit: Visit = new Visit();
  card: string = null;
  url = '';
  logout = false;
  curIndex = 0;
  message = null;
  feedback = null;
  processing = false;
  sortBy = 'added';
  sortMenu = false;
  loading = false;
  nowSorting = 'Date added';
  view = 'info';
  searchTerm = '';
  dpurl = 'http://localhost:5000/api/dp/';
  // dpurl = 'http://192.168.1.101:5000/api/dp/';
  uploader: FileUploader = new FileUploader({url: uri});
  constructor(private dataService: DataService,
    private cookies: CookieService,
    private socket: SocketService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.getPatients('Deceased');
  }
  routeHas(path) {
    return this.router.url.includes(path);
  }
  getDp(avatar: String) {
    return 'http://localhost:5000/api/dp/' + avatar;
    // return 'http://192.168.1.101:5000/api/dp/' + avatar;
  }
  toggleSortMenu() {
    this.sortMenu = !this.sortMenu;
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  refresh() {
    this.message = null;
    this.getPatients('Deceased');
  }
  getClient() {
    this.dataService.getClient().subscribe((res: any) => {
      this.client = res.client;
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
    },(e) => {
      this.message = 'Something went wrong';
      this.loading = false;
    });
  }
  searchPatient(name:string) {
    if(name!==''){
     this.patients = this.patients.filter((patient) => {
       const patern =  new RegExp('\^' + name
       , 'i');
       return patern.test(patient.info.personal.firstName);
       });
    } else {
      this.patients = this.clonedPatients;
    }
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
       case 'status':
         // this.patients.sort((m, n) => m.record.visits[m.record.visits.length-1].status.localeCompare(m.record.visits[n.record.visits.length-1].status.localeCompare));
         // this.nowSorting = 'Status';
         // break;
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
}
