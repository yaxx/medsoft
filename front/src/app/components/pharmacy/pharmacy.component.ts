import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {ActivatedRoute, Router} from '@angular/router';
import update from 'react-addons-update';
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
  medications: Invoice[][] = new Array<Invoice[]>();
  edited: Invoice[] = [];
  editables: Invoice[] = [];
  tempMedications: Medication[] = [];
  inlinePatients = [];
  inlineProducts = [];
  transMsg = null;
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

  viewOrders(i: number) {
    this.curIndex = i;
    this.switchViews('orders');
    this.medications = cloneDeep(this.patients[i].record.invoices);
    this.medications = this.medications.filter(invoices => invoices.filter(invoice => invoice.desc.includes('|')));

  //  this.patient.record.invoices = this.patient.record.invoices.filter(invoices => invoices.length)
  //   this.medications = this.patient.record.invoices.map(
  //     invoices => invoices.map( i => {
  //     const product = this.products.find(pro => pro.item.name === i.name);
  //     return ( product && !i.paid) ? ({
  //       ...i, price: product.stockInfo.price
  //       }) : i;
  //   }));
  // this.medications = this.patient.record.invoices;
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
    this.editables = this.getSelections();
    this.count = this.editables.length;
    // this.medication = this.editables.shift();
    this.input = this.medication.name;
    this.switchViews('editing');
  }
  getReversables(i: number, j: number) {
    // this.curIndex = i;
    this.edited.push(this.patient.record.medications[i][j]);
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
   this.medications[i][j].meta.selected = !this.medications[i][j].meta.selected;
   if (this.patients[this.curIndex].record.medications[i][j].invoice.paid) {}

  }
  medidcationsSelected(i: number) {
    return this.medications.some(med => med.some(m => m.meta.selected));
  }
  getSelections() {
    const selected = [];
     this.medications.forEach(group => {
       group.forEach(medic => {
         if (medic.meta.selected) {
          medic.meta.selected = !medic.meta.selected;
            selected.push(medic);
         }
       });
     });
     this.count = selected.length;
     return selected;
  }
  reset() {
    setTimeout(() => {
      this.switchViews('orders');
      this.transMsg = null;
      this.cart = [];
      this.edited = [];
      this.editables = [];
      this.clonedStore = [];
    }, 4000);

  }
   processPayment() {
    // this.edited = this.edited.filter(medication => medication.stockInfo.price);
    this.updateCurMedications();
    this.updateInventory('purchase');

    this.updateMedications();
    // this.runTransaction('purchase');
   }
  runTransaction(type: string) {
    // this.processing = true;
    // this.dataService.runTransaction(this.patient, this.cart).subscribe(() => {
    //   this.products = this.clonedStore;
    //   this.processing = false;
    //   this.patients[this.curIndex] = this.patient;
    //   this.socket.io.emit('transaction', this.cart);
    //   this.transMsg = (type === 'purchase') ? 'Transaction successfull': 'Transaction successfully reversed';
    //   this.reset();
    // }, (e) => {
    //   this.transMsg = (type === 'purchase') ?  'Transaction unsuccessfull': 'Unable to reverse transaction';
    //   this.processing = false;
    // });
  }
  updateInventory(action) {
    // this.clonedStore = cloneDeep(this.products);
    // this.edited.forEach(medication => {
    //   this.clonedStore.forEach(product => {
    //     if(product.item.name === medication.name) {
    //       if(action === 'purchase') {
    //         product.stockInfo.quantity = product.stockInfo.quantity - medication.invoice.quantity;
    //         product.stockInfo.sold = product.stockInfo.sold + medication.invoice.quantity;
    //       } else {
    //         product.stockInfo.quantity = product.stockInfo.quantity + medication.invoice.quantity;
    //         product.stockInfo.sold = product.stockInfo.sold - medication.invoice.quantity;
    //       }
    //         }
    //       });
    //     });
  }

   updateCurMedications() {
  //   this.edited.forEach(medication => {
  //     this.medications.forEach((group, i) => {
  //      group.forEach((medic , j) => {
  //        if (medic._id === medication._id) {
  //         this.medications[i][j] = {...medication, processed: true};
  //        }
  //      });
  //    });
  //    this.patient.record.medications = this.medications;
  //  });
  }

  somePaid(i) {
    // return this.medications[i].some(invoice => invoice.paid);
   }
  getTransTotal(invoices:Invoice[]) {
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
    return 'http://localhost:5000/api/dp/' + avatar;
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
  selectMedication(m: Medication, selected: number) {
    // this.medication = new Medication(m.product, m.priscription);
    // this.id = m._id;
    // this.selected = selected;
    // this.input = m.product.item.name + ' ' + m.product.item.mesure + m.product.item.unit;
  }

  searchProducts(i: string) {
//   if (i === '') {
//     this.searchedProducts = [];
//   } else {
//       this.searchedProducts = this.products.filter((product) => {
//       const patern =  new RegExp('\^' + i , 'i');
//       return patern.test(product.item.name);
//       });
// }
}
cancel() {
  // this.patients[this.curIndex] = this.dataService.getCachedPatient(this.patients[this.curIndex]._id)
  // this.products = this.dataService.getCachedProducts();
}

 searchPatient(name: string) {
//    if(name!==''){
//     this.patients = this.patients.filter((patient) => {
//       const patern =  new RegExp('\^' + name
//       , 'i');
//       return patern.test(patient.info.personal.firstName);
//       });
//    } else {
//      this.patients = this.clonedPatients;
//    }
//  }
// addSelection(product: Product) {
//   this.input = product.item.name;
//   this.product = product;
//   this.searchedProducts = [];
}


  next() {
  //   if (this.medication.name) {
  //       this.edited.unshift(this.medication);
  //       this.medication = new Medication();
  //     if (this.editables.length) {
  //       this.medication = this.editables.shift();
  //       }
  // } else if(this.editables.length) {
  //   this.medication = this.editables.shift();
  // }
}

previous() {
//   if (this.medication.name) {
//    if (this.edited.length) {
//     this.editables.unshift(this.medication);
//     this.medication = this.edited.shift();
//    }
// } else if(this.edited.length) {
//   this.medication = this.edited.shift();
//  }
}
routeHas(path) {
  return this.router.url.includes(path);
}
getStyle(i: Invoice) {
  return {color: i.paid ? 'black' : 'lightgrey'};
}
updateMedications() {
  this.processing = true;
  this.dataService.updateMedication(this.medications).subscribe((m) => {
   this.patients[this.curIndex].record.medications = this.medications;
   this.processing = false;
   this.switchViews('orders');
  }, (e) => {
    this.transMsg = 'Unable to process payment';
    this.processing = false;
  });
}

}
