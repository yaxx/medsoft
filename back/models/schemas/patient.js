
import mongoose from '../db';
var Scheema = mongoose.Schema
var PatientScheema = new Scheema({
    personal:{
        hosId: [],
        dpUrl:  {type: String, default: 'user.jpg'},
        cardType: String,
        firstName: String,
        lastName: String,
        dob: Date,
        occupation: String,
        religion: String,
        tribe: String,
        mstatus: String,
        cardType: String,
        cardNum: Number
      
        
    },
    contact:{
        mobile: Number,
        email: String,
        state: String,
        lga: String,
        address: String,
        emgName: String,
        emgMobile: String,
        emgEmail: String,
        emgRel: String,
        emgOccupation: String,
        zipcode: String

    },

    insurance:{
        name: String,
        rel:String,
        employer:String,
        ssn: String
    },
    status: {type: String, Default: 'queue' },
    dateCreated: {type: Date, Default: Date.now()},
    record:{type: Scheema.Types.ObjectId, ref: 'Record'}
})
const Patient = mongoose.model('Patient', PatientScheema)


module.exports = Patient;


