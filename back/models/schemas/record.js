import mongoose from '../db';
var Scheema = mongoose.Schema

var RecordScheema = new Scheema({
     complains:[{complain:String, dateCreated:{type:Date, default:Date.now()}}], famHist:[{condition:String, dateCreated:{type:Date, default:Date.now()}}],

    notes: [{
        note:String,
        noteType:String,
        noter:{type: Scheema.Types.ObjectId, ref: 'Staff'},
        dateCreated:Date
    }],
    

    vitals: {
        bp: [{
            value: Number, 
            dateCreated:Date
        }],
        resp: [{
            value: Number,
            dateCreated: Date
        }],
        pulse: [{
            value: Number, dateCreated: {type:Date, default:Date.now()}}],
        height: [{value: Number, dateCreated: {type:Date, default:Date.now()}}],
        weight: [{value: Number, dateCreated: {type:Date, default:Date.now()}}],
        tempreture: [{value: Number, dateCreated: {type:Date, default:Date.now()}}],
        bloodGl: [{value: Number, dateCreated: {type:Date, default:Date.now()}}]

    },

    conditions:[{
        condition:String, oreder:String,
        certainty: String,
        dateCreated: Date,
        by: {type: Scheema.Types.ObjectId, ref: 'Staff'}}],

  
    allegies:[{
        allegy:String, 
        dateCreated:{type: Date,default:Date.now}
    }],

    visits: [{
        dept:String,
        status:String,
        visitedOn: Date, 
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
        

Tests: [],
Sugeries:[],

files: [{
    name: String,
    fileType: String,
    dateCreated: {type:Date,default:Date.now()}
    }]

}

)

const Record = mongoose.model('Record', RecordScheema)
module.exports  = Record;