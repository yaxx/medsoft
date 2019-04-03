const mongoose = require('../db') ;
var Scheema = mongoose.Schema
var DepartmentScheema = new Scheema({
        name: String,
        hasWard:{type: Boolean, Default:false},
        numOfBeds:Number,
        beds:[],
        descriptions: String,
        dateCreated: {type: Date, Default: Date.now()},   
})
var Department = mongoose.model('Department', DepartmentScheema)
module.exports = Department