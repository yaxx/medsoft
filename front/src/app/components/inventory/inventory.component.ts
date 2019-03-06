import { Component, OnInit, OnDestroy} from '@angular/core';
import {DataService} from '../../services/data.service';
import {Product, Item, StockInfo} from '../../models/data.model';
import { sortBy } from 'sort-by-typescript';
import {SocketService} from '../../services/socket.service';
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
  editables: Product[] = new Array<Product>();
  edited: Product[] = new Array<Product>();
  selections: number[] = new Array<number>();
  input = '';
  sortBy = 'added';
  view = 'products';
  mode = '';
  count = 0;


     constructor(private dataService: DataService, private socket: SocketService) {
   }

  ngOnInit() {
    this.getItems();
    this.getProducts();
    this.socket.io.on('purchase', items => {
      items.forEach(i => {
        this.products.forEach(prod => {
          if(prod.item._id === i.product.item._id) {
              prod.stockInfo.quantity = prod.stockInfo.quantity - i.purchased;
              prod.stockInfo.sold = prod.stockInfo.sold + i.purchased;
              } else {
     
              }
            });
          });
     
    })
    this.socket.io.on('refund', items => {
      items.forEach(i => {
        this.products.forEach(prod => {
          if(prod.item._id === i.product.item._id) {
              prod.stockInfo.quantity = prod.stockInfo.quantity + i.purchased;
              prod.stockInfo.sold = prod.stockInfo.sold - i.purchased;
              } else {
     
              }
            });
          });
     
    })
  }
  switchMode(mode) {
   this.mode = mode;
  }
  switchToEdit() {
    this.product = this.products.filter((pr) => pr.selected)[0];
    this.input = this.product.item.name + ' ' + this.product.item.mesure + this.product.item.unit;
    this.mode = 'edit';

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
  addMore() {
    this.temProducts.push(this.product);
    this.input = '';
    this.item = new Item();
    this.product = new Product();
  }
  addProducts() {
    this.dataService.addProduct(this.temProducts)
    .subscribe((products: Product[]) => {
      this.products = products;
      this.temProducts = new Array<Product>();

   });

  }
  addSelection(i: Item) {
    this.input = i.name + ' ' + i.mesure + i.unit;
    this.product.item = i;
    this.temItems = new Array<Item>();
    // const temp: Product[] = this.products.filter((p) => p.item._id === i._id);
    // if (temp.length) {
    //   this.product = temp[0];
    // } else {
    //   this.product = new Product(i);
    // }
   }



  // selectItem(i: Item) {
  //   this.product.item = i;
  //   this.input = i.name + ' ' + i.mesure + i.unit;
  //   this.temItems = new Array<Item>();
  // }

  selectProduct(i) {
    this.products[i].selected = this.products[i].selected ? false : true;
    }
  pickSelection() {
    this.mode = 'edit';
    this.editables = this.products.slice().filter((p) => p.selected);
    this.count = this.editables.length;
    this.product = {...this.editables.shift()};
    this.input = this.product.item.name + ' ' + this.product.item.mesure + this.product.item.unit;
  }
  next() {
    if (this.product.addedOn) {
        if (this.item.name) {
          this.product.item = this.item;
          this.edited.unshift(this.product);
          this.item = new Item();
          // this.counter = this.counter + 1;
        } else {
          this.edited.unshift(this.product);
          // this.counter = this.counter + 1;
        }
        if (this.editables.length) {
          this.product = this.editables.shift();
          this.input = this.product.item.name + ' ' + this.product.item.mesure + this.product.item.unit;
        } else {
          this.product = new Product();
          this.input = '';
        }

    } else {

    }

  }
  previous() {
    if (!this.edited.length) {

    } else {
      if (this.item.name) {
        this.product.item = this.item;
        this.temProducts.unshift(this.product);
        this.item = new Item();
      } else {
        this.temProducts.unshift(this.product);
      }
      this.product = this.edited.shift();
      this.input = this.product.item.name + ' ' + this.product.item.mesure + this.product.item.unit;

    }

  }
  selectionOccure() {
    return this.products.some((product) => product.selected);
  }
  dropSelection(p: Product) {
    this.mode = 'add';
    this.temProducts = this.temProducts.filter(product => product.item._id !== p.item._id);
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
    if (this.mode === 'add') {
      this.updateProducts(this.temProducts);
      this.temProducts = new Array<Product>();
        } else if (this.mode === 'edit') {
       this.updateProducts(this.products.filter(p => !p.selected).concat(this.edited));
       this.editables = new Array<Product>();
       this.edited = new Array<Product>();
    } else {
        this.updateProducts(this.products.filter((p) => !p.selected));
    }
  }
  updateProducts(update: Product[]) {
    this.dataService.updateProducts(update)
    .subscribe((products: Product[]) => {
      this.products = products;
      this.product = new Product(new Item(), new StockInfo());
      this.input = '';
      this.mode = '';
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
