import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import update from 'react-addons-update';
import { Person, Item, StockInfo,
  Product, Priscription, Medication
} from '../../models/data.model';


@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.css']
})
export class PharmacyComponent implements OnInit {
  patients: Person[] = new Array<Person>();
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
  temPatients: Person[] = new Array<Person>();
  input = '';
  searchTerm = '';
  medicView = false;
  sortBy = 'added';
  sortMenu = false;
  nowSorting = 'Date added';
  view = 'default';
  count = 0;
  id = '';
  selected = null;
  curIndex = 0;
  reversedProduct = [];


  constructor(private dataService: DataService,
    private socket: SocketService ) { }

  ngOnInit() {
    this.getOrders();
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
  switchViews(view) {
    this.view = view;
  }
  switchToNewMedic(){
    this.medicView = !this.medicView;
  }
  swichtToFront(i) {
    this.patients[i].card.view = 'front';
  }
  switchToEdit(i: number) {
    this.curIndex = i;
    this.editables = this.getSelections(i);
    this.medication = this.editables.shift();
    this.input = this.medication.product.item.name + ' ' + this.medication.product.item.mesure + this.medication.product.item.unit;
    // this.switchViews('edit');
  }
  getReversables(i: number, j: number, k: number) {
    this.curIndex = i;
    this.edited.push(this.patients[i].record.medications[j][k]);
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
        this.patients.sort((m, n) => new Date(n.dateCreated).getTime() - new Date(m.dateCreated).getTime());
        this.nowSorting = 'Date added';
        break;
        default:
        break;
    }
  }
  selectItem(i: number, j: number, k: number) {
   this.curIndex = i;
   this.patients[i].record.medications[j][k].selected =
   this.patients[i].record.medications[j][k].selected ? false : true;
   if (this.patients[i].record.medications[j][k].paid) {
    // $('.trigger').click();
  } else {
  }
  }
  medidcationsSelected(i: number) {
    return this.patients[i].record.medications.some(med => med.some(m => m.selected));
  }
  getSelections(i: number) {
    const selected = [];
     this.patients[i].record.medications.forEach(group => {
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
  reversePayment() {
    let inlinePatients = [];
    this.edited.forEach(medic => {
    this.patients.forEach(pat => {
      pat.record.medications.forEach(med => {
        med.forEach(m => {
          if(m.product.item._id === medic.product.item._id) {
            m.product.stockInfo.quantity = m.product.stockInfo.quantity + medic.purchased;
            inlinePatients.push(pat);
          } else {

          }
        })
      });
    })
  })

  this.edited.forEach(medic => {
    this.products.forEach(prod => {
      if(prod.item._id === medic.product.item._id) {
          prod.stockInfo.quantity = prod.stockInfo.quantity + medic.purchased;
          prod.stockInfo.sold = prod.stockInfo.sold - medic.purchased;
          this.reversedProduct.push(medic);
          } else {

          }
        });
      });
    this.edited.forEach(medication => {
      this.patients[this.curIndex].record.medications.forEach(group => {
        group.forEach(medic => {
          if (medic._id === medication._id) {
            medic.product.stockInfo.quantity = medic.product.stockInfo.quantity + medication.purchased;
            medic.paid = false;
            medic.purchased = 0;
          } else {

          }
        });
      });
    });
    inlinePatients.push(this.patients[this.curIndex]);
    this.runTransaction(inlinePatients, 'refund');
  }

  runTransaction(patients: Person[], type: string) {
    this.dataService.runTransaction(patients, this.products).subscribe((transaction: any) => {
      this.products = transaction.inventory;
      if(type === 'purchase') {
         this.socket.io.emit('purchase', this.edited);
      } else {
         this.socket.io.emit('refund', this.reversedProduct);
         this.reversedProduct = [];
      }
      this.reset();
    });
  }
  comfirmPayment() {
    let inlinePatients = [];
    this.edited.forEach(medication => {
     this.patients[this.curIndex].record.medications.forEach(group => {
      group.forEach(medic => {
        if (medic._id === medication._id) {
          medic.purchased = medication.purchased;
          medic.product.stockInfo.quantity = medic.product.stockInfo.quantity - medication.purchased;
          medic.paid = true;
          medic.selected = false;
          // selected.push(medic);
        } else {

        }
      });
    });
  });
  inlinePatients.push(this.patients[this.curIndex]);
  this.edited.forEach(medic => {
    this.patients.forEach(pat => {
      pat.record.medications.forEach(med => {
        med.forEach(m => {
          if(m.product.item._id === medic.product.item._id) {
            m.product.stockInfo.quantity = m.product.stockInfo.quantity - medic.purchased;
            inlinePatients.push(pat);
          } else {

          }
        })
      })
    })
  })

  this.edited.forEach(medic => {
    this.products.forEach(prod => {
      if(prod.item._id === medic.product.item._id) {
          prod.stockInfo.quantity = prod.stockInfo.quantity - medic.purchased;
          prod.stockInfo.sold = prod.stockInfo.sold + medic.purchased;
          } else {

          }
        });
      });

  this.runTransaction(inlinePatients,'purchase');
  }
  somePaid(i, j) {
    return this.patients[i].record.medications[j].some(m => m.paid );
   }
  getTransTotal(i, j) {
    let total = 0;
    this.patients[i].record.medications[j].forEach((m) => {
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
  getOrders() {
    this.dataService.getOrders().subscribe((patients: Person[]) => {
      this.patients = patients.filter(p => p.record.medications[0].length);
      console.log(patients);
    });
  }
  getDp(p: Person){
    return 'http://localhost:5000/api/dp/' + p.info.personal.dpUrl;
  }
  getProducts() {
    this.dataService.getProducts().subscribe((p: any) => {
      this.products = p.inventory;
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
 searchPatient(name:string) {
   if(name!==''){
    this.patients = this.patients.filter((patient) => {
      const patern =  new RegExp('\^' + name
      , 'i');
      return patern.test(patient.info.personal.firstName);
      });
   } else {
     this.patients = this.temPatients;
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
