import { Component, OnInit, OnDestroy} from '@angular/core';
import {DataService} from '../../services/data.service';
import {Product, Item, StockInfo} from '../../models/inventory.model';
import {Person} from '../../models/person.model';
import {CookieService } from 'ngx-cookie-service';
import { sortBy } from 'sort-by-typescript';
import {SocketService} from '../../services/socket.service';
import * as cloneDeep from 'lodash/cloneDeep';
@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  product: Product = new Product();
  clonedInventory: Product[] = [];
  item: Item = new Item();
  stockInfo: StockInfo = new StockInfo();
  temItems: Item[] = [];
  items: Item[] = [];
  newItems: Item[] = [];
  products: Product[] = [];
  cloned: Product;
  temProducts: Product[] = [];
  editables: Product[] = [];
  edited: Product[] = [];
  selections: number[] = [];
  input = '';
  loading = false;
  processing = false;
  message = null;
  feedback = null;
  sortBy = 'added';
  searchTerm = '';
  count = 0;

  constructor(
    private dataService: DataService,
    private cookies: CookieService,
    private socket: SocketService) {
   }

  ngOnInit() {
    this.getProducts();
    this.socket.io.on('transaction', cart => {
      cart.forEach(product => {
        this.products[this.products.findIndex(pro => pro._id === product._id)] = product;
      });
    })
    // this.socket.io.on('refund', refund => {
    //     this.products.forEach(prod => {
    //       if(prod._id === refund.product._id) {
    //           prod.stockInfo.inStock = prod.stockInfo.inStock + refund.purchased;
    //           prod.stockInfo.sold = prod.stockInfo.sold - refund.purchased;
    //         }
    //     });
    // });
  }

  switchToEdit() {
    this.product = this.products.filter((p) => p.selected)[0];
    this.input = this.product.item.name + ' ' + this.product.item.mesure + this.product.item.unit;
  }
