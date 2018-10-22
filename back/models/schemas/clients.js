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
                dateCreated: {type: Date, Default: Date.now()}
        },
        
        departments: [{ id: String,
                name: String,
                descriptions: String,
                selected: {type: Boolean, Default:false},
                dateCreated: {type: Date, Default: Date.now()}}],
        staffs: [{type: Scheema.Types.ObjectId, ref: 'Staff'}],

       
        
})



var Client = mongoose.model('Client', ClientScheema)
module.exports = Client
