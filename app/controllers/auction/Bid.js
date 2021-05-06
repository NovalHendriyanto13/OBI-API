'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))

const Controller = require(config.controller_path + '/Controller')
const bidModel = require(config.model_path + '/m_bid')
const bidRepo = require(config.repo_path + '/bid_repo')
const auctionDetailRepo = require(config.repo_path + '/auction_detail_repo')

class Bid extends Controller {
    constructor() {
        super()
        this.setModel(new bidModel())
    }

    async index(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }

            const n = new bidRepo()
            
            let m = await n.getList(token.userid)
            
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

    async submitBid(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.create')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }

            var params = req.body
            const type = params.type
            const rNpl = new nplRepo()
            const rAuctionDetail = new auctionDetailRepo()
            
            const validNPL = await rNpl.getValidNpl(token.userid, params.npl, params.auction_id, type)
            if (validNPL === null) {
                throw new Error('Invalid NPL Number')
            }

            const auctionUnitInfo = await rAuctionDetail.auctionInfo(params.auction_id, params.unit_id)
            if (auctionUnitInfo === null) {
                throw new Error('Invalid Unit ID')
            }

            
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

module.exports = Bid