import mongoose from '../db';
var Scheema = mongoose.Schema
var DepartmentScheema = new Scheema({

        id: String,
        name: String,
        descriptions: String,
        selected: {type: Boolean, Default:false},
        dateCreated: {type: Date, Default: Date.now()},
        

})
var Department = mongoose.model('Department', DepartmentScheema)
module.exports = Department