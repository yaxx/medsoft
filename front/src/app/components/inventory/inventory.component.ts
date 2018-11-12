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

     constructor(private dataService: DataService) {
   }

  ngOnInit() {
    this.getItems();
    this.getProducts();
  }
  switchViews() {
   this.view = this.view === 'products' ? 'new' : 'products';
  }
  switchToEdit() {
    this.product = this.products.filter((pr) => pr.selected)[0];
    this.input = this.product.item.name + ' ' + this.product.item.mesure + this.product.item.unit;
    this.mode = 'edit';
    this.switchViews();
  }
  getProducts() {
    this.dataService.getProducts().subscribe((p: any) => {
      this.products = p.inventory;
    });
  }
  getItems() {
    this.dataService.getItems().subscribe((item: Item[]) => {
      this.items = item;
    });
  }
  sortProducts(name: string) {
    switch (name) {
      case 'name':
        this.products.sort((m, n) => m.item.name.localeCompare(n.item.name));
        this.sortBy = 'name';
        break;
      case 'category':
        this.products.sort((m, n) => m.item.name.localeCompare(n.item.category));
        this.sortBy = 'category';
        break;
      case 'description':
        this.products.sort((m, n) => m.item.name.localeCompare(n.item.description));
        this.sortBy = 'description';
        break;
      case 'price':
        this.products.sort((m, n) => n.stockInfo.price - m.stockInfo.price );
        this.sortBy = 'price';
        break;
      case 'quantity':
        this.products.sort((m, n) => n.stockInfo.quantity - m.stockInfo.quantity );
        this.sortBy = 'quantity';
        break;
      case 'sold':
        this.products.sort((m, n) => n.stockInfo.sold - m.stockInfo.sold );
        this.sortBy = 'sold';
        break;
      case 'added':
        this.products.sort((m, n) => new Date(n.addedOn).getTime() - new Date(m.addedOn).getTime());
        this.sortBy = 'added';
        break;
        default:
        break;


    }
  }
  addMore(){
    this.temProducts.push(this.product);
    this.input = '';
    // this.item = new Item();
    // this.stockInfo = new StockInfo();
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
      this.switchViews();
   });

  }
  deleteProducts() {
    this.dataService.deleteProducts(this.products.filter((p) => p.selected)).subscribe((products: Product[]) => {
      this.products = products;

   });


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
