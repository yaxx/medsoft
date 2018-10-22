import mongoose from '../db';
var Scheema = mongoose.Schema
var InventoryScheema = new Scheema({
    hosId: String,
    products:[{
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
    }],
    dateCreated:{type:Date, default: Date.now()}   

})
var Inventory = mongoose.model('Inventrory', InventoryScheema)
module.exports = Inventory