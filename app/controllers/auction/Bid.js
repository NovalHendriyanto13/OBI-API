'use strict'
const path = require('path')
const dateformat = require('dateformat')
const datediff = require('date-diff')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const helper = require(path.resolve('app/utils/helper'))

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
                no_lot: 'required',
                bid_price: 'required'
            }
            const validation = new Validation();
            let validate = validation.check(params, rules)
            
            if (validate.length > 0) {
                throw new Error(validate)
            }

            const type = params.type
            const bidPrice = params.bid_price
            const rNpl = new nplRepo()
            const rAuctionDetail = new auctionDetailRepo()
            const rBid = new bidRepo()
            
            const validNPL = await rNpl.getValidNpl(token.userid, params.npl, params.auction_id, type)
            if (validNPL == null || validNPL.length <= 0) {
                throw new Error('Invalid NPL Number')
            }
            
            const auctionUnitInfo = await rAuctionDetail.auctionInfo(params.auction_id, params.unit_id, params.no_lot)
            if (auctionUnitInfo == null || auctionUnitInfo.length <= 0) {
                throw new Error('Invalid Unit ID or No Lot')
            }

            if (auctionUnitInfo[0].Online != 'tender') {
                throw new Error('Invalid Auction Type')
            }

            const priceLimit = auctionUnitInfo[0].HargaLimit
            const auctionDate = auctionUnitInfo[0].TglAuctions
            const auctionEndTime = auctionUnitInfo[0].EndTime

            const date1 = dateformat(helper.dateNow() + ' ' + helper.timeNow(), 'yyyy-mm-dd HH:MM:ss') 
            const date3 = dateformat(auctionDate + ' ' + auctionEndTime, 'yyyy-mm-dd HH:MM:ss')
            const dateAuction = new Date(date1)
            const endAuction = new Date(date3)
            const diffClose = new datediff(endAuction, dateAuction)
            
            if (diffClose.seconds() <= 0) {
                throw new Error('Auction sudah di tutup')
            }

            const maxBid = await rBid.maxBid(params.auction_id, params.unit_id, params.no_lot)
            let maxPrice = priceLimit
            if (maxBid != null && maxBid.length > 0) {
                maxPrice = maxBid[0].Nominal
            }

            const validBid = (bidPrice - maxPrice) % config.limit_bid[type]
            if (validBid != 0) {
                throw new Error('Nominal Bid Harus Kelipatan ' + config.limit_bid[type].toString())
            }

            if ((bidPrice < maxPrice)) {
                throw new Error('Nominal Bid Harus Lebih dari ' + maxPrice.toString())
            }

            const checkUpsert = await this.model.getOne({
                'IdAuctions': params.auction_id,
                'NoLOT': params.no_lot,
                'IdUnit': params.unit_id,
                'UserID': token.userid
            })

            if (checkUpsert != null && checkUpsert.length > 0) {
                await this.model.where({
                    'IdAuctions =': params.auction_id,
                    'NoLOT =': params.no_lot,
                    'IdUnit =': params.unit_id,
                    'UserID =': token.userid
                })
                .updateWhere({
                    'Nominal': bidPrice,
                    'BidTime': date1
                })
            }
            else {
                const nplCount = await rNpl.getRemaining(token.userid, params.auction_id)
                const nplRemaining = await rBid.getRemaining(token.userid, params.auction_id)

                if(nplRemaining.length < nplCount.length) {
                    await this.model.insert({
                        'IdAuctions': params.auction_id, 
                        'NoLOT': params.no_lot, 
                        'Nominal': params.bid_price, 
                        'BidTime': date1, 
                        'UserID': token.userid, 
                        'IdUnit': params.unit_id, 
                        'Online': 1, 
                        'statusbidx': 'berjalan',
                        'Operator': 0,
                        'nplx': ''
                    })
                }
                else {
                    throw new Error('Error! NPL anda sudah habis')
                }
            }

            return res.send(this.response(true, params, null))            
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
            const rBid = new bidRepo()
            
            const validNPL = await rNpl.getValidNpl(token.userid, params.npl, params.auction_id, type)
            if (validNPL == null || validNPL.length <= 0) {
                throw new Error('Invalid NPL Number')
            }
            
            const auctionUnitInfo = await rAuctionDetail.auctionInfo(params.auction_id, params.unit_id, params.no_lot)
            if (auctionUnitInfo == null || auctionUnitInfo.length <= 0) {
                throw new Error('Invalid Unit ID or No Lot')
            }

            if (auctionUnitInfo[0].Online == 'tender') {
                throw new Error('Invalid Auction Type')
            }

            const priceLimit = auctionUnitInfo[0].HargaLimit
            const auctionDate = auctionUnitInfo[0].TglAuctions
            const auctionEndTime = auctionUnitInfo[0].EndTime

            const date1 = dateformat(helper.dateNow() + ' ' + helper.timeNow(), 'yyyy-mm-dd HH:MM:ss') 
            const date3 = dateformat(auctionDate + ' ' + auctionEndTime, 'yyyy-mm-dd HH:MM:ss')
            const dateAuction = new Date(date1)
            const endAuction = new Date(date3)
            const diffClose = new datediff(endAuction, dateAuction)
            
            if (diffClose.seconds() <= 0) {
                throw new Error('Auction sudah di tutup')
            }

            const maxBid = await rBid.maxBid(params.auction_id, params.unit_id, params.no_lot)
            let maxPrice = priceLimit
            if (maxBid != null && maxBid.length > 0) {
                maxPrice = maxBid[0].Nominal
            }

            const bidPrice = maxPrice + config.limit_bid[type]
            
            const checkUpsert = await this.model.getOne({
                'IdAuctions': params.auction_id,
                'NoLOT': params.no_lot,
                'IdUnit': params.unit_id,
                'UserID': token.userid
            })

            if (checkUpsert != null && checkUpsert.length > 0) {
                await this.model.where({
                    'IdAuctions =': params.auction_id,
                    'NoLOT =': params.no_lot,
                    'IdUnit =': params.unit_id,
                    'UserID =': token.userid
                })
                .updateWhere({
                    'Nominal': bidPrice,
                    'BidTime': date1
                })
            }
            else {
                const nplCount = await rNpl.getRemaining(token.userid, params.auction_id)
                const nplRemaining = await rBid.getRemaining(token.userid, params.auction_id)

                if(nplRemaining.length < nplCount.length) {
                    await this.model.insert({
                        'IdAuctions': params.auction_id, 
                        'NoLOT': params.no_lot, 
                        'Nominal': params.bid_price, 
                        'BidTime': date1, 
                        'UserID': token.userid, 
                        'IdUnit': params.unit_id, 
                        'Online': 1, 
                        'statusbidx': 'berjalan',
                        'Operator': 0,
                        'nplx': ''
                    })
                }
                else {
                    throw new Error('Error! NPL anda sudah habis')
                }
            }

            return res.send(this.response(true, params, null))            
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