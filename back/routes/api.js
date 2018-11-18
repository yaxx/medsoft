// import { error } from 'util'

import Patient from '../models/schemas/patient'
import Client from '../models/schemas/clients'
import Staff from '../models/schemas/staffs'
import Record from '../models/schemas/record'
import Item from '../models/schemas/items'
import Department from '../models/schemas/departments'
import { truncate } from 'fs';
var Notifications = require('../models/schemas/noteschema')
var Contacts = require('../models/schemas/contactschema')
var Messages = require('../models/schemas/messageschema')

module.exports = {
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

  getSettings: (req, res)=>{
    Client.findOne({'main.email':req.signedCookies.e}
    ).populate('staffs').exec((err, settings)=>{
      if(!err){
        console.log(req.signedCookies.e)
        console.log(settings)
        res.send(settings)
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
    // .exec(e, docs)=>{
    //   if(!e){
    //     Client.findOneAndUpdate({
    //       _id:req.body.hosId
    //     },{
    //     $pull:{
    //       staffs: req.body._id
    //    }
    //   }
    //     )
    //   }
    // })
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
        new Record(req.body.record).save((e, info)=>{
        if(e){

          console(e);
        } else{
          var p = null;
            new Patient({
            personal: req.body.personal,
            contact: req.body.contact,
            insurance: req.body.insurance,
            record: info._id,
            dateCreated: new Date()


          }).save((err, newpatient) => {
            if (err) {
              console.log(err)
            }else{
              Patient.findOne({_id: newpatient._id}).populate('record').exec((e, patients)=>{
                if(!e){
                  console.log(patients)
                  res.status(200).send(patients)
                }else{
                  console.log(e);
                }
              })
          }
        })

        }
      })

  },
  getPatients: (req, res)=>{
    Patient.find().populate('record').exec((e, patients)=>{
      if(!e){
        console.log(patients)
        res.status(200).send(patients)
      }else{
        console.log(e);
      }
    })
  },
  getConsultees: (req, res)=>{
    Patient.find({'personal.curentStatus':'queued'}).populate({path:'record', match:{visits: {$size:1}}}).exec((e, patients)=>{
      if(!e){

        res.status(200).send(patients)
      }else{
        console.log(e);
      }
    })
  },
  getOrders: (req, res)=>{
    Patient.find({}).populate({path:'record', match:{medications: {$size:2}}, select:'_id medications'}).exec((e, patients)=>{
      if(!e){
        res.status(200).send(patients.filter((p)=>p.record !== null))
      }else{
        console.log(e);
      }
    })
  },

  getDepartments: (req, res)=>{
    Department.find({}, (err, departments)=>{
      if(!err){
        res.send(departments);
      }
      else{
        console.log(err);
      }
    })
  },


  updateRecord: (req, res)=>{
   console.log(req.body)
    Record.findById({"_id":"5bc9ff14c720e10ae8ea2f90"},(e, doc)=>{
      if(!e){
        doc.vitals.bp.push(req.body.record.vitals.bp)
        doc.vitals.pulse.push(req.body.record.vitals.pulse)
        doc.vitals.resp.push(req.body.record.vitals.resp)
        doc.vitals.height.push(req.body.record.vitals.height)
        doc.vitals.weight.push(req.body.record.vitals.weight)
        doc.vitals.bloodGl.push(req.body.record.vitals.bg)
        doc.conditions.push(req.body.record.conditions)
        doc.complains.push(req.body.record.complains)
        doc.famHist.push(req.body.record.famHist)
        doc.notes.push(req.body.record.notes)
        doc.allegies.push(req.body.record.allegies)
        doc.medications =  doc.medications.concat(req.body.medications)
        doc.save((e, doc)=>{
          if(!e){
            res.send(doc)
          }  else{
            console.log(e);
          }
        })
      } else{
        console.log(e);
      }

    })
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
    },
    {new:true},
    (e, doc) =>{
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
    {_id:0, inventory:1},
      (err, products)=>{
      if(!err){
        res.send(products);
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
