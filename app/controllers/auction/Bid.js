'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))

const Controller = require(config.controller_path + '/Controller')
const bidModel = require(config.model_path + '/m_bid')
const nplModel = require(config.model_path + '/m_npl')
// const bidRepo = require(config.repo_path + '/bid_repo')

class Bid extends Controller {
    constructor() {
        super()
        this.setModel(new bidModel())
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
            const mNpl = new nplModel()
            
            const validNPL = await mNpl.getOne({
                NPL: params.npl,
                IdAuctions: params.auction_id,
                Online: 1,
                Verifikasi: 1,
                Closed: 0,
                UserID: token.userid
            })

            if (validNPL === null) {
                throw new Error('Invalid NPL Number')
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