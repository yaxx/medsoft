import { Component, OnInit } from '@angular/core';
import {Client, Department, Main, Staff} from '../../models/data.model';
import {DataService} from '../../services/data.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  staff: Staff = new Staff();
  in =  false;

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit() {
  }
  login() {
    this.dataService.login(this.staff).subscribe((staff: Staff) => {
       this.in = false ;
       this.dataService.staff = staff;
       this.router.navigate([`/${staff.department.toLowerCase()}`]);
    }, (err) => {
      this.in = true;
    });
  }
}
