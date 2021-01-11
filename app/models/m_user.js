'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))

const Model = require(config.model_path + '/Model')

class User extends Model {
    constructor() {
        super()
        this.tablename = 'ms_user'
    }
}

module.exports = User