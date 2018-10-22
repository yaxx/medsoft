import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Patient} from '../models/data.model';
import {Setting, Department, Staff} from '../models/data.model';
import { Observable } from 'rxjs';
import { Observer } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as socketIo from 'socket.io-client';

import { Socket } from '../models/socket';

declare var io: {
  connect(url: string): Socket;
};


@Injectable({
  providedIn: 'root'
})
export class DataService {
  uri = 'http://localhost:3000/api';
  socket: Socket;
  observer: Observer<number>;
  staff: Staff = new Staff();


  constructor(private http: HttpClient) { }


  // getQuotes(): Observable<number> {
  //   this.socket = socketIo('http://localhost:3000');

  //   this.socket.on('data', (res) => {
  //     this.observer.next(res.data);
  //   });

  //   return this.createObservable();
  // }

  // createObservable(): Observable<number> {
  //     return new Observable<number>(observer => {
  //       this.observer = observer;
  //     });
  // }

  // private handleError(error) {
  //   console.error('server error:', error);
  //   if (error.error instanceof Error) {
  //       let errMessage = error.error.message;
  //       return Observable.throw(errMessage);
  //   }
  //   return Observable.throw(error || 'Socket.io server error');
  // }



  getPatients() {
    return this.http.get(`${this.uri}/patients`, {withCredentials: true});
  }
  getConsultees() {
    return this.http.get(`${this.uri}/consultees`, {withCredentials: true});
  }
  addPatient(patient) {
    return this.http.post(`${this.uri}/new-patient`, patient, {withCredentials: true});
  }
  login (staff) {
    return this.http.post(`${this.uri}/login`, staff, {withCredentials: true});
  }
  searchPatient(id) {
    return this.http.get(`${this.uri}/patient/${id}`, {withCredentials: true} );
  }

  createClient(client) {
    return this.http.post(`${this.uri}/new-client`, client, {withCredentials: true});
  }
  saveRecord(record) {
    return this.http.post(`${this.uri}/new-record`, record, {withCredentials: true});
  }
  getNew() {
    return this.staff;
  }

  getSettings() {
    return this.http.get(`${this.uri}/settings`, {withCredentials: true});
  }
  getDepartments() {
    return this.http.get(`${this.uri}/departments`,{withCredentials: true});
  }
  addStaff(staff) {
    return this.http.post(`${this.uri}/new-staff`, staff, {withCredentials: true});
  }
  addDepts(d) {
    return this.http.post(`${this.uri}/new-dept`, d, {withCredentials: true});
  }



}

