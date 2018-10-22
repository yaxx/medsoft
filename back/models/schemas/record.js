import mongoose from '../db';
var Scheema = mongoose.Schema

var RecordScheema = new Scheema({
     complains:[{issue:String, dateCreated:{type:Date, default:Date.now()}}], famHist:[{condition:String, dateCreated:{type:Date, default:Date.now()}}],

    notes: [{note:String, type:String, noter:{type: Scheema.Types.ObjectId, ref: 'Staff'}, dateCreated:{type:Date,default:Date.now()}}],

    vitals: {

        bp: [{value: Number, dateCreated: {type:Date, default:Date.now()}}],
        resp: [{value: Number, dateCreated: {type:Date, default:Date.now()}}],
        pulse: [{value: Number, dateCreated: {type:Date, default:Date.now()}}],
        height: [{value: Number, dateCreated: {type:Date, default:Date.now()}}],
        weight: [{value: Number, dateCreated: {type:Date, default:Date.now()}}],
        tempreture: [{value: Number, dateCreated: {type:Date, default:Date.now()}}],
        bloodGl: [{value: Number, dateCreated: {type:Date, default:Date.now()}}]

    },

    conditions:[{type:String, oreder:String,
        certainty: String,
        dateCreated: {type:Date, default:Date.now()},
        by: {type: Scheema.Types.ObjectId, ref: 'Staff'}}],

    allegies:[{type: String, dateCreated:{type: Date,default:Date.now}}],

    allegies:[{type:String, dateCreated:{type: Date,default:Date.now}}],

    visits: [{dept:String,
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
                price: Number ,
                expired: Boolean ,
                status: Boolean,
                quantity: Number,
            },
            selected:Boolean,
            dateAdded: {type:Date, default: Date.now()}   
        },
        priscribtion:{
            intake: Number,
            freq: String,
            piriod: Number,
            extend: Number,
            paid: Boolean,
            takenOn: Date,
            paused: Boolean,
            pausedOn :Date,
            priscribedOn: {type:Date, default:Date.now},
            by: {type: Scheema.Types.ObjectId, ref: 'Staff'}
        }
    }     
],        

Tests: [],
Sugeries:[],

files: [{
    name: String,
    type: String,
    dateCreated: {type:Date,default:Date.now()}
    }]

}

)

const Record = mongoose.model('Record', RecordScheema)
module.exports = Record;