const mongoose = require('../db') ;
const Schema = mongoose.Schema
const messageschema = new Schema({
  parties: [],
  chats: [
      [
          {
            message: String,
            sender: String,
            reciever: String,
            sendOn: {type: Date, default: Date.now()}
        }
    ]
]
})
const Message = mongoose.model('Message', messageschema)
module.exports = Message
