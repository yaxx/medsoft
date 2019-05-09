import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {Client, Department, Bed, Room} from '../../models/client.model';
import {Connection, Connections, Info, Person} from '../../models/person.model';
import {CookieService } from 'ngx-cookie-service';
import * as cloneDeep from 'lodash/cloneDeep';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
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
  staffmode = 'view';
  roomNumb = 1;
  deptName = null;
  message = null;
  menu = false;
  transMsg = null;
  constructor(private dataService: DataService, private cookies: CookieService, private router: Router) { }

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

    },(e) => {
      this.message = 'Something went wrong';
      this.loading = false;
    });
  }
  getDp(avatar: String) {
    return 'http://localhost:5000/api/dp/' + avatar;
  }

  getMyDp() {
    return this.getDp(this.cookies.get('d'))
  }
  showMenu(){
    this.menu =  true;
  }
  getRoomNumbs() {
   return this.department.rooms.length + 1;
  }
  addRoom() {
    const beds = [];
    for(let i = 0; i < this.numbOfBeds; i++) {
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
  openStafftModal(){

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
  isAddminStaff(){
    const dept = this.departments.find(department => department.name === this.staff.info.official.department);
    if(dept) {
      this.staff.info.official.department = dept.name;
      return  dept.hasWard;
    } else {return false;}

  }
  deptHasWard() {
   this.department = this.departments.find(department => department.name === this.department.name ||null);
   if(this.department) {
    return  this.department.hasWard;
  } else {return false;}

  }
  generatePassword(): string {
    return Math.floor(Math.random() * (10000 - 1000 + 1) + 1000).toString();
  }
  addStaff() {
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
    this.transMsg = 'Could not add staff';
    this.processing = false;
  });
  }
  selectStaff(staff) {
    this.staff = staff;
    console.log(this.staff);

  }

  addDepartment() {
    this.processing = true;
    const copy = cloneDeep(this.client);
    this.department = {...this.department , name: this.deptName, rooms: this.rooms};
    copy.departments.unshift(this.department);
    this.dataService.updateClient(copy).subscribe((client: Client) => {
      this.client = client;
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
