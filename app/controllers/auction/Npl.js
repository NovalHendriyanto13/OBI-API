'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const helper = require(path.resolve('app/utils/helper'))

const Controller = require(config.controller_path + '/Controller')
const nplModel = require(config.model_path + '/m_npl')

class Npl extends Controller {
    constructor() {
        super()
        this.setModel(new nplModel())
    }

    async index(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            // let m = await this.auctionRepo.getAuction(date1, date2)
            
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

    async create(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.create')
            if (access === false) {
                res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            // let params = req.params
            
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
}

module.exports = Npl