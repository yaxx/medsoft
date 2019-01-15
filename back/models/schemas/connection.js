
import mongoose from '../db';
var Schema = mongoose.Schema;
var connectionScheema = new Schema({
  people:[{
    person: {type: Schema.Types.ObjectId, ref: 'Person'},
    follower: Boolean,
    following: Boolean,
    blocked: Boolean,
    conversations: [
      [{
        message:String,
        sender: {type: Schema.Types.ObjectId, ref: 'Person'},
        reciever: {type: Schema.Types.ObjectId, ref: 'Person'},
        delivered: Boolean,
        read: Boolean,
        sendOn:Date
    }]
  ]
}],
notifications:[{
  person: {type: Schema.Types.ObjectId, ref: 'Person'},
  noteType: String,
  header: String,
  sendOn: Date 
  }
]
});
var Connection = mongoose.model('Connection', connectionScheema)
module.exports = Connection;
