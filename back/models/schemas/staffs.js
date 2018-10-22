import mongoose from '../db';
var Scheema = mongoose.Schema
var StaffScheema = new Scheema({

    staffId: String,
    hosId: String,
    department: String,
    firstName: String,
    lastName: {type: String, default: ''},
    email: String,
    dpUrl: {type: String, default: 'user.jpg'},
    role: String,
    username: String,
    password: String,
    status: {type: String, default: 'active'},
    dateCreated: {type: Date, Default: Date.now()}

})
var Staff = mongoose.model('Staff', StaffScheema)
module.exports = Staff