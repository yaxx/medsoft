import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
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
  input = '';
  view = 'default';
  editables: Medication[] = new Array<Medication>();
  edited: Medication[] = new Array<Medication>();
  count = 0;
  id = null;
  selected = null;
  curIndex = 0;
  comfirmables = [];


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
  switchViews(view) {
    this.view = view;
  }
  switchToEdit() {
    this.editables = this.getSelections();
    this.medication = this.editables.shift();
    this.input = this.medication.product.item.name + ' ' + this.medication.product.item.mesure + this.medication.product.item.unit;
    this.switchViews('edit');
  }
  comfirmable() {
    const selected = [];
    this.patients[0].record.medications.forEach(group => {
      group.forEach(medic => {
        if ((medic.selected) && (medic.product.stockInfo.price || medic.product.stockInfo.quantity === medic.product.stockInfo.sold)) {
          selected.push(medic);
        }
      });
    });
   return selected;
  }
  selectItem(i: number, j: number, k: number) {
   this.curIndex = i;
   this.patients[i].record.medications[j][k].selected =
   this.patients[i].record.medications[j][k].selected ? false : true;
   if (this.patients[i].record.medications[j][k].paid) {
    $('.trigger').click();
  } else {
  }
  }

  getSelections() {
    const selected = [];
     this.patients[0].record.medications.forEach(group => {
       group.forEach(medic => {
         if (medic.selected) {
           selected.push(medic);
         }
       });
     });
     this.count = selected.length;
    return selected;
  }
  runTransaction() {
    this.dataService.runTransaction(this.patients[this.curIndex], this.products).subscribe((transaction) => {
      console.log(transaction);
      this.patients[this.curIndex] = transaction.patient;
      this.products = transaction.inventory;
    });
  }
  comfirmPayment() {
    const selected = [];
    this.patients[this.curIndex].record.medications.forEach(group => {
      group.forEach( medic => {
        if (medic.selected) {
          medic.selected = false;
          medic.paid = true;
          selected.push(medic);
        }
      });
    });

    selected.forEach(medication => {
      this.products.forEach(product => {
        if (medication.product.item._id === product.item._id) {
        product.stockInfo.sold =
        product.stockInfo.sold === product.stockInfo.quantity ? product.stockInfo.sold : product.stockInfo.sold + 1;
        } else {

        }
      });

    });

    this.runTransaction();

  }
  getOrders() {
    this.dataService.getOrders().subscribe((patients: Person[]) => {
      this.patients = patients;
      console.log(patients);
    });
  }
  getProducts() {
    this.dataService.getProducts().subscribe((p: any) => {
      this.products = p.inventory;
    });
  }
  selectMedication(m: Medication, selected: number) {
    this.medication = new Medication(m.product, m.priscription,  m._id);
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
    }
    this.medication = this.edited.shift();
    this.input = this.medication.product.item.name + ' ' + this.medication.product.item.mesure + this.medication.product.item.unit;

  }

}


updateMedication() {
  this.dataService.updateMedication(this.medication).subscribe((medications: Medication[]) => {
   this.patients[this.selected].record.medications = medications;
   this.medication = new Medication(new Product(), new Priscription());
  });
}

}
