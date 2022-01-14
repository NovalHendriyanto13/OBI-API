'use strict'
const path = require('path')
const fs = require('fs')
const dateformat = require('dateformat')
const datediff = require('date-diff')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const helper = require(path.resolve('app/utils/helper'))
const table = require(path.resolve('config/database')).tables

const Controller = require(config.controller_path + '/Controller')
const Validation = require(path.resolve('app/library/Validation'))
const bidModel = require(config.model_path + '/m_bid')
const auctionDetailModel = require(config.model_path + '/m_auction_detail')
const bidRepo = require(config.repo_path + '/bid_repo')
const nplRepo = require(config.repo_path + '/npl_repo')
const auctionDetailRepo = require(config.repo_path + '/auction_detail_repo')
const unitImageRepo = require(config.repo_path + '/unit_image_repo')

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
            let promiseBid = []
            
            let m = await n.getList(token.userid)
            for (let i = 0, {length} = m; i < length; i += 1) {
                let dataBid = m[i]
                promiseBid.push(n.getWinnerBid(dataBid.IdAuctions, dataBid.IdUnit))
            }
            
            const execPromise = await Promise.all(promiseBid);
            execPromise.filter((value, index) => {
                if (value.length > 0) {
                 m[index].WinnerTime = value[0].BidTime;
                } else {
                  m[index].WinnerTime = "-";
                }
                return true;
            });
            
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
                        'Online': 'tender', 
                        'statusbidx': 'berjalan',
                        'Operator': 0,
                        'nplx': params.npl
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
            
            const close = auctionUnitInfo[0].Open
            const priceLimit = auctionUnitInfo[0].HargaLimit
            const auctionDate = auctionUnitInfo[0].TglAuctions
            const auctionEndTime = auctionUnitInfo[0].EndTime
            const online = auctionUnitInfo[0].Online
            const panggilan = auctionUnitInfo[0].Panggilan
            
            if (close == 2) {
                throw new Error('Unit sudah di tutup')
            }
            
            if (panggilan >= 2) {
                throw new Error('Anda sudah tidak bisa melakukan BID')
            }

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
            let firstBid = true
            if (maxBid != null && maxBid.length > 0) {
                if (maxBid[0].UserID == token.userid) {
                    throw new Error('Nominal Bid Anda masih yang tertinggi')
                }
                maxPrice = maxBid[0].Nominal
                firstBid = false
            }

            const bidPrice = firstBid ? priceLimit : maxPrice + config.limit_bid[type]

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
                
                if(nplCount.length > 0) {
                    await this.model.insert({
                        'IdAuctions': params.auction_id, 
                        'NoLOT': params.no_lot, 
                        'Nominal': bidPrice, 
                        'BidTime': date1, 
                        'UserID': token.userid, 
                        'IdUnit': params.unit_id, 
                        'Online': online, 
                        'statusbidx': 'berjalan',
                        'Operator': 0,
                        'nplx': ''
                    })
                    params.bid_price = bidPrice
                }
                else {
                    throw new Error('Error! NPL anda sudah habis')
                }
            }
            
            // update to auction unit
            const mAuctionDetail = new auctionDetailModel()
            await mAuctionDetail.where({
                'IdAuctions =': params.auction_id,
                'NoLOT =': params.no_lot,
                'IdUnit =': params.unit_id
            })
            .updateWhere({
                'Panggilan': 0,
                'Close': 1
            })

            const reqToMobile = {
                auctionId: params.auction_id,
                unitId: params.unit_id,
                price: bidPrice,
                panggilan: 0,
                isNew: 0,
                close: false,
                npl: params.npl,
                userId: token.userid
            }

            this.sendToMobile(reqToMobile)

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

    async lastBid(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.create')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }

            var params = req.body
            const rules = {
                auction_id: 'required',
                unit_id: 'required',
            }
            const validation = new Validation();
            let validate = validation.check(params, rules)
            
            if (validate.length > 0) {
                throw new Error(validate)
            }

            const rBid = new bidRepo()
            const getLast = await rBid.getLastBid(params.auction_id, params.unit_id)
            if (getLast) {
                return res.send(this.response(true, getLast, null))
            }

            return res.send(this.response(false, null, 'Can not get Last bid'))            
        }
        catch(err) {
            console.log(err)
            return res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        }
    }
    
    async lastUserBid(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.create')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }

            var params = req.body
            const rules = {
                auction_id: 'required',
                unit_id: 'required',
            }
            const validation = new Validation();
            let validate = validation.check(params, rules)
            
            if (validate.length > 0) {
                throw new Error(validate)
            }

            const rBid = new bidRepo()
            const getLast = await rBid.getLastUserBid(params.auction_id, params.unit_id, token.userid)
            if (getLast) {
                return res.send(this.response(true, getLast, null))
            }

            return res.send(this.response(false, null, 'Can not get Last bid'))            
        }
        catch(err) {
            console.log(err)
            return res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        }
    }
    
    async cancelBid(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.create')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }

            var params = req.body
            const rules = {
                auction_id: 'required',
                unit_id: 'required',
                no_lot: 'required',
            }
            const validation = new Validation();
            let validate = validation.check(params, rules)
            
            if (validate.length > 0) {
                throw new Error(validate)
            }

            const rBid = new bidRepo()
            const rAuctionDetail = new auctionDetailRepo()
            const getUnit = await rAuctionDetail.auctionDetail.getOne({
                IdAuctions: params.auction_id,
                IdUnit: params.unit_id,
                NoLot: params.no_lot,
            })
            if (getUnit.length > 0) {
                const status = getUnit[0]['Status']
                if (status != '2') {
                    const del = await this.model.where({
                        'IdAuctions =': params.auction_id,
                        'IdUnit =': params.unit_id,
                        'NoLOT =': params.no_lot,
                        'UserID =': token.userid
                    }).remove()
                    
                    return res.send(this.response(del, params, del ? 'Deleting Unit is success' : 'Deleting Unit is failed'))
                }
                else {
                    return res.send(this.response(false, null, 'Unit Has Been Sold'))
                }
            }

            return res.send(this.response(false, null, 'Can not delete bid'))     
        }
        catch(err) {
            console.log(err)
            return res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        }
    }

    async historyBid(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.create')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }

            var params = req.body
            const rules = {
                auction_id: 'required',
                unit_id: 'required',
                no_lot: 'required',
            }
            const validation = new Validation();
            let validate = validation.check(params, rules)
            
            if (validate.length > 0) {
                throw new Error(validate)
            }

            const rBid = new bidRepo()
            const get = await rBid.getBidByAuctionUnit(params.auction_id, params.unit_id, params.no_lot)
            if (get) {
                return res.send(this.response(true, get, null))
            }

            return res.send(this.response(false, null, 'Can not get History of bid'))
        }
        catch(err) {
            console.log(err)
            return res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        }
    }

    async sendToMobile(req) {
        
        const { auctionId, unitId, price, panggilan, isNew, close, npl, userId } = req
        const socket = global.io

        const rAuctionDetail = new auctionDetailRepo()
        const rUnitImage = new unitImageRepo()
        const paramsUnit = []
        paramsUnit[table.auction + '.IdAuctions ='] = auctionId
        paramsUnit[table.auction_detail + '.IdUnit ='] = unitId
        const unit = await rAuctionDetail.getAuctionUnit(paramsUnit)
        const galleries = await rUnitImage.getList(unitId)

        const priceFormated = helper.currencyFormat(price)

        let unitInfo = []
        if (unit.length > 0) {
            const limitPrice = unit[0]['HargaLimit']
            unit[0]['HargaLimit'] = helper.currencyFormat(limitPrice)
            unitInfo = unit[0]
        }
        const content = {
            auction_id: auctionId,
            unit_id: unitId,
            price: priceFormated,
            panggilan,
            new: isNew,
            unit: unitInfo,
            user_id: userId,
            close,
            npl,
            galleries: galleries
        };
        
        socket.emit(`setBid/${auctionId}`, { data: content } )
    }
}

module.exports = Bid