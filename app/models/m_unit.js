'use strict'
const path = require('path')
const table = require(path.resolve('config/database')).tables
const config = require(path.resolve('config/config'))
const Model = require(config.model_path + '/Model')

class Unit extends Model{
    constructor() {
        super()
        this.tablename = table.unit
        this.primaryKey = 'IdUnit'
    }
}

module.exports = Unit