import mongoose from '../db';
var Schema = mongoose.Schema
var messageschema = new Schema({
  parties: [],
  chats: [{msg: String, from: String, to: String, sendOn: {type: Date, default: Date.now()}}]
})
var Message = mongoose.model('Message', messageschema)
module.exports = Message
