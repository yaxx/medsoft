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
