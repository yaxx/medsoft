// const { error } require 'util'
const mongoose = require ('mongoose')
const Person = require('../models/schemas/person')
const Client = require ('../models/schemas/client')
// constPerson require '../models/schemas/staffs'
// const Record require '../models/schemas/record'
const Item = require ('../models/schemas/item')
const Department = require ('../models/schemas/department')
const multer = require ('multer')
const path = require('path');
const  truncate  = require ('fs');
const Notifications = require('../models/schemas/noteschema')
const Connection = require('../models/schemas/connection')
// var Messages = require('../models/schemas/messageschema')
let name = null
const store = multer.diskStorage({
 destination:'./uploads',
 filename: (req, file, cb) => {
 cb (null, Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({
  storage: store
}).single('file')

const createPerson = async data => {
  try {
    let con = null
    let  person
    if(data.info.official.hospital){
      con = await new Connection().save()
       person = await new Person({
        info: data.info, 
        record: data.record,                                                                                   
        connections:  con._id
      }).save() 
    } else {
      person = await new Person({
        info: data.info, 
        record: data.record,                                                                                   
      }).save() 
    }
    
  
    if(con) {
        await Client.findOneAndUpdate({
        _id: person.info.official.hospital
      },{ $push:{staffs: person._id }}
    )
  } else {}
    return person
} catch (e)  {
  throw e
}
}


module.exports = {
uploadFile: (req, res)=>{
  upload(req, res, (err)=>{
    if(err) {
     return res.status(501).jason({error:err})
    } else {
     res.send(req.file.filename)
    }
  })

},
getDp: (req, res)=>{
  const filePath = path.join(__dirname, '../uploads') + '/'+req.params.id
  res.sendFile(filePath);
},
downloadFile: (req, res)=>{
  const filename = path.join(__dirname, '../uploads') + '/'+req.body.fileName
  res.sendFile(filename);
},


addPerson: async (req, res) => {
  try{
  const exist = await Person.findOne({
    'info.contact.me.mobile': req.body.info.contact.me.mobile
  })
  if(exist) {
      res.status(400).send(exist)
    } else {
     res.send(await createPerson({
       info: req.body.info,
       record: req.body.record
      })
     )
    }
  }

catch (e){
  throw e
}
  
},
getPatients: async (req, res) => {
  try {
    const patients = await Person.find({$where: 'this.record.visits.length'})
    res.send(patients) 
  }
  catch(e){
    throw e
  }
   
},
getHistory: async (req, res) => {
  try {
    const patient = await Person.findById(req.params.id)
    res.send(patient) 
  }
  catch(e){
    throw e
  }
   
},

addClient: async (req, res) => {
  try {
    const exist = await Person.findOne({ $or: [{
      'info.contact.me.email': req.body.client.info.email},{
        'info.contact.me.mobile': req.body.client.info.mobile
      }]
    })
    if(exist) {
        res.status(400).send(exist)
      } else {
        const client = await new Client(req.body.client).save()
            let data = {
              info: {
                personal:{
                  firstName: 'Admin',
                  lastName: '',
                  username: req.body.cred.username,
                  password: req.body.cred.password,
                  avatar:'avatar.jpg'
                },
                contact: {
                  me: {
                    email: req.body.client.info.email,
                    mobile: req.body.client.info.mobile
                  }
                },
                official: {
                  hospital: client._id,
                  department:'Admin',
                  role: 'admin'
                }
              }
            }
            const person  = await createPerson(data)
            console.log(person)
            res.send(person)
          }
         
        }
  catch(e) {
      throw e
    }
 
},
getConnections: (req, res) => {
  
  //   .populate('people.person')
  //   .exec((err, con) => {
  //     if (err) {
  //       console.log(err)
  //     } else {
  //       res.send(con)
  //     }
  // })
},

getMyAccount: async (req, res) => {
  try {
    const me  = await Person.findById(req.cookies.i,'_id info connections')
    me.connections = await Connection.findById(me.connections)
    .populate({path:'people.person', select:'_id info'})
    .exec()
    res.send(me)
  } 
  catch (e) {
   console.log(e)
  }
 
 },
followPerson: async (req, res)=> {
  try {
    const me = await Person.findById(req.cookies.i)
    const person = await Person.findById(req.body.id)
    const mycon = await Connection.findByIdAndUpdate(
      me.connections,{$push:{people: {
          person: person._id,
          follower: false,
          following: true,
          blocked: false,
          messages: [[]]
      }},
     })
    await Connection.findByIdAndUpdate(
      person.connections,{$push:{
        people: {
          person: me._id,
          follower: true,
          following: false,
          blocked: false,
          messages: [[]]
      }, 
        notifications: {
          person: me._id,
          noteType: 'direct',
          header: 'Follows you',
          sendOn: new Date()
    }}
      
    })
      res.send(mycon)
    }
    catch(e){
      throw e
    }

},

followBack: async (req, res) => {
  try {
    console.log(req.body)
    const me = await Person.findById(req.cookies.i)
    const person = await Person.findById(req.body.id)
  
    const mycon = await Connection.findOneAndUpdate({
      _id: me.connections, "people.person": req.body.id}, {"people.$.following": true},{new: true})

     await Connection.findOneAndUpdate({
       _id: person.connections,"people.person": me._id}, {"people.$.follower": true,
       $push: {  
        notifications: {
          person: me._id,
          noteType: 'direct',
          header: 'Followed back',
          sendOn: new Date()
          }
        }
      })
      console.log(mycon)
      res.send(mycon);
  }
  catch(e){
    throw e
  }
  
},

unFollow: (req, res) => {
  Connection.findOneAndUpdate({_id: req.body.yourcon,"people.person":req.cookies.i},{$set:{"people.$.follower":false}}, {new:true},(e, me)=>{
    if(!e){
      Connection.findOneAndUpdate({_id: req.body.id,"people.person":req.body.yourid},{$set:{"people.$.following":false}},{new:true},(e, myconn)=>{
        if(!e){
          res.send(myconn);
        }else{
          console.log(e)
        }
      })
    }else{
      console.log(e)
    }
  })

},

updateMessages: (data)=>{
Connection.findOneAndUpdate({'people.person': data.sender},{"people.$.messages": data.convs},(e, me)=>{
    if(!e){
      Connection.findOneAndUpdate({'people.person': data.reciever},{"people.$.messages": data.convs},(e, myconn)=>{
        if(!e){
          console.log(myconn)// res.send(myconn);
        }else{
          console.log(e)
        }
      })
    }else{
      console.log(e)
    }
  })

},

explore: async (req, res)=>{
  try {
    const people = await Person.find({'info.official.hospital':req.cookies.h},'info' )
    res.send(people);
  }
  catch(e) {
    throw e
  }
  
  
},

login: async (req, res) => {
  try {
    const person = await Person.findOne({ $or: [{
      'info.contact.me.email':req.body.username,
      'info.personal.password': req.body.password},{
        'info.personal.username': req.body.username,
        'info.personal.password': req.body.password
      }]})
      if(person) {
        res.send(person)
      } else {
         res.status(400).send('Invalid credentials');
      }
  } catch(e) {
    throw e
  }
  
},
  
getClient: async (req, res)=> {
  try {
    const client  = await Client.findById(req.cookies.h)
    .populate('staffs').exec()
    const depts = await Department.find()
    res.send({client:client, departments: depts})
  }
  catch(e) {
    throw e
  }
},

 staff:(req, res)=>{
   if(req.body._id){
      Connection.findOneAndUpdate({
        _id:req.body.connections._id
      },{
            $addToSet:{people:{$each:req.body.connections.people}}
        },
         (err, doc)=>{
            if(err){
                console.log(err)
          }else{
            req.body.connections._id = doc._id
            Person.findOneAndUpdate({
              '_id':req.body._id
            },
            req.body, {new:true, upsert: true},(e, person)=> {
              if(err){
                console.log(err)
              }else{
                Client.findOneAndUpdate({'info.email':'mail@cityhospital.com'},
                 { $push:{staffs:person._id}},(err,client)=>{
                    if(err){
                      console.log(err)
                    }else{
                      res.send(person)
                    }
                  }
                  )
              }

            }
       )

    }
  });
}
else {
    new Connection({}).save((err,con)=>{
        if(err){
          console.log(err)
        }else{
          req.body.connections = con._id
          new Person(req.body).save((err,person)=>{
            if(err){
              console.log(err)
            }else{
              Client.findOneAndUpdate({'info.email':'mail@cityhospital.com'},
              { $push:{staffs:person._id}},(err,client)=>{
                 if(err){
                   console.log(err)
                 }else{
                   res.send(person);
                 }
               })

            }
          })

        }
    })
  }


},

deleteStaff: (req, res)=>{
  //     Client.findOneAndUpdate({
  //       _id:req.body.hosId
  //     },{
  //       $pull:{
  //         staffs:req.body._id
  //       }
  //     })
  //     res.send(docs)
    
  // })

},
updateClient: (req, res)=>{
  
    Client.findOneAndUpdate({
      _id:req.cookies.h}, {
        info:req.body.info,
        departments:req.body.departments,
        inventory:req.body.inventory
      },{new:true},(err, docs)=>{
      if(err){
        console.log(err)
      }
        res.status(200).send(docs)
      
    })
},



getInPatients: (req, res)=>{
    Person.find({'record.visits.status':'admitted'},(e, patients)=>{
    if(!e){
 
      res.send(patients)
    }
    else{
      console.log(e)
    }
  })
},
getOrders: (req, res)=>{
 Person.find({},(e,patients)=>{
    if(!e){
     
      res.send(patients)
    }
    else{
      console.log(e)
    }
  })
},

updateBed: (req, res)=>{
  Client.findOneAndUpdate({
    _id: req.body.client._id,
 },{departments:req.body.client.departments},{ new: true},(e,client) => {
   if(!e) {
      Person.findOneAndUpdate({_id:req.body.patient._id},
        {record:req.body.patient.record},{new:true},(e,patient) => {
          if(!e){
            res.send({patient:patient,client:client})
          } else {
            console.log(e)
          }
        })
   } else {
     console.log(e)
   }
 })

},
updateInfo: (req, res)=>{
   Person.findByIdAndUpdate(req.body._id,{info:req.body.info},{new:true},(e, doc)=>{
      if(!e){
         res.send(doc);
      } else{
        console.log(e);
      }

    })
},
updateRecord: (req, res)=>{
   Person.findByIdAndUpdate(req.body._id,{record:req.body.record},{new:true},(e, doc)=>{
      if(!e){
        console.log(doc)
          res.send(doc);
      } else{
        console.log(e);
      }

    })
},
runTransaction: (req, res) => {
  req.body.patients.forEach(person => {
           Person.findOneAndUpdate({
            _id: person._id,
         },
         {'record.medications':person.record.medications},{new:true},(e,i) => {
           if(!e) {
             
           }
           else{
             console.log(e)
           }
         })
        
     })

     Client.findOneAndUpdate({
      'info.email':'mail@cityhospital.com' },
         {
           inventory:req.body.inventory},{new:true},(e,i) => {
           if(!e) {
              res.send({inventory:i})
           }
           else {
             console.log(e)
           }
        })
 
},

updateNote: (req, res)=>{
  Person.findOne({ _id:req.body.id} ,(e, doc) => {
     if(!e){
      doc.record.notes.push(req.body.note)
      doc.save((e,p)=>{
        if(!e){
          res.send(p)
        }
        else{
          console.log(e)
        }
      })
  } else {console.log(e)}
  })
},

updateMedication: (req, res) => {
 
  Person.findOneAndUpdate({_id:req.body.id },
     {
       'record.medications': req.body.medication
     },{new:true},(e, patient) => {
    if(!e){
      
      res.send(patient)
  } else {
    console.log(e)
  }
})

},


addProduct: (req, res)=>{
    Client.findOneAndUpdate({
    'info.email':'mail@cityhospital.com'},
    {
      $addToSet:{inventory:{$each:req.body}}},
      {new:true},
      (e, doc)=>{
        if(!e){
          res.send(doc.inventory)
        }else{
      console.log(e)
    }
  })
},

getProducts: (req, res)=>{
  Client.findOne({
    'info.email':'mail@cityhospital.com'
  },
      (err, client)=>{
      if(!err){
        
        res.send(client);
      }
      else{
        console.log(err);
      }
  })
},

updateProducts: (req, res)=>{
  Client.findOneAndUpdate({
     'info.email':'mail@cityhospital.com',
  },
  {
     inventory: req.body
  },{new:true}, (e, doc) =>{
   if(!e) {
    res.send(doc.inventory)
 } else {condole.log(e)}
})
},

deleteProducts: (req, res)=>{
  
  Client.findOneAndUpdate({
    'info.email':'mail@cityhospital.com'
  },
  {
    $pullAll:{
      inventory: req.body
   }
 },
 {new:true},
 (e, doc) => {
   if(!e){
     console.log(doc)
     res.send(doc.inventory)
 } else {condole.log(e)}
})

},

getItems: (req, res)=>{
  Item.find({}, (e,items)=>{
    if(!e){

      res.send(items);
    }
    else{
      console.log(err);
    }
  })

},



// checkSession: (req, res) => {
//   if (req.cookies.q) {
//     res.status(200).send('in session')
//   } else {
//     res.status(403).send('out of session')
//   }
// },

getPerson: function (req, res) {
  User.findOne({username: req.params.username}, (err, person) => {
    if (!err) {
      res.send(person)
    } else { console.log(err) }
  })
},
getMessages: function (req, res) {
  Messages.find({parties: {$in: [req.params.username, req.cookies.username]}}, 'chats', (err, chats) => {
    if (!err) {
      console.log(chats)
      res.send(chats)
    } else {}
  })
},

getNotifications: function (req, res) {
  Notifications.updateMany({to: req.cookies.username}, {$set: {seen: true}}, (err, note) => {
    if (err) {
      console.log(err)
    } else {
      console.log(note)
    }
  })
  Notifications.find({to: req.cookies.username}).populate('require', 'name username dp _id').exec((err, notes) => {
    if (!err) {
      
      res.send(notes)
    } else { console.log(err) }
  })
},
getNewNotifications: function (req, res) {
  Notifications.find({to: req.cookies.username, seen: false}, (err, notes) => {
    if (!err) {
    
      res.send(notes)
    } else { console.log(err) }
  })
},
getProfile: function (req, res) {
  User.find({username: req.cookies.username}, (err, prof) => {
    if (!err) {
  
      res.send(prof)
    } else { console.log(err) }
  })
},
comments: function (req, res) {
  res.render('comments')
},
getPeople: function (req, res) {
  User.find({}, 'name username dp address _id', (err, ppl) => {
    if (!err) {
      // console.log(ppl)
      res.send(ppl)
    } else {
       console.log(err)
       }
  })
},

index: function (req, res) {
  res.render('index')
  if (req.cookies.login === true) {

  }
  res.redirect(304, 'login')
}

}
