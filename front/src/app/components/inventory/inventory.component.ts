import { Component, OnInit, OnDestroy} from '@angular/core';
import {DataService} from '../../services/data.service';
import {Product, Item, StockInfo} from '../../models/inventory.model';
import {Person} from '../../models/person.model';
import {CookieService } from 'ngx-cookie-service';
import { sortBy } from 'sort-by-typescript';
import {SocketService} from '../../services/socket.service';
import SimpleBar from 'SimpleBar';
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
  loading = false;
  processing = false;
  message = null;
  transMsg = null;
  sortBy = 'added';
  view = 'products';
  searchTerm = '';
  mode = '';
  count = 0;


     constructor(private dataService: DataService, private cookies: CookieService, private socket: SocketService) {
   }

  ngOnInit() {
    // new SimpleBar(document.getElementById('myElement'))
    // this.getItems();
    this.getProducts();
    this.socket.io.on('purchase', items => {
      items.forEach(i => {
        this.products.forEach(prod => {
          if(prod.item._id === i.product.item._id) {
              prod.stockInfo.inStock = prod.stockInfo.inStock - i.purchased;
              prod.stockInfo.sold = prod.stockInfo.sold + i.purchased;
              }
            });
        });
    })
    this.socket.io.on('refund', refund => {
        this.products.forEach(prod => {
          console.log(refund)
          if(prod.item._id === refund.product.item._id) {
              prod.stockInfo.inStock = prod.stockInfo.inStock + refund.purchased;
              prod.stockInfo.sold = prod.stockInfo.sold - refund.purchased;
              }
            });
         
    })
  }
  switchMode(mode) {
   this.mode = mode;
  }
  switchToEdit() {
    this.product = this.products.filter((p) => p.selected)[0];
    this.input = this.product.item.name + ' ' + this.product.item.mesure + this.product.item.unit;
    this.mode = 'edit';
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
      this.items = res.items;
      if(res.inventory.length) {
        this.products = res.inventory;
      this.dataService.setCachedProducts(res.inventory);
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
   if( this.product.item.name) {
        this.temProducts.unshift(this.product);
   } else {
      this.product.item.name = this.input;
        this.temProducts.unshift(this.product);
   }
    this.input = '';
    this.item = new Item();
    this.product = new Product();
  }
  addProducts() {
    this.processing = true;
    this.dataService.addProduct(this.temProducts)
    .subscribe((products: Product[]) => {
      this.processing = false;
      this.transMsg = 'Product added successfully'
      this.products = products;
      this.dataService.setCachedProducts(this.products);
      this.temProducts = [];
      setTimeout(() => {
        this.transMsg = null;
  }, 4000);
   }, (e) => {
    this.transMsg = 'Could not add products';
    this.processing = false;
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

  selectProduct(i) {
    this.products[i].selected = this.products[i].selected ? false : true;
    }
  pickSelection() {
    this.mode = 'edit';
    this.editables = this.products.filter(p => p.selected);
    this.count = this.editables.length;
    this.product = {...this.editables.shift()};
    this.input = this.product.item.name + ' ' + this.product.item.mesure + this.product.item.unit;
  }
  next() {
    if (this.product.dateCreated) {
        if (this.item.name) {
          this.product.item = this.item;
          this.edited.unshift(this.product);
          this.item = new Item();
        } else {
          this.edited.unshift(this.product);
        }
        if (this.editables.length) {
          this.product = this.editables.shift();
          this.input = this.product.item.name + ' ' + this.product.item.mesure + this.product.item.unit;
        } else {
          this.product = new Product();
          this.input = '';
        }

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

  searchItems (i) {
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


searchProducts(search: string) {
  if (search === ''){
    this.products = this.dataService.getCachedProducts();
    console.log(this.dataService.getCachedProducts())
  } else {
     this.products = this.products.filter((product) => {
     let patern =  new RegExp('\^' + search , 'i');
     return patern.test(product.item.name);
  });
  }


}


}
