'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))

const Controller = require(config.controller_path + '/Controller')
const brandModel = require(config.model_path + '/m_brand')
const brandRepo = require(config.repo_path + '/brand_repo')

class Brand extends Controller {
    constructor() {
        super()
        this.setModel(new brandModel())
    }

    async index(req, res) {
        try {
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            const r = new brandRepo()
            let m = await r.getAllBrand()
            
            res.send(this.response(true, m, null))
        }
        catch (err) {
            console.log(err)
            res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        }
    }

    async detail(req, res) {
        try {
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            const params = req.params
            const id = params.id

            const r = new brandRepo()
            let m = await r.getTipeByMerk(id)
            
            res.send(this.response(true, m, null))
        }
        catch (err) {
            console.log(err)
            res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        }
    }
}

module.exports = Brand