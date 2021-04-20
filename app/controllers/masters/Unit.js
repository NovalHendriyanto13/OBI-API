'use strict'
const path = require('path')
const bcrypt = require('bcrypt')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))

const Controller = require(config.controller_path + '/Controller')
const unitModel = require(config.model_path + '/m_unit')
const unitRepo = require(config.repo_path + '/unit_repo')

class Unit extends Controller {
    constructor() {
        super()
        this.setModel(new unitModel())
        this.unitRepo = new unitRepo()
    }

    async detail(req, res) {
        try {
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.detail')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            let params = req.params
            let id = params.id
            let m = await this.unitRepo.getDetail(id)
            
            return res.send(this.response(true, m, null))
        }
        catch (err) {
            console.log(err)
            return res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        }
    }
}

module.exports = Unit