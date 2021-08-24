'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const variable = require(path.resolve('app/utils/variable'))
const redis = require(path.resolve('config/redis'))

const Controller = require(config.controller_path + '/Controller')
const unitModel = require(config.model_path + '/m_unit')
const documentImageModel = require(config.model_path + '/m_document_image')
const unitImageModel = require(config.model_path + '/m_unit_image')
const unitRepo = require(config.repo_path + '/unit_repo')

class Unit extends Controller {
    constructor() {
        super()
        this.setModel(new unitModel())
        this.redis= false
        this.redisKey= {
            index: variable.redisKey.UNIT_DETAIL,
            detail: variable.redisKey.UNIT_DETAIL,
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
            const r = new unitRepo()
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
                        m = await r.getDetail(id)

                        const dm = new documentImageModel()
                        let documentImages = await dm.select("CONCAT('" + config.images.document_unit +"', Dokumen) AS Image").get({"IdUnit" : id})
                        m[0]['documents'] = documentImages

                        const um = new unitImageModel()
                        let unitImages = await um.select("CONCAT('" + config.images.unit + "', Image) As Image").get({"IdUnit" : id})
                        m[0]['galleries'] = unitImages
                        
                        await util.redisSet(this.redisKey.detail + id, m)
                        return res.send(this.response(true, m, null))
                    }                    
                })
            }
            else {
                m = await r.getDetail(id)

                const dm = new documentImageModel()
                let documentImages = await dm.select("CONCAT('" + config.images.document_unit +"', Dokumen) AS Image").get({"IdUnit" : id})
                m[0].documents = documentImages

                const um = new unitImageModel()
                let unitImages = await um.select("CONCAT('" + config.images.unit + "', Image) As Image").get({"IdUnit" : id})
                m[0].galleries = unitImages
                
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

module.exports = Unit