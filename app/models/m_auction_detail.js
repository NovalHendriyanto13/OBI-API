'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const table = require(path.resolve('config/database')).tables

const Model = require(config.model_path + '/Model')

class AuctionDetail extends Model {
    constructor() {
        super()
        this.tablename = table.auction_detail
        this.primaryKey = 'IdAuctions'
    }
}

module.exports = AuctionDetail