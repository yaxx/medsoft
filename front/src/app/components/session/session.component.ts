import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {ActivatedRoute} from '@angular/router';
import { Patient, Record, Item, StockInfo,
  Product, Priscription, Medication, Complain,
  FamHist, Note, Vital, Condition, Allegy, Device, Visit, Test, Sugery, DeathNote, Bp, Bg, Temp, Resp, Pulse, Height, Weight
} from '../../models/data.model';


@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit {
  patient: Patient = new Patient();
  patients: Patient[] = new Array<Patient>();
  record: Record = new Record();
  priscription: Priscription = new Priscription();
  medication: Medication =  new Medication(new Product(), new Priscription() );
  medications: Medication[] = new Array<Medication>();
  item: Item = new Item();
  items: Item[] = new Array<Item>();
  temItems: Item[] = new Array<Item>();
  product: Product = new Product(new Item(), new StockInfo());
  products: Product[] = new Array<Product>();
  selectedProducts: Product[] = new Array<Product>();
  input = '';
  in = 'discharge';
  constructor(private dataService: DataService, private route: ActivatedRoute, private socket: SocketService) { }

  ngOnInit() {
    this.getProducts();
    this.getItems();
  }
  getProducts() {
    this.dataService.getProducts().subscribe((p: any) => {
      this.products = p.inventory;
    });
  }
  // this.route.snapshot.params['id']
  getItems() {
    this.dataService.getItems().subscribe((items: Item[]) => {
      this.items = items;
    });
  }
  selectItem(i: Item) {

  }

  searchItem (i) {
    if (i === '') {
      this.temItems = new Array<Item>();
    } else {
    this.temItems = this.items.filter((item) => {
    const patern =  new RegExp('\^' + i , 'i');
    return patern.test(item.name);
    });
  }

}

  switchBtn(option: string) {
   this.in = option;
   console.log(this.in);
  }
  getConsultees() {
    this.dataService.getConsultees().subscribe((p: Patient[]) => {
      this.patients = p;
     this.dataService.setCachedPatients(p);
    });
  }


  addSelection(i: Item) {
    this.input = i.name + ' ' + i.mesure + i.unit;
    this.temItems = new Array<Item>();

    const temp: Product[] = this.products.filter((p) => p.item._id === i._id);
    if (temp.length) {
      this.product = temp[0];
    } else {
      this.product = new Product(i, new StockInfo());
    }
  }
  addMedication() {
    this.medications.push(new Medication(this.product, this.priscription));
    this.product = new Product();
    this.priscription = new Priscription();
    this.input = null;
  }


  removePriscription(i) {
   this.medications.splice(i);
  }
  getTotal() {
    //  let sum = 0;
    //  for (const item of this.record.medication) {
    //    sum = sum + item.price;
    //  }
    //  return sum;
  }
  saveRecord() {
    this.dataService.updateRecord(this.record, this.medications).subscribe((newrecord: Record) => {
      this.patients[0].record = newrecord;
      this.record = new Record();
    });
  }

}