import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {Product, Item, StockInfo} from '../../models/data.model';
import { sortBy } from 'sort-by-typescript';

import * as socketIo from 'socket.io-client';
import {Socket} from '../../models/socket';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  product: Product = new Product(new Item(), new StockInfo());
  // item: Item = new Item();
  // stockInfo: StockInfo = new StockInfo();
  temItems: Item[] = new Array<Item>();
  items: Item[] = new Array<Item>();
  products: Product[] = new Array<Product>();
  image: Product[];
  temProducts: Product[] = new Array<Product>();
  selections: number[] = new Array<number>();
  input = '';
  sortBy = 'added';
  view = 'products';
  mode = 'new';
  constructor(private dataService: DataService) { }

  ngOnInit() {
  }
  addProducts(){
    this.dataService.addProduct(this.temProducts)
    .subscribe((products: Product[]) => {
      this.products = products;
      this.temProducts = new Array<Product>();
      this.view = 'products';
   });

  }


  selectItem(i: Item) {
    this.product.item = i;
    this.input = i.name + ' ' + i.mesure + i.unit;
    this.temItems = new Array<Item>();
  }

  selectProduct(i) {
    this.products[i].selected = this.products[i].selected ? false : true;

  }
  selectionOccure() {
    return this.products.some((product) => product.selected);
  }

  searchItem (i) {
    if (i === '') {
      this.temItems = new Array<Item>();
    } else {
    this.temItems = this.items.filter((item) => {
    const patern =  new RegExp('\^' + i , 'i');
    return patern.test(item.name);
    });
  }
  }

  submit() {
    if (this.mode === 'new') {
      this.addProducts();
    } else {
      this.updateProducts();
    }
  }
  updateProducts() {
    this.dataService.updateProducts(this.product)
    .subscribe((products: Product[]) => {
      this.products = products;
      this.product = new Product(new Item(), new StockInfo());
  });

  }
  deleteProducts() {
    this.dataService.deleteProducts(this.products.filter((p) => p.selected)).subscribe((products: Product[]) => {
      this.products = products;

   });


  }

}
