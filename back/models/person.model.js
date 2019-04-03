
import mongoose from '../db';
var Scheema = mongoose.Schema
var personScheema = new Scheema({
    info: {
        type: String,
        personal: {
            firstName: String,
            lastName: String,
            gender:String,
            dob: Date,
            avatar: String, 
            cardType: String,
            cardNum: Number,
            bio: String,
            occupation: String,
            religion: String,
            tribe: String,
            mstatus: String,
            username: String,
            password: String,
            status: String
        },
        contact: {
            me: {
                mobile: Number,
                email: String,
                state: String,
                lga: String,
                address: String
            },
            emergency: {
                name: String,
                mobile: String,
                email: String,
                rel: String,
                occupation: String,
                address: String
            }
        },
      
        official: [{
            hospital: {
                type: Scheema.Types.ObjectId,
                ref: 'Client'
            }, 
            id: String,
            department: String,
            role: String,
            dateCreated: Date
        }]
      
    },

    record: {
        type: Scheema.Types.ObjectId,
        ref: 'Record'
    },
    contacts: {
        type: Scheema.Types.ObjectId,
        ref: 'Contacts'
    },
    online: Boolean,
    lastLogin: {type: Date, Default: Date.now()},
})



const Person = mongoose.model('Person', personScheema)
export default Person;