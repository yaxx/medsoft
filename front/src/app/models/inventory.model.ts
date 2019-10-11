
export class Meta {
  constructor(
  public addedBy: string = null,
  public selected: boolean = false,
  public dateAdded: Date = new Date()
  ){}
}
export class Item {
  constructor(
    public name: string = null,
    public type: string = null,
    public category: string = null,
    public description: string = null,
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
    public type?: String,
    public dateCreated: Date = new Date(),
    public _id?: string
    ) {}
}
export class Invoice {
  constructor(
    public name: string = null,
    public desc: string = null,
    public comfirmedBy: any = null,
    public price: number = null,
    public paid: boolean = false,
    public quantity: number = 1,
    public datePaid: Date = null,
    public meta: Meta = new Meta(),
    public processed: boolean = true,
    public _id?: string 
  ){}
}
export class Card {
  constructor(
    public category: string = 'Standard',
    public pin: string = null,
    public meta: Meta = new Meta()
    ) {}
  }

