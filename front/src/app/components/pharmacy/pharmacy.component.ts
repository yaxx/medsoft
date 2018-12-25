import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import { Patient, Item, StockInfo,
  Product, Priscription, Medication
} from '../../models/data.model';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.css']
})
export class PharmacyComponent implements OnInit {
  patients: Patient[] = new Array<Patient>();
  products: Product[] = new Array<Product>();
  product: Product = new Product();
  priscription: Priscription = new Priscription();
  medication: Medication = new Medication();
  temProducts: Product[] = new Array<Product>();
  item: Item = new Item();
  items: Item[] = new Array<Item>();
  input = '';
  view = '';
  id = null;
  selected = null;
  curIndex = 0;


  constructor(private dataService: DataService, private socket: SocketService ) { }

  ngOnInit() {
    this.getOrders();
    this.getProducts();
    this.socket.io.on('new order', (patient: Patient) => {
      this.patients.push(patient);
  });
  }
  switchViews() {
    if (this.view === 'details') {
       this.view = '';
    } else {
      this.view = 'details';
    }
  }
  selectItem(i: number, j: number, k: number) {
   this.curIndex = i;
   this.patients[i].record.medications[j][k].selected =
   this.patients[i].record.medications[j][k].selected ? false : true;
  if(this.patients[i].record.medications[j][k].paid) {
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
    return selected;
  }
  runTransaction() {

    this.dataService.runTransaction(this.patients[this.curIndex],this.products).subscribe((transaction)=>{
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
      this.products.forEach(product=>{
        if(medication.product.item._id===product.item._id) {
          product.stockInfo.sold = product.stockInfo.sold === product.stockInfo.quantity ? product.stockInfo.sold : product.stockInfo.sold + 1;
        }else{

        }
      })
  
    });
    
    this.runTransaction();

  }


  getOrders() {
    this.dataService.getOrders().subscribe((patients: Patient[]) => {
      this.patients = patients;
     

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
    this.switchViews();
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
