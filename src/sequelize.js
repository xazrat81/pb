const Sequelize = require('sequelize')
const resource = require('./sqlConnection')

const sequelize = new Sequelize(resource.dev.db, resource.dev.user, resource.dev.password, {
    host: resource.dev.host,
    dialect: 'mysql',
    define: {
        timestamps: false
    }
})

module.exports = sequelize