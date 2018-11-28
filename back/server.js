var express = require( 'express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
import * as api from './routes/api'
var Notification = require('./models/schemas/noteschema')
var Contact = require('./models/schemas/contactschema')
var Messages = require('./models/schemas/messageschema')
import {path} from  'path';
import bodyParser from 'body-parser';
import cors from 'cors';

app.use(cors({origin:["http://localhost:4200"], credentials: true}))
app.use(require('morgan')('dev'))
app.use(bodyParser.json())
// app.use(bodyParser.urlencoded())

app.use(require('cookie-parser')('blackfly'))

// io.use(require('socket.io-cookie-parser')())
// app.use(require('express-session')(
//   {
//   secret:'somme', 
//   resave:false, 
//   saveUninitialized:true,
//   httpOnly:false
// }))


var connections = []
var logins = []
  
io.sockets.on('connection', (socket) => {
  connections.push(socket)
  console.log('%s socket(s) connected', connections.length)

  socket.on('message', (msg) => {
    Messages.update(
      {'parties': {$in: [socket.request.cookies.username, msg.to]}}, {$push: {'chats': msg}}, {upsert: true}, (err, message) => {
        if (!err) {
          console.log('message saved')
          logins.forEach((user) => {
            if (user.username === msg.to) {
              socket.to(user.id).emit('message', msg)
            } else {

            }
          })
        } else {
          console.log(err)
        }
      }
      )
  })
  socket.on('new patient',(patient)=>{
    console.log(patient)
    socket.broadcast.emit('new patient', patient);
    
  })
  socket.on('login', (data) => {
    logins.push({username: data.username, id: socket.id})
    socket.broadcast.emit('hello', {username: data.username, lastLogin: data.lastLogin})
  })

  socket.on('follow', (data) => {
    let d = data
    d.am = 'Following'

    Contact.updateOne({ 'username': socket.request.cookies.username }, {$push: { contacts: d }}, {upsert: true}, (err, obj) => {
      if (!err) {
            // console.log(obj)
      } else { console.log(err) }
    })

    let me = {userid: socket.request.cookies.q, thisPerson: 'Following'}
    Contact.updateOne({ 'username': data.username }, {$push: {contacts: me}}, {upsert: true}, (err, obj) => {
      if (!err) {

      } else { console.log(err) }
    })

    Notification({from: socket.request.cookies.q, to: data.username, button: 'Follow'}).save((err, note) => {
      if (err) {
        console.log(err)
      } else {

      }
    })
    logins.forEach(function (user) {
      if (user.username === data.username) {
        socket.to(user.id).emit('newnotification', {})
      } else {}
    })
  })

  socket.on('followback', (data) => {
    Messages({parties: [socket.request.cookies.username, data.username], chats: []}).save((err, messages) => {
      if (!err) {
        Contact.updateOne({'username': socket.request.cookies.username, 'contacts.userid': data.id}, {$set: {'contacts.$.am': 'Following', 'contacts.$.connected': true, 'contacts.$.messages': messages._id}}, {upsert: true}, (err, obj) => {
          if (!err) {

          } else { console.log(err) }
        })

        Contact.updateOne({'username': data.username, 'contacts.userid': socket.request.cookies.q}, {$set: {'contacts.$.thisPerson': 'Following', 'contacts.$.connected': true}, 'contacts.$.messages': messages._id}, {upsert: true}, (err, obj) => {
          if (!err) {

          } else { console.log(err) }
        })
      } else { console.log(err) }
    })

    Notification({from: socket.request.cookies.q, to: data.username, button: 'Following'}).save((err, note) => {
      if (err) {
        console.log(err)
      } else {

      }
    })

    Notification.findOne({_id: data.i}, (err, mynote) => {
      if (!err) {
        mynote.button = 'Following'
        mynote.save((err, n) => {

          if (!err) {

          }
          console.log(err)
        })
      } else {
        console.log(err)
      }
    })
  })

  socket.on('check', (data) => {
    console.log(logins)
    logins.forEach(function (user) {
      if (user.username === data.username) {
        console.log(user.username)
        socket.to(user.id).emit('newnotification', {})
      } else {}
    })
  })
})

app.get('/', (req, res) => {
  // if (req.cookies.name) {
  //   res.render('index')
  // } else {
  res.render('index')
    // res.status(304).redirect('/login')
  // }
}

)
app.get('/api/settings', api.getSettings)
app.get('/api/patients', api.getPatients)
app.get('/api/departments', api.getDepartments)
app.get('/api/products', api.getProducts)
app.post('/api/update-products', api.updateProducts)
app.post('/api/delete-products', api.deleteProducts)
app.get('/api/items', api.getItems)
app.get('/api/inpatients', api.getInPatients)
app.get('/api/orders', api.getOrders)
app.post('/api/new-client', api.addClient)
app.post('/api/new-patient', api.addPatient)
app.post('/api/new-product', api.addProduct)
app.post('/api/new-staff', api.addStaff)
app.post('/api/update-staff', api.updateStaff)
app.post('/api/updatenote', api.updateNote)
app.post('/api/updatebed', api.updateBed)
app.post('/api/delete-staff', api.deleteStaff)
app.post('/api/update-record', api.updateRecord)

app.post('/api/update-medication', api.updateMedication)
app.post('/api/new-dept', api.addDept)
app.get('/api/consultees', api.getConsultees)
app.post('/api/login', api.login)


server.listen(3000, (err) => {
  if (err) {
    console.log(err.stack)
  } else {
    console.log('Server is up and running')
  }
})
