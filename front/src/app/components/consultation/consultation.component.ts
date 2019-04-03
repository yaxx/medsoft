import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {ActivatedRoute} from '@angular/router';
import {Person} from '../../models/person.model';
import {Client, Department} from '../../models/client.model';
import { Item, StockInfo,Product} from '../../models/inventory.model';
import { Record, Session, Appointment,
         Priscription, Medication, Visit, Note} from '../../models/record.model';
const uri = 'http://localhost:5000/api/upload';

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.css']
})

export class ConsultationComponent implements OnInit {
  patient: Person = new Person();
  patients: Person[] = new Array<Person>();
  temPatients: Person[] = new Array<Person>();
  record: Record = new Record();
  client: Client = new Client();
  department: Department = new Department();
  session: Session = new Session();
  curIndex = 0;
  searchTerm = '';
  medicView = false;
  priscription: Priscription = new Priscription();
  medication: Medication =  new Medication();
  medications: any[] = [];
  tempMedications: Medication[] = new Array<Medication>();
  item: Item = new Item();
  items: Item[] = new Array<Item>();
  temItems: Item[] = new Array<Item>();
  product: Product = new Product(new Item(), new StockInfo());
  products: Product[] = new Array<Product>();
  selectedProducts: Product[] = new Array<Product>();
  appointment: Appointment = new Appointment();
  note = new Note();
  input = '';

  in = 'discharge';
  loading  = false;
  fowarded = false;
  fowardTo = null;
  sortBy = 'added';
  sortMenu = false;
  nowSorting = 'Date added';
  myDepartment = null;
  url = '';
  file: File = null;
  uploader: FileUploader = new FileUploader({url: uri});

  constructor(private dataService: DataService,
     private route: ActivatedRoute, private socket: SocketService ) {

   }

  ngOnInit() {
   this.getConsultees();
   this.getItems();
   this.getClient();
   this.myDepartment = this.route.snapshot.params['dept'];
    this.socket.io.on('enroled', (patient: Person) => {
  
      if(patient.record.visits[0].dept.toLowerCase() === this.myDepartment || this.route.snapshot.params['admin']) {
        patient.card = {view:'front',menu:false}
        this.patients.unshift(patient);
      } else {

      }
  });
  this.socket.io.on('consulted', (patient: Person) => {
    const i = this.patients.findIndex(p => p._id === patient._id);
      if(this.myDepartment) {
         if(i < 0) {
           this.patients.unshift(patient);
         } else {
           this.patients.splice(i, 1);
         }
      } else if (patient.record.visits[0].status ==='queued') {
        this.patients[i] = patient;
      } else {
        this.patients.splice(i, 1);
      }

  });

  this.socket.io.on('Discharge', (patient: Person) => {
    console.log(patient);
    const i = this.patients.findIndex(p=>p._id === patient._id)
      if(patient.record.visits[0].dept.toLowerCase() === this.myDepartment ) {
         if(i<0){

         } else {
           this.patients.splice(i, 1);
         }
      } else {
         this.patients.splice(i, 1);
      }

  });



  this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any ) => {
    this.patient.info.personal.avatar = response;
    this.patient.record.visits.unshift(new Visit());
     this.dataService.addPerson(this.patient).subscribe((newpatient: Person) => {
       newpatient.card = {menu: false, view: 'front'};
       this.patients.unshift(newpatient);
       this.socket.io.emit('consulted', newpatient);
       this.patient = new Person();
       this.url = '';
       this.loading = false;
    });
   };

  }
