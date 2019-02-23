import { Component, OnInit } from '@angular/core';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import { Person, Client, Item,
  Product, Priscription, Vital, Medication, Note
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
  vitals: Vital = new Vital();
  priscription: Priscription = new Priscription();
  medication: Medication = new Medication();
  temProducts: Product[] = new Array<Product>();
  item: Item = new Item();
  items: Item[] = new Array<Item>();
  file: File = null;
  note = new Note();
  input = '';
  view = 'bed';
  id = null;
  loading = false;
  selected = null;
  bedNum = null;
  curIndex = 0;
  url = '';
  sortBy = 'added';
  sortMenu = false;
  nowSorting = 'Date added';
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
  medicationSelected() {
    return this.patients[this.curIndex].record.medications.some(med => med.some(m => m.selected));
  }
  uploadFile() {
    const data: FormData = new FormData();
    data.append('file', this.file);

    this.dataService.upload(this.file,
       this.patients[this.curIndex]._id).subscribe(res => {
    });

  }
  selectPatient(i: number) {
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
   sortPatients(sortOption: string) {
    this.sortMenu = false;
    switch (sortOption) {
      case 'name':
        this.patients.sort((m: Person, n: Person) => m.info.personal.firstName.localeCompare(n.info.personal.firstName));
        this.nowSorting = 'A-Z';
        break;
      case 'sex':
        this.patients.sort((m: Person, n: Person) => n.info.personal.gender.localeCompare(m.info.personal.gender));
        this.nowSorting = 'Gender';
        break;
      case 'status':
        this.patients.sort((m, n) => m.record.visits[m.record.visits.length-1].status.localeCompare(m.record.visits[n.record.visits.length-1].status.localeCompare()));
        this.nowSorting = 'Status';
        break;
        case 'age':
        this.patients.sort((m, n) => new Date(m.info.personal.dob).getFullYear() - new Date(n.info.personal.dob).getFullYear());

        this.nowSorting = 'Age';
        break;
      case 'date':
        this.patients.sort((m, n) => new Date(n.dateCreated).getTime() - new Date(m.dateCreated).getTime());
        this.nowSorting = 'Date added';
        break;

        default:
        break;
    }
  }

  getInPatients() {
    this.dataService.getInPatients().subscribe((patients: Person[]) => {
      patients.forEach(p => {
        if (p.record.visits[p.record.visits.length - 1].bedNo) {
          p.card = {menu: false, view: 'front'};
        } else {
          p.card = {menu: false, view: 'bed'};
        }
      });
      this.patients = patients;
      this.patient = patients[0]; 
    });
  }
  getBeds(i: number) {
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
  changeBed(i: number) {
    this.patients[i].card.view = 'bed';
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
  switchToFront(i: number) {
    this.patients[i].card.view = 'front';
  }
  switchToVitals(i: number){
    this.patients[i].card.view = 'vitals';
  }
  updateVitals(i: number) {

    if(this.vitals.tempreture) {
      this.patients[i].record.vitals.bp = 
      this.patients[i].record.vitals.tempreture.filter(t => new Date(t.dateCreated).toLocaleDateString() !== new Date()
      .toLocaleDateString())
      this.patients[i].record.vitals.tempreture.unshift(this.vitals.tempreture);
    } else {

    }
    if(this.vitals.bp) {
      this.patients[i].record.vitals.bp =
      this.patients[i].record.vitals.bp
      .filter(b => new Date(b.dateCreated).toLocaleDateString() !== new Date()
      .toLocaleDateString())
      this.patients[i].record.vitals.bp.unshift(this.vitals.bp);
    } else {

    }
    if(this.vitals.pulse.value) {
      this.patients[i].record.vitals.pulse =
      this.patients[i].record.vitals.pulse
      .filter(p => new Date(p.dateCreated).toLocaleDateString() !== new Date()
      .toLocaleDateString())
      this.patients[i].record.vitals.pulse.unshift(this.vitals.pulse);
    } else {

    }
    if(this.vitals.resp.value) {
      this.patients[i].record.vitals.resp =
      this.patients[i].record.vitals.resp
      .filter(r => new Date(r.dateCreated).toLocaleDateString() !== new Date()
      .toLocaleDateString())
      this.patients[i].record.vitals.resp.unshift(this.vitals.resp);
    } else {

    }
    if(this.vitals.height.value) {
      this.patients[i].record.vitals.height = 
      this.patients[i].record.vitals.height.filter(h => new Date(h.dateCreated).toLocaleDateString() !== new Date()
      .toLocaleDateString())
      this.patients[i].record.vitals.height.unshift(this.vitals.height);
    } else {

    }
    if(this.vitals.weight.value) {
      this.patients[i].record.vitals.weight = 
      this.patients[i].record.vitals.weight.filter(w => new Date(w.dateCreated).toLocaleDateString() !== new Date()
      .toLocaleDateString());
      this.patients[i].record.vitals.weight.unshift(this.vitals.weight);
    } else {

    }

    this.dataService.updateRecord(this.patients[i]).subscribe((p: Person) => {
      p.card = {menu: false, view: 'front'};
      this.patients[i] = p;
      this.loading = false;
      this.vitals = new Vital();
    });
  }
  assignBed(i: number) {
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
  selectItem(i: number, j: number) {
    this.patients[this.curIndex].record.medications[i][j].selected =
    this.patients[this.curIndex].record.medications[i][j].selected ? false : true;

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
