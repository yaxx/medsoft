import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import update from 'react-addons-update';
import {Person} from '../../models/person.model';
import {CookieService } from 'ngx-cookie-service';
import {Product, Item, StockInfo} from '../../models/inventory.model';
import {Priscription, Medication} from '../../models/record.model';
import * as cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.css']
})
export class PharmacyComponent implements OnInit {
  patients: Person[] = []
  patient: Person = new Person();
  products: Product[] = []
  clonedStore: Product[] = []
  cart: Product[] = []
  product: Product = new Product();
  priscription: Priscription = new Priscription();
  medication: Medication = new Medication();
  temProducts: Product[] = new Array<Product>();
  item: Item = new Item();
  items: Item[] = [];
  temItems: Item[] = [];
  searchedProducts: Product[] = [];
  medications: any[] = new Array<any>(new Array<Medication>());
  edited: Medication[] = []
  editables: Medication[] = []
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
    private socket: SocketService ) { }

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

   showSortMenu() {
    this.sortMenu = true;
  }
  refresh() {
    this.getPatients();
    this.getProducts();
  }
  getPatients() {
    this.loading = true;
    this.dataService.getPatients().subscribe((patients: Person[]) => {
      let mypatients = patients.filter(patient => patient.record.medications.length);
      if(mypatients.length) {
        this.patients = mypatients.map( patient => ({
          ...patient,
          card: {menu: false, view: 'front'}
        }));
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
  selectPatient(i: number) {
    this.curIndex = i;
    this.patient = cloneDeep(this.patients[i]);
     this.medications = this.patient.record.medications.map(medication => medication.map( medic => {
       const product = this.products.find(pro => pro.item.name === medic.product.item.name);
       return ( product) ? ({...medic, product: product, selected: false}) : ({...medic, product: {...medic.product, stockInfo: new StockInfo()}, selected: false});
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
    this.input = this.medication.product.item.name;
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
   this.medications[i][j].selected = !this.medications[i][j].selected;
   if (this.patients[this.curIndex].record.medications[i][j].paid) {
    // $('.trigger').click();
  }
  }
  medidcationsSelected(i: number) {
    return this.medications.some(med => med.some(m => m.selected));
  }
  getSelections() {
    const selected = [];
     this.medications.forEach(group => {
       group.forEach(medic => {
         if (medic.selected) {
            selected.push({...medic, selected: false});
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
   comfirmPayment() {
    this.edited = this.edited.filter(medication => medication.product.stockInfo.price);
    this.updateCurMedications();
    this.updateInventory('purchase');
    this.runTransaction('purchase');
   }
  reversePayment() {
      this.edited.forEach(medication => {
        this.medications.forEach((group, i) => {
         group.forEach((medic , j) => {
           if (medic._id === medication._id) {
            this.medications[i][j] = {...medication, paid: false, purchased: 0, selected: false};
           }
         });
       });
     });
     console.log(this.edited)
    this.patient.record.medications = this.medications;
    this.updateInventory('reverse');
    this.runTransaction('refund');
  }

  runTransaction(type: string) {
    this.processing = true;
    this.dataService.runTransaction(this.patient, this.cart).subscribe(() => {
      this.products = this.clonedStore;
      this.processing = false;
      this.patients[this.curIndex] = this.patient;
      this.socket.io.emit('transaction', this.cart);
      this.transMsg = (type==='purchase') ? 'Transaction successfull': 'Transaction successfully reversed';
      this.reset();
    },(e) => {
      this.transMsg = (type==='purchase') ?  'Transaction unsuccessfull': 'Unable to reverse transaction';
      this.processing = false;
    });
  }
  updateInventory(action) {
    this.clonedStore = cloneDeep(this.products);
    this.edited.forEach(medication => {
      this.clonedStore.forEach(product => {
        if(product._id === medication.product._id) {
          console.log(product);
          if(action ==='purchase') {
            product.stockInfo.inStock = product.stockInfo.inStock - medication.purchased;
            product.stockInfo.sold = product.stockInfo.sold + medication.purchased;
          } else {
            product.stockInfo.inStock = product.stockInfo.inStock + medication.purchased;
            product.stockInfo.sold = product.stockInfo.sold - medication.purchased;
          }  
             this.cart.push(product);
             
            }
          });
        });
  }

   updateCurMedications() {
    this.edited.forEach(medication => {
      this.medications.forEach((group, i) => {
       group.forEach((medic , j) => {
         if (medic._id === medication._id) {
          this.medications[i][j] = {...medication, paid: true};
         }
       });
     });
     this.patient.record.medications = this.medications;
   });
  }

  somePaid(i) {
    return this.medications[i].some(m => m.paid);
   }
  getTransTotal(i) {
    let total = 0;
    this.patient.record.medications[i].forEach((m) => {
      total = total + m.purchased * m.product.stockInfo.price;
    });
    return total;
  }
  getPriceTotal() {
    let total = 0;
     this.edited.forEach((m) => {
       total = total + m.purchased * m.product.stockInfo.price;
     });
     return total;
  }
    getDp(avatar: String) {
    return 'http://localhost:5000/api/dp/' + avatar;
  }

  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  getProducts() {
    this.dataService.getProducts().subscribe((res: any) => {
      this.products = res.inventory;
      console.log(this.products);
      this.items = res.items;
    });
  }
  selectMedication(m: Medication, selected: number) {
    this.medication = new Medication(m.product, m.priscription);
    this.id = m._id;
    this.selected = selected;
    this.input = m.product.item.name + ' ' + m.product.item.mesure + m.product.item.unit;
  }

  searchProducts(i: string) {
  if (i === '') {
    this.searchedProducts = [];
  } else {
      this.searchedProducts = this.products.filter((product) => {
      const patern =  new RegExp('\^' + i , 'i');
      return patern.test(product.item.name);
      });
}
}
cancel() {
  this.patients[this.curIndex] = this.dataService.getCachedPatient(this.patients[this.curIndex]._id)
  this.products = this.dataService.getCachedProducts();
}

 searchPatient(name:string) {
   if(name!==''){
    this.patients = this.patients.filter((patient) => {
      const patern =  new RegExp('\^' + name
      , 'i');
      return patern.test(patient.info.personal.firstName);
      });
   } else {
     this.patients = this.dataService.getCachedPatients();
   }
 }
addSelection(product: Product) {
  this.input = product.item.name;
  this.product = product;
  this.searchedProducts = [];
}


  next() {
    if (this.input !== '') {
      if (this.product._id) {
        this.medication.product = this.product;
        this.edited.unshift(this.medication);
        this.product = new Product();
      } else {
        this.edited.unshift(this.medication);
      }
      this.input = '';
      this.medication = new Medication();
      if (this.editables.length) {
        this.medication = this.editables.shift();
        this.input = this.medication.product.item.name;
      }
  }
}

previous() {
  if (this.input !== '') {
    if (this.edited.length) {
      if (this.product._id) {
        this.medication.product = this.product;
        this.product = new Product();
        this.editables.unshift(this.medication);
      } else {
          this.editables.unshift(this.medication);
          this.medication = this.edited.shift();
          this.input = this.medication.product.item.name;
      }
  }
  } else if (this.edited.length) {
    this.medication = this.edited.shift();
    this.input = this.medication.product.item.name;
  }
}


updateMedication() {
  this.dataService.updateMedication(this.patients[this.selected]._id, this.medication).subscribe((patient: Person) => {
   this.patients[this.selected] = patient;
   this.medication = new Medication(new Product(), new Priscription());
  });
}

}
