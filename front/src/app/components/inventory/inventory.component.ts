import { Component, OnInit, OnDestroy} from '@angular/core';
import {DataService} from '../../services/data.service';
import {Product, Item, StockInfo} from '../../models/inventory.model';
import {Person} from '../../models/person.model';
import {Tests, Scannings, Surgeries} from '../../data/request';
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
  scanItems = [];
  surgeryItems = [];
  inventoryItems = [];
  newItems: Item[] = [];
  products: Product[] = [];
  services: Product[] = [];
  cloned: Product;
  desc = [];
  temProducts: Product[] = [];
  editables: Product[] = [];
  edited: Product[] = [];
  selections: number[] = [];
  tests = Tests;
  scans = Scannings;
  matches = [];
  input = '';
  loading = false;
  processing = false;
  message = null;
  tableView = 'Products';
  feedback = null;
  categories = [];
  menuView = false;
  cat = 'Products'
  errLine = null;
  cardType = 'Standard'
  curentItems = [];
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
    });
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
    // this.product = this.products.filter((p) => p.selected)[0];
    // this.input = this.product.item.name + ' ' + this.product.item.mesure + this.product.item.unit;
  }
  getDp(avatar: String) {
    // return 'http://192.168.1.100:5000/api/dp/' + avatar;
    return 'http://localhost:5000/api/dp/' + avatar;
    // return 'http://13.59.243.243/api/dp/' + avatar;
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  getProducts() {
    this.loading = true;
    this.dataService.getProducts().subscribe((res: any) => {
      this.items = res.items;
      if (res.inventory.length) {
        this.clonedInventory = res.inventory;
        this.products = res.inventory;
        this.curentItems  =  res.inventory.filter(product => product.type === 'Products');
        this.loading = false;
        this.message = null;
      } else {
        this.message = 'No Products So Far';
        this.loading = false;
      }
    }, (e) => {
      this.message = 'Something went wrong';
      this.loading = false;
    });
  }

  refresh() {
    this.getProducts();
  }
  formCompleted() {
    return this.item.name && this.product.stockInfo.price && this.product.stockInfo.quantity && this.product.stockInfo.expiry;
  }
  searchTests() {
    if (!this.product.item.name) {
      this.matches = [];
    } else {
        this.matches = this.tests.filter((name) => {
        const patern =  new RegExp('\^' + this.product.item.name , 'i');
        return patern.test(name);
      });
    }
  }
  selectTest(match) {
    this.product.item.name = match;
    this.matches = [];
  }
  sortProducts(name: string) {
    switch (name) {
      case 'name':
        this.curentItems.sort((m, n) => m.item.name.localeCompare(n.item.name));
        this.sortBy = 'name';
        break;
      case 'category':
        this.curentItems.sort((m, n) => m.item.name.localeCompare(n.item.category));
        this.sortBy = 'category';
        break;
      // case 'description':
      //   this.curentItems.sort((m, n) => m.item.name.localeCompare(n.item.description));
      //   this.sortBy = 'description';
      //   break;
      case 'price':
        this.curentItems.sort((m, n) => m.stockInfo.price - n.stockInfo.price );
        this.sortBy = 'price';
        break;
      case 'quantity':
        this.curentItems.sort((m, n) => m.stockInfo.quantity - n.stockInfo.quantity );
        this.sortBy = 'quantity';
        break;
      case 'instock':
        this.curentItems.sort((m, n) => m.stockInfo.inStock - n.stockInfo.inStock );
        this.sortBy = 'instock';
        break;
      case 'sold':
        this.curentItems.sort((m, n) => n.stockInfo.sold - m.stockInfo.sold );
        this.sortBy = 'sold';
        break;
      case 'added':
        this.curentItems.sort((m, n) => new Date(n.dateCreated).getTime() - new Date(m.dateCreated).getTime());
        this.sortBy = 'added';
        break;
        default:
        break;
    }
  }
  addMore() {
     if (this.items.some(item => item.name === this.item.name)) {
      } else {
        this.newItems.unshift({...this.item, type: this.tableView});
        this.items.unshift({...this.item, type: this.tableView});
      }
    if (this.products.some(product => product.item.name === this.item.name) || 
    this.temProducts.some(product => product.item.name === this.item.name)) {
    this.errLine = 'Product already exist';
    } else {
      this.product.item = this.item;
      this.temProducts.unshift({...this.product, type: this.tableView});
      this.item = new Item();
      this.product = new Product();
    }
  }
  addMoreService() {
     if (this.products.some(product => product.item.name === this.product.item.name) || 
     this.temProducts.some(product => product.item.name === this.product.item.name)) {
    this.errLine = 'Service already exist';
    } else {
      this.temProducts.unshift({
        ...this.product, type: this.tableView
      });
      this.product = new Product();
    }
  }
  serviceFormCompleted() {
    return this.product.stockInfo.price && this.product.item.name && this.product.item.category;
  }
  clearFeedback() {
    this.feedback = null;
    this.errLine = null;
  }
  toggleView(view: string) {
    this.tableView = view;
    const p = this.clonedInventory;
    this.curentItems =  p.filter(product => product.type === this.tableView);
    this.temProducts = [];
    this.editables = [];
    this.edited = [];
    this.product = new Product();
    this.curentItems.forEach(product => {
      product.selected = false;
    }); 
  }
  toggleMenu() {
    this.menuView = !this.menuView;
  }
  removeProduct(i: number) {
    this.temProducts.splice(i, 1);
  }
  selectCategory(i: Item) {
    this.product.item.category = i.name;
    this.categories = [];
  }
  addSelection(i: Item) {
    this.product.item = i;
    this.temItems = [];
  }

  selectProduct(i) {
    this.curentItems[i].selected = !this.curentItems[i].selected ;
  }
  pickSelection() {
    this.editables = cloneDeep(this.products.filter(p => p.selected));
    this.count = this.editables.length;
    this.product = this.editables.shift();
    this.input = this.product.item.name;
    this.item = this.product.item;
  }
  pickDeletables() {
    return this.curentItems.filter(p => p.selected);
  }
  updateStock() {
    const oldProduct = this.products.find(product => product._id === this.product._id);
    this.product.stockInfo.inStock = this.product.stockInfo.inStock + (this.product.stockInfo.quantity - oldProduct.stockInfo.quantity);
    return this.product;
   }
  next() {
      this.edited.unshift(this.product);
      this.product = new Product();
      if (this.editables.length) {
          this.product = this.editables.shift();
      }
  }
  prev() {
       this.editables.unshift(this.product);
        this.product = this.edited.shift();
  }
  selectionOccure() {
    return this.products.some((product) => product.selected);
  }
  dropSelection(i) {
    this.temProducts = this.temProducts.splice(i, 1);
  }
  hideCategories() {
    this.categories = [];
    this.clearFeedback();
  }
  showItems(type: string) {
    this.categories = this.items.filter(item => item.type === type);
}
getDescriptions() {
  switch (this.product.item.category) {
    case 'Card':
      // this.inventoryItems = ['Standard', 'Premium', 'Exclusive'];
    break;
    case 'Surgery':
      // this.matches = this.searchSurgeries();
    break;
    case 'Scanning':
      // this.inventoryItems = this.searchScans;
    break;
    case 'Test':
      this.searchTests();
    break;
    default:
    break;
  }

}

hideList() {
  this.inventoryItems = [];
}
getItems() {
  const prods = this.products;
  this.curentItems = prods.filter(product => product.type === this.tableView);
  return this.curentItems;
}
selectDesc(name) {
  this.product.item.name = name;
  this.inventoryItems = [];
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
searchDesc() {
    if (this.product.item.name === '') {
      this.inventoryItems = [];
    } else {
        this.inventoryItems = this.inventoryItems.filter((item) => {
        const patern =  new RegExp('\^' + this.product.item.name  , 'i');
        return patern.test(this.product.item.name);
      });
  }
}
  addProducts() {
    this.processing = true;
    this.dataService.addProducts(this.temProducts, this.newItems)
    .subscribe((products: Product[]) => {
      this.processing = false;
      this.feedback = 'Product added successfully';
      this.curentItems = [...products, ...this.curentItems];
      this.clonedInventory = [...products, ...this.clonedInventory];
      this.socket.io.emit('store update', {action: 'new', changes: products});
      this.temProducts = [];
      setTimeout(() => {
        this.feedback = null;
  }, 4000);
   }, (e) => {
        this.errLine = 'Could not add products';
        this.processing = false;
  });

  }
  clearTemVariables() {
    this.editables = this.edited = [];
    this.product = new Product();
    this.errLine = null;
  }
  updateProducts() {
    this.processing = true;
    this.dataService.updateProducts(this.edited).subscribe(() => {
        this.edited.forEach(product => {
          const i  = this.curentItems.findIndex(pro => pro._id === product._id);
          this.curentItems[i] = product;
    });
    this.socket.io.emit('store update', {action: 'update', changes: this.edited});
    this.product = new Product();
    this.processing = false;
    this.edited = this.editables = [];
    this.feedback = 'Update succesfull';
    setTimeout(() => {
      this.feedback = null;
    }, 4000);
   }, (e) => {
      this.processing = false;
      this.feedback = 'Unable to update inventory';
    });
}
deleteProducts() {
  this.processing = true;
  const selections = this.curentItems.filter(p => p.selected);
  this.dataService.deleteProducts(selections).subscribe(() => {
      this.processing = false;
      this.feedback = 'Inventory succesffully updated';
      this.socket.io.emit('store update', {action: 'delete', changes: selections});
      this.curentItems = this.curentItems.filter(product => !product.selected);
      this.selections.forEach(product => {
      // this.clonedInventory = this.clonedInventory.filter(item => item._id !== product._id)
      });
   }, (e) => {
      this.processing = false;
      this.feedback = 'Unable to update inventory';
    });
  }
expired(expiry) {
  return Date.now() >= new Date(expiry).valueOf();
}

searchProducts(search: string) {
  if (search === '') {
    const i = this.clonedInventory;
    this.curentItems = i.filter(product => product.type === this.tableView);
  } else {
     this.curentItems = this.curentItems.filter((product) => {
     const patern =  new RegExp('\^' + search , 'i');
     return patern.test(product.item.name);
  });
}

}


}
