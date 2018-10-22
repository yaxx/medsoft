
import mongoose from '../db';
var Schema = mongoose.Schema
var contactschema = new Schema({
  username: {type: String, unique: true},
  contacts: [{ userid: {type: Schema.Types.ObjectId, ref: 'User'},
    am: String,
    thisPerson: String,
    connected: Boolean,
    followedOn: {type: Date, default: Date.now},
    messages: {type: Schema.Types.ObjectId, ref: 'Message'}}]

})
var Contact = mongoose.model('Contact', contactschema)
module.exports = Contact
