
export class Personal {
  constructor( public hosId?: number[],
    public firstName: string = null,
    public lastName: string = null,
    public gender: string = null,
    public dob: Date = null,
    public occupation: string = null,
    public tribe: string = null,
    public religion: string = null,
    public mstatus: string = null,
    public cardType: string = null,
    public cardNum: number = null,
    public dpUrl: string = 'user.jpg',
    public curentStatus: string = 'queued',
    public createdBy?: Staff
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
  public comfirmedBy?: Staff) {}

}

export class Patient {
  constructor(public personal?: Personal,
    public contact?: Contact,
    public insurance?: Insurance,
    public record?: Record,
    public dateCreated: Date = new Date()

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
    public dateCreated?: Date
    ) {}
  }
export class StockInfo {
  constructor(
    public expiry?: Date,
    public price?: number,
    public expired?: boolean ,
    public status?: boolean,
    public quantity?: number,
    ) {}
  }

export class Product {
  constructor(public item?: Item, public stockInfo?: StockInfo) {}
}

export class Priscription {
  constructor(
    public intake?: number,
    public freq?: string,
    public piriod?: number,
    public extend?: number,
    public paid?: boolean,
    public takenOn?: Date,
    public paused?: boolean,
    public pausedOn?: Date,
    public priscribedOn?: Date,
    public by?: Staff
  ) {}
}
export class Medication {
  constructor(  public product?: Product, public priscribtion?: Priscription) {}
}
export class Complain {
  constructor(public issue: string = null,
           public dateCreated?: Date
     ) {}
  }
export class FamHist {
  constructor(public condition: string = null,
           public dateCreated?: Date
     ) {}
  }
export class Note {
  constructor(public noter: string = null,
    public type: string = null,
    public staff?: Staff,
    public dateCreated?: Date

     ) {}
  }
export class Vital {
  constructor(public bp?: {value: string, dateCreated?: Date},
    public resp?: {value: string, dateCreated?: Date},
    public pulse?: {value: string, dateCreated?: Date},
    public bloodGl?: {value: string, dateCreated?: Date},
    public tempreture?: {value: string, dateCreated?: Date},
    public height?: {value: string, dateCreated?: Date},
    public weight?: {value: string, dateCreated?: Date}

     ) {}
  }
export class Condition {
  constructor( public type: string = null,
    public order: string  = null,
    public certainty: string = null,
    public by?: Staff,
    public dateCreated?: Date
     ) {}
  }
export class Allegy {
  constructor( public type: string = null,
    public dateCreated?: Date
     ) {}
  }
export class Device {
  constructor( public type: string = null,
    public dateCreated?: Date
     ) {}
  }
export class Visit {
  constructor( public dept: string = 'Consultation',
    public status: string = 'queued',
    public visitedOn: Date = new Date(),
    public addmittedOn: Date,
    public dischargedOn?: Date,
    public diedOn?: Date,
    public wardNo?: number,
    public bedNo?:  number
     ) {}
  }
export class Test {
  constructor( public type: string = null,
    public status: string = null,
    public result?: Object,
    public by?: Staff,
    public dateCreated?: Date

     ) {}
  }
export class Sugery {
  constructor( public type: string = null,
    public status: string = null,
    public result?: Object,
    public by?: Staff,
    public dateCreated?: Date

     ) {}
  }
export class File {
  constructor( public type: string = null,
    public name: string = null,
    public dateCreated?: Date

     ) {}
  }

export class Record {
  constructor(
    public complains?: Complain,
    public famHist?: FamHist,
    public notes?: Note,
    public vitals?: Vital,
    public conditions?: Condition,
    public allegies?: Allegy,
    public devices?: Device,
    public visits?: Visit,
    public medication?: Medication,
    public test?: Test,
    public sugery?: Sugery,
    public files?: File,
    public deathNote?: DeathNote,
    public dateCreated: Date= new Date()


     ) {}
  }


export class Department {
  constructor(public name: string = null,
    public description: string = null,
    public selected: Boolean = false,
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
      public ownership: string = null,
      public specialization: string= null,
      public category: string = null,
      public address: string = null,
      public dateCreated?: Date) {}
}
export class Staff {
  constructor(public firstName: string = null,
      public lastName: string = null,
      public hosId: string = null,
      public staffId: string = null,
      public mobile: string = null,
      public email: string = null,
      public department: string = null,
      public role: string = null,
      public username: string = null,
      public password: string= null,
      public dpUrl?: string,
      public status?: string,
      public dateCreated?: Date

     ) {}
  }
export class Setting {
  constructor(public main?: Main, public department?: Department[], public staffs?: Staff[]) {
  }
}





