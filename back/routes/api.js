// import { error } from 'util'

import Person from '../models/schemas/person'
import Client from '../models/schemas/client'
// importPerson from '../models/schemas/staffs'
// import Record from '../models/schemas/record'
import Item from '../models/schemas/item'
import Department from '../models/schemas/department'
import multer from 'multer'
import path from  'path';
import { truncate } from 'fs';

var Notifications = require('../models/schemas/noteschema')
var Connection = require('../models/schemas/connection')
// var Messages = require('../models/schemas/messageschema')
let name = null
const store = multer.diskStorage({
 destination:'./uploads',
 filename: (req, file, cb) => {
 cb(null, Date.now() + path.extname(file.originalname))
}
})
const upload = multer({
  storage: store
}).single('file')

module.exports = {
uploadFile: (req, res)=>{
  upload(req, res, (err)=>{
    if(err){
     return res.status(501).jason({error:err})
    }else{

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

addPerson: (req, res)=>{
  Person.findOne({'info.contact.mobile':req.body.info.contact.mobile},(e, existed)=>{
    if(existed){
        res.status(400).send(existed)
    }else{
      new Person(req.body).save((e, newPerson)=>{
        if(e){
          console.log(e);
        } else {
          if(newPerson.info.official.hospId){
            Client.findOneAndUpdate({
              _id:newPerson.info.official.hospId
            },{
              $push:{
                staffs:newPerson._id
              }
            },(e,client)=>{
              if(e){
                console.log(e)
              }else{
                console.log(client)
              }
            })
           
          } else {

          }
         
          res.status(200).send(newPerson)
      }
    })
    }
  })
},
getPatients: (req, res)=>{
 Person.find({$where: 'this.record.visits.length'},(e, patients)=>{
    if(!e){
           res.status(200).send(patients)
           
    } else {
      console.log(e);
    }
  })
},
addSettings: (req, res)=>{
  // console.log(req.body);
  let d = req.body.depts;
  let s = req.body.staffs;
  Person.insert(s, (e, staff)=>{
    let a = [];
    if(e){
      console.log(e)
    }else{
      Client.updateOne({_id:req.signedCookies},{$addToSet:{ staffs:staff._id}}, {new: true},(e, docs)=>{
        if(e){
          console.log(e)
        } else {
          console.log(docs)
        }
      })
      res.status(200).send(docs)
    }
  });


},
addClient: (req, res)=>{
Client.find({ $or: [{email:req.body.info.email},{mobile:req.body.info.mobile}]},(e, client)=>{
  if(client.length>0){
    res.status(500).send(client)
  }else{
    new Client(req.body).save((err, client) => {
      if (err) {
        console.log(err.stack)
      }else{
        res.send(client);
      }
    });
  }
})
 
},
getConnections: (req, res) => {
  Connection.findOne({ _id: req.params.id})
    .populate('people.person')
    .exec((err, con) => {
      if (err) {
        console.log(err)
      } else {
        res.send(con)
      }
  })
},

getMyAccount: (req, res)=> {
  Person.findById(req.cookies.i)
  .populate('connections')
  .populate('people.person')
  .exec((err, person) => {
    if(!err){
      Connection.findOne({ _id: person.connections})
      .populate('people.person')
      .exec((err, con) => {
        if (err) {
          console.log(err)
        } else {

          res.send({p:person, c:con})
        }
    })

      }
    else{
      console.log(err)
    }
  });
},
followPerson: (req, res)=>{
  console.log(req.body)
  Connection.findOneAndUpdate({_id: req.body.myconnect._id},{people:req.body.myconnect.people}, {new:true},(e, me)=>{
    if(!e){
      Connection.findOneAndUpdate({_id: req.body.yourconnect._id},req.body.yourconnect,{new:true},(e, you)=>{
        if(!e){
          res.send({myconnect:me, yourconnect:you})
        }else{
          console.log(e)
        }
      })
    }else{
      console.log(e)
    }
  })

},

followBack: (req, res)=>{
  console.log(req.body)
  Connection.findOneAndUpdate({_id: req.body.yourcon,"people.person":req.cookies.i},{$set:{"people.$.follower":true},$push:{notifications:req.body.note}}, {new:true},(e, me)=>{
    if(!e){
      Connection.findOneAndUpdate({_id: req.body.id,"people.person":req.body.yourid},{$set:{"people.$.following":true}},{new:true},(e, myconn)=>{
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
unFollow: (req, res)=>{
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
  console.log(data)
  Connection.findOneAndUpdate({'people.person': data.sender},{$set:{"people.$.conversations": data.convs}},(e, me)=>{
    if(!e){
      Connection.findOneAndUpdate({'people.person': data.reciever},{$set:{"people.$.conversations": data.convs}},(e, myconn)=>{
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

explore:(req, res)=>{

  Person.find({'info.official.hospId':req.cookies.h})
  .populate('connections')
  .exec((err, people) => {
    if(!err){

      res.send(people);
      }
    else{
      console.log(err)
    }
    });
},
login:(req, res)=>{
  console.log(req.body)
  if(req.body.username.includes('@')){ 
    Client.findOne({"info.email": req.body.username, "info.pwd": req.body.pwd},  (err, client) => {
      if(client !== null){
            res.status(200).send(client);
      } else {
        res.status(400).send('Invalid credentials');
      }
    })
  } else {
    Person.findOne({"info.personal.username": req.body.username, "info.personal.password": req.body.pwd},  (err, person) => {
      if(person) {
        res.status(200).send(person)
      } else {
        res.status(400).send('Invalid credentials');
      }
    })
  }
},
  
getClient: (req, res)=>{
  Client.findOne({_id:req.cookies.i}
  ).populate('staffs').exec((err, client) => {
    if(!err){
        Department.find({}, (err, departments)=>{
        if(!err){
        
          res.send({client:client, departments:departments});
        }
        else{
          console.log(err);
        }
      })
    }
    else{
      console.log(err)
    }
  });
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
  console.log(req.body)
    Client.findOneAndUpdate({
      _id:req.cookies.i}, {$set:{
        info:req.body.info,
        departments:req.body.departments,
        inventory:req.body.inventory
      }},{new:true},(err, docs)=>{
      if(err){
        console.log(err)
      }else{
        console.log(docs)
        res.status(200).send(docs)
      }
    })
},


getConsultees: (req, res)=>{
 Person.find({
    'record.visits':{$size:{'dept':req.params.mydept,status:'queued'}}
  },(e, patients)=>{
    if(!e){
 
      res.send(patients)
    } else {
      console.log(e)
    }

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
    console.log(req.body)
    Client.findById(
       req.body.cid, (e, client)=>{
        if(e){
          console.log(e)
        }else{

          client.departments = req.body.departments
          client.save((e,cl)=>{
            if(e){
              console.log(e)
            }else{

             Person.findById(req.body.patient._id,(e,p)=>{
                if(e){
                  console.log(e)
                }else{
                  p.record.visits = req.body.patient.record.visits

                  p.save((e, patient)=>{
                    if(e){
                      console.log(e)
                    }else{
                      res.send(patient)
                    }
                  })
                }
              })
            }
          })
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
  Notifications.find({to: req.cookies.username}).populate('from', 'name username dp _id').exec((err, notes) => {
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
