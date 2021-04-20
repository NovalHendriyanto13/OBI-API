'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const helper = require(path.resolve('app/utils/helper'))

const Controller = require(config.controller_path + '/Controller')
const auctionModel = require(config.model_path + '/m_auction')
const auctionRepo = require(config.repo_path + '/auction_repo')

class Auction extends Controller {
    constructor() {
        super()
        this.setModel(new auctionModel())
        this.auctionRepo = new auctionRepo()
    }

    async index(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            const date1 = helper.dateNow()
            let m = await this.auctionRepo.getAuction(date1)
            
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
}

module.exports = Auction