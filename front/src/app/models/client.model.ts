import {Product} from './inventory.model';
import {Person} from './person.model';

export class Bed {
  constructor(
    public number: number  = null,
    public allocated: boolean = false,
    public dateCreated: Date = new Date() ) {}
}
export class Room {
  constructor(public _id?: string,
    public name: string = null,
    public number: Number = null,
    public beds: Bed[] = [],
    public dateCreated: Date = new Date() ) {}
}

export class Department {
  constructor(
    public name: string = null,
    public type: string = null,
    public hasWard: boolean = false,
    public rooms: Room[] = [],
    public description: string = null,
    public dateCreated: Date = new Date() ) {}
}
export class Info {
  constructor(public name: string = null,
    public mobile: string = null,
    public email: string = null,
    public state: string = null,
    public city: string= null,
    public zipcode: string = null,
    public expiry: Date = null,
    public ownership: string = null,
    public specialization: string = null,
    public category: string = null,
    public password: string = null,
    public comfirm: string = null,
    public address: string = null
      
   ) {}
}
export class Client {
  constructor(
    public _id?: string,
    public info: Info = new Info(),
    public departments: Department[] = [],
    public staffs: Person[] = [],
    public inventory: Product[] = [],
    
    ) {
  }
}