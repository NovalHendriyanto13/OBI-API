'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables
const Model = require(config.model_path + '/Model')

class Bid extends Model {
    constructor() {
        super()
        this.tablename = table.bid
    }
}

module.exports = Bid