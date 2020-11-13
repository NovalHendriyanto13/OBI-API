const path = require('path')
const mysql = require('mysql2/promise')

const config = require(path.resolve('config/config'))

module.exports.db = async() => {
    return await mysql.createPool({
        host: config.db.host,
        user: config.db.user,
        database: config.db.name,
        password: config.db.pass,
        port: config.db.port
    })
}