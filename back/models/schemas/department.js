const mongoose = require('../db') ;
var Scheema = mongoose.Schema;
var DepartmentScheema = new Scheema({
        name: String,
        type: String,
        hasWard: {type:Boolean, default: false},
        rooms: [],
        descriptions: String,
        dateCreated:  Date  
});
var Department = mongoose.model('Department', DepartmentScheema);
module.exports = Department;