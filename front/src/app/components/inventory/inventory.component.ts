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
  product: Product = new Product(new Item(), new StockInfo());
  item: Item = new Item();
  stockInfo: StockInfo = new StockInfo();
  temItems: Item[] = new Array<Item>();
  items: Item[] = new Array<Item>();
  products: Product[] = new Array<Product>();
  image: Product[];
  temProducts: Product[] = new Array<Product>();
  selections: number[] = new Array<number>();
  input = '';

     constructor(private dataService: DataService) {
   }

  ngOnInit() {

    this.getItems();
    this.getProducts();
  }
  getProducts() {
    this.dataService.getProducts().subscribe((p: any) => {
      this.products = p.inventory;
    });
  }
  getItems() {
    this.dataService.getItems().subscribe((item: Item[]) => {
      this.items = item;
      console.log(this.items);
    });
  }

  addProduct() {
    this.dataService.addProduct(new Product(this.item, this.stockInfo)).subscribe((products: Product[]) => {
       this.products = products;
    });

  }
  selectItem(i: Item) {
    this.item = i;
    this.input = i.name + ' ' + i.mesure + i.unit;
    this.temItems = new Array<Item>();
  }

  searchItem (i) {
    if (i === '') {
      this.temItems = new Array<Item>();
    } else {
    this.temItems = this.items.filter((item) => {
    let patern =  new RegExp('\^' + i , 'i');
    return patern.test(item.name);
    });
  }

  }
  sortProducts(column: string) {
  this.products.sort(sortBy(column));
  alert(column);
  }

// addMoreProduct() {
// this.temProducts.push(this.product);
// this.product = new Product();
// }
// removeProduct() {
//   for (const p of this.temProducts) {
//     this.products.splice(this.products.indexOf(p), 1);
//   }
//   this.temProducts = [];
// }
// selectProduct(p: Product) {
//   if (p.selected) {
//     this.products[this.products.indexOf(p)].selected = false;
//     this.temProducts = this.temProducts.filter((pro) => pro !== p);

//   } else {
//     this.products[this.products.indexOf(p)].selected = true;
//     this.temProducts.push(p);

//   }

// }

// populate() {}
// updateProducts() {
//   for (const p of this.temProducts) {
//     this.products[this.selections.pop()] = p;
//   }
//   this.temProducts = new Array<Product>();
// }
// searchProducts() {
//   this.products = this.image.filter((product) => {
//   let patern =  new RegExp('\^' + this.input , 'i');
//   return patern.test(product.name);
//   });

// }


}
