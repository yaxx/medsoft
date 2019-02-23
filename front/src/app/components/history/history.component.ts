import { Component, OnInit } from '@angular/core';
import { Person} from '../../models/data.model';
import {DataService} from '../../services/data.service';
import {ActivatedRoute} from '@angular/router';
import {Chart} from 'chart.js';


@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  patient: Person = new Person();
  bpChart=[];
  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.patient = this.dataService.getCachedPatient(this.route.snapshot.params['id']);
    this.bpChart = new Chart('bpChart', {
      type: 'bar',
        options: {
            maintainAspectRatio:false,
            layout:{
                padding:{
                    left:5,
                    right:20,
                    top:0,
                    bottom:0
    
                }
            },
          legend: {
            display: false,
          },
          scales: {
            xAxes: [{
              gridLines: {
                display: false,
                // color:whitesmoke
              },
              ticks: {
                fontSize: 11,
                fontColor: 'lightgrey'
              }
            }],
            yAxes: [{
              gridLines: {
                drawBorder: false,
              },
              ticks: {
                beginAtZero: true,
                fontSize: 11,
                fontColor: 'lightgrey',
                maxTicksLimit: 5,
                padding: 20,
              }
            }]
          },
          tooltips: {
            backgroundColor: '#bbf7f0'
          }
        },
        data: {
          labels: ['02FE', '07MA', '10MY', '15AU', '22AU', '30SE', '11OC','27OC','05NO','10DE'],
        datasets: [{
          data: [6, 10, 12, 18, 8, 7, 10, 4,7,2],
          tension: 0.0,
          borderColor: '#96f4f4',
          backgroundColor: '#96f4f4',
          pointBackgroundColor: ['white', 'white', 'whitesmoke', 'white', 'white', 'white', 'rgb(255,190,70)'],
          pointRadius: 4,
          borderWidth: 1
        }]
      }
    });
  }
  getDp(p: Person){
    return 'http://localhost:5000/api/dp/' + p.info.personal.dpUrl;
  }
  showDetails(e) {
  e.preventDefault();
  this.patient.record.notes[0].full = true;
}

// getPatient(): Patient {
//    return this.dataService.getCachedPatients(this.route.snapshot.params['id'])
// }
}