addPatient() {
    this.loading = true;
    this.uploader.uploadAll();
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
      reader.onload = (e) => {
        let evnt = <any>e;
        this.url = evnt.target.result;
      };
    }

  }

  conclude(conclution: string) {
    this.fowarded = conclution === 'Foward' ? true : false;
  }
  getDp(p: Person) {
    return 'http://localhost:5000/api/dp/' + p.info.personal.avatar;
  }
  fetchDept() {
    if (this.fowarded) {
      return this.client.departments
      .filter((dept) => (dept.hasWard) && (dept.name.toLowerCase() !== this.patients[this.curIndex].record.visits[0].dept));
    } else {
      return [];
    }

  }
  setAppointment(){
    this.patients[this.curIndex].record.appointments.push(this.appointment);
    this.patients[this.curIndex].record.visits[this.patients[this.curIndex].record.visits.length-1].status = 'appointment'
    this.loading = true;
    this.dataService.updateRecord(this.patients[this.curIndex]).subscribe(patient=>{
      this.loading = false;
      setTimeout(() => {
            this.patients[this.curIndex].card = {menu: false, view: 'front'};
      }, 3000);
      setTimeout(() => {
          this.patients.splice(this.curIndex , 1);
      }, 3000);

    })
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
  switchToNewMedic(){
    this.medicView = !this.medicView;
  }
  switchToAp(i: number){
    this.patients[i].card.view = 'ap';
    this.curIndex = i
  }
  switchToFront(i: number) {
    this.patients[i].card.view = 'front';
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
        this.patients.sort((m, n) => new Date(n.createdAt).getTime() - new Date(m.createdAt).getTime());
        this.nowSorting = 'Date added';
        break;
        default:
        break;
    }
  }

   saveMedication(i) {
    this.composeMedication();
    this.dataService.updateMedication(this.patients[i]._id, this.medications).subscribe((p: Person) => {
      p.card = {menu: false, view: 'front'};
      this.patients[i] = p;
      this.medications = new Array<any>(new Array<Medication>());
    });
  }
  searchPatient(name: string) {
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
  showSortMenu(){
    this.sortMenu = true;
  }
  // getProducts() {
  //   this.dataService.getProducts().subscribe((p: any) => {
  //     this.products = p.inventory;

  //   });
  // }
  getItems() {
    this.dataService.getItems().subscribe((items: Item[]) => {
      this.items = items;
    });
  }
  selectItem(i: Item) {
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
saveNote() {
  this.loading = true;
  this.patients[this.curIndex].record.notes.unshift(this.note)
    this.dataService.updateRecord(this.patients[this.curIndex]).subscribe((p: Person) => {
          p.card = {menu: false, view: 'front'};
          this.loading = false;
          this.note = new Note();
    });

  }

switchBtn(option: string) {
   this.in = option;

}

getConsultees() {
  this.dataService.getPatients().subscribe((patients: Person[]) => {
    let myPatients;
    if(this.myDepartment){
    myPatients = patients.filter(p => p.record.visits[0].dept.toLowerCase() === this.myDepartment && p.record.visits[0].status === 'queued')
    } else {
      myPatients = patients.filter(p => p.record.visits[0].status === 'queued')
    }
    myPatients.forEach(p => {
      p.card = {menu: false, view: 'front'};
    });

     this.patients = myPatients;
     this.temPatients = myPatients;
     this.dataService.setCachedPatients(patients);
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
  selectPatient(i: number) {
   this.curIndex = i;
   this.patient = this.patients[i];
    this.medications = this.patient.record.medications[0]
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

  composeMedication() {
    if (this.medications.length) {
      this.medications.concat(this.tempMedications);
      // if (new Date(this.medications[0][0].priscription.priscribedOn)
      // .toLocaleDateString() === new Date()
      // .toLocaleDateString()) {
      //   for(let m of this.tempMedications) {
      //     this.medications[0].push(m)
      //   }
      //  } else {
      //   this.medications.push(this.tempMedications);
      //  }

  } else {
    console.log(this.tempMedications)
    this.medications = [this.tempMedications];
    console.log(this.medications)
  }

  }


  submitRecord() {
    this.composeMedication();
      this.patient.record.medications = this.medications;
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
     if (this.fowardTo) {
      this.patient.record.visits[0].dept = this.fowardTo;
      this.patient.record.visits[0].status  = 'queued';
    } else {
      this.patient.record.visits[0].status  = this.session.visits.status;
    }
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

    this.dataService.updateRecord(this.patients[this.curIndex]).subscribe((patient: Person) => {
      this.socket.io.emit('consulted', this.patients[this.curIndex])
      this.patients.splice(this.curIndex, 1);
      this.fowardTo = null;
      this.session = new Session();
      this.tempMedications = [];

    });
  }
}
