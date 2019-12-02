const mongoose = require('../db');
const Scheema = mongoose.Schema;
const personScheema = new Scheema({
    info: {
        status: String,
        online: Boolean,
        lastLogin: Date,
        personal: {
            firstName: String,
            lastName: String,
            gender: String,
            dob: Date,
            avatar: String,
            cardType: String,
            cardNum: Number,
            bio: String,
            occupation: String,
            religion: String,
            tribe: String,
            mstatus: String,
            username: String,
            password: String,
            status: String

        },
        contact: {
            me: {
                mobile: Number,
                email: String,
                kinName: String,
                kinMobile: String,
                state: String,
                lga: String,
                address: String
            },
            emergency: {
                name: String,
                mobile: String,
                email: String,
                rel: String,
                occupation: String,
                address: String
            }
        },
        insurance: {
            rel: String,
            idNo: String,
            groupNo: String,
            subscriber: String,
            employer: String,
            ssn: String 
        },
        official: {
            hospital: {
                type: Scheema.Types.ObjectId,
                ref: 'Client'
            },
            id: String,
            department: String,
            role: String
        }

    },
    connections: {
        type: Scheema.Types.ObjectId,
        ref: 'Connection'
    },

    record: {
        complains: [
            [{
                complain: String,
                duration: Number,
                meta: {
                    addedBy: {
                        type: Scheema.Types.ObjectId,
                        ref: 'Person'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ],
        famHist: [{
            condition: String,
            meta: {
                addedBy: {
                    type: Scheema.Types.ObjectId,
                    ref: 'Person'
                },
                selected: Boolean,
                dateAdded: Date
            }
        }],
        notes: [{
            note: String,
            noteType: String,
            meta: {
                addedBy: {
                    type: Scheema.Types.ObjectId,
                    ref: 'Person'
                },
                selected: Boolean,
                dateAdded: Date
            }
        }],
        vitals: {
            bp: [{
                systolic: Number,
                dystolic: Number,
                meta: {
                    addedBy: {
                        type: Scheema.Types.ObjectId,
                        ref: 'Person'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            resp: [{
                value: Number,
                meta: {
                    addedBy: {
                        type: Scheema.Types.ObjectId,
                        ref: 'Person'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            pulse: [{
                value: Number,
                meta: {
                    addedBy: {
                        type: Scheema.Types.ObjectId,
                        ref: 'Person'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            height: [{
                value: Number,
                dateAdded: Date
            }],
            weight: [{
                value: Number,
                meta: {
                    addedBy: {
                        type: Scheema.Types.ObjectId,
                        ref: 'Person'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            tempreture: [{
                value: Number,
                meta: {
                    addedBy: {
                        type: Scheema.Types.ObjectId,
                        ref: 'Person'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            bloodGl: [{
                value: Number,
                meta: {
                    addedBy: {
                        type: Scheema.Types.ObjectId,
                        ref: 'Person'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        },
        conditions: [
            [{
                name: String,
                meta: {
                    addedBy: {
                        type: Scheema.Types.ObjectId,
                        ref: 'Person'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ],
        allegies: [{
            allegy: String,
            meta: {
                addedBy: {
                    type: Scheema.Types.ObjectId,
                    ref: 'Person'
                },
                selected: Boolean,
                dateAdded: Date
            }
        }],
        visits: [
            [{
                hospital: {
                    type: Scheema.Types.ObjectId,
                    ref: 'Client'
                },
                dept: String,
                status: String,
                visitedOn: Date,
                addmittedOn: Date,
                dischargedOn: Date,
                diedOn: Date,
                wardNo: Number,
                bedNo: Number
            }]
        ],

        cards: [{
            category: String,
            pin: String,
            meta: {
                addedBy: {
                    type: Scheema.Types.ObjectId,
                    ref: 'Person'
                },
                selected: Boolean,
                dateAdded: Date
            }
        }],
        appointments: [{
            title: String,
            setOn: Date,
            date: Date,
            time: String,
            attended: Boolean,
            meta: {
                addedBy: {
                    type: Scheema.Types.ObjectId,
                    ref: 'Person'
                },
                selected: Boolean,
                dateAdded: Date
            }
        }],
        medications: [
            [{
                name: String,
                priscription: {
                    intake: Number,
                    freq: String,
                    piriod: Number,
                    extend: String
                },
                meta: {
                    addedBy: {
                        type: Scheema.Types.ObjectId,
                        ref: 'Person'
                    },
                    selected: Boolean,
                    dateAdded: Date
                },

                lastTaken: Date,
                paused: Boolean,
                pausedOn: Date

            }]
        ],

        scans: [
            [{
                name: String,
                dept: String,
                treated: Boolean,
                bodyPart: String,
                meta: {
                    addedBy: {
                        type: Scheema.Types.ObjectId,
                        ref: 'Person'
                    },
                    selected: Boolean,
                    dateAdded: Date
                },
                report: {
                    comment: String,
                    attachments: [],
                    meta: {
                        addedBy: {
                            type: Scheema.Types.ObjectId,
                            ref: 'Person'
                        },
                        selected: Boolean,
                        dateAdded: Date
                    }
                }
              
            }]
        ],
        tests: [
            [{
                name: String,
                dept: String,
                treated: Boolean,
                meta: {
                    addedBy: {
                        type: Scheema.Types.ObjectId,
                        ref: 'Person'
                    },
                    selected: Boolean,
                    dateAdded: Date
                },
                report: {
                    comment: String,
                    attachments: [],
                    meta: {
                        addedBy: {
                            type: Scheema.Types.ObjectId,
                            ref: 'Person'
                        },
                        selected: Boolean,
                        dateAdded: Date
                    }
                }
            }]

        ],
        surgeries: [
            [{
                name: String,
                meta: {
                    addedBy: {
                        type: Scheema.Types.ObjectId,
                        ref: 'Person'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ],
        invoices: [
            [{
                name: String,
                desc: String,
                price: Number,
                quantity: Number,
                paid: Boolean,
                processed: Boolean,
                datePaid: Date,
                comfirmedBy: {
                    type: Scheema.Types.ObjectId,
                    ref: 'Person'
                },
                meta: {
                    addedBy: {
                        type: Scheema.Types.ObjectId,
                        ref: 'Person'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ]
    }
}, { timestamps: true, strict: false })

const Person = mongoose.model('Person', personScheema)
module.exports = Person;