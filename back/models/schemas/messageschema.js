const mongoose = require('../db') ;
const Schema = mongoose.Schema
const messageschema = new Schema({
  parties: [],
  chats: [{msg: String, from: String, to: String, sendOn: {type: Date, default: Date.now()}}]
})
const Message = mongoose.model('Message', messageschema)
module.exports = Message
