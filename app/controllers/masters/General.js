'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const helper = require(path.resolve('app/utils/helper'))
const Controller = require(config.controller_path + '/Controller')

class General extends Controller {
    constructor() {
        super()
    }

    async getServerTime(req, res) {
        const date = helper.dateNow()
        const time = helper.timeNow()

        return res.send(this.response(true, { date, time }, null))
    }
}

module.exports = General