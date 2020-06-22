const Sequelize = require('sequelize')
const sequelize = require('../sequelize')

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
    video_phone: {
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

module.exports = Staff