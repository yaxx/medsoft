import { Component, OnInit } from '@angular/core';
import { Person} from '../../models/person.model';
import {Tests, Scannings, Surgeries} from '../../data/request';
import {Client, Department} from '../../models/client.model';
import {Conditions} from '../../data/conditions';
import {DataService} from '../../services/data.service';
import * as cloneDeep from 'lodash/cloneDeep';
import {SocketService} from '../../services/socket.service';
import {CookieService } from 'ngx-cookie-service';
import {ActivatedRoute, Router} from '@angular/router';
import { Item, StockInfo, Product, Card, Invoice, Meta} from '../../models/inventory.model';
import { Record, Medication, Condition, Note, Visit, Session, Test, Surgery, Scan, Complain } from '../../models/record.model';
import {Chart} from 'chart.js';
import {saveAs} from 'file-saver';
// import { truncateSync } from 'fs';


@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  products: Product[] = [];
  clonedPatient: Person = new Person();
  clonedPatients: Person[] = [];
  department: Department = new Department();
  session: Session = new Session();
  feedback = null;
  count = 0;
  cardTypes = [];
  client: Client = new Client();
  tests = Tests;
  scannings = Scannings;
  surgeries = Surgeries;
  conditions = Conditions;
  vital = 'Blood Presure';
  vitals = [];
  patient: Person = new Person();
  loading = false;
  processing = false;
  errLine = null;
  message = null;
  bpChart = [];
  chartData = [];
  notes: Note[] = [];
  chartLabels = new Array<String>(10);
  constructor(private dataService: DataService,
     private router: Router,
     private cookies: CookieService, 
     private socket: SocketService,
     private route: ActivatedRoute) { }

  ngOnInit() {
    this.getClient();
    let day = null;
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    this.loading = true;
    this.dataService.getHistory(this.route.snapshot.params['id']).subscribe((patient: Person) => {
      this.loading = false;
      this.notes = patient.record.notes;
      this.patient = patient;
      this.patient.record.notes = patient.record.notes.map(note => ({
        ...note,
        note: note.note.length > 150 ? note.note.substr(0, 150) : note.note
      }));
    }, (e) => {
      this.message = 'Something went wrong';
      this.loading = false;
    });
    // this.patient.record.vitals.bp.forEach((bp, i) => {
    //     this.chartData.push(bp.systolic);
    //     this.chartLabels[i] = new Date(bp.meta.dateAdded).getDate().toString() + months[new Date(bp.meta.dateAdded).getMonth()];
    //   });
    this.bpChart = new Chart('bpChart', {
      type: 'bar',
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 5,
                    right: 20,
                    top: 0,
                    bottom: 0
                }
            },
          legend: {
            display: false,
          },
          scales: {
            xAxes: [{
              gridLines: {
                display: false,
                color:'white'
              },
              ticks: {
                fontSize: 10,
                fontColor: 'lightgrey'
              }
            }],
            yAxes: [{
              gridLines: {
                drawBorder: false,
                color:'whitesmoke'
              },
              ticks: {
                beginAtZero: false,
                fontSize: 10,
                fontColor: 'lightgrey',
                maxTicksLimit: 20,
                padding: 10,
                suggestedMin: 60,
                suggestedMax: 140
              }
            }]
          },
          tooltips: {
            backgroundColor: '#bbf7f0'
          }
        },
        data: {
          labels: this.chartLabels,
        datasets: [{
          data: this.chartData,
          tension: 0.0,
          borderColor: '#96f4f4',
          backgroundColor: '#96f4f4',
          pointBackgroundColor: ['white', 'white', 'whitesmoke', 'white', 'white', 'white', 'rgb(255,190,70)'],
          pointRadius: 4,
          borderWidth: 1
        }]
      }
    });
  }
  getDp(avatar: String) {
    return 'http://localhost/api/dp/' + avatar;
    // return 'http://192.168.0.100:5000/api/dp/'+ avatar;
  }

  getMyDp() {
    return this.getDp(this.cookies.get('d'))
  }
  getImage(fileName: String){
    // return 'http://192.168.0.100:5000/api/dp/' + fileName;
    return 'http://localhost/api/dp/' + fileName;
    // return 'http://13.59.243.243/api/dp/' + fileName;
  }
  compareNotes(i: number, note: Note) {
    return this.notes[i].note.length === note.note.length;
  }
  downloadImage(file: string) {
    this.dataService.download(file).subscribe(
      res =>  saveAs(res, file)
    );
  }
  readMore(e: Event, i: number) {
  e.preventDefault();
  this.patient.record.notes[i].note = this.notes[i].note;
}
  getDocDp(avatar: string) {
      return 'http://localhost:5000/api/dp/' + avatar;
      // return 'http://http://192.168.1.100:5000/api/dp/' + avatar;
  }
  addVital() {
    switch (this.vital) {
      case 'Blood Presure':
        this.vitals.unshift({
          name: 'Blood Presure', 
          val: this.session.vitals.bp.systolic + '/'
        + this.session.vitals.bp.diastolic + 'mm Hg'
        });
        break;
      case 'Tempreture':
        this.vitals.unshift({
          name: 'Tempreture', 
          val: this.session.vitals.tempreture.value + 'F' 
        });
        break;
      case 'Respiratory Rate':
        this.vitals.unshift({
          name: 'Respiratory Rate', 
          val: this.session.vitals.resp.value + 'bpm'
        });
        break;
      case 'Pulse Rate':
        this.vitals.unshift({
          name: 'Pulse Rate', 
          val: this.session.vitals.pulse.value + 'bpm'
        });
        break;
      default:
        break;
    }

  }
  isAdmin() {
    return this.router.url.includes('admin');
  }
  isInfo() {
    return this.router.url.includes('information');
  }
  isConsult() {
    return !this.router.url.includes('information') && 
    !this.router.url.includes('pharmacy') && 
    !this.router.url.includes('billing') && 
    !this.router.url.includes('ward') &&
    !this.router.url.includes('admin');
  }

