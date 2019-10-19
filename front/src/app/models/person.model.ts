import {Record} from './record.model';
import {Message} from './message.model';
  export class Notification {
    constructor(
      public person: string = null,
      public noteType: string = null,
      public header: string = null,
      public sendOn: Date = new Date()
    ) {}

  } 
  export class Official {
    constructor(
      public _id?: string,
      public hospital: any = null,
      public id: string = null,
      public department: string = null,
      public role: string = null,
      public dateCreated = new Date()
    ) {}
  }
  export class Connection {
    constructor(
      public person: any = null,
      public following: boolean = false,
      public follower: boolean = false,
      public blocked: boolean = false,
      public dateCreated: Date = new Date(),
      public lastChated: Date = new Date(),
      public messages: any[] = []
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
  constructor(
    public firstName: string = null,
    public lastName: string = null,
    public username: string = null,
    public password: string = null,
    public gender: string = 'Male',
    public bio: string = null,
    public dob: Date = null,
    public occupation: string = 'Entreprenure',
    public tribe: string = null,
    public religion: string = 'Islam',
    public mstatus: string = 'Single',
    public cardType: string = null,
    public cardNum: string = null,
    public avatar: string = 'avatar.jpg'
     ) {}
}
export class Me {
  constructor (
    public mobile: number = null,
    public email: string = null,
    public address: string = null,
    public kinName: string = null,
    public kinMobile: string = null,
    public state: string = null,
    public lga: string =  null
  ) {}
}

export class Emergency {
  constructor(
    public name: string =  null,
    public mobile: number = null,
    public email: string = null,
    public address: string = null,
    public occupation: string = null,
    public rel: string = null
  ) {}
}

export class Contact {
  constructor(
    public me: Me = new Me(),
    public emergency: Emergency = new Emergency()
  ) {}
}
export class Insurance {
  constructor(
    public name: string = null,
    public mobile: number = null,
    public rel: string = null,
    public idNo: string = null,
    public groupNo: string = null,
    public subscriber: string = null,
    public employer: string = null,
    public ssn: string = null 
    ) {}
}
export class Info {
  constructor(
    public _id?: string,
    public personal: Personal = new Personal(),
    public official: Official = new Official(),
    public contact: Contact = new Contact(),
    public insurance: Insurance = new Insurance(),
    public lastLogin: Date = new Date(),
    public online: boolean = true
  ) {}
}


export class Person {
  constructor(
    public _id?: string,
    public info: Info = new Info(),
    public connections: any   = null,
    public record: Record = new Record(), 
    public createdAt?: Date,
    public modifiedAt?: Date,
    public card?: any
    ) {}
}