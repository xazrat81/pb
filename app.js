const cors = require('cors')
const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()

// CORS enabling

const corsOptions = {
    origin: ['http://localhost', 'http://localhost:8080', 'http://10.0.8.19:8080', 'http://10.0.8.19', '10.0.8.19:8080', '10.0.8.19'],
    credentials: true
}
app.use(cors(corsOptions))

// Middlewares

app.use(express.json())
app.use(express.static(path.resolve(__dirname)))

// Creating SQL connection
const Sequelize = require('sequelize') 
const sequelize = new Sequelize('farid_pulsar', 'farid_farid', 'qazwsx@3366', {
    host: 'mikentosh.ru',
    dialect: 'mysql',
    define: {
        timestamps: false
    }
})
const Op = Sequelize.Op
const Department = sequelize.define('departments', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    parent_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    priority: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})

const Staff = sequelize.define('staff', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    department_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    position: {
        type: Sequelize.STRING
    },
    place: {
        type: Sequelize.STRING
    },
    phone_g: {
        type: Sequelize.STRING
    },
    phone_c: {
        type: Sequelize.STRING
    },
    phone_m: {
        type: Sequelize.STRING
    },
    view: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM('Проверен', 'Не проверен'),
        allowNull: false
    },
    reception: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    partnership: {
        type: Sequelize.STRING
    },
    photo: {
        type: Sequelize.TEXT
    }
}, { freezeTableName: true })

const Dol = sequelize.define('Dol', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    code: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        primaryKey: true
    }
}, { freezeTableName: true })

Staff.belongsTo(Dol, {
    as: 'staff_dol',
    foreignKey: 'position',
    targetKey: 'name'
})

//REST API

// Regulations

app.get('/api/regulations', (req, res) => {
    let tree = []

    let makeTree = (url, parent) => {
        
        fs.readdirSync(url, { encoding: 'utf-8', withFileTypes: true }).forEach(element => {
            if(element.isDirectory()) {
                if(parent === null) {
                    tree.push(element)
                } else {
                    parent.children.push(element)
                }
                makeTree(`${url}/${element.name}`, element)
            }
        })
    }
    makeTree('./assets/regulations', null)
    res.json(tree)

})

app.get('/api/regulations/folders/:foldername', (req, res) => {
    
    const files = fs.readdirSync(`./assets/regulations/${req.params.foldername}`, 'utf-8').map(file => {
        
        file = path.parse(file)
        file.path = `${req.params.foldername}/${file.base}`
        return file
    })
    res.json(files)
})

app.get('/api/regulations/download', (req, res) => {
    
    const file = path.resolve(`${__dirname}/assets/regulations/${req.query.path}`)
    res.download(file)
})

// UCP

app.get('/api/ucp', (req, res) => {
    
    const files = fs.readdirSync(`./assets/ucp`, 'utf-8').map(file => {
        
        file = path.parse(file)
        return file
    })
    res.json(files)
})

app.get('/api/ucp/download', (req, res) => {
    
    const file = path.resolve(`${__dirname}/assets/ucp/${req.query.path}`)
    res.download(file)
})

// Phonebook

app.get('/api/departments', (req, res) => {

    Department.findAll({
        raw: true,
        order: [
            [ 'parent_id', 'ASC' ],
            [ 'priority', 'ASC' ]
        ]
    }).then(departments => {
        const tree = sqlToJsonHierarchy(departments)
        res.json(tree)
    }).catch(err => {
        console.log('Error: ', err)
    })
})

app.get('/api/contacts/:id', (req, res) => {

    const depId = req.params.id

    Staff.findAll({
        raw: true,
        where: {
            department_id: depId,
            view: 1
        },
        include: [
            {
                model: Dol,
                as: 'staff_dol'
            }
        ]
    }).then(staff => {
        res.json(staff)
    }).catch(err => {
        console.log('Error: ', err)
    })
})

app.get('/api/search', (req, res) => {

    const searchVal = `%${req.query.val}%` 

    Staff.findAll({
        raw: true,
        where: {
            [Op.or]: [
                { name: { [Op.like]: searchVal } },
                { phone_c: { [Op.like]: searchVal } },
                { phone_g: { [Op.like]: searchVal } },
                { phone_m: { [Op.like]: searchVal } },
                { place: { [Op.like]: searchVal } },
            ]
        },
        include: [
            {
                model: Dol,
                as: 'staff_dol'
            }
        ]
    }).then(staff => {
        res.json(staff)
    }).catch(err => {
        console.log('Error: ', err)
    })
})



function sqlToJsonHierarchy(array) {

    let map = {};

    for(let i = 0; i < array.length; i++) {

        let arrayElement = array[i]
        
        arrayElement.children = []
        map[arrayElement.id] = arrayElement

        let parent = arrayElement.parent_id || '-'

        if(!map[parent]) {
            map[parent] = {
                children: []
            }
        }
        
        map[parent].children.push(arrayElement)
    }

    return map['-'].children
}



const PORT = 3500
app.listen(PORT, () => console.log(`Server has been started on port ${PORT}`))