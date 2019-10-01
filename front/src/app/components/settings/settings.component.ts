import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animation, animate } from '@angular/animations';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {Client, Department, Bed, Room} from '../../models/client.model';
import {Connection, Connections, Info, Person} from '../../models/person.model';
import {CookieService } from 'ngx-cookie-service';
import {states, lgas} from '../../data/states';
import * as cloneDeep from 'lodash/cloneDeep';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  animations: [trigger('slide', [
    transition(':enter', [
    // style({ left: '100%'}),
    animate(500, style({ left: '0%'}))
  ]),
    transition(':leave', [
      animate(500, style({ left: '100%'}))
  ])
])]
  // animations: [trigger: ('fade', [
  //   transition('void=>*',[style({
  //     backgroundColor:'yellow', opacity:0 }),
  //   animate(2000)
  //     )]
  // ])]
})
export class SettingsComponent implements OnInit {
  info: Info = new Info();
  staff: Person = new Person();
  staffs: Person[] = new Array<Person>();
  departments: Department[] = [];
  connections: Connections =  new Connections();
  connection: Connection =  new Connection();
  department = new Department();
  selectedDept: Department = new Department();
  client: Client  = new Client();
  rooms: Room[] = [];
  bed: Bed = new Bed();
  loading = false;
  processing = false;
  numbOfBeds = null;
  staffMode = 'view';
  clientMode = null;
  roomNumb = 1;
  staffIndex = null;
  deptName = null;
  states = states;
  message = null;
  menu = null;
  transMsg = null;
  errLine = null;
  constructor(
    private dataService: DataService,
    private cookies: CookieService,
    private router: Router) { }

  ngOnInit() {
    this.getSettings();
  }
  getSettings() {
    this.loading = true;
    this.dataService.getClient().subscribe((res: any) => {
      if (res) {
        this.loading = false;
        this.client = res.client;
        this.staffs = res.client.staffs;
        this.departments = res.departments;
        this.roomNumb = this.getRoomNumbs();
        this.deptName = res.departments[0].name;
      }

    }, (e) => {
      this.message = 'Something went wrong';
      this.loading = false;
    });
  }
  getDp(avatar: String) {
    return 'http://localhost:5000/api/dp/' + avatar;
    // return 'http://18.221.76.96:5000/api/dp/' + avatar;
  }

  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  showMenu(menu: string) {
    this.menu =  menu;
  }
  hideMenu(menu: string) {
    this.menu = null;
  }
  getRoomNumbs() {
   return this.department.rooms.length + 1;
  }
  addRoom() {
    const beds = [];
    for (let i = 0; i < this.numbOfBeds; i++) {
        beds.push(new Bed(i + 1));
    }
    this.rooms.push({...new Room(), number: this.rooms.length + 1, beds: beds});
    this.roomNumb++;
    this.numbOfBeds = null;
  }
  openDeptModal() {
    this.client.departments.forEach((d) => {
      this.departments = this.departments.filter(dep => dep.name !== d.name);
    });
    this.deptName = this.departments[0].name;
  }
  switchClient(view: string) {
    this.clientMode = view;
  }
  openStafftModal(i: number) {
   this.staffMode = 'new';
    this.staff = new Person();
  }

  refresh() {
    this.getSettings();
 }
  selectDept(name) {
    const dps = cloneDeep(this.departments);
    this.department = dps.find(department => department.name === name);
    this.rooms = [];
    this.numbOfBeds = null;
    this.roomNumb = 1;
    // console.log(this.department);
  }
  isAddminStaff() {
    const dept = this.departments.find(department => department.name === this.staff.info.official.department);
    if (dept) {
      this.staff.info.official.department = dept.name;
      return  dept.hasWard;
    } else {return false; }

  }
  deptHasWard() {
   this.department = this.departments.find(department => department.name === this.department.name || null);
   if (this.department) {
    return  this.department.hasWard;
  } else {return false; }

  }
  generatePassword(): string {
    return Math.floor(Math.random() * (10000 - 1000 + 1) + 1000).toString();
  }
  createAccount() {
    this.processing = true;
    this.staff.info.personal.password = this.generatePassword();
     this.staff.info.personal.username = this.staff.info.personal.firstName.toLowerCase();
     this.staff.info.official.hospital = this.client._id;
     this.dataService.addPerson(this.staff).subscribe((staff: Person) => {
     this.processing = false;
     this.staffs.unshift(staff);
     this.transMsg = 'Staff added successfully';
     setTimeout(() => {
      this.transMsg = null;
  }, 4000);
     this.staff = new Person();
   }, (e) => {
    this.errLine = 'Could not add staff';
    this.processing = false;
  });
  }
  updateAccount() {
    this.processing = true;
    this.staff.info.personal.username  = (
      this.staffs[this.staffIndex].info.personal.firstName ===
      this.staff.info.personal.firstName) ? this.staff.info.personal.username :
      this.staff.info.personal.firstName.toLowerCase();
      this.dataService.updateInfo(this.staff.info, this.staff._id).subscribe((edited: Person ) => {
      this.staffs[this.staffIndex] = edited;
      this.staff = edited;
      this.transMsg = 'Account updated successfully';
      this.processing = false;
    }, (e) => {
      this.errLine = 'Could not updated account';
      this.processing = false;
    });
  }
  selectStaff(staff, i) {
    this.staffIndex = i;
    this.staff = cloneDeep(staff);
    this.switchView('view') ;

  }
  switchView(view: string) {
    this.staffMode = view;
  }
  addDepartment() {
    this.processing = true;
    const copy = cloneDeep(this.client);
    this.department = {...this.department , name: this.deptName, rooms: this.rooms};
    copy.departments.unshift(this.department);
    this.dataService.updateClient(copy).subscribe((client: Client) => {
      this.client.departments = client.departments;
      this.processing = false;
      this.transMsg = 'Department added successfully';
      this.department = new Department();
      this.rooms = [];
      this.numbOfBeds = null;
      this.roomNumb = 1;
      this.processing = false;
      setTimeout(() => {
        this.transMsg = null;
    }, 4000);
    }, (e) => {
      this.transMsg = 'Could not add department';
      this.processing = false;
    }
    );
  }
}
