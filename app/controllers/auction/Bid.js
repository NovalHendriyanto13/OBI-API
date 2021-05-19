'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))

const Controller = require(config.controller_path + '/Controller')
const Validation = require(path.resolve('app/library/Validation'))
const bidModel = require(config.model_path + '/m_bid')
const bidRepo = require(config.repo_path + '/bid_repo')
const nplRepo = require(config.repo_path + '/npl_repo')
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
            const rules = {
                npl: 'required',
                auction_id: 'required',
                unit_id: 'required',
                type: 'required',
                no_lot: 'required'
            }
            const validation = new Validation();
            let validate = validation.check(params, rules)
            
            if (validate.length > 0) {
                throw new Error(validate)
            }

            const type = params.type
            const rNpl = new nplRepo()
            const rAuctionDetail = new auctionDetailRepo()
            
            const validNPL = await rNpl.getValidNpl(token.userid, params.npl, params.auction_id, type)
            if (validNPL == null || validNPL.length <= 0) {
                throw new Error('Invalid NPL Number')
            }
            
            const auctionUnitInfo = await rAuctionDetail.auctionInfo(params.auction_id, params.unit_id, params.no_lot)
            if (auctionUnitInfo == null || auctionUnitInfo.length <= 0) {
                throw new Error('Invalid Unit ID or No Lot')
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

    async liveBid(req, res) {
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