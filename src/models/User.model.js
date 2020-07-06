const Sequelize = require('sequelize')
const sequelize = require('../sequelize')

const User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    user_ip: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    user_hash: {
        type: Sequelize.STRING,
        allowNull: false
    },
    login: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Prava: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, { freezeTableName: true })

module.exports = User