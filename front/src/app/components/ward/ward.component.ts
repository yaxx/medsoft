import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import { Patient, Record, Item, StockInfo,
  Product, Priscription, Medication, Visit
} from '../../models/data.model';
@Component({
  selector: 'app-ward',
  templateUrl: './ward.component.html',
  styleUrls: ['./ward.component.css']
})
export class WardComponent implements OnInit {
  patients: Patient[] = new Array<Patient>();
  products: Product[] = new Array<Product>();
  product: Product = new Product(new Item(), new StockInfo());
  priscription: Priscription = new Priscription();
  medication: Medication = new Medication(new Product(), new Priscription());
  temProducts: Product[] = new Array<Item>();
  item: Item = new Item();
  items: Item[] = new Array<Item>();
  lastVisit: Visit = new Visit();
  input = '';
  view = 'drugs';
  id = null;
  selected = null;

  constructor(private dataService: DataService, private socket: SocketService ) { }

  ngOnInit() {
    this.getOrders();
  }
  getOrders() {
    this.dataService.getOrders().subscribe((patients: Patient[]) => {
      this.patients = patients;
      this.lastVisit =  this.patients[0].record.visits[-1];
    });
  }
  selectDrug(p: number, m: number) {
    if (this.patients[p].record.medications[m].selected) {
      this.patients[p].record.medications[m].selected = false;

    } else {
      this.patients[p].record.medications[m].selected = true;
    }
  }
  updateTimeTaken(p: number, m: number) {
    for (const medication of this.patients[p].record.medications) {
      if (medication.selected) {
        medication.lastTaken = new Date();
        medication.selected = false;
      } else {}
    }
  }


  selectMedication(p: number, m: number) {
  if (this.patients[p].record.medications[m].paused) {
    this.patients[p].record.medications[m].paused = false;

  } else {
    this.patients[p].record.medications[m].paused = true;
  }

}
discharge(i) {
  this.patients[i].status = 'discharged';
}
gone(i) {
  this.patients[i].status = 'gone';
}

switchViews() {
  if (this.view === 'details') {
     this.view = '';
  } else {
    this.view = 'details';
  }
}

getProducts() {
  this.dataService.getProducts().subscribe((p: any) => {
    this.products = p.inventory;

  });
}

searchItem (input) {
  if (input === '') {
    this.temProducts = new Array<Product>();
  } else {
  this.temProducts = this.products.filter((product) => {
  const patern =  new RegExp('\^' + input , 'i');
  return patern.test(product.item.name);
  });
}
}


selectProduct(product: Product) {
this.input = product.item.name + ' ' + product.item.mesure + product.item.unit;
this.temProducts = new Array<Product>();
this.medication.product = product;


}

updateMedication() {
  this.dataService.updateMedication(this.medication).subscribe((medications: Medication[]) => {
    console.log(this.selected);
    console.log(medications);
   this.patients[this.selected].record.medications = medications;
   this.medication = new Medication(new Product(), new Priscription());
  });
}



}
