import { Component, OnInit } from '@angular/core';
import {ActivatedRoute,Router} from '@angular/router';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
dept = null;
info = null;
admin = null;
seg2 = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    // this.dept = this.route.snapshot.params['dept'];
    this.info = this.route.snapshot.url[0].path ? this.route.snapshot.url[0].path : null;
    this.admin = this.route.snapshot.url[0].path ? this.route.snapshot.url[0].path : null;
    this.seg2 = this.route.snapshot.url[1].path ? this.route.snapshot.url[1].path : null;
 
  }
  // adminInfo(){
  // this.route.snapshot.url[0].path === 'admin'||'information';
  // }
  // admin(){
  //   return this.route.snapshot.url[0].path === 'admin';
  // }

 
}
