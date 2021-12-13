'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const variable = require(path.resolve('app/utils/variable'))
const helper = require(path.resolve('app/utils/helper'))
const redis = require(path.resolve('config/redis'))
const table = require(path.resolve('config/database')).tables

const Controller = require(config.controller_path + '/Controller')
const auctionDetailModel = require(config.model_path + '/m_auction_detail')
const auctionDetailRepo = require(config.repo_path + '/auction_detail_repo')
const bidRepo = require(config.repo_path + '/bid_repo')
const unitImageRepo = require(config.repo_path + '/unit_image_repo')

class AuctionDetail extends Controller {
    constructor() {
        super()
        this.setModel(new auctionDetailModel())
        this.auctionDetailRepo = new auctionDetailRepo()
        this.redis= false
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
            if (this.redis !== false && Object.keys(params).length == 0) {
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
                let where = []
                let sort = ''
                const sorts = {
                    'nolot': table.auction_detail + '.NoLot ASC',
                    'minprice': table.auction_detail + '.HargaLimit ASC',
                    'maxprice': table.auction_detail + '.HargaLimit DESC',
                }
                if (params.brand != '') {
                    where[table.unit + '.Merk = '] = params.brand
                }
                if (params.year != '' && params.year !='') {
                    where[table.unit + '.Tahun = '] = params.start_year
                }
                if (params.type != '') {
                    where[table.unit + '.Tipe like '] = `%${params.type}%`
                }
                if (params.color != '') {
                    where[table.unit + '.Warna like '] = `%${params.color}%`
                }
                if (params.transmission != '') {
                    where[table.unit + '.Transmisi = '] = params.transmission
                }
                if (params.start_year != '' && params.end_year != '') {
                    where[table.unit + '.Tahun >= '] = params.start_year
                    where[table.unit + '.Tahun <= '] = params.end_year
                }
                if (params.start_price != '' && params.end_price) {
                    where[table.auction_detail + '.HargaLimit >= '] = params.start_price
                    where[table.auction_detail + '.HargaLimit <= '] = params.end_price
                }
                sort = sorts[params.sort]
                m = await this.auctionDetailRepo.getAuctionUnit(where, sort)
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
            let sort = ''
            const sorts = {
                'nolot': table.auction_detail + '.NoLot ASC',
                'minprice': table.auction_detail + '.HargaLimit ASC',
                'maxprice': table.auction_detail + '.HargaLimit DESC',
            }
            if (paramsBody.brand != '') {
              where[table.unit + '.Merk = '] = paramsBody.brand
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
            if (paramsBody.start_year != '' && paramsBody.end_year != '') {
                where[table.unit + '.Tahun >= '] = paramsBody.start_year
                where[table.unit + '.Tahun <= '] = paramsBody.end_year
            }
            if (paramsBody.start_price != '' && paramsBody.end_price != '') {
                where[table.auction_detail + '.HargaLimit >= '] = paramsBody.start_price
                where[table.auction_detail + '.HargaLimit <= '] = paramsBody.end_price
            }
            sort = sorts[paramsBody.sort]

            let m = await this.auctionDetailRepo.getAuctionDetail(id, where, sort)
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

    async getLastLive(req, res) {
         try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            let params = req.params
            let id = params.id
            let response = {}
            const bidRepository = new bidRepo()
            const galleryRepo = new unitImageRepo()
            
            let m = await this.auctionDetailRepo.getLiveAuctionDetail(id)
            if (m.length > 0) {
                const dataUnit = m[0];
                const getLastBid = await bidRepository.maxBid(id, dataUnit['IdUnit'], dataUnit['NoLot'])
                
                let userId = null
                let price = dataUnit['HargaLimit'] > 0? helper.currencyFormat(dataUnit['HargaLimit']) : 0
                if (getLastBid.length > 0) {
                    price = getLastBid.Nominal > 0 ? helper.currencyFormat(getLastBid.Nominal) : 0
                    userId = getLastBid.UserID
                }
                const galleries = await galleryRepo.getList(dataUnit['IdUnit'])
                response = {
                    auction_id: dataUnit['IdAuctions'],
                    unit_id: dataUnit['IdUnit'],
                    price,
                    panggilan: dataUnit['Panggilan'],
                    new: 1,
                    unit: {
                        IdAuctions : dataUnit['IdAuctions'],
                        Online: dataUnit['Online'],
                        NoLot: dataUnit['NoLot'],
                        HargaLimit: helper.currencyFormat(dataUnit['HargaLimit']),
                        IdUnit: dataUnit['IdUnit'],
                        NoPolisi: dataUnit['NoPolisi'],
                        Merk: dataUnit['Merk'],
                        Tipe: dataUnit['Tipe'],
                        Tahun: dataUnit['Tahun'],
                        Transmisi: dataUnit['Transmisi'],
                        Warna: dataUnit['Warna'],
                        Kilometer: dataUnit['Kilometer'],
                        Jenis: dataUnit['Jenis'],
                        GradeMesin: dataUnit['GradeMesin'],
                        GradeInterior: dataUnit['GradeInterior'],
                        GradeExterior: dataUnit['GradeExterior'],
                        TglBerlakuSTNK: dataUnit['TglBerlakuSTNK'],
                        TglBerlakuPajak: dataUnit['TglBerlakuPajak'],
                        image: dataUnit['image']
                    },
                    user_id: userId,
                    close: false,
                    npl: null,
                    galleries,
                }
            }
            return res.send(this.response(true, response, null))            
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