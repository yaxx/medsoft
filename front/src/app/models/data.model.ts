
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
export class DeathNote {
  constructor(public diagnosis: string = null,
  public cause: string = null,
  public owings: number = 0,
  public isPostM: boolean = false,
  public releasable: boolean = false,
  public releasedTo: string = null,
  public relationship: string = null,
  public diedOn: Date = new Date(),
  public comfirmedBy?: Person) {}

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

export class Product {
  constructor(
    public item: Item = new Item(),
    public stockInfo: StockInfo = new StockInfo(),
    public selected?: boolean,
    public addedOn?: Date,
    public _id?: string
    ) {}
}

export class Priscription {
  constructor(
    public intake = null,
    public freq: string= null,
    public piriod: number = null,
    public extend: string = null
  ) {}
}
export class Medication {
  constructor(
     public product: Product = new Product(),
     public priscription: Priscription = new Priscription(),
     public paid: boolean = false,
     public paused: boolean = false,
     public pausedOn: Date = null,
     public lastTaken: Date = null,
     public selected: boolean = false,
     public dateAdded: Date = new Date(),
     public by: any =  null,
     public _id?: string
     ) {}
}
export class Complain {
  constructor(
    public complain: string = null,
    public dateCreated: Date = new Date()
     ) {}
  }
export class FamHist {
  constructor(public condition: string = null,
           public dateCreated?: Date
     ) {}
  }
export class Note {
  constructor(public note?: string,
    public noter: string = '5befe0aa05ca551d50fd2bf8',
    public noteType?: string,
    public full: boolean = false,
    public person?: Person,
    public dateCreated?: Date

     ) {}
  }
export class Bp {
  constructor(public value: number = null, dateCreated?: Date) {}
}
export class Resp {
  constructor(public value: number = null, dateCreated?: Date) {}
}
export class Pulse {
  constructor(public value: number = null, dateCreated?: Date) {}
}
export class Temp {
  constructor(public value: number = null, dateCreated?: Date) {}
}
export class Bg {
  constructor(public value: number = null, dateCreated?: Date) {}
}
export class Height {
  constructor(public value: number = null, dateCreated?: Date) {}
}
export class Weight {
  constructor(public value: number = null, dateCreated?: Date) {}
}

export class Vital {
  constructor(public bp: Bp= new Bp(),
    public resp: Resp = new Resp(),
    public pulse: Pulse = new Pulse(),
    public bloodGl: Bg = new Bg(),
    public tempreture: Temp = new Temp(),
    public height: Height = new Height(),
    public weight: Weight = new Weight()

     ) {}
  }
export class Condition {
  constructor( public condition: string = null,
    public order: string  = null,
    public certainty: string = null,
    public by?: Person,
    public dateCreated?: Date
     ) {}
  }
export class Allegy {
  constructor( public allegy: string = null,
    public dateCreated?: Date
     ) {}
  }
export class Device {
  constructor( public device: string = null,
    public dateCreated?: Date
     ) {}
  }
export class Visit {
  constructor(
    public _id?: string,
    public dept: string = 'GOPD',
    public status: string = 'queued',
    public visitedOn: Date = new Date(),
    public addmittedOn: Date = null,
    public dischargedOn: Date = null,
    public diedOn: Date = null,
    public wardNo: number = null,
    public bedNo:  number = null
     ) {}
  }
export class Test {
  constructor(
    public type: string = null,
    public status: string = null,
    public result?: Object,
    public by?: Person,
    public dateCreated?: Date

     ) {}
  }
export class Sugery {
  constructor(
    public sugery: string = null,
    public status: string = null,
    public result?: Object,
    public by?: Person,
    public dateCreated?: Date

     ) {}
  }
export class Scan {
  constructor( public fileType: string = null,
    public name: string = null,
    public dateCreated?: Date

     ) {}
  }

export class Session {
  constructor(
    public complains: Complain = new Complain(),
    public famHist: FamHist = new FamHist(),
    public notes: Note = new Note(),
    public vital: Vital = new Vital(),
    public conditions: Condition = new Condition(),
    public allegies: Allegy = new Allegy(),
    public devices: Device = new Device(),
    public visits: Visit = new Visit(),
    public medications: Medication[] = new Array<Medication>(),
    public test: Test = new Test(),
    public scan: Scan = new Scan(),
    // public sugery: Sugery = new Surgery(),
    public deathNote: DeathNote = new DeathNote()

     ) {}
  }
export class Vitals {
  constructor(
    public bp: Bp[] = new Array<Bp>(),
    public resp: Resp[] = new Array<Resp>(),
    public pulse: Pulse[] = new Array<Pulse>(),
    public bloodGl: Bg[] = new Array<Bg>(),
    public tempreture: Temp[] = new Array<Temp>(),
    public height: Height[] = new Array<Height>(),
    public weight: Weight[] = new Array<Weight>()

  ) {}
}

export class Record {
  constructor(
    public complains: Complain[] = new Array<Complain>(),
    public famHist: FamHist[] = new Array<FamHist>(),
    public notes: Note[] = new Array<Note>(),
    public vitals: Vitals = new Vitals(),
    public conditions: Condition[] = new Array<Condition>(),
    public allegies: Allegy[] = new Array<Allegy>(),
    public devices: Device[] = new Array<Device>(),
    public visits: Visit[] = new Array<Visit>(new Visit()),
    public medications: any[] = new Array<any>(new Array<Medication>()),
    public test: Test[] = new Array<Test>(),
    public scan: Scan[] = new Array<Scan>(),
    public sugery: any[] = [],
    public deathNote: DeathNote = new DeathNote()
     ) {}
  }
  export class Connection {
    constructor(
      public person: string,
      public following: boolean,
      public follower: boolean,
      public blocked: boolean,
      public conversations: Message[] = new Array<Message>()
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

  export class Message {
    constructor(
      public message: string = null,
      public sender: any = null,
      public reciever: any = null,
      public delivered: boolean = false,
      public read: boolean = false,
      public sendOn: Date = new Date()
    ) {}
  }

  export class Connections {
    constructor(
      public _id?: string,
      public people: Connection[] = new Array<Connection>(),
      public notifications: Notification[] = new Array<Notification>()
    ) {}

  }

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


export class Info {
  constructor(
    public lastLogin: Date = new Date(),
    public online: boolean = true,
    public status: boolean = null,
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

  export class Bed {
    constructor(
      public _id?: string,
      public numb: number = null,
      public status: Boolean = false
      ) {}
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
export class Main {
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

export class Client {
  constructor(
    public _id?: string,
    public info: Main = new Main(),
    public departments: Department[] = [],
    public staffs: Person[] = [],
    public inventory: Product[] = [],
    public dateCreated:Date = new Date()
    ) {
  }
}





