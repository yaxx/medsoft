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
leftcard = 'contacts';
curConversations: any[] = new Array<any>(new Array<Message>(new Message()));
curPerson = new Person();
follows: Person[] = new Array<Person>();
contacts: any[] = [];
message = null;
me = null;
person: Person = new Person();
colegues: Person[] = new Array<Person>();

  constructor(
    private data: DataService,
    private cookies: CookieService,
    public socket: SocketService
  ) {}
  ngOnInit() {
      this.getMyAccount();
      this.me = this.cookies.get('i');
      this.socket.io.on('new message', (data) => {
        this.curConversations = data.convs;
        this.contacts.forEach(contact => {
          if (contact.person === data.sender) {
              contact.conversations = data.convs;
          } else {

          }
        });

        if (this.curPerson._id === data.sender) {
          this.curConversations = data.convs;
        } else {

        }
      });

      this.socket.io.on('online', (data) => {
        this.contacts.forEach(contact => {
          if (contact.person._id === data.sender) {
              contact.person.info.online = true;
          } else {

          }
        });
      });
   }


  getMe() {
    return this.cookies.get('i');
  }


  check($event) {
    if ($event.keyCode === 13 ) {
      $event.preventDefault();
      this.sendMessage();
      this.message = null;
    } else {

    }
  }
  sendMessage() {
    if (this.curConversations[0][0].sender !== null) {
      if (this.curConversations[this.curConversations.length - 1][0].sender === this.cookies.get('i')) {
        this.curConversations[this.curConversations.length - 1].push(new Message(this.message, this.cookies.get('i'), this.curPerson._id));

       } else {
       this.curConversations.push(new Array<Message>(new Message(this.message, this.cookies.get('i'), this.curPerson._id)));
       }
  } else {
    this.curConversations[0] = new Array<Message>(new Message(this.message, this.cookies.get('i'), this.curPerson._id));
  }
  this.socket.io.emit('new message', {convs: this.curConversations, sender: this.cookies.get('i'), reciever: this.curPerson._id});
  }
  switchPeople(view: string) {
    this.cardView = 'connections';
    this.people = view;
    this.data.getConnections(this.person.connections._id).subscribe((con: any) => {
      this.follows = view === 'followers' ? con.people.filter(person => person.follower) : con.people.filter(person => person.following);

    });

  }
  switchLeftCard(view: string) {
    this.leftcard = view;
    this.data.getConnections(this.person.connections._id).subscribe((con: any) => {
     this.contacts = con.people.filter(person => person.follower && person.following);
    });
  }
  getMyAccount() {
    this.data.getMyAccount().subscribe((res: any) => {
      this.person = res.p;
      this.contacts = res.c.people.filter(person => (person.follower && person.following));

     });

  }
  back() {
    this.cardView = 'me';
    this.people = '';
  }

  explore() {
    this.data.explore().subscribe((suggestions: Person[]) => {
      if (this.person.connections.people.length) {
        const filter = suggestions.filter(p => p._id !== this.cookies.get('i'));
        filter.forEach((person) => {
          this.person.connections.people.forEach((contact) => {
            if (contact.person !== person._id) {
              this.colegues.push(person);
            } else {
          }
        });
      });
      } else {
         this.colegues = suggestions.filter(p => p._id !== this.cookies.get('i'));
      }
    });
  }
  selectPerson(person) {
    this.curPerson = person.person;
      if (person.conversations.length) {
      this.curConversations = person.conversations;
     } else {

     }

  }



  getFollowers() {
    return this.person.connections.people.filter(p => p.follower);
  }
  getFollowings() {
      return this.person.connections.people.filter(p => p.following);
  }
  follow(you: any) {
    const myConnects = this.person.connections;
    const yourConnects = you.connections;
    const i = myConnects.people.findIndex((p) => {
      return p.person._id === you._id;
    });
    
    if (i!==-1) {
      const j = yourConnects.people.findIndex((me) => {
        return me.person === this.person._id;
      });
      myConnects.people[i].following = true;
      yourConnects.people[j].follower = true;
    } else {
      myConnects.people.push(new Connection(you._id, true, false, false, new Array<Message>()));
      yourConnects.people.push(new Connection(this.cookies.get('i'), false, true, false, new Array<Message>()));
      yourConnects.notifications.push(new Notification(this.person._id, 'follow', 'follows you', new Date()));
    }
   
      // this.socket.io.emit('newfollower', res.yourconnect);

    this.data.follow(myConnects, yourConnects).subscribe((res: any) => {
      this.person.connections = res.myconnect;
    });
  }
followBack(you: Person) {
  this.data.followBack(this.person.connections._id, you,
    new Notification(this.person._id, 'follow', 'followed back', new Date())).subscribe((res: any) => {
      this.person.connections = res;
  });
}
unFollow(you: Person) {
  this.data.unFollow(this.person.connections._id, you)
  .subscribe((res: any) => {
      this.person.connections = res;
  });
}

}
