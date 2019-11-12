const mongoose = require ('mongoose')
// mongoose.connect('mongodb+srv://zigzaks:code2013@spiner-jhuds.mongodb.net/spiner?retryWrites=true&w=majority',{useNewUrlParser: true}
// )
mongoose.connect('mongodb://localhost:27017/medsoft',{useNewUrlParser: true})
module.exports = mongoose
