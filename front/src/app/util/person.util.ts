import {Person, Info} from '../models/person.model';
import {DataService} from '../services/data.service';
import { Injectable } from '@angular/core';
import {states, lgas } from '../data/states';
import { Invoice, Meta, Card} from '../models/inventory.model';
import {CookieService } from 'ngx-cookie-service';
import {Visit} from '../models/record.model';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import { SocketService } from '../services/socket.service';
const uri = 'http://localhost:5000/api/upload';
@Injectable({
    providedIn: 'root'
  })
export  class PersonUtil {
    updating  = false;
    creating = false;
    enrolling = false;
    file: File = null;
    states = states;
    uploader: FileUploader = new FileUploader({url: uri});
    lgas = lgas;
    card = new Card();
    reg = true;
    invoice = new Invoice();
    info = new Info();
    url = null;
    visit  = new Visit();
    errorMsg = null;
    successMsg = null;
    person: Person = new Person();
    constructor(
        private socket: SocketService,
        private cookies: CookieService, 
        private backEnd: DataService
         ) {
        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any ) => {
            this.person.info.personal.avatar = response;
        };
    }
    withCard() {
        return (this.person.info.personal.firstName) &&
        (this.person.info.personal.lastName) && 
        (this.person.info.personal.dob) &&
        (this.person.record.cards[0].pin);
    }
    withoutCard() {
        return (this.person.info.personal.firstName) &&
        (this.person.info.personal.lastName) && 
        (this.person.info.personal.dob); 
    }
    isValidInfo() {
        return (!this.reg) ? this.withCard() : this.withoutCard();
      }
    isValidContact() {
        return (this.person.info.contact.me.mobile) && (this.person.info.contact.emergency.mobile) &&
        (this.person.info.contact.me.kinName) ;
    }
    isInvalidForm() {
        return !(this.isValidInfo() && this.isValidContact());
    }
    getLgas() {
        return this.lgas[this.states.indexOf(this.person.info.contact.me.state)];
    }
    addInitials() {
    this.person.record.cards.unshift({
        ...this.card,
        meta: new Meta(this.cookies.get('i'))
    });
    this.person.record.visits = [[new Visit()]];

    this.person.record.invoices = [[{
        ...new Invoice(),
        name: 'Card',
        desc: this.card.category,
        processed: true,
        meta: new Meta(this.cookies.get('i'))
    }]];
    }
    addRecord() {

        this.creating = true;
        this.addInitials();
        this.backEnd.addPerson(this.person).subscribe((newPerson: Person) => {
        
            newPerson.card = {menu: false, view: 'front'};
            // this.socket.io.emit('new order', newPerson);
            this.person = newPerson;
            console.log(newPerson);
            this.card = new Card();
            this.creating = false;
            this.successMsg = 'Patient added successfully';
            setTimeout(() => {
            this.successMsg = null;
            }, 4000);
            
        }, (e) => {
        
            this.errorMsg = 'Unbale to add patient';
            this.creating = false;
          
        });
        console.log(this.person);
        
        
    }
    update() : Info {
        let info = null;
        this.updating = true;
        this.backEnd.updateInfo(this.person.info, this.person._id).subscribe((res: Info) => {
            this.updating = false;
            this.successMsg = 'Update successfull';
            this.url = null;
            setTimeout(() => {
            this.successMsg = null;
            }, 5000);
            info = res;
        }, (e) => {
            this.successMsg = 'Unbale to update info';
            this.updating = false;
            info = null;
        });
        return info;
    }
    updateInfo() : Info {
        if (!this.url) {
            return this.update();
        } else {
            this.uploader.uploadAll();
            this.update();
            }
    }
    enrolePatient() {
    this.enrolling = true;
    this.person.record.visits.unshift([{...this.visit, status: 'queued'}]);
    this.backEnd.updateRecord(this.person).subscribe(patient => {
        this.socket.io.emit('enroled', patient);
        this.visit = new Visit();
        this.enrolling = false;
        this.successMsg = 'Patient enrole  successfully';
        setTimeout(() => {
        this.successMsg = null;
        }, 4000);
    }, (e) => {
    this.errorMsg = 'Unbale to enrole patient';
    this.enrolling = false;
    });
    }
}