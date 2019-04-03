import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class PersonService {

  uri = 'http://localhost:5000/api';
  constructor(private http: HttpClient) { }
  addPatient(patient) {
    return this.http.post(
      `${this.uri}/new-patient`, patient, {withCredentials: true}
      );
  }
  getPatients() {
    return this.http.get(
      `${this.uri}/patients`, {withCredentials: true}
      );
  }

  login (user) {
    return this.http.post(
      `${this.uri}/login`, user, {withCredentials: true}
       );
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

  searchPatient(id) {
    return this.http.get(
      `${this.uri}/patient/${id}`, {withCredentials: true} );
  }

  getConnections(id){
     return this.http.get(
      `${this.uri}/connections/${id}`, {withCredentials: true} );
  }
  getOrders() {
    return this.http.get(
      `${this.uri}/orders`, {withCredentials: true});
  }
  follow(me, you) {
    return this.http.post(
      `${this.uri}/follow`, {myconnect:me, yourconnect:you}, {withCredentials: true}
    );
  }
  followBack(me, you, note) {
    return this.http.post(
      `${this.uri}/followback`, {id:me, yourid: you.person._id, yourcon:you.person.connections, note:note}, {withCredentials: true}
      );
  }
  unFollow(me, you) {
    return this.http.post(
      `${this.uri}/unfollow`, {id:me, yourid:you.person._id, yourcon:you.person.connections}, {withCredentials: true}
      );
  }


}
