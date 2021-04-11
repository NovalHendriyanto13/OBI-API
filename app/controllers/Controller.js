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
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }

            let m
            let params = req.body
            
            if (params !== null) {
                m = await model.get(params)
            }
            else {
                m = await model.getAll()
            }

            return res.send(this.response(true, m, null))
        }
        catch(err) {
            console.log(err)
            return res.send(this.response(false, null, {
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
                return res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            let params = req.params
            let id = params.id
            let m = await model.getId(id)
            
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

    async update(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.update')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }

            var params = req.body
            var id = req.params.id

            if (params === null || id === null) {
                throw new Error('Parameters is Required')
            }

            return res.send(this.response(true, 'Update Module is ready',null))
        }
        catch(err) {
            console.log(err)
            return res.send(this.response(false, null, {
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