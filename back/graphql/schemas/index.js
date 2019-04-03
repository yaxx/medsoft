
const {buildSchema} = require('graphql')
module.exports  = buildSchema (`

    type Details {
        name: String
        category: String
        ownership: String
        specialization: String
        mobile: String
        email: String
        dp: String 
        city: String
        zipcode: String
        address: String
        expiry: String
        password: String
    }
    type Bed {
        number: Int
        allocated: Boolean
        dateCreated: String
    }
    type Department { 
        name: String
        hasWard: Boolean
        numOfBeds: Int
        beds: [Bed!]!
        descriptions: String
        dateCreated: String        
    }
    type Item {
        _id: ID!
        name: String
        mesure: Int
        unit: String
        description: String
        brand: String
        dateCreated: String
    }
    type StockInfo {
        expiry: String
        price: Int
        sold: Int 
        expired: Boolean
        status: Boolean
        quantity: Int
    }
    type Product {
        item: Item
        stockInfo: StockInfo
    }
    type Client {
        info: Details
        departments:[Department!]!
        inventory: [Product!]!
        staffs: [Person!]!
        
    }

    type  Personal {
        firstName: String!
        lastName: String!
        gender: String
        dob: String!
        avatar: String 
        cardType: String
        cardNum: String
        bio: String,
        occupation: String
        religion: String
        tribe: String
        mstatus: String
        username: String
        password: String
        status: String
    }

    type Me {
        mobile: String
        email: String
        state: String
        lga: String
        address: String
    }

    type Emergency {
        name: String
        mobile: String
        email: String
        rel: String
        occupation: String
        address: String
    }

    type Contact {
        me: Me
        emergency: Emergency
    }

    type Info {
        personal: Personal
        contact: Contact
    }

    type Person {
        info: Info
        date: String
    }

    input item {
        name: String
        mesure: Int
        unit: String
        description: String
        brand: String
        dateCreated: String
    }
    
    
    input department {
        name: String
        hasWard: Boolean
        numOfBeds: Int
        descriptions: String
        dateCreated: String    
    }
    

    type RootQuery {
        person: [Person!]!
        items : [Item!]!
    }
    type RootMutation {
        createItem(item: item): Item
        createDepartment(dept: department): Department
    }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`

)