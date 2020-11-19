'use strict'
const path = require('path')
const bcrypt = require('bcrypt')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))

const Controller = require(config.controller_path + '/Controller')
const unitModel = require(config.model_path + '/m_unit')

class Unit extends Controller {
    constructor() {
        super()
        this.setModel(new unitModel())
    }

    async detail(req, res) {
        try {
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.detail')
            if (access === false) {
                res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            let params = req.params
            let id = params.id
            let q = "Select a.*, b.original_path, b.thumb_path From " + model.tablename +" AS a "
                q = q + "Left Join gallery AS b On a.id = b.table_id And b.tablename = '" + model.tablename+"' "
                q = q + "Where a.id = " + id
            let m = await model.raw(q)
            
            // let scanDir
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

module.exports = Unit