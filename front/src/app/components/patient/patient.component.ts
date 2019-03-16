import { Component, OnInit } from '@angular/core';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {ActivatedRoute} from '@angular/router';
import {Item, StockInfo, Product} from '../../models/inventory.model';
import {Client} from '../../models/client.model';
import { Person} from '../../models/person.model';
import { Priscription, Medication, Visit, Note} from '../../models/record.model';

const uri = 'http://localhost:5000/api/upload';
@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {
  patients: Person[] = new Array<Person>();
  patient: Person = new Person();
  products: Product[] = new Array<Product>();
  medications: any[] = new Array<any>(new Array<Medication>());
  client: Client = new Client();
  product: Product = new Product();
  priscription: Priscription = new Priscription();
  medication: Medication = new Medication();
  temProducts: Product[] = new Array<Product>();
  item: Item = new Item();
  items: Item[] = new Array<Item>();
  temItems: Item[] = new Array<Item>();
  searchedItems: Item[] = new Array<Item>();
  edited: Medication[] = new Array<Medication>();
  tempMedications: Medication[] = new Array<Medication>();
  uploader: FileUploader = new FileUploader({url: uri});
  temPatients: Person[] = new Array<Person>();
  file: File = null;
  note = new Note();
  input = '';
  view = 'bed';
  id = null;
  medicView = false;
  sortBy = 'added';
  sortMenu = false;
  nowSorting = 'Date added';
  // view = 'info';
  searchTerm = '';
  selected = null;
  bedNum = null;
  loading = false;
  curIndex = 0;
  url = '';
  attachments: any = [];
  myDepartment = null;

  constructor(private dataService: DataService,
     private socket: SocketService,
     private route: ActivatedRoute,
      ) { }
  ngOnInit() {
    this.getPatients();
    this.getClient();
    // this.getProducts();
    this.getItems();
    this.myDepartment = this.route.snapshot.params['dept'];
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('id', this.patients[this.curIndex]._id);
     };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any ) => {
      this.attachments.push(JSON.parse(response));
    };

  }
  getItems() {
    this.dataService.getItems().subscribe((items: Item[]) => {
      this.items = items;
      console.log(items);
    });
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
      reader.onload = (e) => {
        let ev = <any>e.target;
        // called once readAsDataURL is completed
        this.url = ev.target.result;

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
  pullMedication(i: number) {
    this.curIndex = i;
    this.medications = this.patients[i].record.medications;
   }
  pullNote(i: number) {
    this.curIndex = i;
   }
   getPatients() {
    this.dataService.getPatients().subscribe((patients: Person[]) => {
      let myPatients;
      if(this.myDepartment) {
         myPatients = patients.filter(
         p => p.record.visits[0].dept === this.myDepartment && p.record.visits[0].status === 'addmited');
      } else {
       myPatients = patients.filter(p => p.record.visits[0].status === 'addmited');
     
      }
      myPatients.forEach(p => {
        p.card = {menu: false, view: 'front'}

      });
      this.patients = myPatients;
      this.dataService.setCachedPatients(myPatients);
    });
  }

  switchToNewMedic() {
    this.medicView = !this.medicView;
  }
  showSortMenu() {
    this.sortMenu = true;
  }
  searchItems(i: string) {
    if (i === '') {
      this.temItems = new Array<Item>();
    } else {
        this.temItems = this.items.filter((item) => {
        const patern =  new RegExp('\^' + i , 'i');
        return patern.test(item.name);
      });
  }

  }
  // getLink(dept: string): String {
  //   return `/department/${this.myDepartment}/consultation`;
  // }
  swichtToBack(i) {
    this.tempMedications = new Array<Medication>();
    this.medications = this.patients[i].record.medications ;
    this.patients[i].card.view = 'back';
  }
  switchToFront(i) {
    this.patients[i].card = {menu: false, view: 'front'};
  }
  composeMedication() {
    if (this.medications[0].length) {
      if (new Date(this.medications[0][0].dateAdded)
      .toLocaleDateString() === new Date()
      .toLocaleDateString()) {
        for(let m of this.tempMedications) {
          this.medications[0].unshift(m);
        }
       } else {
        this.medications.unshift(this.tempMedications);
       }

  } else {

    this.medications[0] = this.tempMedications;

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
     this.patients = this.temPatients;
   }


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
      //   this.patients.sort((m, n) => m.record.visits[m.record.visits.length-1].status.localeCompare(m.record.visits[n.record.visits.length-1].status.localeCompare));
      //   this.nowSorting = 'Status';
      //   break;
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

  saveMedication(i) {
    this.composeMedication();
    this.patients[i].record.medications = this.medications;
    this.loading = true;
    this.dataService.updateRecord(this.patients[i]).subscribe((p: Person) => {
      p.card = {menu: false, view: 'front'};
      this.patients[i] = p;
      this.medications = new Array<any>(new Array<Medication>());
      this.tempMedications = [];
      this.loading = false;
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
  addMedication() {
    this.tempMedications.push(new Medication(this.product, this.priscription));
    this.product = new Product();
    this.priscription = new Priscription();
    this.input = null;
  }
  selectItem(i: number, j: number, k: number) {
    this.patients[i].record.medications[j][k].selected =
    this.patients[i].record.medications[j][k].selected ? false : true;
   }
   playMedication(i: number, j: number) {
    this.patients[this.curIndex].record.medications[i][j].paused = false;
    this.dataService.updateMedication(this.patients[this.curIndex]._id, this.patients[this.curIndex].record.medications).subscribe((p: Person) => {
      p.card = {menu: false, view: 'front'};
      this.patients[i] = p;
    });
   }
   pauseMedication(i: number, j: number) {
    this.patients[this.curIndex].record.medications[i][j].paused = true;
    this.patients[this.curIndex].record.medications[i][j].pausedOn = new Date();
    this.dataService.updateMedication(this.patients[i]._id, this.patients[i].record.medications).subscribe((p: Person) => {
      p.card = {menu: false, view: 'front'};
      this.patients[i] = p;

    });
   }


  saveNote() {
    this.patients[this.curIndex].record.notes.unshift(this.note)
    this.dataService.updateRecord(this.patients[this.curIndex]).subscribe((p: Person) => {
          p.card = {menu: false, view: 'front'};
          this.loading = false;
          this.note = new Note();
    });

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

// getProducts() {
//   this.dataService.getProducts().subscribe((p: any) => {
//     this.products = p.inventory;

//   });
// }

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
selectProduct(product: Product) {
this.input = product.item.name + ' ' + product.item.mesure + product.item.unit;
this.temProducts = new Array<Product>();
this.medication.product = product;
}

updateMedication() {
  this.dataService.updateMedication( this.patients[this.selected]._id, this.medication).subscribe((medications: Medication[]) => {
   this.patients[this.selected].record.medications = medications;
   this.medication = new Medication(new Product(), new Priscription());
  });
}


}
