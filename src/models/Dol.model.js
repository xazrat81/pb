const Sequelize = require('sequelize')
const sequelize = require('../sequelize')

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

module.exports = Dol