
const mongoose = require('../db') ;
const Schema = mongoose.Schema;
const connectionScheema = new Schema({
  people:[{
    person: {type: Schema.Types.ObjectId, ref: 'Person'},
    follower: Boolean,
    following: Boolean,
    blocked: Boolean,
    lastChated: Date,
    dateCreated: Date,
    messages: [
      [{
        message: String,
        sender: {
          type: Schema.Types.ObjectId,
           ref: 'Person'
          },
         reciever: {
          type: Schema.Types.ObjectId,
          ref: 'Person'
          },
        delivered: Boolean,
        read: Boolean,
        sendOn: Date
    }]
  ]
}],
notifications:[{
  person: {
    type: Schema.Types.ObjectId,
     ref: 'Person'},
  noteType: String,
  header: String,
  sendOn: Date 
  }
]
});
const Connection = mongoose.model('Connection', connectionScheema)
module.exports = Connection;
