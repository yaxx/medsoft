import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Person} from '../models/person.model';
import {Product} from '../models/inventory.model';
@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  uri = 'http://localhost:5000/api';
  constructor(private http: HttpClient) { }

  updateProducts(product) {
    return this.http.post(
      `${this.uri}/update-products`, product, {withCredentials: true}
      );
  }
  runTransaction(patients: Person[], i: Product[]) {
    return this.http.post(
      `${this.uri}/transaction`, {patients:patients, inventory: i}, {withCredentials: true}
      );
  }
  deleteProducts(product) {
    return this.http.post(
      `${this.uri}/delete-products`, product, {withCredentials: true}
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
}
