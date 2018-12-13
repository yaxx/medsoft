import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Client, Department, Staff, Patient} from '../models/data.model';
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
  staff: Staff = new Staff();
  patients: Patient[] = new Array<Patient>();
  cachedPatients: Patient[] = new Array<Patient>();

  constructor(private http: HttpClient) { }
  setCachedPatients(patients: Patient[]) {
     this.cachedPatients = patients;
  }
  getCachedPatient(id) {
    return this.cachedPatients.filter((p) => p._id === id)[0];
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
  addPatient(patient) {
    return this.http.post(
      `${this.uri}/new-patient`, patient,{withCredentials: true}
     
      
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
  deleteProducts(product) {
    return this.http.post(
      `${this.uri}/delete-products`,product, {withCredentials: true}
     
      );
  }
  login (staff) {
    return this.http.post(
      `${this.uri}/login`, staff,{withCredentials: true}
       
       );
  }
  searchPatient(id) {
    return this.http.get(
      `${this.uri}/patient/${id}`,{withCredentials: true} );
       
  }

  createClient(client) {
    return this.http.post(
      `${this.uri}/new-client`, client,{withCredentials: true});
       
  }
  saveRecord(record) {
    return this.http.post(
      `${this.uri}/new-record`, record,{withCredentials: true});
  }
       
  updateRecord(session, pid) {
    return this.http.post(
      `${this.uri}/update-record`,
       {session: session, id: pid},{withCredentials: true});
  }
       
  upload(image, pid) {
    return this.http.post(
      `${this.uri}/upload`, {scan: image, id: pid}, {withCredentials: true});
      
  }
  updateMedication(m) {
    return this.http.post(
      `${this.uri}/update-medication`,{medication: m}, {withCredentials: true});
       
  }
  updateBed(i, n, d, c) {
    return this.http.post(
      `${this.uri}/updatebed`,{pid: i, bedNo: n, dname:"GOPD", cid:c}, {withCredentials: true});
       
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
      `${this.uri}/client`,{withCredentials: true}
      );
    
  }
  getProducts() {
    return this.http.get(
      `${this.uri}/products`, {withCredentials: true}
    
      );
  }
  getItems() {
    return this.http.get(
      `${this.uri}/items`,{withCredentials: true}
      );
       
  }
  getInPatients() {
    return this.http.get(
      `${this.uri}/inpatients`, {withCredentials: true}
      );
      
  }
  getOrders() {
    return this.http.get(
      `${this.uri}/orders`,{withCredentials: true});
     
  }
  getDepartments() {
    return this.http.get(
      `${this.uri}/departments`,{withCredentials: true});
       
  }

  saveStaff(staff, action) {
    if (action === 'new') {
      return this.http.post(
        `${this.uri}/new-staff`, staff, {withCredentials: true}
       
         );
    } else if (action === 'update') {
      return this.http.post(
        `${this.uri}/update-staff`, staff, {withCredentials: true});
        
    } else {
      return this.http.post(
        `${this.uri}/delete-staff`, staff, {withCredentials: true});
        
    }
  }

  addDepts(d) {
    return this.http.post(
      `${this.uri}/new-dept`, d, {withCredentials: true});
      
  }



}

