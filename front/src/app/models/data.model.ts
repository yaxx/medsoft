
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
    public status?: string,
    public dateCreated?: Date,
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

    public expiry?: Date,
    public price?: number,
    public sold?: number,
    public expired?: boolean ,
    public status?: boolean,
    public quantity?: number

    ) {}
  }

export class Product {
  constructor(public item?: Item, public stockInfo?: StockInfo, public selected?: boolean, public addedOn?: Date, public _id?: string) {}
}

export class Priscription {
  constructor(
    public intake = null,
    public freq: string= null,
    public piriod: number = null,
    public extend: string = null,
    public takenOn: Date = null

  ) {}
}
export class Medication {
  constructor(  public product?: Product, public priscription?: Priscription,
     public _id?: string,
     public paid?: boolean,
     public paused?: boolean,
     public pausedOn?: Date,
     public lastTaken?: Date,
     public priscribedOn?: Date,
     public by?: Staff,
     public selected?: boolean
     ) {}
}
export class Complain {
  constructor(public complain: string = null,
           public dateCreated?: Date
     ) {}
  }
export class FamHist {
  constructor(public condition: string = null,
           public dateCreated?: Date
     ) {}
  }
export class Note {
  constructor(public note?: string,
    public noter: string = '5bd40352de1ff71ed4552414',
    public noteType?: string,
    public full: boolean =false,
    public staff?: Staff,
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
  constructor(public bp?: Bp,
    public resp?: Resp,
    public pulse?: Pulse,
    public bloodGl?: Bg,
    public tempreture?: Temp,
    public height?: Height,
    public weight?: Weight

     ) {}
  }
export class Condition {
  constructor( public condition: string = null,
    public order: string  = null,
    public certainty: string = null,
    public by?: Staff,
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
  constructor( public dept: string = 'Consultation',
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
  constructor( public type: string = null,
    public status: string = null,
    public result?: Object,
    public by?: Staff,
    public dateCreated?: Date

     ) {}
  }
export class Sugery {
  constructor( public sugery: string = null,
    public status: string = null,
    public result?: Object,
    public by?: Staff,
    public dateCreated?: Date

     ) {}
  }
export class File {
  constructor( public fileType: string = null,
    public name: string = null,
    public dateCreated?: Date

     ) {}
  }

export class Record {
  constructor(
    public complains: Complain = null,
    public famHist: FamHist = null,
    public notes: Note = null,
    public vitals: Vital = null ,
    public conditions: Condition = null,
    public allegies: Allegy = null,
    public devices: Device = null,
    public visits: Visit = null,
    public medications: Medication[] = [],
    public test: Test = null,
    public sugery: Sugery = null,
    public files: File = null,
    public deathNote: DeathNote = null,
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





