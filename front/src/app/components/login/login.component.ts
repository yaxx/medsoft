import { Component, OnInit } from '@angular/core';
import {Client, Department, Main, Person} from '../../models/data.model';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {CookieService } from 'ngx-cookie-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
 user = {
   username: null,
   pwd: null
};


  constructor(
    private data: DataService,
    private socket: SocketService,
    private cookie: CookieService, private router: Router
    ) { }

  ngOnInit() {
  }
  login() {
    this.data.login(this.user).subscribe((person: Person) => {
      this.cookie.set('i', person._id);
      this.cookie.set('h', person.info.official.hospId);
      this.socket.io.emit('login', {ui: person._id, lastLogin: person.info.lastLogin});
      let route = null;
      const role = person.info.official.role;
      switch (role) {
        case 'doctor':
          route = `department/${person.info.official.department.toLowerCase()}/consultation`;
          break;
        case 'Nurse':
          route = `department/${person.info.official.department.toLowerCase()}/ward`;
        break;
        default:
          route = `department/${person.info.official.department.toLowerCase()}`;
        break;
      }
      this.router.navigate([route]);
 
      }
     , (err) => {

    });
  }
}
