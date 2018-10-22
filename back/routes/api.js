// import { error } from 'util'

import Patient from '../models/schemas/patient'
import Client from '../models/schemas/clients'
import Staff from '../models/schemas/staffs'
import Record from '../models/schemas/record'
import Department from '../models/schemas/departments'
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

        new Client({main:req.body,staffs:[doc._id],departments:[{name:'INFORMATION',description:'Information and record management',
        dateCreated: new Date()}], dateCreated: new Date()}).save((err, newsetting) => {
          if (err) {
            console.log(err.stack)
          }else{
            // i = newsetting['_id']

            // res.cookie('i', i)

            setting = newsetting
          }
        });


        // res.cookie('e', i)
        // res.status(200).send(setting);
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


        Client.updateOne({'main.email':req.signedCookies.e}, {$push:{staffs:newstaff._id}},(err, doc)=>{
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
  addDept: (req, res)=>{
   

      Client.updateOne({'main.email':req.signedCookies.e}, {$addToSet:{departments:{$each:req.body}}},(err, docs)=>{
        if(err){
          console.log(err)
        }else{
          console.log(docs)
          res.status(200).send(docs)
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
        console.log(patients)
        res.status(200).send(patients)
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
  addRecord: (req, res)=>{
    new Record({
      pid: req.body.pid,
      complain:req.body.complain,
      piriod: req.body. piriod,
      systolic: req.body.systolic,
      dystolic: req.body.dystolic,
      resp: req.body.res,
      pulse: req.body.pulse,
      height: req.body.height,
      weight:req.body.weight,
      condition: req.body.condition,
      order: req.body.order,
      certainty: req.body.certainty,
      drug: req.body.drug,
      measure: req.body.measure,
      unit: req.body.unit,
      intake: req.body.intake,
      frequency: req.body.frequency,
      duration: req.body.duration,
      department: req.body.department,
      investigation: req.body.investigation,
      speciment: req.body.speciment,
      clinicalSumary: req.body.clinicalSumary

    }).save((err, newrecord) => {
      if (err) {
        console.log(err.stack)

      }

      res.status(200).send(newrecord)
    })
  },

 
  getContacts: function (req, res) {
    Contacts.findOne({username: req.cookies.username}).populate('contacts.userid contacts.messages').exec((err, con) => {
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
