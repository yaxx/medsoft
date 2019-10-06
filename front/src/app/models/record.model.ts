import {Product, StockInfo, Item, Invoice, Meta, Card} from './inventory.model';




export class Record {
  constructor(
    public complains: any[] = [],
    public famHist: FamHist[] = [],
    public notes: Note[] = [],
    public vitals: Vitals = new Vitals(),
    public conditions: any[] = [],
    public allegies: Allegy[] = [],
    public devices: Device[] = [],
    public visits: any[] = [],
    public invoices: Invoice[][] = new Array<Invoice[]>(),
    public cards: Card[] = [],
    public appointments: Appointment[] = [],
    public medications: any[] = [],
    public tests: any[] = [],
    public scans: any = [],
    public sugery: any[] = [],
    public deathNote: DeathNote = new DeathNote()
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

 export class Bed {
    constructor(
      public _id?: string,
      public number: number = null,
      public status: Boolean = false
      ) {}
}
export class Medication {
  constructor(
     public name: string = null,
     public meta: Meta = new Meta(),
     public priscription: Priscription = new Priscription(),
     public paused: boolean = false,
     public pausedOn: Date = null,
     public lastTaken: Date = null,
     public _id?: string
     ) {}
}
export class Complain {
  constructor(
    public complain: string = null,
    public meta: Meta = new Meta(),
    public duration: number = null
     ) {}
  }
export class FamHist {
  constructor(
    public condition: string = null,
    public meta: Meta = new Meta()
     ) {}
  }
export class Note {
  constructor(
    public _id?: string,
    public type?: string,
    public note: string = null,
    public meta: Meta = new Meta()
     ) {}
  }

export class Bp {
  constructor(
    public value: number = null,
    public meta: Meta = new Meta()
    ) {}
}
export class Resp {
  constructor(
    public value: number = null,
    public meta: Meta = new Meta()
    ) {}
}
export class Pulse {
  constructor(
    public value: number = null,
    public meta: Meta = new Meta()
    ) {}
}
export class Temp {
  constructor(
    public value: number = null,
    public meta: Meta = new Meta()) {}
}
export class Bg {
  constructor(
    public value: number = null,
    public meta: Meta = new Meta()
    ) {}
}
export class Height {
  constructor(
    public value: number = null,
    public meta: Meta = new Meta()
    ) {}
}
export class Weight {
  constructor(
    public value: number = null,
    public meta: Meta = new Meta()
   ) {}
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
  constructor(
    public condition: string = null,
    public meta: Meta = new Meta()
     ) {}
  }
export class Allegy {
  constructor(
    public allegy: string = null,
    public meta: Meta = new Meta()
     ) {}
  }
export class Device {
  constructor(
    public device: string = null,
    public meta: Meta = new Meta()
     ) {}
  }
export class Visit {
  constructor(
    public hospital?: any,
    public dept: string = 'GOPD',
    public status: string = null,
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
    public name: string = null,
    public meta: Meta = new Meta(),
    public status: string = null,
    public verified: boolean = false,
    public verifiedBy: string = null,
    public dateVerified: Date = null
     ) {}
  }

export class Surgery {
  constructor(
    public name: string = null,
    public meta: Meta = new Meta(),
    public status: string = null,
    public result?: Object,
     ) {}
  }
export class Vitals {
  constructor(
    public bp: Bp[] = [],
    public resp: Resp[] = [],
    public pulse: Pulse[] = [],
    public bloodGl: Bg[] = [],
    public tempreture: Temp[] = [],
    public height: Height[] = [],
    public weight: Weight[] = []
  ) {}
}

export class Scan {
constructor(
  public name: string = null,
  public bodyPart: string = null,
  public meta: Meta = new Meta(),
){}
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
  public comfirmedBy: any = null) {}

}
export class Appointment {
  constructor(
    public title: string = null,
    public setOn: Date = new Date(),
    public time: string = null,
    public date: string = null,
    public attended: boolean = false,
    public meta: Meta = new Meta()
 ) {}

}
export class Session {
  constructor(
    public famHist: FamHist = new FamHist(),
    public note: Note = new Note(),
    public appointment: Appointment = new Appointment(),
    public complain: Complain = new Complain(),
    public condition: Condition = new Condition(),
    public medication: Medication = new Medication(),
    public vital: Vital = new Vital(),
    public allegies: Allegy = new Allegy(),
    public devices: Device = new Device(),
    public visits: Visit = new Visit(),
    public reqItem: Item = new Item(),
    public reqItems: any = [],
    public newItems: any = [],
    public conditions: Condition[] = [],
    public complains: Complain[] = [],
    public items: Item[] = [],
    public medications: Medication[] = [],
    public tests: Test[] = [],
    public desc: string[] = [],
    public surgeries: Surgery[] = [],
    public scans: Scan[] = [],
    public invoices: Invoice[] = [],
    public medInvoices: Invoice[] = [],
    public deathNote: DeathNote = new DeathNote()

     ) {}
  }
