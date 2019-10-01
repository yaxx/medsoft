patients = Array.from(patients).map(p => p.toJSON()).map(patient => {
      let {record: {vitals}, record: {complains}, record: {visits}, record: {medications}, record: {tests}, record:{surgeries}, record: {famHist}, record:{notes}, record: {conditions}, record: {allegies}, record: {appointments}, record: {scans}} = patient
      return ({
        ...patient, record: {...patient.record, vitals: {...vitals, bp: vitals.bp.map(b => ({
        _id: b._id,
        value: b.value,
        meta: {
          addedBy: null, 
          selected: false,
          dateAdded: b.dateCreated
        }
      })),
      resp: vitals.resp.map(rs => ({
        _id: rs._id,
        value: rs.value,
        meta: {
          addedBy: null, 
          selected: false, 
          dateAdded: rs.dateCreated
        }
      })),
      pulse: vitals.pulse.map(p => ({
        _id: p._id,
        value: p.value,
        meta: {
          addedBy: null, 
          selected: false, 
          dateAdded: p.dateCreated
        }
      })),
      bloodGl: vitals.bloodGl.map(bg => ({
        _id: bg._id,
        value: bg.value,
        meta: {
          addedBy: null, 
          selected: false, 
          dateAdded: bg.dateCreated
        }
      })),
      tempreture: vitals.tempreture
      .map(t => ({
        _id: t._id,
        value: t.value,
        meta: {
          addedBy: null, 
          selected: false, 
          dateAdded: t.dateCreated
        }
      })),
      height: vitals.height.map(h => ({
        _id: h._id,
        value: h.value,
        meta: {
          addedBy: null, 
          selected: false, 
          dateAdded: h.dateCreated
        }
      })),
      weight: vitals.weight.map(w => ({
        _id: w._id,
        value: w.value,
        meta: {
          addedBy: null, 
          selected: false, 
          dateAdded: w.dateCreated
        }
      }))
    },
    famHist: famHist.map(hist=>({
      condition: famHist.condition,
      meta: { 
        addedBy: null,
        dateAdded: famHist.dateCreated
      }
    })),
    allegies: allegies.map(a=>({
      allegy: allegies.allegy,
       meta: { 
        addedBy: null,
        dateAdded: famHist.dateCreated
      }
    })),
    complains: complains.map(comp => comp.map(c => ({
        complain: c.complain,
        duration: c.duration,
        meta: {
          addedBy: c.by,
          dateAdded: c.dateCreated,
          selected: false
        }
      }))),
    conditions: conditions.map(cond => cond.map(c => ({
        condition: c.condition,
        duration: c.duration,
        meta: {
          addedBy: c.by,
          dateAdded: c.dateCreated,
          selected: false
        }
      }))),
      medications: medications.map(med => med.map(m => ({
          name: m.product.item.name,
          stockInfo: m.product.stockInfo,
          priscription: m.priscription,
          invoice: {
            comfirmedBy: null,
            paid: m.paid,
            quantity: m.purchased,
            price: m.product.stockInfo.price,
            datePaid: null
          },
          meta: {
            addedBy: m.by,
            selected: false,
            dateAdded: m.dateCreated
        },
        lastTaken: m.lastTaken,
        paused: m.paused,
        pausedOn: m.pausedOn
      }))),
      notes: notes.map(note => ({
        note: note.note,
        type: note.noteType,
        meta: { 
          addedBy: note.by,
          dateAdded: note.dateCreated
        }
      })),
      visits: visits,
      appointments: appointments.map(ap => ({
        title: ap.title,
        date: ap.date,
        time: ap.time,
        attended: ap.attended,
        meta: {
            addedBy: ap.by,
            selected: false,
            dateAdded: ap.setOn
        }
      })),
      scans: scans.map(scan => scan.map(s => ({
        scan: s.description,
        attatchment: s.name,
        invoice: {
          comfirmedBy: null,
          paid: false,
          quantity: 1,
          price: 0,
          datePaid: null
        },
        meta: {
          addedBy: s.by,
          dateAdded: new Date(),
          selected: false
        }
      }))),
      tests: [tests]
    }})
  })


for (p of patients) {
     Person.findByIdAndUpdate( mongoose.Types.ObjectId(p._id),{"record": p.record}, {new: true}, (e, data) => {
       if(e) {
         console.log(e)
       }
       console.log(data.record.notes)
     })
      
  }