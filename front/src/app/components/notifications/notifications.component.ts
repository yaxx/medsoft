import { Component, OnInit } from '@angular/core';
import { Note} from '../../models/record.model';
import {ActivatedRoute, Router} from '@angular/router';
import {SocketService} from '../../services/socket.service';
import {DataService} from '../../services/data.service';
import * as cloneDeep from 'lodash/cloneDeep';
import {Meta} from '../../models/inventory.model';
import {CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Note[] = [];
  notification: Note = new Note();
  index = null;
  processing = false;
  loading = false;
  message = null;
  feedback = null;
  succMessage = null;
  errLine = null;
  constructor(private dataService: DataService,
    private router: Router,
    private cookies: CookieService,
    private socket: SocketService) { }

  ngOnInit() {
    this.getNotifications();
  }

getNotifications() {
  this.loading = true;
  this.dataService.getNotifications().subscribe((notifications: Note[]) => {
    this.loading = false;
    this.notifications = notifications;
    this.feedback = (notifications.length) ?  null : 'NO NOTIFICATIONS';
  }, (e) => {
    this.feedback = 'NETWORK ERROR';
    this.loading = false;
  });
}
selectNotification(i) {
  this.index =  i;
  this.notification = cloneDeep(this.notifications[i]);
}
clear() {
  this.succMessage = null;
  this.errLine = null;
}
addNotifications() {
  this.processing = true;
  this.notification = {
    ...this.notification, 
    meta: new Meta(this.cookies.get('i'), false, new Date())};
  this.dataService.addNotifications(this.notification).subscribe((notification: Note) => {
    this.processing = false;
    this.notifications.unshift(notification);
    this.notification = new Note();
    this.succMessage = 'Post Succesfull';
  }, (e) => {
    this.errLine = 'Unable to update notifications';
    this.processing = false;
  });
}
refresh() {
  this.getNotifications();
}

}
