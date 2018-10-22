var ItemScheema = new Scheema({
    
    id: Number,  name: String,
    brand: String,  expiry: Date,  
    mesure: Number, category: String,
    description: String,  unit: String,
    addedOn: {type: Date, Default: Date.now()}
     
})

var CategoryScheema = new Scheema({
    
    id: Number,  name: String,
    description: String,
    addedOn: {type: Date, Default: Date.now()},
    
})

var ProductScheema = new Scheema({
    hid:String,
    id: Number,  name: String,
    brand: String, expiry: Date,  
    mesure: Number, category: String,
    description: String,  unit: String,
    price: Number , quantity: Number ,
    sold: Number , expired: Boolean ,
    selected: Boolean  ,
    status: Boolean ,
     
    addedOn: {type: Date, Default: Date.now()}
})



