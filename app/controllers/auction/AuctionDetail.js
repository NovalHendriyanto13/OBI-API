'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const variable = require(path.resolve('app/utils/variable'))
const redis = require(path.resolve('config/redis'))
const table = require(path.resolve('config/database')).tables

const Controller = require(config.controller_path + '/Controller')
const auctionDetailModel = require(config.model_path + '/m_auction_detail')
const auctionDetailRepo = require(config.repo_path + '/auction_detail_repo')

class AuctionDetail extends Controller {
    constructor() {
        super()
        this.setModel(new auctionDetailModel())
        this.auctionDetailRepo = new auctionDetailRepo()
        this.redis= true
        this.redisKey= {
            index: variable.redisKey.AUCTION_DETAIL_UNIT,
            detail: variable.redisKey.AUCTION_DETAIL,
        }
    }

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
            if (this.redis !== false) {
                const client = redis.redisClient()
                client.get(this.redisKey.index, async (err, cache) => {
                    if (err) throw err

                    if (cache !== null) {
                        const cacheData = JSON.parse(cache)
                        return res.send(this.response(true, cacheData, null))
                    }
                    else {
                        m = await this.auctionDetailRepo.getAuctionUnit(params)
                        
                        await util.redisSet(this.redisKey.index, m, (4*60*60))
                        return res.send(this.response(true, m, null))
                    }                    
                })
            }
            else {
                m = await this.auctionDetailRepo.getAuctionUnit(params)
                return res.send(this.response(true, m, null))
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

    async detail(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            let params = req.params
            let id = params.id
            let paramsBody = req.body
            let m

            if (this.redis !== false) {
                const client = redis.redisClient()
                client.get(this.redisKey.detail + id, async (err, cache) => {
                    if (err) throw err

                    if (cache !== null) {
                        const cacheData = JSON.parse(cache)
                        return res.send(this.response(true, cacheData, null))
                    }
                    else {
                        m = await this.auctionDetailRepo.getAuctionDetail(id, paramsBody)
                        await util.redisSet(this.redisKey.detail + id, m, (6*60*60))
                        return res.send(this.response(true, m, null))
                    }                    
                })
            }
            else {
                m = await this.auctionDetailRepo.getAuctionDetail(id, paramsBody)
                return res.send(this.response(true, m, null))
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

    async search(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            let params = req.params
            let id = params.id
            let paramsBody = req.body
            let where = []
            if (paramsBody.merk != '') {
              where[table.unit + '.Merk = '] = paramsBody.merk
            }
            if (paramsBody.type != '') {
                where[table.unit + '.Tipe like '] = `%${paramsBody.type}%`
            }
            if (paramsBody.color != '') {
                where[table.unit + '.Warna like '] = `%${paramsBody.color}%`
            }
            if (paramsBody.transmission != '') {
                where[table.unit + '.Transmisi = '] = paramsBody.transmission
            }
            if (paramsBody.start_year != '' && paramsBody.end_year) {
                where[table.unit + '.Tahun >= '] = paramsBody.start_year
                where[table.unit + '.Tahun <= '] = paramsBody.end_year
            }
            if (paramsBody.start_price != '' && paramsBody.end_price) {
                where[table.auction_detail + '.HargaLimit >= '] = paramsBody.start_price
                where[table.auction_detail + '.HargaLimit <= '] = paramsBody.end_price
            }
            let m = await this.auctionDetailRepo.getAuctionDetail(id, where, paramsBody.sort)
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

module.exports = AuctionDetail