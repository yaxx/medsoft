import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Setting, Department, Staff, Patient} from '../models/data.model';
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
    return this.http.get(`${this.uri}/patients`, {withCredentials: true});
  }
  getConsultees() {
    return this.http.get(`${this.uri}/consultees`, {withCredentials: true});
  }
  addPatient(patient) {
    return this.http.post(`${this.uri}/new-patient`, patient, {withCredentials: true});
  }
  addProduct(product) {
    return this.http.post(`${this.uri}/new-product`, product, {withCredentials: true});
  }
  updateProducts(product) {
    return this.http.post(`${this.uri}/update-products`, product, {withCredentials: true});
  }
  deleteProducts(product) {
    return this.http.post(`${this.uri}/delete-products`, product, {withCredentials: true});
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
  updateRecord(record, medications) {
    return this.http.post(`${this.uri}/update-record`, {record: record, medications: medications}, {withCredentials: true});
  }
  updateMedication(m) {
    return this.http.post(`${this.uri}/update-medication`, {medication: m}, {withCredentials: true});
  }
  getNew() {
    return this.staff;
  }

  getSettings() {
    return this.http.get(`${this.uri}/settings`, {withCredentials: true});
  }
  getProducts() {
    return this.http.get(`${this.uri}/products`, {withCredentials: true});
  }
  getItems() {
    return this.http.get(`${this.uri}/items`, {withCredentials: true});
  }
  getOrders() {
    return this.http.get(`${this.uri}/orders`, {withCredentials: true});
  }
  getDepartments() {
    return this.http.get(`${this.uri}/departments`, {withCredentials: true});
  }
  addStaff(staff) {
    return this.http.post(`${this.uri}/new-staff`, staff, {withCredentials: true});
  }
  addDepts(d) {
    return this.http.post(`${this.uri}/new-dept`, d, {withCredentials: true});
  }



}