getDescriptions() {
  switch (this.session.reqItem.category) {
    case 'Surgery':
    this.session.desc = this.surgeries;
    break;
  case 'Scanning':
    this.session.desc  = this.scannings;
    break;
  case 'Test':
    this.session.desc  = this.tests;
    break;
    default:
    break;
  }
}
removeMedication(i: number) {
  this.session.medications.splice(i, 1);
  this.session.invoices.splice(i, 1);
}
removeComplain(i: number) {
  this.session.complains.splice(i, 1);
  this.session.newItems.splice(i, 1);
}

removePriscription(i: number) {
this.session.medications.splice(i, 1);
this.session.medInvoices.splice(i, 1);
}
removeTest(i) {
 this.tests.splice(i, 1);
 this.session.invoices.splice(i, 1);
}
isEmptySession() {
  return !this.session.invoices.length && 
  !this.session.complains.length &&
  !this.session.conditions.length && 
  !this.session.allegies.allegy && 
  !this.session.famHist.condition && 
  !this.session.note.note && 
  !this.session.medications.length;
}

fetchDept() {
  return this.client.departments
  .filter(dept => (dept.hasWard) && (dept.name !== this.patient.record.visits[0][0].dept));
}
getClient() {
  this.dataService.getClient().subscribe((res: any) => {
    this.client = res.client;
    this.products = res.client.inventory;
    this.cardTypes = res.client.inventory.filter(p => p.type === 'Cards');
    this.session.items = res.items;
});
}
next(){
  this.count = this.count + 1;
}
prev() {
  this.count = this.count - 1;
}
getProducts() {
  this.dataService.getProducts().subscribe((res: any) => {
    this.products = res.inventory;
    this.session.items = res.items;
 });
}
checkItems(type: string) {
  // return this.temItems.some(item => item.type === type);
}
composeInvoices() {
  let invoices = cloneDeep([...this.session.invoices, ...this.session.medInvoices]);
  if (invoices.length) {
  if (this.patient.record.invoices.length) {
    if (new Date(this.patient.record.invoices[0][0].meta.dateAdded)
    .toLocaleDateString() === new Date()
    .toLocaleDateString()) {
      for (const i of invoices) {
        this.patient.record.invoices[0].unshift(i);
      }
     } else {
        this.patient.record.invoices.unshift(invoices);
     }
    } else {
      this.patient.record.invoices = [invoices];
    }
  }
}
composeMedications() {
  if (this.session.medications.length) {
  if (this.patient.record.medications.length) {
    if (new Date(this.patient.record.medications[0][0].meta.dateAdded)
    .toLocaleDateString() === new Date()
    .toLocaleDateString()) {
      for (const m of this.session.medications) {
        this.patient.record.medications[0].unshift(m);
      }
     } else {
        this.patient.record.medications.unshift(this.session.medications);
     }
    } else {
      this.patient.record.medications = [this.session.medications];
    }
  }
}
composeTests() {
  if (this.session.tests.length) {
    if (this.patient.record.tests.length) {
    if (new Date(this.patient.record.tests[0][0].meta.dateAdded)
    .toLocaleDateString() === new Date().toLocaleDateString()) {
      for (const t of this.tests) {
        this.patient.record.tests[0].unshift(t);
      }
     } else {
        this.patient.record.tests.unshift(this.session.tests);
     }
    } else {
       this.patient.record.tests = [this.session.tests];
    }
  }
}
composeScans() {
  if (this.session.scans.length) {
    if (this.patient.record.scans.length) {
    if (new Date(this.patient.record.scans[0][0].meta.dateAdded)
    .toLocaleDateString() === new Date().toLocaleDateString()) {
      for (const t of this.session.scans) {
        this.patient.record.scans[0].unshift(t);
      }
     } else {
        this.patient.record.scans.unshift(this.session.scans);
     }
    } else {
      this.patient.record.scans = [this.session.scans];
    }
  }
}
composeComplains() {
  if (this.session.complains.length) {
  if (this.patient.record.complains.length) {
    if (new Date(this.patient.record.complains[0][0].meta.dateAdded)
    .toLocaleDateString() === new Date().toLocaleDateString()) {
      for (const c of this.session.complains) {
        this.patient.record.complains[0].unshift(c);
      }
     } else {
        this.patient.record.complains.unshift(this.session.complains);
     }
    } else {
       this.patient.record.complains = [this.session.complains];
    }
  }
}
composeConditions() {
  if (this.session.conditions.length) {
  if (this.patient.record.conditions.length) {
    if (new Date(this.patient.record.conditions[0][0].meta.dateAdded)
    .toLocaleDateString() === new Date().toLocaleDateString()) {
      for (const c of this.session.conditions) {
        this.patient.record.conditions[0].unshift(c);
      }
     } else {
      this.patient.record.conditions.unshift(this.session.conditions);
     }
    } else {
      this.patient.record.conditions = [this.session.conditions];
    }
  }
}

