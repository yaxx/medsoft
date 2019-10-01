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
  items: Item[] = [];
  temItems: Item[] = [];
  searchedProducts: Product[] = [];
  medications: any[] = new Array<any>(new Array<Medication>());
  edited: Medication[] = [];
  editables: Medication[] = [];
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
  getPatients(type:string) {
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
    this.patient = cloneDeep(this.patients[i]);
    this.patient.record.invoices = this.patient.record.invoices.map(
      invoice => invoice.map( i => {
      const product = this.products.find(pro => pro.item.name === i.desc);
      return ( product && !i.paid) ? ({
        ...i, price: product.stockInfo.price
        }) : i;
    }));
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
    this.medication = this.editables.shift();
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
   this.patient.record.invoices[i][j].meta.selected = !this.patient.record.invoices[i][j].meta.selected;
  }
  selectCard(i){
    this.patient.record.cards[i].meta.selected =  !this.patient.record.cards[i].meta.selected;
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
      // this.switchViews('orders');
      this.transMsg = null;
      this.cart = [];
      // this.edited = [];
      // this.editables = [];
      this.clonedStore = [];
    }, 4000);

  }

  reversePayment() {
    //   this.edited.forEach(medication => {
    //     this.medications.forEach((group, i) => {
    //      group.forEach((medic , j) => {
    //        if (medic._id === medication._id) {
    //         this.medications[i][j] = {...medication, paid: false, quantity: 0, selected: false};
    //        }
    //      });
    //    });
    //  });

    // this.patient.record.medications = this.medications;
    // this.updateInventory('reverse');
    // this.runTransaction('refund');
  }

  runTransaction(type: string) {
    this.processing = true;
    this.dataService.runTransaction(this.patient._id, this.patient.record, this.cart).subscribe(() => {
      this.products = this.clonedStore;
      this.processing = false;
      this.patients[this.curIndex] = this.patient;
      this.socket.io.emit('transaction', this.cart);
      this.transMsg = (type === 'purchase') ? 'Transaction successfull': 'Transaction successfully reversed';
      this.reset();
    }, (e) => {
      this.transMsg = (type === 'purchase') ?  'Transaction unsuccessfull': 'Unable to reverse transaction';
      this.processing = false;
    });
  }

  updateQty(action, i, q) {
      this.clonedStore = cloneDeep(this.products);
      if(action === 'purchase') {
            this.clonedStore[i].stockInfo.quantity = this.clonedStore[i].stockInfo.quantity - q;
            this.clonedStore[i].stockInfo.sold = this.clonedStore[i].stockInfo.sold + q;
          } else {
            this.clonedStore[i].stockInfo.quantity = this.clonedStore[i].stockInfo.quantity + q;
            this.clonedStore[i].stockInfo.sold = this.clonedStore[i].stockInfo.sold - q;
          }
            this.cart.push(this.clonedStore[i]);
  }
  updateInventory(action) {
    this.clonedStore = cloneDeep(this.products);
    for(let invoices of this.patient.record.invoices) {
      for (let i of invoices) {
        this.clonedStore.forEach((product, index) => {
          if( product.item.name === i.name || product.item.name === i.desc ) {
            this.updateQty(action, index, i.quantity);
          }
        });
      }
    }
  }
  updateInvoices() {
    this.patient.record.invoices = this.patient.record.invoices.map(
      invoices => invoices.map(i => {
        if(i.name === 'Card' && i.meta.selected) {
          this.patient.record.visits[0][0].status = 'queued';
        } else {}
        return (i.meta.selected) ? ({
          ...i, paid: true,
          datePaid: new Date(),
          comfirmedBy: this.cookies.get('i')
        }) : i;
      }
    ));

   }

  comfirmPayment() {
    this.updateInvoices();
    this.updateInventory('purchase');
  //  console.log(this.patient.record.invoices)
    this.runTransaction('purchase');
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
    // let total = 0;
    //  this.edited.forEach((m) => {
    //    total = total + m.invoice.quantity * m.stockInfo.price;
    //  });
    //  return total;
  }
    getDp(avatar: String) {
    return 'http://localhost:5000/api/dp/' + avatar;
    // return 'http://18.221.76.96:5000/api/dp/' + avatar;
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
      this.items = res.items;
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
  this.processing = true;
  this.dataService.updateMedication(this.medications).subscribe((newMedications: Medication[]) => {
   this.patients[this.curIndex].record.medications = newMedications;
   this.processing = false;
  },(e) => {
    this.transMsg = 'Unable to process payment';
    this.processing = false;
  });
}


}
