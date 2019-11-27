import { Component, OnInit } from '@angular/core';
import {Chart} from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  bpChart = [];
  topDrugs = [];
  iSource = [];
  inFlux = [];
  chartData = [15000, 85000, 60000, 75000, 35000, 20000, 10000];
  constructor() { }

  ngOnInit() {
    this.bpChart = new Chart('bpChart', {
      type: 'bar',
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 5,
                    right: 20,
                    top: 0,
                    bottom: 0
                }
            },
          legend: {
            display: false,
          },
          scales: {
            xAxes: [{
              gridLines: {
                display: false,
                drawBorder: false,
                color: 'white'
              },
              ticks: {
                fontSize: 8,
                fontColor: 'lightgrey'
              }
            }],
            yAxes: [{
              gridLines: {
                drawBorder: false,
                color: 'whitesmoke'
              },
              ticks: {
                beginAtZero: false,
                fontSize: 8,
                fontColor: 'lightgrey',
                maxTicksLimit: 100000,
                padding: 10,
                suggestedMin: 0,
                stepSize: 50000,
                suggestedMax: 100000
              }
            }]
          },
          tooltips: {
            backgroundColor: '#bbf7f0'
          }
        },
        data: {
          labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT' , 'SUN'],
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



  

this.topDrugs = new Chart('topDrugs', {
  type: 'doughnut',
    options: {
        maintainAspectRatio:false,
        cutoutPercentage:90,
        // circumference:6,
        layout: {
            padding: {
                left: 30,
                right: 30,
                top: 20,
                bottom: 40
            }
        },
      legend: {
        display: false,
      },
      scales: {

      },
      tooltips: {
        backgroundColor: 'lightgrey'
      }
    },
    data: {
      labels: ['Augmentine', 'Paracetamol', 'Septrine', 'Erythromycine'],
      datasets: [{
      data: [10, 17, 5, 19],
      tension: 0.0,
      borderColor: 'white',
    //    backgroundColor: '',
       backgroundColor: ['#dfe3e6', 'lightgreen', 'orange', '#96f4f4'],
      pointBackgroundColor: ['white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: .3,
    }]
    }
});
this.iSource = new Chart('iSource', {
  type: 'doughnut',
    options: {
        maintainAspectRatio:false,
        cutoutPercentage:90,
        // circumference:6,
        layout: {
            padding: {
                left:30,
                right:30,
                top:20,
                bottom:40

            }
        },
      legend: {
        display: false,
      },
      scales: {

      },
      tooltips: {
        backgroundColor: 'lightgrey'
      }
    },
    data: {
      labels: ['LAB', 'PHARMACY', 'CONSULTATION'],
      datasets: [{
      data: [10, 17, 5],
      tension: 0.0,
      borderColor: 'white',
    //    backgroundColor: '',
       backgroundColor: ['#dfe3e6', 'lightgreen', '#96f4f4'],
      pointBackgroundColor: ['white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: .3,
    }]
    }
  });

  this.inFlux = new Chart('inFlux', {
    type: 'line',
      options: {
          maintainAspectRatio: false,
          layout: {
              padding: {
                left: 5,
                right: 20,
                top: 0,
                bottom: 25
              }
          },
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: false,
              color: 'white'
            },
            ticks: {
              fontSize: 8,
              fontColor: 'lightgrey'
            }
          }],
          yAxes: [{
            gridLines: {
              drawBorder: false,
            },
            ticks: {
              beginAtZero: true,
              fontSize: 8,
              fontColor: 'lightgrey',
              maxTicksLimit: 5,
              suggestedMin: 0,
              stepSize: 50,
              suggestedMax: 100,
              padding: 20,
              tension: 0,
              lineTension: 0,
              bezierCurve : false
            }
          }]
        },
        tooltips: {
          backgroundColor: '#bbf7f0'
        }
      },
      data: {
          labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
          datasets: [{
              fill: false,
              backgroundColor: 'white',
              borderColor: '#96f4f4',
              data: [40, 22, 25, 48, 70, 35, 53, 67, 89, 75, 65, 57],
          }]
      }
  });
}

}
