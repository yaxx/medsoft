const mongoose = require ('mongoose')
mongoose.connect('mongodb://localhost:27017/medsoft',{useNewUrlParser: true})
module.exports = mongoose
