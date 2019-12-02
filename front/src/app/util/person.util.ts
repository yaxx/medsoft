import {Person, Info} from '../models/person.model';
import {DataService} from '../services/data.service';
import { Injectable } from '@angular/core';
import {states, lgas } from '../data/states';
import { Invoice, Meta, Card} from '../models/inventory.model';
import {CookieService } from 'ngx-cookie-service';
import {Visit} from '../models/record.model';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import { SocketService } from '../services/socket.service';
import { PatientComponent } from '../components/patient/patient.component';
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
    addOption = 1;
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
        (this.card.category);
    }
    withoutCard() {
        return (this.person.info.personal.firstName) &&
        (this.person.info.personal.lastName) &&
        (this.person.info.personal.dob);
    }
    isValidInfo() {
        return this.withoutCard();
      }
    isValidContact() {
        return (this.person.info.contact.emergency.mobile);
    }
    isInvalidForm() {
        return !(this.isValidInfo() && this.isValidContact());
    }
    getLgas() {
        return this.lgas[this.states.indexOf(this.person.info.contact.me.state)];
    }
    addDefaults() {
        // this.person.record.cards.unshift({
        //     ...this.card,
        //     meta: new Meta(this.cookies.get('i'))
        // });
        this.person.record.visits = [[{...new Visit(), status: 'out'}]];
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
    addCard() {
        if (this.person.record.cards.length) {
            if (this.person.record.cards[0].pin) {
                this.person.record.cards.unshift(this.card);
                this.person.record.visits.unshift([new Visit()]);
                this.person.record.invoices.unshift([{
                    ...new Invoice(),
                    name: 'Card',
                    desc: this.card.category,
                    processed: true,
                    meta: new Meta(this.cookies.get('i'))
                }]);
            } else {
                this.person.record.cards[0] = this.card;
                this.person.record.visits[0] = [{...new Visit()}];
                this.person.record.invoices[0] = [{
                    ...new Invoice(),
                    name: 'Card',
                    desc: this.card.category,
                    processed: true,
                    meta: new Meta(this.cookies.get('i'))
                }];
            }
        } else {
            this.person.record.cards.push(this.card);
            this.person.record.visits.push([new Visit()]);
            this.person.record.invoices.push([{
                ...new Invoice(),
                name: 'Card',
                desc: this.card.category,
                processed: true,
                meta: new Meta(this.cookies.get('i'))
            }]);
        }
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