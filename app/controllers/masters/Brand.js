'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const variable = require(path.resolve('app/utils/variable'))
const redis = require(path.resolve('config/redis'))

const Controller = require(config.controller_path + '/Controller')
const brandModel = require(config.model_path + '/m_brand')
const brandRepo = require(config.repo_path + '/brand_repo')

class Brand extends Controller {
    constructor() {
        super()
        this.setModel(new brandModel())
        this.redis= true
        this.redisKey= {
            index: variable.redisKey.BRAND,
            detail: variable.redisKey.BRAND_TYPE,
            type_list: variable.redisKey.BRAND_TYPE_LIST
        }
    }

    async index(req, res) {
        try {
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            const r = new brandRepo()
            let m

            if (this.redis !== false) {
                const client = redis.redisClient()
                
                client.get(this.redisKey.index, async (err, cache) => {
                    if (err) throw err
                    if (cache !== null) {
                        const cacheData = JSON.parse(cache)
                        return res.send(this.response(true, cacheData, null))
                    }
                    else {
                        m = await r.getAllBrand()

                        await util.redisSet(this.redisKey.index, m)

                        return res.send(this.response(true, m, null))
                    }
                })
            }
            else {
                m = await r.getAllBrand()
                return res.send(this.response(true, m, null))
            }
        }
        catch (err) {
            console.log(err)
            return res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        }
    }

    async detail(req, res) {
        try {
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            const params = req.params
            const id = params.id

            const r = new brandRepo()
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
                        m = await r.getTypeByMerk(id)

                        await util.redisSet(this.redisKey.detail + id, m)

                        return res.send(this.response(true, m, null))
                    }
                })
            }
            else {
                m = await r.getTypeByMerk(id)
                return res.send(this.response(true, m, null))
            }
        }
        catch (err) {
            console.log(err)
            return res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        }
    }

    async type(req, res) {
        try {
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.index')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            const params = req.params
            let m

            const r = new brandRepo()

            if (this.redis !== false) {
                const client = redis.redisClient()
                
                client.get(this.redisKey.type_list, async (err, cache) => {
                    if (err) throw err
                    if (cache !== null) {
                        const cacheData = JSON.parse(cache)
                        return res.send(this.response(true, cacheData, null))
                    }
                    else {
                        m = await r.getType()

                        await util.redisSet(this.redisKey.type_list, m)

                        return res.send(this.response(true, m, null))
                    }
                })
            }
            else {
                m = await r.getType()
                return res.send(this.response(true, m, null))
            }
        }
        catch (err) {
            console.log(err)
            return res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        }
    }
}

module.exports = Brand