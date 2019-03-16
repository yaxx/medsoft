
export class Product {
  constructor(
    public item: Item = new Item(),
    public stockInfo: StockInfo = new StockInfo(),
    public selected?: boolean,
    public addedOn?: Date,
    public _id?: string
    ) {}
}

export class Item {
  constructor(
    public name?: string,
    public brand?: string,
    public category?: string,
    public description?: string,
    public mesure?: number,
    public unit?: string,
    public dateCreated?: Date,
    public _id?: string
    ) {}
}
export class StockInfo {
  constructor(
    public _id?: string,
    public price: number = null,
    public sold: number = 0,
    public expired: boolean = false,
    public status: boolean = false,
    public quantity: number = null,
    public expiry: Date = null
  ) {}
  }