addInvoice(name: string, itemType: string) {
  const p = this.products.find(prod => prod.item.name === name);
  if (p) {
    if (itemType === 'Medication') {
      this.session.medInvoices.unshift({
        ...new Invoice(),
        name: name,
        price: p.stockInfo.price,
        desc: `Medication | ${this.session.medication.priscription.intake}-${this.session.medication.priscription.freq}-${this.session.medication.priscription.piriod}`,
        processed: false,
        meta: new Meta(this.cookies.get('i'))
      });
    } else {
      this.session.invoices.unshift({
        ...new Invoice(),
        name: name,
        price: p.stockInfo.price,
        desc: itemType,
        meta: new Meta(this.cookies.get('i'))
      });
    }
  } else {
    if (itemType === 'Medication') {
      this.session.medInvoices.unshift({
        ...new Invoice(),
        name: name,
        desc: `Medication | ${this.session.medication.priscription.intake}-${this.session.medication.priscription.freq}-${this.session.medication.priscription.piriod}`,
        processed: false,
        meta: new Meta(this.cookies.get('i'))
      });
    } else {
      this.session.invoices.unshift({
        ...new Invoice(),
        name: name,
        desc: itemType,
        meta: new Meta(this.cookies.get('i'))
      });
    }
  }
}
addMedication() {
  if (this.session.items.some(i => i.name === this.session.medication.name)) {
  } else {
    this.session.newItems.unshift(new Item('drug', this.session.medication.name));
    this.session.items.unshift(new Item('drug', this.session.medication.name));
  }
  if (this.session.medications.some(medic => medic.name === this.session.medication.name)) {
    this.errLine = 'Medication already added';
  } else {
  this.session.medications.unshift({
    ...this.session.medication,
    meta: new Meta(this.cookies.get('i'))
  });
  this.addInvoice(this.session.medication.name, 'Medication');
  this.session.medication = new Medication();
}

}
invoiceExist() {
  return this.session.invoices.some(invoice => invoice.name === this.session.reqItem.name);
}
addTest() {
  if(this.invoiceExist()) {
    this.errLine = 'Request already added';
  } else {
    this.session.tests.unshift(new Test(
      this.session.reqItem.name,
      new Meta(this.cookies.get('i'))
      ));
    this.addInvoice(this.session.reqItem.name, 'Test');
  }
}
addSurgery() {
  if(this.invoiceExist()) {
    this.errLine = 'Request already added';
  } else {
     this.session.surgeries.unshift({
    ...new Surgery(),
    name: this.session.reqItem.name,
    meta: new Meta(this.cookies.get('i'))
  });
  this.addInvoice(this.session.reqItem.name, 'Surgery');
  }
 }
