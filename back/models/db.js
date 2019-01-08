import mongoose from 'mongoose'
mongoose.connect('mongodb://localhost:27017/medsoft',{useNewUrlParser:true})
module.exports = mongoose
