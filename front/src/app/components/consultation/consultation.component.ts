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
  medications: any[] = new Array<any>(new Array<Medication>());
  tempMedications: Medication[] = new Array<Medication>();
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
    if (this.fowarded) {
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
      this.product = new Product(i);
    }
    console.log(this.product);

  }
  selectPatient(i: number) {
   this.patient = this.patients[i];
    this.medications = this.patient.record.medications.reverse();
   }
  addMedication() {
    this.tempMedications.push(new Medication(this.product, this.priscription));
    this.product = new Product();
    this.priscription = new Priscription();
    this.input = null;
  }
  removePriscription(i: number) {
   this.medications.splice(i);
  }
  getTotal() {

  }


  submitRecord() {

    if (this.medications[0].length) {

      if (new Date(this.medications[0][0].priscription.priscribedOn)
      .toLocaleDateString() === new Date()
      .toLocaleDateString()) {
        for(let m of this.tempMedications){
          this.medications[0].push(m)
        }
       } else {
        this.medications.push(this.tempMedications);
       }

  } else {

    this.medications[0] = this.tempMedications;

  }


    this.patient.record.medications = this.medications.reverse();

    if (this.session.vital.bp.value) {
      this.patient.record.vitals.bp.push(this.session.vital.bp);
    } else {}
    if (this.session.vital.pulse.value) {
      this.patient.record.vitals.pulse.push(this.session.vital.pulse);
    } else {}
     if (this.session.vital.resp.value) {
      this.patient.record.vitals.resp.push(this.session.vital.resp);
    } else {}
     if (this.session.vital.height.value) {
      this.patient.record.vitals.height.push(this.session.vital.height);
    } else {}
     if (this.session.vital.weight.value) {
      this.patient.record.vitals.weight.push(this.session.vital.weight);
    } else {}
     if (this.session.vital.tempreture.value) {
      this.patient.record.vitals.tempreture.push(this.session.vital.tempreture);
    } else {}
     if (this.session.vital.bloodGl.value) {
      this.patient.record.vitals.bloodGl.push(this.session.vital.bloodGl);
    } else {}
     if (this.session.conditions.condition) {
      this.patient.record.conditions.push(this.session.conditions);
    } else {}
     if (this.session.complains.complain) {
      this.patient.record.complains.push(this.session.complains);
    } else {}
     if (this.session.famHist.condition) {
      this.patient.record.famHist.push(this.session.famHist);
    } else {}
     if (this.session.notes.note) {
      this.patient.record.notes.push(this.session.notes);
    } else {}
     if (this.session.allegies.allegy) {
      this.patient.record.allegies.push(this.session.allegies);
    } else {}

    this.dataService.updateRecord(this.patient).subscribe((p: Patient) => {
      this.patients[this.curIndex] = p ;
      this.session = new Session();

    });
  }
}
