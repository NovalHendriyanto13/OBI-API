'use strict'
const path = require('path')
const conn = require(path.resolve('config/database'))
const config = require(path.resolve('config/config'))
const Model = require(config.model_path + '/Model')

class Unit extends Model{
    constructor() {
        super()
        this.tablename = 'ms_unit'
    }
}

module.exports = Unit