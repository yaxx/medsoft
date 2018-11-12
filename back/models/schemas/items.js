import mongoose from '../db';
var Scheema = mongoose.Schema
var ItemScheema = new Scheema({

        in:String,
        name: String,
        brand: String,
        descriptions: String,
        measure: Number,
        unit: String,
        dateCreated: {type: Date, Default: Date.now()},
        

})
var Item = mongoose.model('Item', ItemScheema)
module.exports = Item




