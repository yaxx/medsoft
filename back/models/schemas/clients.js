import mongoose from '../db';
var Scheema = mongoose.Schema
var ClientScheema = new Scheema({
        main: {
                name: String,
                category:String, 
                ownership:String,
                specialization:  String,
                mobile: Number,
                email:String,
                dpUrl:  {type: String, default: 'user.jpg'},
                state: String,
                lga: String, 
                zipcode: String,
                address: String,
               
        },
      
        departments: [{
                name: String,
                hasWard:{type: Boolean, Default:false},
                numOfBeds:Number,
                beds:[],
                descriptions: String,
                dateCreated: {type: Date, Default: Date.now()}
        }],   
      
        inventory:[{
                item:{
                    _id: String,   
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
                    sold:{type:Number, default:0} ,
                    expired: Boolean,
                    status: Boolean,
                    quantity: Number
                },
                selected:{Boolean, default: false},
                addedOn: {type:Date, default: Date.now()}   
            }],
            staffs: [{type: Scheema.Types.ObjectId, ref: 'Staff'}],
            dateCreated: {type: Date, Default: Date.now()}
        
        
})



var Client = mongoose.model('Client', ClientScheema)
module.exports = Client
