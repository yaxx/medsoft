import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {Client, Department,  Patient, Record, Session, Item, StockInfo,
  Product, Priscription, Medication
} from '../../models/data.model';

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.css']
})
export class ConsultationComponent implements OnInit {
  patient: Patient = new Patient();
  patients: Patient[] = new Array<Patient>();
  record: Record = new Record();
  client: Client = new Client();
  department: Department = new Department();
  session: Session = new Session();
  curIndex = 0;
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
  fowarded = false;
  constructor(private dataService: DataService, private socket: SocketService ) {

   }

  ngOnInit() {
   this.getConsultees();
   this.getProducts();
   this.getItems();
   this.getClient();
   this.socket.io.on('new patient', (patient: Patient) => {
      this.patients.push(patient);
  });
  }
  getClient() {
    this.dataService.getClient().subscribe((client: Client) => {
      this.client = client;
    });

  }
  conclude(conclution) {
    this.fowarded = conclution === 'fowarded' ? true : false;
  }
  fetchDept() {
    if(this.fowarded) {
      return this.client.departments
      .filter((dept) => (dept.hasWard) && (dept.name !== this.patients[this.curIndex].record.visits[0].dept));
    } else {
      return [];
    }

  }
  getProducts() {
    this.dataService.getProducts().subscribe((p: any) => {
      this.products = p.inventory;
    });
  }
  getItems() {
    this.dataService.getItems().subscribe((items: Item[]) => {
      this.items = items;
    });
  }
  selectItem(i: Item) {
  }
  selectPatient(i: number) {
   this.curIndex = i;
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
      console.log(p);
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
  submitRecord() {
    this.session.medications = this.medications;
    this.dataService.updateRecord(this.session, this.patients[this.curIndex]._id).subscribe((p: Patient) => {
      this.patients[this.curIndex] = p ;
      this.session = new Session();
      this.medication = new Medication();

    });
  }
}
