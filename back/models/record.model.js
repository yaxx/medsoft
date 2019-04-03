import mongoose from '../db';
const Scheema = mongoose.Schema;
const RecordScheema = new Scheema({
        complains:[{
            complain:String,
            dateCreated: Date
        }],
        famHist:[{
             condition:String,
             dateCreated: Date
            }],
        notes: [{
            note:String,
            noteType:String,
            noter:{
                type: Scheema.Types.ObjectId,
                 ref: 'Staff'
                },
            dateCreated:{
                type:Date,
                default:Date.now()
            }
        }],
        vitals: {
            bp: [{
                value: Number,
                dateCreated: Date
            }],
            resp: [{
                value: Number,
                dateCreated: Date
            }],
            pulse: [{
                value: Number,
                dateCreated: Date
            }],
            height: [{
                value: Number,
                dateCreated: Date
            }],
            weight: [{
                value: Number,
                dateCreated: Date
            }],
            tempreture: [{
                value: Number,
                dateCreated: Date
                 
            }],
            bloodGl: [{
                value: Number,
                dateCreated: Date
            }]
        },
        conditions:[{
            condition:String,
            oreder:String,
            certainty: String,
            diagnosedBy: {
                type: Scheema.Types.ObjectId, 
                ref: 'Person'
            }
            dateCreated: Date
        }],
        allegies:[
            {
                allegy:String,
                dateCreated: Date
            }
        ],
  
        visits: [{
            hospital: {
                type: Scheema.Types.ObjectId,
                ref: 'Person'
            }
            dept:String,
            status:String,
            visitedOn: {type:Date, default: Date.now()},
            dischargedOn:Date,
            diedOn: Date,
            wardNo: Number,
            bedNo: Number
        }],
        appointments: [{
            title: String,
            setOn:Date,
            time:String,
            attended: Boolean,
            setBy: {
                type: Scheema.Types.ObjectId,
                ref: 'Person'
            }
            
        }],
        medications:[
            [
                {
                    product:{
                        item:{
                            _id: String,
                            name: String,
                            brand: String,
                            category: String,
                            description: String,
                            mesure: Number,
                            unit: String,
                            dateCreated: Date
                        },
                        stockInfo:{
                            expiry: Date,
                            price: Number,
                            sold: Number,
                            expired: Boolean,
                            status: Boolean,
                            quantity: Number
                        },
                        selected:Boolean,
                        dateCreated: Date
                    },
                    priscription:{
                        intake: Number,
                        freq: String,
                        piriod: Number,
                        extend: String,
                        priscribedOn: {type:Date, default:Date.now},
                        
                    },
                    paid: {type:Boolean, Default:false},
                    lastTaken: Date,
                    paused: {type:Boolean, Default:false},
                    pausedOn :Date,
                  
                   dateCreated: Date,
                    purchased: Number,
                    by: {
                            type: Scheema.Types.ObjectId,
                            ref: 'Person'
                        }
                  
                }
            ]
        ],
   
   scans: [{
       name: String,
       description: String,
       dateCreated: Date 
   }],
   Test:[],
   surgeries:[],
   dateCreated: Date
})


const Record = mongoose.model('Record', RecordScheema)
export default Record;