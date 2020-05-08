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
// const mysql = require('mysql')
// const pool = mysql.createPool({
//     host: 'mikentosh.ru',
//     user: 'farid_farid',
//     password: 'qazwsx@3366',
//     database : 'farid_pulsar'
// })

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

    // pool.query(`SELECT * FROM departments ORDER BY parent_id, priority ASC`, (err, results, fields) => {

    //     if(err) {
    //         console.error('Error occured during querying database', err)
    //     }
    //     console.log(req.headers.origin)

    //     let queryResult = results
    //     queryResult = sqlToJsonHierarchy(queryResult)
    //     res.json(queryResult)
    // })
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

    pool.query(`SELECT staff.id, staff.department_id, staff.name, staff.position, staff.place, staff.phone_g, 
        staff.phone_c, staff.phone_m, staff.view, Dol.name AS d_name, Dol.code FROM staff 
        LEFT JOIN Dol ON staff.position = Dol.name 
        WHERE staff.department_id = ? AND staff.view = 1
        ORDER BY -Dol.code DESC`, [req.params.id], (err, results, fields) => {
        
        if(err) {
            console.error('Error occured during querying database', err)
        }

        let queryResult = []
        queryResult = results
        res.json(queryResult)
    })
})

app.get('/api/search', (req, res) => {

    const searchVal = `%${req.query.val}%` 

    pool.query(`SELECT staff.id, staff.department_id, staff.name, staff.position, staff.place, staff.phone_g, 
        staff.phone_c, staff.phone_m, staff.view, Dol.name AS d_name, Dol.code FROM staff 
        LEFT JOIN Dol ON staff.position = Dol.name 
        WHERE CONCAT_WS('', staff.name, staff.phone_c, staff.phone_g, staff.phone_m, staff.place) LIKE ? 
        AND staff.view = 1
        ORDER BY -Dol.code DESC`, [searchVal], (err, results, fields) => {
        
        if(err) {
            console.error('Error occured during querying database', err)
        }

        let queryResult = []
        queryResult = results
        res.json(queryResult)
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