const mongoose = require('../db') ;
const Scheema = mongoose.Schema
const InventoryScheema = new Scheema({
    products:[{
        type: String,
        item: {
            name: String,
            brand: String,
            category: String,
            description: String,
            mesure:Number,
            unit: String,
            dateCreated: date 
        },
        stockInfo: {
            expiry: Date,
            price: Number ,
            expired: Boolean,
            status: Boolean,
            quantity: Number,
            inStock: Number 
        },
        addedOn: date 
    }],
    dateCreated:Date  

})
const Inventory = mongoose.model('Inventrory', InventoryScheema)
module.exports = Inventory;