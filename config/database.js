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

module.exports.tables = {
    user : 'ms_user',
    auction : 'ms_auctions',
    auction_detail : 'ms_auctions_unit',
    unit : 'ms_unit',
    area : 'ms_wilayah',
    npl : 'ms_npl',
    brand : 'ms_merk'
}