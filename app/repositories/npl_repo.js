'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables
const nplModel = require(config.model_path + '/m_npl')

class NplRepo {
    constructor() {
        this.npl = new nplModel()
    }

}

module.exports = NplRepo