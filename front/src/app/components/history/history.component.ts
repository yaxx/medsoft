import { Component, OnInit } from '@angular/core';
import { Person} from '../../models/person.model';
import { Note} from '../../models/record.model';
import {DataService} from '../../services/data.service';
import {CookieService } from 'ngx-cookie-service';
import {ActivatedRoute} from '@angular/router';
import {Chart} from 'chart.js';
import {saveAs} from 'file-saver';
// import { truncateSync } from 'fs';


@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  patient: Person = new Person();
  loading = false;
  message = null;
  bpChart = [];
  chartData = [];
  notes: Note[] = [];
  chartLabels = new Array<String>(10);
  constructor(private dataService: DataService, private cookies: CookieService, private route: ActivatedRoute) { }

  ngOnInit() {
    let day = null;
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    this.loading = true;
    this.dataService.getHistory(this.route.snapshot.params['id']).subscribe((patient: Person) => {
      this.loading = false;
      this.notes = patient.record.notes;
      this.patient = patient;
      this.patient.record.notes = patient.record.notes.map(note => ({
        ...note,
        note: note.note.length > 150 ? note.note.substr(0, 150) : note.note
      }));
    }, (e) => {
      this.message = 'Something went wrong';
      this.loading = false;
    });

    this.patient.record.vitals.bp.forEach((bp, i) => {
        this.chartData.push(bp.value);
        this.chartLabels[i] = new Date(bp.meta.dateAdded).getDate().toString() + months[new Date(bp.meta.dateAdded).getMonth()];
      });
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
  getDp(avatar: String) {
    return 'http://localhost:5000/api/dp/' + avatar;
    // return 'http://18.221.76.96:5000/api/dp/' + avatar;
  }

  getMyDp() {
    return this.getDp(this.cookies.get('d'))
  }
  getImage(fileName: String){
    // return 'http://192.168.0.100:5000/api/dp/' + fileName;
    return 'http://localhost:5000/api/dp/' + fileName;
    // return 'http://18.221.76.96:5000/api/dp/' + fileName;
  }
  compareNotes(i:number, note: Note) {
    return this.notes[i].note.length === note.note.length;
  }
  downloadImage(file: string) {
    this.dataService.download(file).subscribe(
      res =>  saveAs(res, file)
    );
  }
  readMore(e: Event, i: number) {
  e.preventDefault();
  this.patient.record.notes[i].note = this.notes[i].note;
}
getDocDp(avatar: string) {
    return 'http://localhost:5000/api/dp/' + avatar;
    // return 'http://http://192.168.1.100:5000/api/dp/' + avatar;
}



// getPatient(): Patient {
//    return this.dataService.getCachedPatients(this.route.snapshot.params['id'])
// }
}

