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
    this.info = this.route.snapshot.url[0].path || null;
    this.admin = this.route.snapshot.url[0].path || null;
    this.seg2 = this.route.snapshot.url[1].path  || null;
 
  }
 
}
