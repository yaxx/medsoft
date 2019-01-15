import { Component, OnInit } from '@angular/core';

import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import { Person, Client, Item, StockInfo,
  Product, Priscription, Medication, Visit, Note
} from '../../models/data.model';
@Component({
  selector: 'app-ward',
  templateUrl: './ward.component.html',
  styleUrls: ['./ward.component.css']
})
export class WardComponent implements OnInit {
  patients: Person[] = new Array<Person>();
  patient: Person = new Person();
  products: Product[] = new Array<Product>();
  client: Client = new Client();
  product: Product = new Product();
  priscription: Priscription = new Priscription();
  medication: Medication = new Medication();
  temProducts: Product[] = new Array<Product>();
  item: Item = new Item();
  items: Item[] = new Array<Item>();
  lastVisit: Visit = new Visit();
  file: File = null;
  note = new Note();
  input = '';
  view = 'bed';
  id = null;
  selected = null;
  bedNum = null;
  curIndex = 0;
  url = '';


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
  fileSelected(event) {
    if (event.target.files && event.target.files[0]) {
      this.file = <File>event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (e) => { // called once readAsDataURL is completed
        this.url = e.target.result;
      }
    }

  }
  uploadFile() {
    const data = new FormData();
    data.append('image', this.file);
    console.log(data.get('image'));
    // this.dataService.upload(this.file,
    //    this.patients[this.curIndex]._id).subscribe(res => {
    // });

  }
  selectPatient(i: number) {
    this.curIndex = i;
   }
  getInPatients() {
    this.dataService.getInPatients().subscribe((patients: Person[]) => {
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

    const name =  this.patients[i].record.visits.reverse()[0].dept
    this.client.departments.forEach(department=>{
      if(department.name !== name){
        return

      }
      else{
        department.beds[this.patients[i].record.visits[0].bedNo] = false;
      }
    })
    this.patients[i].record.visits[0].bedNo = null;
  }
  assignBed(i) {
    const n= this.patients[i].record.visits.reverse()[0].dept
   const name = this.client.departments.filter((d) =>
     d.name === n);
     var dept = this.client.departments;
     dept.forEach((dep,i)=>{
       if(dep.name !== n){
        return
       }else{
        dep.beds[parseInt(this.bedNum)] = true;
       }
     })
     var patient = this.patients[i]
     patient.record.visits.reverse()[0].bedNo = parseInt(this.bedNum)
     patient.record.visits.reverse();
     this.dataService.updateBed(patient, dept, this.client._id).subscribe((patient: Person) => {
      this.patients[i] = patient;
      this.bedNum = null;

    //  this.client.departments.filter((d) =>
    //  d.name === this.patients[i].record.visits.reverse()[0].dept)[0].beds[this.bedNum]=true;
    });
  }
  updateNote() {
   this.dataService.updateNote(this.patients[this.curIndex]._id, this.note).subscribe((patient: Person) => {
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
