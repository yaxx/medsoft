import {Product} from './inventory.model';
import {Person} from './person.model';


export class Client {
  constructor(
    public _id?: string,
    public info: Info = new Info(),
    public departments: Department[] = [],
    public staffs: Person[] = [],
    public inventory: Product[] = [],
    public dateCreated:Date = new Date()
    ) {
  }
}
export class Department {
  constructor(public _id?: string,
    public name: string = null,
    public type: string = null,
    public hasWard: boolean = false,
    public numOfBeds: number = null,
    public beds?: Boolean[],
    public description: string = null,
    public dateCreated: Date = new Date() ) {}
}
export class Info {
  constructor(public name: string = null,
      public mobile: string = null,
      public email: string = null,
      public pwd: string= null,
      public comfirm: string = null,
      public state: string= null,
      public lga: string= null,
      public zipcode: string = null,
      public expiry: Date = null,
      public accType: string = null,
      public ownership: string = null,
      public specialization: string= null,
      public category: string = null,
      public address: string = null,
   ) {}
}