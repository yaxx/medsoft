import { Component, OnInit } from '@angular/core';
import {Client} from '../../models/client.model';
import {Person} from '../../models/person.model';
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
signin = true;
loginError = false;
accountExist = false;
loading = false;
creating = false;
client:Client = new Client();

  constructor(
    private accountService: DataService,
    private socket: SocketService,
    private cookie: CookieService, private router: Router
    ) { }

  ngOnInit() {
  }
  switch() {
    this.signin = false;
  }
  hideError(){
    this.loginError = false;
  }
  login() {
    this.loading = true;

    this.accountService.login(this.user).subscribe((person: any) => {
      if(person.info.official) {
        this.cookie.set('i', person._id);
        this.cookie.set('h', person.info.official.hospId);
        this.socket.io.emit('login', {ui: person._id, lastLogin: person.info.lastLogin})
      let route = null;
      const role = person.info.official.role;

      switch (role) {
        case 'Doctor':
          route = `/${person.info.official.department.toLowerCase()}/consultation`;
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
          this.router.navigate(['/account']);
      }
    },
     (err) => {
      this.loading = false;
        this.loginError = true;
    });
  }
  signup() {
    this.creating = true;
    console.log(this.client)
    this.accountService.createClient(this.client).subscribe((res:any) => {
      this.cookie.set('i', res._id);
      this.creating = false;
      this.loading = false;
      this.client = new Client();
      this.router.navigate(['/account']);
    } , (err) => {
      this.accountExist = true;
      this.creating = false;
  });
  }
}
