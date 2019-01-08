import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Client, Department, Person} from '../models/data.model';
import * as socketIo from 'socket.io-client';

import { Socket } from '../models/socket';

declare var io: {
  connect(url: string): Socket;
};


@Injectable({
  providedIn: 'root'
})
export class DataService {
  uri = 'http://localhost:5000/api';
  socket: Socket;
  staff: Person = new Person();
  patients: Person[] = new Array<Person>();
  cachedPatients: Person[] = new Array<Person>();

  constructor(private http: HttpClient) { }
  setCachedPatients(patients: Person[]) {
     this.cachedPatients = patients;
  }
  getCachedPatient(id) {
    return this.cachedPatients.filter((p) => p._id === id)[0];
  }
  getMyAccount(){
    return this.http.get(
      `${this.uri}/myaccount`, {withCredentials: true}
      );
  }
  explore(){
    return this.http.get(
      `${this.uri}/explore`, {withCredentials: true}
      );
  }
  getPatients() {
    return this.http.get(
      `${this.uri}/patients`, {withCredentials: true}
      );
  }
  getConsultees() {
    return this.http.get(
       `${this.uri}/consultees`, {withCredentials: true}
       );
  }
  follow(me, you) {
    return this.http.post(
      `${this.uri}/follow`, {myconnect:me, yourconnect:you}, {withCredentials: true}
      );
  }
  addPatient(patient) {
    return this.http.post(
      `${this.uri}/new-patient`, patient, {withCredentials: true}
      );
  }
  addProduct(product) {
    return this.http.post(
    `${this.uri}/new-product`,  product, {withCredentials: true}
    );
  }
  updateProducts(product) {
    return this.http.post(
      `${this.uri}/update-products`, product, {withCredentials: true}
      );
  }
  runTransaction(p,i) {
    return this.http.post(
      `${this.uri}/transaction`, {patient:p, inventory:i}, {withCredentials: true}
      );
  }
  deleteProducts(product) {
    return this.http.post(
      `${this.uri}/delete-products`, product, {withCredentials: true}
      );
  }
  login (user) {
    return this.http.post(
      `${this.uri}/login`, user, {withCredentials: true}
       );
  }
  searchPatient(id) {
    return this.http.get(
      `${this.uri}/patient/${id}`, {withCredentials: true} );
  }

  createClient(client) {
    return this.http.post(
      `${this.uri}/new-client`, client, {withCredentials: true});
  }
  saveRecord(record) {
    return this.http.post(
      `${this.uri}/new-record`, record, {withCredentials: true});
  }

  updateRecord(patient) {
    return this.http.post(
      `${this.uri}/update-record`, patient , {withCredentials: true});

  }

  upload(image, pid) {
    return this.http.post(
      `${this.uri}/upload`, {scan: image, id: pid}, {withCredentials: true});

  }
  updateMedication(m) {
    return this.http.post(
      `${this.uri}/update-medication`, {medication: m}, {withCredentials: true});

  }
  updateBed(pat, depts, client) {
    return this.http.post(
      `${this.uri}/updatebed`, {patient: pat , departments: depts, cid: client}, {withCredentials: true});

  }
  updateNote(i, n) {
    return this.http.post(
      `${this.uri}/updatenote`, {id: i, note: n}, {withCredentials: true});

  }
  getNew() {
    return this.staff;
  }

  getClient() {
    return this.http.get(
      `${this.uri}/client`, {withCredentials: true}
      );

  }
  getProducts() {
    return this.http.get(
      `${this.uri}/products`, {withCredentials: true}

      );
  }
  getItems() {
    return this.http.get(
      `${this.uri}/items`, {withCredentials: true}
      );

  }
  getInPatients() {
    return this.http.get(
      `${this.uri}/inpatients`, {withCredentials: true}
      );

  }
  getOrders() {
    return this.http.get(
      `${this.uri}/orders`, {withCredentials: true});

  }
  getDepartments() {
    return this.http.get(
      `${this.uri}/departments`, {withCredentials: true});

  }

  saveStaff(staff:Person) {
     return this.http.post(
        `${this.uri}/staff`, staff, {withCredentials: true}
         );
    }


  addDepts(d) {
    return this.http.post(
      `${this.uri}/new-dept`, d, {withCredentials: true});

  }



}

