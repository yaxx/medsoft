import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {ActivatedRoute, Router} from '@angular/router';
import update from 'react-addons-update';
import {Person} from '../../models/person.model';
import {CookieService} from 'ngx-cookie-service';
import {Product, Item, Invoice, StockInfo} from '../../models/inventory.model';
import {Priscription, Medication} from '../../models/record.model';
import * as cloneDeep from 'lodash/cloneDeep';
import { timeout } from 'q';
@Component({
  selector: 'app-cashier',
  templateUrl: './cashier.component.html',
  styleUrls: ['./cashier.component.css']
})
export class CashierComponent implements OnInit {
  patients: Person[] = [];
  clonedPatients: Person[] = [];
  patient: Person = new Person();
  products: Product[] = [];
  clonedStore: Product[] = [];
  cart: Product[] = [];
  product: Product = new Product();
  priscription: Priscription = new Priscription();
  medication: Medication = new Medication();
  temProducts: Product[] = [];
  item: Item = new Item();
  searchedProducts: Product[] = [];
  invoices: Invoice[][] = new Array<Invoice[]>();
  edited: Invoice[] = [];
  editables: Invoice[] = [];
  inlinePatients = [];
  inlineProducts = [];
  transMsg = null;
  errMsg = null;
  input = '';
  searchTerm = '';
  cardView = {
    orders: true,
    editing: false,
    reversing: false
  };
  sortBy = 'added';
  sortMenu = false;
  nowSorting = 'Date added';
  view = 'default';
  count = 0;
  id = '';
  selected = null;
  curIndex = 0;
  loading = false;
  processing = false;
  message = null;

  constructor(private dataService: DataService,
    private cookies: CookieService,
    private router: Router,
    private socket: SocketService) { }

  ngOnInit() {
    this.getPatients();
    this.getProducts();
    this.socket.io.on('new order', (patient: Person) => {
      this.patients.push(patient);
    });
    this.socket.io.on('store update', (data) => {
      if(data.action === 'new') {
        this.products = [...data.changes, ...this.products];
      } else if (data.action === 'update') {
          for (const product of data.changes) {
              this.products[this.products.findIndex(prod => prod._id === product._id)] = product;
            }
      } else {
          for (const product of data.changes) {
            this.products.splice(this.products.findIndex(prod => prod._id === product._id) , 1);
          }
      }
    });
  }

  toggleSortMenu() {
    this.sortMenu = !this.sortMenu;
  }
  refresh() {
    this.message = null;
    this.getPatients();
    this.getProducts();
  }
  getPatients(type?: string) {
    this.loading = true;
    this.dataService.getPatients(type).subscribe((patients: Person[]) => {
      if(patients.length) {
        patients.forEach(p => {
          p.card = {menu: false, view: 'front'};
        });
        this.patients =  patients;
        this.clonedPatients  = patients;
        this.loading = false;
        this.message = null;
      } else {
        this.message = 'No Records So Far';
        this.loading = false;
      }
    }, (e) => {
      this.message = 'Something went wrong';
      this.loading = false;
    });
  }
  getDesc(desc: string) {
    return desc.split('|')[0];
  }

  
 switchToEdit() {
  this.invoices.forEach(inner => {
    inner.forEach(invoice => {
      if (invoice.meta.selected) {
       invoice.meta.selected = !invoice.meta.selected;
         this.edited.push(invoice);
      }
    });
  });
  this.switchViews('editing');
}
updateInvoices() {
    this.edited.forEach(invoice => {
      this.patients[this.curIndex].record.invoices.forEach((m) =>  {
        m[m.findIndex(i => i._id === invoice._id)] = {...invoice, paid: true, datePaid: new Date(), comfirmedBy: this.cookies.get('i')};
      });
      this.products.forEach(prod => {
        if(prod.item.name === invoice.name) {
          prod.stockInfo.quantity = prod.stockInfo.quantity - invoice.quantity;
          prod.stockInfo.sold = prod.stockInfo.sold + invoice.quantity;
          this.cart.push(prod);
        } else if(prod.item.name === invoice.desc) {
          prod.stockInfo.quantity = prod.stockInfo.quantity - invoice.quantity;
          prod.stockInfo.sold = prod.stockInfo.sold + invoice.quantity;
          this.patients[this.curIndex].record.visits[0][0].status = 'queued';
          this.cart.push(prod);
        }
      });
    });
   
 }
updatePrices(invoices: Invoice[], i: number) {
  if(invoices.length) {
    invoices.forEach(invoice => {
      let p = (invoice.name === 'Card') ? 
      this.products.find(prod => prod.item.name === invoice.desc) : this.products.find(prod => prod.item.name === invoice.name); 
      if(p && !invoice.paid) {
        invoice.price = p.stockInfo.price;
      }
    });
    this.invoices[i] = invoices;
  } else {
    // this.invoices.splice(i, 1);
  }
}

viewOrders(i: number) {
  this.curIndex = i;
  this.switchViews('orders');
  this.invoices = this.patients[i].record.invoices;
  this.invoices.forEach((invoices , j) => {
    const items = [];
    invoices.forEach((invoice) => {
      if(invoice.processed) {
        items.push(invoice);
      }
      });
      this.updatePrices(items, j);
  });
}
runTransaction(type: string) {
  this.processing = true;
  this.dataService.runTransaction(this.patients[this.curIndex]._id, this.patients[this.curIndex].record, this.cart).subscribe(() => {
    this.products = this.clonedStore;
    this.processing = false;
    this.socket.io.emit('transaction', this.cart);
    this.transMsg = (type === 'purchase') ? 'Payment successfully comfirmed' : 'Transaction successfully reversed';
    this.reset();
  }, (e) => {
    this.errMsg = (type === 'purchase') ?  'Unable to comfirm payment' : 'Unable to reverse transaction';
    this.processing = false;
  });
}

comfirmPayment() {
  this.updateInvoices();
  this.runTransaction('purchase');
 }

