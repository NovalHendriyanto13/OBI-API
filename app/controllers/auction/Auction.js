'use strict';
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const helper = require(path.resolve('app/utils/helper'))
const variable = require(path.resolve('app/utils/variable'))
const redis = require(path.resolve('config/redis'))

const Controller = require(config.controller_path + '/Controller')
const auctionModel = require(config.model_path + '/m_auction')
const auctionRepo = require(config.repo_path + '/auction_repo')

class Auction extends Controller {
    constructor() {
        super()
        this.setModel(new auctionModel())
        this.auctionRepo = new auctionRepo()
        this.redis= true
        this.redisKey= {
            index: variable.redisKey.AUCTION,
            nowNext: variable.redisKey.AUCTION_NOW_NEXT,
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
            const date = helper.dateNow()
            if (this.redis !== false) {
                const client = redis.redisClient()

                client.get(this.redisKey.index + date, async (err, cache) => {
                    if (err) throw err
                    if (cache !== null) {
                        const cacheData = JSON.parse(cache)
                        return res.send(this.response(true, cacheData, null))
                    }
                    else {
                        m = await this.auctionRepo.getAuction(date)
                        if (m.length > 0) {
                            await util.redisSet(this.redisKey.index + date, m)
                        }
                        
                        return res.send(this.response(true, m, null))
                    }
                })
            }
            else {
                m = await this.auctionRepo.getAuction(date)
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

    async nowNext(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            let m
            const date = helper.dateNow()
            let n = [{
                'now' : [],
                'next' : []
            }]

            if (this.redis !== false) {
                const client = redis.redisClient()
                client.get(this.redisKey.nowNext + date, async (err, cache) => {
                    if (err) throw err
                    if (cache !== null) {
                        const cacheData = JSON.parse(cache)
                        return res.send(this.response(true, cacheData, null))
                    }
                    else {
                        m = await this.auctionRepo.getAuction(date)

                        for (const i in m) {
                            if ((date) == m[i]['r_TglAuctions']) {
                                n[0]['now'].push(m[i])
                            }
                            else {
                                n[0]['next'].push(m[i])
                            }
                        }
                        
                        await util.redisSet(this.redisKey.nowNext + date, n)
                        return res.send(this.response(true, n, null))
                    }
                })
            }
            else {
                m = await this.auctionRepo.getAuction(date)

                for (const i in m) {
                    if ((date) == m[i]['r_TglAuctions']) {
                        n[0]['now'].push(m[i])
                    }
                    else {
                        n[0]['next'].push(m[i])
                    }
                }   
            
                return res.send(this.response(true, n, null))
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

module.exports = Auction