const express = require( 'express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const api = require('./routes/api')
const Notification = require('./models/schemas/noteschema')
const Connection = require('./models/schemas/connection')
const Messages = require('./models/schemas/messageschema')
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const graphQlHttp = require('express-graphql')
const {buildSchema} = require('graphql')
const graphQlSchema = require('./graphql/schemas/index')
const graphQlResolvers = require('./graphql/resolvers/index')
app.use('/graphql', graphQlHttp({
  schema: graphQlSchema,
  rootValue: graphQlResolvers,
  graphiql: true
}))
app.use(cors({origin:"http://localhost:4200", credentials: true}))
// app.use(cors({origin:"*", credentials: true}))
// app.use(express.static(path.join(__dirname,'dist','front')))
app.use(require('morgan')('dev'))
app.use(bodyParser.json())
app.use(require('cookie-parser')('blackfly'))
var connections = [];
var logins = [];
io.sockets.on('connection', (socket) => {
  connections.push(socket)
  console.log('%s socket(s) connected', connections.length)
  socket.on('login', (data) => {
    data.si = socket.id;
    logins.push({ui:data.ui,si:socket.id})
    console.log(logins);
    socket.broadcast.emit('online', data.ui)
  })
  socket.on('new message', (data) => {
    console.log(data.msgs)
  //  api.updateMessages(data)
   logins.forEach(function (user) {
    if (user.ui === data.reciever) {
      socket.to(user.si).emit('new message', data)
    } else {}
  })
  })
  socket.on('enroled',(patient) => {
    socket.broadcast.emit('enroled', patient);  
  })
  socket.on('consulted', (patient) => {
    socket.broadcast.emit('consulted', patient);  
  })
  socket.on('Discharge',(patient)=>{
    socket.broadcast.emit('Discharge', patient);  
  })
  socket.on('transaction', cart => {
    socket.broadcast.emit('transaction', cart);
  })
  
  socket.on('store update', changes => {
    socket.broadcast.emit('store update', changes);
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
        socket.to(user.id).emit('newnotification', {})
      } else {}
    })
  })
})
app.get('/', (req, res) => {
  // res.render('index')
  res.sendFile(path.resolve(__dirname,'dist','front','index.html'));
})
app.get('/api/client', api.getClient)  
app.get('/api/patients/:type', api.getPatients)
app.get('/api/myaccount', api.getMyAccount)
app.get('/api/explore', api.explore)
// app.get('/api/departments', api.getDepartments)
app.get('/api/connections/:id', api.getConnections)
app.get('/api/dp/:id', api.getDp)
// app.get('/api/items', api.getItems)
app.get('/api/inpatients', api.getInPatients)
app.get('/api/orders', api.getOrders)
app.get('/api/products', api.getProducts)
app.get('/api/history/:id', api.getHistory)
app.post('/api/follow', api.followPerson)
app.post('/api/followback', api.followBack)
app.post('/api/unfollow', api.unFollow)
app.post('/api/update-products', api.updateProducts)
app.post('/api/delete-products', api.deleteProducts)
app.post('/api/new-client', api.addClient)
app.post('/api/new-patient', api.addPerson)
app.post('/api/new-product', api.addProduct)
app.post('/api/person', api.addPerson)
app.post('/api/updatenote', api.updateNote)
app.post('/api/upload', api.uploadFile)
app.post('/api/download', api.downloadFile)
app.post('/api/updatebed', api.updateBed)
app.post('/api/delete-staff', api.deleteStaff)
app.post('/api/update-record', api.updateRecord)
app.post('/api/update-info', api.updateInfo)
app.post('/api/update-medication', api.updateMedication)
app.post('/api/updateclient', api.updateClient)
app.post('/api/login', api.login)
app.post('/api/transaction', api.runTransaction)
server.listen(5000, (err) => {
  if (err) {
    console.log(err.stack)
  } else {
    console.log('Server is up and running')
  }
})
