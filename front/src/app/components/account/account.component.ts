import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {Client, Department, Bed} from '../../models/client.model';
import {Connection, Connections, Info, Person} from '../../models/person.model';
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  department: Department = new Department();
  info: Info = new Info();
  staff: Person = new Person();
  staffs: Person[] = new Array<Person>();
  departments: Department[] = [];
  connections: Connections =  new Connections();
  connection: Connection =  new Connection();
  hovers = new Array<boolean>(9);
  checked = new Array<boolean>(9);
  selectedDept: Department = new Department();
  selectedDept2: Department = new Department();
  client: Client  = new Client();
  cachedClient: Client  = new Client();
  bed: Bed = new Bed();
  loading = false;
  bedNumber = 0;
  infomode = 'view';
  deptsmode = 'view';
  staffmode = 'view';
  action = 'new';
  exist = false;

  constructor(private dataService: DataService, private router: Router) { }
  ngOnInit() {
    this.dataService.getClient().subscribe((res: any) => {
      this.client = res.client;
      this.cachedClient = res.client;
      this.staffs = res.client.staffs;
      this.departments = res.departments;
    });

    // this.dataService.getDepartments().subscribe((dept: Department[]) => {
    //   this.departments = dept;
    //   this.selectedDept  = dept[0];
    // });
  }
  unhovered(n: number) {
    this.hovers[n] = this.checked[n] ? true : false;
  }
  hovered(n: number) {
    this.hovers[n] = true;
  }
  infoChecked() {
    return this.checked.some((i) => i === true);
  }
  // newStaff(mode) {
  //   this.staffmode = mode;
  // }
  switchMode(mode: string, face: string) {
    switch (mode) {
      case 'infomode': this.infomode = face;
      break;
      case 'deptsmode':
      this.client.departments.forEach((d)=> {
        this.departments = this.departments.filter(dep=>dep.name!==d.name)
      })
      this.deptsmode = face;
      break;
      case 'staffmode': this.staffmode = face;
      this.selectedDept = new Department();
      break;
      default:
      break;
    }
   }
   switchToEditDept(mode: string, face: string, i) {
     this.switchMode(mode,face);
     this.departments.unshift(this.client.departments[i]);
     this.selectedDept = {...this.client.departments[i]};
   }
   checkDept(name) {
     if (this.client.departments.some((dept) => dept.name === name)) {
        this.exist = true;
        this.selectedDept = this.departments.filter((dept) => dept.name === name)[0];
     } else {
        this.exist = false;
        this.selectedDept = this.departments.filter((dept) => dept.name === name)[0];
     }
   }
   checkStaff(name) {
    this.selectedDept2 = this.departments.filter((dept) => dept.name === name)[0];
     this.staff.info.official.department = this.selectedDept2.name;
   }
   generatePassword(): string {
    return Math.floor(Math.random() * (10000 - 1000 + 1) + 1000).toString();
  }
  addStaff() {
    this.staff.info.personal.password = this.generatePassword();
    this.staff.info.personal.username = this.staff.info.personal.firstName.toLowerCase();
     this.staff.info.official.hospital = this.client._id;
     this.dataService.addPerson(this.staff).subscribe((staff: Person) => {
     this.staffs.push(staff);
     this.staff = new Person();
     this.staffmode = 'view';
   });
  }

  // deleteStaff(staff) {
  //   this.dataService.updateStaff(staff).subscribe((doc) => {
  //     this.client.staffs = this.client.staffs.filter((s) => s._id !== staff._id);
  //   });
  // }
  selectStaff(staff: Person) {
    this.staff = staff;
    this.selectedDept2 = this.departments.filter((dept) => dept.name === staff.info.official[0].department)[0];
    this.action = 'update';
    this.switchMode('staffmode', 'newstaff');
  }

  selectDept(dept) {
    this.selectedDept = dept;
  }
  addDepartment() {
    this.loading = true;
    if (this.selectedDept.hasWard) {
      for(let i = 0; i < this.bedNumber; i++) {
        this.selectedDept.beds.push(new Bed(i + 1));
      }
      this.selectedDept.numOfBeds = this.bedNumber;
      this.client.departments.push(this.selectedDept);
      this.dataService.updateClient(this.client).subscribe((client: Client) => {
        this.selectedDept = new Department();
        this.client.departments = this.client.departments;
        this.loading = false;
    });
    } else {
        this.client.departments.push(this.selectedDept);
        this.dataService.updateClient(this.client).subscribe((client: Client) => {
          this.selectedDept = new Department();
          // this.cachedClient = client;
          this.client.departments = this.client.departments;
          this.loading = false;
      });
  }
}
getDp(p: Person) {
  return 'http://localhost:5000/api/dp/' + p.info.personal.avatar;
}
}


