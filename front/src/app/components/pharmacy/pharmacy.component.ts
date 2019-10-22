import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Person} from '../../models/person.model';
import {CookieService} from 'ngx-cookie-service';
import {Product, Item, StockInfo,Invoice} from '../../models/inventory.model';
import {Priscription, Medication} from '../../models/record.model';
import * as cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.css']
})
export class PharmacyComponent implements OnInit {
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
  items: Item[] = [];
  temItems: Item[] = [];
  searchedProducts: Product[] = [];
  invoices: Invoice[][] = new Array<Invoice[]>();
  edited: Invoice[] = [];
  editables: Invoice[] = [];
  tempMedications: Medication[] = [];
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

  constructor(
    private dataService: DataService,
    private cookies: CookieService,
    private router: Router,
    private socket: SocketService ) { }

  ngOnInit() {
    this.getPatients('Pharmacy');
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
    this.getPatients('Pharmacy');
    this.getProducts();
  }
  getPatients(type: string) {
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

  getDosage(desc: string) {
    return desc.split('|')[1];
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

  switchToEdit() {
    this.edited = this.getSelections();
    this.switchViews('editing');
  }
  getMaxQty(med) {
    return this.products.find(prod => prod.item.name === med.name).stockInfo.quantity;
  }
  getReversables(i: number, j: number) {
    // this.curIndex = i;
    this.edited.push(this.patient.record.invoices[i][j]);
    this.switchViews('reversing');
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
  medidcationsSelected(i: number) {
    return this.invoices.some(med => med.some(m => m.meta.selected));
  }
  getSelections() {
    const selections = [];
     this.invoices.forEach(group => {
       group.forEach(medic => {
         if (medic.meta.selected) {
          medic.meta.selected = !medic.meta.selected;
          selections.push(medic);
         }
       });
     });
    return selections;
  }
  
   
  somePaid(i) {
    // return this.invoices[i].some(invoice => invoice.paid);
   }
updatePrices(invoices: Invoice[], i: number) {
  if(invoices.length) {
    invoices.forEach(invoice => {
      let p = this.products.find(prod => prod.item.name === invoice.name); 
      if(p && !invoice.paid) {
        invoice.price = p.stockInfo.price;
      }
    });
    this.invoices[i] = invoices;
  } else {
    this.invoices.splice(i, 1);
  }
}
  viewOrders(i: number) {
    this.curIndex = i;
    this.switchViews('orders');
    this.invoices = cloneDeep(this.patients[i].record.invoices);
    this.invoices.forEach((invoices , m) => {
      let items = [];
      invoices.forEach((invoice) => {
        if(invoice.desc.includes('|')) {
          items.push(invoice);
        }
        });
        this.updatePrices(items, m);
    });
  }
  reset() {
    setTimeout(() => {
      this.transMsg = null;
      this.cart = [];
      this.clonedStore = [];
    }, 3000);
    setTimeout(() => {
      this.edited = [];
      this.editables = [];
      this.switchViews('orders');
    }, 6000);

  }
   sendRecord() {
    this.processing = true;
    this.dataService.updateRecord(this.patients[this.curIndex]).subscribe((patient: Person) => {
      this.transMsg = 'Invoice successfully updated';
    this.reset()
    }, (e) => {
      this.errMsg = 'Unable to update invoice';
      this.processing = false;
    });
  }
   updateInvoices() {
      this.edited.forEach(invoice => {
        invoice.processed = true;
        this.patients[this.curIndex].record.invoices.forEach((m) =>  {
          m[m.findIndex(i => i._id === invoice._id)] = invoice;
        });
        this.products.forEach(prod => {
          if(prod.item.name === invoice.name) {
            prod.stockInfo.quantity = prod.stockInfo.quantity - invoice.quantity;
          }
        });
      });
      this.sendRecord();
      this.switchViews('orders');
   }
  getTransTotal(invoices: Invoice[]) {
    let total = 0;
    invoices.forEach((invoice) => {
      total = (invoice.paid) ? (total + invoice.quantity * invoice.price) : (total + 0);
    });
    return total;
  }
  getPriceTotal() {
    let total = 0;
     this.edited.forEach((invoice) => {
       total = total + invoice.quantity * invoice.price;
     });
     return total;
  }
 
    getDp(avatar: String) {
    // return 'http://192.168.1.100:5000/api/dp/' + avatar;
    return 'http://13.59.243.243/api/dp/' + avatar;
    // return 'http://18.221.76.96:5000/api/dp/' + avatar;
  }

  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  getProducts() {
    this.dataService.getProducts().subscribe((res: any) => {
      this.products = res.inventory.filter(p => p.type === 'Products');
      this.items = res.items;
    });
  }

 searchPatient(name: string) {
   if(name!==''){
    this.patients = this.patients.filter((patient) => {
      const patern =  new RegExp('\^' + name
      , 'i');
      return patern.test(patient.info.personal.firstName);
      });
   } else {
     this.patients = this.clonedPatients;
   }
 }





routeHas(path) {
  return this.router.url.includes(path);
}
getStyle(i: Invoice) {
  return {color: i.processed ? 'black' : 'lightgrey'};
}
updateMedications() {
  this.processing = true;
  this.dataService.updateMedication(this.invoices).subscribe((m) => {
   this.patients[this.curIndex].record.invoices = this.invoices;
   this.processing = false;
   this.switchViews('orders');
  }, (e) => {
    this.transMsg = 'Unable to process payment';
    this.processing = false;
  });
}

}
