import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import update from 'react-addons-update';
import {Person} from '../../models/person.model';
import {CookieService } from 'ngx-cookie-service';
import {Product, Item, StockInfo} from '../../models/inventory.model';
import {Priscription, Medication} from '../../models/record.model';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.css']
})
export class PharmacyComponent implements OnInit {
  patients: Person[] = new Array<Person>();
  patient: Person = new Person();
  products: Product[] = new Array<Product>();
  product: Product = new Product();
  priscription: Priscription = new Priscription();
  medication: Medication = new Medication();
  temProducts: Product[] = new Array<Product>();
  item: Item = new Item();
  items: Item[] = new Array<Item>();
  temItems: Item[] = new Array<Item>();
  searchedItems: Item[] = new Array<Item>();
  medications: any[] = new Array<any>(new Array<Medication>());
  edited: Medication[] = new Array<Medication>();
  editables: Medication[] = new Array<Medication>();
  tempMedications: Medication[] = new Array<Medication>();
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
    this.getItems();
    this.socket.io.on('new order', (patient: Person) => {
      this.patients.push(patient);
  });
  }
  getItems() {
    this.dataService.getItems().subscribe((items: Item[]) => {
      this.items = items;
    });
  }
   showSortMenu() {
    this.sortMenu = true;
  }
  refresh(){
    this.getPatients();
    this.getProducts();
    this.getItems();
  }
  getPatients() {
    this.loading = true;
    this.dataService.getPatients().subscribe((patients: Person[]) => {
      let mypatients = patients.filter(patient => patient.record.medications.length)
      if(mypatients.length) {
        this.patients = mypatients .map( patient => ({
          ...patient,
          card: {menu: false, view: 'front'}
        }));
      this.dataService.setCachedPatients(this.patients);
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
    this.patient = this.patients[i];
     this.medications = this.patient.record.medications.map(medication => medication.map( medic => {
       const product = this.products.find(pro => pro.item._id === medic.product.item._id)
       return ( product) ? ({...medic, product: product, selected: false}) : medic;
      }))
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
    this.editables = this.getSelections(this.curIndex);
    this.medication = this.editables.shift();
    this.input = this.medication.product.item.name + ' ' + this.medication.product.item.mesure + this.medication.product.item.unit;
    this.switchViews('editing');
  }
  getReversables(i: number, j: number) {
    // this.curIndex = i;
    this.edited.push(this.patients[this.curIndex].record.medications[i][j]);
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
  getSelections(i: number) {
    const selected = [];
     this.medications.forEach(group => {
       group.forEach(medic => {
         if (medic.selected) {
            selected.push(update(medic, {
             selected: {$set: false}
           }));
         } else {
          return;
         }
       });
     });
     this.count = selected.length;
    return selected;
  }
  reset() {
    this.edited = [];
    this.editables = [];
  }
   comfirmPayment() {
    this.edited = this.edited.filter(medication => medication.product.stockInfo.price);
    this.updateCurMedications();
    this.runTransaction('purchase');
   }
  reversePayment() {
    this.products.forEach(prod => {
      if(prod.item._id === this.edited[0].product.item._id) {
          prod.stockInfo.inStock = prod.stockInfo.inStock + this.edited[0].purchased;
          prod.stockInfo.sold = prod.stockInfo.sold - this.edited[0].purchased;
          }
        });
    this.medications.forEach(group => {
      group.forEach(medic => {
        if (medic._id === this.edited[0]._id) {
          medic.paid = false;
          medic.selected = false;
          medic.purchased = 0;
        }
      });
    });
    this.patients[this.curIndex].record.medications = this.medications;
    this.runTransaction('refund');
  }

  runTransaction(type: string) {
    this.processing = true;
    this.dataService.runTransaction(this.patient, this.products).subscribe((inventory: any) => {
      this.processing = false;
      this.products = inventory;
      this.dataService.setCachedProducts(this.products);
      this.dataService.setCachedPatients(this.patients);
      if(type === 'purchase') {
         this.socket.io.emit('purchase', this.edited);
         this.transMsg = 'Transaction successfull';
         setTimeout(() => {
          this.switchViews('orders');
          this.transMsg = null;
      }, 4000);
      } else {
         this.socket.io.emit('refund', this.edited[0]);
         this.transMsg = 'Transaction successfully reversed';
         setTimeout(() => {
          this.switchViews('orders');
          this.transMsg = null;
      }, 4000);
      }
      this.reset();
    },(e) => {
      this.transMsg = 'Transaction unsuccessfull';
      this.processing = false;
    });
  }
 

  updateInventory() {
    this.edited.forEach(medication => {
      this.products.forEach(prod => {
        if(prod.item._id === medication.product.item._id) {
            prod.stockInfo.inStock = prod.stockInfo.inStock - medication.purchased;
            prod.stockInfo.sold = prod.stockInfo.sold + medication.purchased;
            }
          });
        })
      }

   updateCurMedications() {
    this.edited.forEach(medication => {
      this.medications.forEach(group => {
       group.forEach(medic => {
         if (medic._id === medication._id) {
           medic.purchased = medication.purchased;
           medic.paid = true;
           medic.selected = false;
         }
       });
     });
     this.patient.record.medications = this.medications;
     this.updateInventory();
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
    return this.getDp(this.cookies.get('d'))
  }
  getProducts() {
    this.dataService.getProducts().subscribe((p: any) => {
      this.products = p.inventory;
      this.dataService.setCachedProducts(this.products);
    });
  }
  selectMedication(m: Medication, selected: number) {
    this.medication = new Medication(m.product, m.priscription);
    this.id = m._id;
    this.selected = selected;
    this.input = m.product.item.name + ' ' + m.product.item.mesure +     m.product.item.unit;

  }

searchItems(i: string) {
  if (i === '') {
    this.searchedItems = new Array<Item>();
  } else {
    this.searchedItems = this.items.filter((item) => {
    const patern =  new RegExp('\^' + i , 'i');
    return patern.test(item.name);
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
addSelection(item: Item) {
  this.input = item.name + ' ' + item.mesure + item.unit;
    this.products.forEach(prod => {
    if (prod.item._id === item._id) {
      this.medication.product = prod;
    } else {
        this.medication.product = new Product(item);
    }
  });
  this.searchedItems = new Array<Item>();
}
next() {
  if (this.medication._id) {
      if (this.item.name) {
        this.medication.product.item = this.item;
        this.edited.unshift(this.medication);
        this.item = new Item();
        this.edited.unshift(this.medication);
        // this.counter = this.counter + 1;
      } else {
        this.edited.unshift(this.medication);
        // this.counter = this.counter + 1;
      }
      if (this.editables.length) {
        this.medication = this.editables.shift();
        this.input = this.medication.product.item.name + ' ' + this.medication.product.item.mesure + this.medication.product.item.unit;
      } else {
        this.medication = new Medication();
        this.input = '';

      }

  } else {

  }

}
previous() {
  if (!this.edited.length) {

  } else {
    if (this.item.name) {
      this.medication.product.item = this.item;
      this.editables.unshift(this.medication);
      this.item = new Item();
    } else {
      this.editables.unshift(this.medication);
      this.input = this.medication.product.item.name + ' ' + this.medication.product.item.mesure + this.medication.product.item.unit;
    }
    this.medication = this.edited.shift();
    this.input = this.medication.product.item.name + ' ' + this.medication.product.item.mesure + this.medication.product.item.unit;

  }

}


updateMedication() {
  this.dataService.updateMedication(this.patients[this.selected]._id, this.medication).subscribe((patient: Person) => {
   this.patients[this.selected] = patient;
   this.medication = new Medication(new Product(), new Priscription());
  });
}

}
