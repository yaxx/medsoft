import { Component, OnInit, OnDestroy} from '@angular/core';
import {DataService} from '../../services/data.service';
import {Product, Item, StockInfo} from '../../models/data.model';
import { sortBy } from 'sort-by-typescript';

import * as socketIo from 'socket.io-client';
import {Socket} from '../../models/socket';
@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  product: Product = new Product(new Item(), new StockInfo);
  item: Item = new Item();
  items: Item[] = new Array<Item>();
  products: Product[] = new Array<Product>();
  image: Product[];
  temProducts: Product[] = new Array<Product>();

  selections: number[] = new Array<number>();


   constructor(private dataService: DataService) {

   }

  ngOnInit() {
    this.getProducts();
  }
getProducts(){
  this.dataService.getProducts().subscribe((products) => {
    this.products = products.p;
    this.items = products.i;
  })
}

addProduct() {
  this.products = this.products.concat(this.temProducts);

}
addMoreProduct() {
this.temProducts.push(this.product);
this.product = new Product();
}
removeProduct() {
  for (const p of this.temProducts) {
    this.products.splice(this.products.indexOf(p), 1);
  }
  this.temProducts = [];
}
selectProduct(p: Product) {
  if (p.selected) {
    this.products[this.products.indexOf(p)].selected = false;
    this.temProducts = this.temProducts.filter((pro) => pro !== p);

  } else {
    this.products[this.products.indexOf(p)].selected = true;
    this.temProducts.push(p);

  }

}
sortProducts(column: string) {
 this.products.sort(sortBy(column));
}
populate() {}
updateProducts() {
  for (const p of this.temProducts) {
    this.products[this.selections.pop()] = p;
  }
  this.temProducts = new Array<Product>();
}
searchProducts() {
  this.products = this.image.filter((product)=> {
  let patern =  new RegExp('\^' + this.input , 'i');
  return patern.test(product.name);
  });

}


}
