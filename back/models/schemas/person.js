
const mongoose = require('../db') ;
const Scheema = mongoose.Schema
const personScheema = new Scheema({
    info: {
        status:String,
        online: Boolean,
        lastLogin: Date,
        personal: {
            firstName: String,
            lastName: String,
            gender: String,
            dob: Date,
            avatar: String, 
            cardType: String,
            cardNum: Number,
            bio: String,
            occupation: String,
            religion: String,
            tribe: String,
            mstatus: String,
            username: String,
            password: String,
            status: String
          
        },
        contact: {
            me: {
                mobile: Number,
                email: String,
                state: String,
                lga: String,
                address: String
            },
            emergency: {
                name: String,
                mobile: String,
                email: String,
                rel: String,
                occupation: String,
                address: String
            }
        },
        insurance:{
            name: String,
            rel:String,
            employer:String,
            ssn: String
        },
        official:{
            hospital: {
                type: Scheema.Types.ObjectId,
                ref: 'Client'
            }, 
            id: String,
            department: String,
            role: String
        }
      
    },
    connections:{
        type: Scheema.Types.ObjectId,
         ref: 'Connection'
        },
    
    record:{
        complains:[{
            complain:String,
            dateCreated:Date
        }],
        famHist:[{
             condition:String,
             dateCreated:Date
            }],
        notes: [{
            note:String,
            noteType:String,
            noter:{type: Scheema.Types.ObjectId, ref: 'Person'},
            dateCreated:Date
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
            dateCreated: Date,
            by: {type: Scheema.Types.ObjectId, ref: 'Person'}
        }],
        allegies:[{
            allegy:String,
            dateCreated: Date,
        }],
        visits: [{
            hospital: {type: Scheema.Types.ObjectId, ref: 'Client'},
            dept: String,
            status:String,
            visitedOn: Date,
            addmittedOn: Date,
            dischargedOn:Date,
            diedOn: Date,
            wardNo: Number,
            bedNo: Number
        }],
        appointments: [{
            title: String,
            setOn: Date,
            time: String,
            attended: Boolean,
            setBy: {type: Scheema.Types.ObjectId, ref: 'Person'}
            
        }],
        medications:[
            [
                {
                    product:{
                        item: {
                            _id: String,
                            name: String,
                            brand: String,
                            description: String,
                            mesure: Number,
                            unit: String,
                            dateCreated: Date
                        },
                        stockInfo: {
                            expiry: Date,
                            price: Number,
                            sold: Number,
                            expired: Boolean,
                            status: Boolean,
                            quantity: Number
                        },
                        dateCreated: Date
                    },
                    priscription:{
                        intake: Number,
                        freq: String,
                        piriod: Number,
                        extend: String,
                     
                    },
                    paid: Boolean,
                    lastTaken: Date,
                    paused: Boolean,
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
   
        scans:[{
            name: String,
            description: String,
            dateCreated: Date 
        }],
        Test:[],
        surgeries:[]
 
    }
},
{timestamps: true}
)

const Person = mongoose.model('Person', personScheema)
module.exports = Person;


