import mongoose from './db';
var Scheema = mongoose.Schema
var ItemScheema = new Scheema({
        name: String,
        brand: String,
        descriptions: String,
        measure: Number,
        unit: String,
        date: Date,
        

})
var Item = mongoose.model('Item', ItemScheema)
export default  Item
