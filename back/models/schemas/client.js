const mongoose = require( '../db');
var Scheema = mongoose.Schema;
var ClientScheema = new Scheema({
        info: {
                name: String,
                category: String, 
                ownership: String,
                specialization:  String,
                mobile: Number,
                email:String,
                dp: String ,
                city: String,
                zipcode: String,
                address: String,
                expiry: Date
        },
        departments: [{
                name: String,
                hasWard: Boolean, 
                numOfBeds:Number,
                beds: [{
                        number:Number,
                        allocated: Boolean,
                        dateCreated:Date
                 }],
                descriptions: String,
                dateCreated: Date
        }],   
        inventory: [{
                item: {
                    _id: String,   
                    name: String,
                    brand: String,
                    category: String,
                    description: String,
                    mesure: Number,
                    unit: String,
                    dateCreated: Date  
                },
                stockInfo: {
                    expiry: Date,
                    price: Number,
                    sold: Number ,
                    expired: Boolean,
                    status: Boolean,
                    quantity: Number,
                    inStock: Number

                },
                dateCreated: Date  
            }],
            staffs: [
                      {
                        type: Scheema.Types.ObjectId, 
                        ref: 'Person'
                    }
                ]
          
},
{timestamps: true}
)

const Client = mongoose.model('Client', ClientScheema);
module.exports =  Client;
