const Sequelize = require('sequelize')
const sequelize = require('../sequelize')

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

module.exports = Department