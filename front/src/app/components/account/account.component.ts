import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {Client, Department, Info, Staff} from '../../models/data.model';
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  department: Department = new Department();
  info: Info = new Info();
  staff: Staff = new Staff();
  departments: Department[] = [];
  hovers = new Array<boolean>(9);
  checked = new Array<boolean>(9);
  selectedDept: Department = new Department();
  selectedDept2: Department = new Department();
  client: Client  = new Client();
  infomode = 'view';
  deptsmode = 'view';
  staffmode = 'view';
  action = 'new';
  exist = false;
  constructor(private dataService: DataService, private router: Router) { }
  ngOnInit() {
    this.dataService.getClient().subscribe((client: Client) => {
      this.client = client;
    });

    this.dataService.getDepartments().subscribe((dept: Department[]) => {
      this.departments = dept;
      this.selectedDept  = dept[0];
    });
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
      case 'deptsmode': this.deptsmode = face;
      break;
      case 'staffmode': this.staffmode = face;
      this.selectedDept = new Department();
      break;
      case 'allmodes': this.staffmode = this.deptsmode = face;
      break;
      default:
      break;
    }
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
     this.staff.department = this.selectedDept2.name;

   }
   generatePassword(): number {
    return Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
  }
  addStaff() {
    if (!this.selectedDept2.hasWard) {
       this.staff.role = null;
     } else {

     }
    this.staff.hosId = this.client._id;
    this.staff.username = this.staff.firstName.toLowerCase();
    this.staff.password = this.generatePassword().toString();
    this.dataService.saveStaff(this.staff, this.action).subscribe((staff: Staff) => {
      this.client.staffs = this.client.staffs.filter((s) => s._id !== this.staff._id);
      this.client.staffs.push(staff);
      this.staff = new Staff();
      this.action = 'new';
      this.switchMode('staffmode', 'view');
    });

  }
  deleteStaff(staff) {
    this.dataService.saveStaff(staff, 'delete').subscribe((doc) => {
      this.client.staffs = this.client.staffs.filter((s) => s._id !== staff._id);
    });
  }
  selectStaff(staff: Staff) {
    this.staff = staff;
    this.selectedDept2 = this.departments.filter((dept) => dept.name === staff.department)[0];
    this.action = 'update';
    this.switchMode('staffmode', 'newstaff');
  }

  selectDept(dept) {
    this.selectedDept = dept;
  }
  addNewDept() {
    if (this.selectedDept.hasWard) {
    this.selectedDept.beds = new Array<Boolean>(this.selectedDept.numOfBeds);
    this.dataService.addDepts(this.selectedDept).subscribe((dept: Department[]) => {
      this.selectedDept = new Department();
      this.client.departments = dept;
      this.deptsmode = 'view';
    });
    } else {
      this.dataService.addDepts(this.selectedDept).subscribe((dept: Department[]) => {
        this.selectedDept = new Department();
        this.client.departments = this.client.departments.concat(dept);
        this.deptsmode = 'view';
      });
  }
}
}
  // addDept() {
  //   const selectedDepts = this.departments.filter((dept) => dept.selected === true
  //   );
  //   for (let d of selectedDepts) {
  //     d.selected = false;

  //   }
  //   this.dataService.addDepts(selectedDepts).subscribe((dept: Department[]) => {
  //     console.log(selectedDepts);

  //     for (let d of this.departments) {
  //       d.selected = false;

  //     }
  //     this.client.department= this.client.department.concat(selectedDepts);
  //   });
  // }

