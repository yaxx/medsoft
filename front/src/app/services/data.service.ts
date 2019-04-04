import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Product} from '../models/inventory.model';
import {Client, Department} from '../models/client.model';
import { Person} from '../models/person.model';
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
  getHistory(id) {
    return this.http.get(
      `${this.uri}/history/${id}`, {withCredentials: true} );
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
  getConnections(id){
     return this.http.get(
      `${this.uri}/connections/${id}`, {withCredentials: true} );
  }
  getPatients() {
    return this.http.get(
      `${this.uri}/patients`, {withCredentials: true}
      );
  }
  getConsultees(dept) {
    return this.http.get(
       `${this.uri}/consultation/${dept}`, {withCredentials: true}
       );
  }
  follow(id) {
     return this.http.post(
      `${this.uri}/follow`, {id:id}, {withCredentials: true}
    );
  }
  followBack(id) {
    return this.http.post(
      `${this.uri}/followback`, {id:id}, {withCredentials: true}
      );
  }
  unFollow(me, you) {
    return this.http.post(
      `${this.uri}/unfollow`, {id:me, yourid:you.person._id, yourcon:you.person.connections}, {withCredentials: true}
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
  runTransaction(patients:Person[], i:Product[]) {
    return this.http.post(
      `${this.uri}/transaction`, {patients:patients, inventory:i}, {withCredentials: true}
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
    console.log(client)
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
  updateInfo(person) {
    return this.http.post(
      `${this.uri}/update-info`, person , {withCredentials: true});
 }

  upload(image, pid) {
    return this.http.post(
      `${this.uri}/upload`, image, {withCredentials: true});
  }
  download(file: string){
    return this.http.post(
      `${this.uri}/download`, {fileName:file}, {
        withCredentials: true,
        responseType: 'blob',
        headers: new HttpHeaders().append('Content-Type','application/json')

      });
  }
  updateMedication(i, m) {
     return this.http.post(
      `${this.uri}/update-medication`, {id: i, medication: m}, {withCredentials: true});
  }
  updateBed(patient, client) {
    return this.http.post(
      `${this.uri}/updatebed`, {patient, client}, {withCredentials: true});
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

  addPerson(staff:Person) {
     return this.http.post(
        `${this.uri}/person`, staff, {withCredentials: true}
      );
    }


  updateClient(client) {
    return this.http.post(
      `${this.uri}/updateclient`, client, {withCredentials: true});

  }



}

