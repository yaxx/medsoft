import {Product} from './inventory.model';


export class Record {
  constructor(
    public complains: Complain[] = [],
    public famHist: FamHist[] = [],
    public notes: Note[] = new Array<Note>(),
    public vitals: Vitals = new Vitals(),
    public conditions: Condition[] = [],
    public allegies: Allegy[] = [],
    public devices: Device[] = [],
    public visits: Visit[] = [],
    public appointments: Appointment[] = [],
    public medications: any[] = [],
    public test: Test[] = [],
    public scans: Scan[] = [],
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
     public product: Product = new Product(),
     public priscription: Priscription = new Priscription(),
     public paid: boolean = false,
     public paused: boolean = false,
     public pausedOn: Date = null,
     public lastTaken: Date = null,
     public selected: boolean = false,
     public dateCreated: Date = new Date(),
     public purchased: number = 0,
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
  constructor(
    public _id?:string,
    public noteType?: string,
    public note: string = null,
    public noter: string = null,
    public dateCreated: Date = new Date()

     ) {}
  }
export class Bp {
  constructor(public value: number = null,
    public dateCreated: Date = new Date()) {}
}
export class Resp {
  constructor(public value: number = null,
    public dateCreated: Date = new Date()) {}
}
export class Pulse {
  constructor(public value: number = null,
    public dateCreated: Date = new Date()) {}
}
export class Temp {
  constructor(public value: number = null,
    public dateCreated: Date = new Date()) {}
}
export class Bg {
  constructor(public value: number = null,
    public dateCreated: Date = new Date()) {}
}
export class Height {
  constructor(public value: number = null,
    public dateCreated: Date = new Date()) {}
}
export class Weight {
  constructor(public value: number = null,
    public dateCreated: Date = new Date()) {}
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
    public by: any = null,
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
    public hospital?: any,
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
    public by?: any,
    public dateCreated?: Date

     ) {}
  }
export class Sugery {
  constructor(
    public sugery: string = null,
    public status: string = null,
    public result?: Object,
    public by?: any,
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

  export class Scan {
    constructor(
      public name?: string,
      public description?: string,
      public dateCreated: Date = new Date()
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
    public attended: boolean = false,
    public setBy: any = '5c31bb814384b736f4144979'
 ) {}

}