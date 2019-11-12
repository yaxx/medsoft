import { Component, AfterViewInit , OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {CookieService } from 'ngx-cookie-service';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
// import { AutosizeDirective } from 'angular-autosize';
import { Connection, Person, Info, Notification } from '../../models/person.model';
import { Message } from '../../models/message.model';
// const uri = 'http://localhost:5000/api/upload';
const uri = 'http://192.168.1.100:5000/api/upload';
@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements  OnInit {
url = null;
uploader: FileUploader = new FileUploader({url: uri});
people = 'followings';
leftcard = 'contacts';
file: File = null;
curMessages: any[] = [];
cardView = null;
curPerson = new Connection();
follows: Person[] = [];
contacts: any[] = [];
message = null;
me = null;
person: Person = new Person();
sugestions: Person[] = [];
hovers = [0, 0, 0, 0];
input = [0, 0, 0, 0];
rightCard = 'profile';
leftCard = '';
editing = null;
errLine = false;
showMenu = false;
oldPwd = null;
  constructor( private data: DataService, private cookies: CookieService, public socket: SocketService
  ) {}
  ngOnInit() {
      this.getMyAccount();
      this.me = this.cookies.get('i');
      this.socket.io.on('new message', (data) => {
        // this.curPerson.messages = data.msgs;
        if(this.curPerson.person._id === data.sender){
            this.curPerson.messages = data.msgs.map(m1 => m1.map(m2 => ({...m2, read: true})))
            // this.curMessages = data.msg.map(m1 => m1.map(m2 => ({...m2, read: true})))
        }
        this.contacts.map(contact => {
          return (contact.person._id === data.msg.sender) ? ({...contact, messages: data.msg}) : contact;
        })
      });
      this.socket.io.on('online', (data) => {
        this.contacts.forEach(contact => {
          if (contact.person._id === data.sender) {
              contact.person.info.online = true;
          }
        });
      });
      this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any ) => {
        this.person.info.personal.avatar = response;
         this.data.updateInfo(this.person.info, this.person._id).subscribe((info: Info) => {
           this.person.info = info;
        });
       };
   }

   fileSelected(event) {
    
      this.file = <File>event.target.files[0];
      const reader = new FileReader();
       reader.readAsDataURL(event.target.files[0]); // read file as data url
       reader.onload = (e) => {
        let ev = <any>e; // called once readAsDataURL is completed
        this.url = ev.target.result;
      };
    

  }
getLastMessage(msgs){
 let lastMsg = msgs.length ? msgs[msgs.length-1].filter(m => !m.read && m.sender !== this.person._id) : [];
  return lastMsg.length? lastMsg.reverse()[0] : null;
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
    if (this.curPerson.messages.length) {
      if (this.curPerson.messages[this.curPerson.messages.length - 1][0].sender === this.cookies.get('i')) {
        this.curPerson.messages[this.curPerson.messages.length - 1].push(new Message(this.message, this.cookies.get('i'), this.curPerson.person._id));
       } else {
       this.curPerson.messages.push(new Array<Message>(new Message(this.message, this.cookies.get('i'), this.curPerson.person._id)));
       }
  } else {
    this.curPerson.messages[0] = new Array<Message>(new Message(this.message, this.cookies.get('i'), this.curPerson.person._id));
  }
  this.socket.io.emit('new message', {msgs: this.curPerson.messages, sender: this.cookies.get('i'), reciever: this.curPerson.person._id});

  }
  switchPeople(view: string) {
    this.cardView = 'connections';
    this.people = view;
    // this.data.getConnections(this.person.connections._id).subscribe((con: any) => {
    //   this.follows = view === 'followers' ? con.people.filter(person => person.follower) : con.people.filter(person => person.following);

    // });

  }
  switchLeftCard(view: string) {
    this.leftcard = view;
    this.explore();
    // this.data.getConnections(this.person.connections._id).subscribe((con: any) => {
    //  this.contacts = con.people.filter(person => person.follower && person.following);
    // });
  }
  backToConact(){
    this.leftcard = 'contacts';
  }
  getMyAccount() {
    this.data.getMyAccount().subscribe((me: Person) => {
      this.person = me;
      // this.contacts = res.c.people.filter(person => (person.follower && person.following));
     });
  }
  back(view) {
    this.rightCard = view;
  }
   getDp(avatar: String) {
    // return 'http://localhost:5000/api/dp/' + avatar;
    return 'http://13.59.243.243/api/dp/' + avatar;
  }

  getMyDp() {
    return this.getDp(this.cookies.get('d'))
  }
  getMsgDp(id: string) {
      return (id === this.curPerson.person._id) ? 'http://localhost:5000/api/dp/' + this.curPerson.person.info.personal.avatar : 'http://localhost:5000/api/dp/' + this.person.info.personal.avatar;
      // return (id === this.curPerson.person._id) ? 'http://192.168.1.100:5000/api/dp/' + this.curPerson.person.info.personal.avatar : 'http://192.168.1.100:5000/api/dp/' + this.person.info.personal.avatar;

  }
  explore() {
    this.data.explore().subscribe((suggestions: Person[]) => {
         this.sugestions = suggestions.filter(p => p._id !== this.cookies.get('i'));
    });
  }
  selectPerson(person) {
    this.curPerson = person;
      if (person.messages.length) {
      this.curMessages = person.messages.map(m1 => m1.map(m2 => ({...m2, read: true})));
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
  switchRightCard(view) {
    this.rightCard = view;
  }
  getFollowers() {
    return this.person.connections.people.filter(person => person.follower);
  }
  getFollowings() {
    return this.person.connections.people.filter(person => person.following);
  }

  getContacts() {
    return this.person.connections.people.filter(contact => contact.follower && contact.following);
  }
  follow(person, i) {
    console.log(person);
     this.data.follow(person._id).subscribe((res: any) => {
      this.person.connections.people.push(new Connection(person, true ));
      this.sugestions.splice(i, 1);
    });
  }
  followBack(person: Person, i) {
    this.data.followBack(person._id).subscribe((res: any) => {
      this.person.connections.people[i].follower = true;
     
  });
}
  unFollow(you: Person) {
    this.data.unFollow(this.person.connections._id, you)
  .subscribe((res: any) => {
      this.person.connections = res;
  });
}

}
