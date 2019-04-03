import mongoose from '../db';
const Scheema = mongoose.Schema
const InventoryScheema = new Scheema({
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
        stockInfo: {
            expiry: Date,
            price: Number ,
            expired: Boolean ,
            status: Boolean,
            quantity: Number
        },
        addedOn: {type:Date, default: Date.now()}   
    }],
    dateCreated: Date  

})
const Inventory = mongoose.model('Inventrory', InventoryScheema)
export default  Inventory;