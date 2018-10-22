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
        
        departments: [{ id: String,
                name: String,
                descriptions: String,
                selected: {type: Boolean, Default:false},
                dateCreated: {type: Date, Default: Date.now()}}],
        
        inventory:[{
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
                    expired: Boolean,
                    status: Boolean,
                    quantity: Number,
                },
                selected:Boolean,
                dateAdded: {type:Date, default: Date.now()}   
            }],
            staffs: [{type: Scheema.Types.ObjectId, ref: 'Staff'}],
            dateCreated: {type: Date, Default: Date.now()}
        
        
})



var Client = mongoose.model('Client', ClientScheema)
module.exports = Client
