import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {Main, Staff, Department} from '../../models/data.model';
@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  main: Main = new Main();


  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit() {
  }
creatClient() {
  this.dataService.createClient(this.main).subscribe((newmain) => {
    this.main = new Main();
    this.router.navigate(['/settings']);
  });
}
}
