import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import { Patient, Record, Item, StockInfo, Product, Priscription} from '../../models/data.model';

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.css']
})
export class ConsultationComponent implements OnInit {
  patient: Patient = new Patient();
  patients: Patient[] = new Array<Patient>();
  record: Record = new Record();
  priscriptions: Priscription[];
  product: Product = new Product(new Item(), new StockInfo());
  selectedProducts: Product[] = new Array<Product>();

  in = 'discharge';
  constructor(private dataService: DataService, private socket: SocketService ) {

   }

  ngOnInit() {
   this.getConsultees();
   this.socket.io.on('new patient', (patient: Patient) => {
      this.patients.push(patient);
  });
  }

  switchBtn(option: string) {
   this.in = option;
   console.log(this.in);
  }
  getConsultees() {
    this.dataService.getConsultees().subscribe((p: Patient[]) => {
      this.patients = p;
      console.log(this.patients);
    });
  }


  addPriscription() {
    // console.log(this.dosage);
    // this.record.medication.push(new Priscription(this.product, this.dosage));
    // this.dosage = new Dosage();
    // this.product = new Product();
  }
  removePriscription(i) {

    //  this.record.medication.splice(i);
  }
  getTotal() {
    //  let sum = 0;
    //  for (const item of this.record.medication) {
    //    sum = sum + item.price;
    //  }
    //  return sum;
  }
  saveRecord(record: Record) {
    // this.dataService.saveRecord(record).subscribe((newrecord) => {
    //   this.record = new Record('', '', '', 0, 0, 0, 0, 0, 0,'','',false, new Array<Priscription>(),'','','','',null);
    // });
  }
}