addScanning() {
  if(this.invoiceExist()) {
    this.errLine = 'Request already added';
  } else {
     this.session.scans.unshift({
    ...new Scan(),
    name: this.session.reqItem.name,
    meta: new Meta(this.cookies.get('i'))
  });
  this.addInvoice(this.session.reqItem.name, 'Scan');
  }
 
}
addComplain() {
   this.session.complains.unshift({
     ...this.session.complain,
     meta: new Meta(this.cookies.get('i'))
   });
   this.session.complain = new Complain();
 }
 addCondition() {
   this.session.conditions.unshift(new Condition(
     this.session.condition.condition,
     new Meta(this.cookies.get('i'))
     ));
   this.session.condition = new Condition();
 }

 getPriscription(med) {
   return med.desc.split('|')[1];
 }
addRequest() {
  switch (this.session.reqItem.category) {
    case 'Surgery':
    this.addSurgery();
    this.session.reqItem = new Item();
    this.session.desc = [];
    break;
  case 'Scanning':
    this.addScanning();
    this.session.reqItem = new Item();
    this.session.desc = [];
    break;
  case 'Test':
    this.addTest();
    this.session.reqItem = new Item();
    this.session.desc = [];
    default:
    break;
  }

}
getPriceTotal() {
  // let total = 0;
  //  this.session.medications.forEach((medic) => {
  //    total = total +  medic.stockInfo.price;
  //  });
  //  return total;
}
clearMsg() {
  this.errLine = null;
}
goTo(count: number) {
  this.count = count;
}
removeData(invoice: Invoice) {
if(invoice.desc === 'Test') {
  const i  = this.session.tests.findIndex(tst => tst.name === invoice.name);
  this.session.tests.splice(i, 1);
} else if (invoice.desc === 'Surgery') {
  this.session.surgeries.splice(this.session.surgeries.findIndex(sgr => sgr.name === invoice.name), 1);
}
this.session.scans.splice(this.session.scans.findIndex(scn => scn.name === invoice.name), 1);
}
removeRequest(i: number, invoice: Invoice) {
  this.session.reqItems.splice(i, 1);
  this.session.invoices.splice(i, 1);
  this.removeData(invoice);
}
removeCondition(i: number) {
  this.session.conditions.splice(i, 1);
}
checkScalars() {
  if (this.session.famHist.condition) {
    this.patient.record.famHist.unshift({
      ...this.session.famHist,
      meta: new Meta(this.cookies.get('i'))
  });
  } else {}
   if (this.session.note.note) {
    this.patient.record.notes.unshift({
      ...this.session.note,
      meta: new Meta(this.cookies.get('i'))
    });
  } else {}
   if (this.session.allegies.allegy) {
    this.patient.record.allegies.unshift({...this.session.allegies,
      meta: new Meta(this.cookies.get('i'))
    });
  } else {}
   if (this.session.famHist.condition) {
    this.patient.record.famHist.unshift({...this.session.famHist,
      meta: new Meta(this.cookies.get('i'))
    });
  } else {}
}
sendRecord() {
  this.processing = true;
  this.dataService.updateHistory(this.patient).subscribe((patient: Person) => {
    this.patient.record  = patient.record;
    this.socket.io.emit('consulted', patient);
    this.session = new Session();
    this.feedback = 'Record successfully updated';
    this.processing = false;
    setTimeout(() => {
      this.feedback = null;
    }, 5000);
  }, (e) => {
    this.errLine = 'Unable to update record';
    this.processing = false;
  });
}

updateRecord() {
  this.processing = true;
  this.composeTests();
  this.composeScans();
  this.composeComplains();
  this.composeConditions();
  this.composeMedications();
  this.composeInvoices();
  this.checkScalars() ;
  this.sendRecord();

}

}

