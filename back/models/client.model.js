import mongoose from '../db';
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
                expiry: Date,
                password: String,
                    
        },
      
        departments: [{
                name: String,
                hasWard: Boolean, 
                numOfBeds:Number,
                beds: [
                        {
                            number:Number,
                            allocated: Boolean,
                            dateCreated:Date
                        }
                ],
                descriptions: String,
                dateCreated: Date
        }],   
        inventory: [{
                item: {
                    _id: String,   
                    name: String,
                    type: String
                    brand: String,
                    category: String,
                    description: String,
                    mesure:Number,
                    unit: String,
                    dateCreated: Date  
                },
                stockInfo: {
                    expiry: Date,
                    price: Number,
                    sold:{type:Number, default:0} ,
                    expired: Boolean,
                    status: Boolean,
                    quantity: Number
                },
              
                addedOn: {type:Date, default: Date.now()}   
            }],
            staffs: [
                      {
                        type: Scheema.Types.ObjectId, 
                        ref: 'Person'
                    }
                ],
            dateCreated: Date
        
        
})

const Client = mongoose.model('Client', ClientScheema);
export default  Client;
