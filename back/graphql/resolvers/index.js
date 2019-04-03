 const Item  = require ('../../models/schemas/item')
 const Department = require( '../../models/schemas/department')
module.exports = {

     items()  {
        return Item.find().then( items => {
            return items.map( item => 
                (
                    {
                    ...item._doc,
                     _id: item.id,
                     dateCreated: new Date(item.dateCreated).toISOString()
                    }
                ) 
            )
        }).catch(e => {
            throw e
    })
},

    createItem: (ags) => {
        return new Item(ags.item).save().then(item => (      
                {
                ...item._doc,
                    _id: item.id,
                    dateCreated: new Date(item.dateCreated).toISOString()
            }
            
        )).catch(e=>{
            throw e
        }) 
        
    },
    createDepartment: (ags) => {
        return new Department(ags.dept).save().then(dept => (      
                {
                ...dept._doc,
                    _id: dept.id,
                    dateCreated: new Date(dept.dateCreated).toISOString()
            }
            
        )).catch(e=>{
            throw e
        }) 
        
        
    }
    
}