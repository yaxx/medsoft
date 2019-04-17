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
  temPatients: Person[] = new Array<Person>();
  temProducts: Product[] = new Array<Product>();
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
  allocation = null;
  bedNum = null;
  curIndex = 0;
  curBed = null;
  url = '';
  sortBy = 'added';
  message = null;
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
    this.getPatients();
    this.uploader.onCompleteItem = (item: any, fileName: any, status: any, headers: any ) => {
      this.patients[this.curIndex].record.scans.unshift(new Scan(fileName, this.filesDesc))
      this.loading = !this.loading;
       this.dataService.updateRecord(this.patients[this.curIndex]).subscribe((newpatient: Person) => {
        this.loading = !this.loading;
        this.url = '';
      });
     };

    this.socket.io.on('Discharge', (patient: Person) => {
      const i = this.patients.findIndex(p => p._id === patient._id);
      if(patient.record.visits[0].dept.toLowerCase() === this.myDepartment ) {
         if(i < 0) {
         } else {
           this.patients.splice(i, 1);
         }
      } else {
         this.patients.splice(i, 1);
      }
  });

  this.socket.io.on('consulted', (patient: Person) => {
    const i = this.patients.findIndex(p => p._id === patient._id)
      if(patient.record.visits[0].dept.toLowerCase() === this.myDepartment && patient.record.visits[0].status ==='Admit') {
        this.patients.unshift(patient);
      } else if (patient.record.visits[0].dept.toLowerCase() === this.myDepartment && patient.record.visits[0].status ==='Discharged') {
         this.patients.splice(i, 1);
      }

  });

  }

 
  getDp(avatar: String) {
    return 'http://localhost:5000/api/dp/' + avatar;
  }
  
  getMyDp() {
    return this.getDp(this.cookies.get('d'))
   
  }
  getClient() {
    this.dataService.getClient().subscribe((res: any) => {
      this.client = res.client;
  });
  }
  refresh(){
     this.getClient();
     this.getPatients();
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
   searchPatient(name:string) {
   if(name!==''){
    this.patients = this.patients.filter((patient) => {
      const patern =  new RegExp('\^' + name
      , 'i');
      return patern.test(patient.info.personal.firstName);
      });
   } else {
     this.patients = this.dataService.getCachedPatients();
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

  getPatients() {
    this.loading = true;
    this.dataService.getPatients().subscribe((patients: Person[]) => {
      let myPatients;
      if(this.myDepartment) {
         myPatients = patients.filter(
         p => p.record.visits[0].dept.toLowerCase() === this.myDepartment && p.record.visits[0].status === 'Admit');
      } else {
       myPatients = patients.filter(p => p.record.visits[0].status === 'Admit');
      }
      if(myPatients.length) {
      myPatients.forEach(p => {
        p.card = {menu: false, view: 'front'}
      });
      this.patients = myPatients;
      this.dataService.setCachedPatients(myPatients);
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
  getBeds(i: number) {
    const dept = this.client.departments.filter((d) =>
    d.name === this.patients[i].record.visits[0].dept)[0];
     return  dept.beds.filter(bed => !bed.allocated);
  }
  changeBed(i: number) {
    this.patients[i].card.view = 'bed';
    this.curBed = this.patients[i].record.visits[0].bedNo;
    this.allocation = this.patients[i].record.visits[0].bedNo;
    this.hideMenu();
  }
  assignBed(i: number) {
    const index = this.client.departments.findIndex(d => d.name === this.patients[i].record.visits[0].dept);
    this.client.departments[index].beds.forEach(bed => {
      if(+this.curBed === bed.number)  {
        bed.allocated = false;
      } else if(+this.allocation === bed.number) {
        bed.allocated = true;
      }

    });
    this.dataService.updateBed(this.patients[i], this.client).subscribe((p: Person) => {
       this.patients[i].record.visits[0].bedNo = this.allocation;
        this.switchToFront(i);
   });
 }

  switchToFront(i: number) {
    this.patients[i].card.view = 'front';
  }
  switchToVitals(i: number){
    this.patients[i].card.view = 'vitals';
    this.curIndex = i
  }
  updateVitals(i: number) {
    if(this.vitals.tempreture) {
      this.patients[i].record.vitals.bp =
      this.patients[i].record.vitals.tempreture
      .filter(t => new Date(t.dateCreated).toLocaleDateString() !== new Date().toLocaleDateString())

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
    this.dataService.updateRecord(this.patients[this.curIndex]).subscribe((p: Person) => {

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
