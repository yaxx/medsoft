const mongoose = require('../db')
const Schema = mongoose.Schema

const notificationSchema = new Schema({
  to: String,
  from: {type: Schema.Types.ObjectId, ref: 'User'},
  button: String,
  action: {type: String, default: 'Follows you'},
  noteOn: { type: Date, default: Date.now() },
  seen: {type: Boolean, default: false}
})
const Notification = mongoose.model('Notification', notificationSchema)
module.exports = Notification
