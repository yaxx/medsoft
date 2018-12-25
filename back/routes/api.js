// import { error } from 'util'

import Patient from '../models/schemas/patient'
import Client from '../models/schemas/clients'
import Staff from '../models/schemas/staffs'
import Record from '../models/schemas/record'
import Item from '../models/schemas/items'
import Department from '../models/schemas/departments'
import multer from 'multer'
import path from  'path';
import { truncate } from 'fs';
var Notifications = require('../models/schemas/noteschema')
var Contacts = require('../models/schemas/contactschema')
var Messages = require('../models/schemas/messageschema')


let name = null
const store = multer.diskStorage({
 destination:'../uploads',
 filename: (req, file, cb) => {
   name = req.id + '-' +Date.now() +path.extname(file.fieldname)
 cb(null, name)
}
})
const upload = multer({
  storage: store
}).single('scan')

module.exports = {
uploadFile: (req, res)=>{
  console.log(req.body)
  multer(req, res, (err)=>{
    if(err){
      console.log(err)
    }else{
      Patient.findOne({ _id:req.body.id} ,(e, doc) => {
        if(!e){
          doc.record.scans.push(name)
          doc.save((e,p)=>{
            if(!e){
              res.send(p)
            }
            else{
              console.log(e)
            }
          })
      } else {console.log(e)}
      }
    )
    }
  })
  
},
addSettings: (req, res)=>{
  // console.log(req.body);
  let d = req.body.depts;
  let s = req.body.staffs;


  Staff.insert(s, (e, staff)=>{
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

  let setting;
  res.cookie('e', req.body.email, {signed:true});
  new Staff({firstName:req.body.name, department:'Admin', username:'admin', role:'Admin',password:req.body.pwd }).save((e, doc)=>{
    if(e){
      console.log(e);
    }else{

      new Client({main:req.body,departments:[{name:'INFORMATION',description:'Information and record management',
      dateCreated: new Date()},{name:'CONSULTING',description:'General Medical Consultation',
      dateCreated: new Date()}], inventory: [], staffs:[doc._id], dateCreated: new Date()}).save((err, newsetting) => {
        if (err) {
          console.log(err.stack)
        }else{
          setting = newsetting
        }
      });

    }
  })

  res.status(200).send(setting);
},
login: function (req, res) {

  Staff.findOne({username: req.body.username, password: req.body.password},  (err, staff) => {
    if(staff !== null){
      console.log(staff)
      res.cookie('s', {s:staff.username,p:staff.password,h:staff.hosId},{signed:true});
      res.status(200).send(staff)
    }else{

      console.log(err);
      res.status(500).send('Invalid credentials');
    }

  })
},

getClient: (req, res)=>{
  Client.findOne({"main.email":"mail@cityhospital.com"}
  ).populate('staffs').exec((err, client)=>{
    if(!err){
      // console.log(req.signedCookies.e)
      // console.log(settings)
      res.send(client)
    }
    else{
      console.log(err)
    }
    });
},

addStaff: (req, res)=>{
    new Staff(req.body).save((err, newstaff) => {
    if (err) {
      console.log(err.stack)
    }else{
      Client.findOneAndUpdate({
        'main.email':req.signedCookies.e
      },{
          $push:{
            staffs: newstaff._id
          }
        },{
            new:true,upsert: false,sort:'firstName',select:'staffs'
          },
          (err, doc)=>{
            if(err){
                console.log(err)
          }else{
            console.log(req.signedCookies.e);
          }
        })
    }
    res.status(200).send(newstaff)
  });
},
updateStaff: (req, res)=>{
  console.log(req.body);
  Staff.findOneAndUpdate({
    '_id':req.body._id
  },
  req.body,{
    new:true
  },(e, doc)=>{
      res.send(doc);
  }

  )
},
deleteStaff: (req, res)=>{
  Staff.findByIdAndRemove(req.body._id).exec((e, docs)=>{
    if(!e){
      Client.findOneAndUpdate({
        _id:req.body.hosId
      },{
        $pull:{
          staffs:req.body._id
        }
      })
      res.send(docs)
    }else{
      console.log(e);
    }
  })

},
addDept: (req, res)=>{
  console.log(req.body)
    Client.findOneAndUpdate({
      'main.email':'mail@cityhospital.com'}, {
        $push:{departments:req.body}},{
          new:true
        }, (err, docs)=>{
      if(err){
        console.log(err)
      }else{
        console.log(docs)
        res.status(200).send(docs.departments)
      }
    })
},

addPatient: (req, res)=>{
  console.log(req.body);
      new Patient(req.body).save((e, patient)=>{
      if(e){
        console.log(e);
      } else {
        res.status(200).send(patient)
          // new Patient({
          // personal: req.body.personal,
          // contact: req.body.contact,
          // insurance: req.body.insurance,
          // record: info._id,
          // dateCreated: new Date()


        // })
    }
    })
},
getPatients: (req, res)=>{
  Patient.find({},(e, patients)=>{
    if(!e){
      console.log(patients)
      res.status(200).send(patients)
    } else {
      console.log(e);
    }
  })


},
getConsultees: (req, res)=>{
  Patient.find({
    'record.visits.status':'queued'
  },(e, patients)=>{
    if(!e){
      console.log(patients)
      res.send(patients)
    } else {
      console.log(e)
    }

  })
},

getInPatients: (req, res)=>{
  Patient.find({'record.visits.status':'admitted'},(e, patients)=>{
    if(!e){

      res.send(patients)
    }
    else{
      console.log(e)
    }
  })
},
getOrders: (req, res)=>{
  Patient.find({},(e,patients)=>{
    if(!e){
      res.send(patients)
    }
    else{
      console.log(e)
    }
  })
},
getDepartments: (req, res)=>{
  Department.find({'record.medications':{$size:{$gt:0}}}, (err, departments)=>{
    if(!err){
      res.send(departments);
    }
    else{
      console.log(err);
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
            
              Patient.findById(req.body.patient._id,(e,p)=>{
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
updateRecord: (req, res)=>{
   console.log(req.body._id)
    Patient.findByIdAndUpdate(req.body._id,{record:req.body.record},{new:true},(e, doc)=>{
      if(!e){
        console.log(doc.record.medications);
        res.send(doc);
      } else{
        console.log(e);
      }

    })
},
runTransaction: (req, res)=>{
   
    Patient.findByIdAndUpdate(req.body.patient._id,{record:req.body.patient.record},{new:true},(e, p)=>{
      if(!e){
        Client.findOneAndUpdate({
          'main.email':'mail@cityhospital.com',
     
       },
       {inventory:req.body.inventory},{new:true},(e,i)=>{
         if(!e){
           console.log(i)
           console.log(p)
           res.send({pateint:p,inventory:i})
         }
         else{
           console.log(e)
         }

       })
        
      } else{
        console.log(e);
      }

    })
},

updateNote: (req, res)=>{
  console.log(req.body)
  Patient.findOne({ _id:req.body.id} ,(e, doc) => {
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
  }
 
 )
},
updateMedication: (req, res)=>{
  Record.findOneAndUpdate({
    "_id":"5bc9ff14c720e10ae8ea2f90",
    "medications._id" :req.body.medication._id
  },
  {
    $set:{
    "medications.$.product": req.body.medication.product,"medications.$.priscription": req.body.medication.priscription
  }
},{new:true},(e, doc) =>{
    if(!e){
      res.send(doc.medications)
  } else {condole.log(e)}
})

},


addProduct: (req, res)=>{
    Client.findOneAndUpdate({
    'main.email':'mail@cityhospital.com'},
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
    'main.email':'mail@cityhospital.com'
  },
   
      (err, client)=>{
      if(!err){
        console.log(client.inventory)
        res.send(client);
      }
      else{
        console.log(err);
      }
  })
},

updateProducts: (req, res)=>{
  Client.findOneAndUpdate({
     'main.email':'mail@cityhospital.com',
     'inventory._id':req.body._id
  },
  {
    $set:{
     "inventory.$.item": req.body.item,
     "inventory.$.stockInfo": req.body.stockInfo
   }
 },
 {new:true},
 (e, doc) =>{
   if(!e){
    res.send(doc.inventory)
 } else {condole.log(e)}
})

},

deleteProducts: (req, res)=>{
  console.log(req.body)
  Client.findOneAndUpdate({
    'main.email':'mail@cityhospital.com'
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





getContacts: function (req, res) {
  Contacts.findOne({
    username: req.cookies.username})
    .populate('contacts.userid contacts.messages')
    .exec((err, con) => {
      if (err) {
        console.log(err)
      } else {
        console.log(con)
        res.send(con)
      }
  })
},

checkSession: (req, res) => {
  if (req.cookies.q) {
    res.status(200).send('in session')
  } else {
    res.status(403).send('out of session')
  }
},

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
      console.log(notes)
      res.send(notes)
    } else { console.log(err) }
  })
},
getNewNotifications: function (req, res) {
  Notifications.find({to: req.cookies.username, seen: false}, (err, notes) => {
    if (!err) {
      console.log(notes)
      res.send(notes)
    } else { console.log(err) }
  })
},
getProfile: function (req, res) {
  User.find({username: req.cookies.username}, (err, prof) => {
    if (!err) {
      console.log(prof)
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
    } else { console.log(err) }
  })
},

index: function (req, res) {
  res.render('index')
  if (req.cookies.login === true) {

  }
  res.redirect(304, 'login')
}

}
