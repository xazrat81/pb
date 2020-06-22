const Sequelize = require('sequelize')
const resource = require('./sqlConnection')

const sequelize = new Sequelize(resource.prod.db, resource.prod.user, resource.prod.password, {
    host: resource.prod.host,
    dialect: 'mysql',
    define: {
        timestamps: false
    }
})

module.exports = sequelize