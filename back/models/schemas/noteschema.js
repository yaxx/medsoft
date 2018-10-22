var mongoose = require('../db')
var Schema = mongoose.Schema

var notificationSchema = new Schema({
  to: String,
  from: {type: Schema.Types.ObjectId, ref: 'User'},
  button: String,
  action: {type: String, default: 'Follows you'},
  noteOn: { type: Date, default: Date.now() },
  seen: {type: Boolean, default: false}
})
var Notification = mongoose.model('Notification', notificationSchema)
module.exports = Notification
