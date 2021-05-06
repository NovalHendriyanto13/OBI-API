'use strict'
const { resolve } = require('path')
const path = require('path')
const util = require(path.resolve('app/utils/util'))
const redis = require(path.resolve('config/redis'))

class Controller {

    constructor() {
        this.redis = false
        this.redisKey= {
            index: '',
            detail: ''
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
            if (this.redis !== false) {
                let params = req.body
                const client = redis.redisClient()

                client.get(this.redisKey.index, async (err, cache) => {
                    if (err) throw err
                    if (cache !== null) {
                        const cacheData = JSON.parse(cache);
                        return res.send(this.response(true, cacheData, null))
                    }
                    else {
                        if (params !== null) {
                            m = await model.get(params)
                        }
                        else {
                            m = await model.getAll()
                        }
                        await util.redisSet(this.redisKey.index, m)

                        return res.send(this.response(true, m, null))
                    }
                })
            }
            else {
                m = await model.getAll()
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
        try {
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.detail')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            let params = req.params
            let id = params.id
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
                        m = await model.getId(id)
                        await util.redisSet(this.redisKey.detail + id, m)
                        return res.send(this.response(true, m, null))
                    }
                })
            }
            else {
                m = await model.getId(id)
            
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

    async update(req, res) {
        try{
            const token = util.authenticate(req, res)
            const model = this.getModel()
            const access = await util.permission(token, model.tablename + '.update')
            if (access === false) {
                return res.send(this.response(false, null, 'You are not authorized!'))
            }

            var params = req.body
            var id = req.params.id

            if (params === null || id === null) {
                throw new Error('Parameters is Required')
            }

            return res.send(this.response(true, 'Update Module is ready',null))
        }
        catch(err) {
            console.log(err)
            return res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        } 
    }

    async create(req, res) {
        return res.send(this.response(false, null, 'Create Module'))
    }

    response(status, data, message) {
        return {
            status: status,
            data: data,
            message: message
        }
    }

    setModel(model) {
        this.model = model
    }

    getModel() {
        return this.model
    }

}

module.exports = Controller