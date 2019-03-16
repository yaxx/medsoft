
import mongoose from '../db';
var Scheema = mongoose.Schema
var personScheema = new Scheema({
    info: {
        status:String,
        online: Boolean,
        lastLogin: {type: Date, Default: Date.now()},
        personal:{
            firstName: String,
            lastName: String,
            gender:String,
            dob: Date,
            hospitals: [],
            hospNum:[],
            dpUrl:String, 
            coverUrl: String,
            cardType: String,
            cardNum: Number,
    
            bio: String,
            occupation: String,
            religion: String,
            tribe: String,
            mstatus: String,
            username: String,
            password: String,
            status:String
          
        },
        contact:{
            mobile: Number,
            email: String,
            state: String,
            lga: String,
            address: String,
            emgName: String,
            emgMobile: String,
            emgEmail: String,
            emgRel: String,
            emgOccupation: String,
            zipcode: String
        },
        insurance:{
            name: String,
            rel:String,
            employer:String,
            ssn: String
        },
        official:{
            hospId:String,
            staffId: String,
            department: String,
            role:String
        }
      
    },
    connections:{type: Scheema.Types.ObjectId, ref: 'Connection'},
    
    record:{
        complains:[{
            complain:String,
            dateCreated:{type:Date, default:Date.now()}
        }],
        famHist:[{
             condition:String,
             dateCreated:{type:Date, default:Date.now()}
            }],
        notes: [{
            note:String,
            noteType:String,
            noter:{type: Scheema.Types.ObjectId, ref: 'Staff'},
            dateCreated:{type:Date,default:Date.now()}
        }],
        vitals: {
            bp: [{
                value: Number,
                dateCreated: {type:Date, default:Date.now()}
            }],
            resp: [{
                value: Number,
                dateCreated: {type:Date, default:Date.now()}
            }],
            pulse: [{
                value: Number,
                dateCreated: {type:Date, default:Date.now()}
            }],
            height: [{
                value: Number,
                dateCreated: {type:Date, default:Date.now()}
            }],
            weight: [{
                value: Number,
                dateCreated: {type:Date, default:Date.now()}
            }],
            tempreture: [{
                value: Number,
                dateCreated: {type:Date, default:Date.now()}
            }],
            bloodGl: [{
                value: Number,
                dateCreated: {type:Date, default:Date.now()}
            }]
        },
        conditions:[{
            condition:String,
            oreder:String,
            certainty: String,
            dateCreated: {type:Date, default:Date.now()},
            by: {type: Scheema.Types.ObjectId, ref: 'Person'}
        }],
        allegies:[{
            allegy:String,
            dateCreated:{type: Date,default:Date.now}
        }],
        visits: [{
            dept:String,
            status:String,
            visitedOn: {type:Date, default: Date.now()},
            addmittedOn: Date,
            dischargedOn:Date,
            diedOn: Date,
            wardNo: Number,
            bedNo: Number
        }],
        appointments: [{
            title:String,
            setOn:Date,
            time:String,
            attended: Boolean,
            setBy: {type: Scheema.Types.ObjectId, ref: 'Person'}
            
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
                            dateCreated: {type:Date, default: Date.now()}
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
                        dateAdded: {type:Date, default: Date.now()}
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
                    selected: {type:Boolean, Default:false},
                    dateAdded: {type:Date, default: Date.now()},
                    purchased: Number,
                    by: {type: Scheema.Types.ObjectId, ref: 'Person'}
                  
                }
            ]
        ],
   
   scans:[{
       name: String,
       description: String,
       dateCreated: Date 
   }],
   Test:[],
   surgeries:[],
   dateCreated: {type: Date, Default: Date.now()}
},
dateCreated: {type: Date, Default: Date.now()}

})
const Person = mongoose.model('Person', personScheema)
module.exports = Person;