  switchViews(view) {
    switch(view) {
      case 'orders':
      this.cardView.orders = true;
      this.cardView.editing = false;
      this.cardView.reversing = false;
      this.edited = this.editables = [];
      break;
      case 'editing':
      this.cardView.orders = false;
      this.cardView.editing = true;
      this.cardView.reversing = false;
      break;
      case 'reversing':
      this.cardView.orders = false;
      this.cardView.editing = false;
      this.cardView.reversing = true;
      break;
      default:
      break;
    }
  }


 
  getReversables(i: number, j: number) {
    // this.curIndex = i;
    // this.edited.push(this.patient.record.medications[i][j]);
    // this.switchViews('reversing');
  }
  sortPatients(sortOption: string) {
    this.sortMenu = false;
    switch (sortOption) {
      case 'name':
        this.patients.sort((m: Person, n: Person) => m.info.personal.firstName.localeCompare(n.info.personal.firstName));
        this.nowSorting = 'A-Z';
        break;
      case 'sex':
        this.patients.sort((m: Person, n: Person) => n.info.personal.gender.localeCompare(m.info.personal.gender));
        this.nowSorting = 'Gender';
        break;
      // case 'status':
      //   this.patients.sort((m, n) => m.record.visits[m.record.visits.length-1].status.localeCompare(m.record.visits[n.record.visits.length-1].status.localeCompare));
      //   this.nowSorting = 'Status';
      //   break;
        case 'age':
        this.patients.sort((m, n) => new Date(m.info.personal.dob).getFullYear() - new Date(n.info.personal.dob).getFullYear());
        this.nowSorting = 'Age';
        break;
      case 'date':
        this.patients.sort((m, n) => new Date(n.createdAt).getTime() - new Date(m.createdAt).getTime());
        this.nowSorting = 'Date added';
        break;
        default:
        break;
    }
  }

  selectItem(i: number, j: number) {
   this.invoices[i][j].meta.selected = !this.invoices[i][j].meta.selected;
  }
  selectCard(i) {
    this.patient.record.cards[i].meta.selected =  !this.patient.record.cards[i].meta.selected;
  }
  invoiceSelcted() {
    return this.invoices.some(invoices => invoices.some(i => i.meta.selected));
  }
 
  reset() {
    setTimeout(() => {
      this.transMsg = null;
      this.cart = [];
      this.clonedStore = [];
    }, 3000);
    setTimeout(() => {
      this.switchViews('orders');
    }, 6000);
  }


 

  somePaid(i) {
    // return this.medications[i].some(m => m.invoice.paid);
   }
   getTransTotal(i) {
    // let total = 0;
    // this.patient.record.medications[i].forEach((m) => {
    //   total = (m.invoice.paid) ? (total + m.invoice.quantity * m.invoice.price) : (total + 0);
    // });
    // return total;
  }
  getPriceTotal() {
    let total = 0;
     this.edited.forEach((invoice) => {
       total = total + invoice.quantity * invoice.price;
     });
     return total;
  }
    getDp(avatar: String) {
    return 'http://localhost:5000/api/dp/' + avatar;
    // return 'http://13.59.243.243/api/dp/' + avatar;
  }
  getStyle(i: Invoice) {
    return {color: i.paid ? 'black': 'lightgrey'};
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  getProducts() {
    this.dataService.getProducts().subscribe((res: any) => {
      this.products = res.inventory;
    });
  }
  selectMedication(m: Medication, selected: number) {
    // this.medication = new Medication(m.product, m.priscription);
    // this.id = m._id;
    // this.selected = selected;
    // this.input = m.product.item.name + ' ' + m.product.item.mesure + m.product.item.unit;
  }


cancel() {
  // this.patients[this.curIndex] = this.dataService.getCachedPatient(this.patients[this.curIndex]._id)
  // this.products = this.dataService.getCachedProducts();
}

 searchPatient(name:string) {
   if(name!==''){
    this.patients = this.patients.filter((patient) => {
      const patern =  new RegExp('\^' + name , 'i');
      return patern.test(patient.info.personal.firstName);
      });
   } else {
     this.patients = this.clonedPatients;
   }
 }
// addSelection(product: Product) {
//   this.input = product.item.name;
//   this.product = product;
//   this.searchedProducts = [];
// }






updateMedications() {
  // this.processing = true;
  // this.dataService.updateMedication(this.invoices).subscribe((newMedications: Medication[]) => {
  //  this.patients[this.curIndex].record.medications = newMedications;
  //  this.processing = false;
  // },(e) => {
  //   this.transMsg = 'Unable to process payment';
  //   this.processing = false;
  // });
}


}
