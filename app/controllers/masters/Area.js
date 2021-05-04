'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const variable = require(path.resolve('app/utils/variable'))

const Controller = require(config.controller_path + '/Controller')
const areaModel = require(config.model_path + '/m_area')

class Area extends Controller {
    constructor() {
        super()
        this.setModel(new areaModel())
        this.redis= true
        this.redisKey= {
            index: variable.redisKey.AREA
        }
    }
}

module.exports = Area