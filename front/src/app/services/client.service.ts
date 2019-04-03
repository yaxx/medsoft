import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ClientService {

  uri = 'http://localhost:5000/api';
  constructor(private http: HttpClient) { }
  createClient(client) {
    return this.http.post(
      `${this.uri}/new-client`, client, {withCredentials: true});
  }

  getClient() {
    return this.http.get(
      `${this.uri}/client`, {withCredentials: true}
      );

  }
  
  updateClient(client) {
    return this.http.post(
      `${this.uri}/updateclient`, client, {withCredentials: true});
  }

  updateBed(patient, client) {
    return this.http.post(
      `${this.uri}/updatebed`, {patient, client}, {withCredentials: true});
  }

  getDepartments() {
    return this.http.get(
      `${this.uri}/departments`, {withCredentials: true});

  }
}
