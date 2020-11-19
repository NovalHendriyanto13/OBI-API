'use strict'
const path = require('path')
const bcrypt = require('bcrypt')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))

const Controller = require(config.controller_path + '/Controller')
const consignorModel = require(config.model_path + '/m_consignor')

class Consignor extends Controller {
    constructor() {
        super()
        this.setModel(new consignorModel())
    }
}

module.exports = Consignor