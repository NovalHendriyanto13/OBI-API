'use strict'
const path = require('path')
const bcrypt = require('bcrypt')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))

const Controller = require(config.controller_path + '/Controller')
const auctionDetailModel = require(config.model_path + '/m_auction_detail')

class AuctionDetail extends Controller {
    constructor() {
        super()
        this.setModel(new auctionDetailModel())
    }

    async detail(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            let params = req.params
            let id = params.id

            let m = await model.select()
                m = await m.getId(id)
            
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

module.exports = AuctionDetail