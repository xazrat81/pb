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
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: Sequelize.ENUM('Проверен', 'Не проверен'),
        allowNull: false,
        defaultValue: 'Не проверен'
    },
    reception: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0
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
Staff.belongsTo(Department, {
    as: 'department',
    foreignKey: 'department_id',
    targetKey: 'id'
})

//REST API

// --------------------REGULATIONS----------------------

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

// -----------------UCP----------------------

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

// ------------------PHONEBOOK-----------------------
// Get all departments. Flat flag disables json hierarchy so all contacts will be in pne resulting array

app.get('/api/departments', (req, res) => {

    const isFlat = req.query.flat

    Department.findAll({
        raw: true,
        order: [
            [ 'parent_id', 'ASC' ],
            [ 'priority', 'ASC' ]
        ]
    }).then(departments => {
        if(!isFlat) {
            const tree = sqlToJsonHierarchy(departments)
            res.json(tree)
        } else {
            res.json(departments)
        }
    }).catch(err => {
        console.log('Error: ', err)
    })
})

app.get('/api/department/:id', (req, res) => {

    const dep_id = req.params.id

    Department.findAll({
        raw: true,
        where: {
            id: dep_id
        }
    }).then(departments => {
        res.json(departments)
    }).catch(err => {
        console.log('Error: ', err)
    })
})

// Get contact by department id

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

// Method for contact searching. Admin flag is used for viewing invisible to other users contacts 

app.get('/api/search', (req, res) => {

    const searchVal = `%${req.query.val}%` 
    const isAdmin = req.query.admin
    const conditions = {
        [Op.or]: [
            { name: { [Op.like]: searchVal } },
            { phone_c: { [Op.like]: searchVal } },
            { phone_g: { [Op.like]: searchVal } },
            { phone_m: { [Op.like]: searchVal } },
            { place: { [Op.like]: searchVal } },
        ]
    }
    if(!isAdmin) conditions.view = 1

    Staff.findAll({
        raw: true,
        where: conditions,
        include: [
            {
                model: Dol,
                as: 'staff_dol'
            },
            {
                model: Department,
                as: 'department'
            }
        ]
    }).then(staff => {
        res.json(staff)
    }).catch(err => {
        console.log('Error: ', err)
    })
})

// Update method for admin panel. Updates contact according to data sent by user with admin rights

app.patch('/api/contacts/:id', (req, res) => {

    Staff.update({
        name: req.body.name,
        department_id: req.body.department_id,
        position: req.body.position,
        place: req.body.place,
        phone_g: req.body.phone_g,
        phone_c: req.body.phone_c,
        phone_m: req.body.phone_m,
        video_phone: req.body.video_phone,
        view: req.body.view
    }, { where: { id: req.body.id } }).then(staff => {
        res.json({ message: 'Успешно обновлено' })
    }).catch(err => {
        res.json({ message: 'Произошла ошибка при обновлении данных', error: err })
    })
})

// Create method for admin panel. Creates new contact.

app.post('/api/contacts/create', (req, res) => {

    Staff.create({
        name: req.body.name,
        department_id: req.body.department_id,
        position: req.body.position,
        place: req.body.place,
        phone_g: req.body.phone_g,
        phone_c: req.body.phone_c,
        phone_m: req.body.phone_m,
        video_phone: req.body.video_phone,
        view: req.body.view
    }).then(staff => {
        res.json({ message: 'Запись успешно создана', data: staff })
    }).catch(err => {
        res.json({ message: 'Произошла ошибка при создании записи в базе данных', error: err })
    })
})

// Delete contacts by id

app.delete('/api/contacts/:id', (req, res) => {

    const contactId = req.params.id

    Staff.destroy({
        where: {
            id: contactId
        }
    }).then(staff => {
        res.json({ message: 'Запись успешно удалена' })
    }).catch(err => {
        res.json({ message: 'Произошла ошибка при удалении записи из базы данных', error: err })
    })
})

app.get('/video', (req, res) => {
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
    makeTree('./assets/video', null)
    res.json(tree)
})

app.get('/video/folder/:name', (req, res) => {

    const folderName = req.params.name
    const files = fs.readdirSync(`./assets/video/${folderName}`, { encoding: 'utf-8', withFileTypes: true })

    res.json(files)
})

app.get('/video/:path', (req, res) => {
    const videoPath = path.resolve(`${__dirname}/assets/video/${req.params.path}`)
    const stat = fs.statSync(videoPath)
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1
        const chunksize = (end-start)+1
        const file = fs.createReadStream(videoPath, {start, end})
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(videoPath).pipe(res)
    }
})

// ----------------------------------------------------------

// Utility function to make JSON hierarchy from SQL flat data.

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

// Server settings

const PORT = 3500
app.listen(PORT, () => console.log(`Server has been started on port ${PORT}`))