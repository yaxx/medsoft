
export class Item {
  constructor(
    public name: string = null,
    public brand: string = null,
    public category: string = null,
    public description: string = null,
    public mesure: number = null,
    public unit: string = null,
    public dateCreated: Date = new Date(),
    public _id?: string
    ) {}
}
export class StockInfo {
  constructor(
    public inStock: number = 0,
    public price: number = 0,
    public sold: number = 0,
    public expired: boolean = false,
    public status: boolean = false,
    public quantity: number = 0,
    public expiry: Date = null,
    public _id?: string
  ) {}
  }
export class Product {
  constructor(
    public item: Item = new Item(),
    public stockInfo: StockInfo = new StockInfo(),
    public selected?: boolean,
    public dateCreated: Date = new Date(),
    public _id?: string
    ) {}
}


