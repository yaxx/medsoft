import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {Client} from '../../models/data.model';
@Component({
  selector: 'app-singup',
  templateUrl: './singup.component.html',
  styleUrls: ['./singup.component.css']
})
export class SingupComponent implements OnInit {
  client: Client = new Client();
  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit() {
  }
  creatClient() {
    this.dataService.createClient(this.client).subscribe((client) => {
      this.client = new Client();
      this.router.navigate(['/settings']);
    });
  }
}
