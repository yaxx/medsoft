
import { Component, OnInit } from '@angular/core';
import {ActivatedRoute,Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {Person, Info} from '../../models/person.model';
import {Visit , Appointment} from '../../models/record.model';
import {CookieService } from 'ngx-cookie-service';
import * as cloneDeep from 'lodash/cloneDeep';
import {host} from '../../util/url';
const uri = `${host}/api/upload`;
@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  patients: Person[] = [];
  clonedPatients: Person[] = [];
  clonedPatient: Person = new Person();
  patient: Person = new Person();
   file: File = null;
   info: Info = new Info();
   url = '';
   logout = false;
   curIndex = 0;
   sortBy = 'added';
   cardCount = null;
   sortMenu = false;
   loading = false;
   myDepartment = null;
   processing = false;
   nowSorting = 'Date added';
   view = 'info';
   message = null;
   feedback = null;
   searchTerm = '';
   regMode =  'all';
   dpurl = 'http://localhost:5000/api/dp/';
   //dpurl = 'http://192.168.1.101:5000/api/dp/';
   appointment: Appointment = new Appointment();
   uploader: FileUploader = new FileUploader({url: uri});
   constructor(
     private dataService: DataService,
     private cookies: CookieService,
     private route: ActivatedRoute,
     private router: Router,
     private socket: SocketService
 
     ) { }

   ngOnInit() {
      this.myDepartment = this.route.snapshot.url[0].path;
      this.getPatients('ap');
      this.socket.io.on('record update', (update) => {
        const i = this.patients.findIndex(p => p._id === update.patient._id);
        switch (update.action) {
          case 'disposition':
               if (update.patient.records.visits[0][0].status === 'ap') {
                this.patients.unshift({ ...update.patient, card: { ...this.patients[i].card, indicate: true } });
              }
            break;
          default:
              if (i !== -1 ) {
                this.patients[i] = { ...update.patient, card: this.patients[i].card };
              }
            break;
        }
      });
  }
   getDp(avatar: String) {
    return `${host}/api/dp/${avatar}`;
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  toggleSortMenu() {
    this.sortMenu = !this.sortMenu;
  }
   setAppointment() {
    this.processing = true;
    this.patients[this.curIndex].record.appointments[0] = this.appointment;
     this.dataService.updateRecord(this.patients[this.curIndex]).subscribe(patient => {
      this.processing = false;
      this.feedback = 'Appointment updated';
      setTimeout(() => {
        this.feedback = null;
        this.patients[this.curIndex].card = {menu: false, view: 'front'};
      }, 3000);
    });
  }
  routeHas(path) {
    return this.router.url.includes(path);
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
  queue(i) {
    this.patients[this.curIndex].record.visits[0][0].status = 'queued';
    this.dataService.updateRecord(this.patients[this.curIndex]).subscribe(patient => {
      this.patients[this.curIndex].card = {menu: false, view: 'front'};
      this.patients.splice(this.curIndex , 1);
    });
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
    },(e) => {
        this.message = 'Something went wrong';
        this.loading = false;
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
   showMenu(i: number) {
    this.hideMenu();
    this.patients[i].card.menu = true;
  }
  refresh(){
    this.message = null;
    this.getPatients('Appointment');
  }
  hideMenu() {
    this.patients.forEach(p => {
      p.card.menu =  false;
    });
  }

   switchCardView(i , view) {
    this.patients[this.curIndex].card.view = 'front';
    this.curIndex = i;
    this.cardCount = view;
    this.patients[i].card.view = view;
    this.patient = cloneDeep(this.patients[i]);
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
   selectPatient(i: number) {
     this.info = this.patients[i].info;
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
      this.patients = this.clonedPatients;
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
         this.patients.sort((m, n) => new Date(n.createdAt).getTime() - new Date(m.createdAt).getTime());
         this.nowSorting = 'Date added';
         break;
         default:
         break;
     }
   }
}