getDp(avatar: String) {
    return 'http://localhost:5000/api/dp/' + avatar;
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  getProducts() {
    this.loading = true;
    this.dataService.getProducts().subscribe((res: any) => {
      console.log(res)
      this.items = res.items;
      if(res.inventory.length) {
        this.products = res.inventory;
        this.clonedInventory = res.inventory;
        this.loading = false;
        this.message = null;
      } else {
        this.message = 'No Products So Far';
        this.loading = false;
      }
    },(e) => {
      this.message = 'Something went wrong';
      this.loading = false;
    });
  }

  refresh() {
    this.getProducts();
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
        this.products.sort((m, n) => m.stockInfo.price - n.stockInfo.price );
        this.sortBy = 'price';
        break;
      case 'quantity':
        this.products.sort((m, n) => m.stockInfo.quantity - n.stockInfo.quantity );
        this.sortBy = 'quantity';
        break;
      case 'instock':
        this.products.sort((m, n) => m.stockInfo.inStock - n.stockInfo.inStock );
        this.sortBy = 'instock';
        break;
      case 'sold':
        this.products.sort((m, n) => n.stockInfo.sold - m.stockInfo.sold );
        this.sortBy = 'sold';
        break;
      case 'added':
        this.products.sort((m, n) => new Date(n.dateCreated).getTime() - new Date(m.dateCreated).getTime());
        this.sortBy = 'added';
        break;
        default:
        break;
    }
  }
  addMore() {
    this.product.stockInfo.inStock = this.product.stockInfo.quantity;
    if(this.items.some(item => item.name === this.item.name)) {
      } else {
        this.newItems.unshift({...this.item, type:'drue'});
        this.items.unshift({...this.item, type:'drue'});
      }
    if(this.products.some(product => product.item.name === this.item.name) || this.temProducts.some(product => product.item.name === this.item.name)) {
    this.feedback = 'Product already exist';
    } else {
      this.product.item = this.item;
      this.temProducts.unshift(this.product);
      this.item = new Item();
      this.product = new Product();
    }
  }
  clearFeedback() {
    this.feedback = null;
  }
  addSelection(i: Item) {
    this.item = i;
    this.product.item = i;
    this.temItems = [];
  }

  selectProduct(i) {
    this.products[i].selected = this.products[i].selected ? false : true;
  }
  pickSelection() {
    this.editables = cloneDeep(this.products.filter(p => p.selected));
    this.count = this.editables.length;
    this.product = this.editables.shift();
    this.input = this.product.item.name;
  }
  pickDeletables() {
    return this.products.filter(p => p.selected);
  }
  updateStock() {
    const oldProduct = this.products.find(product => product._id === this.product._id);
    this.product.stockInfo.inStock = this.product.stockInfo.inStock + (this.product.stockInfo.quantity - oldProduct.stockInfo.quantity);
    return this.product;
   }
  next() {
    if (this.input !== '') {
      if (this.item._id) {
          this.product.item = this.item;
          this.item = new Item();
          this.edited.unshift(this.updateStock());
      } else if (this.product.item.name !== this.input) {
          this.product.item = new Item(this.input);
          this.edited.unshift(this.updateStock());
      } else {
          this.edited.unshift(this.updateStock());
      }
      this.input = '';
      this.product = new Product();
      if (this.editables.length) {
          this.product = this.editables.shift();
          this.input = this.product.item.name;
      }
    }
  }
  previous() {
      if (this.input !== '') {
        if (this.edited.length) {
          if (this.item._id) {
            this.product.item = this.item;
            this.item = new Item();
            this.editables.unshift(this.product);

          } else if (this.product.item.name !== this.input) {
              this.product.item = new Item(this.input);
              this.editables.unshift(this.product);
              this.product = this.edited.shift();
              this.input = this.product.item.name;

          } else {
              this.editables.unshift(this.product);
              this.product = this.edited.shift();
              this.input = this.product.item.name;
          }
      }
    } else if (this.edited.length) {
        this.product = this.edited.shift();
        this.input = this.product.item.name;
    }
  }
  selectionOccure() {
    return this.products.some((product) => product.selected);
  }
  dropSelection(i) {
    this.temProducts = this.temProducts.splice(i, 1);
  }

  searchItems(i: string, type: string) {
    if (i === '') {
      this.temItems = [];
    } else {
        this.temItems = this.items.filter(it => it.type === type).filter((item) => {
        const patern =  new RegExp('\^' + i , 'i');
        return patern.test(item.name);
      });
  }
}
  addProducts() {
    this.processing = true;
    this.dataService.addProducts(this.temProducts, this.newItems)
    .subscribe((products: Product[]) => {
      this.processing = false;
      this.feedback = 'Product added successfully';
      this.products = [...products, ...this.products];
      this.socket.io.emit('store update', {action: 'new', changes: products});
      this.temProducts = [];
      setTimeout(() => {
        this.feedback = null;
  }, 4000);
   }, (e) => {
        this.feedback = 'Could not add products';
        this.processing = false;
  });

  }
  updateProducts() {
    this.processing = true;
    this.dataService.updateProducts(this.edited) .subscribe(() => {
        this.edited.forEach(product => {
        this.products[this.products.findIndex(pro => pro._id === product._id)] = product;
    });
    this.socket.io.emit('store update', {action: 'update', changes: this.edited});
    this.product = new Product();
    this.input = '';
    this.processing = false;
    this.edited = this.editables = [];
    this.feedback = 'Inventory succesffully updated';
    setTimeout(() => {
      this.feedback = null;
    }, 4000);
   }, (e) => {
      this.processing = false;
      this.feedback = 'Unable to update store';
    });
}
deleteProducts() {
  this.processing = true;
  const selections = this.products.filter(p => p.selected);
  this.dataService.deleteProducts(selections).subscribe(() => {
      this.processing = false;
      this.feedback = 'Inventory succesffully updated';
      this.socket.io.emit('store update', {action: 'delete', changes: selections});
      this.products = this.products.filter(product => !product.selected);
   },(e) => {
      this.processing = false;
      this.feedback = 'Unable to update inventory';
    });
  }
expired(expiry) {
  return Date.now() >= new Date(expiry).valueOf();
}

searchProducts(search: string) {
  if (search === '') {
    this.products = this.clonedInventory;
  } else {
     this.products = this.products.filter((product) => {
     const patern =  new RegExp('\^' + search , 'i');
     return patern.test(product.item.name);
  });
}

}


}
