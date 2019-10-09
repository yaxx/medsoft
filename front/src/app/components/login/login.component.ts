import { Component, OnInit } from '@angular/core';
import {Client} from '../../models/client.model';
import {Person} from '../../models/person.model';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {CookieService } from 'ngx-cookie-service';
import {Router} from '@angular/router';
// const { session } = require('electron')

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
 user = {
   username: null,
   password: null
};
signin = true;
loginError = false;
accountExist = false;
loading = false;
creating = false;
client: Client = new Client();
cred = {
  username: null,
  password: null,
  comfirm: null
}
  constructor(
    private accountService: DataService,
    private socket: SocketService,
    private cookie: CookieService, private router: Router
    ) { }

  ngOnInit() {
    // ElectronCookies.enable({
    //   origin: 'http://localhost/4200',
    // });
  }
  switch() {
    this.signin = false;
  }
  routeHas(path) {
    return this.router.url.includes(path);
  }
  hideError() {
    this.loginError = false;
  }
  login() {
    this.loading = true;
    this.accountService.login(this.user).subscribe((person: Person) => {
      if( person.info.official.role !== 'admin') {
        this.cookie.set('i', person._id);
        this.cookie.set('h', person.info.official.hospital);
        this.cookie.set('d', person.info.personal.avatar);
        this.socket.io.emit('login', {ui: person._id, lastLogin: person.info.lastLogin});
        let route = null;
        const role = person.info.official.role;
        switch (role) {
          case 'Doctor':
            route = `/${person.info.official.department.toLowerCase()}`;
            break;
          case 'Nurse':
            route = `/${person.info.official.department.toLowerCase()}/ward`;
          break;
          default:
            route = `/${person.info.official.department.toLowerCase()}`;
          break;
        }
        this.router.navigate([route]);      
      } else {
        this.cookie.set('i', person._id);
        this.cookie.set('h', person.info.official.hospital);
        this.cookie.set('d', person.info.personal.avatar);
        this.socket.io.emit('login', {ui: person._id, lastLogin: person.info.lastLogin});
        this.router.navigate(['/admin']);
        }
    },(err) => {
        this.loading = false;
        this.loginError = true;
    });

  }
  signup() {
    this.creating = true;
    this.accountService.createClient({client: this.client, cred: this.cred}).subscribe((person: Person) => {
      this.cookie.set('i', person._id);
      this.cookie.set('h', person.info.official.hospital);
      this.cookie.set('d', person.info.personal.avatar);
      this.creating = false;
      this.loading = false;
      this.client = new Client();
      this.socket.io.emit('login', {ui: person._id, lastLogin: person.info.lastLogin})
      this.router.navigate(['/admin']);
    } , (err) => {
      this.accountExist = true;
      this.creating = false;
  });
  }
}
