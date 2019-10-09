import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
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
    private router: Router
) { }

  ngOnInit() {
    this.info = this.route.snapshot.url[0].path || null;
    this.admin = this.route.snapshot.url[0].path || null;
    this.seg2 = this.route.snapshot.url[0].path  || null;
 
  }
  isConsult() {
    return !this.router.url.includes('information') && !this.router.url.includes('pharmacy') && !this.router.url.includes('billing') && !this.router.url.includes('ward') && !this.router.url.includes('admin');
  }
  isAdmin() {
    return this.router.url.includes('admin');
  }
  isInfo() {
    return this.router.url.includes('information');
  }
  isWard() {
    return this.router.url.includes('ward');
  }
  isVisible() {
    return !this.router.url.includes('pharmacy') || !this.router.url.includes('billing'); 
  }
 
}
