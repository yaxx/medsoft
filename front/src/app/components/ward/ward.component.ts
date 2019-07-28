import { Component, OnInit } from '@angular/core';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {ActivatedRoute} from '@angular/router';
import {CookieService } from 'ngx-cookie-service';
import { Priscription, Scan, Vital, Medication, Note} from '../../models/record.model';
import { Person } from '../../models/person.model';
import { Product, Item} from '../../models/inventory.model';
import { Client} from '../../models/client.model';
import * as cloneDeep from 'lodash/cloneDeep';


const uri = 'http://localhost:5000/api/upload';
@Component({
  selector: 'app-ward',
  templateUrl: './ward.component.html',
  styleUrls: ['./ward.component.css']
})
export class WardComponent implements OnInit {
  patients: Person[] = [];
  clonedPatients: Person[] = [];
  patient: Person = new Person();
  clonePatient: Person = new Person();
  products: Product[] = [];
  client: Client = new Client();
  cloneClient: Client = new Client();
  product: Product = new Product();
  vitals: Vital = new Vital();
  priscription: Priscription = new Priscription();
  medication: Medication = new Medication();
  medications: any[] = [];
  temProducts: Product[] = [];
  item: Item = new Item();
  items: Item[] = new Array<Item>();
  file: File = null;
  filesDesc = null;
  note = new Note();
  input = '';
  view = 'bed';
  id = null;
  loading = false;
  selected = null;
  searchTerm = '';
  processing = false;
  curIndex = 0;
  sortBy = 'added';
  message = null;
  url = '';
  sortMenu = false;
  nowSorting = 'Date added';
  uploader: FileUploader = new FileUploader({url: uri});
  attachments: any = [];
  myDepartment = null;


