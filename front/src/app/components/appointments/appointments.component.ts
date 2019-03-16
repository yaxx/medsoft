
import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgForm} from '@angular/forms';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {Person, Info} from '../../models/person.model';
import {Visit , Appointment} from '../../models/record.model';
import {CookieService } from 'ngx-cookie-service';

const uri = 'http://localhost:5000/api/upload';
@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  patients: Person[] = new Array<Person>();
  temPatients: Person[] = new Array<Person>();
  patient: Person = new Person();
   file: File = null;
   info: Info = new Info();
   url = '';
   curIndex = 0;
   sortBy = 'added';
   sortMenu = false;
   loading = false;
   myDepartment = null;
   nowSorting = 'Date added';
   view = 'info';
   searchTerm = '';
   regMode =  'all';
   dpurl = 'http://localhost:5000/api/dp/';
   appointment: Appointment = new Appointment();
  

   uploader: FileUploader = new FileUploader({url: uri});
   constructor(
     private dataService: DataService,
     private cookie: CookieService,
     private route: ActivatedRoute,
     private socket: SocketService
 
     ) { }

   ngOnInit() {
     this.route.parent.paramMap.subscribe(params=>{
      this.myDepartment = params.get('dept');
      console.log(this.myDepartment);
    });
  
     this.getPatients();
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
   setAppointment(){
    this.patients[this.curIndex].record.appointments.push(this.appointment);
    this.patients[this.curIndex].record.visits[this.patients[this.curIndex].record.visits.length-1].status = 'appointment'
    this.loading = true;
    this.dataService.updateRecord(this.patients[this.curIndex]).subscribe(patient=>{
      this.loading = false;
      setTimeout(() => {
            this.patients[this.curIndex].card = {menu: false, view: 'front'};
      }, 3000);
      setTimeout(() => {
          this.patients.splice(this.curIndex , 1);
      }, 3000);
  
    })
  }
   getPatients() {
     this.dataService.getPatients().subscribe((patients: Person[]) => {
       let myPatients;
       if(this.myDepartment) {
          myPatients = patients.filter(
          p => p.record.visits[0].dept === this.myDepartment && p.record.visits[0].status === 'appointment');
       } else {
        myPatients = patients.filter(p => p.record.visits[0].status === 'appointment');
       }
       myPatients.forEach(p => {
         p.card = {menu: false, view: 'front'};
       });
       this.patients = myPatients;
       this.dataService.setCachedPatients(patients);
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
  hideMenu() {
    this.patients.forEach(p => {
      p.card.menu =  false;
    });
  }
  
  switchToAp(i: number){
    this.patients[i].card.view = 'ap';
    this.curIndex = i
  }
  switchToFront(i: number) {
    this.patients[i].card.view = 'front';
  }
   switchToBack(i: number) {
     this.patients[i].card.view = 'back';
   }
   
   selectPatient(i: number){
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
