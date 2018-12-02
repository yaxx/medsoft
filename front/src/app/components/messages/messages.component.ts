import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
test = null;
  constructor(
    private dataService: DataService,
    private cookie: CookieService,
    private socket: SocketService
  ) { }

  ngOnInit() {
  }
  sendMessage($event) {
    if($event.keyCode === 13 ) {
      $event.preventDefault();
    } else {
      const key = $event.which || $event.keyCode;
      console.log(key);
    }


  }

}
