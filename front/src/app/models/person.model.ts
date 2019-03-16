import {Record} from './record.model';
import {Message} from './message.model';


export class Person {
    constructor(
      public _id?: string,
      public info: Info = new Info(),
      public connections: any = null,
      public record: Record = new Record(),
      public dateCreated: Date = new Date(),
      public card?: any
      ) {}
  }
export class Connection {
    constructor(
      public person?: string,
      public following?: boolean,
      public follower?: boolean,
      public blocked?: boolean,
      public conversations?: Message[]
      ) {}

  }
 
  export class Notification {
    constructor(
      public person: string = null,
      public noteType: string = null,
      public header: string = null,
      public sendOn: Date = new Date()
      ) {}

  } 
export class Info {
  constructor(
    public lastLogin: Date = new Date(),
    public online: boolean = true,
    public status: string = null,
    public personal: Personal = new Personal(),
    public official: Official = new Official(),
    public contact: Contact = new Contact(),
    public insurance: Insurance = new Insurance(),
    public _id?: string
    ) {}
  }

  export class Official {
    constructor(
      public hospId: string = null,
      public staffId: string = null,
      public department:string = null,
      public role:string = null
      ) {}
  }
  
  export class Connections {
    constructor(
      public _id?: string,
      public people: Connection[] = new Array<Connection>(),
      public notifications: Notification[] = new Array<Notification>()
    ) {}

  }

  
export class Personal {
  constructor( public hopitals:any[] = [],
    public hospNum: string[] = [],
    public firstName: string = null,
    public lastName: string = null,
    public username: string = null,
    public password: string = null,
    public gender: string = null,
    public bio: string = null,
    public dob: Date = null,
    public occupation: string = null,
    public tribe: string = null,
    public religion: string = null,
    public mstatus: string = null,
    public cardType: string = null,
    public cardNum: number = null,
    public dpUrl: string = 'user.jpg',
    public coverUrl: string = null
     ) {}
}
export class Contact {
  constructor(public mobile: number = null,
    public email: string = null,
    public state: string = null,
    public lga: string =  null,
    public address: string = null,
    public emgName: string = null,
    public emgMobile: number = null,
    public emgEmail: string = null,
    public emgRel: string = null,
    public emgOccupation: string = null) {}
}
export class Insurance {
  constructor(public name: string = null,
    public mobile: number = null ,
    public rel: string = null,
    public employer: string = null,
    public ssn: string = null ) {}

}