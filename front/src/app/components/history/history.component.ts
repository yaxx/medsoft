import { Component, OnInit } from '@angular/core';
import { Person} from '../../models/person.model';
import {Tests, Scannings, Surgeries} from '../../data/request';
import {Client, Department} from '../../models/client.model';
import {Conditions} from '../../data/conditions';
import {Vaccins} from '../../data/immunization';
import {DataService} from '../../services/data.service';
import * as cloneDeep from 'lodash/cloneDeep';
import {SocketService} from '../../services/socket.service';
import 'simplebar';
import 'simplebar/dist/simplebar.css';
import {CookieService } from 'ngx-cookie-service';
import {ActivatedRoute, Router} from '@angular/router';
import { Item, StockInfo, Product, Card, Invoice, Meta} from '../../models/inventory.model';
import { Record, Medication, Height, Weight, Bg, Condition,
  Note, Visit, Session, Test, Surgery, Scan, Complain, Bp, Resp, Pulse, Temp, Vitals, Vaccin } from '../../models/record.model';
import {Chart} from 'chart.js';
import {saveAs} from 'file-saver';
import {host} from '../../util/url';
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
  vaccins: any[] = Vaccins;
  feedback = null;
  currentImage = 0;
  count = 0;
  cardTypes = [];
  client: Client = new Client();
  tests = Tests;
  scans = [];
  clonedTest = [];
  images = [];
  editing = null;
  logout = false;
  scannings = Scannings;
  surgeries = Surgeries;
  conditions = Conditions;
  medications = [];
  vital = 'Blood Presure';
  vitals = [];
  matches = [];
  patient: Person = new Person();
  loading = false;
  processing = false;
  clientMode = null;
  errLine = null;
  message = null;
  edit = false;
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
    this.socket.io.on('record update', (update) => {
      if (update.patient._id === this.patient._id) {
        this.patient = {...update.patient, record: {...update.patient.record, notes: this.patient.record.notes }};
      }
    });
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
      this.message = '...Network Error';
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
                color: 'white'
              },
              ticks: {
                fontSize: 10,
                fontColor: 'lightgrey'
              }
            }],
            yAxes: [{
              gridLines: {
                drawBorder: false,
                color: 'whitesmoke'
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
    return `${host}/api/dp/${avatar}`;
  }

  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  pullImages(i, j, item) {
    this.images = (item === 'test') ? this.patient.record.tests[i][j]
    .report.attachments : this.patient.record.scans[i][j].report.attachments;
  }
  getImage(fileName: String) {
    return `${host}/api/dp/${fileName}`;
  }
  getLabs() {
    return this.client.departments.filter(dept => dept.category === 'Lab');
  }
  compareNotes(i: number, note: Note) {
 
    // return this.notes[i].note.length === note.note.length;
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
      return `${host}/api/dp/${avatar}`;
  }
  addVital() {
    const i = this.vitals.findIndex(v => v.name === this.vital);
     switch (this.vital) {
      case 'Blood Presure':
        if (i >= 0) {
          this.vitals[i] = {
            name: 'Blood Presure',
            val: this.session.vitals.bp.systolic + '/'
          + this.session.vitals.bp.diastolic + 'mm Hg'
          };
        } else {
          this.vitals.unshift({
            name: 'Blood Presure',
            val: this.session.vitals.bp.systolic + '/'
          + this.session.vitals.bp.diastolic + 'mm Hg'
          });
          console.log(this.vitals);
        }
        break;
      case 'Tempreture':
          if (i >= 0) {
            this.vitals[i] = {
              name: 'Tempreture',
              val: this.session.vitals.tempreture.value + 'C'
            };
          } else {
            this.vitals.unshift({
              name: 'Tempreture',
              val: this.session.vitals.tempreture.value + 'C'
            });
          }
        break;
      case 'Respiratory Rate':
        if (i >= 0) {
          this.vitals[i] = {
            name: 'Respiratory Rate',
            val: this.session.vitals.resp.value + 'bpm'
          };
        } else {
          this.vitals.unshift({
            name: 'Respiratory Rate',
            val: this.session.vitals.resp.value + 'bpm'
          });
        }
        break;
      case 'Pulse Rate':
        if (i >= 0) {
          this.vitals[i] = {
            name: 'Pulse Rate',
            val: this.session.vitals.pulse.value + 'bpm'
          };
        } else {
          this.vitals.unshift({
            name: 'Pulse Rate', 
            val: this.session.vitals.pulse.value + 'bpm'
          });
        }
        break;
      default:
        break;
    }

  }
  removeVital(i, sign) {
    this.vitals.splice(i, 1);
    switch (sign.name) {
      case 'Blood Presure':
        this.session.vitals.bp = new Bp();
        break;
      case 'Tempreture':
        this.session.vitals.tempreture = new Temp();
        break;
      case 'Pulse Rate':
        this.session.vitals.pulse = new Pulse();
        break;
      case 'Respiratory Rate':
        this.session.vitals.resp = new Resp();
        break;
      default:
        break;
    }
  }
  clearVital(name) {
    switch (name) {
      case 'Blood Presure':
        if (!this.session.vitals.bp.systolic || !this.session.vitals.bp.diastolic) {
          this.vitals = this.vitals.filter(v => v.name !== name);
        }
        break;
      case 'Tempreture':
          if(!this.session.vitals.tempreture.value) {
            this.vitals = this.vitals.filter(t => t.name !== name);
          }
        break;
      case 'Pulse Rate':
          if(!this.session.vitals.pulse.value) {
            this.vitals = this.vitals.filter(p => p.name !== name);
          }
        break;
      case 'Respiratory Rate':
          if(!this.session.vitals.resp.value) {
            this.vitals = this.vitals.filter(r => r.name !== name);
          }
        break;
      default:
        break;
    }
  }
  switchClient(view: string) {
    this.clientMode =  view ;
  }
  addImmunizations() {
    let s: Vaccin[] = [];
    this.vaccins.forEach(vaccins => {
     vaccins.forEach(vcn => {
       if(vcn.selected) {
        s.push({ name: vcn.name, meta: new Meta(this.cookies.get('i'))});
        vcn.selected = false;
       }
     });
    });
    if (s.length) {
       this.patient.record.immunization.vaccins.unshift(s);
    }
    this.switchClient('view');
  }

  showEdit() {
    this.edit = true;
    this.session.vitals.height = (this.patient.record.vitals.height.length) ?
    cloneDeep(this.patient.record.vitals.height[0]) : new Height();
    this.session.vitals.weight = (this.patient.record.vitals.weight.length) ?
    cloneDeep(this.patient.record.vitals.weight[0]) : new Weight();
    this.session.vitals.bloodGl = (this.patient.record.vitals.bloodGl.length) ?
    cloneDeep(this.patient.record.vitals.bloodGl[0]) : new Bg();
  }
  hideEdidt() {
    this.edit = false;
  }

  checkProfiles() {
    if (this.session.vitals.height.value) {
          this.patient.record.vitals.height.unshift({
            ...this.session.vitals.height, meta: new Meta(this.cookies.get('i'))
          });
    }
    if (this.session.vitals.weight.value) {
          this.patient.record.vitals.weight.unshift({
            ...this.session.vitals.weight, meta: new Meta(this.cookies.get('i'))
          });
        }
      if (this.session.vitals.bloodGl.value) {
          this.patient.record.vitals.bloodGl[0] = {
            ...this.session.vitals.bloodGl, meta: new Meta(this.cookies.get('i'))
          };
      }
  }
  addProfiles() {
   this.checkProfiles();
    this.editing = 'editing';
    this.dataService.updateHistory(this.patient).subscribe((patient: Person) => {
      this.patient.record  = patient.record;
      this.socket.io.emit('record update', {action: '', patient: patient});
      this.editing = 'edited';
      setTimeout(() => {
        this.session.vitals = new Vitals();
        this.editing = null;
        this.edit = false;
      }, 3000);
    }, (e) => {
      this.errLine = 'Unable to update record';
      this.processing = false;
    });
  }

  composeVitals() {
    if (this.session.vitals.tempreture.value) {
      if (this.patient.record.vitals.tempreture.length > 30) {
        this.patient.record.vitals.tempreture.unshift(this.session.vitals.tempreture);
        this.patient.record.vitals.tempreture.splice(this.patient.record.vitals.tempreture.length - 1 , 1);
      } else {
        this.patient.record.vitals.tempreture.unshift(this.session.vitals.tempreture);
      }
    } else {}

    if (this.session.vitals.bp.systolic && this.session.vitals.bp.diastolic) {
      if (this.patient.record.vitals.bp.length > 30) {
        this.patient.record.vitals.bp.unshift(this.session.vitals.bp);
        this.patient.record.vitals.bp.splice(this.patient.record.vitals.bp.length - 1 , 1);
      } else {
        this.patient.record.vitals.bp.unshift(this.session.vitals.bp);
      }
    } else {}
    if (this.session.vitals.pulse.value) {
      if (this.patient.record.vitals.pulse.length > 30) {
        this.patient.record.vitals.pulse.unshift(this.session.vitals.pulse);
        this.patient.record.vitals.pulse.splice(this.patient.record.vitals.pulse.length - 1 , 1);
      } else {
        this.patient.record.vitals.pulse.unshift(this.session.vitals.pulse);
      }
    } else {}
    if (this.session.vitals.resp.value) {
      if (this.patient.record.vitals.resp.length > 30) {
        this.patient.record.vitals.resp.unshift(this.session.vitals.pulse);
        this.patient.record.vitals.resp.splice(this.patient.record.vitals.resp.length - 1 , 1);
      } else {
        this.patient.record.vitals.resp.unshift(this.session.vitals.resp);
      }
    } else {}

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
searchTest() {
  if (!this.session.test.name) {
    this.matches = [];
  } else {
      this.matches = this.tests.filter((name) => {
      const patern =  new RegExp('\^' + this.session.test.name , 'i');
      return patern.test(name);
    });
  }
}
searchScans() {
  if (!this.session.scan.name) {
    this.matches = [];
  } else {
      this.matches = this.scans.filter((name) => {
      const patern =  new RegExp('\^' + this.session.scan.name , 'i');
      return patern.test(name);
    });
  }
}
searchCond() {
  if (!this.session.condition.condition) {
    this.matches = [];
  } else {
      this.matches = this.conditions.filter((name) => {
      const patern =  new RegExp('\^' + this.session.condition.condition, 'i');
      return patern.test(name);
    });
  }
}
searchMedications() {
  if (!this.session.medication.name) {
    this.matches = [];
  } else {
      this.matches = this.medications.filter((name) => {
      const patern =  new RegExp('\^' + this.session.medication.name, 'i');
      return patern.test(name);
    });
  }
}
selectMedic(match) {
  this.session.medication.name = match;
  this.matches = [];
}
selectTest(match) {
  this.session.test.name = match;
  this.matches = [];
}
selectScan(match) {
  this.session.scan.name = match;
  this.matches = [];
}
selectCond(match) {
  this.session.condition.condition = match;
  this.matches = [];
}
isEmptySession() {
  return !this.session.invoices.length &&
  !this.session.complains.length &&
  !this.session.conditions.length &&
  !this.session.allegies.allegy &&
  !this.session.famHist.condition &&
  !this.session.note.note &&
  !this.session.medications.length &&
  !this.vitals.length;
}

fetchDept() {
  return this.client.departments
  .filter(dept => (dept.hasWard) && (dept.name !== this.patient.record.visits[0][0].dept));
}
getPriceTotal() {
  let total = 0;
   this.session.medInvoices.forEach((invoice) => {
     total = total + invoice.quantity * invoice.price;
   });
   return total;
}
getRequestTotal() {
  const invoices = cloneDeep(this.session.invoices);
  let total = 0;
  invoices.filter(i => i.desc === 'Test' || i.desc === 'Scan').forEach((invoice) => {
     total = total + invoice.quantity * invoice.price;
   });
   return total;
}
getClient() {
  this.dataService.getClient().subscribe((res: any) => {
    this.client = res.client;
    this.products = res.client.inventory;
    this.scans = res.client.inventory.filter(prod => prod.type === 'Services' && 
    prod.item.category === 'Scanning').map(scan => scan.item.name);
    this.medications = res.client.inventory.filter(prod => prod.type === 'Products').map(med => med.item.name);
    this.cardTypes = res.client.inventory.filter(p => p.type === 'Cards');
    this.session.items = res.items;
});
}
next() {
  this.count = this.count + 1;
}
prev() {
  this.count = this.count - 1;
}
nextImage() {
  this.currentImage = this.currentImage + 1;
}
prevImage() {
  this.currentImage = this.currentImage - 1;
}
toggleComment(i,j, action) {
  this.patient.record.tests[i][j].report.meta.selected = (action === 'open') ? true : false;
}
toggleScanComment(i, j, action) {
  this.patient.record.scans[i][j].report.meta.selected = (action === 'open') ? true : false;
}
getLength(length) {
  return (length > 1 ) ? 's' : '';
}
getProducts() {
  this.dataService.getProducts().subscribe((res: any) => {
    this.products = res.inventory;
    this.medications = res.inventory.filter(prod => prod.type === 'Products').map(med => med.name);
    this.session.items = res.items;
 });
}
showLogOut() {
  this.logout = true;
}
hideLogOut() {
  this.logout = false;
}
checkItems(type: string) {
  // return this.temItems.some(item => item.type === type);
}
composeInvoices() {
  const invoices = cloneDeep([...this.session.invoices, ...this.session.medInvoices]);
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
    this.session.bills.push('Medication');
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
    this.session.bills.push('cashier');
    if (this.patient.record.tests.length) {
    if (new Date(this.patient.record.tests[0][0].meta.dateAdded)
    .toLocaleDateString() === new Date().toLocaleDateString()) {
      for (const t of this.session.tests) {
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
    this.session.bills.push('cashier');
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
    this.session.tests.unshift({
      ...this.session.test,
      meta: new Meta(this.cookies.get('i'))
    });
    this.addInvoice(this.session.test.name, 'Test');
  }
}
addSurgery() {
  if (this.invoiceExist()) {
    this.errLine = 'Request already added';
  } else {
     this.session.surgeries.unshift({
    ...new Surgery(),
    meta: new Meta(this.cookies.get('i'))
  });
  this.addInvoice(this.session.surgery.name, 'Surgery');
  }
 }
addScanning() {
  if(this.invoiceExist()) {
    this.errLine = 'Request already added';
  } else {
     this.session.scans.unshift({
    ...this.session.scan,
    meta: new Meta(this.cookies.get('i'))
  });
  this.addInvoice(this.session.scan.name, 'Scan');
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

clearMsg() {
  this.errLine = null;
}
selectVaccin(i, j, action) {
 this.vaccins[i][j].selected = (action === 'check') ? true : false;
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
  this.errLine = null;
  this.processing = true;
  this.dataService.updateHistory(this.patient).subscribe((patient: Person) => {
    this.patient.record  = patient.record;
    this.socket.io.emit('record update', {action: 'encounter', bills: this.session.bills, patient: patient});
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
  this.composeVitals();
  this.composeTests();
  this.composeScans();
  this.composeComplains();
  this.composeConditions();
  this.composeMedications();
  this.composeInvoices();
  this.checkScalars();
  this.sendRecord();
}

}

