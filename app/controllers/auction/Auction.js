'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const helper = require(path.resolve('app/utils/helper'))

const Controller = require(config.controller_path + '/Controller')
const auctionModel = require(config.model_path + '/m_auction')
const auctionRepo = require(path.resolve('app/repositories/auction_repo'))

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
                res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            const date1 = helper.dateNow() + " " + helper.timeNow()
            const cDate1 = new Date(date1)
            const cDate2 = new Date(cDate1.getTime() + 7 * 24 * 60 * 60 * 1000)
            const date2 = helper.convertDate(cDate2) + " " + helper.convertTime(cDate2)

            let m = await this.auctionRepo.getAuction(date1, date2)
            
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

module.exports = Auction