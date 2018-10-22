import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {Setting, Department, Main, Staff} from '../../models/data.model';
// import {Patient, Personal, Contact, Insurance} from '../../models/data.model';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
department: Department = new Department();
main: Main = new Main();
staff: Staff = new Staff();
departments: Department[] = [];
settings: Setting = new Setting();
hosId = '';
step = 1;
  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit() {
    this.dataService.getSettings().subscribe((s) => {
      console.log(s);
      this.settings = new Setting(s['main'], s['departments'], s['staffs']);
      this.main = s['main'];
      this.hosId = s['_id'];
    });
    this.dataService.getDepartments().subscribe((dept: Department[]) => {
      this.departments = dept;
    });
  }
  generatePassword(): number {
    return Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
  }
  addStaff() {
    this.staff.hosId = this.hosId;
    this.staff.username = this.staff.firstName.toLowerCase();
    this.staff.password = this.generatePassword().toString();
    this.dataService.addStaff(this.staff).subscribe((newstaff: Staff) => {
      this.settings.staffs.push(newstaff);
      this.staff = new Staff();
    });


  }
  selectDept(i) {
    if (this.departments[i].selected) {
      this.departments[i].selected = false;

    } else {
      this.departments[i].selected = true;
    }


  }
  addDept() {
    const selectedDepts = this.departments.filter((dept) => dept.selected === true
    );
    for (let d of selectedDepts) {
      d.selected = false;

    }
    this.dataService.addDepts(selectedDepts).subscribe((dept: Department[]) => {
      console.log(selectedDepts);

      for (let d of this.departments) {
        d.selected = false;

      }
      this.settings.department= this.settings.department.concat(selectedDepts);
    });
  }


}
