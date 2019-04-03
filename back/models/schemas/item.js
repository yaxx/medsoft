const mongoose = require('../db') ;
const Scheema = mongoose.Schema
const ItemScheema = new Scheema({
        name: String,
        brand: String,
        description: String,
        mesure: Number,
        unit: String,
        dateCreated: {type: Date, Default: Date.now()},
})
const Item = mongoose.model('Item', ItemScheema)
module.exports  = Item




