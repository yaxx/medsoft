const mongoose = require('../db')
const Schema = mongoose.Schema
const noteSchema = new Schema({
  note: String,
  noteType: String,
  meta: {
      addedBy: {
          type: Schema.Types.ObjectId,
          ref: 'Person'
      },
      selected: Boolean,
      dateAdded: Date
  }
})
const Notification = mongoose.model('Notification', noteSchema)
module.exports = Notification
