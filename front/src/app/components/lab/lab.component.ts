import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {SocketService} from '../../services/socket.service';
import {ActivatedRoute, Router} from '@angular/router';
import update from 'react-addons-update';
import {Person} from '../../models/person.model';
import {CookieService} from 'ngx-cookie-service';
import {Meta} from '../../models/inventory.model';
import {Report} from '../../models/record.model';
import * as cloneDeep from 'lodash/cloneDeep';
import { timeout } from 'q';
const uri = 'http://localhost:5000/api/upload';
// const uri = 'http://192.168.1.101:5000/api/upload';
@Component({
  selector: 'app-lab',
  templateUrl: './lab.component.html',
  styleUrls: ['./lab.component.css']
})
export class LabComponent implements OnInit {
  patients: Person[] = [];
  clonedPatients: Person[] = [];
  patient: Person = new Person();
  url = null;
  file: File = null;
  inlineProducts = [];
  uploader: FileUploader = new FileUploader({url: uri});
  images: any = [];
  allFiles: any = [];
  report = new Report();
  formData =  new FormData();
  transMsg = null;
  errMsg = null;
  sucssMsg = null;
  input = '';
  searchTerm = '';
  cardView = {
    orders: true,
    report: false,
    reversing: false
  };
  testIndex = {
    i: 0,
    j: 0
  };
  sortBy = 'added';
  sortMenu = false;
  nowSorting = 'Date added';
  view = 'default';
  count = 0;
  id = '';
  selected = null;
  curIndex = 0;
  loading = false;
  processing = false;
  message = null;
  constructor(private dataService: DataService,
    private cookies: CookieService,
    private router: Router,
    private socket: SocketService) { }

  ngOnInit() {
    this.getPatients();
  }
  getPatients(type?: string) {
    this.loading = true;
    this.dataService.getPatients(type).subscribe((patients: Person[]) => {
      if(patients.length) {
        patients.forEach(p => {
          p.card = {menu: false, view: 'front'};
        });
        this.patients =  patients;
        this.clonedPatients  = patients;
        this.loading = false;
        this.message = null;
      } else {
        this.message = 'No Records So Far';
        this.loading = false;
      }
    }, (e) => {
      this.message = 'Something went wrong';
      this.loading = false;
    });
  }
  clear() {
    this.sucssMsg = null;
    this.errMsg = null;
  }
  getDp(avatar: String) {
    return 'http://localhost:5000/api/dp/' + avatar;
    // return 'http://192.168.1.101/api/dp/' + avatar;
  }
  selectItem(i: number, j: number) {
    this.testIndex = {i: i, j: j};
      this.patient.record.tests.forEach(test => {
      test.forEach(t => {
        t.meta.selected = false;
      });
    });
    this.patient.record.tests[i][j].meta.selected = !this.patient.record.tests[i][j].meta.selected;
   }
  itemSelected() {
    return this.patient.record.tests.some(test => test.some(t => t.meta.selected));
  }
   openRequests(i) {
     this.patient = cloneDeep(this.patients[i]);
     this.switchViews('orders');
     this.curIndex = i;
   }
   switchToReport() {
     this.cardView.report = true;
   }
   switchViews(view) {
    switch(view) {
      case 'orders':
      this.cardView.orders = true;
      this.cardView.report = false;
      this.cardView.reversing = false;
      break;
      case 'report':
      this.cardView.orders = false;
      this.cardView.report = true;
      this.cardView.reversing = false;
      break;
      case 'reversing':
      this.cardView.orders = false;
      this.cardView.report = false;
      this.cardView.reversing = true;
      break;
      default:
      break;
    }
  }
  fileSelected(event: any) {
    const files  = event.target.files;
    if(files) {
      for (const img of files) {
        this.formData.append('files', img);
      }
      for(let i = 0; i < files.length; i++) {
        const image = {
          name: '',
          type: '',
          size : '',
          url : ''
        };
        this.allFiles.push(files[i]);
        image.name = files[i].name;
        image.type = files[i].type;
        image.size = files[i].size;
        image.url = files[i].url;
        const reader = new FileReader();
        reader.onload = (e) => {
          const ev = <any>e; // called once readAsDataURL is completed
          image.url = ev.target.result;
          this.images.push(image);
        };
        reader.readAsDataURL(files[i]);
      }
      event.srcElement.value  = null;
    }
  }
  sendReport(res) {
    this.patient.record.tests[this.testIndex.i][this.testIndex.j].report = {
      ...this.report,
      meta: new Meta(this.cookies.get('i'))
    };
    this.patient.record.tests[this.testIndex.i][this.testIndex.j].treated = true;
    for (const file of res) {
      this.patient.record.tests[this.testIndex.i][this.testIndex.j].report.attachments.push(file.filename);
    }
    this.dataService.updateRecord(this.patient).subscribe((patient: Person) => {
      this.processing = false;
      this.patients[this.curIndex] = patient;
      this.sucssMsg = 'Post Successfull';
    }, (e) => {
      this.processing = false;
      this.errMsg = 'Unable to post report';
    });
  }
  postReport() {
    this.processing = true;
    this.dataService.uploadScans(this.formData).subscribe((res) => {
     this.sendReport(res);
    }, (e) => {
      this.processing = false;
      this.errMsg = 'Unable to post report';
    });
  }
  refresh() {
    this.message = null;
    this.getPatients();
  }
}
