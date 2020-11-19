'use strict'
const { resolve } = require('path')
const path = require('path')
const { model_path } = require('../../config/config')
const connectDB = require(path.resolve('config/database'))
const util = require(path.resolve('app/utils/util'))

class Controller {

    async index(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.detail')
            if (access === false) {
                res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            let m = await model.getAll()
            res.send(this.response(true, m, null))
        }
        catch(err) {
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
            const access = await util.permission(token, model.tablename + '.detail')
            if (access === false) {
                res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            let params = req.params
            let id = params.id
            let m = await model.getId(id)
            
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

    response(status, data, message) {
        return {
            status: status,
            data: data,
            message: message
        }
    }

    setModel(model) {
        this.model = model
    }

    getModel() {
        return this.model
    }

}

module.exports = Controller