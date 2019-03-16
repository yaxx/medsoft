import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {CookieService } from 'ngx-cookie-service';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';

import { Connection, Person, Notification } from '../../models/person.model';
import { Message } from '../../models/message.model';
const uri = 'http://localhost:5000/api/upload';
@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
url = null;
uploader: FileUploader = new FileUploader({url: uri});
people = '';
leftcard = 'contacts';
file: File = null;
curConversations: any[] = new Array<any>(new Array<Message>(new Message()));
cardView = null;
curPerson = new Person();
follows: Person[] = new Array<Person>();
contacts: any[] = [];
message = null;
me = null;
person: Person = new Person();
colegues: Person[] = new Array<Person>();
hovers = [0, 0, 0, 0];
input = [0, 0, 0, 0];
rightCard = 'profile';
leftCard = '';
editing = null;
errLine = false;
showMenu = false;
oldPwd = null;
  constructor(
    private data: DataService,
    private cookies: CookieService,
    public socket: SocketService
  ) {}
  ngOnInit() {
      this.getMyAccount();
      this.me = this.cookies.get('i');
      this.socket.io.on('new message', (data) => {
        console.log(data);
        this.curConversations = data.msgs;
        this.contacts.forEach(contact => {
          if (contact.person === data.sender) {
              contact.conversations = data.msgs;
          } else {

          }
        });
        if (this.curPerson._id === data.sender) {
          this.curConversations = data.msgs;
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
      this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any ) => {
        this.person.info.personal.dpUrl = response;
         this.data.updateInfo(this.person).subscribe((person: Person) => {
           this.person = person;
        });
       };
   }
   fileSelected(event) {
    if (event.target.files && event.target.files[0]) {
      this.file = <File>event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (e) => {
        let ev = <any>e; // called once readAsDataURL is completed
        this.url = ev.target.result;
      };
    }

  }

  getMe() {
    return this.cookies.get('i');
  }
  showInput(i: number) {
    this.input[i] = 1;
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
  this.socket.io.emit('new message', {msgs: this.curConversations, sender: this.cookies.get('i'), reciever: this.curPerson._id});
  console.log(this.curConversations);
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
  getDp(p:Person) {

      return 'http://localhost:5000/api/dp/' + p.info.personal.dpUrl;
  
  }
  getMsgDp(id: string) {
    if(id===this.curPerson._id){
      return 'http://localhost:5000/api/dp/' + this.curPerson.info.personal.dpUrl;
    } else {
      return 'http://localhost:5000/api/dp/' + this.person.info.personal.dpUrl;
    }
    
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
  updateProfile() {
    this.person.info = this.editing;
    if(this.url) {
      if(this.oldPwd) {
       if(this.editing.personal.password === this.oldPwd){
        this.person.info.personal.password = this.oldPwd;
        this.uploader.uploadAll();
        this.rightCard = 'profile';
        this.input = [0, 0, 0, 0];
       } else {
        this.errLine = true;
       }
      } else {
        this.uploader.uploadAll();
        this.rightCard = 'profile';
        this.input = [0, 0, 0, 0];
        this.showMenu = false;
      }
    } else if(this.oldPwd) {
      if(this.editing.personal.password === this.oldPwd) {
        this.person.info.personal.password = this.oldPwd;
        this.uploader.uploadAll();
        this.rightCard = 'profile';
        this.input = [0, 0, 0, 0];
        this.showMenu = false;
    } else {
      this.errLine = true;
    }
    } else {
    this.uploader.uploadAll();
    this.rightCard = 'profile';
    this.input = [0, 0, 0, 0];
    this.showMenu = false;
   }
  }
  toggleMenu() {
    this.showMenu = this.showMenu ? false : true;
  }
  switchToEdit(view: string) {
    this.editing = this.person.info;
    this.switchMenu(view);
    this.toggleMenu();
  }
  switchMenu(view: string) {
  this.rightCard = view;
  this.toggleMenu();
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

    if (i !== -1) {
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
