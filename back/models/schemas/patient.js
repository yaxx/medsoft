
import mongoose from '../db';
var Scheema = mongoose.Schema
var PatientScheema = new Scheema({
    info:{
        personal:{
            hosId: [],
            dpUrl:  {type: String, default: 'user.jpg'},
            cardType: String,
            firstName: String,
            lastName: String,
            dob: Date,
            occupation: String,
            religion: String,
            tribe: String,
            mstatus: String,
            cardType: String,
            cardNum: Number
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
        }
    },
    
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
            condition:String, oreder:String,
            certainty: String,
            dateCreated: {type:Date, default:Date.now()},
            by: {type: Scheema.Types.ObjectId, ref: 'Staff'}
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
        medications:[{
            product:{
                item:{
                    name: String,
                    brand: String,
                    category: String,
                    description: String,
                    mesure:Number,
                    unit: String,
                    dateCreated: {type:Date, default: Date.now()}
                },
                stockInfo:{
                    expiry: Date,
                    price: Number,
                    sold: Number,
                    expired: Boolean ,
                    status: Boolean,
                    quantity: Number,
                },
                selected:Boolean,
                dateAdded: {type:Date, default: Date.now()}
            },
            priscription:{
                intake: Number,
                freq: String,
                piriod: Number,
                extend: String
            },
            paid: {type:Boolean, Default:false},
            lastTaken: Date,
            paused: {type:Boolean, Default:false},
            pausedOn :Date,
            selected: {type:Boolean, Default:false},
            priscribedOn: {type:Date, default:Date.now},
            by: {type: Scheema.Types.ObjectId, ref: 'Staff'}
        }
   ],
   scans:[],
   Test:[],
   surgeries:[],
    dateCreated: {type: Date, Default: Date.now()}
}

})
const Patient = mongoose.model('Patient', PatientScheema)
module.exports = Patient;


