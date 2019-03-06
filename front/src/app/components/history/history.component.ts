import { Component, OnInit } from '@angular/core';
import { Person} from '../../models/data.model';
import {DataService} from '../../services/data.service';
import {ActivatedRoute} from '@angular/router';
import {Chart} from 'chart.js';
import {saveAs} from 'file-saver';


@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  patient: Person = new Person();
  bpChart = [];
  chartData = [];
  chartLabels = new Array<String>(10);
  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit() {
    let day = null;
    let months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
    this.patient = this.dataService.getCachedPatient(this.route.snapshot.params['id']);
    this.patient.record.vitals.bp.forEach((bp,i) => {

      this.chartData.push(bp.value)
      this.chartLabels[i] = new Date(bp.dateCreated).getDate().toString()+months[new Date(bp.dateCreated).getMonth()];
    });
    this.bpChart = new Chart('bpChart', {
      type: 'bar',
        options: {
            maintainAspectRatio: false,
            layout:{
                padding: {
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
                color:'white'
              },
              ticks: {
                fontSize: 10,
                fontColor: 'lightgrey'
              }
            }],
            yAxes: [{
              gridLines: {
                drawBorder: false,
                color:'whitesmoke'
              },
              ticks: {
                beginAtZero: false,
                fontSize: 10,
                fontColor: 'lightgrey',
                maxTicksLimit: 20,
                padding: 10,
                suggestedMin: 60,
                suggestedMax: 140
              }
            }]
          },
          tooltips: {
            backgroundColor: '#bbf7f0'
          }
        },
        data: {
          labels: this.chartLabels,
        datasets: [{
          data: this.chartData,
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
  getImage(fileName: String){
    return 'http://localhost:5000/api/dp/' + fileName;
  }
  downloadImage(file: string) {
    this.dataService.download(file).subscribe(
      res =>  saveAs(res, file)
    );
  }
  
  showDetails(e: Event, i: string) {
  e.preventDefault();
  this.patient.record.notes[i].full = true;
}

// getPatient(): Patient {
//    return this.dataService.getCachedPatients(this.route.snapshot.params['id'])
// }
}

