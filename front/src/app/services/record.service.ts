import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class RecordService {
  uri = 'http://localhost:5000/api';
  constructor(private http: HttpClient) { }

  download(file: string){
    return this.http.post(
      `${this.uri}/download`, {fileName:file}, {
        withCredentials: true,
        responseType: 'blob',
        headers: new HttpHeaders().append('Content-Type','application/json')

      });
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

 updateMedication(i, m) {
  return this.http.post(
   `${this.uri}/update-medication`, {id: i, medication: m}, {withCredentials: true});
 }
}
