import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import { Patient, Client, Item, StockInfo,
  Product, Priscription, Medication, Visit, Note
} from '../../models/data.model';
@Component({
  selector: 'app-ward',
  templateUrl: './ward.component.html',
  styleUrls: ['./ward.component.css']
})
export class WardComponent implements OnInit {
  patients: Patient[] = new Array<Patient>();
  products: Product[] = new Array<Product>();
  client: Client = new Client();
  product: Product = new Product();
  priscription: Priscription = new Priscription();
  medication: Medication = new Medication();
  temProducts: Product[] = new Array<Product>();
  item: Item = new Item();
  items: Item[] = new Array<Item>();
  lastVisit: Visit = new Visit();
  note = new Note();
  input = '';
  view = 'bed';
  id = null;
  selected = null;
  bedNum = null;
  curIndex = 0;


  constructor(private dataService: DataService, private socket: SocketService ) { }
  ngOnInit() {
    this.getInPatients();
    this.getClient();
  }
  getClient() {
    this.dataService.getClient().subscribe((client: Client) => {
      this.client = client;
    });
  }
  selectPatient(i: number) {
    this.curIndex = i;
   }
  getInPatients() {
    this.dataService.getInPatients().subscribe((patients: Patient[]) => {
      this.patients = patients;

      this.lastVisit =  this.patients[0].record.visits[-1];
    });
  }
  getBeds(i) {
    const beds = [];
    const dept = this.client.departments.filter((d) =>
     d.name === this.patients[i].record.visits[this.patients[i].record.visits.length - 1].dept)[0];
     for (let n = 0; n <= dept.beds.length; n++) {
      if (!dept.beds[n]) {
        beds.push(n);

      } else {
      }
    }
    return beds;
  }
  changeBed(i) {
    this.bedNum = this.patients[i].record.visits[ this.patients[i].record.visits.length - 1].bedNo;
    this.patients[i].record.visits[this.patients[i].record.visits.length - 1].bedNo = null;
  }
  assignBed(i) {
    this.dataService.updateBed(this.patients[i]._id, this.bedNum)
    .subscribe((patient: Patient) => {
      this.patients[i].record.visits[this.patients[i].record.visits.length - 1].bedNo = this.bedNum;
     this.client.departments.filter((d) =>
     d.name === this.patients[i].record.visits[this.patients[i].record.visits.length - 1].dept)[0].beds[this.bedNum] = true;
    });
  }
  updateNote() {
   this.dataService.updateNote(this.patients[this.curIndex]._id, this.note).subscribe((patient: Patient) => {
      this.patients[this.curIndex] = patient;
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
  // this.patients[i].status = 'discharged';
}
gone(i) {
  // this.patients[i].status = 'gone';
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
