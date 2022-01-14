'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))
const helper = require(path.resolve('app/utils/helper'))

const Controller = require(config.controller_path + '/Controller')
const auctionDetailRepo = require(config.repo_path + '/auction_detail_repo')

class Socket extends Controller {
    constructor() {
        super()
    }

    async index(req, res) {
        try{
            const access = util.staticToken(req, res)
            if (access === false) {
                res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            res.send(this.response(true, "Socket Controller", null))
        }
        catch(err) {
            console.log(err)
            res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        } 
    }

    async setBid(req, res) {
        const { data, auctionId } = req.body
        const rAuctionDetail = new auctionDetailRepo
        const m = await rAuctionDetail.getLiveAuctionDetail(auctionId)
        if (m.length > 0) {
            const socket = global.io;
            socket.emit(`setBid/${auctionId}`, { data: data } )
        }
        return res.send(this.response(true, req.body, null))
    }
}

module.exports = Socket