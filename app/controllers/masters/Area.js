'use strict'
const path = require('path')
const bcrypt = require('bcrypt')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))

const Controller = require(config.controller_path + '/Controller')
const areaModel = require(config.model_path + '/m_area')

class Area extends Controller {
    constructor() {
        super()
        this.setModel(new areaModel())
    }
}

module.exports = Area