  constructor(
      private dataService: DataService,
      private route: ActivatedRoute,
      private cookies: CookieService,
      private socket: SocketService ) { }
  ngOnInit() {
    this.myDepartment = this.route.snapshot.params['dept'];
    this.getClient();
    this.getPatients('Admit');
    this.uploader.onCompleteItem = (item: any, fileName: any, status: any, headers: any ) => {
      this.patients[this.curIndex].record.scans.unshift(new Scan(fileName, this.filesDesc));
      this.loading = !this.loading;
       this.dataService.updateRecord(this.patients[this.curIndex]).subscribe((newpatient: Person) => {
        this.loading = !this.loading;
        this.attachments = [];
      });
     };
    this.socket.io.on('Discharge', (patient: Person) => {
      const i = this.patients.findIndex(p => p._id === patient._id);
      if(patient.record.visits[0][0].dept.toLowerCase() === this.myDepartment ) {
         if(i < 0) {
         } else {
           this.patients.splice(i, 1);
         }
      } else {
         this.patients.splice(i, 1);
      }
  });

  this.socket.io.on('consulted', (patient: Person) => {
    const i = this.patients.findIndex(p => p._id === patient._id);
      if(patient.record.visits[0][0].dept.toLowerCase() === this.myDepartment && patient.record.visits[0][0].status === 'Admit') {
        this.patients.unshift(patient);
        this.clonedPatients.unshift(patient);
      } else if (patient.record.visits[0][0].dept.toLowerCase() === this.myDepartment && patient.record.visits[0][0].status === 'Discharged') {
         this.patients.splice(i, 1);
      }
  });

  }
  getDp(avatar: String) {
    return 'http://localhost:5000/api/dp/' + avatar;
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  getClient() {
    this.dataService.getClient().subscribe((res: any) => {
      this.client = res.client;
  });
  }
  refresh() {
    this.message = null;
     this.getClient();
     this.getPatients('Admit');
  }
  fileSelected(event) {
    if (event.target.files && event.target.files[0]) {
      this.file = <File>event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (e) => { // called once readAsDataURL is completed
        let ev = <any>e;
        this.url = ev.target.result;
      };
    }

  }
   searchPatient(name: string) {
   if(name! == '') {
    this.patients = this.patients.filter((patient) => {
      const patern =  new RegExp('\^' + name, 'i');
      return patern.test(patient.info.personal.firstName);
      });
   } else {
     this.patients = this.clonedPatients;
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
   showSortMenu() {
    this.sortMenu = true;
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
      // case 'status':
      //   this.patients.sort((m, n) => m.record.visits[m.record.visits.length-1].status.localeCompare(m.record.visits[n.record.visits.length-1].status.localeCompare()));
      //   this.nowSorting = 'Status';
      //   break;
        case 'age':
        this.patients.sort((m, n) => new Date(m.info.personal.dob).getFullYear() - new Date(n.info.personal.dob).getFullYear());
        this.nowSorting = 'Age';
        break;
      case 'date':
        this.patients.sort((m, n) => new Date(n.createdAt).getTime() - new Date(m.createdAt).getTime());
        this.nowSorting = 'Date added';
        break;
        default:
        break;
    }
  }

  getPatients(type) {
    this.loading = true;
    this.dataService.getPatients(type).subscribe((patients: Person[]) => {
      if(patients.length) {
        patients.forEach(p => {
          p.card = {menu: false, view: 'front'};
        });
        this.patients   = patients;
        this.clonedPatients  = patients;
        this.loading = false;
      } else {
        this.message = 'No Records So Far';
        this.loading = false;
      }
    },(e) => {
      this.message = 'Something went wrong';
      this.loading = false;
    });
  }
  getRooms() {
    return this.client.departments.find(dept => dept.name === this.patient.record.visits[0][0].dept).rooms;
  }
  getBeds() {
// tslint:disable-next-line: max-line-length
    return (this.patient.record.visits[0][0].wardNo) ? this.client.departments.find( dep => dep.name === this.patient.record.visits[0][0].dept).rooms[this.patient.record.visits[0][0].wardNo - 1].beds.filter(bed => !bed.allocated) : [];
  }
  changeBed(i: number) {
    this.patients[i].card.view = 'bed';
    this.patient = this.patients[i];
    this.clonePatient = cloneDeep(this.patient);
    this.hideMenu();
  }
  assignBed(i: number) {
    this.cloneClient = cloneDeep(this.client);
    const index = this.client.departments.findIndex(d => d.name === this.patient.record.visits[0][0].dept);
    if (this.patient.record.visits[0][0].bedNo) {
      this.client.departments[index].rooms[this.patient.record.visits[0][0].wardNo - 1].beds[this.patient.record.visits[0][0].bedNo - 1].allocated = false;
      this.client.departments[index].rooms[this.patient.record.visits[0][0].wardNo - 1].beds[this.patient.record.visits[0][0].bedNo - 1].allocated = true;
    } else {
      this.client.departments[index].rooms[this.patient.record.visits[0][0].wardNo - 1].beds[this.patient.record.visits[0][0].bedNo - 1].allocated = true;
    }
    this.dataService.updateBed(this.patient, this.client).subscribe((p: Person) => {
        this.switchToFront(i);
   });
 }

  switchToFront(i: number) {
    this.patients[i].card.view = 'front';
  }
  switchToVitals(i: number) {
    this.patients[i].card.view = 'vitals';
    this.curIndex = i;
  }
  updateVitals(i: number) {
    if(this.vitals.tempreture) {
      this.patients[i].record.vitals.bp =
      this.patients[i].record.vitals.tempreture
      .filter(t => new Date(t.dateCreated).toLocaleDateString() !== new Date().toLocaleDateString());
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
      .toLocaleDateString());
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

  selectDrug(i: number, j: number) {
    if (this.patients[i].record.medications[j].selected) {
      this.patients[i].record.medications[j].selected = false;
    } else {
      this.patients[i].record.medications[j].selected = true;
    }
  }
 updateTimeTaken(i: number) {
    this.patients[i].record.medications.forEach(group => {
      group.forEach(medic => {
        if (medic.selected) {
          medic.lastTaken = new Date();
          medic.selected = false;
        }
      });
    });
    this.dataService.updateRecord(this.patients[this.curIndex]).subscribe((p: Person) => {

    });
  }
  selectMedication(i: number, j: number) {
    if (this.patients[i].record.medications[j].paused) {
      this.patients[i].record.medications[j].paused = false;
    } else {
      this.patients[i].record.medications[j].paused = true;
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
