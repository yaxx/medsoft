import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {CookieService } from 'ngx-cookie-service';
import { Connection, Person, Notification, Message} from '../../models/data.model';
@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
test = null;
cardView = 'me';
people = '';
person: Person = new Person();
colegues: Person[] = new Array<Person>();
conversations = [
  [
    {message: 'hi', sender: 'me'},
    {message: 'are you still comming home?', sender: 'me'}
  ],
  [
    {message: 'dont forget to call me', sender: 'bot'},
    {message: 'remind me', sender: 'bot'}
  ]
];
  constructor(
    private data: DataService,
    private cookie: CookieService,
    private socket: SocketService
  ) {}
  ngOnInit() {
      this.getMyAccount();
  }
  switchPeople(view: string){
    this.cardView = 'connections';
    this.people = view;
  }
  getMyAccount() {
    this.data.getMyAccount().subscribe((me: Person) => {
      this.person = me;
      console.log(me);
     });
  }
  explore() {
    this.data.explore().subscribe((suggestions: Person[]) => {
      if (this.person.connections.people.length) {
        const filter = suggestions.filter(p => p._id !== this.cookie.get('i'));
        filter.forEach((person) => {
          this.person.connections.people.forEach((contact) => {
            if (contact.person !== person._id) {
              this.colegues.push(person);
            } else {
          }
        });
      });
      } else {
        this.colegues = suggestions.filter(p => p._id !== this.cookie.get('i'));
      }
    });
  }

  followBack(person){

  }
  getFollowers() {
    return this.person.connections.people.filter(p => p.follower && !p.following);
  }
  getFollowings() {
      return this.person.connections.people.filter(p => p.following && !p.follower);
  }
  follow(you: Person) {
    const myConnects = this.person.connections;
    const yourConnects = you.connections;
    myConnects.people.push(new Connection(you._id, true, false, false, new Array<Message>()));
    yourConnects.people.push(new Connection(this.cookie.get('i'), false, true, false, new Array<Message>()));
    yourConnects.notifications.push(new Notification(this.person._id, 'follow', 'follows you', new Date()));


    this.data.follow(myConnects, yourConnects).subscribe((res: any) => {
      this.person.connections = res.myconnect;
      // this.socket.io.emit('newfollower', res.yourconnect);
    });

  }

  sendMessage($event) {
    if ($event.keyCode === 13 ) {
      $event.preventDefault();
    } else {
      const key = $event.which || $event.keyCode;
      console.log(key);
    }


  }

}
