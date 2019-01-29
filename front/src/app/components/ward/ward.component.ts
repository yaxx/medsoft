import { Component, OnInit } from '@angular/core';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import { Person, Client, Item, StockInfo,
  Product, Priscription, Medication, Visit, Note
} from '../../models/data.model';
const uri = 'http://localhost:5000/api/upload';
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
  uploader: FileUploader = new FileUploader({url: uri});
  attachments: any = [];


  constructor(private dataService: DataService, private socket: SocketService ) { }
  ngOnInit() {
    this.getInPatients();
    this.getClient();

    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('id', this.patients[this.curIndex]._id);

     };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any ) => {
      this.attachments.push(JSON.parse(response));
    };
  }
  getDp(p: Person) {
    return 'http://localhost:5000/api/dp/' + p.info.personal.dpUrl;
  }
  getClient() {
    this.dataService.getClient().subscribe((client: any) => {
      this.client = client.client;
  });
  }
  fileSelected(event) {
    if (event.target.files && event.target.files[0]) {
      this.file = <File>event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (e) => { // called once readAsDataURL is completed
        this.url = e.target.result;
        console.log(e.target);
      };
    }

  }
  medidcationsSelected(i: number) {
    return this.patients[i].record.medications.some(med => med.some(m => m.selected));
  }
  uploadFile() {
    const data: FormData = new FormData();
    data.append('file', this.file);

    this.dataService.upload(this.file,
       this.patients[this.curIndex]._id).subscribe(res => {
    });

  }
  selectPatient(i: number) {
    this.curIndex = i;
   }
   showMenu(i: number) {
     this.hideMenu();
     this.patients[i].card.menu = true;
   }
   hideMenu() {
     this.patients.forEach(p => {
       p.card.menu =  false;
     });
   }
  getInPatients() {
    this.dataService.getInPatients().subscribe((patients: Person[]) => {
      patients.forEach(p => {
        if (p.record.visits[p.record.visits.length - 1].bedNo === null) {
          p.card = {menu: false, view: 'back'};
        } else {
          p.card = {menu: false, view: 'front'};
        }
      });
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
    this.patients[i].card.view = 'back';
    this.hideMenu();
    const name =  this.patients[i].record.visits.reverse()[0].dept;
    this.client.departments.forEach(department => {
      if (department.name !== name) {
        return;

      }  else {
        department.beds[this.patients[i].record.visits[0].bedNo] = false;
      }

    });
  }
  swichtToFront(i) {
    this.patients[i].card.view = 'front';
  }

  assignBed(i) {
    const n = this.patients[i].record.visits.reverse()[0].dept;
    const name = this.client.departments.filter((d) =>
     d.name === n);
     const dept = this.client.departments;
     dept.forEach((dep, i) => {
       if (dep.name !== n) {
        return;
       } else {
        // tslint:disable-next-line:radix
        dep.beds[parseInt(this.bedNum)] = true;
       }
     });
     const patient = this.patients[i];
     // tslint:disable-next-line:radix
     patient.record.visits[ patient.record.visits.length - 1].bedNo = parseInt(this.bedNum);
     patient.record.visits.reverse();
     this.dataService.updateBed(patient, dept, this.client._id).subscribe((p: Person) => {
      p.card = {menu: false, view: 'front'};
      this.patients[i] = p;
    });
  }
  updateNote() {
   this.dataService.updateNote(this.patients[this.curIndex]._id, this.note).subscribe((patient: Person) => {
    patient.card = {menu: false, view: 'front'};
      this.patients[this.curIndex] = patient;
   });

  }
  selectItem(i: number, j: number, k: number) {
    this.patients[i].record.medications[j][k].selected =
    this.patients[i].record.medications[j][k].selected ? false : true;

   }

  selectDrug(p: number, m: number) {
    if (this.patients[p].record.medications[m].selected) {
      this.patients[p].record.medications[m].selected = false;
    } else {
      this.patients[p].record.medications[m].selected = true;
    }
  }

  updateTimeTaken(i: number) {
    this.patients[i].record.medications.forEach(group => {
      group.forEach(medic => {
        if (medic.selected) {
          medic.lastTaken = new Date();
          medic.selected = false;
        } else {

        }
      });
    });
    this.dataService.updateMedication(this.patients[i]._id, this.patients[i].record.medications).subscribe((p: Person) => {
      p.card = {menu: false, view: 'front'};
      this.patients[i] = p;
    });
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

// updateMedication() {
//   this.dataService.updateMedication(this.medication).subscribe((medications: Medication[]) => {
//     console.log(this.selected);
//     console.log(medications);
//    this.patients[this.selected].record.medications = medications;
//    this.medication = new Medication(new Product(), new Priscription());
//   });
// }



}
